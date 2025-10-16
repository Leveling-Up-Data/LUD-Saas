import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { pb } from "@/lib/pocketbase";

export default function Invite() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);

    if (!pb.authStore.isValid) {
        setLocation("/");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (sending) return;
        setSending(true);

        try {
            const localPart = email.split("@")[0] || "user";
            const randomSuffix = Math.random().toString(36).slice(2, 8);
            const username = `${localPart}-${randomSuffix}`.toLowerCase();
            const name = localPart;
            const tempPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

            // 1) Try to create the user (ok if already exists)
            try {
                await pb.collection('users').create({
                    email,
                    username,
                    name,
                    password: tempPassword,
                    passwordConfirm: tempPassword,
                });
            } catch (createErr: any) {
                // If user already exists, proceed to password reset; otherwise bubble up
                const msg = createErr?.message || "";
                if (!/exists|unique|already/i.test(msg)) {
                    throw createErr;
                }
            }

            // 2) Send password reset email for the invited user to set their password
            await pb.collection('users').requestPasswordReset(email);

            toast({
                title: "Invitation sent",
                description: `An email was sent to ${email} with a link to set a password.`,
            });

            try {
                const payload = { email, at: new Date().toISOString(), inviterId: pb.authStore.model?.id };
                localStorage.setItem('lastInvite', JSON.stringify(payload));
            } catch (_) {
                // ignore storage issues
            }
            setEmail("");
        } catch (err: any) {
            toast({
                title: "Invite failed",
                description: err?.message || "Please ensure PocketBase SMTP is configured and try again.",
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Invite a User</CardTitle>
                        <CardDescription>Send an email invitation to join your workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="invite-email">Email</Label>
                                <Input
                                    id="invite-email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    data-testid="input-invite-email"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={sending} data-testid="button-send-invite">
                                    {sending ? "Sending..." : "Send Invite"}
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => setLocation("/dashboard")}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
}


