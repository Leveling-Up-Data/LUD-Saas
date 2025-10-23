import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { FileText, Search, Shield, Zap, Users, Database, Lock, MessageSquare } from "lucide-react";

export default function About() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-foreground mb-4">
                            About Starfish
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Powerful document intelligence directly into Slack. Upload, search, and get answers from your documents without ever leaving your workspace.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* What is Starfish */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                What is Starfish?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Starfish brings powerful document intelligence directly into Slack. Simply upload a PDF (normal/print-protected), Word, Excel, CSV or text file in your Slack channel, and let Starfish do the rest.
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    Stores your file in cloud services for easy access and backup
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    Handles both normal and print-protected PDFs for fast semantic search
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    Answers questions contextually using the document content
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    Provides comprehensive logging for audits
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Key Features */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Key Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                <div className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Contextual Search with vector database</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Natural Language Q&A</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Multi-workspace Ready</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Adaptive Memory</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Privacy First</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* How it Works */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>How Starfish Works</CardTitle>
                        <CardDescription>
                            Starfish combines Slack messages and uploaded documents with an advanced Gemini language model to give context-aware, accurate answers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold">Upload Documents</h3>
                                <p className="text-sm text-muted-foreground">
                                    Upload PDF, Word, Excel, CSV or text files directly in your Slack channel
                                </p>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                                    <Search className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold">Smart Processing</h3>
                                <p className="text-sm text-muted-foreground">
                                    Documents are indexed using vector embeddings for fast semantic search
                                </p>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                                    <MessageSquare className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold">Get Answers</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ask questions naturally and get contextual answers from your documents
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Advanced Features */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Advanced Capabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Contextual Search
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Uses a vector database to index and retrieve relevant document snippets in real time.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Natural Language Q&A
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Supports free-form questions—no keywords required—returning conversational, human-like responses.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Multi-workspace Ready
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Securely stores and isolates embeddings per workspace so each team's data remains private.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    Adaptive Memory
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Maintains session context for follow-up questions without re-uploading files.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Scalable Architecture
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Built on n8n and Gemini APIs to handle high volumes of Slack events and queries efficiently.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Privacy First
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Documents are processed transiently; only vector embeddings are stored for quick retrieval.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Commands */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Slack Commands</CardTitle>
                        <CardDescription>
                            Use these commands to interact with Starfish in your Slack workspace
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <code className="text-sm font-mono">/selectFile</code>
                                    <p className="text-sm text-muted-foreground">Select a specific file for Q&A</p>
                                </div>
                                <Badge variant="secondary">Command</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <code className="text-sm font-mono">Upload File</code>
                                    <p className="text-sm text-muted-foreground">Upload documents directly in the channel</p>
                                </div>
                                <Badge variant="secondary">Action</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <code className="text-sm font-mono">Delete</code>
                                    <p className="text-sm text-muted-foreground">Remove files from cloud storage</p>
                                </div>
                                <Badge variant="secondary">Action</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Important Notes */}
                <Card className="mt-8 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                    <CardHeader>
                        <CardTitle className="text-amber-800 dark:text-amber-200">Important Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            • Starfish answers questions based only on uploaded files
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            • The AI agent receives user messages and sends back retrieved answers from the index
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            • The AI is used to frame responses to user input
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            • It is possible that responses from the AI component can be inaccurate
                        </p>
                    </CardContent>
                </Card>

                {/* CTA Section */}
                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Whether you're collaborating on projects, researching topics, or managing documentation,
                        Starfish makes it easy to search, ask, and get reliable answers from your documents—without ever leaving Slack.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="outline" asChild>
                            <a href="/pricing">View Pricing</a>
                        </Button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
