import fs from "node:fs";
import path from "node:path";
import { config } from "./config";
import { run, probeDuration } from "./ffmpeg";
import type { Segment, Transcript, Word } from "./types";

const CHUNK_SECONDS = 600; // 10 min of 48kbps mono mp3 is ~3.6MB, far under Whisper's 25MB cap

interface WhisperResponse {
  language?: string;
  segments?: { text: string; start: number; end: number }[];
  words?: { word: string; start: number; end: number }[];
}

/** Shift chunk-local timestamps onto the full-video timeline and merge. */
export function mergeChunks(chunks: { offset: number; res: WhisperResponse }[], duration: number): Transcript {
  const segments: Segment[] = [];
  const words: Word[] = [];
  let language = "en";
  for (const { offset, res } of chunks) {
    language = res.language ?? language;
    for (const s of res.segments ?? [])
      segments.push({ text: s.text.trim(), start: s.start + offset, end: s.end + offset });
    for (const w of res.words ?? [])
      words.push({ text: w.word.trim(), start: w.start + offset, end: w.end + offset });
  }
  return { language, duration, segments, words: words.filter((w) => w.text) };
}

async function whisper(file: string): Promise<WhisperResponse> {
  const form = new FormData();
  form.set("file", new Blob([fs.readFileSync(file)], { type: "audio/mpeg" }), path.basename(file));
  form.set("model", "whisper-1");
  form.set("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "word");
  form.append("timestamp_granularities[]", "segment");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.openaiKey}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Whisper failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  return (await res.json()) as WhisperResponse;
}

export async function transcribe(videoFile: string, workDir: string): Promise<Transcript> {
  if (!config.openaiKey) throw new Error("OPENAI_API_KEY is not set (needed for transcription)");
  const cache = path.join(workDir, "transcript.json");
  if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, "utf8"));

  const audioDir = path.join(workDir, "audio");
  fs.mkdirSync(audioDir, { recursive: true });
  await run("ffmpeg", [
    "-y", "-i", videoFile, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "48k",
    "-f", "segment", "-segment_time", String(CHUNK_SECONDS), "-reset_timestamps", "1",
    path.join(audioDir, "chunk_%04d.mp3"),
  ]);
  const files = fs.readdirSync(audioDir).filter((f) => f.endsWith(".mp3")).sort();
  const chunks: { offset: number; res: WhisperResponse }[] = [];
  for (const [i, f] of files.entries()) {
    chunks.push({ offset: i * CHUNK_SECONDS, res: await whisper(path.join(audioDir, f)) });
  }
  const transcript = mergeChunks(chunks, await probeDuration(videoFile));
  fs.writeFileSync(cache, JSON.stringify(transcript));
  fs.rmSync(audioDir, { recursive: true, force: true });
  return transcript;
}
