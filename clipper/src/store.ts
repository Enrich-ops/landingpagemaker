import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { config } from "./config";
import type { Clip, Platform, Project } from "./types";

interface Db {
  projects: Record<string, Project>;
  clips: Record<string, Clip>;
}

const dbFile = () => path.join(config.dataDir, "db.json");
const tokenFile = () => path.join(config.dataDir, "tokens.json");

let db: Db | null = null;

export const newId = () => randomBytes(6).toString("hex");

function load(): Db {
  if (db) return db;
  fs.mkdirSync(config.dataDir, { recursive: true });
  try {
    db = JSON.parse(fs.readFileSync(dbFile(), "utf8")) as Db;
  } catch {
    db = { projects: {}, clips: {} };
  }
  // A restart kills any in-flight work; surface it instead of showing a forever-spinner.
  for (const p of Object.values(db.projects)) {
    if (!["done", "failed"].includes(p.stage)) {
      p.stage = "failed";
      p.error = "Interrupted by a server restart. Re-upload to retry.";
    }
  }
  for (const c of Object.values(db.clips)) {
    if (c.status === "rendering") c.status = "failed";
    for (const post of Object.values(c.posts)) {
      if (post.status === "posting") {
        post.status = "failed";
        post.error = "Interrupted by a server restart; check the platform before retrying.";
      }
    }
  }
  return db;
}

function save() {
  const tmp = dbFile() + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, dbFile());
}

export const projects = {
  list: () => Object.values(load().projects).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  get: (id: string) => load().projects[id],
  put(p: Project) {
    load().projects[p.id] = p;
    save();
  },
  update(id: string, patch: Partial<Project>) {
    const p = load().projects[id];
    if (!p) return;
    Object.assign(p, patch);
    save();
  },
};

export const clips = {
  forProject: (projectId: string) =>
    Object.values(load().clips)
      .filter((c) => c.projectId === projectId)
      .sort((a, b) => b.score - a.score),
  all: () => Object.values(load().clips),
  get: (id: string) => load().clips[id],
  put(c: Clip) {
    load().clips[c.id] = c;
    save();
  },
  update(id: string, patch: Partial<Clip>) {
    const c = load().clips[id];
    if (!c) return;
    Object.assign(c, patch);
    save();
  },
  setPost(id: string, platform: Platform, post: Clip["posts"][Platform]) {
    const c = load().clips[id];
    if (!c) return;
    c.posts[platform] = post;
    save();
  },
};

// ---- OAuth tokens (kept separate from db.json, owner-read-only) ----
export interface StoredToken {
  accessToken: string;
  refreshToken?: string;
  /** epoch ms */
  expiresAt: number;
  account?: string;
  /** TikTok open_id etc. */
  extra?: Record<string, string>;
}
type Tokens = Partial<Record<Platform, StoredToken>>;

export const tokens = {
  all(): Tokens {
    try {
      return JSON.parse(fs.readFileSync(tokenFile(), "utf8"));
    } catch {
      return {};
    }
  },
  get(platform: Platform) {
    return this.all()[platform];
  },
  set(platform: Platform, t: StoredToken | undefined) {
    fs.mkdirSync(config.dataDir, { recursive: true });
    const all = this.all();
    if (t) all[platform] = t;
    else delete all[platform];
    fs.writeFileSync(tokenFile(), JSON.stringify(all, null, 2), { mode: 0o600 });
  },
};
