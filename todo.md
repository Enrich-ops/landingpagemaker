# Landing Page Builder - Project TODO

## Core Features

### Template System
- [x] Create template data models and TypeScript types
- [x] Implement 5 pre-built templates (hero-focused lead gen, long-form sales, SaaS trial, product showcase, video sales letter)
- [x] Build template gallery interface with preview cards
- [x] Add template selection and loading functionality

### Content Editor
- [x] Build content editor form with fields for headlines, copy, CTAs, images, and offers
- [x] Implement real-time preview panel
- [x] Add section visibility toggle (hero, features, testimonials, pricing, FAQ, CTA)
- [x] Create image upload and URL input functionality (URL input implemented; direct upload deferred)

### Style Customization
- [x] Build style customizer interface for brand colors
- [x] Add font selection system
- [x] Implement logo upload functionality
- [x] Add spacing and border radius preferences
- [x] Apply styles to preview in real-time

### HTML Export
- [x] Create HTML generation functionality
- [x] Implement CSS inlining
- [x] Add HTML/CSS minification
- [x] Optimize and encode images
- [x] Generate single-file download

### Mobile-First Design
- [x] Ensure all templates are mobile-responsive
- [x] Optimize for performance (<3 second load time)
- [x] Test on mobile viewports
- [x] Implement touch-friendly interactions

### UI/UX
- [x] Design and implement main application layout
- [x] Create navigation between template gallery, editor, and export
- [x] Add loading states and error handling
- [x] Implement local storage for draft saving

## Technical Tasks
- [x] Set up project structure and file organization
- [x] Create shared types and utilities
- [x] Implement state management for editor
- [x] Add vitest tests for core functionality (24 tests passing: brand scanner + elementor exporter + auth)
- [x] Optimize bundle size and performance


## Design Resources Website (New Project)
- [x] Create resources data structure from research document
- [x] Build resource gallery with cards for each tool/source
- [x] Implement search functionality
- [x] Add category filtering (Galleries, Tools, Extensions, etc.)
- [x] Create resource detail pages with descriptions and links
- [x] Add tag-based filtering
- [x] Implement favorites/bookmarking system
- [x] Create responsive layout for mobile and desktop
- [x] Add quick copy buttons for URLs
- [x] Test search and filtering functionality

## Website Brand Scanner
- [x] Server-side proxy endpoint to fetch and parse any public URL
- [x] Extract CSS custom properties and computed color values
- [x] Extract Google Fonts / web font declarations from stylesheets
- [x] Extract logo from og:image, apple-touch-icon, or linked SVG/PNG
- [x] Extract favicon as fallback logo
- [x] Return structured brand object: colors[], fonts[], logoUrl, siteName
- [x] Frontend scanner modal with URL input and loading state
- [x] Display extracted brand swatches, fonts, and logo preview
- [x] One-click "Apply to Style Guide" to populate editor style panel
- [x] Handle CORS errors and unreachable sites gracefully

## Elementor JSON Export
- [x] Research Elementor widget JSON schema structure
- [x] Map landing page sections to Elementor widget types
- [x] Build Elementor JSON generator utility
- [x] Support heading, text, button, image, divider, section/column widgets
- [x] Apply brand colors and fonts into Elementor global settings block
- [x] Generate valid .json file for Elementor Template Library import
- [x] Add "Export for Elementor" button in editor export panel
- [x] Test import into Elementor (verify structure is accepted)

## Unbounce-Style Templates (New)
- [x] Template: Webinar Registration (clean white, form-focused, speaker bio, agenda)
- [x] Template: Lead Magnet / Resource Download (split hero, guide mockup, benefit bullets)
- [x] Template: Professional Services / Law Firm (bold dark hero, trust signals, consultation CTA)
- [x] Template: Real Estate (editorial split layout, agent bio, soft green palette)
- [x] Template: SaaS Dark Gradient (purple/teal gradient, app screenshot hero, 3-column features)
- [x] Template: Ecommerce Product (product image left, price + CTA right, reviews, guarantee)
- [x] Template: Health & Wellness (warm tones, before/after, social proof logos, offer box)
- [x] Template: Event / Conference (dark navy, speakers grid, schedule, ticket CTA)
- [x] Update template gallery to display all 13 templates with category filters
- [x] Improve LandingPagePreview to render each template with its own distinct visual style (color-coded mini previews)
