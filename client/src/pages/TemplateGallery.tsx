import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBuilder } from '@/contexts/BuilderContext';
import { TEMPLATES } from '@/data/templates';
import { useLocation } from 'wouter';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function TemplateGallery() {
  const { selectTemplate } = useBuilder();
  const [, setLocation] = useLocation();

  const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
    selectTemplate(template);
    setLocation('/editor');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Landing Page Builder</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Choose Your Template
            </h2>
            <p className="text-lg text-slate-600">
              Select from 5 professionally designed, conversion-optimized templates.
              Each template is mobile-first and ready to customize.
            </p>
          </div>
        </div>
      </section>

      {/* Template Grid */}
      <section className="pb-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((template) => (
              <Card key={template.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  {/* Template Preview Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center space-y-2 p-4">
                      <div className="text-sm font-medium text-slate-600">
                        {template.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Preview
                      </div>
                    </div>
                  </div>

                  {/* Best For Tags */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Best for:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {template.bestFor.slice(0, 3).map((use, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full"
                    size="lg"
                  >
                    Use This Template
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container">
          <p className="text-center text-sm text-slate-600">
            All templates are mobile-optimized and designed for maximum conversion
          </p>
        </div>
      </footer>
    </div>
  );
}
