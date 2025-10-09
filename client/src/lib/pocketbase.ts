import PocketBase from 'pocketbase';

export interface SubscriptionData {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  amount: number;
  trialEnd?: string;
}

export interface AuthData {
  user: {
    id: string;
    username?: string;
    email: string;
    name?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    createdAt: string;
  };
  subscription?: SubscriptionData;
  token: string;
}

export class PocketBaseClient {
  private pb: PocketBase;
  private authData: AuthData | null = null;

  constructor(baseUrl: string = 'https://uniformly-secure-joey.ngrok-free.app') {
    this.pb = new PocketBase(baseUrl);

    if (typeof window !== 'undefined') {
      this.restoreSession();
    }
  }

  get isValid() {
    return this.pb.authStore.isValid;
  }

  get authStore() {
    return {
      model: this.authData?.user || null,
      isValid: this.isValid,
      token: this.authData?.token || null,
      clear: () => {
        this.authData = null;
        this.pb.authStore.clear();
        localStorage.removeItem('auth');
      },
    };
  }

  /** Login with email & password */
  async authWithPassword(email: string, password: string): Promise<AuthData> {
    try {
      const record = await this.pb.collection('users').authWithPassword(email, password);

      // Check verification status before proceeding
      if (!record?.record?.verified) {
        // Clear auth immediately so token doesn't persist
        this.pb.authStore.clear();
        throw new Error('Please verify your email before logging in.');
      }

      this.authData = this.mapAuthData(record);
      localStorage.setItem('auth', JSON.stringify(this.authData));
      return this.authData;
    } catch (error: any) {
      if (error.message === 'Please verify your email before logging in.') {
        throw error;
      }
      throw new Error('Authentication failed');
    }
  }


  /** Create/register a new user */
  async create(
    email: string,
    password: string,
    passwordConfirm: string,
    username?: string,
    name?: string
  ): Promise<AuthData['user']> {
    try {
      const data: any = { email, password, passwordConfirm };
      if (username) data.username = username;
      if (name) data.name = name;

      const record = await this.pb.collection('users').create(data);
      await this.pb.collection('users').requestVerification(email);

      return this.mapUser(record);
    } catch (error) {
      throw new Error('Registration failed');
    }
  }

  /** Restore session and refresh subscription info */
  async restoreSession(): Promise<AuthData | null> {
    try {
      const stored = localStorage.getItem('auth');
      if (!stored) return null;

      const authData: AuthData = JSON.parse(stored);
      this.pb.authStore.loadFromCookie(authData.token); // Load token
      await this.pb.authRefresh(); // Refresh token if expired

      // Fetch fresh user data including subscription
      const freshUser = await this.pb.collection('users').getOne(authData.user.id);
      this.authData = this.mapAuthData({ record: freshUser, token: this.pb.authStore.token });
      localStorage.setItem('auth', JSON.stringify(this.authData));

      return this.authData;
    } catch (_) {
      this.authStore.clear();
      return null;
    }
  }

  /** Request password reset email */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await this.pb.collection('users').requestPasswordReset(email);
    } catch (error) {
      throw new Error('Failed to send password reset email');
    }
  }

  /** Logout */
  logout() {
    this.authStore.clear();
  }

  /** Helper: map PocketBase record to AuthData */
  private mapAuthData(record: any): AuthData {
    return {
      user: this.mapUser(record.record),
      subscription: record.record.subscription || undefined,
      token: record.token,
    };
  }

  /** Helper: map PocketBase record to user object */
  private mapUser(record: any) {
    return {
      id: record.id,
      username: record.username,
      email: record.email,
      name: record.name,
      createdAt: record.created,
      stripeCustomerId: record.stripeCustomerId,
      stripeSubscriptionId: record.stripeSubscriptionId,
    };
  }
}

// Export singleton
export const pb = new PocketBaseClient();
