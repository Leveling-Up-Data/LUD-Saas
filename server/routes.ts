import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Stripe if API key is available
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });
} else {
  console.warn('⚠️  Stripe API keys not configured. Payment features will be disabled.');
  console.warn('To enable payments, add STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY to your secrets.');
}

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Products endpoint (fallback if PocketBase is not available)
  // Invite endpoint (stub)
  const inviteSchema = z.object({
    email: z.string().email(),
    inviterId: z.string().min(1),
  });

  app.post('/api/invite', (req, res) => {
    try {
      const { email, inviterId } = inviteSchema.parse(req.body);
      // TODO: Integrate actual email sending and persistence
      // For now, respond with success and echo
      res.json({ status: 'sent', email, inviterId, timestamp: new Date().toISOString() });
    } catch (err: any) {
      const message = err?.message || 'Invalid request';
      res.status(400).json({ message });
    }
  });

  app.get('/api/products', (req, res) => {
    const products = [
      {
        id: '1',
        name: 'Starter',
        price: 1900,
        features: ['Up to 1,000 users', '5GB storage', 'Email support', 'Basic analytics', 'API access'],
        maxUsers: 1000,
        storage: '5GB',
        priority: 1
      },
      {
        id: '2',
        name: 'Professional',
        price: 4900,
        features: ['Up to 10,000 users', '50GB storage', 'Priority support', 'Advanced analytics', 'Unlimited API access', 'Custom domains', 'Team collaboration'],
        maxUsers: 10000,
        storage: '50GB',
        priority: 2
      },
      {
        id: '3',
        name: 'Enterprise',
        price: 19900,
        features: ['Unlimited users', '500GB storage', '24/7 phone support', 'Custom analytics', 'Dedicated API', 'White-label options', 'Advanced security', 'SLA guarantee'],
        maxUsers: -1,
        storage: '500GB',
        priority: 3
      }
    ];

    res.json(products);
  });

  // Products are now served from PocketBase

  // Authentication is now handled by PocketBase

  // Subscription creation is now handled by PocketBase custom route

  // Stripe webhook handler
  app.post('/api/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment processing is not configured" });
    }

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
          if (invoice.subscription && typeof invoice.subscription === 'string') {
            const sub = await storage.getSubscriptionByStripeId(invoice.subscription);
            if (sub) {
              await storage.updateSubscription(sub.id, {
                status: 'active'
              });
            }
          }
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          if (failedInvoice.subscription && typeof failedInvoice.subscription === 'string') {
            const sub = await storage.getSubscriptionByStripeId(failedInvoice.subscription);
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
