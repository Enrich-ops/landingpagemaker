import path from "node:path";

try {
  process.loadEnvFile(path.resolve(".env"));
} catch {
  /* no .env file; rely on the real environment */
}

const num = (key: string, fallback: number) => {
  const v = Number(process.env[key]);
  return Number.isFinite(v) && process.env[key] ? v : fallback;
};

export const config = {
  port: num("PORT", 3000),
  publicUrl: (process.env.PUBLIC_URL ?? `http://localhost:${num("PORT", 3000)}`).replace(/\/$/, ""),
  appPassword: process.env.APP_PASSWORD ?? "",
  dataDir: path.resolve(process.env.DATA_DIR ?? "data"),
  openaiKey: process.env.OPENAI_API_KEY ?? "",
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? "",
  clipModel: process.env.CLIP_MODEL ?? "claude-sonnet-5-5",
  clipMin: num("CLIP_MIN_SECONDS", 20),
  clipMax: num("CLIP_MAX_SECONDS", 60),
  clipsPerVideo: num("CLIPS_PER_VIDEO", 8),
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY ?? "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? "",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    /** If set, only this channel may be connected (guards against posting to the wrong account). */
    channelId: process.env.YOUTUBE_CHANNEL_ID ?? "",
  },
  autoPostMinScore: num("AUTO_POST_MIN_SCORE", 80),
  postIntervalMinutes: num("POST_INTERVAL_MINUTES", 180),
};

export type Config = typeof config;
