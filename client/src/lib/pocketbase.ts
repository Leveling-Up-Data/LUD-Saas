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
      });
      // Trigger email verification for the new user (non-fatal on error)
      try {
        await this.collection("users").requestVerification(email);
      } catch (err) {
        console.warn("requestVerification failed:", err);
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
    } catch (error) {
      throw new Error("Registration failed");
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

  logout() {
    this.authStore.clear();
  }

  // ===== Password reset =====
  async requestPasswordReset(email: string): Promise<void> {
    await this.collection("users").requestPasswordReset(email);
  }

  async confirmPasswordReset(
    token: string,
    password: string,
    passwordConfirm: string
  ): Promise<void> {
    await this.collection("users").confirmPasswordReset(
      token,
      password,
      passwordConfirm
    );
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
}

// Create instance
export const pb = new PocketBaseClient(
  import.meta.env.VITE_POCKETBASE_URL || "https://pb.levelingupdata.com"
);

// Initialize auth from stored token (browser only)
if (typeof document !== 'undefined') {
  try {
    pb.authStore.loadFromCookie(document.cookie);
  } catch (_) {
    // ignore malformed cookie
  }
}

function syncAuthCookie() {
  if (typeof document === 'undefined') return;
  const cookie = pb.authStore.exportToCookie({
    httpOnly: false,
    secure: typeof location !== 'undefined' && location.protocol === 'https:',
    sameSite: 'Lax',
    path: '/',
  });
  document.cookie = cookie;
}

// Try to refresh on boot; regardless of outcome, sync cookie to reflect final state (browser only)
if (typeof window !== 'undefined') {
  pb.refresh().finally(() => {
    syncAuthCookie();
  });
}

export function persistAuthToCookie() {
  syncAuthCookie();
}

export function clearAuthCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'pb_auth=; Path=/; Max-Age=0; SameSite=Lax';
  }
}
