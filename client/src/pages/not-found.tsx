import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Did you forget to add the page to the router?
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Starfish</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a></li>
                <li><a href="/pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</a></li>
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
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Support</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Privacy</a></li>
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
