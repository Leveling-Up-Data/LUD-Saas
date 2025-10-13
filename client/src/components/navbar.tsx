import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Box, Menu, X } from "lucide-react";
import { AuthModal } from "./auth-modal";
import { pb } from "@/lib/pocketbase";
import { useQuery } from "@tanstack/react-query";

export function Navbar() {
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'signin' | 'signup' }>({
    open: false,
    mode: 'signup'
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: authData } = useQuery({
    queryKey: ['user', pb.authStore.model?.id],
    enabled: pb.authStore.isValid,
    queryFn: async () => {
      if (!pb.authStore.model?.id) return null;
      
      // Get user data
      const user = await pb.collection('users').getOne(pb.authStore.model.id);
      
      // Get subscription if exists
      let subscription = null;
      try {
        const subscriptions = await pb.collection('subscriptions').getList(1, 1, {
          filter: `userId = "${pb.authStore.model.id}"`,
          sort: '-created'
        });
        if (subscriptions.items.length > 0) {
          subscription = subscriptions.items[0];
        }
      } catch (error) {
        // No subscription found, that's okay
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          created: user.created
        },
        subscription: subscription ? {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          amount: subscription.amount,
          trialEnd: subscription.trialEnd
        } : undefined
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAuthenticated = pb.authStore.isValid && pb.authStore.model;

  const handleSignOut = () => {
    pb.logout();
    window.location.href = '/';
  };

  return (
    <>
      <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Box className="text-primary-foreground text-xl" size={20} />
              </div>
              <span className="text-xl font-bold text-foreground">Leveling Up Data</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition">
                Pricing
              </Link>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition">
                Features
              </a>
              <a href="#docs" className="text-muted-foreground hover:text-foreground transition">
                Docs
              </a>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {pb.authStore.model?.name?.charAt(0) || 'U'}
                    </div>
                    <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setAuthModal({ open: true, mode: 'signin' })}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-signin"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => setAuthModal({ open: true, mode: 'signup' })}
                    className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90"
                    data-testid="button-signup"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
            
            <button 
              className="md:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link to="/pricing" className="block py-2 text-muted-foreground hover:text-foreground transition">
                Pricing
              </Link>
              <a href="#features" className="block py-2 text-muted-foreground hover:text-foreground transition">
                Features
              </a>
              <a href="#docs" className="block py-2 text-muted-foreground hover:text-foreground transition">
                Docs
              </a>
              
              {isAuthenticated ? (
                <div className="pt-2 space-y-2">
                  <Link to="/dashboard" className="block py-2 text-muted-foreground hover:text-foreground transition">
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="block w-full text-left py-2 text-muted-foreground hover:text-foreground transition">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <button 
                    onClick={() => setAuthModal({ open: true, mode: 'signin' })}
                    className="block w-full text-left py-2 text-muted-foreground hover:text-foreground transition"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setAuthModal({ open: true, mode: 'signup' })}
                    className="block w-full text-left py-2 text-primary font-medium"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal 
        open={authModal.open} 
        mode={authModal.mode}
        onClose={() => setAuthModal({ open: false, mode: 'signup' })}
        onModeChange={(mode: 'signin' | 'signup') => setAuthModal({ open: true, mode })}
      />
    </>
  );
}
