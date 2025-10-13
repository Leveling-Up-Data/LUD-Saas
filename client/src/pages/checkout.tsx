import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { pb } from '@/lib/pocketbase';
import { Loader2, Shield, CreditCard, Gift } from 'lucide-react';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('Missing required environment variable: VITE_STRIPE_PUBLIC_KEY');
  console.error('Get this from https://dashboard.stripe.com/apikeys (starts with pk_)');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface CheckoutFormProps {
  clientSecret: string;
  selectedPlan: {
    name: string;
    price: number;
    stripePriceId: string;
  };
}

function CheckoutForm({ clientSecret, selectedPlan }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: pb.authStore.model?.name || '',
    country: 'US',
    postal_code: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Payment system not initialized. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?payment=success`,
          payment_method_data: {
            billing_details: billingDetails
          }
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred while processing your payment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated. Welcome to SaaSFlow!",
        });
        setLocation('/dashboard?payment=success');
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="cardholder-name">Cardholder Name</Label>
          <Input
            id="cardholder-name"
            type="text"
            value={billingDetails.name}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
            placeholder="John Doe"
            required
            data-testid="input-cardholder-name"
          />
        </div>

        <div>
          <Label>Card Information</Label>
          <div className="mt-2 p-3 border border-input rounded-lg bg-background">
            <PaymentElement 
              options={{
                layout: 'tabs',
              }}
            />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <CreditCard className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Visa</span>
            <span className="text-sm text-muted-foreground">Mastercard</span>
            <span className="text-sm text-muted-foreground">American Express</span>
            <span className="text-sm text-muted-foreground">and more</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Billing Country</Label>
            <Select value={billingDetails.country} onValueChange={(value) => setBillingDetails(prev => ({ ...prev, country: value }))}>
              <SelectTrigger data-testid="select-country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="postal-code">ZIP/Postal Code</Label>
            <Input
              id="postal-code"
              type="text"
              value={billingDetails.postal_code}
              onChange={(e) => setBillingDetails(prev => ({ ...prev, postal_code: e.target.value }))}
              placeholder="10001"
              data-testid="input-postal-code"
            />
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 bg-muted/50 border border-border rounded-lg">
          <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-foreground font-medium">Secure Payment</p>
            <p className="text-xs text-muted-foreground">Your payment information is encrypted and secure. We use Stripe for processing.</p>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 text-lg py-6"
        disabled={!stripe || isProcessing}
        data-testid="button-confirm-payment"
      >
        {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Start Free Trial
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By confirming your subscription, you agree to our Terms of Service. Your subscription will automatically renew after the trial period unless cancelled.
      </p>
    </form>
  );
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!pb.authStore.isValid) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with your subscription.",
        variant: "destructive",
      });
      setLocation('/pricing');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const stripePriceId = urlParams.get('price');
    const productId = urlParams.get('product');

    if (!stripePriceId) {
      toast({
        title: "Invalid Request",
        description: "No pricing plan selected. Please choose a plan first.",
        variant: "destructive",
      });
      setLocation('/pricing');
      return;
    }

    // Create subscription
    const createSubscription = async () => {
      try {
        setLoading(true);
        
        // Call PocketBase custom route for subscription creation
        const data = await pb.send('/api/create-subscription', {
          method: 'POST',
          body: {
            userId: pb.authStore.model?.id,
            stripePriceId
          }
        });
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          
          // Fetch product details for display
          const products = await pb.collection('products').getFullList();
          const product = products.find((p: any) => p.stripePriceId === stripePriceId);
          
          if (product) {
            setSelectedPlan({
              name: product.name,
              price: product.price,
              stripePriceId: product.stripePriceId
            });
          }
        } else {
          throw new Error('Failed to create subscription');
        }
      } catch (error: any) {
        toast({
          title: "Subscription Error",
          description: error.message || "Failed to initialize subscription. Please try again.",
          variant: "destructive",
        });
        setLocation('/pricing');
      } finally {
        setLoading(false);
      }
    };

    createSubscription();
  }, [toast, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your subscription...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret || !selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Unable to load checkout. Please try again.</p>
            <Button onClick={() => setLocation('/pricing')} className="mt-4">
              Back to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const priceDisplay = (selectedPlan.price / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground">Start your 14-day free trial today</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <span>Order Summary</span>
                </CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plan</span>
                    <div className="text-right">
                      <span className="font-medium text-foreground">{selectedPlan.name}</span>
                      {selectedPlan.name === 'Professional' && (
                        <Badge className="ml-2 bg-gradient-to-r from-primary to-secondary text-white">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billing Period</span>
                    <span className="text-foreground">Monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Free Trial</span>
                    <span className="text-foreground font-medium text-primary">14 days</span>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-foreground font-semibold text-lg">Total Today</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-foreground">$0.00</span>
                      <p className="text-sm text-muted-foreground">First 14 days free</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    <p>Then ${priceDisplay}/month. Cancel anytime.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Enter your payment details to start your free trial</CardDescription>
              </CardHeader>
              <CardContent>
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                    }
                  }}
                >
                  <CheckoutForm 
                    clientSecret={clientSecret}
                    selectedPlan={selectedPlan}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
