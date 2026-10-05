import { config } from "./config";
import type { Transcript, Word } from "./types";

export interface ClipCandidate {
  start: number;
  end: number;
  title: string;
  hook: string;
  reason: string;
  score: number;
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function transcriptForPrompt(t: Transcript): string {
  return t.segments.map((s) => `[${s.start.toFixed(1)}] ${s.text}`).join("\n");
}

function buildPrompt(t: Transcript, count: number, min: number, max: number) {
  return `You are a short-form video editor who makes clips go viral on TikTok and YouTube Shorts.

Below is a timestamped transcript (seconds from start) of a ${mmss(t.duration)} video. Pick the ${count} best moments to cut into standalone vertical clips.

What makes a great clip:
- It opens with a hook in the first 3 seconds: a bold claim, a question, a surprising fact, or an emotional line. No throat-clearing.
- It is self-contained: a viewer with zero context understands it, and it ends on a payoff or a cliffhanger, never mid-thought.
- It has one idea, a story beat, a strong opinion, a surprising stat, or a laugh.
- Length is between ${min} and ${max} seconds. Prefer the shorter end unless the story needs the room.
- Clips must not overlap.

Respond with ONLY a JSON object, no prose:
{"clips":[{"start":<seconds>,"end":<seconds>,"title":"<max 80 chars, punchy, no hashtags>","hook":"<the opening line, verbatim>","reason":"<one sentence on why it works>","score":<0-100 virality estimate>}]}

Use start/end times that fall on sentence boundaries from the transcript.

TRANSCRIPT:
${transcriptForPrompt(t)}`;
}

export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Model returned no JSON");
  return JSON.parse(text.slice(start, end + 1));
}

/** Snap a time to the nearest word edge so cuts never land mid-word. */
function snap(time: number, words: Word[], edge: "start" | "end"): number {
  if (!words.length) return time;
  let best = words[0][edge];
  for (const w of words) if (Math.abs(w[edge] - time) < Math.abs(best - time)) best = w[edge];
  return best;
}

/** Validate model output: clamp, snap to words, enforce length limits, drop overlaps, rank. */
export function normalizeClips(
  raw: unknown,
  t: Transcript,
  opts: { min: number; max: number; count: number },
): ClipCandidate[] {
  const list = (raw as { clips?: unknown[] })?.clips;
  if (!Array.isArray(list)) throw new Error("Model response has no clips array");
  const out: ClipCandidate[] = [];
  for (const item of list) {
    const c = item as Partial<ClipCandidate>;
    if (typeof c.start !== "number" || typeof c.end !== "number") continue;
    const start = Math.max(0, snap(c.start, t.words, "start"));
    // Small tail pad so the last word isn't clipped.
    const end = Math.min(t.duration, snap(c.end, t.words, "end") + 0.3);
    const len = end - start;
    if (len < opts.min * 0.6 || len > opts.max * 1.25) continue;
    out.push({
      start,
      end,
      title: String(c.title ?? "Untitled clip").slice(0, 100),
      hook: String(c.hook ?? ""),
      reason: String(c.reason ?? ""),
      score: Math.max(0, Math.min(100, Number(c.score) || 0)),
    });
  }
  out.sort((a, b) => b.score - a.score);
  const kept: ClipCandidate[] = [];
  for (const c of out) {
    if (kept.every((k) => c.end <= k.start || c.start >= k.end)) kept.push(c);
    if (kept.length >= opts.count) break;
  }
  return kept;
}

export async function selectClips(t: Transcript): Promise<ClipCandidate[]> {
  if (!config.anthropicKey) throw new Error("ANTHROPIC_API_KEY is not set (needed to pick clips)");
  if (!t.words.length) throw new Error("Transcript is empty; the video has no detectable speech");
  const opts = { min: config.clipMin, max: config.clipMax, count: config.clipsPerVideo };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": config.anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: config.clipModel,
      max_tokens: 4096,
      messages: [{ role: "user", content: buildPrompt(t, opts.count, opts.min, opts.max) }],
    }),
  });
  if (!res.ok) throw new Error(`Claude request failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const body = (await res.json()) as { content: { type: string; text?: string }[] };
  const text = body.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return normalizeClips(extractJson(text), t, opts);
}
