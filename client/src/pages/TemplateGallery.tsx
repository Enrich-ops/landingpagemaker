import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useBuilder } from '@/contexts/BuilderContext';
import { TEMPLATES } from '@/data/templates';
import { useLocation } from 'wouter';
import { Sparkles, ArrowRight, Search, Home, ChevronRight } from 'lucide-react';
import type { Template } from '@shared/template-types';

// Category color map
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Lead Generation': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'Sales':           { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
  'SaaS':            { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  'E-commerce':      { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  'Course/Info Product': { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  'Webinar':         { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  'Services':        { bg: '#f8fafc', text: '#1e3a5f', border: '#cbd5e1' },
  'Real Estate':     { bg: '#f0fdf4', text: '#2d5a27', border: '#86efac' },
  'Health & Wellness': { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  'Events':          { bg: '#fef2f2', text: '#9f1239', border: '#fecdd3' },
};

// Mini visual preview for each template using its color palette
function TemplateMiniPreview({ template }: { template: Template }) {
  const { colors } = template.defaultStyles;
  const isDark = colors.background === '#0f0f1a' || colors.background === '#0f172a';

  return (
    <div
      className="w-full aspect-[4/3] rounded-lg overflow-hidden relative border"
      style={{ backgroundColor: colors.background, borderColor: isDark ? '#334155' : '#e2e8f0' }}
    >
      {/* Nav bar */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ backgroundColor: isDark ? '#1e293b' : colors.background, borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
          <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: isDark ? '#475569' : '#cbd5e1' }} />
        </div>
        <div className="h-4 w-12 rounded" style={{ backgroundColor: colors.primary, opacity: 0.9 }} />
      </div>

      {/* Hero section */}
      <div className="px-3 pt-3 pb-2 flex gap-2">
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 rounded-full w-full" style={{ backgroundColor: isDark ? '#e2e8f0' : colors.text, opacity: 0.85 }} />
          <div className="h-2.5 rounded-full w-4/5" style={{ backgroundColor: isDark ? '#e2e8f0' : colors.text, opacity: 0.85 }} />
          <div className="h-1.5 rounded-full w-full mt-1" style={{ backgroundColor: isDark ? '#94a3b8' : '#94a3b8', opacity: 0.6 }} />
          <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: isDark ? '#94a3b8' : '#94a3b8', opacity: 0.6 }} />
          <div className="mt-2 h-5 w-20 rounded" style={{ backgroundColor: colors.primary }} />
        </div>
        <div className="w-14 h-14 rounded-lg flex-shrink-0" style={{ backgroundColor: colors.primary, opacity: 0.15 }}>
          <div className="w-full h-full rounded-lg" style={{ background: `linear-gradient(135deg, ${colors.primary}40, ${colors.accent || colors.secondary}40)` }} />
        </div>
      </div>

      {/* Feature dots */}
      <div className="px-3 pb-2">
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded p-1.5 space-y-1" style={{ backgroundColor: isDark ? '#1e293b' : `${colors.primary}10` }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.accent || colors.primary, opacity: 0.8 }} />
              <div className="h-1 rounded-full w-full" style={{ backgroundColor: isDark ? '#475569' : '#cbd5e1' }} />
              <div className="h-1 rounded-full w-3/4" style={{ backgroundColor: isDark ? '#475569' : '#cbd5e1' }} />
            </div>
          ))}
        </div>
      </div>

      {/* CTA bar */}
      <div
        className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="h-1.5 w-20 rounded-full bg-white opacity-70" />
        <div className="h-4 w-12 rounded bg-white opacity-90" />
      </div>
    </div>
  );
}

const ALL_CATEGORIES = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

export default function TemplateGallery() {
  const { selectTemplate } = useBuilder();
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const handleSelectTemplate = (template: Template) => {
    selectTemplate(template);
    setLocation('/editor');
  };

  const filtered = TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.bestFor.some(b => b.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-slate-900 text-lg">LandingBuilder</span>
          </div>
          <nav className="flex items-center gap-1 text-sm text-slate-500">
            <button onClick={() => setLocation('/')} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
              <Home className="h-3.5 w-3.5" />
              Home
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-900 font-medium">Templates</span>
          </nav>
        </div>
      </header>

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Template Gallery</h1>
            <p className="mt-1 text-slate-500">
              {TEMPLATES.length} conversion-optimized templates across {ALL_CATEGORIES.length - 1} industries
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mt-5">
          {ALL_CATEGORIES.map(cat => {
            const colors = cat !== 'All' ? CATEGORY_COLORS[cat] : null;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all border"
                style={isActive
                  ? { backgroundColor: colors?.bg ?? '#1e293b', color: colors?.text ?? '#ffffff', borderColor: colors?.border ?? '#1e293b', fontWeight: 600 }
                  : { backgroundColor: '#ffffff', color: '#64748b', borderColor: '#e2e8f0' }
                }
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 text-xs opacity-60">
                    {TEMPLATES.filter(t => t.category === cat).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-medium">No templates match your search</p>
            <p className="text-sm mt-1">Try a different keyword or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((template) => {
              const catColors = CATEGORY_COLORS[template.category] ?? { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
              return (
                <div
                  key={template.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  {/* Mini preview */}
                  <div className="p-3 pb-0">
                    <TemplateMiniPreview template={template} />
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 leading-tight">{template.name}</h3>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 border"
                        style={{ backgroundColor: catColors.bg, color: catColors.text, borderColor: catColors.border }}
                      >
                        {template.category}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{template.description}</p>

                    <div className="flex flex-wrap gap-1 mt-auto">
                      {template.bestFor.slice(0, 3).map((use, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="px-4 pb-4">
                    <Button
                      onClick={() => handleSelectTemplate(template)}
                      className="w-full group-hover:opacity-100 transition-all"
                      style={{ backgroundColor: template.defaultStyles.colors.primary }}
                    >
                      Use Template
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-slate-500">
            All templates are mobile-first, performance-optimized, and designed for maximum conversion
          </p>
        </div>
      </footer>
    </div>
  );
}
