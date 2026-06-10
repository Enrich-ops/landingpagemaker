import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import https from "https";
import http from "http";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BrandResult {
  siteName: string;
  siteUrl: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  colors: ColorSwatch[];
  fonts: FontEntry[];
  ogImage: string | null;
}

export interface ColorSwatch {
  hex: string;
  source: "css-variable" | "background" | "text" | "border" | "computed";
  label?: string;
}

export interface FontEntry {
  family: string;
  source: "google-fonts" | "css-variable" | "font-face" | "system";
  weights?: string[];
  url?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fetchUrl(url: string, redirectCount = 0): Promise<string> {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error("Too many redirects"));
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; BrandScanner/1.0; +https://manus.im)",
          Accept: "text/html,application/xhtml+xml,*/*",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 12000,
      },
      (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const next = res.headers.location.startsWith("http")
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          res.resume();
          return resolve(fetchUrl(next, redirectCount + 1));
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => {
          chunks.push(c);
          // Cap at 2 MB to avoid huge pages
          if (chunks.reduce((a, b) => a + b.length, 0) > 2_000_000) {
            req.destroy();
          }
        });
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
  });
}

function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

function normalizeHex(color: string): string | null {
  color = color.trim();
  // Already a hex
  if (/^#([0-9a-f]{3}){1,2}$/i.test(color)) {
    if (color.length === 4) {
      return (
        "#" +
        color[1] +
        color[1] +
        color[2] +
        color[2] +
        color[3] +
        color[3]
      ).toLowerCase();
    }
    return color.toLowerCase();
  }
  // rgb(r, g, b)
  const rgb = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgb) {
    const r = parseInt(rgb[1]).toString(16).padStart(2, "0");
    const g = parseInt(rgb[2]).toString(16).padStart(2, "0");
    const b = parseInt(rgb[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  // rgba – drop alpha
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
  // Skip pure white, near-white, pure black, near-black, and transparent
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  // Skip very bright (>245) or very dark (<10)
  if (brightness > 245 || brightness < 10) return false;
  // Skip pure grays (r≈g≈b)
  const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (diff < 15 && brightness > 200) return false;
  return true;
}

function dedupeColors(colors: ColorSwatch[]): ColorSwatch[] {
  const seen = new Set<string>();
  return colors.filter((c) => {
    if (seen.has(c.hex)) return false;
    seen.add(c.hex);
    return true;
  });
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function extractMetadata(
  html: string,
  baseUrl: string
): { siteName: string; ogImage: string | null; logoUrl: string | null; faviconUrl: string | null } {
  // Site name from og:site_name or title
  const ogSite = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i)?.[1]
    ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.split(/[|\-–]/)[0]?.trim()
    ?? new URL(baseUrl).hostname.replace(/^www\./, "");

  // OG image
  const ogImage =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]
    ?? null;

  // Logo: priority order — <img> with logo in class/id/alt, then apple-touch-icon, then SVG link
  const logoImgMatch = html.match(
    /<img[^>]+(?:class|id|alt)=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i
  ) ?? html.match(
    /<img[^>]+src=["']([^"']+)["'][^>]+(?:class|id|alt)=["'][^"']*logo[^"']*["']/i
  );
  // apple-touch-icon is often the highest-quality brand mark
  const appleTouchMatch = html.match(
    /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i
  ) ?? html.match(
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*apple-touch-icon[^"']*["']/i
  );
  // SVG icon link
  const svgIconMatch = html.match(
    /<link[^>]+type=["']image\/svg\+xml["'][^>]+href=["']([^"']+)["']/i
  ) ?? html.match(
    /<link[^>]+href=["']([^"']+\.svg)["'][^>]+rel=["'][^"']*icon[^"']*["']/i
  );
  const logoUrl = logoImgMatch
    ? resolveUrl(baseUrl, logoImgMatch[1])
    : appleTouchMatch
    ? resolveUrl(baseUrl, appleTouchMatch[1])
    : svgIconMatch
    ? resolveUrl(baseUrl, svgIconMatch[1])
    : null;

  // Favicon
  const faviconMatch =
    html.match(/<link[^>]+rel=["'][^"']*(?:shortcut icon|icon|apple-touch-icon)[^"']*["'][^>]+href=["']([^"']+)["']/i)
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*(?:shortcut icon|icon)[^"']*["']/i);
  const faviconUrl = faviconMatch
    ? resolveUrl(baseUrl, faviconMatch[1])
    : resolveUrl(baseUrl, "/favicon.ico");

  return {
    siteName: ogSite.trim(),
    ogImage: ogImage ? resolveUrl(baseUrl, ogImage) : null,
    logoUrl,
    faviconUrl,
  };
}

function extractColorsFromCss(css: string): ColorSwatch[] {
  const colors: ColorSwatch[] = [];

  // CSS custom properties (variables)
  const varRegex = /--(color|primary|secondary|accent|brand|bg|background|text|foreground)[^:]*:\s*([^;}\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = varRegex.exec(css)) !== null) {
    const hex = normalizeHex(m[2].trim());
    if (hex && isUsefulColor(hex)) {
      colors.push({ hex, source: "css-variable", label: `--${m[1]}` });
    }
  }

  // background-color / color / border-color values
  const propRegex = /(?:background-color|background|color|border-color)\s*:\s*(#[0-9a-f]{3,6}|rgb[a]?\([^)]+\))/gi;
  while ((m = propRegex.exec(css)) !== null) {
    const hex = normalizeHex(m[1]);
    if (hex && isUsefulColor(hex)) {
      colors.push({ hex, source: "background" });
    }
  }

  return colors;
}

function extractFontsFromCss(css: string, baseUrl: string): FontEntry[] {
  const fonts: FontEntry[] = [];

  // Google Fonts @import
  const gfImport = css.match(
    /@import\s+url\(['"]?(https?:\/\/fonts\.googleapis\.com[^'")\s]+)['"]?\)/gi
  );
  if (gfImport) {
    for (const imp of gfImport) {
      const urlMatch = imp.match(/url\(['"]?([^'")\s]+)['"]?\)/i);
      if (!urlMatch) continue;
      const gfUrl = urlMatch[1];
      const familyMatch = gfUrl.match(/family=([^&]+)/i);
      if (!familyMatch) continue;
      const families = decodeURIComponent(familyMatch[1]).split("|");
      for (const fam of families) {
        const [name, weights] = fam.split(":");
        fonts.push({
          family: name.replace(/\+/g, " ").trim(),
          source: "google-fonts",
          weights: weights ? weights.split(",") : ["400"],
          url: gfUrl,
        });
      }
    }
  }

  // CSS variable font families
  const varFontRegex = /--(font|typeface|heading-font|body-font)[^:]*:\s*['"]?([A-Za-z][A-Za-z0-9 _-]+)['"]?/gi;
  let m: RegExpExecArray | null;
  while ((m = varFontRegex.exec(css)) !== null) {
    const family = m[2].trim();
    if (family && !family.includes("(") && family.length < 60) {
      fonts.push({ family, source: "css-variable" });
    }
  }

  // @font-face
  const ffRegex = /@font-face\s*\{([^}]+)\}/gi;
  while ((m = ffRegex.exec(css)) !== null) {
    const block = m[1];
    const familyM = block.match(/font-family\s*:\s*['"]?([^;'"]+)['"]?/i);
    if (familyM) {
      fonts.push({
        family: familyM[1].trim(),
        source: "font-face",
      });
    }
  }

  // font-family declarations in rules
  const ffPropRegex = /font-family\s*:\s*['"]?([A-Za-z][A-Za-z0-9 _-]+)['"]?/gi;
  while ((m = ffPropRegex.exec(css)) !== null) {
    const family = m[1].trim();
    const systemFonts = ["sans-serif", "serif", "monospace", "inherit", "initial", "unset", "Arial", "Helvetica", "Georgia", "Times", "Verdana", "Tahoma", "Trebuchet", "Impact", "Courier"];
    if (!systemFonts.some(s => family.toLowerCase().includes(s.toLowerCase())) && family.length < 60) {
      fonts.push({ family, source: "system" });
    }
  }

  return fonts;
}

function dedupeFonts(fonts: FontEntry[]): FontEntry[] {
  const seen = new Set<string>();
  return fonts.filter((f) => {
    const key = f.family.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Main scanner ─────────────────────────────────────────────────────────────

async function scanBrand(rawUrl: string): Promise<BrandResult> {
  // Normalise URL
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  const baseUrl = new URL(url).origin;

  const html = await fetchUrl(url);
  const meta = extractMetadata(html, url);

  const allColors: ColorSwatch[] = [];
  const allFonts: FontEntry[] = [];

  // Extract inline <style> blocks
  const styleBlocks = Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)).map(
    (m) => m[1]
  );
  for (const css of styleBlocks) {
    allColors.push(...extractColorsFromCss(css));
    allFonts.push(...extractFontsFromCss(css, url));
  }

  // Find linked stylesheets (limit to first 5 to stay fast)
  const linkMatches = [
    ...Array.from(html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi)),
    ...Array.from(html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["']/gi)),
  ].slice(0, 5);

  await Promise.allSettled(
    linkMatches.map(async (lm) => {
      try {
        const cssUrl = resolveUrl(url, lm[1]);
        const css = await fetchUrl(cssUrl);
        allColors.push(...extractColorsFromCss(css));
        allFonts.push(...extractFontsFromCss(css, cssUrl));
      } catch {
        // ignore individual stylesheet failures
      }
    })
  );

  // Check for Google Fonts <link> in HTML head
  const gfLinkMatch = html.match(
    /<link[^>]+href=["'](https?:\/\/fonts\.googleapis\.com[^"']+)["']/i
  );
  if (gfLinkMatch) {
    const gfUrl = gfLinkMatch[1];
    const familyMatch = gfUrl.match(/family=([^&"']+)/i);
    if (familyMatch) {
      const families = decodeURIComponent(familyMatch[1]).split("|");
      for (const fam of families) {
        const [name, weights] = fam.split(":");
        allFonts.push({
          family: name.replace(/\+/g, " ").trim(),
          source: "google-fonts",
          weights: weights ? weights.split(",") : ["400"],
          url: gfUrl,
        });
      }
    }
  }

  return {
    siteName: meta.siteName,
    siteUrl: url,
    logoUrl: meta.logoUrl,
    faviconUrl: meta.faviconUrl,
    ogImage: meta.ogImage,
    colors: dedupeColors(allColors).slice(0, 20),
    fonts: dedupeFonts(allFonts).slice(0, 10),
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const brandScannerRouter = router({
  scan: publicProcedure
    .input(z.object({ url: z.string().min(3) }))
    .mutation(async ({ input }) => {
      try {
        const result = await scanBrand(input.url);
        return { success: true as const, data: result };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false as const, error: message };
      }
    }),
});
