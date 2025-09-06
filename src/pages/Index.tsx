import React from 'react';
import { VideoUploadContainer } from '@/components/upload/VideoUploadContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Zap, CheckCircle, Users } from 'lucide-react';
import heroImage from '@/assets/hero-subtitles.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">SubTitulador Pro</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">Features</Button>
              <Button variant="ghost" size="sm">Pricing</Button>
              <Button variant="outline" size="sm">Sign In</Button>
              <Button variant="hero" size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="mb-4">
                  <Zap className="w-3 h-3 mr-1" />
                  AI-Powered Subtitle Generation
                </Badge>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Professional
                  <span className="bg-gradient-hero bg-clip-text text-transparent"> Subtitles </span>
                  in Minutes
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Transform your videos with intelligent, professionally-styled subtitles. 
                  Upload, preview, and export in under 5 minutes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="text-lg px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Start Creating Subtitles
                </Button>
                <Button variant="outline" size="lg" className="text-lg">
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">No technical expertise required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Trusted by 10,000+ creators</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="SubTitulador Pro Interface" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
              </div>
              
              {/* Floating Cards */}
              <Card className="absolute -top-4 -left-4 bg-background/95 backdrop-blur">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-sm font-medium">AI Processing</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="absolute -bottom-4 -right-4 bg-background/95 backdrop-blur">
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-success">98%</div>
                    <div className="text-xs text-muted-foreground">Accuracy Rate</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-foreground">
              Upload Your Video to Get Started
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Simply drag and drop your video file below. Our AI will automatically analyze the content 
              and generate professional subtitles with customizable styling options.
            </p>
          </div>
          
          <VideoUploadContainer />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-foreground">
              Why Choose SubTitulador Pro?
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for professionals who demand quality and efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast AI",
                description: "Advanced transcription technology delivers accurate results in minutes, not hours."
              },
              {
                icon: <Play className="w-8 h-8" />,
                title: "Real-Time Preview",
                description: "See exactly how your subtitles will look before rendering. No surprises, no re-work."
              },
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: "Professional Quality",
                description: "Export broadcast-ready videos with perfectly styled, synchronized subtitles."
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="inline-flex p-3 bg-gradient-hero rounded-full text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-hero rounded-md flex items-center justify-center">
                <Play className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-foreground">SubTitulador Pro</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SubTitulador Pro. Professional subtitle generation made simple.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
