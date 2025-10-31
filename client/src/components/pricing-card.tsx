import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { Product } from "@shared/schema";

interface PricingCardProps {
  product: Product;
  isPopular?: boolean;
  onSelect: (product: Product) => void;
}

export function PricingCard({ product, isPopular = false, onSelect }: PricingCardProps) {
  const price = (product.price / 100).toFixed(2);
  const features = Array.isArray(product.features) ? product.features : [];

  return (
    <Card className={`relative h-full flex flex-col ${isPopular ? 'border-primary border-2 shadow-xl' : 'border-border'} hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 shadow-lg">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
        <CardDescription>
          {product.name === 'Starter' && 'Perfect for side projects'}
          {product.name === 'Professional' && 'For growing businesses'}
          {product.name === 'Enterprise' && 'For large organizations'}
        </CardDescription>

        <div className="mt-6">
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-bold text-foreground">${price}</span>
            <span className="text-muted-foreground ml-2">/month</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Billed monthly</p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pb-6">
        <ul className="space-y-4 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => onSelect(product)}
          className={isPopular
            ? "w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 shadow-lg mt-6"
            : "w-full mt-6"}
          variant={isPopular ? "default" : "outline"}
          data-testid={`button-select-${product.name.toLowerCase()}`}
        >
          {product.name === 'Enterprise' ? 'Contact Sales' : product.name === 'Free Trial' ? 'Start Free Trial' : 'Get Started'}
        </Button>
      </CardContent>
    </Card>
  );
}
