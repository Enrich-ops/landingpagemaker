/**
 * Template and content types for the landing page builder
 */

export type SectionType = 'hero' | 'features' | 'testimonials' | 'pricing' | 'faq' | 'cta';

export interface Feature {
  icon?: string;
  title: string;
  description: string;
}

export interface Testimonial {
  name: string;
  role?: string;
  company?: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
  ctaUrl?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ContentFields {
  // Hero section
  headline?: string;
  subheadline?: string;
  heroImage?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  
  // Features section
  featuresHeadline?: string;
  featuresSubheadline?: string;
  features?: Feature[];
  
  // Testimonials section
  testimonialsHeadline?: string;
  testimonials?: Testimonial[];
  
  // Pricing section
  pricingHeadline?: string;
  pricingSubheadline?: string;
  pricingTiers?: PricingTier[];
  
  // FAQ section
  faqHeadline?: string;
  faqs?: FAQItem[];
  
  // Final CTA section
  finalCtaHeadline?: string;
  finalCtaSubheadline?: string;
  finalCtaText?: string;
  finalCtaUrl?: string;
  
  // General
  logo?: string;
  companyName?: string;
}

export interface Section {
  id: string;
  type: SectionType;
  visible: boolean;
  order: number;
}

export interface StyleConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: 'compact' | 'normal' | 'spacious';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  sections: Section[];
  defaultContent: ContentFields;
  defaultStyles: StyleConfig;
  bestFor: string[];
}

export interface LandingPageData {
  templateId: string;
  content: ContentFields;
  styles: StyleConfig;
  sections: Section[];
  lastModified: number;
}

export const DEFAULT_STYLE_CONFIG: StyleConfig = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1e293b',
  },
  fonts: {
    heading: 'system-ui, -apple-system, sans-serif',
    body: 'system-ui, -apple-system, sans-serif',
  },
  spacing: 'normal',
  borderRadius: 'medium',
};

export const FONT_OPTIONS = [
  { value: 'system-ui, -apple-system, sans-serif', label: 'System Default' },
  { value: '"Inter", sans-serif', label: 'Inter' },
  { value: '"Roboto", sans-serif', label: 'Roboto' },
  { value: '"Open Sans", sans-serif', label: 'Open Sans' },
  { value: '"Lato", sans-serif', label: 'Lato' },
  { value: '"Montserrat", sans-serif', label: 'Montserrat' },
  { value: '"Poppins", sans-serif', label: 'Poppins' },
  { value: '"Playfair Display", serif', label: 'Playfair Display' },
  { value: '"Merriweather", serif', label: 'Merriweather' },
  { value: '"Space Mono", monospace', label: 'Space Mono' },
];
