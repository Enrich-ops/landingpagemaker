import fs from "node:fs";
import path from "node:path";
import { config } from "./config";
import { clips, newId, projects } from "./store";
import { probeDuration, run } from "./ffmpeg";
import { transcribe } from "./transcribe";
import { selectClips } from "./selectClips";
import { audioCodec, overlayRender, renderClip } from "./render";
import { planVariants, validateCaption } from "./campaign";
import { tiktokPost } from "./publish/tiktok";
import { youtubePost } from "./publish/youtube";
import { tokens } from "./store";
import type { Clip, Platform, Project } from "./types";

export const projectDir = (id: string) => path.join(config.dataDir, "projects", id);
export const clipFile = (c: Clip) => path.join(projectDir(c.projectId), "clips", `${c.id}.mp4`);

const fail = (id: string, e: unknown) =>
  projects.update(id, { stage: "failed", error: e instanceof Error ? e.message : String(e) });

export async function downloadUrl(url: string, dir: string): Promise<string> {
  if (!/^https?:\/\//i.test(url)) throw new Error("URL must start with http(s)://");
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, "source.%(ext)s");
  await run("yt-dlp", [
    "-f", "bv*[height<=1080]+ba/b[height<=1080]/b", "--merge-output-format", "mp4",
    "--no-playlist", "-o", out, url,
  ]).catch((e) => {
    throw new Error(`Download failed (is yt-dlp installed?): ${e.message}`);
  });
  const f = fs.readdirSync(dir).find((n) => n.startsWith("source."));
  if (!f) throw new Error("Download produced no file");
  return path.join(dir, f);
}

export function createProject(p: Omit<Project, "id" | "createdAt" | "stage">): Project {
  const project: Project = { ...p, id: newId(), createdAt: new Date().toISOString(), stage: "queued" };
  projects.put(project);
  return project;
}

/** Runs the whole pipeline in the background; progress is visible via project.stage. */
export function startProject(id: string): void {
  void (async () => {
    try {
      const p = projects.get(id)!;
      const dir = projectDir(id);
      let source = p.sourceFile;
      if (!source && p.sourceUrl) {
        projects.update(id, { stage: "downloading" });
        source = await downloadUrl(p.sourceUrl, dir);
        projects.update(id, { sourceFile: source });
      }
      if (!source) throw new Error("No source video");
      const duration = await probeDuration(source);
      projects.update(id, { duration });

      if (p.mode === "overlay") {
        // Campaign mode: each variant is the WHOLE supplied edit (no selection, no cutting), differing only
        // in overlay hook, border colour and caption, so results can be compared per hook/caption.
        const variants = planVariants(p.variants ?? 3);
        for (const v of variants)
          clips.put({
            id: newId(), projectId: id, start: 0, end: duration, title: `${p.title} · ${v.hookText}`.slice(0, 100),
            hook: v.hookText, hookText: v.hookText, caption: v.caption, border: v.border,
            reason: "Provided campaign edit + overlay", score: 100, status: "pending", frame: "fill", captions: false, posts: {},
          });
        projects.update(id, { stage: "rendering" });
        for (const c of clips.forProject(id)) await renderOne(c.id);
      } else {
        projects.update(id, { stage: "transcribing" });
        const transcript = await transcribe(source, dir);
        projects.update(id, { stage: "selecting" });
        const picks = await selectClips(transcript);
        if (!picks.length) throw new Error("No suitable clips found in this video");
        for (const c of picks)
          clips.put({
            id: newId(), projectId: id, ...c, status: "pending", frame: p.frame, captions: p.captions, posts: {},
          });
        projects.update(id, { stage: "rendering" });
        for (const c of clips.forProject(id)) await renderOne(c.id);
        scheduleAutoPosts(id);
      }
      projects.update(id, { stage: "done" });
    } catch (e) {
      fail(id, e);
    }
  })();
}

export async function renderOne(clipId: string): Promise<void> {
  const c = clips.get(clipId)!;
  const p = projects.get(c.projectId)!;
  clips.update(clipId, { status: "rendering", error: undefined });
  try {
    const source = p.sourceFile!;
    const out = clipFile(c);
    if (p.mode === "overlay") {
      await overlayRender({
        source, out, hookText: c.hookText, borderColor: c.border, hookSeconds: Math.min(c.end, 4), audioCodec: await audioCodec(source),
      });
    } else {
      const transcript = JSON.parse(fs.readFileSync(path.join(projectDir(p.id), "transcript.json"), "utf8"));
      await renderClip({ source, out, start: c.start, end: c.end, frame: c.frame, captions: c.captions, transcript });
    }
    clips.update(clipId, { status: "ready", file: path.basename(out) });
  } catch (e) {
    clips.update(clipId, { status: "failed", error: e instanceof Error ? e.message : String(e) });
  }
}

export interface PublishOptions {
  platforms: Platform[];
  caption?: string;
  privacy: "public" | "private";
  tiktokMode: "direct" | "draft";
}

export function connected(platform: Platform) {
  return !!tokens.get(platform);
}

export async function publishClip(clipId: string, o: PublishOptions): Promise<void> {
  const c = clips.get(clipId);
  if (!c || c.status !== "ready") throw new Error("Clip is not rendered yet");
  const p = projects.get(c.projectId)!;
  const caption = (o.caption ?? c.caption ?? c.title).trim();
  if (p.mode === "overlay") {
    const problems = validateCaption(caption);
    if (problems.length) throw new Error(problems.join(" "));
  }
  for (const platform of o.platforms) {
    if (c.posts[platform]?.status === "posted") continue; // never double-post
    if (!connected(platform)) {
      clips.setPost(clipId, platform, { status: "failed", at: new Date().toISOString(), error: `${platform} is not connected` });
      continue;
    }
    clips.setPost(clipId, platform, { status: "posting", at: new Date().toISOString() });
    try {
      const file = clipFile(c);
      if (platform === "tiktok") {
        const r = await tiktokPost({ file, caption, mode: o.tiktokMode, privacy: o.privacy });
        clips.setPost(clipId, platform, { status: "posted", at: new Date().toISOString(), id: r.id, error: r.note });
      } else {
        const r = await youtubePost({ file, title: c.title, description: caption, privacy: o.privacy });
        clips.setPost(clipId, platform, { status: "posted", at: new Date().toISOString(), id: r.id, url: r.url });
      }
    } catch (e) {
      clips.setPost(clipId, platform, { status: "failed", at: new Date().toISOString(), error: e instanceof Error ? e.message : String(e) });
    }
  }
  clips.update(clipId, { caption });
}

/** Queue the best clips from a project, spaced out, for each platform the user enabled. */
export function scheduleAutoPosts(projectId: string): void {
  const p = projects.get(projectId);
  if (!p?.autoPost.length || p.mode !== "clip") return;
  const eligible = clips.forProject(projectId).filter((c) => c.status === "ready" && c.score >= config.autoPostMinScore);
  let when = Date.now();
  for (const c of eligible) {
    clips.update(c.id, { scheduledAt: new Date(when).toISOString(), scheduledPlatforms: p.autoPost });
    when += config.postIntervalMinutes * 60_000;
  }
}

let ticking = false;
/** Called every minute: publish anything whose scheduled time has arrived. */
export async function schedulerTick(): Promise<void> {
  if (ticking) return;
  ticking = true;
  try {
    for (const c of clips.all()) {
      if (!c.scheduledAt || !c.scheduledPlatforms?.length || Date.parse(c.scheduledAt) > Date.now()) continue;
      const platforms = c.scheduledPlatforms;
      clips.update(c.id, { scheduledAt: undefined, scheduledPlatforms: undefined }); // claim before awaiting
      await publishClip(c.id, {
        platforms, privacy: "public", tiktokMode: "direct",
      }).catch((e) => clips.update(c.id, { error: String(e.message ?? e) }));
    }
  } finally {
    ticking = false;
  }
}
