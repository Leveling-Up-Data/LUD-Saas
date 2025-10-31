import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { pb } from "@/lib/pocketbase";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const {
    user,
    isAuthenticated,
    signOut,
    refresh,
    loading: authLoading,
  } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
  });

  // Hydrate form fields once when user becomes available (e.g., after reload)
  useEffect(() => {
    if (user?.id) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    if (
      !confirm(
        "This will permanently close your account and archive basic details. Continue?"
      )
    )
      return;
    setDeleting(true);
    try {
      // Archive minimal info to closed_accounts and then delete the user
      await pb.closeAccount(user.id);
      signOut();
      toast({
        title: "Account closed",
        description: "Your account has been closed and archived.",
      });
      setLocation("/");
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e?.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="h-10 w-1/3 bg-muted animate-pulse rounded" />
          <div className="h-64 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

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
              disabled={deleting}
              onClick={handleDeleteAccount}
              data-testid="button-close-account"
            >
              {deleting ? "Closing..." : "Close Account"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
