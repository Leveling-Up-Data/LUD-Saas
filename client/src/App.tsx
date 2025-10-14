import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { Chatbot } from "@/components/chatbot";
import Home from "@/pages/home";
import Docs from "@/pages/docs";
import Pricing from "@/pages/pricing";
import Dashboard from "@/pages/dashboard";
import Checkout from "@/pages/checkout";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/docs" component={Docs} />
      <Route path="/dashboard" component={Dashboard} />
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
          <Router />
          <Toaster />
          <Chatbot />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
