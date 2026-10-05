import fs from "node:fs";
import path from "node:path";
import { run } from "./ffmpeg";
import { buildAss } from "./captions";
import type { FrameMode, Transcript } from "./types";

const W = 1080;
const H = 1920;

/** ffmpeg filter graph that turns any-aspect input into 1080x1920. */
export function videoFilter(frame: FrameMode, assPath?: string): string {
  const fill = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`;
  let graph =
    frame === "blur"
      ? // Sharp full-width video over a blurred, zoomed copy of itself (keeps 16:9 content uncropped).
        `[0:v]split[a][b];[a]${fill},boxblur=30:5[bg];[b]scale=${W}:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1`
      : `[0:v]${fill},setsar=1`;
  if (assPath) {
    // Escape for the filter parser: backslash, colon, quote.
    const p = assPath.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");
    graph += `,ass='${p}'`;
  }
  return graph + "[v]";
}

export async function renderClip(opts: {
  source: string;
  out: string;
  start: number;
  end: number;
  frame: FrameMode;
  captions: boolean;
  transcript: Transcript;
}): Promise<void> {
  fs.mkdirSync(path.dirname(opts.out), { recursive: true });
  let assPath: string | undefined;
  if (opts.captions && opts.transcript.words.length) {
    assPath = opts.out.replace(/\.mp4$/, ".ass");
    fs.writeFileSync(assPath, buildAss(opts.transcript.words, opts.start, opts.end));
  }
  await run("ffmpeg", [
    "-y",
    "-ss", opts.start.toFixed(3),
    "-to", opts.end.toFixed(3),
    "-i", opts.source,
    "-filter_complex", videoFilter(opts.frame, assPath),
    "-map", "[v]", "-map", "0:a:0?",
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30",
    "-c:a", "aac", "-b:a", "160k", "-ar", "44100",
    "-movflags", "+faststart",
    opts.out,
  ]);
  if (assPath) fs.rmSync(assPath, { force: true });
}

const esc = (p: string) => p.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");

function hookAss(text: string, seconds: number): string {
  const clean = text.replace(/[{}\\]/g, "").replace(/\n/g, " ");
  const end = (s: number) =>
    `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${(s % 60).toFixed(2).padStart(5, "0")}`;
  return `[Script Info]
ScriptType: v4.00+
PlayResX: ${W}
PlayResY: ${H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Hook,DejaVu Sans,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,6,2,8,70,70,170,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,${end(seconds)},Hook,,0,0,0,,${clean}
`;
}

/**
 * Campaign "overlay" render. The supplied edit is NOT trimmed, cropped, recoloured or
 * remixed, and its audio is passed through untouched (stream copy when already AAC).
 * We only place it, uncropped, on a 1080x1920 canvas with a border and an optional hook.
 */
export async function overlayRender(opts: {
  source: string;
  out: string;
  hookText?: string;
  hookSeconds: number;
  borderColor?: string;
  audioCodec: string;
}): Promise<void> {
  fs.mkdirSync(path.dirname(opts.out), { recursive: true });
  const color = (opts.borderColor ?? "0x111111").replace("#", "0x");
  let graph = `color=c=${color}:s=${W}x${H}[bg];[0:v]scale=${W - 48}:-2,setsar=1[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2:shortest=1`;
  let assPath: string | undefined;
  if (opts.hookText?.trim()) {
    assPath = opts.out.replace(/\.mp4$/, ".hook.ass");
    fs.writeFileSync(assPath, hookAss(opts.hookText, opts.hookSeconds));
    graph += `,ass='${esc(assPath)}'`;
  }
  graph += "[v]";
  await run("ffmpeg", [
    "-y", "-i", opts.source,
    "-filter_complex", graph,
    "-map", "[v]", "-map", "0:a:0?",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
    ...(opts.audioCodec === "aac" ? ["-c:a", "copy"] : ["-c:a", "aac", "-b:a", "256k"]),
    "-movflags", "+faststart",
    opts.out,
  ]);
  if (assPath) fs.rmSync(assPath, { force: true });
}

export async function audioCodec(file: string): Promise<string> {
  try {
    const { stdout } = await run("ffprobe", [
      "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name", "-of", "default=nw=1:nk=1", file,
    ]);
    return stdout.trim();
  } catch {
    return "";
  }
}
