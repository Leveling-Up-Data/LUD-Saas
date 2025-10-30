import { useState } from "react";
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

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'signin' | 'signup' }>({
    open: false,
    mode: 'signup'
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const records = await pb.collection('products').getFullList({ sort: 'priority' });
        const mapped = records.map(record => ({
          id: record.id,
          name: record.name,
          price: record.price,
          stripePriceId: record.stripePriceId,
          features: record.features || [],
          maxUsers: record.maxUsers,
          storage: record.storage,
          priority: record.priority
        })) as Product[];

        // Always include Free Trial card at the front if not present
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

        if (Array.isArray(withFreeTrial) && withFreeTrial.length > 0) return withFreeTrial;
      } catch (_) {
        // Fall back to server products below
      }

      // Try fetching directly from Stripe (server proxied) if PocketBase unavailable/empty
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
        return withFreeTrial;
      } catch (_) {
        // Fallback: fetch server-provided static products for display
        try {
          const res2 = await fetch('/api/products');
          if (!res2.ok) throw new Error('Failed to load fallback products');
          const data = await res2.json();
          const mapped = (Array.isArray(data) ? data : []).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stripePriceId: p.stripePriceId || '',
            features: p.features || [],
            maxUsers: p.maxUsers,
            storage: p.storage,
            priority: p.priority,
          })) as Product[];

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
          return withFreeTrial;
        } catch (_) {
          return [] as Product[];
        }
      }
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

      // If trial already exists for user, route to dashboard
      try {
        const existing = await pb.collection('trial_usage').getList(1, 1, {
          filter: `user_id = "${userId}"`,
        });
        if (existing?.items?.length > 0) {
          toast({ title: 'Trial already active', description: 'You can start using your trial now.' });
          setLocation('/dashboard');
          return;
        }
      } catch (_) {
        // ignore and attempt to create
      }

      const now = new Date();
      const end = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      await pb.collection('trial_usage').create({
        user_id: userId,
        request_count: 0,
        total_request_count: 0,
        request_total_limit: 50,
        total_request_limit: 50,
        trial_start_date: now.toISOString(),
        trial_end_date: end.toISOString(),
      });

      toast({ title: 'Free trial started', description: 'You have 2 days and 50 total requests.' });
      setLocation('/dashboard');
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
                const qp = `?product=${selectedProduct.id}&price=${effectivePrice}`;
                setConfirmOpen(false);
                setLocation(`/checkout${qp}`);
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
