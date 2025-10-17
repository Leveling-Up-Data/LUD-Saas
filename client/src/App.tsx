import { Switch, Route } from "wouter";
import React from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { Chatbot } from "@/components/chatbot";
import Home from "@/pages/home";
import Docs from "@/pages/docs";
import Pricing from "@/pages/pricing";
import Products from "@/pages/products";
import Support from "@/pages/support";
import Privacy from "@/pages/privacy";
import Dashboard from "@/pages/dashboard";
import Checkout from "@/pages/checkout";
import NotFound from "@/pages/not-found";
import SettingsPage from "@/pages/settings";
import Contact from "@/pages/contact";
import Invite from "@/pages/invite";

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorCatcher>
      {children}
    </ErrorCatcher>
  );
}

class ErrorCatcher extends React.Component<React.PropsWithChildren<{}>, { hasError: boolean; message?: string }> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: error?.message || 'Something went wrong' };
  }
  componentDidCatch(error: any, info: any) {
    console.error('UI error:', error, info);
  }
  render() {
    if (this.state?.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">{this.state?.message || 'An unexpected error occurred.'}</p>
            <a href="/" className="underline">Go home</a>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/products" component={Products} />
      <Route path="/support" component={Support} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/docs" component={Docs} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/contact" component={Contact} />
      <Route path="/invite" component={Invite} />
      <Route path="/checkout" component={Checkout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
          <Toaster />
          <Chatbot />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
