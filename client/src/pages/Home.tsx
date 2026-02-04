import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Palette, Download, Smartphone, Gauge } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Sparkles,
      title: '5 Conversion-Optimized Templates',
      description: 'Choose from professionally designed templates based on proven conversion best practices',
    },
    {
      icon: Zap,
      title: 'Real-Time Preview',
      description: 'See your changes instantly as you edit content and customize styles',
    },
    {
      icon: Palette,
      title: 'Brand Customization',
      description: 'Apply your client\'s colors, fonts, logos, and spacing preferences with ease',
    },
    {
      icon: Download,
      title: 'One-Click Export',
      description: 'Generate optimized, single-file HTML ready for deployment anywhere',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'All templates are fully responsive and optimized for mobile devices',
    },
    {
      icon: Gauge,
      title: 'Performance Optimized',
      description: 'Lightweight output targeting sub-3-second load times for maximum conversions',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              High-Converting Landing Pages Made Simple
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Build Landing Pages That
              <span className="text-blue-600"> Convert</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto">
              Create professional, mobile-optimized landing pages for your clients in minutes.
              No coding required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => setLocation('/templates')}
              >
                Get Started
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => setLocation('/templates')}
              >
                Browse Templates
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Build High-Converting Pages
              </h2>
              <p className="text-lg text-slate-600">
                Powerful features designed for speed and conversion optimization
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Card key={idx} className="border-2 hover:border-blue-200 transition-colors">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Build Your First Landing Page?
                </h2>
                <p className="text-lg text-slate-600">
                  Choose from 5 professionally designed templates and start customizing
                </p>
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => setLocation('/templates')}
                >
                  Choose a Template
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container">
          <p className="text-center text-sm text-slate-600">
            Landing Page Builder - Create high-converting pages in minutes
          </p>
        </div>
      </footer>
    </div>
  );
}
