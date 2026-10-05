import fs from "node:fs";
import { config } from "../config";
import { tokens, type StoredToken } from "../store";

const API = "https://open.tiktokapis.com";
export const TIKTOK_SCOPES = "user.info.basic,video.upload,video.publish";

export const tiktokAuthUrl = (state: string) =>
  "https://www.tiktok.com/v2/auth/authorize/?" +
  new URLSearchParams({
    client_key: config.tiktok.clientKey,
    scope: TIKTOK_SCOPES,
    response_type: "code",
    redirect_uri: `${config.publicUrl}/auth/tiktok/callback`,
    state,
  });

async function tokenRequest(params: Record<string, string>): Promise<StoredToken> {
  const res = await fetch(`${API}/v2/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: config.tiktok.clientKey,
      client_secret: config.tiktok.clientSecret,
      ...params,
    }),
  });
  const j = (await res.json()) as Record<string, any>;
  if (!res.ok || j.error) throw new Error(`TikTok auth failed: ${j.error_description ?? j.error ?? res.status}`);
  return {
    accessToken: j.access_token,
    refreshToken: j.refresh_token,
    expiresAt: Date.now() + j.expires_in * 1000,
    extra: { openId: j.open_id },
  };
}

export async function tiktokExchange(code: string) {
  const t = await tokenRequest({
    code,
    grant_type: "authorization_code",
    redirect_uri: `${config.publicUrl}/auth/tiktok/callback`,
  });
  try {
    const r = await fetch(`${API}/v2/user/info/?fields=display_name`, {
      headers: { Authorization: `Bearer ${t.accessToken}` },
    });
    t.account = ((await r.json()) as any).data?.user?.display_name;
  } catch {
    /* cosmetic only */
  }
  tokens.set("tiktok", t);
}

async function accessToken(): Promise<string> {
  const t = tokens.get("tiktok");
  if (!t) throw new Error("TikTok is not connected");
  if (t.expiresAt - 60_000 > Date.now()) return t.accessToken;
  if (!t.refreshToken) throw new Error("TikTok session expired; reconnect");
  const fresh = await tokenRequest({ grant_type: "refresh_token", refresh_token: t.refreshToken });
  fresh.account = t.account;
  tokens.set("tiktok", fresh);
  return fresh.accessToken;
}

async function call(pathname: string, token: string, body?: unknown) {
  const res = await fetch(API + pathname, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = (await res.json()) as { data?: any; error?: { code: string; message: string } };
  if (j.error && j.error.code !== "ok") throw new Error(`TikTok ${pathname}: ${j.error.code} ${j.error.message}`);
  return j.data;
}

const MB = 1024 * 1024;
/** TikTok chunk rules: <=64MB can go in one piece; otherwise chunks of 5-64MB, last chunk absorbs the remainder (<=128MB). */
export function planChunks(size: number, chunk = 32 * MB): { chunkSize: number; total: number } {
  if (size <= 64 * MB) return { chunkSize: size, total: 1 };
  return { chunkSize: chunk, total: Math.floor(size / chunk) };
}

/** Privacy levels in order of preference for a public post. */
export function pickPrivacy(options: string[], want: "public" | "private"): string {
  if (want === "public" && options.includes("PUBLIC_TO_EVERYONE")) return "PUBLIC_TO_EVERYONE";
  if (options.includes("SELF_ONLY")) return "SELF_ONLY";
  if (!options.length) throw new Error("TikTok returned no privacy options for this account");
  return options[0];
}

export interface TikTokPostOpts {
  file: string;
  caption: string;
  /** "direct" publishes immediately; "draft" drops it in the app inbox so you can add a TikTok Shop product + finish there. */
  mode: "direct" | "draft";
  privacy: "public" | "private";
}

export async function tiktokPost(o: TikTokPostOpts): Promise<{ id: string; note?: string }> {
  const token = await accessToken();
  const size = fs.statSync(o.file).size;
  const { chunkSize, total } = planChunks(size);
  const source_info = { source: "FILE_UPLOAD", video_size: size, chunk_size: chunkSize, total_chunk_count: total };

  let init: { publish_id: string; upload_url: string };
  let note: string | undefined;
  if (o.mode === "draft") {
    init = await call("/v2/post/publish/inbox/video/init/", token, { source_info });
    note = "Uploaded to your TikTok inbox. Open the TikTok app to add the TikTok Shop product, caption and post.";
  } else {
    const info = await call("/v2/post/publish/creator_info/query/", token);
    init = await call("/v2/post/publish/video/init/", token, {
      post_info: {
        title: o.caption.slice(0, 2200),
        privacy_level: pickPrivacy(info.privacy_level_options ?? [], o.privacy),
        // Campaign rule: likes/comments must stay on.
        disable_comment: false,
        disable_duet: false,
        disable_stitch: false,
      },
      source_info,
    });
  }

  const fd = fs.openSync(o.file, "r");
  try {
    for (let i = 0; i < total; i++) {
      const start = i * chunkSize;
      const end = i === total - 1 ? size - 1 : start + chunkSize - 1;
      const buf = Buffer.alloc(end - start + 1);
      fs.readSync(fd, buf, 0, buf.length, start);
      const res = await fetch(init.upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": String(buf.length),
          "Content-Range": `bytes ${start}-${end}/${size}`,
        },
        body: buf,
      });
      if (!res.ok && res.status !== 206) throw new Error(`TikTok chunk ${i + 1}/${total} failed (${res.status})`);
    }
  } finally {
    fs.closeSync(fd);
  }
  return { id: init.publish_id, note };
}

export async function tiktokStatus(publishId: string): Promise<{ status: string; failReason?: string }> {
  const d = await call("/v2/post/publish/status/fetch/", await accessToken(), { publish_id: publishId });
  return { status: d.status, failReason: d.fail_reason };
}
