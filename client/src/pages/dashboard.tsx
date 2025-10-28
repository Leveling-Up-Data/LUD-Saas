import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
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
import { Footer } from "@/components/footer";
import { pb } from "@/lib/pocketbase";
import { useAuth } from "@/lib/auth-context";
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

// Dashboard home: subscription/trial status, usage, and quick actions
export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
  const [apiDialog, setApiDialog] = useState<{
    open: boolean;
    token: string;
    tokenName: string;
  }>({
    open: false,
    token: "",
    tokenName: "",
  });
  // Small modal used to surface the user's API token (read-only)
  const { toast } = useToast();

  // Fetch the authenticated user's profile and latest subscription (if any)
  const { data: userData, isLoading } = useQuery({
    // Invalidate user data whenever the authenticated user's id changes
    queryKey: ["user", authUser?.id],
    // Only run when we know auth state and have a valid user id
    enabled: isAuthenticated && !authLoading && !!authUser?.id,
    queryFn: async () => {
      try {
        // Safety check: no auth => no data
        if (!authUser?.id) return null;

        // Get user data from PocketBase (auth collection)
        const user = await pb.collection('users').getOne(authUser.id);

        // Try to load most recent subscription for this user; it's fine if none exists
        let subscription: any = null;
        try {
          const subscriptions = await pb
            .collection("subscriptions")
            .getList(1, 1, {
              filter: `userId = "${authUser.id}"`,
              sort: "-created",
            });
          if (subscriptions.items.length > 0) {
            subscription = subscriptions.items[0];
          }
        } catch (_) {
          // No subscription found
        }

        // Recently accepted invites (users who signed up with invitedBy = current user)
        let acceptedInvites: Array<{ id: string; email: string; created: string; name?: string; username?: string; }> = [];
        try {
          const invitedUsers = await pb.collection("users").getList(1, 5, {
            filter: `invitedBy = "${authUser.id}"`,
            sort: "-created",
          });
          acceptedInvites = invitedUsers.items.map((u: any) => ({
            id: u.id,
            email: u.email,
            created: u.created,
            name: u.name,
            username: u.username,
          }));
        } catch (_) {
          // ignore
        }

        // Shape the minimal data the UI needs to render
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
          acceptedInvites,
        };
      } catch (e) {
        console.error("Dashboard data error:", e);
        return null;
      }
    },
  });

  // On first mount, redirect unauthenticated users and show success toast after Stripe redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/");

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
  }, [authLoading, isAuthenticated, setLocation, toast]);

  if (authLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated) return null;

  if (isLoading) {
    // Skeleton while dashboard data loads
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
  // Normalize a friendly name for the header from name/username/email
  const displayName =
    (user?.name && String(user.name).trim()) ||
    (user?.username && String(user.username).trim()) ||
    (user?.email ? String(user.email).split("@")[0] : "") ||
    "User";

  // Build recent activity. Pull last invite (if any) from localStorage
  const lastInviteRaw =
    typeof window !== "undefined" ? localStorage.getItem("lastInvite") : null;
  let inviteActivity: { email?: string; time?: string } | null = null;
  if (lastInviteRaw) {
    try {
      const parsed = JSON.parse(lastInviteRaw);
      const at = parsed?.at ? new Date(parsed.at) : null;
      const rel = at ? timeSince(at) : undefined;
      inviteActivity = { email: parsed?.email, time: rel };
    } catch (_) {
      inviteActivity = null;
    }
  }

  function timeSince(date: Date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals: [number, string][] = [
      [60 * 60 * 24, "day"],
      [60 * 60, "hour"],
      [60, "minute"],
    ];
    for (const [secs, label] of intervals) {
      const v = Math.floor(seconds / secs);
      if (v >= 1) return `${v} ${label}${v > 1 ? "s" : ""} ago`;
    }
    return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
  }

  const accepted = (userData as any)?.acceptedInvites as
    | Array<{ id: string; email: string; created: string; name?: string; username?: string }>
    | undefined;
  const acceptedActivities = (accepted || []).map((u) => ({
    icon: UserPlus,
    title: "Invite accepted",
    description: u.email ? `New account: ${u.email}` : "A user accepted your invite",
    time: timeSince(new Date(u.created)),
    color: "text-primary",
  }));

  // Project metrics (simple illustrative stats)
  const stats = {
    users: (userData as any)?.user ? 1 : 0,
    storageUsed: 11, // % of quota used
    apiRequests: 12500, // requests this month
    uptime: 99.99,
  };

  // Demo recent activity feed (replace with real events if available)
  const activities = [
    inviteActivity && {
      icon: UserPlus,
      title: "Invite sent",
      description: inviteActivity.email
        ? `Invitation sent to ${inviteActivity.email}`
        : "User invitation sent",
      time: inviteActivity.time || "just now",
      color: "text-primary",
    },
    ...acceptedActivities,
    subscription?.status && {
      icon: CreditCard,
      title:
        subscription?.status === "trialing"
          ? "Trial started"
          : "Subscription active",
      description: subscription?.plan
        ? `${subscription.plan} plan`
        : "Subscription updated",
      time: subscription?.currentPeriodEnd
        ? `${timeSince(new Date(subscription.currentPeriodEnd))}`
        : undefined,
      color: "text-secondary",
    },
    {
      icon: Rocket,
      title: "Workspace created",
      description: displayName
        ? `${displayName}'s workspace is ready`
        : "Workspace initialized",
      time: user?.created ? `${timeSince(new Date(user.created))}` : undefined,
      color: "text-accent",
    },
  ].filter(Boolean) as Array<{
    icon: any;
    title: string;
    description: string;
    time?: string;
    color: string;
  }>;

  // Quick actions menu for common tasks
  const quickActions = [
    {
      icon: UserPlus,
      title: "Invite Users",
      href: "/invite",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setLocation("/invite");
      },
    },
    {
      icon: Key,
      title: "API Keys",
      href: "#",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        // Get the test API token from configuration
        const apiToken = getApiTokenById("test-api-token");

        if (apiToken) {
          setApiDialog({
            open: true,
            token: apiToken.token,
            tokenName: apiToken.name,
          });
        } else {
          // Fallback if no token is configured
          setApiDialog({
            open: true,
            token: "sk-test-1234-56789-abcdefghijklmnop",
            tokenName: "Test API Token",
          });
        }
      },
    },
    {
      icon: Settings,
      title: "Settings",
      href: "/settings",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setLocation("/settings");
      },
    },
  ];
  // Calculate trial days remaining from subscription trial end (if present)
  const trialDaysRemaining = subscription?.trialEnd
    ? Math.max(
      0,
      Math.ceil(
        (new Date(subscription.trialEnd).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
      )
    )
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
                  {displayName}
                </span>
              </p>
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
                    <p className="text-sm text-muted-foreground mb-1">
                      Next Billing Date
                    </p>
                    <p
                      className="text-lg font-semibold text-foreground"
                      data-testid="text-next-billing"
                    >
                      {subscription?.currentPeriodEnd
                        ? new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        : "Not set"}
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
                {stats.uptime.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm h-full">
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

          {/* Right Column - Quick Actions & Support */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-sm">
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
                      data-testid={`button-${action.title
                        .toString()
                        .toLowerCase()
                        .replace(" ", "-")}`}
                      onClick={action.onClick}
                    >
                      <div className="flex items-center space-x-3">
                        {action.icon && (
                          <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                        )}
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
                    <Link to="/contact">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:text-primary/90 p-0 h-auto font-medium"
                        data-testid="button-contact-support"
                      >
                        Contact Support <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Method Section */}
        {subscription && (
          <Card className="shadow-sm">
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

      <Footer />

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
