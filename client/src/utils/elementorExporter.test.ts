import { describe, it, expect } from "vitest";
import { exportElementor } from "./elementorExporter";
import type { LandingPageData } from "@shared/template-types";

const sampleData: LandingPageData = {
  templateId: "test",
  lastModified: Date.now(),
  content: {
    headline: "Test Headline",
    subheadline: "Test subheadline copy",
    ctaText: "Get Started",
    ctaUrl: "https://example.com",
    featuresHeadline: "Features",
    features: [
      { title: "Speed", description: "Super fast" },
      { title: "Quality", description: "Top notch" },
    ],
    testimonials: [
      { name: "Alice", role: "CEO", content: "Amazing product!" },
    ],
    pricingTiers: [
      { name: "Pro", price: "$49/mo", features: ["Feature A", "Feature B"] },
    ],
    faqs: [
      { question: "What is this?", answer: "A great tool." },
    ],
    finalCtaHeadline: "Ready?",
    finalCtaText: "Sign Up",
    companyName: "Acme Corp",
  },
  styles: {
    colors: {
      primary: "#2563eb",
      secondary: "#64748b",
      accent: "#f59e0b",
      background: "#ffffff",
      text: "#1e293b",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    spacing: "normal",
    borderRadius: "medium",
  },
  sections: [
    { id: "hero", type: "hero", visible: true, order: 0 },
    { id: "features", type: "features", visible: true, order: 1 },
    { id: "testimonials", type: "testimonials", visible: true, order: 2 },
    { id: "pricing", type: "pricing", visible: true, order: 3 },
    { id: "faq", type: "faq", visible: true, order: 4 },
    { id: "cta", type: "cta", visible: true, order: 5 },
  ],
};

describe("exportElementor", () => {
  it("returns a valid Elementor export object with correct version", () => {
    const result = exportElementor(sampleData);
    expect(result.version).toBe("0.4");
    expect(result.type).toBe("page");
  });

  it("uses the headline as the template title", () => {
    const result = exportElementor(sampleData);
    expect(result.title).toBe("Test Headline");
  });

  it("generates one top-level section per visible section", () => {
    const result = exportElementor(sampleData);
    // 6 visible sections → 6 top-level Elementor sections
    expect(result.content).toHaveLength(6);
  });

  it("skips hidden sections", () => {
    const data: LandingPageData = {
      ...sampleData,
      sections: sampleData.sections.map((s) =>
        s.type === "pricing" ? { ...s, visible: false } : s
      ),
    };
    const result = exportElementor(data);
    expect(result.content).toHaveLength(5);
  });

  it("includes global color settings", () => {
    const result = exportElementor(sampleData);
    const colors = result.settings.custom_colors as Array<{ title: string; color: string }>;
    expect(colors.some((c) => c.color === "#2563eb")).toBe(true);
  });

  it("includes global typography settings", () => {
    const result = exportElementor(sampleData);
    const typo = result.settings.custom_typography as Array<{ title: string; typography_font_family: string }>;
    expect(typo.some((t) => t.typography_font_family === "Inter")).toBe(true);
  });

  it("all top-level elements have elType section", () => {
    const result = exportElementor(sampleData);
    result.content.forEach((el) => {
      expect(el.elType).toBe("section");
    });
  });

  it("each section contains at least one column", () => {
    const result = exportElementor(sampleData);
    result.content.forEach((sec) => {
      expect(sec.elements.length).toBeGreaterThan(0);
      expect(sec.elements[0].elType).toBe("column");
    });
  });

  it("each element has a non-empty id", () => {
    const result = exportElementor(sampleData);
    const checkIds = (elements: typeof result.content) => {
      elements.forEach((el) => {
        expect(el.id).toBeTruthy();
        expect(el.id.length).toBeGreaterThan(0);
        if (el.elements) checkIds(el.elements);
      });
    };
    checkIds(result.content);
  });

  it("hero section contains a heading widget with the headline text", () => {
    const result = exportElementor(sampleData);
    const heroSection = result.content[0];
    const column = heroSection.elements[0];
    const headingWidget = column.elements.find(
      (w) => w.elType === "widget" && (w as { widgetType?: string }).widgetType === "heading"
    );
    expect(headingWidget).toBeTruthy();
    expect((headingWidget?.settings as { title?: string })?.title).toBe("Test Headline");
  });
});
