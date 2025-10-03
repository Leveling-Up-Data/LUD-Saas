import { type User, type InsertUser, type Subscription, type InsertSubscription, type Product, type InsertProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Subscription methods
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptionByUser(userId: string): Promise<Subscription | undefined>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByStripePriceId(stripePriceId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private products: Map<string, Product> = new Map();

  constructor() {
    // Initialize with default products
    this.initializeProducts();
  }

  private async initializeProducts() {
    const defaultProducts: InsertProduct[] = [
      {
        name: "Starter",
        price: 1900, // $19.00
        stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || "price_starter",
        features: ["Up to 1,000 users", "5GB storage", "Email support", "Basic analytics", "API access"],
        maxUsers: 1000,
        storage: "5GB",
        priority: 1
      },
      {
        name: "Professional",
        price: 4900, // $49.00
        stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || "price_professional",
        features: ["Up to 10,000 users", "50GB storage", "Priority support", "Advanced analytics", "Unlimited API access", "Custom domains", "Team collaboration"],
        maxUsers: 10000,
        storage: "50GB",
        priority: 2
      },
      {
        name: "Enterprise",
        price: 19900, // $199.00
        stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise",
        features: ["Unlimited users", "500GB storage", "24/7 phone support", "Custom analytics", "Dedicated API", "White-label options", "Advanced security", "SLA guarantee"],
        maxUsers: -1, // unlimited
        storage: "500GB",
        priority: 3
      }
    ];

    for (const product of defaultProducts) {
      await this.createProduct(product);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId,
      stripeSubscriptionId
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Subscription methods
  async getSubscription(id: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getSubscriptionByUser(userId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(sub => sub.userId === userId);
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(sub => sub.stripeSubscriptionId === stripeSubscriptionId);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      trialEnd: insertSubscription.trialEnd ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) throw new Error('Subscription not found');
    
    const updatedSubscription: Subscription = {
      ...subscription,
      ...updates,
      updatedAt: new Date()
    };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByStripePriceId(stripePriceId: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.stripePriceId === stripePriceId);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      maxUsers: insertProduct.maxUsers ?? null,
      storage: insertProduct.storage ?? null,
      priority: insertProduct.priority ?? null
    };
    this.products.set(id, product);
    return product;
  }
}

export const storage = new MemStorage();
