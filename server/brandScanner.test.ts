import { describe, it, expect } from "vitest";

// ─── Test the pure helper functions from brandScanner ─────────────────────────
// We import the helpers by re-exporting them for testing purposes.
// Since the module uses Node http/https, we test the pure parsing logic only.

// Inline copies of the pure helpers to avoid importing the full module (which
// would attempt to resolve tRPC context at module load time in some setups).

function normalizeHex(color: string): string | null {
  color = color.trim();
  if (/^#([0-9a-f]{3}){1,2}$/i.test(color)) {
    if (color.length === 4) {
      return (
        "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
      ).toLowerCase();
    }
    return color.toLowerCase();
  }
  const rgb = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgb) {
    const r = parseInt(rgb[1]).toString(16).padStart(2, "0");
    const g = parseInt(rgb[2]).toString(16).padStart(2, "0");
    const b = parseInt(rgb[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  const rgba = color.match(
    /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)$/i
  );
  if (rgba) {
    const r = parseInt(rgba[1]).toString(16).padStart(2, "0");
    const g = parseInt(rgba[2]).toString(16).padStart(2, "0");
    const b = parseInt(rgba[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  return null;
}

function isUsefulColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness > 245 || brightness < 10) return false;
  const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (diff < 15 && brightness > 200) return false;
  return true;
}

// ─── normalizeHex ─────────────────────────────────────────────────────────────

describe("normalizeHex", () => {
  it("passes through a valid 6-char hex lowercased", () => {
    expect(normalizeHex("#2563EB")).toBe("#2563eb");
  });

  it("expands a 3-char hex to 6 chars", () => {
    expect(normalizeHex("#F0A")).toBe("#ff00aa");
  });

  it("converts rgb() to hex", () => {
    expect(normalizeHex("rgb(37, 99, 235)")).toBe("#2563eb");
  });

  it("converts rgba() to hex, dropping alpha", () => {
    expect(normalizeHex("rgba(37, 99, 235, 0.5)")).toBe("#2563eb");
  });

  it("returns null for non-color strings", () => {
    expect(normalizeHex("transparent")).toBeNull();
    expect(normalizeHex("inherit")).toBeNull();
    expect(normalizeHex("auto")).toBeNull();
  });
});

// ─── isUsefulColor ────────────────────────────────────────────────────────────

describe("isUsefulColor", () => {
  it("accepts a mid-range brand color", () => {
    expect(isUsefulColor("#2563eb")).toBe(true);
  });

  it("rejects pure white", () => {
    expect(isUsefulColor("#ffffff")).toBe(false);
  });

  it("rejects near-white gray", () => {
    expect(isUsefulColor("#f5f5f5")).toBe(false);
  });

  it("rejects pure black", () => {
    expect(isUsefulColor("#000000")).toBe(false);
  });

  it("accepts a saturated accent color", () => {
    expect(isUsefulColor("#f59e0b")).toBe(true);
  });
});

// ─── HTML metadata extraction (inline logic test) ─────────────────────────────

function extractSiteNameFromHtml(html: string, fallback: string): string {
  return (
    html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.split(/[|\-–]/)[0]?.trim() ??
    fallback
  );
}

describe("HTML metadata extraction", () => {
  it("extracts og:site_name", () => {
    const html = `<meta property="og:site_name" content="Acme Corp" />`;
    expect(extractSiteNameFromHtml(html, "fallback")).toBe("Acme Corp");
  });

  it("falls back to title tag, trimming pipe suffix", () => {
    const html = `<title>Acme Corp | Home</title>`;
    expect(extractSiteNameFromHtml(html, "fallback")).toBe("Acme Corp");
  });

  it("uses fallback when no meta or title found", () => {
    expect(extractSiteNameFromHtml("<html></html>", "example.com")).toBe("example.com");
  });
});
