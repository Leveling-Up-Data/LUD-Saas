import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  FileText,
  Lock,
  Database,
  Search,
  Upload,
  Trash2,
  Brain,
} from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { ApiTokenDialog } from "@/components/api-token-dialog";
import { Footer } from "@/components/footer";
import { pb } from "@/lib/pocketbase";
import { getApiTokenById } from "@/config/api-tokens";
import demoVideoUrl from "@/components/ui/starfishai_NecXrIuN (1).mp4";

export default function Home() {
  const [, setLocation] = useLocation();
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    mode: "signin" | "signup";
  }>({
    open: false,
    mode: "signup",
  });
  const [videoOpen, setVideoOpen] = useState(false);
  const [apiDialog, setApiDialog] = useState<{
    open: boolean;
    token: string;
    tokenName: string;
  }>({
    open: false,
    token: "",
    tokenName: "",
  });

  const handleGetStarted = () => {
    setAuthModal({ open: true, mode: "signup" });
  };

  const handleViewDemo = () => {
    setVideoOpen(true);
  };

  const handleApiClick = () => {
    console.log("API click handler called"); // Debug log

    // Get the main API token from configuration
    const apiToken = getApiTokenById("main-api-token");
    console.log("API token found:", apiToken); // Debug log

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
        token: "sk-demo-token-1234567890abcdef",
        tokenName: "Demo API Token",
      });
    }

    console.log("Dialog state set:", {
      open: true,
      token: apiToken?.token || "fallback",
      tokenName: apiToken?.name || "Demo API Token",
    }); // Debug log
  };

  return (
    <>
      {/* Video Modal */}
      {videoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setVideoOpen(false)}
          />
          <div className="relative z-10 w-[92%] sm:w-[640px] lg:w-[800px] max-w-2xl rounded-xl overflow-hidden border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium text-muted-foreground">
                Starfish Demo
              </h3>
              <button
                onClick={() => setVideoOpen(false)}
                className="text-foreground/80 hover:text-foreground"
                aria-label="Close video"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                src={demoVideoUrl}
                controls
                autoPlay
                controlsList="nodownload"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
      {/* Hero Section - Starfish for Slack */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} />
              <span className="text-sm font-medium">
                Starfish • Document Intelligence for Slack
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Unite your team's knowledge
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}
                right inside Slack
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload PDFs (including print‑protected), Word, Excel, CSV, or text
              files. Ask questions in natural language and get context‑aware
              answers powered by Gemini—without leaving Slack.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => {
                  // Check if user is logged in using PocketBase auth state
                  if (pb.authStore.isValid && pb.authStore.model) {
                    // Already logged in, redirect to products page
                    setLocation("/products");
                  } else {
                    // Not logged in, show signup modal
                    handleGetStarted();
                  }
                }}
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 shadow-lg px-8 py-4 text-lg w-full sm:w-auto"
                data-testid="button-hero-signup"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={handleViewDemo}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg w-full sm:w-auto"
                data-testid="button-view-demo"
              >
                View Demo
                <Play className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">2-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">Private & secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Conversation Showcase (image left, content right) */}
      <section className="-mt-8 sm:-mt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[1.25fr_1fr] gap-10 items-center">
            <div className="md:pr-6">
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Starfish , an intelligent slack bot 🧠
              </h3>
              {/* Place your chat image at /public/chat-preview.png */}
              <img
                src={`${import.meta.env.BASE_URL}chat-preview.png`}
                alt="Starfish answering questions in Slack"
                className="w-full h-auto max-h-[440px] md:max-h-[500px] object-contain rounded-2xl border border-border shadow-lg"
                loading="lazy"
              />
            </div>
            <div className="md:pl-6">
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-fuchsia-500 to-secondary bg-clip-text text-transparent">
                Ask anything about your files — get answers grounded in your
                docs.
              </p>
              <p className="mt-4 text-2xl sm:text-3xl font-semibold text-foreground">
                No context switching. Just drop a file in Slack and chat like
                magic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - inspired by Team TimeZone layout */}
      <section id="features" className="py-20 sm:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Why teams love Starfish
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Contextual answers from your Slack conversations and uploaded
              documents—secured, searchable, and ready when you are.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature
              icon={<Upload className="h-7 w-7 text-primary" />}
              title="Upload in Slack"
              desc="Drop PDFs, Word, Excel, CSV, or text. Starfish stores files in the cloud for access and backup."
            />
            <Feature
              icon={<Lock className="h-7 w-7 text-primary" />}
              title="Print‑protected PDFs"
              desc="Works with normal and print‑protected PDFs for fast semantic search."
            />
            <Feature
              icon={<Search className="h-7 w-7 text-primary" />}
              title="Contextual answers"
              desc="Natural language Q&A grounded only in your uploaded files."
            />
            <Feature
              icon={<Database className="h-7 w-7 text-primary" />}
              title="Vector search"
              desc="Indexes documents in a vector database and retrieves relevant snippets in real time."
            />
            <Feature
              icon={<MessageSquare className="h-7 w-7 text-primary" />}
              title="/selectFile command"
              desc="Choose exactly which file Starfish should use for Q&A."
            />
            <Feature
              icon={<Trash2 className="h-7 w-7 text-primary" />}
              title="One‑click delete"
              desc="Remove files from cloud storage at any time."
            />
            <Feature
              icon={<ShieldCheck className="h-7 w-7 text-primary" />}
              title="Privacy first"
              desc="Documents are processed transiently; only embeddings are stored for quick retrieval."
            />
            <Feature
              icon={<Brain className="h-7 w-7 text-primary" />}
              title="Gemini‑powered"
              desc="Combines Slack messages and docs with Gemini to craft accurate, conversational answers."
            />
            <Feature
              icon={<FileText className="h-7 w-7 text-primary" />}
              title="Audit logging"
              desc="Full request and response logging for compliance and reviews."
            />
          </div>

          <div className="text-center mt-12">
            <Link to="/pricing">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90"
                data-testid="button-see-pricing"
              >
                See Pricing Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <AuthModal
        open={authModal.open}
        mode={authModal.mode}
        onClose={() => setAuthModal({ open: false, mode: "signup" })}
        onModeChange={(mode) => setAuthModal({ open: true, mode })}
      />

      {/* API Token Dialog */}
      <ApiTokenDialog
        open={apiDialog.open}
        onOpenChange={(open) => setApiDialog({ ...apiDialog, open })}
        token={apiDialog.token}
        tokenName={apiDialog.tokenName}
      />
    </>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-left md:text-left lg:text-left border border-border rounded-xl p-6 bg-card/30">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-6">{desc}</p>
    </div>
  );
}
