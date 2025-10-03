// Note: Since we're using Express backend instead of actual PocketBase,
// this file provides a similar API interface for consistency
import { apiRequest } from "./queryClient";

export interface AuthData {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    createdAt: string;
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

export class PocketBaseClient {
  private authData: AuthData | null = null;

  constructor(private baseUrl: string = '') {}

  get isValid() {
    return this.authData !== null;
  }

  get authStore() {
    return {
      model: this.authData?.user || null,
      isValid: this.isValid,
      clear: () => {
        this.authData = null;
        localStorage.removeItem('auth');
      }
    };
  }

  async authWithPassword(email: string, password: string): Promise<AuthData> {
    try {
      const response = await apiRequest('POST', '/api/login', { email, password });
      const data = await response.json();
      this.authData = data;
      localStorage.setItem('auth', JSON.stringify(data));
      return data;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  async create(email: string, password: string, username: string, name: string): Promise<AuthData['user']> {
    try {
      const response = await apiRequest('POST', '/api/register', {
        email,
        password,
        username,
        name
      });
      return await response.json();
    } catch (error) {
      throw new Error('Registration failed');
    }
  }

  async refresh(): Promise<AuthData | null> {
    const stored = localStorage.getItem('auth');
    if (!stored) return null;

    try {
      const authData = JSON.parse(stored);
      if (authData.user?.id) {
        const response = await apiRequest('GET', `/api/user?userId=${authData.user.id}`);
        const data = await response.json();
        this.authData = data;
        localStorage.setItem('auth', JSON.stringify(data));
        return data;
      }
    } catch (error) {
      this.authStore.clear();
    }
    return null;
  }

  logout() {
    this.authStore.clear();
  }
}

export const pb = new PocketBaseClient();

// Initialize from localStorage
if (typeof window !== 'undefined') {
  pb.refresh();
}
