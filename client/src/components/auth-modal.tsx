import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { pb } from "@/lib/pocketbase";
import { useToast } from "@/hooks/use-toast";
import { Github, Chrome, Loader2 } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  mode: 'signin' | 'signup';
  onClose: () => void;
  onModeChange: (mode: 'signin' | 'signup') => void;
  onSuccess?: () => void;
}

export function AuthModal({ open, mode, onClose, onModeChange, onSuccess }: AuthModalProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    terms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.terms) {
    toast({
      title: "Terms Required",
      description: "Please agree to the Terms of Service and Privacy Policy",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    const username = formData.username || formData.email.split('@')[0];
    if (formData.password !== formData.passwordConfirm) {
      toast({
        title: 'Password Mismatch',
        description: 'Password and confirmation do not match.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Create new user and send verification email
    await pb.create(
      formData.email,
      formData.password,
      formData.passwordConfirm,
      username,
      formData.name
    );

    // Show verification message (no auto-login)
    toast({
      title: "Verify Your Email",
      description:
        "A verification link has been sent to your email. Please verify your account before signing in.",
    });

    resetForm();
    onModeChange('signin'); // Switch to sign-in screen automatically
  } catch (error: any) {
    toast({
      title: "Registration Failed",
      description: error.message || "Please check your information and try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const authData = await pb.authWithPassword(formData.email, formData.password);

    // Check if user is verified
    const userRecord = authData.user;
    if (!userRecord || (userRecord as any).verified === false) {
      pb.logout();
      toast({
        title: "Email Not Verified",
        description: "Please verify your email address before logging in.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Welcome!",
      description: "You have been signed in successfully.",
    });

    onClose();
    if (onSuccess) onSuccess();
    else setLocation('/dashboard');
  } catch (error: any) {
    const msg = error.message || "Invalid email or password. Please try again.";
    toast({
      // title: "Sign In Failed",
      title: msg.includes("verify") ? "Email Not Verified" : "Sign In Failed",
      // description: "Invalid email or password. Please try again.",
      description: msg,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
/********************************************************* */

const handleForgotPassword = async () => {
  if (!formData.email) {
    toast({
      title: "Email Required",
      description: "Please enter your email address to reset your password.",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    await pb.requestPasswordReset(formData.email);
    toast({
      title: "Password Reset Email Sent",
      description:
        "If an account exists with that email, you will receive a password reset link shortly.",
    });
  } catch (error: any) {
    toast({
      title: "Reset Failed",
      description: error.message || "Unable to send password reset email.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      terms: false
    });
  };

  const handleModeToggle = () => {
    const newMode = mode === 'signup' ? 'signin' : 'signup';
    onModeChange(newMode);
    resetForm();
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={mode === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                data-testid="input-name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              minLength={8}
              data-testid="input-password"
            />
            {mode === 'signup' && (
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            )}
            {mode === 'signin' && (
              <div className="text-right">
              <button
                type="button"
                onClick={() => handleForgotPassword()}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>

              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirm Password</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="••••••••"
                value={formData.passwordConfirm}
                onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                required
                minLength={8}
                data-testid="input-password-confirm"
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => handleInputChange('terms', !!checked)}
                data-testid="checkbox-terms"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-5">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90"
            disabled={loading}
            data-testid={`button-${mode}`}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button type="button" variant="outline" className="w-full" disabled>
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button type="button" variant="outline" className="w-full" disabled>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={handleModeToggle}
              className="ml-1 text-primary hover:underline font-medium"
              data-testid="button-toggle-mode"
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
