import type { LandingPageData } from '@shared/template-types';
import { Star, CheckCircle2 } from 'lucide-react';

interface LandingPagePreviewProps {
  data: LandingPageData;
}

// Templates that use a dark background
const DARK_TEMPLATES = new Set(['saas-dark-gradient', 'event-conference']);
// Templates that use a serif heading font
const SERIF_TEMPLATES = new Set(['professional-services', 'real-estate', 'lead-magnet', 'webinar-registration']);
// Templates that use a centered hero (no image split)
const CENTERED_HERO_TEMPLATES = new Set(['webinar-registration', 'lead-magnet', 'video-sales', 'hero-lead-gen']);
// Templates with a gradient hero band
const GRADIENT_HERO_TEMPLATES = new Set(['saas-dark-gradient', 'event-conference', 'saas-trial']);

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export function LandingPagePreview({ data }: LandingPagePreviewProps) {
  const { content, styles, sections, templateId } = data;

  const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

  const isDark = DARK_TEMPLATES.has(templateId);
  const isCenteredHero = CENTERED_HERO_TEMPLATES.has(templateId);
  const isGradientHero = GRADIENT_HERO_TEMPLATES.has(templateId);
  const isSerif = SERIF_TEMPLATES.has(templateId);

  const spacing = styles.spacing;
  const sectionPy = spacing === 'compact' ? 'py-10 md:py-14' : spacing === 'spacious' ? 'py-20 md:py-28' : 'py-14 md:py-20';

  const br = styles.borderRadius;
  const borderRadiusClass = br === 'none' ? 'rounded-none' : br === 'small' ? 'rounded' : br === 'large' ? 'rounded-2xl' : 'rounded-xl';

  const headingFont = isSerif ? 'Georgia, "Times New Roman", serif' : styles.fonts.heading;

  const { primary, secondary, accent, background, text } = styles.colors;
  const primaryRgb = hexToRgb(primary.startsWith('#') && primary.length === 7 ? primary : '#2563eb');

  // ── HERO ─────────────────────────────────────────────────────────────────
  const renderHero = (key: string) => {
    // Dark gradient hero (SaaS Dark Gradient, Event/Conference)
    if (isGradientHero) {
      return (
        <section
          key={key}
          className={`${sectionPy} px-4 relative overflow-hidden`}
          style={{
            background: `linear-gradient(135deg, ${background} 0%, ${primary}22 50%, ${secondary}22 100%)`,
            borderBottom: `1px solid ${primary}30`,
          }}
        >
          {/* Glow orb */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: primary }}
          />
          <div className="max-w-6xl mx-auto relative z-10">
            {content.companyName && (
              <div className="flex justify-center mb-6">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border"
                  style={{ color: primary, borderColor: `${primary}50`, backgroundColor: `${primary}15` }}
                >
                  {content.companyName}
                </span>
              </div>
            )}
            <div className="text-center max-w-4xl mx-auto space-y-6">
              {content.logo && <img src={content.logo} alt="Logo" className="h-12 w-auto mx-auto" />}
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight"
                style={{ fontFamily: headingFont, color: text }}
              >
                {content.headline || 'Your Headline Here'}
              </h1>
              {content.subheadline && (
                <p className="text-xl md:text-2xl max-w-2xl mx-auto" style={{ color: secondary, opacity: 0.9 }}>
                  {content.subheadline}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {content.ctaText && (
                  <a
                    href={content.ctaUrl || '#'}
                    className={`inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white ${borderRadiusClass} shadow-lg hover:opacity-90 transition-opacity`}
                    style={{ backgroundColor: primary, boxShadow: `0 0 30px ${primary}60` }}
                  >
                    {content.ctaText}
                  </a>
                )}
                {content.secondaryCtaText && (
                  <a
                    href={content.secondaryCtaUrl || '#'}
                    className={`inline-flex items-center justify-center px-8 py-4 text-lg font-semibold border-2 ${borderRadiusClass} hover:opacity-80 transition-opacity`}
                    style={{ borderColor: `${primary}60`, color: text }}
                  >
                    {content.secondaryCtaText}
                  </a>
                )}
              </div>
            </div>
            {content.heroImage && (
              <div className={`mt-12 ${borderRadiusClass} overflow-hidden border shadow-2xl`} style={{ borderColor: `${primary}30` }}>
                <img src={content.heroImage} alt="Hero" className="w-full h-auto" />
              </div>
            )}
          </div>
        </section>
      );
    }

    // Centered hero (Webinar, Lead Magnet, Video Sales, Hero Lead Gen)
    if (isCenteredHero) {
      return (
        <section
          key={key}
          className={`${sectionPy} px-4`}
          style={{ backgroundColor: background }}
        >
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {content.companyName && (
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
                {content.companyName}
              </p>
            )}
            {content.logo && <img src={content.logo} alt="Logo" className="h-12 w-auto mx-auto" />}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ fontFamily: headingFont, color: text }}
            >
              {content.headline || 'Your Headline Here'}
            </h1>
            {content.subheadline && (
              <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: secondary }}>
                {content.subheadline}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              {content.ctaText && (
                <a
                  href={content.ctaUrl || '#'}
                  className={`inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white ${borderRadiusClass} hover:opacity-90 transition-opacity`}
                  style={{ backgroundColor: primary }}
                >
                  {content.ctaText}
                </a>
              )}
              {content.secondaryCtaText && (
                <a
                  href={content.secondaryCtaUrl || '#'}
                  className={`inline-flex items-center justify-center px-8 py-4 text-lg font-semibold border-2 ${borderRadiusClass} hover:opacity-80 transition-opacity`}
                  style={{ borderColor: primary, color: primary }}
                >
                  {content.secondaryCtaText}
                </a>
              )}
            </div>
            {content.heroImage && (
              <div className={`mt-8 ${borderRadiusClass} overflow-hidden shadow-xl`}>
                <img src={content.heroImage} alt="Hero" className="w-full h-auto" />
              </div>
            )}
          </div>
        </section>
      );
    }

    // Professional Services: bold left-aligned with accent bar
    if (templateId === 'professional-services') {
      return (
        <section
          key={key}
          className={`${sectionPy} px-4`}
          style={{ backgroundColor: background }}
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
              {content.logo && <img src={content.logo} alt="Logo" className="h-12 w-auto" />}
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                style={{ fontFamily: headingFont, color: text }}
              >
                {content.headline || 'Your Headline Here'}
              </h1>
              {content.subheadline && (
                <p className="text-lg" style={{ color: secondary }}>
                  {content.subheadline}
                </p>
              )}
              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 pt-2">
                {['Free Consultation', 'No Win No Fee', '20+ Years Experience'].map((badge, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: `${accent}20`, color: text }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: accent }} />
                    {badge}
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {content.ctaText && (
                  <a
                    href={content.ctaUrl || '#'}
                    className={`inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white ${borderRadiusClass} hover:opacity-90 transition-opacity`}
                    style={{ backgroundColor: primary }}
                  >
                    {content.ctaText}
                  </a>
                )}
              </div>
            </div>
            {content.heroImage && (
              <div className={`${borderRadiusClass} overflow-hidden shadow-2xl`}>
                <img src={content.heroImage} alt="Hero" className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        </section>
      );
    }

    // Real Estate: editorial split with agent-style layout
    if (templateId === 'real-estate') {
      return (
        <section
          key={key}
          className={`${sectionPy} px-4`}
          style={{ backgroundColor: background }}
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-10 items-center">
            {content.heroImage && (
              <div className="md:col-span-3">
                <div className={`${borderRadiusClass} overflow-hidden shadow-xl`}>
                  <img src={content.heroImage} alt="Hero" className="w-full h-auto object-cover" />
                </div>
              </div>
            )}
            <div className="md:col-span-2 space-y-5">
              {content.companyName && (
                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primary }}>
                  {content.companyName}
                </p>
              )}
              {content.logo && <img src={content.logo} alt="Logo" className="h-10 w-auto" />}
              <h1
                className="text-3xl md:text-4xl font-bold leading-tight"
                style={{ fontFamily: headingFont, color: text }}
              >
                {content.headline || 'Your Headline Here'}
              </h1>
              {content.subheadline && (
                <p className="text-base" style={{ color: secondary }}>
                  {content.subheadline}
                </p>
              )}
              <div className="pt-2">
                {content.ctaText && (
                  <a
                    href={content.ctaUrl || '#'}
                    className={`inline-flex items-center justify-center w-full px-6 py-3.5 text-base font-bold text-white ${borderRadiusClass} hover:opacity-90 transition-opacity`}
                    style={{ backgroundColor: primary }}
                  >
                    {content.ctaText}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    // Health & Wellness: warm centered with social proof strip
    if (templateId === 'health-wellness') {
      return (
        <section
          key={key}
          className={`${sectionPy} px-4`}
          style={{ backgroundColor: background }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-6">
              {content.logo && <img src={content.logo} alt="Logo" className="h-12 w-auto mx-auto" />}
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                style={{ fontFamily: headingFont, color: text }}
              >
                {content.headline || 'Your Headline Here'}
              </h1>
              {content.subheadline && (
                <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: secondary }}>
                  {content.subheadline}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                {content.ctaText && (
                  <a
                    href={content.ctaUrl || '#'}
                    className={`inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white ${borderRadiusClass} hover:opacity-90 transition-opacity`}
                    style={{ backgroundColor: primary }}
                  >
                    {content.ctaText}
                  </a>
                )}
                {content.secondaryCtaText && (
                  <a
                    href={content.secondaryCtaUrl || '#'}
                    className={`inline-flex items-center justify-center px-8 py-4 text-lg font-semibold border-2 ${borderRadiusClass} hover:opacity-80 transition-opacity`}
                    style={{ borderColor: primary, color: primary }}
                  >
                    {content.secondaryCtaText}
                  </a>
                )}
              </div>
            </div>
            {content.heroImage && (
              <div className={`mt-10 ${borderRadiusClass} overflow-hidden shadow-xl`}>
                <img src={content.heroImage} alt="Hero" className="w-full h-auto" />
              </div>
            )}
            {/* Social proof strip */}
            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-6 py-4 px-6 rounded-xl"
              style={{ backgroundColor: `${primary}10` }}
            >
              {['28,000+ Members', 'Avg. 14.7 lbs Lost', '90-Day Guarantee', 'Vet-Formulated'].map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: primary }} />
                  <span className="text-sm font-semibold" style={{ color: text }}>{stat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // E-commerce Product: product image left, CTA right
    if (templateId === 'ecommerce-product') {
      return (
        <section
          key={key}
          className={`${sectionPy} px-4`}
          style={{ backgroundColor: background }}
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            {content.heroImage && (
              <div className={`${borderRadiusClass} overflow-hidden shadow-xl sticky top-8`}>
                <img src={content.heroImage} alt="Product" className="w-full h-auto" />
              </div>
            )}
            <div className="space-y-5">
              {content.companyName && (
                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primary }}>
                  {content.companyName}
                </p>
              )}
              {content.logo && <img src={content.logo} alt="Logo" className="h-10 w-auto" />}
              <h1
                className="text-3xl md:text-4xl font-bold leading-tight"
                style={{ fontFamily: headingFont, color: text }}
              >
                {content.headline || 'Your Headline Here'}
              </h1>
              {/* Star rating */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-4 w-4 fill-current" style={{ color: accent }} />
                  ))}
                </div>
                <span className="text-sm font-medium" style={{ color: secondary }}>4.9 (2,847 reviews)</span>
              </div>
              {content.subheadline && (
                <p className="text-base" style={{ color: secondary }}>
                  {content.subheadline}
                </p>
              )}
              {/* Offer box */}
              <div
                className={`p-4 ${borderRadiusClass} border-2`}
                style={{ borderColor: primary, backgroundColor: `${primary}08` }}
              >
                <p className="text-sm font-semibold mb-2" style={{ color: primary }}>
                  Limited Time Offer
                </p>
                <div className="flex flex-col gap-2">
                  {content.ctaText && (
                    <a
                      href={content.ctaUrl || '#'}
                      className={`inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white ${borderRadiusClass} hover:opacity-90 transition-opacity`}
                      style={{ backgroundColor: primary }}
                    >
                      {content.ctaText}
                    </a>
                  )}
                  {content.secondaryCtaText && (
                    <a
                      href={content.secondaryCtaUrl || '#'}
                      className={`inline-flex items-center justify-center px-6 py-3 text-sm font-semibold ${borderRadiusClass} hover:opacity-80 transition-opacity`}
                      style={{ color: primary }}
                    >
                      {content.secondaryCtaText}
                    </a>
                  )}
                </div>
              </div>
              {/* Guarantee */}
              <div className="flex items-center gap-3 text-sm" style={{ color: secondary }}>
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: primary }} />
                <span>30-day money-back guarantee · Free shipping · Secure checkout</span>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // Default: standard split hero
    return (
      <section
        key={key}
        className={`${sectionPy} px-4`}
        style={{ backgroundColor: background }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            {content.companyName && (
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primary }}>
                {content.companyName}
              </p>
            )}
            {content.logo && <img src={content.logo} alt="Logo" className="h-12 w-auto" />}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ fontFamily: headingFont, color: text }}
            >
              {content.headline || 'Your Headline Here'}
            </h1>
            {content.subheadline && (
              <p className="text-lg md:text-xl" style={{ color: secondary }}>
                {content.subheadline}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {content.ctaText && (
                <a
                  href={content.ctaUrl || '#'}
                  className={`inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white ${borderRadiusClass} hover:opacity-90 transition-opacity`}
                  style={{ backgroundColor: primary }}
                >
                  {content.ctaText}
                </a>
              )}
              {content.secondaryCtaText && (
                <a
                  href={content.secondaryCtaUrl || '#'}
                  className={`inline-flex items-center justify-center px-8 py-4 text-lg font-semibold border-2 ${borderRadiusClass} hover:opacity-80 transition-opacity`}
                  style={{ borderColor: primary, color: primary }}
                >
                  {content.secondaryCtaText}
                </a>
              )}
            </div>
          </div>
          {content.heroImage && (
            <div className={`${borderRadiusClass} overflow-hidden shadow-xl`}>
              <img src={content.heroImage} alt="Hero" className="w-full h-auto object-cover" />
            </div>
          )}
        </div>
      </section>
    );
  };

  // ── FEATURES ─────────────────────────────────────────────────────────────
  const renderFeatures = (key: string) => {
    const altBg = isDark ? `${primary}15` : `${primary}08`;

    // Event/Conference: 2-col with numbered items
    if (templateId === 'event-conference') {
      return (
        <section key={key} className={`${sectionPy} px-4`} style={{ backgroundColor: altBg }}>
          <div className="max-w-6xl mx-auto">
            {content.featuresHeadline && (
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ fontFamily: headingFont, color: text }}>
                {content.featuresHeadline}
              </h2>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              {content.features?.map((feature, idx) => (
                <div key={idx} className={`flex gap-5 p-6 ${borderRadiusClass}`} style={{ backgroundColor: `${background}20`, border: `1px solid ${primary}30` }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: primary }}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ fontFamily: headingFont, color: text }}>{feature.title}</h3>
                    <p className="text-sm" style={{ color: secondary }}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // Professional Services: icon-left list style
    if (templateId === 'professional-services') {
      return (
        <section key={key} className={`${sectionPy} px-4`} style={{ backgroundColor: `${primary}06` }}>
          <div className="max-w-6xl mx-auto">
            {content.featuresHeadline && (
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ fontFamily: headingFont, color: text }}>
                {content.featuresHeadline}
              </h2>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              {content.features?.map((feature, idx) => (
                <div key={idx} className={`flex gap-4 p-6 bg-white ${borderRadiusClass} shadow-sm border`} style={{ borderColor: `${primary}15` }}>
                  <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ fontFamily: headingFont, color: text }}>{feature.title}</h3>
                    <p className="text-sm" style={{ color: secondary }}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // Health & Wellness: 4-col with colored icon circles
    if (templateId === 'health-wellness') {
      return (
        <section key={key} className={`${sectionPy} px-4`} style={{ backgroundColor: background }}>
          <div className="max-w-6xl mx-auto">
            {content.featuresHeadline && (
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: headingFont, color: text }}>{content.featuresHeadline}</h2>
                {content.featuresSubheadline && <p className="text-lg" style={{ color: secondary }}>{content.featuresSubheadline}</p>}
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.features?.map((feature, idx) => (
                <div key={idx} className={`text-center p-6 ${borderRadiusClass}`} style={{ backgroundColor: `${primary}08` }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4" style={{ backgroundColor: `${primary}20` }}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold mb-2" style={{ fontFamily: headingFont, color: text }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: secondary }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // Default: 3-col card grid
    return (
      <section key={key} className={`${sectionPy} px-4`} style={{ backgroundColor: isDark ? altBg : `${primary}06` }}>
        <div className="max-w-6xl mx-auto">
          {content.featuresHeadline && (
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: headingFont, color: text }}>{content.featuresHeadline}</h2>
              {content.featuresSubheadline && <p className="text-lg" style={{ color: secondary }}>{content.featuresSubheadline}</p>}
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.features?.map((feature, idx) => (
              <div key={idx} className={`p-6 ${borderRadiusClass}`} style={{ backgroundColor: isDark ? `${background}30` : background, border: `1px solid ${primary}15` }}>
                {feature.icon && <div className="text-4xl mb-4">{feature.icon}</div>}
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: headingFont, color: text }}>{feature.title}</h3>
                <p style={{ color: secondary }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ── TESTIMONIALS ─────────────────────────────────────────────────────────
  const renderTestimonials = (key: string) => {
    const bgColor = isDark ? `${primary}15` : `${primary}08`;
    return (
      <section key={key} className={`${sectionPy} px-4`} style={{ backgroundColor: bgColor }}>
        <div className="max-w-6xl mx-auto">
          {content.testimonialsHeadline && (
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ fontFamily: headingFont, color: text }}>
              {content.testimonialsHeadline}
            </h2>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {content.testimonials?.map((testimonial, idx) => (
              <div
                key={idx}
                className={`p-7 ${borderRadiusClass} space-y-4`}
                style={{ backgroundColor: isDark ? `rgba(${primaryRgb},0.08)` : background, border: `1px solid ${primary}20` }}
              >
                {testimonial.rating && (
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" style={{ color: accent || primary }} />
                    ))}
                  </div>
                )}
                <p className="text-base leading-relaxed" style={{ color: text }}>"{testimonial.content}"</p>
                <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: `${primary}15` }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: primary }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: text }}>{testimonial.name}</p>
                    {testimonial.role && (
                      <p className="text-xs" style={{ color: secondary }}>
                        {testimonial.role}{testimonial.company && ` · ${testimonial.company}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ── PRICING ───────────────────────────────────────────────────────────────
  const renderPricing = (key: string) => (
    <section key={key} className={`${sectionPy} px-4`} style={{ backgroundColor: background }}>
      <div className="max-w-6xl mx-auto">
        {content.pricingHeadline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: headingFont, color: text }}>
              {content.pricingHeadline}
            </h2>
            {content.pricingSubheadline && (
              <p className="text-lg" style={{ color: secondary }}>{content.pricingSubheadline}</p>
            )}
          </div>
        )}
        <div className={`grid gap-6 ${(content.pricingTiers?.length ?? 0) === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
          {content.pricingTiers?.map((tier, idx) => (
            <div
              key={idx}
              className={`relative p-8 ${borderRadiusClass} border-2 flex flex-col ${tier.highlighted ? 'shadow-2xl' : 'shadow-sm'}`}
              style={{
                borderColor: tier.highlighted ? primary : `${primary}25`,
                backgroundColor: tier.highlighted ? `${primary}08` : background,
                transform: tier.highlighted ? 'scale(1.03)' : 'none',
              }}
            >
              {tier.highlighted && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold text-white rounded-full"
                  style={{ backgroundColor: primary }}
                >
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: headingFont, color: text }}>{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold" style={{ color: tier.highlighted ? primary : text }}>{tier.price}</span>
                  {tier.period && <span className="text-sm" style={{ color: secondary }}>{tier.period}</span>}
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {tier.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: primary }} />
                    <span style={{ color: text }}>{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.ctaText && (
                <a
                  href={tier.ctaUrl || '#'}
                  className={`block text-center px-6 py-3.5 font-bold ${borderRadiusClass} transition-opacity hover:opacity-90`}
                  style={{
                    backgroundColor: tier.highlighted ? primary : 'transparent',
                    color: tier.highlighted ? '#ffffff' : primary,
                    border: tier.highlighted ? 'none' : `2px solid ${primary}`,
                  }}
                >
                  {tier.ctaText}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // ── FAQ ───────────────────────────────────────────────────────────────────
  const renderFaq = (key: string) => (
    <section key={key} className={`${sectionPy} px-4`} style={{ backgroundColor: isDark ? `${primary}10` : `${secondary}08` }}>
      <div className="max-w-3xl mx-auto">
        {content.faqHeadline && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10" style={{ fontFamily: headingFont, color: text }}>
            {content.faqHeadline}
          </h2>
        )}
        <div className="space-y-4">
          {content.faqs?.map((faq, idx) => (
            <div key={idx} className={`p-6 ${borderRadiusClass}`} style={{ backgroundColor: isDark ? `rgba(${primaryRgb},0.08)` : background, border: `1px solid ${primary}15` }}>
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: headingFont, color: text }}>{faq.question}</h3>
              <p className="text-sm leading-relaxed" style={{ color: secondary }}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // ── FINAL CTA ─────────────────────────────────────────────────────────────
  const renderCta = (key: string) => {
    // Dark templates: gradient CTA band
    if (isDark) {
      return (
        <section
          key={key}
          className={`${sectionPy} px-4`}
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
        >
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {content.finalCtaHeadline && (
              <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: headingFont }}>
                {content.finalCtaHeadline}
              </h2>
            )}
            {content.finalCtaSubheadline && (
              <p className="text-lg text-white opacity-85">{content.finalCtaSubheadline}</p>
            )}
            {content.finalCtaText && (
              <a
                href={content.finalCtaUrl || '#'}
                className={`inline-flex items-center justify-center px-8 py-4 text-lg font-bold ${borderRadiusClass} transition-opacity hover:opacity-90`}
                style={{ backgroundColor: '#ffffff', color: primary }}
              >
                {content.finalCtaText}
              </a>
            )}
          </div>
        </section>
      );
    }

    // Default solid CTA
    return (
      <section
        key={key}
        className={`${sectionPy} px-4`}
        style={{ backgroundColor: primary }}
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {content.finalCtaHeadline && (
            <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: headingFont }}>
              {content.finalCtaHeadline}
            </h2>
          )}
          {content.finalCtaSubheadline && (
            <p className="text-lg text-white opacity-85">{content.finalCtaSubheadline}</p>
          )}
          {content.finalCtaText && (
            <a
              href={content.finalCtaUrl || '#'}
              className={`inline-flex items-center justify-center px-8 py-4 text-lg font-bold ${borderRadiusClass} transition-opacity hover:opacity-90`}
              style={{ backgroundColor: '#ffffff', color: primary }}
            >
              {content.finalCtaText}
            </a>
          )}
        </div>
      </section>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div
      className="w-full min-h-screen"
      style={{ fontFamily: styles.fonts.body, backgroundColor: background, color: text }}
    >
      {/* Nav bar */}
      <nav
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{
          backgroundColor: isDark ? `${background}e0` : `${background}e0`,
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${primary}20`,
        }}
      >
        <div className="flex items-center gap-2">
          {content.logo
            ? <img src={content.logo} alt="Logo" className="h-8 w-auto" />
            : <span className="font-bold text-lg" style={{ color: text }}>{content.companyName || 'Company'}</span>
          }
        </div>
        {content.ctaText && (
          <a
            href={content.ctaUrl || '#'}
            className={`px-5 py-2 text-sm font-bold text-white ${borderRadiusClass} hover:opacity-90 transition-opacity`}
            style={{ backgroundColor: primary }}
          >
            {content.ctaText}
          </a>
        )}
      </nav>

      {/* Sections */}
      {visibleSections.map((section) => {
        switch (section.type) {
          case 'hero':         return renderHero(section.id);
          case 'features':     return renderFeatures(section.id);
          case 'testimonials': return renderTestimonials(section.id);
          case 'pricing':      return renderPricing(section.id);
          case 'faq':          return renderFaq(section.id);
          case 'cta':          return renderCta(section.id);
          default:             return null;
        }
      })}

      {/* Footer */}
      <footer
        className="px-6 py-8 text-center text-sm"
        style={{ borderTop: `1px solid ${primary}20`, color: secondary }}
      >
        © {new Date().getFullYear()} {content.companyName || 'Your Company'}. All rights reserved.
      </footer>
    </div>
  );
}
