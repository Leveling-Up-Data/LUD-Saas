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

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'signin' | 'signup' }>({
    open: false,
    mode: 'signup'
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const records = await pb.collection('products').getFullList({
        sort: 'priority'
      });
      return records.map(record => ({
        id: record.id,
        name: record.name,
        price: record.price,
        stripePriceId: record.stripePriceId,
        features: record.features || [],
        maxUsers: record.maxUsers,
        storage: record.storage,
        priority: record.priority
      }));
    }
  });

  const isAuthenticated = pb.authStore.isValid;

  const handleProductSelect = (product: Product) => {
    if (!isAuthenticated) {
      setSelectedProduct(product);
      setAuthModal({ open: true, mode: 'signup' });
      return;
    }

    if (product.name === 'Enterprise') {
      setLocation('/contact');
      return;
    }

    // Redirect to checkout with selected product
    setLocation(`/checkout?product=${product.id}&price=${product.stripePriceId}`);
  };

  const handleAuthSuccess = () => {
    if (selectedProduct) {
      if (selectedProduct.name === 'Enterprise') {
        setLocation('/contact');
      } else {
        setLocation(`/checkout?product=${selectedProduct.id}&price=${selectedProduct.stripePriceId}`);
      }
      setSelectedProduct(null);
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
              Choose the perfect plan for your business. All plans include a 14-day free trial.
            </p>
          </div>

          {products && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-20">
              {products.map((product, index) => (
                <PricingCard
                  key={product.id}
                  product={product}
                  isPopular={product.name === 'Professional'}
                  onSelect={handleProductSelect}
                />
              ))}
            </div>
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
    </>
  );
}
