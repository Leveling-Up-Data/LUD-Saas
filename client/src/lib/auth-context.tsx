import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  pb,
  AuthData,
  persistAuthToCookie,
  clearAuthCookie,
} from "@/lib/pocketbase";

interface AuthContextValue {
  user: AuthData["user"] | null;
  subscription: AuthData["subscription"];
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    username?: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthData["user"] | null>(null);
  const [subscription, setSubscription] =
    useState<AuthData["subscription"]>(undefined);
  const [loading, setLoading] = useState(true);

  const hydrateFromStore = useCallback(async () => {
    try {
      const data = await pb.refresh();
      if (data) {
        setUser(data.user);
        setSubscription(data.subscription);
      } else {
        setUser(null);
        setSubscription(undefined);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateFromStore();

    // Check for OAuth callback in URL parameters
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check for OAuth callback parameters
      const hasOAuthCallback = 
        urlParams.has("code") || 
        urlParams.has("state") ||
        hashParams.has("token") ||
        hashParams.has("state");

      // If OAuth callback detected, complete OAuth authentication
      if (hasOAuthCallback) {
        // Complete OAuth by calling authWithOAuth2 without urlCallback
        pb.authWithOAuth2("google", window.location.origin + window.location.pathname)
          .then((authData) => {
            if (authData) {
              setUser(authData.user);
              setSubscription(authData.subscription);
              persistAuthToCookie();
              
              // Clean up URL parameters after processing
              const cleanUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("OAuth callback error:", error);
            setLoading(false);
          });
      }
    }
  }, [hydrateFromStore]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await pb.authWithPassword(email, password);
      setUser(data.user);
      setSubscription(data.subscription);
      persistAuthToCookie();
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      username?: string
    ) => {
      setLoading(true);
      try {
        const finalUsername = username || email.split("@")[0];
        await pb.create(email, password, finalUsername, name);
        // Do not auto-login; require email verification first
        setUser(null);
        setSubscription(undefined);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      // Set the redirect URL to current page
      const redirectUrl = typeof window !== "undefined" 
        ? window.location.origin + window.location.pathname
        : "";

      // Start OAuth2 flow - this will redirect to Google
      // After Google authentication, user will be redirected back
      await pb.authWithOAuth2(
        "google",
        redirectUrl,
        (url: string) => {
          // Redirect to Google OAuth
          if (typeof window !== "undefined") {
            window.location.href = url;
          }
        }
      );
      // Note: We won't reach here as the redirect happens above
      // Authentication is completed via redirect callback
    } catch (error: any) {
      console.error("OAuth error:", error);
      setLoading(false);
      throw error;
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pb.refresh();
      if (data) {
        setUser(data.user);
        setSubscription(data.subscription);
        persistAuthToCookie();
      } else {
        setUser(null);
        setSubscription(undefined);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    pb.logout();
    clearAuthCookie();
    setUser(null);
    setSubscription(undefined);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      subscription,
      loading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signInWithGoogle,
      refresh,
      signOut,
    }),
    [user, subscription, loading, signIn, signUp, signInWithGoogle, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
