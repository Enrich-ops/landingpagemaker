export type ResourceCategory = 
  | 'gallery'
  | 'tool'
  | 'extension'
  | 'case-study'
  | 'specialized';

export type ResourceTag = 
  | 'inspiration'
  | 'design-to-code'
  | 'color-extraction'
  | 'font-analysis'
  | 'measurement'
  | 'figma'
  | 'code-export'
  | 'page-capture'
  | 'saas'
  | 'ecommerce'
  | 'conversion'
  | 'mobile'
  | 'components';

export interface DesignResource {
  id: string;
  name: string;
  url: string;
  description: string;
  category: ResourceCategory;
  tags: ResourceTag[];
  collectionSize?: string;
  features: string[];
  bestFor: string;
  isPremium?: boolean;
}

export const designResources: DesignResource[] = [
  // Design Galleries
  {
    id: 'landingfolio',
    name: 'Landingfolio',
    url: 'https://www.landingfolio.com/',
    description: 'Curated landing page designs with extensive component library and filtering options.',
    category: 'gallery',
    tags: ['inspiration', 'components', 'saas'],
    collectionSize: '3,191+ pages',
    features: [
      'Component library (805+ components for Tailwind & Webflow)',
      'Figma components',
      'Filter by device (Desktop/Mobile)',
      'Color filtering',
      'Search functionality',
      'Premium templates available'
    ],
    bestFor: 'Finding modern SaaS and product landing pages with component breakdowns'
  },
  {
    id: 'lapa-ninja',
    name: 'Lapa Ninja',
    url: 'https://www.lapa.ninja/',
    description: 'Largest collection of landing pages with video recordings and historical versions.',
    category: 'gallery',
    tags: ['inspiration', 'mobile', 'components'],
    collectionSize: '7,300+ pages',
    features: [
      'Full website screenshots',
      'Video recordings of sites',
      'Website sections inspiration',
      'OG Images gallery for social media',
      'Responsive website templates',
      'Popular website typefaces/fonts',
      'Past versions of websites',
      'Unlimited filtering and search',
      'Design learning resources and books'
    ],
    bestFor: 'Comprehensive collection with historical versions and educational content'
  },
  {
    id: 'land-book',
    name: 'Land-book',
    url: 'https://land-book.com/',
    description: 'Hand-picked, high-quality website designs updated daily.',
    category: 'gallery',
    tags: ['inspiration'],
    features: [
      'Curated, hand-picked designs',
      'Daily updates',
      'Editorial-style curation'
    ],
    bestFor: 'High-quality, editorial-style curation'
  },
  {
    id: 'landing-gallery',
    name: 'Landing.Gallery',
    url: 'https://www.landing.gallery/',
    description: 'Real production landing pages with emphasis on layouts and UX.',
    category: 'gallery',
    tags: ['inspiration'],
    collectionSize: '1,537+ pages',
    features: [
      'Real, production landing pages',
      'Focus on layouts and UX',
      'Actual deployed pages'
    ],
    bestFor: 'Studying actual deployed landing pages'
  },
  {
    id: 'one-page-love',
    name: 'One Page Love',
    url: 'https://onepagelove.com/',
    description: 'Specialized collection of single-page landing page designs.',
    category: 'gallery',
    tags: ['inspiration'],
    collectionSize: '1,882+ pages',
    features: [
      'Full screenshot of each design',
      'Detailed reviews',
      'Focus on one-page websites'
    ],
    bestFor: 'Single-page landing page designs'
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    url: 'https://dribbble.com/search/landing-page',
    description: 'Design concepts and mockups from creative professionals.',
    category: 'gallery',
    tags: ['inspiration'],
    collectionSize: 'Thousands of designs',
    features: [
      'Design concepts and mockups',
      'Connect with designers',
      'Experimental designs'
    ],
    bestFor: 'Creative concepts, experimental designs, and connecting with designers'
  },
  
  // Case Studies & Specialized
  {
    id: 'unbounce-examples',
    name: 'Unbounce Landing Page Examples',
    url: 'https://unbounce.com/landing-page-examples/',
    description: 'Expert analysis of high-converting landing pages with conversion-focused breakdowns.',
    category: 'case-study',
    tags: ['conversion', 'inspiration'],
    features: [
      'Expert analysis of what makes pages convert',
      'Conversion-focused breakdowns',
      'Best practices from actual campaigns'
    ],
    bestFor: 'Learning conversion optimization principles'
  },
  {
    id: 'saas-landing-page',
    name: 'SaaS Landing Page',
    url: 'https://saaslandingpage.com/',
    description: 'Focused specifically on SaaS product landing pages.',
    category: 'specialized',
    tags: ['saas', 'inspiration'],
    features: [
      'SaaS-specific examples',
      'Articles and inspiration compilations',
      'Industry-focused content'
    ],
    bestFor: 'SaaS product landing page inspiration'
  },
  {
    id: 'framer-gallery',
    name: 'Framer Gallery',
    url: 'https://www.framer.com/gallery/categories/landing-page',
    description: 'Modern, interactive landing pages built with Framer.',
    category: 'specialized',
    tags: ['inspiration'],
    features: [
      'Framer-built landing pages',
      'Modern, interactive designs',
      'Animations and micro-interactions'
    ],
    bestFor: 'Interactive and animated landing page designs'
  },
  
  // Browser Extensions
  {
    id: 'html-to-design',
    name: 'html.to.design',
    url: 'https://html.to.design/',
    description: 'Convert any website into fully editable Figma designs.',
    category: 'extension',
    tags: ['figma', 'design-to-code'],
    features: [
      'Chrome extension',
      'Paste URL to import',
      'Figma-editable output',
      'Layout structure analysis'
    ],
    bestFor: 'Study layouts in Figma, extract spacing/sizing, recreate in your builder'
  },
  {
    id: 'design-assets',
    name: 'DesignAssets',
    url: 'https://vatsalshah.in/tools/design-assets',
    description: 'Extract colors, fonts, images, SVGs, and CSS from any website in one click.',
    category: 'extension',
    tags: ['color-extraction', 'font-analysis'],
    features: [
      'One-click extraction',
      'Colors, fonts, images, SVGs',
      'CSS extraction',
      'Chrome extension'
    ],
    bestFor: 'Quickly grab color palettes and font choices from inspiring sites'
  },
  {
    id: 'divmagic',
    name: 'DivMagic',
    url: 'https://divmagic.com/',
    description: 'Copy design elements and styles from any website.',
    category: 'extension',
    tags: ['color-extraction', 'font-analysis'],
    features: [
      'Color picker',
      'Font copying',
      'Style extraction',
      'Over 1 million elements copied'
    ],
    bestFor: 'Copy specific component styles to recreate in your builder'
  },
  {
    id: 'web-design-scraper',
    name: 'Web Design Scraper',
    url: 'https://chromewebstore.google.com/detail/web-design-scraper/lhhebabfhjommcpnaapcncphgbbjlknd',
    description: 'Extract and inspect web design measurements.',
    category: 'extension',
    tags: ['measurement'],
    features: [
      'Extract design measurements',
      'Spacing analysis',
      'Layout inspection',
      'Chrome extension'
    ],
    bestFor: 'Get exact spacing, sizing, and layout measurements'
  },
  {
    id: 'snable',
    name: 'Snable',
    url: 'https://www.figma.com/community/plugin/1507707678099986490/',
    description: 'Extract styles from web pages into Figma.',
    category: 'extension',
    tags: ['figma'],
    features: [
      'Figma plugin',
      'Copy from extension, paste into plugin',
      'Web to Figma bridge'
    ],
    bestFor: 'Bridge between web inspiration and Figma design process'
  },
  {
    id: 'save-page-we',
    name: 'Save Page WE',
    url: 'https://chromewebstore.google.com/detail/save-page-we/',
    description: 'Save complete web pages as single HTML files.',
    category: 'extension',
    tags: ['page-capture'],
    features: [
      'Captures HTML, CSS, images, fonts',
      'Creates self-contained file',
      'Preserves interactivity',
      'Chrome extension'
    ],
    bestFor: 'Download pages for offline study and code inspection'
  },
  
  // Design-to-Code Tools
  {
    id: 'figma-to-code',
    name: 'Figma to Code',
    url: 'https://www.figma.com/solutions/design-to-code/',
    description: 'Native Figma feature to generate HTML, CSS, and JavaScript from frames.',
    category: 'tool',
    tags: ['design-to-code', 'figma', 'code-export'],
    features: [
      'Built into Figma',
      'AI-powered conversion',
      'Clean code generation',
      'HTML, CSS, JavaScript output'
    ],
    bestFor: 'If you design in Figma first, export clean code'
  },
  {
    id: 'anima',
    name: 'Anima',
    url: 'https://www.animaapp.com/',
    description: 'Turn designs into code from Figma, text prompts, or images.',
    category: 'tool',
    tags: ['design-to-code', 'figma', 'code-export'],
    features: [
      'Figma, text, or image input',
      'Instant transformation',
      'Testable output',
      'Multiple input methods'
    ],
    bestFor: 'Convert design mockups to working HTML/CSS',
    isPremium: true
  },
  {
    id: 'builder-io',
    name: 'Builder.io Visual Copilot',
    url: 'https://www.builder.io/m/design-to-code',
    description: 'AI-powered Figma to code conversion with clean output.',
    category: 'tool',
    tags: ['design-to-code', 'figma', 'code-export'],
    features: [
      'AI-powered conversion',
      'Clean code generation',
      'Figma integration'
    ],
    bestFor: 'Professional-grade code output from designs',
    isPremium: true
  },
  {
    id: 'teleporthq',
    name: 'TeleportHQ',
    url: 'https://teleporthq.io/',
    description: 'Drag-and-drop website builder with code export to multiple frameworks.',
    category: 'tool',
    tags: ['design-to-code', 'code-export'],
    features: [
      'Drag-and-drop builder',
      'Export to HTML, CSS, React, Vue, Angular, Next.js, Gatsby',
      'Visual development',
      'Clean code output'
    ],
    bestFor: 'Build visually, export clean code to study or integrate'
  },
  {
    id: 'freeconvert',
    name: 'FreeConvert Webpage to HTML',
    url: 'https://www.freeconvert.com/webpage-to-html',
    description: 'Convert web pages to HTML files with batch support.',
    category: 'tool',
    tags: ['page-capture'],
    features: [
      'Batch conversion support',
      'Web page to HTML',
      'Quick conversion'
    ],
    bestFor: 'Quick conversion of multiple pages'
  }
];

export const categoryLabels: Record<ResourceCategory, string> = {
  gallery: 'Design Galleries',
  tool: 'Design-to-Code Tools',
  extension: 'Browser Extensions',
  'case-study': 'Case Studies & Examples',
  specialized: 'Specialized Resources'
};

export const tagLabels: Record<ResourceTag, string> = {
  inspiration: 'Inspiration',
  'design-to-code': 'Design to Code',
  'color-extraction': 'Color Extraction',
  'font-analysis': 'Font Analysis',
  measurement: 'Measurements',
  figma: 'Figma',
  'code-export': 'Code Export',
  'page-capture': 'Page Capture',
  saas: 'SaaS',
  ecommerce: 'E-commerce',
  conversion: 'Conversion',
  mobile: 'Mobile',
  components: 'Components'
};
