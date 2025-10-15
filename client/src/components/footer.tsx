import { Link } from "wouter";

export function Footer() {
    return (
        <footer className="bg-card border-t border-border py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Starfish</h4>
                        <ul className="space-y-2">
                            <li><Link to="/products" className="text-muted-foreground hover:text-foreground transition">Products</Link></li>
                            <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</Link></li>
                            <li>
                                <a
                                    href="https://ocr-api.levelingupdata.com/docs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition"
                                >
                                    API
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition">About</a></li>
                            <li><a href="https://levelingupdata.com/blog/" className="text-muted-foreground hover:text-foreground transition">Blog</a></li>
                            <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li><Link to="/docs" className="text-muted-foreground hover:text-foreground transition">Documentation</Link></li>
                            
                            <li><Link to="/support" className="text-muted-foreground hover:text-foreground transition">Support</Link></li>
                            
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition">Privacy</Link></li>
                            <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition">Security</Link></li>
                            <li><Link to="/support" className="text-muted-foreground hover:text-foreground transition">Cookies</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 text-center">
                    <p className="text-muted-foreground text-sm">
                        © Leveling Up Data - {new Date().getFullYear()} All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
