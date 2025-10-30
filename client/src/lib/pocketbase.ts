import PocketBase from "pocketbase";

// Export types for compatibility
export interface AuthData {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    created: string;
  };
  subscription?: {
    id: string;
    plan: string;
    status: string;
    currentPeriodEnd: string;
    amount: number;
    trialEnd?: string;
  };
}

// Types for the users_tokens collection
export interface UserTokenRecord {
  id: string;
  token_name?: string; // collection field
  token_id: string; // API token (generated server-side)
  user_id: string; // relation to users
  created?: string;
  updated?: string;
}

// Client-side token generator (fallback if server hook isn't active)
function generateRandomToken(length = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Helper function to get user with subscription data
async function getUserWithSubscription(
  pb: PocketBaseClient,
  userId: string
): Promise<AuthData | null> {
  try {
    // Get user data
    const user = await pb.collection("users").getOne(userId);

    // Get subscription if exists
    let subscription = null;
    try {
      const subscriptions = await pb.collection("subscriptions").getList(1, 1, {
        filter: `userId = "${userId}"`,
        sort: "-created",
      });
      if (subscriptions.items.length > 0) {
        subscription = subscriptions.items[0];
      }
    } catch (error) {
      // No subscription found, that's okay
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        created: user.created,
      },
      subscription: subscription
        ? {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          amount: subscription.amount,
          trialEnd: subscription.trialEnd,
        }
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching user with subscription:", error);
    return null;
  }
}

// Extend PocketBase with custom methods for compatibility
export class PocketBaseClient extends PocketBase {
  async authWithPassword(email: string, password: string): Promise<AuthData> {
    try {
      const authData = await this.collection("users").authWithPassword(
        email,
        password
      );
      // Enforce email verification before allowing login
      if (!authData?.record?.verified) {
        this.authStore.clear();
        throw new Error("Please verify your email before logging in.");
      }
      const userWithSubscription = await getUserWithSubscription(
        this,
        authData.record.id
      );

      // Ensure the user has at least one API token record
      try {
        await this.ensureUserTokenForUser(authData.record.id);
      } catch (err) {
        console.warn("ensureUserTokenForUser failed (login):", err);
      }

      if (!userWithSubscription) {
        throw new Error("Failed to fetch user data");
      }

      return userWithSubscription;
    } catch (error) {
      throw new Error("Authentication failed");
    }
  }

  async create(
    email: string,
    password: string,
    username: string,
    name: string
  ): Promise<AuthData["user"]> {
    try {
      const userData = await this.collection("users").create({
        email,
        emailVisibility: true,
        password,
        passwordConfirm: password,
        username,
        name,
        // Satisfy required field validation in PocketBase users auth collection
        // emailVisibility: true,
      });

      // Send verification email (non-fatal if it fails)
      try {
        await this.collection("users").requestVerification(email);
      } catch (err) {
        console.warn("requestVerification failed (register):", err);
      }

      // Ensure the new user has a default API token record
      try {
        await this.ensureUserTokenForUser(userData.id);
      } catch (err) {
        console.warn("ensureUserTokenForUser failed (register):", err);
      }

      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        stripeCustomerId: userData.stripeCustomerId,
        stripeSubscriptionId: userData.stripeSubscriptionId,
        created: userData.created,
      };
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed";
      throw new Error(message);
    }
  }

  async refresh(): Promise<AuthData | null> {
    try {
      // Try to refresh the auth token
      if (this.authStore.isValid) {
        await this.collection("users").authRefresh();
        const userWithSubscription = await getUserWithSubscription(
          this,
          this.authStore.model?.id || ""
        );
        return userWithSubscription;
      }
    } catch (error) {
      // Clear invalid auth
      this.authStore.clear();
    }
    return null;
  }

  async authWithOAuth2(
    provider: string,
    redirectUrl?: string,
    urlCallback?: (url: string) => void
  ): Promise<AuthData | void> {
    try {
      // Use the current window URL as the default redirect if not provided
      const defaultRedirectUrl = 
        redirectUrl || 
        (typeof window !== "undefined" ? window.location.href : "");

      // Normalize provider name (PocketBase uses lowercase)
      const providerName = provider.toLowerCase();
      
      // Try to get available auth methods, but if it fails, use provider name directly
      let providerToUse = providerName;
      try {
        const authMethods = await this.collection("users").listAuthMethods();
        console.log("Available auth providers:", authMethods.authProviders);
        
        // Look for the provider in the list
        if (authMethods.authProviders && authMethods.authProviders.length > 0) {
          const foundProvider = authMethods.authProviders.find(
            (p: any) => {
              const pName = String(p.name || "").toLowerCase();
              return pName === providerName || 
                     (pName === "google" && providerName === "google");
            }
          );
          
          if (foundProvider && foundProvider.name) {
            providerToUse = foundProvider.name;
            console.log(`Using OAuth provider: ${providerToUse}`);
          } else {
            // Provider not found in list, but try using it directly anyway
            console.warn(`Provider "${providerName}" not found in list, trying direct use`);
          }
        }
      } catch (listError) {
        // If listing fails, just use the provider name directly - PocketBase might still work
        console.warn("Could not list auth methods, using provider name directly:", listError);
      }

      // Start OAuth2 flow - this will redirect the user to Google
      const authData = await this.collection("users").authWithOAuth2({
        provider: providerToUse,
        urlCallback: urlCallback || ((url: string) => {
          // Open OAuth popup or redirect
          if (typeof window !== "undefined") {
            window.location.href = url;
          }
        }),
        redirectUrl: defaultRedirectUrl,
      });

      // If urlCallback was provided and called, we'll redirect, so return void
      if (!authData) {
        return;
      }

      // If we get here, OAuth was successful (happens after redirect callback)
      const userId = authData.record?.id || this.authStore.model?.id;
      if (!userId) {
        throw new Error("Failed to get user ID from OAuth");
      }

      // Ensure user has API token
      try {
        await this.ensureUserTokenForUser(userId);
      } catch (err) {
        console.warn("ensureUserTokenForUser failed (OAuth):", err);
      }

      const userWithSubscription = await getUserWithSubscription(this, userId);
      if (!userWithSubscription) {
        throw new Error("Failed to fetch user data");
      }

      return userWithSubscription;
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "OAuth authentication failed";
      
      // Add helpful error message for provider not found
      if (error?.message?.includes("not found") || error?.message?.includes("provider")) {
        throw new Error(
          `OAuth provider "${provider}" not found. Please ensure Google OAuth is properly configured and enabled in PocketBase admin panel (Settings > Auth Providers).`
        );
      }
      
      throw new Error(message);
    }
  }

  logout() {
    this.authStore.clear();
  }

  get isValid() {
    return this.authStore.isValid;
  }

  // ========== users_tokens helpers ==========
  /** Ensure the user has at least one token; create a default if none exists. */
  private async ensureUserTokenForUser(userId: string): Promise<void> {
    try {
      const existing = await this.listUserTokens({
        userId,
        page: 1,
        perPage: 1,
      });
      if (Array.isArray(existing) && existing.length > 0) return;
    } catch (_) {
      // If listing fails, attempt creation anyway
    }

    await this.createUserToken({ tokenName: "default", userId });
  }

  /**
   * Create a token record in `users_tokens`.
   * Will default the relation to the currently authenticated user if `userId` is not provided.
   */
  async createUserToken(input: {
    tokenName?: string;
    userId?: string;
    tokenId?: string;
  }): Promise<UserTokenRecord> {
    const currentUserId = input.userId || this.authStore.model?.id;
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Build payload for user_tokens collection
    const payload: Record<string, unknown> = {
      user_id: currentUserId,
    };
    payload.token_name =
      (input.tokenName && input.tokenName.trim()) || "default";
    payload.token_id = input.tokenId || generateRandomToken(32);

    const record = await this.collection("user_tokens").create(payload);
    return record as unknown as UserTokenRecord;
  }

  /** List token records for a user (defaults to current user). */
  async listUserTokens(options?: {
    userId?: string;
    page?: number;
    perPage?: number;
  }): Promise<UserTokenRecord[]> {
    const userId = options?.userId || this.authStore.model?.id;
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const page = options?.page ?? 1;
    const perPage = options?.perPage ?? 50;

    const list = await this.collection("user_tokens").getList(page, perPage, {
      filter: `user_id = "${userId}"`,
      sort: "-created",
    });
    return list.items as unknown as UserTokenRecord[];
  }

  /** Update a token record by id. */
  async updateUserToken(
    id: string,
    updates: Partial<Pick<UserTokenRecord, "token_name">>
  ): Promise<UserTokenRecord> {
    const payload: Record<string, unknown> = {};
    if (typeof updates.token_name === "string")
      payload.token_name = updates.token_name;

    const record = await this.collection("user_tokens").update(id, payload);
    return record as unknown as UserTokenRecord;
  }

  /** Delete a token record by id. */
  async deleteUserToken(id: string): Promise<void> {
    await this.collection("user_tokens").delete(id);
  }

  /**
   * Archive user into `closed_accounts` then delete from `users`.
   * Keeps only non-sensitive fields: email, name, username, and closedAt.
   */
  async closeAccount(userId: string): Promise<void> {
    // Fetch fresh user to avoid stale fields
    const user = await this.collection("users").getOne(userId);
    const archivePayload: Record<string, unknown> = {
      email: user.email,
      name: user.name,
      username: user.username,
      closedAt: new Date().toISOString(),
    };
    try {
      await this.collection("closed_accounts").create(archivePayload);
    } catch (e) {
      // If archiving fails, do not proceed with deletion to avoid data loss
      throw new Error(
        (e as any)?.message || "Failed to archive closed account record"
      );
    }
    await this.collection("users").delete(userId);
  }
}

// Create instance
export const pb = new PocketBaseClient(
  import.meta.env.VITE_POCKETBASE_URL || "https://pb.levelingupdata.com"
);

// Cookie options derived from environment
const SECURE_COOKIES =
  (import.meta as any).env?.PROD ||
  ((import.meta as any).env?.VITE_SECURE_COOKIES === "true");
const COOKIE_DOMAIN = (import.meta as any).env?.VITE_COOKIE_DOMAIN as
  | string
  | undefined;

function syncAuthCookie() {
  if (typeof document === "undefined") return;
  const cookie = pb.authStore.exportToCookie({
    httpOnly: false,
    secure: !!SECURE_COOKIES,
    sameSite: "Lax",
    path: "/",
    domain: COOKIE_DOMAIN || undefined,
  });
  document.cookie = cookie;
}

// Initialize auth from stored cookie FIRST, then refresh and keep cookie in sync
if (typeof window !== "undefined") {
  // Load from cookie eagerly
  try {
    if (typeof document !== "undefined") {
      pb.authStore.loadFromCookie(document.cookie);
      // Immediately reflect current state in cookie (normalizes flags)
      syncAuthCookie();
    }
  } catch (_) {
    // ignore malformed cookie
  }

  // Keep cookie synced with any auth changes (login/logout/refresh)
  try {
    // onChange signature: (token, model) => void
    pb.authStore.onChange(() => {
      syncAuthCookie();
    });
  } catch (_) {
    // ignore if not supported
  }

  // Try to refresh to validate/extend the session
  pb.refresh().finally(() => {
    syncAuthCookie();
  });
}

export function persistAuthToCookie() {
  syncAuthCookie();
}

export function clearAuthCookie() {
  if (typeof document !== "undefined") {
    const parts = [
      "pb_auth=",
      "Path=/",
      "Max-Age=0",
      "SameSite=Lax",
    ];
    if (SECURE_COOKIES) parts.push("Secure");
    if (COOKIE_DOMAIN) parts.push(`Domain=${COOKIE_DOMAIN}`);
    document.cookie = parts.join("; ");
  }
}
