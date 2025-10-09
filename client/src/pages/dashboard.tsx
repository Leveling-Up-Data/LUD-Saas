import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { pb } from "@/lib/pocketbase";
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
  ArrowRight
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/user', pb.authStore.model?.id],
    enabled: pb.authStore.isValid,
  });

  useEffect(() => {
    if (!pb.authStore.isValid) {
      setLocation('/');
      return;
    }

    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your subscription has been activated successfully.",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
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
    uptime: 99.9
  };

  const activities = [
    {
      icon: UserPlus,
      title: "New user registered",
      description: "sarah@example.com joined your platform",
      time: "2 hours ago",
      color: "text-primary"
    },
    {
      icon: CreditCard,
      title: "Payment received",
      description: "Monthly subscription renewed successfully",
      time: "5 hours ago",
      color: "text-secondary"
    },
    {
      icon: Rocket,
      title: "New feature deployed",
      description: "Advanced analytics dashboard is now live",
      time: "1 day ago",
      color: "text-accent"
    },
    {
      icon: Shield,
      title: "Security update",
      description: "Two-factor authentication enabled",
      time: "3 days ago",
      color: "text-chart-4"
    }
  ];

  const quickActions = [
    { icon: UserPlus, title: "Invite Users", href: "#" },
    { icon: Key, title: "API Keys", href: "#" },
    { icon: FileText, title: "Billing History", href: "#" },
    { icon: Settings, title: "Settings", href: "#" }
  ];

  // Calculate trial days remaining
  const trialDaysRemaining = subscription?.trialEnd 
    ? Math.max(0, Math.ceil((new Date(subscription.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const trialProgress = subscription?.trialEnd ? ((14 - trialDaysRemaining) / 14) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, <span className="font-medium text-foreground" data-testid="text-user-name">{user?.name || 'User'}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="flex items-center space-x-2" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold" data-testid="text-user-avatar">
                  {user?.name?.charAt(0) || 'U'}
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
                  <h2 className="text-2xl font-bold text-foreground">Current Subscription</h2>
                  <Badge className="bg-primary/10 text-primary" data-testid="badge-subscription-status">
                    {subscription?.status === 'trialing' ? 'Free Trial' : subscription?.status || 'Active'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Plan</p>
                    <p className="text-lg font-semibold text-foreground capitalize" data-testid="text-subscription-plan">
                      {subscription?.plan || 'No active subscription'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Cost</p>
                    <p className="text-lg font-semibold text-foreground" data-testid="text-subscription-amount">
                      ${subscription ? (subscription.amount / 100).toFixed(2) : '0.00'}
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
                <Button variant="outline" className="flex items-center space-x-2" data-testid="button-upgrade-plan">
                  <ArrowUp className="h-4 w-4" />
                  <span>Upgrade Plan</span>
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="button-manage-subscription">
                  Manage Subscription
                </Button>
              </div>
            </div>

            {/* Trial Status */}
            {subscription?.status === 'trialing' && subscription?.trialEnd && (
              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Gift className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-foreground">Free Trial Active</p>
                      <p className="text-sm text-muted-foreground">
                        {trialDaysRemaining} days remaining until first charge
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground" data-testid="text-trial-days">{trialDaysRemaining}</p>
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
                <Badge variant="secondary" className="text-xs">+12%</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Active Users</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-stat-users">{stats.users.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Database className="h-6 w-6 text-secondary" />
                </div>
                <Badge variant="secondary" className="text-xs">24GB</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Storage Used</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-stat-storage">{stats.storageUsed}%</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <Badge variant="secondary" className="text-xs">Live</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">API Requests</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-stat-requests">{(stats.apiRequests / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-chart-4" />
                </div>
                <Badge variant="secondary" className="text-xs">+8%</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Uptime</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-stat-uptime">{stats.uptime}%</p>
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
                <CardDescription>Latest updates from your platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 pb-4 border-b border-border last:border-0">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <activity.icon className={`h-5 w-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
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
                      data-testid={`button-${action.title.toLowerCase().replace(' ', '-')}`}
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
                    <p className="font-medium text-foreground mb-1">Need Help?</p>
                    <p className="text-sm text-muted-foreground mb-3">Our support team is here for you 24/7</p>
                    <Button size="sm" variant="ghost" className="text-primary hover:text-primary/90 p-0 h-auto font-medium" data-testid="button-contact-support">
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
                    <p className="font-semibold text-foreground" data-testid="text-payment-method">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button variant="outline" data-testid="button-update-card">Update Card</Button>
                  <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" data-testid="button-remove-card">
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { 
//   User, 
//   Mail, 
//   Phone, 
//   Shield, 
//   Bell, 
//   Key, 
//   CreditCard, 
//   Globe,
//   Smartphone,
//   Save,
//   Upload,
//   Crown,
//   Building,
//   Settings as SettingsIcon,
//   Trash2,
//   Eye,
//   EyeOff
// } from "lucide-react";
// import { useAuth } from "@/hooks/useAuth";

// export default function Settings() {
//   const { user } = useAuth();
//   const [showPassword, setShowPassword] = useState(false);
//   const [profileData, setProfileData] = useState({
//     firstName: user?.firstName || "John",
//     lastName: user?.lastName || "Anderson",
//     email: user?.email || "john@acmecorp.com",
//     phoneNumber: "+1 (555) 123-4567",
//     bio: "Business Admin at Acme Corp. Passionate about AI automation and business efficiency.",
//     timezone: "America/New_York",
//     language: "English"
//   });

//   const [securitySettings, setSecuritySettings] = useState({
//     mfaEnabled: false,
//     emailNotifications: true,
//     smsNotifications: false,
//     loginAlerts: true,
//     apiAccess: false
//   });

//   const [businessSettings, setBusinessSettings] = useState({
//     companyName: "Acme Corp",
//     industry: "Technology",
//     teamSize: "10-50",
//     plan: "Business Pro",
//     billingEmail: "billing@acmecorp.com"
//   });

//   return (
//     <div className="min-h-screen bg-[#0A0B14] relative">
//       {/* Background gradients */}
//       <div className="absolute inset-0 bg-gradient-to-br from-[#0A0B14] via-[#1A1B2E] to-[#16213E] opacity-50" />
//       <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
//       <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      
//       <div className="relative z-10 p-8 space-y-8">
//         {/* Header */}
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
//               Settings
//             </h1>
//             <p className="text-slate-400">Manage your profile, account, and business settings</p>
//           </div>
//         </div>

//         {/* Settings Tabs */}
//         <Tabs defaultValue="profile" className="w-full">
//           <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
//             <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
//               <User className="w-4 h-4 mr-2" />
//               Profile
//             </TabsTrigger>
//             <TabsTrigger value="account" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
//               <SettingsIcon className="w-4 h-4 mr-2" />
//               Account
//             </TabsTrigger>
//             <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
//               <Shield className="w-4 h-4 mr-2" />
//               Security
//             </TabsTrigger>
//             <TabsTrigger value="business" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
//               <Building className="w-4 h-4 mr-2" />
//               Business
//             </TabsTrigger>
//           </TabsList>

//           {/* Profile Settings */}
//           <TabsContent value="profile" className="space-y-6">
//             <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 backdrop-blur-xl">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center">
//                   <User className="w-5 h-5 mr-2" />
//                   Profile Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Profile Picture */}
//                 <div className="flex items-center space-x-6">
//                   <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
//                     <User className="w-10 h-10 text-white" />
//                   </div>
//                   <div>
//                     <Button variant="outline" className="mr-3">
//                       <Upload className="w-4 h-4 mr-2" />
//                       Upload Photo
//                     </Button>
//                     <Button variant="ghost" className="text-red-400 hover:text-red-300">
//                       Remove
//                     </Button>
//                   </div>
//                 </div>

//                 {/* Name Fields */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
//                     <Input
//                       id="firstName"
//                       value={profileData.firstName}
//                       onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
//                       className="bg-slate-800/50 border-slate-600 text-white"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
//                     <Input
//                       id="lastName"
//                       value={profileData.lastName}
//                       onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
//                       className="bg-slate-800/50 border-slate-600 text-white"
//                     />
//                   </div>
//                 </div>

//                 {/* Bio */}
//                 <div className="space-y-2">
//                   <Label htmlFor="bio" className="text-slate-300">Bio</Label>
//                   <Textarea
//                     id="bio"
//                     value={profileData.bio}
//                     onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
//                     className="bg-slate-800/50 border-slate-600 text-white min-h-20"
//                     placeholder="Tell us about yourself..."
//                   />
//                 </div>

//                 {/* Preferences */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="timezone" className="text-slate-300">Timezone</Label>
//                     <Input
//                       id="timezone"
//                       value={profileData.timezone}
//                       onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
//                       className="bg-slate-800/50 border-slate-600 text-white"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="language" className="text-slate-300">Language</Label>
//                     <Input
//                       id="language"
//                       value={profileData.language}
//                       onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
//                       className="bg-slate-800/50 border-slate-600 text-white"
//                     />
//                   </div>
//                 </div>

//                 <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
//                   <Save className="w-4 h-4 mr-2" />
//                   Save Profile
//                 </Button>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Account Settings */}
//           <TabsContent value="account" className="space-y-6">
//             <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 backdrop-blur-xl">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center">
//                   <Mail className="w-5 h-5 mr-2" />
//                   Contact Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="email" className="text-slate-300">Email Address</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={profileData.email}
//                     onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
//                     className="bg-slate-800/50 border-slate-600 text-white"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
//                   <Input
//                     id="phone"
//                     value={profileData.phoneNumber}
//                     onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
//                     className="bg-slate-800/50 border-slate-600 text-white"
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 backdrop-blur-xl">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center">
//                   <Key className="w-5 h-5 mr-2" />
//                   Password & Security
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="currentPassword" className="text-slate-300">Current Password</Label>
//                   <div className="relative">
//                     <Input
//                       id="currentPassword"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="Enter current password"
//                       className="bg-slate-800/50 border-slate-600 text-white pr-10"
//                     />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
//                   <Input
//                     id="newPassword"
//                     type="password"
//                     placeholder="Enter new password"
//                     className="bg-slate-800/50 border-slate-600 text-white"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
//                   <Input
//                     id="confirmPassword"
//                     type="password"
//                     placeholder="Confirm new password"
//                     className="bg-slate-800/50 border-slate-600 text-white"
//                   />
//                 </div>
//                 <Button variant="outline">
//                   Update Password
//                 </Button>
//               </CardContent>
//             </Card>

//             <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 backdrop-blur-xl">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center">
//                   <Bell className="w-5 h-5 mr-2" />
//                   Notification Preferences
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-white font-medium">Email Notifications</p>
//                     <p className="text-sm text-slate-400">Receive updates via email</p>
//                   </div>
//                   <Switch
//                     checked={securitySettings.emailNotifications}
//                     onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, emailNotifications: checked }))}
//                   />
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-white font-medium">SMS Notifications</p>
//                     <p className="text-sm text-slate-400">Receive alerts via SMS</p>
//                   </div>
//                   <Switch
//                     checked={securitySettings.smsNotifications}
//                     onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, smsNotifications: checked }))}
//                   />
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-white font-medium">Login Alerts</p>
//                     <p className="text-sm text-slate-400">Get notified of new logins</p>
//                   </div>
//                   <Switch
//                     checked={securitySettings.loginAlerts}
//                     onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))}
//                   />
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Security Settings */}
//           <TabsContent value="security" className="space-y-6">
//             <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 backdrop-blur-xl">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center">
//                   <Shield className="w-5 h-5 mr-2" />
//                   Two-Factor Authentication
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-white font-medium">Enable 2FA</p>
//                     <p className="text-sm text-slate-400">Add an extra layer of security</p>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     {securitySettings.mfaEnabled && (
//                       <Badge className="bg-emerald-500/20 text-emerald-400">Enabled</Badge>
//                     )}
//                     <Switch
//                       checked={securitySettings.mfaEnabled}
//                       onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, mfaEnabled: checked }))}
//                     />
//                   </div>
//                 </div>
//                 {securitySettings.mfaEnabled && (
//                   <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
//                     <p className="text-sm text-slate-300 mb-3">Choose your 2FA method:</p>
//                     <div className="space-y-2">
//                       <Button variant="outline" className="w-full justify-start">
//                         <Smartphone className="w-4 h-4 mr-2" />
//                         SMS Authentication
//                       </Button>
//                       <Button variant="outline" className="w-full justify-start">
//                         <Mail className="w-4 h-4 mr-2" />
//                         Email Authentication
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 backdrop-blur-xl">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center">
//                   <Key className="w-5 h-5 mr-2" />
//                   API Access
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-white font-medium">API Access</p>
//                     <p className="text-sm text-slate-400">Enable programmatic access</p>
//                   </div>
//                   <Switch
//                     checked={securitySettings.apiAccess}
//                     onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, apiAccess: checked }))}
//                   />
//                 </div>
//                 {securitySettings.apiAccess && (
//                   <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
//                     <p className="text-sm text-slate-300 mb-3">API Key:</p>
//                     <div className="flex items-center space-x-2">
//                       <Input
//                         value="mt_••••••••••••••••••••••••••••••••"
//                         readOnly
//                         className="bg-slate-700/50 border-slate-600 text-slate-300"
//                       />
//                       <Button variant="outline" size="sm">
//                         Regenerate
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Business Settings */}
//           <TabsContent value="business" className="space-y-6">
//             <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 backdrop-blur-xl">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center">
//                   <Building className="w-5 h-5 mr-2" />
//                   Business Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="companyName" className="text-slate-300">Company Name</Label>
//                   <Input
//                     id="companyName"
//                     value={businessSettings.companyName}
//                     onChange={(e) => setBusinessSettings(prev => ({ ...prev, companyName: e.target.value }))}
//                     className="bg-slate-800/50 border-slate-600 text-white"
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="industry" className="text-slate-300">Industry</Label>
//                     <Input
//                       id="industry"
//                       value={businessSettings.industry}
//                       onChange={(e) => setBusinessSettings(prev => ({ ...prev, industry: e.target.value }))}
//                       className="bg-slate-800/50 border-slate-600 text-white"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="teamSize" className="text-slate-300">Team Size</Label>
//                     <Input
//                       id="teamSize"
//                       value={businessSettings.teamSize}
//                       onChange={(e) => setBusinessSettings(prev => ({ ...prev, teamSize: e.target.value }))}
//                       className="bg-slate-800/50 border-slate-600 text-white"
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 backdrop-blur-xl">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center">
//                   <Crown className="w-5 h-5 mr-2" />
//                   Subscription & Billing
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
//                   <div>
//                     <p className="text-white font-medium">{businessSettings.plan}</p>
//                     <p className="text-sm text-slate-400">$99/month • 50 agents included</p>
//                   </div>
//                   <Badge className="bg-blue-500/20 text-blue-400">Active</Badge>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="billingEmail" className="text-slate-300">Billing Email</Label>
//                   <Input
//                     id="billingEmail"
//                     type="email"
//                     value={businessSettings.billingEmail}
//                     onChange={(e) => setBusinessSettings(prev => ({ ...prev, billingEmail: e.target.value }))}
//                     className="bg-slate-800/50 border-slate-600 text-white"
//                   />
//                 </div>
//                 <div className="flex space-x-3">
//                   <Button variant="outline">
//                     <CreditCard className="w-4 h-4 mr-2" />
//                     Update Payment Method
//                   </Button>
//                   <Button variant="outline">
//                     View Billing History
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 backdrop-blur-xl">
//               <CardHeader>
//                 <CardTitle className="text-red-400 flex items-center">
//                   <Trash2 className="w-5 h-5 mr-2" />
//                   Danger Zone
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <p className="text-white font-medium mb-2">Delete Business Account</p>
//                   <p className="text-sm text-slate-400 mb-4">
//                     This will permanently delete your business account and all associated data. This action cannot be undone.
//                   </p>
//                   <Button variant="destructive">
//                     <Trash2 className="w-4 h-4 mr-2" />
//                     Delete Account
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }
