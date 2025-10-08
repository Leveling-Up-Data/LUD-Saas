// // Note: Since we're using Express backend instead of actual PocketBase,
// // this file provides a similar API interface for consistency
// import { apiRequest } from "./queryClient";

// export interface AuthData {
//   user: {
//     id: string;
//     username: string;
//     email: string;
//     name: string;
//     stripeCustomerId?: string;
//     stripeSubscriptionId?: string;
//     createdAt: string;
//   };
//   subscription?: {
//     id: string;
//     plan: string;
//     status: string;
//     currentPeriodEnd: string;
//     amount: number;
//     trialEnd?: string;
//   };
// }

// export class PocketBaseClient {
//   private authData: AuthData | null = null;

//   constructor(private baseUrl: string = '') {}

//   get isValid() {
//     return this.authData !== null;
//   }

//   get authStore() {
//     return {
//       model: this.authData?.user || null,
//       isValid: this.isValid,
//       clear: () => {
//         this.authData = null;
//         localStorage.removeItem('auth');
//       }
//     };
//   }

//   async authWithPassword(email: string, password: string): Promise<AuthData> {
//     try {
//       const response = await apiRequest('POST', '/api/login', { email, password });
//       const data = await response.json();
//       this.authData = data;
//       localStorage.setItem('auth', JSON.stringify(data));
//       return data;
//     } catch (error) {
//       throw new Error('Authentication failed');
//     }
//   }

//   async create(email: string, password: string, username: string, name: string): Promise<AuthData['user']> {
//     try {
//       const response = await apiRequest('POST', '/api/register', {
//         email,
//         password,
//         username,
//         name
//       });
//       return await response.json();
//     } catch (error) {
//       throw new Error('Registration failed');
//     }
//   }

//   async refresh(): Promise<AuthData | null> {
//     const stored = localStorage.getItem('auth');
//     if (!stored) return null;

//     try {
//       const authData = JSON.parse(stored);
//       if (authData.user?.id) {
//         const response = await apiRequest('GET', `/api/user?userId=${authData.user.id}`);
//         const data = await response.json();
//         this.authData = data;
//         localStorage.setItem('auth', JSON.stringify(data));
//         return data;
//       }
//     } catch (error) {
//       this.authStore.clear();
//     }
//     return null;
//   }

//   logout() {
//     this.authStore.clear();
//   }
// }

// export const pb = new PocketBaseClient();

// // Initialize from localStorage
// if (typeof window !== 'undefined') {
//   pb.refresh();
// }


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

  constructor(baseUrl: string = 'https://viable-firstly-cicada.ngrok-free.app') {
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
      this.authData = this.mapAuthData(record);
      localStorage.setItem('auth', JSON.stringify(this.authData));
      return this.authData;
    } catch (error) {
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
