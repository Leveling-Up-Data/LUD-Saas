import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Box, Menu, Star, X } from "lucide-react";
import { AuthModal } from "./auth-modal";
import { ApiTokenDialog } from "./api-token-dialog";
import { getApiTokenById } from "@/config/api-tokens";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function Navbar() {
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    mode: "signin" | "signup";
  }>({
    open: false,
    mode: "signup",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiDialog, setApiDialog] = useState<{
    open: boolean;
    token: string;
    tokenName: string;
  }>({
    open: false,
    token: "",
    tokenName: "",
  });

  const { user, isAuthenticated, signOut, loading } = useAuth();
  const [location] = useLocation();
  const showDocs = isAuthenticated;

  const handleSignOut = () => {
    signOut();
    window.location.href = "/";
  };

  const handleApiClick = () => {
    // Get the main API token from configuration
    const apiToken = getApiTokenById("main-api-token");

    if (apiToken) {
      setApiDialog({
        open: true,
        token: apiToken.token,
        tokenName: apiToken.name,
      });
    } else {
      // Fallback if no token is configured
      setApiDialog({
        open: true,
        token: "sk-demo-token-1234567890abcdef",
        tokenName: "Demo API Token",
      });
    }
  };

  return (
    <>
      <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Star className="text-white text-xl" size={20} />
              </div>
              <span className="text-xl font-bold text-foreground">
                Starfish
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/pricing"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Pricing
              </Link>
              {showDocs && (
                <Link
                  to="/docs"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Docs
                </Link>
              )}
              <Link
                to="/products"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Products
              </Link>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <Skeleton className="w-20 h-5 bg-foreground/10" />
                </div>
              ) : (
                isAuthenticated && (
                  <Link
                    to="/dashboard"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    Dashboard
                  </Link>
                )
              )}

              {loading ? (
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-8 h-8 rounded-full bg-foreground/10" />
                  <Skeleton className="w-20 h-9 rounded-md bg-foreground/10" />
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <Link to="/settings">
                      <div
                        className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer"
                        title="Account settings"
                      >
                        {user?.name?.charAt(0) || "U"}
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setAuthModal({ open: true, mode: "signin" })}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-signin"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setAuthModal({ open: true, mode: "signup" })}
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
              <Link
                to="/pricing"
                className="block py-2 text-muted-foreground hover:text-foreground transition"
              >
                Pricing
              </Link>
              {showDocs && (
                <Link
                  to="/docs"
                  className="block py-2 text-muted-foreground hover:text-foreground transition"
                >
                  Docs
                </Link>
              )}
              <Link
                to="/products"
                className="block py-2 text-muted-foreground hover:text-foreground transition"
              >
                Products
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="block py-2 text-muted-foreground hover:text-foreground transition"
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/support"
                className="block py-2 text-muted-foreground hover:text-foreground transition"
              >
                Support
              </Link>
              <button
                onClick={handleApiClick}
                className="block w-full text-left py-2 text-muted-foreground hover:text-foreground transition"
              >
                API
              </button>

              {loading ? (
                <div className="pt-2 space-y-2">
                  <div className="w-full h-9 rounded-md bg-muted animate-pulse" />
                  <div className="w-full h-9 rounded-md bg-muted animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left py-2 text-muted-foreground hover:text-foreground transition"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => setAuthModal({ open: true, mode: "signin" })}
                    className="block w-full text-left py-2 text-muted-foreground hover:text-foreground transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthModal({ open: true, mode: "signup" })}
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
        onClose={() => setAuthModal({ open: false, mode: "signup" })}
        onModeChange={(mode: "signin" | "signup") =>
          setAuthModal({ open: true, mode })
        }
      />

      {/* API Token Dialog */}
      <ApiTokenDialog
        open={apiDialog.open}
        onOpenChange={(open) => setApiDialog({ ...apiDialog, open })}
        token={apiDialog.token}
        tokenName={apiDialog.tokenName}
      />
    </>
  );
}
