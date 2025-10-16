import PocketBase from 'pocketbase';

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

// Helper function to get user with subscription data
async function getUserWithSubscription(pb: PocketBaseClient, userId: string): Promise<AuthData | null> {
  try {
    // Get user data
    const user = await pb.collection('users').getOne(userId);

    // Get subscription if exists
    let subscription = null;
    try {
      const subscriptions = await pb.collection('subscriptions').getList(1, 1, {
        filter: `userId = "${userId}"`,
        sort: '-created'
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
        created: user.created
      },
      subscription: subscription ? {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        amount: subscription.amount,
        trialEnd: subscription.trialEnd
      } : undefined
    };
  } catch (error) {
    console.error('Error fetching user with subscription:', error);
    return null;
  }
}

// Extend PocketBase with custom methods for compatibility
export class PocketBaseClient extends PocketBase {
  async authWithPassword(email: string, password: string): Promise<AuthData> {
    try {
      const authData = await this.collection('users').authWithPassword(email, password);
      const userWithSubscription = await getUserWithSubscription(this, authData.record.id);

      if (!userWithSubscription) {
        throw new Error('Failed to fetch user data');
      }

      return userWithSubscription;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  async create(email: string, password: string, username: string, name: string): Promise<AuthData['user']> {
    try {
      const userData = await this.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        username,
        name
      });

      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        stripeCustomerId: userData.stripeCustomerId,
        stripeSubscriptionId: userData.stripeSubscriptionId,
        created: userData.created
      };
    } catch (error) {
      throw new Error('Registration failed');
    }
  }

  async refresh(): Promise<AuthData | null> {
    try {
      // Try to refresh the auth token
      if (this.authStore.isValid) {
        await this.collection('users').authRefresh();
        const userWithSubscription = await getUserWithSubscription(this, this.authStore.model?.id || '');
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

  get isValid() {
    return this.authStore.isValid;
  }
}

// Create instance
export const pb = new PocketBaseClient(import.meta.env.VITE_POCKETBASE_URL || 'https://pb.levelingupdata.com');

// 1) Load auth from cookie first (more resilient than localStorage-only)
try {
  if (typeof document !== 'undefined') {
    pb.authStore.loadFromCookie(document.cookie);
  }
} catch (_) {
  // ignore malformed cookie
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

// 2) Try to refresh on boot; regardless of outcome, sync cookie to reflect final state
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
