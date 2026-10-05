import type { Word } from "./types";

const assTime = (s: number) => {
  const cs = Math.round(Math.max(0, s) * 100);
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const sec = Math.floor((cs % 6000) / 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(cs % 100).padStart(2, "0")}`;
};
export { assTime };

/** Group words into short on-screen lines (<=3 words, break on pauses/punctuation). */
export function groupWords(words: Word[], maxWords = 3, maxSpan = 2.0): Word[][] {
  const groups: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    const prev = cur[cur.length - 1];
    if (prev && (cur.length >= maxWords || w.end - cur[0].start > maxSpan || w.start - prev.end > 0.6)) {
      groups.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.!?]$/.test(w.text)) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  return groups;
}

const escapeAss = (s: string) => s.replace(/[{}\\]/g, "").replace(/\n/g, " ");

/**
 * Build an ASS subtitle file for a clip. Big bold uppercase captions in the lower third,
 * with the currently spoken word highlighted (karaoke fill).
 * Word times are absolute in the source video; `clipStart` rebases them to 0.
 */
export function buildAss(words: Word[], clipStart: number, clipEnd: number, w = 1080, h = 1920): string {
  const inClip = words.filter((x) => x.end > clipStart && x.start < clipEnd);
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${w}
PlayResY: ${h}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,DejaVu Sans,84,&H00FFFFFF,&H0000E5FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,7,2,2,60,60,${Math.round(h * 0.22)},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const lines = groupWords(inClip).map((g) => {
    const start = Math.max(0, g[0].start - clipStart);
    const end = Math.min(clipEnd - clipStart, g[g.length - 1].end - clipStart);
    // \kf = progressive fill from SecondaryColour (yellow) -> PrimaryColour(white); durations in centiseconds.
    const text = g
      .map((x) => {
        const cs = Math.max(1, Math.round((Math.min(x.end, clipEnd) - Math.max(x.start, clipStart)) * 100));
        return `{\\kf${cs}}${escapeAss(x.text.toUpperCase())}`;
      })
      .join(" ");
    return `Dialogue: 0,${assTime(start)},${assTime(end)},Default,,0,0,0,,${text}`;
  });
  return header + lines.join("\n") + "\n";
}
