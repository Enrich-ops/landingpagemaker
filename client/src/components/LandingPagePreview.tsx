import type { LandingPageData } from '@shared/template-types';
import { Star } from 'lucide-react';

interface LandingPagePreviewProps {
  data: LandingPageData;
}

export function LandingPagePreview({ data }: LandingPagePreviewProps) {
  const { content, styles, sections } = data;
  
  const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  
  const getSpacingClass = () => {
    switch (styles.spacing) {
      case 'compact': return 'py-8 md:py-12';
      case 'spacious': return 'py-16 md:py-24';
      default: return 'py-12 md:py-16';
    }
  };
  
  const getBorderRadiusClass = () => {
    switch (styles.borderRadius) {
      case 'none': return 'rounded-none';
      case 'small': return 'rounded-sm';
      case 'large': return 'rounded-xl';
      default: return 'rounded-lg';
    }
  };
  
  const spacingClass = getSpacingClass();
  const borderRadiusClass = getBorderRadiusClass();
  
  return (
    <div 
      className="w-full min-h-screen"
      style={{
        fontFamily: styles.fonts.body,
        backgroundColor: styles.colors.background,
        color: styles.colors.text,
      }}
    >
      {visibleSections.map((section) => {
        switch (section.type) {
          case 'hero':
            return (
              <section key={section.id} className={`${spacingClass} px-4`}>
                <div className="container max-w-6xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      {content.logo && (
                        <img src={content.logo} alt="Logo" className="h-12 w-auto" />
                      )}
                      <h1 
                        className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                        style={{ fontFamily: styles.fonts.heading }}
                      >
                        {content.headline || 'Your Headline Here'}
                      </h1>
                      {content.subheadline && (
                        <p className="text-lg md:text-xl opacity-90">
                          {content.subheadline}
                        </p>
                      )}
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        {content.ctaText && (
                          <a
                            href={content.ctaUrl || '#'}
                            className={`inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white ${borderRadiusClass} hover:opacity-90 transition-opacity`}
                            style={{ backgroundColor: styles.colors.primary }}
                          >
                            {content.ctaText}
                          </a>
                        )}
                        {content.secondaryCtaText && (
                          <a
                            href={content.secondaryCtaUrl || '#'}
                            className={`inline-flex items-center justify-center px-8 py-4 text-lg font-semibold border-2 ${borderRadiusClass} hover:opacity-80 transition-opacity`}
                            style={{ 
                              borderColor: styles.colors.primary,
                              color: styles.colors.primary,
                            }}
                          >
                            {content.secondaryCtaText}
                          </a>
                        )}
                      </div>
                    </div>
                    {content.heroImage && (
                      <div className={`${borderRadiusClass} overflow-hidden`}>
                        <img 
                          src={content.heroImage} 
                          alt="Hero" 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
            
          case 'features':
            return (
              <section 
                key={section.id} 
                className={`${spacingClass} px-4`}
                style={{ backgroundColor: styles.colors.background }}
              >
                <div className="container max-w-6xl mx-auto">
                  {content.featuresHeadline && (
                    <div className="text-center mb-12">
                      <h2 
                        className="text-3xl md:text-4xl font-bold mb-4"
                        style={{ fontFamily: styles.fonts.heading }}
                      >
                        {content.featuresHeadline}
                      </h2>
                      {content.featuresSubheadline && (
                        <p className="text-lg opacity-80">{content.featuresSubheadline}</p>
                      )}
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {content.features?.map((feature, idx) => (
                      <div key={idx} className="space-y-3">
                        {feature.icon && (
                          <div className="text-4xl">{feature.icon}</div>
                        )}
                        <h3 
                          className="text-xl font-semibold"
                          style={{ fontFamily: styles.fonts.heading }}
                        >
                          {feature.title}
                        </h3>
                        <p className="opacity-80">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
            
          case 'testimonials':
            return (
              <section 
                key={section.id} 
                className={`${spacingClass} px-4`}
                style={{ backgroundColor: `${styles.colors.primary}10` }}
              >
                <div className="container max-w-6xl mx-auto">
                  {content.testimonialsHeadline && (
                    <h2 
                      className="text-3xl md:text-4xl font-bold text-center mb-12"
                      style={{ fontFamily: styles.fonts.heading }}
                    >
                      {content.testimonialsHeadline}
                    </h2>
                  )}
                  <div className="grid md:grid-cols-2 gap-8">
                    {content.testimonials?.map((testimonial, idx) => (
                      <div 
                        key={idx} 
                        className={`p-6 ${borderRadiusClass}`}
                        style={{ backgroundColor: styles.colors.background }}
                      >
                        <div className="space-y-4">
                          {testimonial.rating && (
                            <div className="flex gap-1">
                              {Array.from({ length: testimonial.rating }).map((_, i) => (
                                <Star key={i} className="h-5 w-5 fill-current" style={{ color: styles.colors.accent }} />
                              ))}
                            </div>
                          )}
                          <p className="text-lg">{testimonial.content}</p>
                          <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            {testimonial.role && (
                              <p className="text-sm opacity-70">
                                {testimonial.role}
                                {testimonial.company && ` at ${testimonial.company}`}
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
            
          case 'pricing':
            return (
              <section key={section.id} className={`${spacingClass} px-4`}>
                <div className="container max-w-6xl mx-auto">
                  {content.pricingHeadline && (
                    <div className="text-center mb-12">
                      <h2 
                        className="text-3xl md:text-4xl font-bold mb-4"
                        style={{ fontFamily: styles.fonts.heading }}
                      >
                        {content.pricingHeadline}
                      </h2>
                      {content.pricingSubheadline && (
                        <p className="text-lg opacity-80">{content.pricingSubheadline}</p>
                      )}
                    </div>
                  )}
                  <div className="grid md:grid-cols-3 gap-8">
                    {content.pricingTiers?.map((tier, idx) => (
                      <div 
                        key={idx}
                        className={`p-8 ${borderRadiusClass} border-2 ${tier.highlighted ? 'shadow-xl scale-105' : ''}`}
                        style={{ 
                          borderColor: tier.highlighted ? styles.colors.primary : `${styles.colors.text}20`,
                          backgroundColor: tier.highlighted ? `${styles.colors.primary}05` : styles.colors.background,
                        }}
                      >
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold">{tier.price}</span>
                              {tier.period && <span className="opacity-70">{tier.period}</span>}
                            </div>
                          </div>
                          <ul className="space-y-3">
                            {tier.features.map((feature, fidx) => (
                              <li key={fidx} className="flex items-start gap-2">
                                <span style={{ color: styles.colors.primary }}>✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          {tier.ctaText && (
                            <a
                              href={tier.ctaUrl || '#'}
                              className={`block text-center px-6 py-3 font-semibold ${borderRadiusClass} transition-opacity hover:opacity-90`}
                              style={{
                                backgroundColor: tier.highlighted ? styles.colors.primary : 'transparent',
                                color: tier.highlighted ? '#ffffff' : styles.colors.primary,
                                border: tier.highlighted ? 'none' : `2px solid ${styles.colors.primary}`,
                              }}
                            >
                              {tier.ctaText}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
            
          case 'faq':
            return (
              <section 
                key={section.id} 
                className={`${spacingClass} px-4`}
                style={{ backgroundColor: `${styles.colors.secondary}10` }}
              >
                <div className="container max-w-4xl mx-auto">
                  {content.faqHeadline && (
                    <h2 
                      className="text-3xl md:text-4xl font-bold text-center mb-12"
                      style={{ fontFamily: styles.fonts.heading }}
                    >
                      {content.faqHeadline}
                    </h2>
                  )}
                  <div className="space-y-6">
                    {content.faqs?.map((faq, idx) => (
                      <div 
                        key={idx}
                        className={`p-6 ${borderRadiusClass}`}
                        style={{ backgroundColor: styles.colors.background }}
                      >
                        <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                        <p className="opacity-80">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
            
          case 'cta':
            return (
              <section 
                key={section.id} 
                className={`${spacingClass} px-4`}
                style={{ backgroundColor: styles.colors.primary, color: '#ffffff' }}
              >
                <div className="container max-w-4xl mx-auto text-center space-y-6">
                  {content.finalCtaHeadline && (
                    <h2 
                      className="text-3xl md:text-4xl font-bold"
                      style={{ fontFamily: styles.fonts.heading }}
                    >
                      {content.finalCtaHeadline}
                    </h2>
                  )}
                  {content.finalCtaSubheadline && (
                    <p className="text-lg opacity-90">{content.finalCtaSubheadline}</p>
                  )}
                  {content.finalCtaText && (
                    <a
                      href={content.finalCtaUrl || '#'}
                      className={`inline-flex items-center justify-center px-8 py-4 text-lg font-semibold ${borderRadiusClass} transition-opacity hover:opacity-90`}
                      style={{ 
                        backgroundColor: '#ffffff',
                        color: styles.colors.primary,
                      }}
                    >
                      {content.finalCtaText}
                    </a>
                  )}
                </div>
              </section>
            );
            
          default:
            return null;
        }
      })}
    </div>
  );
}
