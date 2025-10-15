import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, ArrowRight, Wrench, Hammer, Cpu, Slack } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { pb } from "@/lib/pocketbase";

interface Product {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    features: string[];
    price: string;
    badge?: string;
    popular?: boolean;
}

const products: Product[] = [
    {
        id: "starfish-slack",
        name: "Starfish Slack",
        description: "A Slack-based AI assistant that answers questions from uploaded documents directly inside Slack.",
        icon: <Slack className="w-8 h-8" />,
        features: [
            "Real-time data processing",
            "Advanced tool commands",
            "API access included",
            "24/7 technical support",
            "Custom data integrations"
        ],
        price: "Paid per user per month",
        badge: "Most Popular",
        popular: true
    },
    {
        id: "starfish-whatsapp",
        name: "Starfish WhatsApp",
        description: "AI assistant for WhatsApp that instantly answers questions from your uploaded documents in your chat.",
        icon: <Cpu className="w-8 h-8 text-primary" />,
        features: [
            "Works directly in WhatsApp chats",
            "Real-time document Q&A",
            "API access included",
            "24/7 technical support",
            "Custom data integrations"
        ],
        price: "Paid per user per month",
        badge: "New"
    }
];

export default function Products() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'signin' | 'signup' }>({ open: false, mode: 'signin' });
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
    const [, setLocation] = useLocation();

    const proceedToProduct = (product: Product) => {
        setSelectedProduct(product);
        if (product.id === "starfish-slack") {
            window.location.href = "https://slack.com/oauth/v2/authorize?client_id=8395289183441.9315965017559&scope=app_mentions:read,channels:join,channels:read,chat:write,commands,files:read,files:write,groups:read,im:history,remote_files:read,mpim:history,channels:history,groups:history&user_scope=";
        } else {
            // navigate to pricing within SPA
            setLocation('/pricing');
        }
    };

    const handleProductSelect = (product: Product) => {
        // If user is authenticated proceed, otherwise prompt to sign in
        if (pb.authStore.isValid) {
            proceedToProduct(product);
            return;
        }

        // Not authenticated: store pending and open signin modal
        setPendingProduct(product);
        setAuthModal({ open: true, mode: 'signin' });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                        Our Products
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
                        Powerful data solutions designed to transform your business. From analytics to intelligence,
                        we provide comprehensive tools to help you make data-driven decisions.
                    </p>
                </div>
            </section>

            {/* Auth Modal for required login */}
            <AuthModal
                open={authModal.open}
                mode={authModal.mode}
                onClose={() => setAuthModal({ open: false, mode: 'signin' })}
                onModeChange={(mode) => setAuthModal({ open: true, mode })}
                onSuccess={() => {
                    setAuthModal({ open: false, mode: 'signin' });
                    if (pendingProduct) {
                        proceedToProduct(pendingProduct);
                        setPendingProduct(null);
                    }
                }}
            />

            {/* Products Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {products.map((product) => (
                            <Card
                                key={product.id}
                                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${product.popular ? 'ring-2 ring-primary' : ''
                                    }`}
                            >
                                {product.badge && (
                                    <div className="absolute top-4 right-4">
                                        <Badge
                                            variant={product.popular ? "default" : "secondary"}
                                            className="text-xs"
                                        >
                                            {product.badge}
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="pb-4">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            {product.icon}
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl text-foreground">
                                                {product.name}
                                            </CardTitle>
                                            <p className="text-lg font-semibold text-primary mt-1">
                                                {product.price}
                                            </p>
                                        </div>
                                    </div>
                                    <CardDescription className="text-base text-muted-foreground">
                                        {product.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <ul className="space-y-3 mb-6">
                                        {product.features.map((feature, index) => (
                                            <li key={index} className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => handleProductSelect(product)}
                                        className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 group"
                                        size="lg"
                                    >
                                        Get Started
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                        Ready to Transform Your Data?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Join thousands of businesses already using our products to make better decisions with data.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/pricing">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90"
                            >
                                View Pricing Plans
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}      {/* Footer */}
            <footer className="bg-card border-t border-border py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Starfish</h4>
                            <ul className="space-y-2">
                                <li><a href="/products" className="text-muted-foreground hover:text-foreground transition">Products</a></li>
                                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</Link></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">API</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">About</a></li>
                                <li><a href="https://levelingupdata.com/blog/" className="text-muted-foreground hover:text-foreground transition">Blog</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Careers</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Documentation</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Guides</a></li>
                                <li><Link to="/support" className="text-muted-foreground hover:text-foreground transition">Support</Link></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Status</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                            <ul className="space-y-2">
                                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition">Privacy</Link></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Cookies</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-border pt-8 text-center">
                        <p className="text-muted-foreground text-sm">© Leveling Up Data - {new Date().getFullYear()} All Rights Reserved.</p>
                    </div>
                </div>
            </footer>

        </div>
    );
}
