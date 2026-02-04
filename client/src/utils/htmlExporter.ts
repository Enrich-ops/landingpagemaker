import type { LandingPageData } from '@shared/template-types';

/**
 * Generate a complete, optimized HTML file from landing page data
 */
export function generateHTML(data: LandingPageData): string {
  const { content, styles, sections } = data;
  
  const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  
  // Generate CSS
  const css = generateCSS(styles);
  
  // Generate HTML body
  const bodyHTML = visibleSections.map(section => {
    switch (section.type) {
      case 'hero':
        return generateHeroSection(content, styles);
      case 'features':
        return generateFeaturesSection(content, styles);
      case 'testimonials':
        return generateTestimonialsSection(content, styles);
      case 'pricing':
        return generatePricingSection(content, styles);
      case 'faq':
        return generateFAQSection(content, styles);
      case 'cta':
        return generateCTASection(content, styles);
      default:
        return '';
    }
  }).join('\n');
  
  // Combine into full HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHTML(content.subheadline || content.headline || 'Landing Page')}">
  <title>${escapeHTML(content.headline || 'Landing Page')}</title>
  <style>
${css}
  </style>
</head>
<body>
${bodyHTML}
</body>
</html>`;
}

function generateCSS(styles: LandingPageData['styles']): string {
  const spacingMap = {
    compact: { py: '3rem', md: '4rem' },
    normal: { py: '4rem', md: '5rem' },
    spacious: { py: '5rem', md: '7rem' },
  };
  
  const radiusMap = {
    none: '0',
    small: '0.25rem',
    medium: '0.5rem',
    large: '1rem',
  };
  
  const spacing = spacingMap[styles.spacing];
  const radius = radiusMap[styles.borderRadius];
  
  return `
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: ${styles.fonts.body};
  background-color: ${styles.colors.background};
  color: ${styles.colors.text};
  line-height: 1.6;
}

/* Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section {
  padding: ${spacing.py} 1rem;
}

@media (min-width: 768px) {
  .section {
    padding: ${spacing.md} 1rem;
  }
  .container {
    padding: 0 2rem;
  }
}

/* Typography */
h1, h2, h3 {
  font-family: ${styles.fonts.heading};
  font-weight: 700;
  line-height: 1.2;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

@media (min-width: 768px) {
  h1 { font-size: 3.5rem; }
  h2 { font-size: 2.5rem; }
  h3 { font-size: 1.75rem; }
}

p {
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: ${radius};
  transition: opacity 0.2s;
  cursor: pointer;
  border: none;
}

.btn:hover {
  opacity: 0.9;
}

.btn-primary {
  background-color: ${styles.colors.primary};
  color: #ffffff;
}

.btn-outline {
  background-color: transparent;
  color: ${styles.colors.primary};
  border: 2px solid ${styles.colors.primary};
}

/* Grid */
.grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
}

/* Cards */
.card {
  padding: 1.5rem;
  border-radius: ${radius};
  background-color: ${styles.colors.background};
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  border-radius: ${radius};
}

/* Utility Classes */
.text-center { text-align: center; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-12 { margin-bottom: 3rem; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.gap-4 { gap: 1rem; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }

/* Section-specific styles */
.hero-section {
  display: grid;
  gap: 2rem;
  align-items: center;
}

@media (min-width: 768px) {
  .hero-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

.feature-item, .testimonial-item {
  padding: 1.5rem;
}

.pricing-card {
  padding: 2rem;
  border: 2px solid rgba(0,0,0,0.1);
  border-radius: ${radius};
}

.pricing-card.highlighted {
  border-color: ${styles.colors.primary};
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transform: scale(1.05);
}

.star {
  color: ${styles.colors.accent};
  font-size: 1.25rem;
}

.cta-section {
  background-color: ${styles.colors.primary};
  color: #ffffff;
}

.cta-section .btn {
  background-color: #ffffff;
  color: ${styles.colors.primary};
}
`;
}

function generateHeroSection(content: LandingPageData['content'], styles: LandingPageData['styles']): string {
  return `
  <section class="section">
    <div class="container">
      <div class="hero-section">
        <div>
          ${content.logo ? `<img src="${escapeHTML(content.logo)}" alt="Logo" style="height: 3rem; width: auto; margin-bottom: 1.5rem;">` : ''}
          <h1>${escapeHTML(content.headline || 'Your Headline Here')}</h1>
          ${content.subheadline ? `<p style="font-size: 1.25rem; opacity: 0.9;">${escapeHTML(content.subheadline)}</p>` : ''}
          <div class="flex flex-col gap-4" style="margin-top: 1.5rem;">
            ${content.ctaText ? `<a href="${escapeHTML(content.ctaUrl || '#')}" class="btn btn-primary">${escapeHTML(content.ctaText)}</a>` : ''}
            ${content.secondaryCtaText ? `<a href="${escapeHTML(content.secondaryCtaUrl || '#')}" class="btn btn-outline">${escapeHTML(content.secondaryCtaText)}</a>` : ''}
          </div>
        </div>
        ${content.heroImage ? `<div><img src="${escapeHTML(content.heroImage)}" alt="Hero"></div>` : ''}
      </div>
    </div>
  </section>`;
}

function generateFeaturesSection(content: LandingPageData['content'], styles: LandingPageData['styles']): string {
  if (!content.features || content.features.length === 0) return '';
  
  return `
  <section class="section">
    <div class="container">
      ${content.featuresHeadline ? `<h2 class="text-center mb-4">${escapeHTML(content.featuresHeadline)}</h2>` : ''}
      ${content.featuresSubheadline ? `<p class="text-center mb-12" style="font-size: 1.125rem; opacity: 0.8;">${escapeHTML(content.featuresSubheadline)}</p>` : ''}
      <div class="grid grid-3">
        ${content.features.map(feature => `
          <div class="feature-item">
            ${feature.icon ? `<div style="font-size: 2.5rem; margin-bottom: 1rem;">${feature.icon}</div>` : ''}
            <h3>${escapeHTML(feature.title)}</h3>
            <p style="opacity: 0.8;">${escapeHTML(feature.description)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateTestimonialsSection(content: LandingPageData['content'], styles: LandingPageData['styles']): string {
  if (!content.testimonials || content.testimonials.length === 0) return '';
  
  return `
  <section class="section" style="background-color: ${styles.colors.primary}10;">
    <div class="container">
      ${content.testimonialsHeadline ? `<h2 class="text-center mb-12">${escapeHTML(content.testimonialsHeadline)}</h2>` : ''}
      <div class="grid grid-2">
        ${content.testimonials.map(testimonial => `
          <div class="card testimonial-item">
            ${testimonial.rating ? `<div class="mb-4">${'★'.repeat(testimonial.rating).split('').map(() => '<span class="star">★</span>').join('')}</div>` : ''}
            <p style="font-size: 1.125rem; margin-bottom: 1rem;">${escapeHTML(testimonial.content)}</p>
            <div>
              <p style="font-weight: 600; margin-bottom: 0.25rem;">${escapeHTML(testimonial.name)}</p>
              ${testimonial.role ? `<p style="font-size: 0.875rem; opacity: 0.7;">${escapeHTML(testimonial.role)}${testimonial.company ? ` at ${escapeHTML(testimonial.company)}` : ''}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generatePricingSection(content: LandingPageData['content'], styles: LandingPageData['styles']): string {
  if (!content.pricingTiers || content.pricingTiers.length === 0) return '';
  
  return `
  <section class="section">
    <div class="container">
      ${content.pricingHeadline ? `<h2 class="text-center mb-4">${escapeHTML(content.pricingHeadline)}</h2>` : ''}
      ${content.pricingSubheadline ? `<p class="text-center mb-12" style="font-size: 1.125rem; opacity: 0.8;">${escapeHTML(content.pricingSubheadline)}</p>` : ''}
      <div class="grid grid-3">
        ${content.pricingTiers.map(tier => `
          <div class="pricing-card ${tier.highlighted ? 'highlighted' : ''}">
            <h3 class="mb-4">${escapeHTML(tier.name)}</h3>
            <div style="margin-bottom: 1.5rem;">
              <span style="font-size: 2.5rem; font-weight: 700;">${escapeHTML(tier.price)}</span>
              ${tier.period ? `<span style="opacity: 0.7;">${escapeHTML(tier.period)}</span>` : ''}
            </div>
            <ul style="list-style: none; margin-bottom: 1.5rem;">
              ${tier.features.map(feature => `<li style="margin-bottom: 0.75rem;"><span style="color: ${styles.colors.primary}; margin-right: 0.5rem;">✓</span>${escapeHTML(feature)}</li>`).join('')}
            </ul>
            ${tier.ctaText ? `<a href="${escapeHTML(tier.ctaUrl || '#')}" class="btn ${tier.highlighted ? 'btn-primary' : 'btn-outline'}" style="width: 100%; text-align: center;">${escapeHTML(tier.ctaText)}</a>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateFAQSection(content: LandingPageData['content'], styles: LandingPageData['styles']): string {
  if (!content.faqs || content.faqs.length === 0) return '';
  
  return `
  <section class="section" style="background-color: ${styles.colors.secondary}10;">
    <div class="container" style="max-width: 800px;">
      ${content.faqHeadline ? `<h2 class="text-center mb-12">${escapeHTML(content.faqHeadline)}</h2>` : ''}
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${content.faqs.map(faq => `
          <div class="card">
            <h3 style="margin-bottom: 0.75rem;">${escapeHTML(faq.question)}</h3>
            <p style="opacity: 0.8;">${escapeHTML(faq.answer)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateCTASection(content: LandingPageData['content'], styles: LandingPageData['styles']): string {
  return `
  <section class="section cta-section">
    <div class="container text-center" style="max-width: 800px;">
      ${content.finalCtaHeadline ? `<h2 class="mb-4">${escapeHTML(content.finalCtaHeadline)}</h2>` : ''}
      ${content.finalCtaSubheadline ? `<p style="font-size: 1.125rem; opacity: 0.9; margin-bottom: 1.5rem;">${escapeHTML(content.finalCtaSubheadline)}</p>` : ''}
      ${content.finalCtaText ? `<a href="${escapeHTML(content.finalCtaUrl || '#')}" class="btn">${escapeHTML(content.finalCtaText)}</a>` : ''}
    </div>
  </section>`;
}

function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Download the generated HTML as a file
 */
export function downloadHTML(html: string, filename: string = 'landing-page.html') {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
