import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/pricing-card";
import { AuthModal } from "@/components/auth-modal";
import { Footer } from "@/components/footer";
import { pb } from "@/lib/pocketbase";
import { Loader2 } from "lucide-react";
import type { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Pricing() {
  const [location, setLocation] = useLocation();
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'signin' | 'signup' }>({
    open: false,
    mode: 'signup'
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [trialActiveDialog, setTrialActiveDialog] = useState(false);

  const { toast } = useToast();

  // Read product parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    if (productId) {
      setSelectedProductId(productId);
    }
  }, [location]);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      let pocketBaseProducts: Product[] = [];

      try {
        // Fetch products from PocketBase products collection
        let records: any[] = [];
        try {
          records = await pb.collection('products').getFullList();
        } catch (_) {
          // If PocketBase products not available, will fall back to API products below
        }

        const mapped = records.map(record => ({
          id: record.id,
          name: record.name,
          price: record.price,
          stripePriceId: record.stripePriceId,
          features: record.features || [],
          maxUsers: record.maxUsers,
          storage: record.storage,
        })) as Product[];

        // Always include Free Trial card at the front if not present
        const hasFreeTrial = mapped.some(p => String(p.name).toLowerCase() === 'free trial');
        pocketBaseProducts = hasFreeTrial
          ? mapped
          : ([
            {
              id: 'free-trial',
              name: 'Free Trial',
              price: 0,
              stripePriceId: '',
              features: ['2-day free trial', '50 total requests'],
              maxUsers: 0,
              storage: '—',
              priority: -1,
            },
            ...mapped,
          ] as Product[]);
      } catch (_) {
        // Fall back to server products below
      }

      // Always try to fetch from API products endpoint for Starter/Professional
      try {
        const res = await fetch('/api/stripe/products');
        if (!res.ok) throw new Error('Failed to load Stripe products');
        const stripeProducts = await res.json();
        const mapped = (Array.isArray(stripeProducts) ? stripeProducts : []).map((p: any) => {
          const monthly = Array.isArray(p.prices)
            ? p.prices.find((pr: any) => pr?.recurring?.interval === 'month') || p.prices[0]
            : null;
          return {
            id: p.id,
            name: p.name,
            price: monthly?.unitAmount ?? 0,
            stripePriceId: monthly?.id ?? '',
            features: [],
            maxUsers: undefined as any,
            storage: undefined as any,
            priority: 99,
          } as Product;
        });

        const hasFreeTrial = mapped.some(p => String(p.name).toLowerCase() === 'free trial');
        const withFreeTrial = hasFreeTrial
          ? mapped
          : ([
            {
              id: 'free-trial',
              name: 'Free Trial',
              price: 0,
              stripePriceId: '',
              features: ['2-day free trial', '50 total requests'],
              maxUsers: 0,
              storage: '—',
              priority: -1,
            },
            ...mapped,
          ] as Product[]);
        // Don't return - continue to fetch from /api/products and merge
      } catch (_) {
        // Stripe API failed, continue to /api/products
      }

      // Always fetch from /api/products to get Starter/Professional
      let apiProducts: Product[] = [];
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          apiProducts = (Array.isArray(data) ? data : []).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stripePriceId: p.stripePriceId || '',
            features: p.features || [],
            maxUsers: p.maxUsers,
            storage: p.storage,
            priority: p.priority ?? 99,
          })) as Product[];
        }
      } catch (_) {
        // API not available
      }

      // Merge all products, avoiding duplicates by-pr name
      let mergedProducts = [...pocketBaseProducts, ...apiProducts];
      mergedProducts = mergedProducts.filter((p, index, self) =>
        index === self.findIndex(t => String(t.name).toLowerCase() === String(p.name).toLowerCase())
      );

      // Ensure Free Trial is first
      const finalHasFreeTrial = mergedProducts.some(p => String(p.name).toLowerCase() === 'free trial');
      if (!finalHasFreeTrial) {
        mergedProducts = [
          {
            id: 'free-trial',
            name: 'Free Trial',
            price: 0,
            stripePriceId: '',
            features: ['2-day free trial', '50 total requests'],
            maxUsers: 0,
            storage: '—',
            priority: -1,
          },
          ...mergedProducts,
        ] as Product[];
      } else {
        const freeTrialIndex = mergedProducts.findIndex(p => String(p.name).toLowerCase() === 'free trial');
        if (freeTrialIndex > 0) {
          const freeTrial = mergedProducts.splice(freeTrialIndex, 1)[0];
          mergedProducts = [freeTrial, ...mergedProducts];
        }
      }

      // Sort by priority
      mergedProducts.sort((a, b) => {
        if (String(a.name).toLowerCase() === 'free trial') return -1;
        if (String(b.name).toLowerCase() === 'free trial') return 1;
        const priorityA = a.priority ?? 99;
        const priorityB = b.priority ?? 99;
        return priorityA - priorityB;
      });

      return mergedProducts.length > 0 ? mergedProducts : [
        {
          id: 'free-trial',
          name: 'Free Trial',
          price: 0,
          stripePriceId: '',
          features: ['2-day free trial', '50 total requests'],
          maxUsers: 0,
          storage: '—',
          priority: -1,
        },
      ] as Product[];
    }
  });

  const isAuthenticated = pb.authStore.isValid;

  async function startFreeTrial() {
    try {
      const userId = pb.authStore.model?.id;
      if (!userId) {
        setAuthModal({ open: true, mode: 'signup' });
        return;
      }

      // If trial already exists for user, show dialog to redirect to Slack installation
      try {
        const existing = await pb.collection('trial_usage').getList(1, 1, {
          filter: `user_id = "${userId}"`,
        });
        if (existing?.items?.length > 0) {
          // Show alert dialog instead of toast
          setTrialActiveDialog(true);
          return;
        }
      } catch (_) {
        // ignore and attempt to create
      }

      const now = new Date();
      const end = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      await pb.collection('trial_usage').create({
        user_id: userId,
        name: 'Free Trial',
        total_request_count: 0,
        total_request_limit: 50,
        trial_start_date: now.toISOString(),
        trial_end_date: end.toISOString(),
      });

      toast({ title: 'Free trial started', description: 'You have 2 days and 50 total requests.' });
      // Include productId in redirect if available so dashboard can redirect to Slack installation
      const productParam = selectedProductId ? `?trial=active&product=${encodeURIComponent(selectedProductId)}` : '?trial=active';
      setLocation(`/dashboard${productParam}`);
    } catch (error: any) {
      const message = error?.message || 'Failed to start free trial.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  }

  const handleProductSelect = (product: Product) => {
    if (!isAuthenticated) {
      setSelectedProduct(product);
      setAuthModal({ open: true, mode: 'signup' });
      return;
    }

    if (product.name === 'Free Trial') {
      void startFreeTrial();
      return;
    }

    if (product.name === 'Enterprise') {
      setLocation('/contact');
      return;
    }
    // Show confirmation of features and terms before redirecting to payment
    setSelectedProduct(product);
    setTermsAccepted(false);
    setConfirmOpen(true);
  };

  const handleAuthSuccess = () => {
    if (selectedProduct) {
      if (selectedProduct.name === 'Free Trial') {
        void startFreeTrial();
      } else if (selectedProduct.name === 'Enterprise') {
        setLocation('/contact');
      } else {
        // After auth, proceed to confirmation modal instead of immediate redirect
        setTermsAccepted(false);
        setConfirmOpen(true);
      }
      // Keep selectedProduct so we can show details and proceed to checkout
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="py-20 sm:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your business. Use our free trial to get started.
            </p>
          </div>

          {products && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-20 items-stretch">
              {products
                .filter((p) => String(p.name).toLowerCase() !== 'enterprise')
                .map((product) => (
                  <div key={product.id} className="h-full">
                    <PricingCard
                      product={product}
                      isPopular={product.name === 'Professional'}
                      onSelect={handleProductSelect}
                    />
                  </div>
                ))}
            </div>
          )}
          {products && products.length === 0 && (
            <div className="mb-20 text-center text-muted-foreground">No plans available right now. Please check back later.</div>
          )}

          {/* Feature Comparison Table */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-foreground text-center mb-12">Compare all features</h3>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]" data-testid="table-feature-comparison">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Features</th>
                      <th className="text-center py-4 px-6 font-semibold text-foreground">Starter</th>
                      <th className="text-center py-4 px-6 font-semibold text-foreground">Professional</th>
                      <th className="text-center py-4 px-6 font-semibold text-foreground">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/50">
                      <td className="py-4 px-6 text-foreground font-medium">Max Users</td>
                      <td className="py-4 px-6 text-center text-muted-foreground">1,000</td>
                      <td className="py-4 px-6 text-center text-muted-foreground">10,000</td>
                      <td className="py-4 px-6 text-center text-muted-foreground">Unlimited</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="py-4 px-6 text-foreground font-medium">Storage</td>
                      <td className="py-4 px-6 text-center text-muted-foreground">5GB</td>
                      <td className="py-4 px-6 text-center text-muted-foreground">50GB</td>
                      <td className="py-4 px-6 text-center text-muted-foreground">500GB</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="py-4 px-6 text-foreground font-medium">API Requests</td>
                      <td className="py-4 px-6 text-center text-muted-foreground">10k/day</td>
                      <td className="py-4 px-6 text-center text-muted-foreground">Unlimited</td>
                      <td className="py-4 px-6 text-center text-muted-foreground">Dedicated</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="py-4 px-6 text-foreground font-medium">Email Support</td>
                      <td className="py-4 px-6 text-center">✓</td>
                      <td className="py-4 px-6 text-center">✓</td>
                      <td className="py-4 px-6 text-center">✓</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="py-4 px-6 text-foreground font-medium">Priority Support</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✓</td>
                      <td className="py-4 px-6 text-center">✓</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="py-4 px-6 text-foreground font-medium">24/7 Phone Support</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✓</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="py-4 px-6 text-foreground font-medium">Custom Domains</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✓</td>
                      <td className="py-4 px-6 text-center">✓</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="py-4 px-6 text-foreground font-medium">Advanced Analytics</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✓</td>
                      <td className="py-4 px-6 text-center">✓</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="py-4 px-6 text-foreground font-medium">White-label</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✓</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="py-4 px-6 text-foreground font-medium">SLA Guarantee</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Contact Us Section */}
          <div className="mt-20 text-center">
            <h3 className="text-3xl font-bold text-foreground mb-4">Need help choosing a plan?</h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our team is here to help you find the perfect solution for your business needs.
            </p>
            <Button
              size="lg"
              onClick={() => setLocation('/contact')}
              className="px-8 py-3 text-lg"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <AuthModal
        open={authModal.open}
        mode={authModal.mode}
        onClose={() => {
          setAuthModal({ open: false, mode: 'signup' });
          setSelectedProduct(null);
        }}
        onModeChange={(mode) => setAuthModal({ open: true, mode })}
        onSuccess={handleAuthSuccess}
      />

      {/* Plan Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedProduct ? `${selectedProduct.name} plan` : 'Plan details'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const features = Array.isArray(selectedProduct?.features)
                ? (selectedProduct!.features as any[]).map(String)
                : [] as string[];
              return features.length > 0 ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Included features:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                    {features.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })()}
            <label className="flex items-start gap-3 text-sm">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(Boolean(v))} />
              <span className="text-muted-foreground">
                I have read and agree to the{' '}
                <Link to="/terms-and-conditions">
                  <span className="text-primary hover:underline">Terms and Conditions</span>
                </Link>.
              </span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              disabled={!termsAccepted || !selectedProduct}
              onClick={() => {
                if (!selectedProduct) { setConfirmOpen(false); return; }
                // Redirect to Stripe Payment Links for Starter and Professional
                // Store selectedProductId in sessionStorage so dashboard can access it after payment
                if (selectedProductId) {
                  sessionStorage.setItem('pendingProductId', selectedProductId);
                }
                const name = String(selectedProduct.name).toLowerCase();
                if (name === 'starter') {
                  window.location.href = 'https://buy.stripe.com/test_4gM5kwbp37Un5NhbN4co000';
                  return;
                }
                if (name === 'professional' || name === 'pro') {
                  window.location.href = 'https://buy.stripe.com/test_4gM00c64Jb6zfnR18qco001';
                  return;
                }
                // Default: proceed to in-app checkout flow
                const effectivePrice = selectedProduct.stripePriceId && String(selectedProduct.stripePriceId).trim().length > 0
                  ? selectedProduct.stripePriceId
                  : 'price_demo';
                // Include the selected product ID from products page if available
                const productParam = selectedProductId ? `&selectedProduct=${encodeURIComponent(selectedProductId)}` : '';
                const qp = `?product=${selectedProduct.id}&price=${effectivePrice}${productParam}`;
                setConfirmOpen(false);
                setLocation(`/checkout${qp}`);
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trial Already Active Alert Dialog */}
      <AlertDialog open={trialActiveDialog} onOpenChange={setTrialActiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trial already active</AlertDialogTitle>
            <AlertDialogDescription>
              You can start using your trial now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTrialActiveDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setTrialActiveDialog(false);
                // Only redirect to Slack if product is starfish-slack
                if (selectedProductId === "starfish-slack") {
                  // Open Slack installation page in new tab
                  const slackInstallUrl = "https://leveling-up-data-dev.slack.com/oauth?client_id=8395289183441.9315965017559&scope=app_mentions%3Aread%2Cchannels%3Ahistory%2Cchannels%3Ajoin%2Cchannels%3Aread%2Cchat%3Awrite%2Ccommands%2Cfiles%3Aread%2Cfiles%3Awrite%2Cgroups%3Ahistory%2Cgroups%3Aread%2Cim%3Ahistory%2Cmpim%3Ahistory%2Cremote_files%3Aread%2Cusers%3Aread%2Cusers%3Aread.email&user_scope=&redirect_uri=&state=&granular_bot_scope=1&single_channel=0&install_redirect=&tracked=1&user_default=0&team=";
                  window.open(slackInstallUrl, '_blank', 'noopener,noreferrer');
                } else {
                  // For other products, just redirect to dashboard
                  const productParam = selectedProductId ? `?trial=active&product=${encodeURIComponent(selectedProductId)}` : '?trial=active';
                  setLocation(`/dashboard${productParam}`);
                }
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
