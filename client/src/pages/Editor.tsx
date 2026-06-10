import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuilder } from '@/contexts/BuilderContext';
import { LandingPagePreview } from '@/components/LandingPagePreview';
import { useLocation } from 'wouter';
import { ArrowLeft, Download, Eye, EyeOff, Palette, FileText, Settings, Globe } from 'lucide-react';
import { generateHTML, downloadHTML } from '@/utils/htmlExporter';
import { toast } from 'sonner';
import { FONT_OPTIONS } from '@shared/template-types';
import BrandScanner, { type BrandData } from '@/components/BrandScanner';
import { exportElementor, downloadElementor } from '@/utils/elementorExporter';

export default function Editor() {
  const { landingPageData, currentTemplate, updateContent, updateStyles, toggleSection } = useBuilder();
  const [, setLocation] = useLocation();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleBrandApply = (brand: BrandData) => {
    // Apply colors (primary = first, secondary = second, accent = third)
    const [c0, c1, c2] = brand.colors;
    const colorPatch: Record<string, string> = {};
    if (c0) colorPatch.primary = c0.hex;
    if (c1) colorPatch.secondary = c1.hex;
    if (c2) colorPatch.accent = c2.hex;
    if (Object.keys(colorPatch).length > 0) {
      updateStyles({ colors: { ...landingPageData!.styles.colors, ...colorPatch } });
    }
    // Apply fonts — first font → heading, second → body
    const [f0, f1] = brand.fonts;
    if (f0 || f1) {
      const fontPatch: Record<string, string> = {};
      if (f0) fontPatch.heading = f0.family;
      if (f1) fontPatch.body = f1.family;
      else if (f0) fontPatch.body = f0.family;
      updateStyles({ fonts: { ...landingPageData!.styles.fonts, ...fontPatch } });
    }
    // Apply logo and site name
    if (brand.logoUrl || brand.ogImage) {
      updateContent({ logo: brand.logoUrl ?? brand.ogImage ?? '' });
    }
    if (brand.siteName) {
      updateContent({ companyName: brand.siteName });
    }
  };

  if (!landingPageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>No Template Selected</CardTitle>
            <CardDescription>Please select a template first</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/templates')}>
              Choose Template
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { content, styles, sections } = landingPageData;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-20">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation('/templates')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-semibold">{currentTemplate?.name || 'Landing Page Editor'}</h1>
                <p className="text-xs text-slate-500">Last saved: {new Date(landingPageData.lastModified).toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScannerOpen(true)}
              >
                <Globe className="h-4 w-4 mr-2" />
                Scan Brand
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  try {
                    downloadElementor(landingPageData, `elementor-${Date.now()}.json`);
                    toast.success('Elementor template exported!');
                  } catch (error) {
                    console.error('Elementor export failed:', error);
                    toast.error('Failed to export Elementor template');
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Elementor
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  try {
                    const html = generateHTML(landingPageData);
                    const filename = `landing-page-${Date.now()}.html`;
                    downloadHTML(html, filename);
                    toast.success('HTML exported successfully!');
                  } catch (error) {
                    console.error('Export failed:', error);
                    toast.error('Failed to export HTML');
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export HTML
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Editor Sidebar */}
        <div className="w-96 border-r bg-white overflow-y-auto">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="style">
                <Palette className="h-4 w-4 mr-2" />
                Style
              </TabsTrigger>
              <TabsTrigger value="sections">
                <Settings className="h-4 w-4 mr-2" />
                Sections
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="p-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      value={content.headline || ''}
                      onChange={(e) => updateContent({ headline: e.target.value })}
                      placeholder="Your compelling headline"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subheadline">Subheadline</Label>
                    <Textarea
                      id="subheadline"
                      value={content.subheadline || ''}
                      onChange={(e) => updateContent({ subheadline: e.target.value })}
                      placeholder="Supporting text"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="heroImage">Hero Image URL</Label>
                    <Input
                      id="heroImage"
                      value={content.heroImage || ''}
                      onChange={(e) => updateContent({ heroImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctaText">CTA Button Text</Label>
                    <Input
                      id="ctaText"
                      value={content.ctaText || ''}
                      onChange={(e) => updateContent({ ctaText: e.target.value })}
                      placeholder="Get Started"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctaUrl">CTA Button URL</Label>
                    <Input
                      id="ctaUrl"
                      value={content.ctaUrl || ''}
                      onChange={(e) => updateContent({ ctaUrl: e.target.value })}
                      placeholder="#signup"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="featuresHeadline">Features Headline</Label>
                    <Input
                      id="featuresHeadline"
                      value={content.featuresHeadline || ''}
                      onChange={(e) => updateContent({ featuresHeadline: e.target.value })}
                      placeholder="What You'll Get"
                    />
                  </div>
                  <p className="text-sm text-slate-500">
                    Feature items are defined in the template. Use the preview to see them.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Final CTA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="finalCtaHeadline">CTA Headline</Label>
                    <Input
                      id="finalCtaHeadline"
                      value={content.finalCtaHeadline || ''}
                      onChange={(e) => updateContent({ finalCtaHeadline: e.target.value })}
                      placeholder="Ready to get started?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="finalCtaText">CTA Button Text</Label>
                    <Input
                      id="finalCtaText"
                      value={content.finalCtaText || ''}
                      onChange={(e) => updateContent({ finalCtaText: e.target.value })}
                      placeholder="Sign Up Now"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Style Tab */}
            <TabsContent value="style" className="p-4 space-y-6">
              {/* Brand Scanner CTA */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div>
                  <p className="text-sm font-medium text-blue-900">Auto-fill from a website</p>
                  <p className="text-xs text-blue-700">Scan any URL to extract colors, fonts &amp; logo</p>
                </div>
                <Button size="sm" variant="outline" className="border-blue-400 text-blue-700 hover:bg-blue-100" onClick={() => setScannerOpen(true)}>
                  <Globe className="h-3.5 w-3.5 mr-1.5" />
                  Scan
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Brand Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={styles.colors.primary}
                        onChange={(e) => updateStyles({ colors: { ...styles.colors, primary: e.target.value } })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={styles.colors.primary}
                        onChange={(e) => updateStyles({ colors: { ...styles.colors, primary: e.target.value } })}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={styles.colors.secondary}
                        onChange={(e) => updateStyles({ colors: { ...styles.colors, secondary: e.target.value } })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={styles.colors.secondary}
                        onChange={(e) => updateStyles({ colors: { ...styles.colors, secondary: e.target.value } })}
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={styles.colors.accent}
                        onChange={(e) => updateStyles({ colors: { ...styles.colors, accent: e.target.value } })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={styles.colors.accent}
                        onChange={(e) => updateStyles({ colors: { ...styles.colors, accent: e.target.value } })}
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Typography</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="headingFont">Heading Font</Label>
                    <Select
                      value={styles.fonts.heading}
                      onValueChange={(value) => updateStyles({ fonts: { ...styles.fonts, heading: value } })}
                    >
                      <SelectTrigger id="headingFont">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bodyFont">Body Font</Label>
                    <Select
                      value={styles.fonts.body}
                      onValueChange={(value) => updateStyles({ fonts: { ...styles.fonts, body: value } })}
                    >
                      <SelectTrigger id="bodyFont">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Spacing & Style</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="spacing">Section Spacing</Label>
                    <Select
                      value={styles.spacing}
                      onValueChange={(value: 'compact' | 'normal' | 'spacious') => updateStyles({ spacing: value })}
                    >
                      <SelectTrigger id="spacing">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="borderRadius">Border Radius</Label>
                    <Select
                      value={styles.borderRadius}
                      onValueChange={(value: 'none' | 'small' | 'medium' | 'large') => updateStyles({ borderRadius: value })}
                    >
                      <SelectTrigger id="borderRadius">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sections Tab */}
            <TabsContent value="sections" className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Toggle Sections</CardTitle>
                  <CardDescription>Show or hide sections in your landing page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sections.map((section) => (
                    <div key={section.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {section.visible ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        )}
                        <Label htmlFor={`section-${section.id}`} className="capitalize">
                          {section.type}
                        </Label>
                      </div>
                      <Switch
                        id={`section-${section.id}`}
                        checked={section.visible}
                        onCheckedChange={() => toggleSection(section.id)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 overflow-auto bg-slate-100">
          <div className="sticky top-0 bg-white border-b p-3 flex items-center justify-center gap-2 z-10">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
            >
              Desktop
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
            >
              Mobile
            </Button>
          </div>
          <div className="p-8 flex justify-center">
            <div
              className={`bg-white shadow-2xl transition-all ${
                previewMode === 'mobile' ? 'max-w-[375px]' : 'w-full max-w-7xl'
              }`}
            >
              <LandingPagePreview data={landingPageData} />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Scanner Modal */}
      <BrandScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onApply={handleBrandApply}
      />
    </div>
  );
}
