/**
 * Elementor JSON Export Utility
 *
 * Generates a valid Elementor Template Library JSON file that can be
 * imported via Elementor → Templates → Import Template.
 *
 * Elementor stores pages as nested "elements" where each element has:
 *   - id        : unique 8-char hex string
 *   - elType    : "section" | "column" | "widget"
 *   - settings  : widget-specific settings object
 *   - elements  : child elements array
 *   - widgetType: (widgets only) e.g. "heading", "text-editor", "button", "image", "divider"
 */

import type { LandingPageData, FAQItem } from "@shared/template-types";

// ─── ID helper ────────────────────────────────────────────────────────────────

let _idCounter = 0;
function uid(): string {
  _idCounter++;
  return (_idCounter * 0x100 + Math.floor(Math.random() * 0xff))
    .toString(16)
    .padStart(8, "0")
    .slice(0, 8);
}

// ─── Low-level element builders ───────────────────────────────────────────────

interface ElemBase {
  id: string;
  elType: string;
  settings: Record<string, unknown>;
  elements: ElemBase[];
  isInner?: boolean;
}

interface Widget extends ElemBase {
  elType: "widget";
  widgetType: string;
}

function section(children: ElemBase[], settings: Record<string, unknown> = {}): ElemBase {
  return {
    id: uid(),
    elType: "section",
    settings: {
      layout: "boxed",
      content_width: { unit: "px", size: 1140 },
      padding: { unit: "px", top: "80", right: "0", bottom: "80", left: "0", isLinked: false },
      ...settings,
    },
    elements: children,
  };
}

function column(children: ElemBase[], settings: Record<string, unknown> = {}): ElemBase {
  return {
    id: uid(),
    elType: "column",
    settings: { _column_size: 100, ...settings },
    elements: children,
  };
}

function headingWidget(text: string, tag: "h1" | "h2" | "h3" | "h4" = "h2", settings: Record<string, unknown> = {}): Widget {
  return {
    id: uid(),
    elType: "widget",
    widgetType: "heading",
    settings: {
      title: text,
      header_size: tag,
      align: "center",
      ...settings,
    },
    elements: [],
  };
}

function textWidget(html: string, settings: Record<string, unknown> = {}): Widget {
  return {
    id: uid(),
    elType: "widget",
    widgetType: "text-editor",
    settings: {
      editor: `<p>${html}</p>`,
      align: "center",
      ...settings,
    },
    elements: [],
  };
}

function buttonWidget(text: string, url: string, settings: Record<string, unknown> = {}): Widget {
  return {
    id: uid(),
    elType: "widget",
    widgetType: "button",
    settings: {
      text,
      link: { url, is_external: false, nofollow: false },
      align: "center",
      size: "lg",
      ...settings,
    },
    elements: [],
  };
}

function imageWidget(src: string, alt = "", settings: Record<string, unknown> = {}): Widget {
  return {
    id: uid(),
    elType: "widget",
    widgetType: "image",
    settings: {
      image: { url: src, alt },
      image_size: "full",
      align: "center",
      ...settings,
    },
    elements: [],
  };
}

function dividerWidget(): Widget {
  return {
    id: uid(),
    elType: "widget",
    widgetType: "divider",
    settings: { color: "#e0e0e0", weight: { unit: "px", size: 1 } },
    elements: [],
  };
}

function iconBoxWidget(title: string, description: string, icon = "fa fa-check"): Widget {
  return {
    id: uid(),
    elType: "widget",
    widgetType: "icon-box",
    settings: {
      title_text: title,
      description_text: description,
      selected_icon: { value: icon, library: "fa-solid" },
      position: "top",
    },
    elements: [],
  };
}

function testimonialWidget(content: string, name: string, role = ""): Widget {
  return {
    id: uid(),
    elType: "widget",
    widgetType: "testimonial",
    settings: {
      testimonial_content: content,
      testimonial_name: name,
      testimonial_job: role,
      alignment: "center",
    },
    elements: [],
  };
}

function priceListWidget(name: string, price: string, description: string): Widget {
  return {
    id: uid(),
    elType: "widget",
    widgetType: "price-list",
    settings: {
      price_list: [
        {
          title: name,
          price,
          item_description: description,
        },
      ],
    },
    elements: [],
  };
}

function accordionWidget(items: Array<{ title: string; content: string }>): Widget {
  return {
    id: uid(),
    elType: "widget",
    widgetType: "accordion",
    settings: {
      tabs: items.map((item, i) => ({
        tab_title: item.title,
        tab_content: item.content,
        _id: String(i + 1),
      })),
    },
    elements: [],
  };
}

// ─── Section builders ─────────────────────────────────────────────────────────

function buildHeroSection(data: LandingPageData): ElemBase {
  const { content, styles } = data;
  const widgets: ElemBase[] = [];

  if (content.logo) {
    widgets.push(imageWidget(content.logo, content.companyName ?? "Logo", { width: { unit: "px", size: 180 } }));
  }

  widgets.push(headingWidget(content.headline ?? "Your Compelling Headline", "h1", {
    typography_typography: "custom",
    typography_font_size: { unit: "px", size: 52 },
    typography_font_weight: "700",
  }));

  if (content.subheadline) {
    widgets.push(textWidget(content.subheadline, { font_size: { unit: "px", size: 20 } }));
  }

  if (content.ctaText) {
    widgets.push(buttonWidget(content.ctaText, content.ctaUrl ?? "#", {
      button_type: "default",
      background_color: styles.colors.primary,
    }));
  }

  if (content.secondaryCtaText) {
    widgets.push(buttonWidget(content.secondaryCtaText, content.secondaryCtaUrl ?? "#", {
      button_type: "outline",
    }));
  }

  if (content.heroImage) {
    widgets.push(imageWidget(content.heroImage, "Hero image", { image_size: "large" }));
  }

  return section([column(widgets)], {
    background_background: "classic",
    background_color: styles.colors.background ?? "#ffffff",
    padding: { unit: "px", top: "100", right: "0", bottom: "100", left: "0", isLinked: false },
  });
}

function buildFeaturesSection(data: LandingPageData): ElemBase {
  const { content, styles } = data;
  const features = content.features ?? [];
  const colCount = Math.min(features.length || 3, 4);

  const headerCol = column([
    headingWidget(content.featuresHeadline ?? "Key Features", "h2"),
  ]);

  // Build feature columns (up to 4 per row)
  const featureCols = features.slice(0, 8).map((f) =>
    column([iconBoxWidget(f.title, f.description)], {
      _column_size: Math.floor(100 / colCount),
    })
  );

  const innerRow: ElemBase = {
    id: uid(),
    elType: "section",
    isInner: true,
    settings: { layout: "boxed" },
    elements: featureCols.length > 0 ? featureCols : [column([iconBoxWidget("Feature 1", "Description of this feature.")])],
  };

  return section([headerCol, column([innerRow])], {
    background_background: "classic",
    background_color: styles.colors.background ?? "#f8f9fa",
  });
}

function buildTestimonialsSection(data: LandingPageData): ElemBase {
  const { content } = data;
  const testimonials = content.testimonials ?? [];

  const widgets: ElemBase[] = [
    headingWidget(content.testimonialsHeadline ?? "What Our Customers Say", "h2"),
    dividerWidget(),
  ];

  if (testimonials.length > 0) {
    testimonials.slice(0, 3).forEach((t) => {
      widgets.push(testimonialWidget(t.content, t.name, t.role ?? t.company ?? ""));
    });
  } else {
    widgets.push(testimonialWidget("This product changed everything for us.", "Jane Doe", "CEO, Acme Corp"));
  }

  return section([column(widgets)], {
    background_background: "classic",
    background_color: "#f0f4ff",
  });
}

function buildPricingSection(data: LandingPageData): ElemBase {
  const { content } = data;
  const tiers = content.pricingTiers ?? [];

  const widgets: ElemBase[] = [
    headingWidget(content.pricingHeadline ?? "Simple, Transparent Pricing", "h2"),
    dividerWidget(),
  ];

  if (tiers.length > 0) {
    tiers.forEach((tier) => {
      widgets.push(priceListWidget(tier.name, tier.price, tier.features?.join(', ') ?? ""));
    });
  } else {
    widgets.push(priceListWidget("Pro Plan", "$49/mo", "Everything you need to get started."));
  }

  return section([column(widgets)]);
}

function buildFaqSection(data: LandingPageData): ElemBase {
  const { content } = data;
  const faqs = content.faqs ?? [];

  const items = faqs.length > 0
    ? faqs.map((f: FAQItem) => ({ title: f.question, content: f.answer }))
    : [{ title: "What is this?", content: "A great product that solves your problem." }];

  return section([
    column([
      headingWidget(content.faqHeadline ?? "Frequently Asked Questions", "h2"),
      accordionWidget(items),
    ]),
  ]);
}

function buildCtaSection(data: LandingPageData): ElemBase {
  const { content, styles } = data;
  const widgets: ElemBase[] = [
    headingWidget(content.finalCtaHeadline ?? "Ready to Get Started?", "h2"),
  ];
  if (content.finalCtaSubheadline) {
    widgets.push(textWidget(content.finalCtaSubheadline));
  }
  widgets.push(buttonWidget(content.finalCtaText ?? "Get Started Now", content.ctaUrl ?? "#", {
    background_color: styles.colors.primary,
  }));

  return section([column(widgets)], {
    background_background: "classic",
    background_color: styles.colors.primary,
    color: "#ffffff",
    padding: { unit: "px", top: "80", right: "0", bottom: "80", left: "0", isLinked: false },
  });
}

// ─── Global settings ──────────────────────────────────────────────────────────

function buildGlobalSettings(data: LandingPageData): Record<string, unknown> {
  const { styles } = data;
  return {
    custom_colors: [
      { id: uid(), title: "Primary", color: styles.colors.primary },
      { id: uid(), title: "Secondary", color: styles.colors.secondary },
      { id: uid(), title: "Accent", color: styles.colors.accent },
    ],
    custom_typography: [
      {
        id: uid(),
        title: "Heading",
        typography_font_family: styles.fonts.heading,
        typography_font_weight: "700",
      },
      {
        id: uid(),
        title: "Body",
        typography_font_family: styles.fonts.body,
        typography_font_weight: "400",
      },
    ],
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface ElementorExport {
  version: string;
  title: string;
  type: string;
  content: ElemBase[];
  page_settings: Record<string, unknown>;
  settings: Record<string, unknown>;
}

export function exportElementor(data: LandingPageData): ElementorExport {
  _idCounter = 0; // reset counter per export for deterministic output in tests

  const sectionMap: Record<string, () => ElemBase> = {
    hero: () => buildHeroSection(data),
    features: () => buildFeaturesSection(data),
    testimonials: () => buildTestimonialsSection(data),
    pricing: () => buildPricingSection(data),
    faq: () => buildFaqSection(data),
    cta: () => buildCtaSection(data),
  };

  const visibleSections = data.sections
    .filter((s) => s.visible)
    .map((s) => {
      const builder = sectionMap[s.type];
      return builder ? builder() : null;
    })
    .filter(Boolean) as ElemBase[];

  return {
    version: "0.4",
    title: data.content.headline ?? "Landing Page",
    type: "page",
    content: visibleSections,
    page_settings: {
      background_background: "classic",
      background_color: data.styles.colors.background ?? "#ffffff",
    },
    settings: buildGlobalSettings(data),
  };
}

export function downloadElementor(data: LandingPageData, filename?: string): void {
  const payload = exportElementor(data);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `elementor-template-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
