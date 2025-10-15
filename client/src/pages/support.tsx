import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Upload,
    Settings,
    Shield,
    Users,
    FileText,
    ExternalLink,
    Slack,
    MessageCircle
} from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { pb } from "@/lib/pocketbase";

export default function Support() {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const handleProductSelect = (product: string) => {
        const doRedirect = () => {
            if (product === "starfish-slack") {
                window.location.href = "https://slack.com/oauth/v2/authorize?client_id=8395289183441.9315965017559&scope=app_mentions:read,channels:join,channels:read,chat:write,commands,files:read,files:write,groups:read,im:history,remote_files:read,mpim:history,channels:history,groups:history&user_scope=";
            }
        };

        // If user is already authenticated with PocketBase, perform redirect
        try {
            if (pb?.authStore?.isValid) {
                doRedirect();
                return;
            }
        } catch (e) {
            // fall through to show modal
        }

        // Not authenticated: open auth modal and store pending action
        setPendingAction(() => doRedirect);
        setShowAuthModal(true);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                        Support
                    </h1>
                    <div className="text-3xl font-bold text-foreground mb-4">
                        Starfish
                    </div>
                    <p className="text-lg text-muted-foreground mb-2">
                        Installation & Usage Guide - Slack
                    </p>
                    <p className="text-base text-muted-foreground max-w-3xl mx-auto mb-8">
                        Starfish is a Slack app that helps you interact with documents and get AI-powered responses directly in your Slack channels.
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Installation Steps */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Installation Steps</h2>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                                    Install the Slack App
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">
                                    Click the button below to add Starfish to your Slack workspace:
                                </p>
                                <Button
                                    onClick={() => handleProductSelect("starfish-slack")}
                                    className="bg-[#4A154B] hover:bg-[#4A154B]/90 text-white flex items-center gap-2">
                                    <Slack className="w-4 h-4" />
                                    Add to Slack
                                </Button>

                                <div className="mt-4">
                                    <p className="font-medium text-foreground mb-2">Alternative method:</p>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>• Navigate to your Slack workspace settings</li>
                                        <li>• Search for 'Starfish' in the app directory</li>
                                        <li>• Click 'Add to Slack' and follow the authorization prompts</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                                    Invite Starfish to Channels
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Go to the channel where you want to use Starfish</li>
                                    <li>• Type /invite @starfish to add the app to the channel</li>
                                    <li>• You can add Starfish to multiple channels as needed</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* How to Use Starfish */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-6">How to Use Starfish</h2>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                    Method 1: App Mention
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ol className="space-y-2 text-muted-foreground">
                                    <li>1. Trigger the app by typing @starfish in any channel where the app is installed</li>
                                    <li>2. Add your question or request after the mention</li>
                                    <li>3. Hit Send</li>
                                    <li>4. Wait for response - Starfish will process your request and reply in the thread</li>
                                </ol>

                                <div className="bg-muted p-4 rounded-lg">
                                    <code className="text-sm">@starfish what are the key points from the quarterly report?</code>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-primary" />
                                    Method 2: File Upload with Question
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ol className="space-y-2 text-muted-foreground">
                                    <li>1. Upload a document (PDF, Word doc, etc.) to the channel</li>
                                    <li>2. Mention @starfish in the same message or in a comment</li>
                                    <li>3. Ask your question about the uploaded file</li>
                                    <li>4. Hit Send</li>
                                    <li>5. Wait for response - Starfish will analyze the document and provide insights</li>
                                </ol>

                                <div className="bg-muted p-4 rounded-lg">
                                    <code className="text-sm whitespace-pre-line">
                                        {`[upload: quarterly_report.pdf]
@starfish can you summarize the main financial highlights from this report?`}
                                    </code>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* User Permissions & Access Requirements */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-6">User Permissions & Access Requirements</h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Users className="w-5 h-5 text-primary" />
                                    For Slack Users
                                </CardTitle>
                                <CardDescription>To use Starfish effectively, users need:</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• Channel Access</li>
                                    <li>• File Upload Rights</li>
                                    <li>• App Mention Rights</li>
                                    <li>• Notification Access</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Settings className="w-5 h-5 text-primary" />
                                    For Administrators
                                </CardTitle>
                                <CardDescription>Ensure your workspace has:</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• App Installation Rights</li>
                                    <li>• Channel Management</li>
                                    <li>• File Sharing Enabled</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Shield className="w-5 h-5 text-primary" />
                                    Drive Integration Access
                                </CardTitle>
                                <CardDescription>If Starfish connects to Google Drive or other cloud storage:</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• Drive Permissions</li>
                                    <li>• Upload/Download Rights</li>
                                    <li>• Folder Access</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Troubleshooting */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Troubleshooting</h2>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-orange-500" />
                                    Common Issues
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Starfish not responding:</h4>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>• Verify the app is invited to the channel</li>
                                        <li>• Check that you're using the correct mention format: @starfish</li>
                                        <li>• Ensure you have proper permissions in the channel</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">File upload issues:</h4>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>• Confirm file types are supported (PDF, DOC, DOCX, etc.)</li>
                                        <li>• Check file size limits for your Slack workspace</li>
                                        <li>• Verify you have upload permissions in the channel</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Permission errors:</h4>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>• Contact your Slack administrator to verify app permissions</li>
                                        <li>• Ensure your account has the necessary Drive access (if applicable)</li>
                                        <li>• Check that you're in the correct channels with proper access rights</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Best Practices */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Best Practices</h2>

                    <Card>
                        <CardContent className="pt-6">
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• Be specific in your questions to get more accurate responses</li>
                                <li>• Use clear file names when uploading documents for analysis</li>
                                <li>• Keep conversations organized by using threads when possible</li>
                                <li>• Tag relevant team members when sharing Starfish insights</li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                {/* Support & Contact */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Support & Contact</h2>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground mb-4">
                                If you encounter issues or need additional help:
                            </p>
                            <ul className="space-y-2 text-muted-foreground mb-4">
                                <li>• Contact your Slack workspace administrator</li>
                                <li>• Check with your IT team for Drive access issues</li>
                                <li>• Refer to your organization's internal documentation for specific configuration details</li>
                            </ul>
                            <p className="text-muted-foreground">
                                For technical support, contact your system administrator.
                            </p>
                        </CardContent>
                    </Card>
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-card border-t border-border py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Starfish</h4>
                            <ul className="space-y-2">
                                <li><Link to="/products" className="text-muted-foreground hover:text-foreground transition">Products</Link></li>
                                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</Link></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">API</a></li>
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
                                <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Cookies</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-border pt-8 text-center">
                        <p className="text-muted-foreground text-sm">© Leveling Up Data - {new Date().getFullYear()} All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
            {/* Auth modal triggered when user clicks Add to Slack */}
            <AuthModal
                open={showAuthModal}
                onOpenChange={(open) => {
                    setShowAuthModal(open);
                    if (!open) setPendingAction(null);
                }}
                onAuthSuccess={() => {
                    // Close modal then run pending action if any
                    setShowAuthModal(false);
                    if (pendingAction) {
                        // small timeout to ensure auth store updated
                        setTimeout(() => pendingAction(), 200);
                        setPendingAction(null);
                    }
                }}
            />
        </div>
    );
}
