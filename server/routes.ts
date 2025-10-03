import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Check for required Stripe keys
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing required environment variables:');
  console.error('STRIPE_SECRET_KEY - Get from https://dashboard.stripe.com/apikeys (starts with sk_)');
  console.error('Also needed: VITE_STRIPE_PUBLIC_KEY for frontend (starts with pk_)');
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });

  // User registration
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const user = await storage.createUser(userData);
      
      // Don't send password in response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error creating user: " + error.message });
    }
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Get user's subscription if any
      const subscription = await storage.getSubscriptionByUser(user.id);
      
      const { password: _, ...userResponse } = user;
      res.json({ 
        user: userResponse,
        subscription
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error logging in: " + error.message });
    }
  });

  // Get user profile (requires userId in query)
  app.get("/api/user", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const subscription = await storage.getSubscriptionByUser(user.id);
      
      const { password, ...userResponse } = user;
      res.json({ 
        user: userResponse,
        subscription
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching user: " + error.message });
    }
  });

  // Create subscription
  app.post('/api/create-subscription', async (req, res) => {
    try {
      const { userId, stripePriceId } = req.body;
      
      if (!userId || !stripePriceId) {
        return res.status(400).json({ message: "User ID and price ID required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const product = await storage.getProductByStripePriceId(stripePriceId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if user already has a subscription
      if (user.stripeSubscriptionId) {
        const existingSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (existingSubscription.status === 'active' || existingSubscription.status === 'trialing') {
          return res.status(400).json({ message: "User already has an active subscription" });
        }
      }

      let customerId = user.stripeCustomerId;
      
      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
        });
        customerId = customer.id;
      }

      // Create subscription with trial
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: stripePriceId,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        trial_period_days: 14,
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with Stripe IDs
      await storage.updateUserStripeInfo(user.id, customerId, subscription.id);

      // Create subscription record
      await storage.createSubscription({
        userId: user.id,
        plan: product.name.toLowerCase(),
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        amount: product.price,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      });

      const latest_invoice = subscription.latest_invoice as Stripe.Invoice;
      const payment_intent = latest_invoice?.payment_intent as Stripe.PaymentIntent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: payment_intent?.client_secret,
        status: subscription.status
      });
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ message: "Error creating subscription: " + error.message });
    }
  });

  // Stripe webhook handler
  app.post('/api/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.rawBody as Buffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          
          // Update subscription in database
          const dbSubscription = await storage.getSubscriptionByStripeId(subscription.id);
          if (dbSubscription) {
            await storage.updateSubscription(dbSubscription.id, {
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            });
          }
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const sub = await storage.getSubscriptionByStripeId(invoice.subscription as string);
            if (sub) {
              await storage.updateSubscription(sub.id, {
                status: 'active'
              });
            }
          }
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          if (failedInvoice.subscription) {
            const sub = await storage.getSubscriptionByStripeId(failedInvoice.subscription as string);
            if (sub) {
              await storage.updateSubscription(sub.id, {
                status: 'past_due'
              });
            }
          }
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ message: 'Webhook error: ' + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
