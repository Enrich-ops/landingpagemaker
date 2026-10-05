import fs from "node:fs";
import { config } from "../config";
import { tokens, type StoredToken } from "../store";

export const youtubeAuthUrl = (state: string) =>
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: `${config.publicUrl}/auth/youtube/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
    access_type: "offline",
    prompt: "consent", // forces a refresh_token every time
    state,
  });

async function tokenRequest(params: Record<string, string>) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      ...params,
    }),
  });
  const j = (await res.json()) as Record<string, any>;
  if (!res.ok) throw new Error(`Google auth failed: ${j.error_description ?? j.error}`);
  return j;
}

export async function youtubeExchange(code: string) {
  const j = await tokenRequest({
    code,
    grant_type: "authorization_code",
    redirect_uri: `${config.publicUrl}/auth/youtube/callback`,
  });
  const t: StoredToken = {
    accessToken: j.access_token,
    refreshToken: j.refresh_token,
    expiresAt: Date.now() + j.expires_in * 1000,
  };
  const r = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
    headers: { Authorization: `Bearer ${t.accessToken}` },
  });
  const channel = ((await r.json()) as any).items?.[0];
  if (config.google.channelId && channel?.id !== config.google.channelId)
    throw new Error(
      `Signed in to channel ${channel?.id ?? "(none found)"}, but only ${config.google.channelId} is allowed. ` +
        `Pick the right channel on Google's consent screen and try again.`,
    );
  t.account = channel?.snippet?.title;
  tokens.set("youtube", t);
}

async function accessToken(): Promise<string> {
  const t = tokens.get("youtube");
  if (!t) throw new Error("YouTube is not connected");
  if (t.expiresAt - 60_000 > Date.now()) return t.accessToken;
  if (!t.refreshToken) throw new Error("YouTube session expired; reconnect");
  const j = await tokenRequest({ grant_type: "refresh_token", refresh_token: t.refreshToken });
  tokens.set("youtube", { ...t, accessToken: j.access_token, expiresAt: Date.now() + j.expires_in * 1000 });
  return j.access_token;
}

/** Shorts = vertical video <= 3 min; the #Shorts tag in title/description makes classification explicit. */
export function shortsMetadata(title: string, description: string) {
  const t = title.length > 92 ? title.slice(0, 91) + "…" : title;
  const hasTag = /#shorts/i.test(title + description);
  return { title: hasTag ? t : `${t} #Shorts`, description: hasTag ? description : `${description}\n\n#Shorts`.trim() };
}

export async function youtubePost(o: {
  file: string;
  title: string;
  description: string;
  privacy: "public" | "private" | "unlisted";
  shorts?: boolean;
}): Promise<{ id: string; url: string }> {
  const token = await accessToken();
  const size = fs.statSync(o.file).size;
  const meta = o.shorts === false ? { title: o.title, description: o.description } : shortsMetadata(o.title, o.description);
  const init = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": String(size),
        "X-Upload-Content-Type": "video/mp4",
      },
      body: JSON.stringify({
        snippet: { ...meta, categoryId: "22" },
        status: { privacyStatus: o.privacy, selfDeclaredMadeForKids: false },
      }),
    },
  );
  if (!init.ok) throw new Error(`YouTube init failed (${init.status}): ${(await init.text()).slice(0, 300)}`);
  const location = init.headers.get("location");
  if (!location) throw new Error("YouTube did not return an upload URL");

  const up = await fetch(location, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4", "Content-Length": String(size) },
    body: fs.readFileSync(o.file),
  });
  if (!up.ok) throw new Error(`YouTube upload failed (${up.status}): ${(await up.text()).slice(0, 300)}`);
  const id = ((await up.json()) as { id: string }).id;
  return { id, url: `https://youtube.com/shorts/${id}` };
}
