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
