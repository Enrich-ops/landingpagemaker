import { describe, expect, it } from "vitest";
import { assTime, buildAss, groupWords } from "../src/captions";
import { extractJson, normalizeClips } from "../src/selectClips";
import { mergeChunks } from "../src/transcribe";
import { pickPrivacy, planChunks } from "../src/publish/tiktok";
import { shortsMetadata } from "../src/publish/youtube";
import { planVariants, validateCaption } from "../src/campaign";
import { videoFilter } from "../src/render";
import type { Transcript, Word } from "../src/types";

const words = (n: number, step = 0.5): Word[] =>
  Array.from({ length: n }, (_, i) => ({ text: `w${i}.`.replace(".", i % 6 === 5 ? "." : ""), start: i * step, end: i * step + 0.4 }));
const transcript = (dur = 200): Transcript => ({ language: "en", duration: dur, segments: [], words: words(dur * 2) });

describe("captions", () => {
  it("formats ASS times", () => {
    expect(assTime(0)).toBe("0:00:00.00");
    expect(assTime(3725.5)).toBe("1:02:05.50");
  });
  it("groups words and breaks on sentence ends and pauses", () => {
    const g = groupWords(words(12));
    expect(g.every((x) => x.length <= 3)).toBe(true);
    expect(g.flat()).toHaveLength(12);
  });
  it("rebases times to the clip start and only includes in-range words", () => {
    const ass = buildAss(words(40), 10, 14);
    const dialogue = ass.split("\n").filter((l) => l.startsWith("Dialogue"));
    expect(dialogue.length).toBeGreaterThan(0);
    expect(dialogue[0]).toContain("0:00:00");
    expect(ass).not.toContain("W0");
  });
});

describe("selectClips", () => {
  it("extracts JSON from chatty output", () => {
    expect(extractJson('Sure!\n{"clips":[]}\nDone')).toEqual({ clips: [] });
    expect(() => extractJson("nope")).toThrow();
  });
  it("snaps, filters by length, drops overlaps, ranks by score", () => {
    const raw = {
      clips: [
        { start: 10.1, end: 50, title: "a", score: 70 },
        { start: 30, end: 70, title: "overlaps a, lower score", score: 60 },
        { start: 100, end: 105, title: "too short", score: 99 },
        { start: 120, end: 160, title: "b", score: 90 },
        { start: "x", end: 3 },
      ],
    };
    const out = normalizeClips(raw, transcript(), { min: 20, max: 60, count: 5 });
    expect(out.map((c) => c.title)).toEqual(["b", "a"]);
    expect(out[1].start).toBeCloseTo(10, 0);
  });
  it("respects the count limit and duration bounds", () => {
    const raw = { clips: [{ start: 0, end: 30, score: 1 }, { start: 40, end: 70, score: 2 }, { start: 80, end: 110, score: 3 }] };
    expect(normalizeClips(raw, transcript(), { min: 20, max: 60, count: 2 })).toHaveLength(2);
    expect(() => normalizeClips({}, transcript(), { min: 20, max: 60, count: 2 })).toThrow();
  });
});

describe("transcribe", () => {
  it("offsets chunk timestamps onto the full timeline", () => {
    const t = mergeChunks(
      [
        { offset: 0, res: { language: "en", words: [{ word: "a", start: 1, end: 2 }] } },
        { offset: 600, res: { words: [{ word: " b ", start: 1, end: 2 }], segments: [{ text: " hi ", start: 0, end: 5 }] } },
      ],
      1200,
    );
    expect(t.words.map((w) => [w.text, w.start])).toEqual([["a", 1], ["b", 601]]);
    expect(t.segments[0]).toEqual({ text: "hi", start: 600, end: 605 });
  });
});

describe("publishers", () => {
  const MB = 1024 * 1024;
  it("plans TikTok chunks", () => {
    expect(planChunks(10 * MB)).toEqual({ chunkSize: 10 * MB, total: 1 });
    expect(planChunks(100 * MB)).toEqual({ chunkSize: 32 * MB, total: 3 }); // last chunk = 36MB
  });
  it("picks a valid privacy level", () => {
    expect(pickPrivacy(["SELF_ONLY"], "public")).toBe("SELF_ONLY"); // unaudited apps
    expect(pickPrivacy(["PUBLIC_TO_EVERYONE", "SELF_ONLY"], "public")).toBe("PUBLIC_TO_EVERYONE");
    expect(pickPrivacy(["PUBLIC_TO_EVERYONE", "SELF_ONLY"], "private")).toBe("SELF_ONLY");
  });
  it("adds #Shorts once and trims long titles", () => {
    expect(shortsMetadata("Hi", "desc").title).toBe("Hi #Shorts");
    expect(shortsMetadata("Hi #shorts", "d").description).toBe("d");
    expect(shortsMetadata("x".repeat(200), "d").title.length).toBeLessThanOrEqual(100);
  });
});

describe("campaign rules", () => {
  it("requires a mandatory caption and forbids hashtags", () => {
    expect(validateCaption("Crazy how far Ketone-IQ has come")).toEqual([]);
    expect(validateCaption("the nerds were onto something 👀 so true")).toEqual([]);
    expect(validateCaption("just a caption")).toHaveLength(1);
    expect(validateCaption("Crazy how far Ketone-IQ has come #fyp")).toHaveLength(1);
  });
});

describe("render filter", () => {
  it("escapes the ass path and supports both framing modes", () => {
    expect(videoFilter("fill", "C:\\a'b.ass")).toContain("ass='C\\:/a\\'b.ass'");
    expect(videoFilter("blur")).toContain("boxblur");
    expect(videoFilter("fill")).not.toContain("boxblur");
  });
});

describe("campaign variants", () => {
  it("plans distinct, compliant hook/caption/border combos", () => {
    const v = planVariants(6);
    expect(v).toHaveLength(6);
    expect(new Set(v.map((x) => x.hookText)).size).toBe(6);
    expect(new Set(v.map((x) => x.border)).size).toBe(6);
    expect(v.every((x) => validateCaption(x.caption).length === 0)).toBe(true);
    expect(planVariants(99)).toHaveLength(6);
    expect(planVariants(0)).toHaveLength(1);
  });
});
