import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { pb, AuthData, persistAuthToCookie, clearAuthCookie } from "@/lib/pocketbase";

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
        const data = await pb.authWithPassword(email, password);
        setUser(data.user);
        setSubscription(data.subscription);
        persistAuthToCookie();
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
      refresh,
      signOut,
    }),
    [user, subscription, loading, signIn, signUp, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
