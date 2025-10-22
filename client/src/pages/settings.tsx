import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { pb } from "@/lib/pocketbase";
import { useState } from "react";

export default function SettingsPage() {
  const { user, isAuthenticated, signOut, refresh } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    if (!confirm("This will permanently delete your account. Continue?"))
      return;
    setLoading(true);
    try {
      // Delete any dependent data here if your schema requires it
      // Example: await pb.collection('subscriptions').delete(user.subscriptionId)

      await pb.collection("users").delete(user.id);
      signOut();
      toast({
        title: "Account closed",
        description: "Your account has been deleted.",
      });
      setLocation("/");
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e?.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      const updates: Record<string, any> = {
        name: form.name,
        username: form.username,
      };

      // Update allowed fields directly
      await pb.collection("users").update(user.id, updates);

      // Email changes require a request + email confirmation for non-admin users
      if (form.email && form.email !== user.email) {
        await pb.collection("users").requestEmailChange(form.email);
        toast({
          title: "Verify your new email",
          description: "We sent a confirmation link to your new address.",
        });
      } else {
        toast({ title: "Saved", description: "Profile updated successfully." });
      }

      await refresh();
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <span className="text-sm text-muted-foreground">
                  Joined: {new Date(user!.created).toLocaleString()}
                </span>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={handleDeleteAccount}
              data-testid="button-close-account"
            >
              {loading ? "Closing..." : "Close Account"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
