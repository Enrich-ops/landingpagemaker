import express, { type NextFunction, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { config } from "./config";
import { campaign } from "./campaign";
import { clips, newId, projects, tokens } from "./store";
import { clipFile, connected, createProject, projectDir, publishClip, renderOne, schedulerTick, startProject } from "./pipeline";
import { tiktokAuthUrl, tiktokExchange, tiktokStatus } from "./publish/tiktok";
import { youtubeAuthUrl, youtubeExchange } from "./publish/youtube";
import type { Platform } from "./types";

const app = express();
app.use(express.json());

// ---- optional HTTP basic auth (set APP_PASSWORD before exposing beyond localhost) ----
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!config.appPassword || req.path.startsWith("/auth/") && req.path.endsWith("/callback")) return next();
  const given = Buffer.from((req.headers.authorization ?? "").replace(/^Basic /, ""), "base64").toString().split(":").slice(1).join(":");
  const a = Buffer.from(given), b = Buffer.from(config.appPassword);
  if (a.length === b.length && timingSafeEqual(a, b)) return next();
  res.set("WWW-Authenticate", 'Basic realm="clipper"').status(401).send("Authentication required");
});

const wrap = (fn: (req: Request, res: Response) => Promise<unknown> | unknown) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res)).catch(next);

const view = (id: string) => {
  const p = projects.get(id)!;
  return { ...p, sourceFile: undefined, clips: clips.forProject(id).map((c) => ({ ...c, url: c.file ? `/media/${p.id}/${c.file}` : undefined })) };
};

app.get("/api/status", (_req, res) => {
  res.json({
    keys: { openai: !!config.openaiKey, anthropic: !!config.anthropicKey },
    tiktok: { configured: !!config.tiktok.clientKey, account: tokens.get("tiktok")?.account ?? null, connected: connected("tiktok") },
    youtube: { configured: !!config.google.clientId, account: tokens.get("youtube")?.account ?? null, connected: connected("youtube") },
    campaign,
  });
});

// ---- projects ----
app.get("/api/projects", (_req, res) => res.json(projects.list().map((p) => view(p.id))));
app.get("/api/projects/:id", (req, res) => (projects.get(req.params.id) ? res.json(view(req.params.id)) : res.sendStatus(404)));

const parseCommon = (q: Request["query"]) => ({
  mode: q.mode === "overlay" ? ("overlay" as const) : ("clip" as const),
  frame: q.frame === "fill" ? ("fill" as const) : ("blur" as const),
  captions: q.captions !== "0",
  variants: Math.max(1, Math.min(6, Number(q.variants) || 3)),
  autoPost: String(q.autoPost ?? "").split(",").filter((x): x is Platform => x === "tiktok" || x === "youtube"),
});

// Raw-body upload: PUT/POST the file bytes, name in ?name=. Streams to disk, so multi-GB videos are fine.
app.post("/api/projects/upload", wrap(async (req, res) => {
  const name = String(req.query.name ?? "video.mp4");
  const ext = path.extname(name).toLowerCase();
  if (![".mp4", ".mov", ".mkv", ".webm", ".m4v"].includes(ext)) return res.status(400).json({ error: "Unsupported file type" });
  const p = createProject({ title: path.basename(name, ext), ...parseCommon(req.query) });
  const dir = projectDir(p.id);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `source${ext}`);
  await pipeline(req, fs.createWriteStream(file));
  projects.update(p.id, { sourceFile: file });
  startProject(p.id);
  res.json(view(p.id));
}));

app.post("/api/projects/url", wrap(async (req, res) => {
  const url = String(req.body?.url ?? "");
  if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: "Provide an http(s) URL" });
  const p = createProject({ title: url, sourceUrl: url, ...parseCommon({ ...req.query, ...req.body }) });
  startProject(p.id);
  res.json(view(p.id));
}));

// ---- clips ----
app.patch("/api/clips/:id", wrap(async (req, res) => {
  const c = clips.get(req.params.id);
  if (!c) return res.sendStatus(404);
  const p = projects.get(c.projectId)!;
  const b = req.body ?? {};
  const patch: Record<string, unknown> = {};
  if (typeof b.title === "string") patch.title = b.title.slice(0, 100);
  if (typeof b.caption === "string") patch.caption = b.caption;
  if (typeof b.hookText === "string") patch.hookText = b.hookText.slice(0, 120);
  if (typeof b.border === "string" && /^#[0-9a-fA-F]{6}$/.test(b.border)) patch.border = b.border;
  if (p.mode === "clip") {
    // Trim only applies in clip mode; overlay mode must never alter the supplied edit's length.
    if (typeof b.start === "number" && typeof b.end === "number" && b.end - b.start >= 5 && b.start >= 0) Object.assign(patch, { start: b.start, end: b.end });
    if (b.frame === "fill" || b.frame === "blur") patch.frame = b.frame;
    if (typeof b.captions === "boolean") patch.captions = b.captions;
  }
  clips.update(c.id, patch);
  if (b.rerender) void renderOne(c.id);
  res.json(clips.get(c.id));
}));

app.post("/api/clips/:id/publish", wrap(async (req, res) => {
  const c = clips.get(req.params.id);
  if (!c) return res.sendStatus(404);
  const platforms = (req.body?.platforms ?? []).filter((x: string): x is Platform => x === "tiktok" || x === "youtube");
  if (!platforms.length) return res.status(400).json({ error: "Pick at least one platform" });
  const opts = {
    platforms,
    caption: typeof req.body.caption === "string" ? req.body.caption : undefined,
    privacy: req.body.privacy === "private" ? ("private" as const) : ("public" as const),
    tiktokMode: req.body.tiktokMode === "draft" ? ("draft" as const) : ("direct" as const),
  };
  try {
    await publishClip(c.id, opts);
  } catch (e) {
    return res.status(400).json({ error: (e as Error).message });
  }
  res.json(clips.get(c.id));
}));

app.post("/api/clips/:id/schedule", wrap(async (req, res) => {
  const c = clips.get(req.params.id);
  if (!c) return res.sendStatus(404);
  const at = Date.parse(req.body?.at);
  if (!Number.isFinite(at)) return res.status(400).json({ error: "Invalid time" });
  const platforms = (req.body?.platforms ?? []).filter((x: string) => x === "tiktok" || x === "youtube");
  clips.update(c.id, { scheduledAt: new Date(at).toISOString(), scheduledPlatforms: platforms });
  res.json(clips.get(c.id));
}));

app.get("/api/posts/tiktok/:publishId", wrap(async (req, res) => res.json(await tiktokStatus(req.params.publishId))));

// ---- media (supports Range, so <video> can seek) ----
app.get("/media/:project/:file", (req, res) => {
  const p = projects.get(req.params.project);
  const file = path.basename(req.params.file);
  if (!p) return res.sendStatus(404);
  const full = path.join(projectDir(p.id), "clips", file);
  fs.existsSync(full) ? res.sendFile(full) : res.sendStatus(404);
});

// ---- OAuth ----
const states = new Map<string, number>();
const newState = () => {
  const s = randomBytes(16).toString("hex");
  states.set(s, Date.now() + 10 * 60_000);
  return s;
};
const checkState = (s: unknown) => {
  const exp = states.get(String(s));
  states.delete(String(s));
  return !!exp && exp > Date.now();
};

app.get("/auth/tiktok", (_req, res) => (config.tiktok.clientKey ? res.redirect(tiktokAuthUrl(newState())) : res.status(400).send("TIKTOK_CLIENT_KEY is not set")));
app.get("/auth/youtube", (_req, res) => (config.google.clientId ? res.redirect(youtubeAuthUrl(newState())) : res.status(400).send("GOOGLE_CLIENT_ID is not set")));
for (const [name, exchange] of [["tiktok", tiktokExchange], ["youtube", youtubeExchange]] as const) {
  app.get(`/auth/${name}/callback`, wrap(async (req, res) => {
    if (!checkState(req.query.state)) return res.status(400).send("Invalid or expired state; start the connection again.");
    if (req.query.error) return res.status(400).send(`${name} denied access: ${req.query.error_description ?? req.query.error}`);
    await exchange(String(req.query.code));
    res.redirect("/");
  }));
}
app.post("/auth/:platform/disconnect", (req, res) => {
  if (req.params.platform === "tiktok" || req.params.platform === "youtube") tokens.set(req.params.platform, undefined);
  res.json({ ok: true });
});

app.use(express.static(path.resolve("public")));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

if (process.env.NODE_ENV !== "test") {
  // Local-only by default: this app holds OAuth tokens for your accounts.
  const host = config.appPassword ? "0.0.0.0" : "127.0.0.1";
  app.listen(config.port, host, () => console.log(`Clipper running at ${config.publicUrl} (listening on ${host})`));
  setInterval(() => void schedulerTick(), 60_000);
}

export { app, newId, clipFile };
