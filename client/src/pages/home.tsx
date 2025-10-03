import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Play, CheckCircle2, Users, Database, Zap, TrendingUp } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";

export default function Home() {
  const [, setLocation] = useLocation();
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'signin' | 'signup' }>({
    open: false,
    mode: 'signup'
  });

  const handleGetStarted = () => {
    setAuthModal({ open: true, mode: 'signup' });
  };

  const handleViewDemo = () => {
    // For demo purposes, redirect to pricing
    setLocation('/pricing');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} />
              <span className="text-sm font-medium">Powered by PocketBase & Stripe</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Build your SaaS product
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> faster than ever</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Complete authentication, subscription management, and payment processing in one powerful platform. Start building in minutes, not weeks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 shadow-lg px-8 py-4 text-lg w-full sm:w-auto"
                data-testid="button-hero-signup"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={handleViewDemo}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg w-full sm:w-auto"
                data-testid="button-view-demo"
              >
                View Demo
                <Play className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Preview */}
      <section id="features" className="py-20 sm:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Everything you need to launch
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From authentication to payments, we've got all the essentials covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Authentication</h3>
              <p className="text-muted-foreground">Secure user registration and login with PocketBase</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Realtime Database</h3>
              <p className="text-muted-foreground">Powerful backend with real-time capabilities built-in</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Stripe Payments</h3>
              <p className="text-muted-foreground">Complete subscription and payment management</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-chart-4/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-chart-4" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">Monitor your users and subscriptions in real-time</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/pricing">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90"
                data-testid="button-see-pricing"
              >
                See Pricing Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">API</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Guides</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Support</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Security</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground text-sm">© 2025 SaaSFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal 
        open={authModal.open} 
        mode={authModal.mode}
        onClose={() => setAuthModal({ open: false, mode: 'signup' })}
        onModeChange={(mode) => setAuthModal({ open: true, mode })}
      />
    </>
  );
}
