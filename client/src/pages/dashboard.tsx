import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ApiTokenDialog } from "@/components/api-token-dialog";
import { pb } from "@/lib/pocketbase";
import { useToast } from "@/hooks/use-toast";
import { getApiTokenById } from "@/config/api-tokens";
import { 
  Users, 
  Database, 
  Zap, 
  TrendingUp, 
  ArrowUp, 
  Gift, 
  UserPlus, 
  CreditCard, 
  Rocket, 
  Shield, 
  Bell,
  Settings,
  FileText,
  Key,
  LifeBuoy,
  ArrowRight,
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [apiDialog, setApiDialog] = useState<{ open: boolean; token: string; tokenName: string }>({
    open: false,
    token: '',
    tokenName: ''
  });
  const { toast } = useToast();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", pb.authStore.model?.id],
    enabled: pb.authStore.isValid,
    queryFn: async () => {
      if (!pb.authStore.model?.id) return null;

      // Get user data
      const user = await pb.collection('users').getOne(pb.authStore.model.id);

      // Get subscription if exists
      let subscription = null;
      try {
        const subscriptions = await pb
          .collection("subscriptions")
          .getList(1, 1, {
            filter: `userId = "${pb.authStore.model.id}"`,
            sort: "-created",
          });
        if (subscriptions.items.length > 0) {
          subscription = subscriptions.items[0];
        }
      } catch (error) {
        // No subscription found, that's okay
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          created: user.created,
        },
        subscription: subscription
          ? {
              id: subscription.id,
              plan: subscription.plan,
              status: subscription.status,
              currentPeriodEnd: subscription.currentPeriodEnd,
              amount: subscription.amount,
              trialEnd: subscription.trialEnd,
            }
          : undefined,
      };
    },
  });

  useEffect(() => {
    if (!pb.authStore.isValid) {
      setLocation("/");
      return;
    }

    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment") === "success") {
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your subscription has been activated successfully.",
      });
      // Clean up URL
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [setLocation, toast]);

  if (!pb.authStore.isValid) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = (userData as any)?.user;
  const subscription = (userData as any)?.subscription;

  // Mock data for demo
  const stats = {
    users: 2847,
    storageUsed: 48,
    apiRequests: 487000,
    uptime: 99.9,
  };

  const activities = [
    {
      icon: UserPlus,
      title: "New user registered",
      description: "sarah@example.com joined your platform",
      time: "2 hours ago",
      color: "text-primary",
    },
    {
      icon: CreditCard,
      title: "Payment received",
      description: "Monthly subscription renewed successfully",
      time: "5 hours ago",
      color: "text-secondary",
    },
    {
      icon: Rocket,
      title: "New feature deployed",
      description: "Advanced analytics dashboard is now live",
      time: "1 day ago",
      color: "text-accent",
    },
    {
      icon: Shield,
      title: "Security update",
      description: "Two-factor authentication enabled",
      time: "3 days ago",
      color: "text-chart-4",
    },
  ];

  const quickActions = [
    { 
      icon: UserPlus, 
      title: "Invite Users", 
      href: "#",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        // TODO: Implement invite users functionality
        console.log('Invite Users clicked');
      }
    },
    {
      icon: Key,
      title: (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            // Get the test API token from configuration
            const apiToken = getApiTokenById('test-api-token');
            if (apiToken) {
              setApiDialog({
                open: true,
                token: apiToken.token,
                tokenName: apiToken.name
              });
            } else {
              setApiDialog({
                open: true,
                token: 'sk-test-1234-56789-abcdefghijklmnop',
                tokenName: 'Test API Token'
              });
            }
          }}
          className="underline decoration-dotted text-left focus:outline-none"
        >
          API Keys
        </button>
      ),
      href: "#",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        // Get the test API token from configuration
        const apiToken = getApiTokenById('test-api-token');
        
        if (apiToken) {
          setApiDialog({
            open: true,
            token: apiToken.token,
            tokenName: apiToken.name
          });
        } else {
          // Fallback if no token is configured
          setApiDialog({
            open: true,
            token: 'sk-test-1234-56789-abcdefghijklmnop',
            tokenName: 'Test API Token'
          });
        }
      }
    },
    { 
      icon: FileText, 
      title: "Billing History", 
      href: "#",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        // TODO: Implement billing history functionality
        console.log('Billing History clicked');
      }
    },
    { 
      icon: Settings, 
      title: "Settings", 
      href: "/settings",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        // TODO: Implement settings functionality
        console.log('Settings clicked');
      }
    }
  ];

  // Calculate trial days remaining
  const trialDaysRemaining = subscription?.trialEnd
    ? Math.max(0, Math.ceil((new Date(subscription.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const trialProgress = subscription?.trialEnd
    ? ((14 - trialDaysRemaining) / 14) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1
                className="text-3xl font-bold text-foreground"
                data-testid="text-dashboard-title"
              >
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back,{" "}
                <span
                  className="font-medium text-foreground"
                  data-testid="text-user-name"
                >
                  {user?.name || "User"}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold"
                  data-testid="text-user-avatar"
                >
                  {user?.name?.charAt(0) || "U"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Subscription Status Card */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Current Subscription
                  </h2>
                  <Badge
                    className="bg-primary/10 text-primary"
                    data-testid="badge-subscription-status"
                  >
                    {subscription?.status === "trialing"
                      ? "Free Trial"
                      : subscription?.status || "Active"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Plan</p>
                    <p
                      className="text-lg font-semibold text-foreground capitalize"
                      data-testid="text-subscription-plan"
                    >
                      {subscription?.plan || "No active subscription"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Monthly Cost
                    </p>
                    <p
                      className="text-lg font-semibold text-foreground"
                      data-testid="text-subscription-amount"
                    >
                      $
                      {subscription
                        ? (subscription.amount / 100).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Next Billing Date</p>
                    <p className="text-lg font-semibold text-foreground" data-testid="text-next-billing">
                      {subscription?.currentPeriodEnd
                        ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                        : 'Not set'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  data-testid="button-upgrade-plan"
                >
                  <ArrowUp className="h-4 w-4" />
                  <span>Upgrade Plan</span>
                </Button>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-manage-subscription"
                >
                  Manage Subscription
                </Button>
              </div>
            </div>

            {/* Trial Status */}
            {subscription?.status === "trialing" && subscription?.trialEnd && (
              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Gift className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-foreground">
                        Free Trial Active
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {trialDaysRemaining} days remaining until first charge
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-2xl font-bold text-foreground"
                      data-testid="text-trial-days"
                    >
                      {trialDaysRemaining}
                    </p>
                    <p className="text-xs text-muted-foreground">days left</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={trialProgress} className="h-2" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  +12%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Active Users</p>
              <p
                className="text-3xl font-bold text-foreground"
                data-testid="text-stat-users"
              >
                {stats.users.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Database className="h-6 w-6 text-secondary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  24GB
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Storage Used</p>
              <p
                className="text-3xl font-bold text-foreground"
                data-testid="text-stat-storage"
              >
                {stats.storageUsed}%
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Live
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">API Requests</p>
              <p
                className="text-3xl font-bold text-foreground"
                data-testid="text-stat-requests"
              >
                {(stats.apiRequests / 1000).toFixed(0)}K
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-chart-4" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  +8%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Uptime</p>
              <p
                className="text-3xl font-bold text-foreground"
                data-testid="text-stat-uptime"
              >
                {stats.uptime}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 pb-4 border-b border-border last:border-0"
                    >
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <activity.icon
                          className={`h-5 w-5 ${activity.color}`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Common tasks and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto group hover:bg-muted"
                      data-testid={`button-${action.title.toString().toLowerCase().replace(' ', '-')}`}
<!--                       onClick={action.onClick} -->
                      onClick={() =>
                        action.href && action.href !== "#"
                          ? setLocation(action.href)
                          : undefined
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                        <span className="font-medium">{action.title}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LifeBuoy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">
                      Need Help?
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Our support team is here for you 24/7
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary hover:text-primary/90 p-0 h-auto font-medium"
                      data-testid="button-contact-support"
                    >
                      Contact Support <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Method Section */}
        {subscription && (
          <Card className="mt-8 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Payment Method</CardTitle>
              <CardDescription>Manage your billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p
                      className="font-semibold text-foreground"
                      data-testid="text-payment-method"
                    >
                      •••• •••• •••• 4242
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/2025
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" data-testid="button-update-card">
                    Update Card
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    data-testid="button-remove-card"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Security</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © Leveling Up Data - {new Date().getFullYear()} All Rights
              Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* API Token Dialog */}
      <ApiTokenDialog
        open={apiDialog.open}
        onOpenChange={(open) => setApiDialog({ ...apiDialog, open })}
        token={apiDialog.token}
        tokenName={apiDialog.tokenName}
      />
    </div>
  );
}
