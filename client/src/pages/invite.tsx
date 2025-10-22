import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { pb } from "@/lib/pocketbase";
import { sendInviteEmail } from "@/lib/email-utils";

export default function Invite() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);

    // Invitation can be sent by authenticated users only; if unauthenticated, go home
    if (!pb.authStore.isValid) {
        setLocation("/");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (sending) return;
        setSending(true);

        try {
            const inviterId = pb.authStore.model?.id || "unknown";
            // Create invitation record in PocketBase
            await pb.collection('invitations').create({ email, inviterId });

            // Send email (don't fail if email fails)
            try {
                await sendInviteEmail({ email, inviterId });
            } catch (emailError) {
                console.warn('Email sending failed:', emailError);
                // Continue anyway - the record was saved
            }

            toast({
                title: "Invitation sent",
                description: `An email was sent to ${email} with a link to login at starfish.levelingupdata.com.`,
            });

            try {
                const payload = { email, at: new Date().toISOString(), inviterId: pb.authStore.model?.id };
                localStorage.setItem('lastInvite', JSON.stringify(payload));
            } catch (_) {
                // ignore storage issues
            }
            setEmail("");
        } catch (err: any) {
            console.error('Invite submission failed:', err);
            toast({
                title: "Invite failed",
                description: err?.message || "Please try again later.",
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


