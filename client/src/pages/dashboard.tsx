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
  RefreshCw,
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ["user", authUser?.id],
    enabled: isAuthenticated && !authLoading && !!authUser?.id,
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
    refetchInterval: 30000, // Refetch every 30 seconds to keep data fresh
    queryFn: async () => {
      try {
        if (!authUser?.id) return null;

        // Get user data
        const user = await pb.collection("users").getOne(authUser.id);

        // Get subscription if exists
        let subscription: any = null;
        let trialUsage: any = null;
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
        } catch (error) {
          // No subscription found, that's okay
        }

        // Fallback to Free Trial if no paid subscription: use trial_usage collection
        if (!subscription) {
          try {
            const trials = await pb.collection('trial_usage').getList(1, 1, {
              filter: `user_id = "${authUser.id}"`,
              sort: '-created',
            });
            const trial = trials.items[0];
            if (trial) {
              trialUsage = {
                id: trial.id,
                name: (trial as any).name || 'Free Trial',
                request_count: Number((trial as any).total_request_count ?? 0),
                request_total_limit: Number((trial as any).total_request_limit ?? 50),
                trial_start_date: trial.trial_start_date,
                trial_end_date: trial.trial_end_date,
              };
              const now = Date.now();
              const end = trial.trial_end_date ? new Date(trial.trial_end_date).getTime() : 0;
              const inWindow = end > now;
              const used = Number((trial as any).total_request_count ?? 0);
              const limit = Number((trial as any).total_request_limit ?? 50);
              const withinQuota = used < limit;
              // Self-heal incorrect limit values in PocketBase (set to 50 if 0 or missing)
              if (!limit || Number(limit) === 0) {
                try {
                  await pb.collection('trial_usage').update(trial.id, {
                    total_request_limit: 50,
                  });
                  (trial as any).total_request_limit = 50;
                  trialUsage.request_total_limit = 50;
                } catch (_) {
                  // ignore if we cannot update; UI will still treat limit as 50 for gating
                }
              }
              if (inWindow && withinQuota) {
                const planName = (trial as any).name || 'Free Trial';
                // Calculate amount based on plan name
                let amount = 0; // Free Trial default
                if (planName === 'Starter') {
                  amount = 1900; // $19.00 in cents
                } else if (planName === 'Pro' || planName === 'Professional') {
                  amount = 4900; // $49.00 in cents
                }

                subscription = {
                  id: trial.id,
                  plan: planName,
                  status: 'trialing',
                  currentPeriodEnd: trial.trial_end_date,
                  amount: amount,
                  trialEnd: trial.trial_end_date,
                };
              }
            }
          } catch (_) {
            // ignore
          }
        }

        // Get recently accepted invites (users who signed up with invitedBy = current user)
        let acceptedInvites: Array<{
          id: string;
          email: string;
          created: string;
          name?: string;
          username?: string;
        }> = [];
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
        } catch (error) {
          // Ignore if no invited users or field doesn't exist
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
          trialUsage,
          acceptedInvites,
        };
      } catch (e) {
        console.error("Dashboard data error:", e);
        return null;
      }
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/");

    // Check for payment success or trial activation
    const urlParams = new URLSearchParams(window.location.search);
    const isPaymentSuccess = urlParams.get("payment") === "success";
    const isTrialActive = urlParams.get("trial") === "active";

    if (isPaymentSuccess || isTrialActive) {
      const planName = urlParams.get("plan") || (isTrialActive ? "Free Trial" : "Starter"); // Default based on type

      // Get product ID from URL or sessionStorage (for Stripe payment links or free trial)
      const productId = urlParams.get("product") || sessionStorage.getItem('pendingProductId');

      // Create or update trial_usage record with plan name (only for payment success, trial is already created)
      if (isPaymentSuccess) {
        (async () => {
          try {
            const userId = pb.authStore.model?.id;
            if (!userId) return;

            // Check if trial_usage record already exists
            const existingTrials = await pb.collection('trial_usage').getList(1, 1, {
              filter: `user_id = "${userId}"`,
              sort: '-created',
            });

            const now = new Date();
            // For paid plans, set end date to 1 month from now (or calculate based on plan)
            const planEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default

            if (existingTrials.items.length > 0) {
              // Update existing record with plan name
              await pb.collection('trial_usage').update(existingTrials.items[0].id, {
                name: planName,
                trial_start_date: now.toISOString(),
                trial_end_date: planEndDate.toISOString(),
              });
            } else {
              // Create new trial_usage record with plan info
              await pb.collection('trial_usage').create({
                user_id: userId,
                name: planName,
                total_request_count: 0,
                total_request_limit: planName === "Pro" || planName === "Professional" ? 10000 : 1000, // Higher limit for Pro
                trial_start_date: now.toISOString(),
                trial_end_date: planEndDate.toISOString(),
              });
            }

            toast({
              title: "Welcome aboard! 🎉",
              description: `Your ${planName} plan has been activated successfully.`,
            });
          } catch (error: any) {
            console.error('Error creating trial_usage record:', error);
            toast({
              title: "Payment Successful",
              description: "Your subscription has been activated successfully.",
            });
          }
        })();
      }

      // Clean up URL
      window.history.replaceState({}, "", "/dashboard");

      // Redirect to Slack OAuth if product is starfish-slack
      if (productId === "starfish-slack") {
        // Clear the pending product from sessionStorage
        sessionStorage.removeItem('pendingProductId');

        // For free trial, redirect immediately (trial is already created)
        // For payment, wait a moment for the trial_usage record to be created
        const delay = isTrialActive ? 0 : 1000;
        
        setTimeout(async () => {
          try {
            const userId = pb.authStore.model?.id;
            if (!userId) return;

            // Check if user has active subscription or trial
            let hasActivePlan = false;

            // Check for subscription
            try {
              const subscriptions = await pb.collection("subscriptions").getList(1, 1, {
                filter: `userId = "${userId}"`,
                sort: "-created",
              });
              if (subscriptions.items.length > 0) {
                const sub = subscriptions.items[0];
                const status = sub.status;
                if (status === "active" || status === "trialing") {
                  hasActivePlan = true;
                }
              }
            } catch (_) {
              // No subscription found, check trial_usage
            }

            // Check for trial_usage if no subscription
            if (!hasActivePlan) {
              try {
                const trials = await pb.collection('trial_usage').getList(1, 1, {
                  filter: `user_id = "${userId}"`,
                  sort: '-created',
                });
                if (trials.items.length > 0) {
                  const trial = trials.items[0];
                  const endDate = trial.trial_end_date ? new Date(trial.trial_end_date).getTime() : 0;
                  const now = Date.now();
                  if (endDate > now) {
                    hasActivePlan = true;
                  }
                }
              } catch (_) {
                // No trial found
              }
            }

            // Redirect to Slack installation page if user has active plan
            if (hasActivePlan) {
              // Use the Slack installation URL provided by user
              window.location.href = "https://leveling-up-data-dev.slack.com/oauth?client_id=8395289183441.9315965017559&scope=app_mentions%3Aread%2Cchannels%3Ahistory%2Cchannels%3Ajoin%2Cchannels%3Aread%2Cchat%3Awrite%2Ccommands%2Cfiles%3Aread%2Cfiles%3Awrite%2Cgroups%3Ahistory%2Cgroups%3Aread%2Cim%3Ahistory%2Cmpim%3Ahistory%2Cremote_files%3Aread%2Cusers%3Aread%2Cusers%3Aread.email&user_scope=&redirect_uri=&state=&granular_bot_scope=1&single_channel=0&install_redirect=&tracked=1&user_default=0&team=";
            } else {
              // User doesn't have active plan, show message
              toast({
                title: "Plan Required",
                description: "Please choose a plan to proceed with Starfish Slack setup.",
              });
            }
          } catch (error: any) {
            console.error('Error checking active plan:', error);
          }
        }, delay);
      } else if (productId) {
        // Clear the pending product from sessionStorage for other products
        sessionStorage.removeItem('pendingProductId');
      }
    }
  }, [authLoading, isAuthenticated, setLocation, toast]);

  if (authLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated) return null;

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
  const trialUsage = (userData as any)?.trialUsage as
    | {
      id: string;
      name?: string;
      request_count: number;
      request_total_limit: number;
      trial_start_date?: string;
      trial_end_date?: string;
    }
    | undefined;
  const displayName =
    (user?.name && String(user.name).trim()) ||
    (user?.username && String(user.username).trim()) ||
    (user?.email ? String(user.email).split("@")[0] : "") ||
    "User";

  // Project metrics (simple illustrative stats)
  const stats = {
    users: (userData as any)?.user ? 1 : 0,
    storageUsed: 11, // % of quota used
    apiRequests: Number(trialUsage?.request_count || 0),
    uptime: 99.99,
  };

  // (Uptime tracker removed by request; displaying static sample uptime)

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
    if (seconds <= 0) return "just now"; // prevent negative relative times for future dates
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
    | Array<{
      id: string;
      email: string;
      created: string;
      name?: string;
      username?: string;
    }>
    | undefined;
  const acceptedActivities = (accepted || []).map((u) => ({
    icon: UserPlus,
    title: "Invite accepted",
    description: u.email
      ? `New account: ${u.email}`
      : "A user accepted your invite",
    time: timeSince(new Date(u.created)),
    color: "text-primary",
  }));

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
      time:
        subscription?.status === "trialing"
          ? (trialUsage?.trial_start_date
            ? `${timeSince(new Date(trialUsage.trial_start_date))}`
            : "just now")
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
        setApiDialogOpen(true);
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
  // Calculate trial days remaining
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

  function formatCompactNumber(value: number) {
    if (!Number.isFinite(value)) return '0';
    const abs = Math.abs(value);
    if (abs >= 1000000000) return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (abs >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (abs >= 1000) return Math.round(value / 1000) + 'K';
    return String(value);
  }

  const handleManageSubscription = async () => {
    try {
      // If we don't know the plan yet, send user to pricing to pick one
      if (!subscription?.plan) {
        setLocation('/pricing');
        return;
      }

      // Find the matching product to get its Stripe Price ID
      const products = await pb.collection('products').getFullList();

      const product = products.find((p: any) =>
        String(p.name).toLowerCase() === String(subscription.plan).toLowerCase()
      );

      if (product?.stripePriceId) {
        setLocation(`/checkout?product=${product.id}&price=${product.stripePriceId}`);
      } else {
        setLocation('/pricing');
      }
    } catch (error) {
      toast({
        title: 'Unable to open billing',
        description: 'Please try again from the Pricing page.',
        variant: 'destructive',
      });
      setLocation('/pricing');
    }
  };

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center space-x-2"
              data-testid="button-refresh-data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
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
                    {!subscription
                      ? (trialUsage?.name || "None")
                      : subscription?.status === "trialing"
                        ? (subscription?.plan || "Free Trial")
                        : subscription?.status || "Active"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Plan</p>
                    <p
                      className="text-lg font-semibold text-foreground capitalize"
                      data-testid="text-subscription-plan"
                    >
                      {subscription?.plan || trialUsage?.name || "No active plan"}
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
                      {(() => {
                        if (subscription) {
                          return `$${(subscription.amount / 100).toFixed(2)}`;
                        }
                        // Calculate based on trialUsage plan name
                        const planName = trialUsage?.name;
                        if (planName === 'Starter') {
                          return '$19.00';
                        } else if (planName === 'Pro' || planName === 'Professional') {
                          return '$49.00';
                        }
                        return '$0.00';
                      })()}
                    </p>
                  </div>
                </div>

                {trialUsage && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Requests Used</p>
                      <div className="space-y-2">
                        <Progress
                          value={Math.min(100, Math.max(0, (trialUsage.request_count / Math.max(1, trialUsage.request_total_limit)) * 100))}
                          className="h-2 bg-gray-200 [&>div]:bg-blue-500"
                        />
                        <p className="text-sm text-foreground" data-testid="text-trial-requests">
                          {trialUsage.request_count} / {trialUsage.request_total_limit}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Trial Ends</p>
                      <p className="text-lg font-semibold text-foreground" data-testid="text-trial-end">
                        {trialUsage.trial_end_date
                          ? new Date(trialUsage.trial_end_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          : "—"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                {!subscription ? (
                  <Button
                    className="flex items-center space-x-2"
                    data-testid="button-choose-plan"
                    onClick={() => setLocation('/pricing')}
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span>Choose a Plan</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      data-testid="button-upgrade-plan"
                      onClick={() => setLocation('/pricing')}
                    >
                      <ArrowUp className="h-4 w-4" />
                      <span>Upgrade Plan</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground"
                      data-testid="button-manage-subscription"
                      onClick={handleManageSubscription}
                    >
                      Manage Subscription
                    </Button>
                  </>
                )}
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
                        {subscription?.plan === 'Free Trial' ? 'Free Trial Active' : `${subscription?.plan || 'Trial'} Active`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {subscription?.plan === 'Free Trial'
                          ? `${trialDaysRemaining} days remaining until first charge`
                          : `${trialDaysRemaining} days remaining until renewal`}
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
                  <Progress value={trialProgress} className="h-2 bg-gray-200 [&>div]:bg-blue-500" />
                </div>
              </div>
            )}
            {/* Trial Status for trial_usage without subscription */}
            {!subscription && trialUsage && (
              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Gift className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-foreground">
                        {trialUsage.name === 'Free Trial' ? 'Free Trial Active' : `${trialUsage.name || 'Plan'} Active`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          if (!trialUsage.trial_end_date) return 'Active';
                          const endDate = new Date(trialUsage.trial_end_date);
                          const now = new Date();
                          const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                          return trialUsage.name === 'Free Trial'
                            ? `${daysLeft} days remaining until first charge`
                            : `${daysLeft} days remaining until renewal`;
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-2xl font-bold text-foreground"
                      data-testid="text-trial-days-usage"
                    >
                      {(() => {
                        if (!trialUsage.trial_end_date) return '—';
                        const endDate = new Date(trialUsage.trial_end_date);
                        const now = new Date();
                        return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground">days left</p>
                  </div>
                </div>
                {trialUsage.trial_end_date && (
                  <div className="mt-3">
                    <Progress
                      value={(() => {
                        if (!trialUsage.trial_start_date || !trialUsage.trial_end_date) return 0;
                        const start = new Date(trialUsage.trial_start_date).getTime();
                        const end = new Date(trialUsage.trial_end_date).getTime();
                        const now = Date.now();
                        const total = end - start;
                        const elapsed = now - start;
                        return Math.min(100, Math.max(0, (elapsed / total) * 100));
                      })()}
                      className="h-2 bg-gray-200 [&>div]:bg-blue-500"
                    />
                  </div>
                )}
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
                {formatCompactNumber(stats.apiRequests)}
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
              {(() => {
                const isTrial = subscription?.status === "trialing";
                const hasStripe = Boolean(user?.stripeCustomerId);
                const hasPaymentMethod = hasStripe && !isTrial;
                return (
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
                          {isTrial
                            ? "No billing method added"
                            : hasPaymentMethod
                              ? "Billing managed via Stripe"
                              : "No billing method on file"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isTrial
                            ? "You're on a free trial. No billing method required yet."
                            : hasPaymentMethod
                              ? "Open billing to view or update your payment method."
                              : "Add a payment method to start a paid plan."}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      {hasPaymentMethod ? (
                        <Button
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground"
                          data-testid="button-manage-billing"
                          onClick={handleManageSubscription}
                        >
                          Manage Billing
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          data-testid="button-add-payment-method"
                          onClick={() => setLocation('/pricing')}
                        >
                          {isTrial ? 'Choose a Plan' : 'Add Payment Method'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />

      {/* API Token Dialog */}
      <ApiTokenDialog
        open={apiDialogOpen}
        onOpenChange={setApiDialogOpen}
      />
    </div>
  );
}
