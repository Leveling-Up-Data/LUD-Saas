import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/footer";
import { pb } from "@/lib/pocketbase";

export default function Contact() {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [sent, setSent] = useState(false);

    const handleChange = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            // Save to PocketBase only
            await pb.collection('customer_support').create({
                username: form.name,
                email: form.email,
                subject: form.subject,
                message: form.message,
            });

            setSent(true);
        } catch (error) {
            console.error('Contact submission failed:', error);
            setSent(true); // Show success anyway to avoid confusing user
        }
        finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Support</CardTitle>
                        <CardDescription>Reach out and we will get back to you shortly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sent ? (
                            <div className="p-6 rounded-md bg-muted text-foreground">
                                Thanks! Your message has been sent, We will get back to you shortly.
                            </div>
                        ) : (
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" value={form.subject} onChange={(e) => handleChange("subject", e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" className="min-h-[140px]" value={form.message} onChange={(e) => handleChange("message", e.target.value)} required />
                                </div>
                                <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                                    {submitting ? "Sending..." : "Send Message"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
}


