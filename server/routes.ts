import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

// Initialize Stripe if API key is available
let stripe: Stripe | null = null;

// Use environment variable or fall back to provided Stripe secret key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51SJEwk5C8orLKCoOPHjbxWeDZrw7A8KRDBlVPwDbzsDVd9ys25bZnheziUDrBhx6gCfpQh63PwyUoYySBx8Kybex00s3PtDtrd';

if (STRIPE_SECRET_KEY) {
  // Use library default API version to avoid invalid/unknown versions
  stripe = new Stripe(STRIPE_SECRET_KEY);
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

  // Email endpoints using your SMTP credentials
  const smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'atom@levelingupdata.com',
      pass: 'tblmdineodbegxge'
    }
  };

  const transporter = nodemailer.createTransporter(smtpConfig);

  // Contact email endpoint
  app.post('/api/send-contact-email', async (req, res) => {
    try {
      const { username, email, subject, message } = req.body;

      const mailOptions = {
        from: 'hello@levelingupdata.com',
        to: email,
        subject: `We received your message: ${subject}`,
        text: `Hi ${username},\n\nThanks for contacting us! We've received your message and our team will get back to you shortly.\n\nSubject: ${subject}\n\nMessage:\n${message}\n\nBest regards,\nStarfish Support`,
        html: `
          <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6; color:#111827;">
            <h2 style="margin:0 0 12px;">Thanks, we received your message</h2>
            <p style="margin:0 0 12px;">Hi <strong>${username}</strong>,</p>
            <p style="margin:0 0 12px;">We've received your message and our team will get back to you shortly.</p>
            <div style="margin:16px 0; padding:12px; background:#F3F4F6; border-radius:8px;">
              <div style="font-weight:600; margin-bottom:6px;">Subject:</div>
              <div>${subject}</div>
              <div style="font-weight:600; margin:12px 0 6px;">Message:</div>
              <div style="white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
            <p style="margin:12px 0 0;">Best regards,<br/>Starfish Support</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error('Contact email error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // Invite email endpoint
  app.post('/api/send-invite-email', async (req, res) => {
    try {
      const { email } = req.body;
      const loginUrl = 'https://starfish.levelingupdata.com/';

      const mailOptions = {
        from: 'hello@levelingupdata.com',
        to: email,
        subject: `You're invited to join`,
        text: `You've been invited. Click the link to sign up or log in: ${loginUrl}`,
        html: `
          <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6;">
            <h2>You're invited</h2>
            <p>You have been invited.</p>
            <p>
              <a href="${loginUrl}"
                 style="display:inline-block;background:#111827;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">
                Open Login / Signup
              </a>
            </p>
            <p>If the button doesn't work, copy and paste this URL into your browser:<br/>
              <a href="${loginUrl}">${loginUrl}</a>
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error('Invite email error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // Products endpoint - fetches from Stripe API
  app.get('/api/products', async (req, res) => {
    try {
      if (!stripe) {
        // Fallback to hardcoded products if Stripe is not configured
        const products = [
          {
            id: '1',
            name: 'Starter',
            price: 1900,
            features: ['Up to 1,000 users', '5GB storage', 'Email support', 'Basic analytics', 'API access'],
            maxUsers: 1000,
            storage: '5GB',
            priority: 1,
            stripePriceId: '',
            paymentLink: 'https://buy.stripe.com/test_4gM5kwbp37Un5NhbN4co000'
          },
          {
            id: '2',
            name: 'Pro',
            price: 4900,
            features: ['Up to 10,000 users', '50GB storage', 'Priority support', 'Advanced analytics', 'Unlimited API access', 'Custom domains', 'Team collaboration'],
            maxUsers: 10000,
            storage: '50GB',
            priority: 2,
            stripePriceId: '',
            paymentLink: 'https://buy.stripe.com/test_4gM00c64Jb6zfnR18qco001'
          },
          {
            id: '3',
            name: 'Enterprise',
            price: 19900,
            features: ['Unlimited users', '500GB storage', '24/7 phone support', 'Custom analytics', 'Dedicated API', 'White-label options', 'Advanced security', 'SLA guarantee'],
            maxUsers: -1,
            storage: '500GB',
            priority: 3,
            stripePriceId: '',
            paymentLink: ''
          }
        ];
        return res.json(products);
      }

      // Fetch products from Stripe API
      const products = await stripe.products.list({
        limit: 3,
      });

      // Payment links mapping
      const paymentLinks: Record<string, string> = {
        'Pro': 'https://buy.stripe.com/test_4gM00c64Jb6zfnR18qco001',
        'Starter': 'https://buy.stripe.com/test_4gM5kwbp37Un5NhbN4co000',
      };

      // Array to hold all products with prices
      const productsWithPrices: any[] = [];

      // Process each product
      for (const product of products.data) {
        // Fetch all prices for this product
        const prices = await stripe.prices.list({
          product: product.id,
          limit: 10,
        });

        // If product has multiple prices, create a separate entry for each price
        if (prices.data.length > 1) {
          // Sort prices by amount (ascending) - lower price will be Starter, higher will be Pro
          const sortedPrices = prices.data.sort((a, b) => (a.unit_amount || 0) - (b.unit_amount || 0));

          // Create entry for Starter plan (first/lower price)
          if (sortedPrices[0]) {
            const starterPrice = sortedPrices[0];
            productsWithPrices.push({
              id: `${product.id}_starter`,
              name: 'Starter',
              price: starterPrice.unit_amount || 0,
              stripePriceId: starterPrice.id || '',
              paymentLink: paymentLinks['Starter'] || '',
              features: product.description ? product.description.split('\n').filter((f: string) => f.trim()) : [],
              maxUsers: parseInt(product.metadata?.maxUsers || '0'),
              storage: product.metadata?.storage || '—',
              priority: 1,
            });
          }

          // Create entry for Pro plan (second/higher price)
          if (sortedPrices[1]) {
            const proPrice = sortedPrices[1];
            productsWithPrices.push({
              id: `${product.id}_pro`,
              name: 'Pro',
              price: proPrice.unit_amount || 0,
              stripePriceId: proPrice.id || '',
              paymentLink: paymentLinks['Pro'] || '',
              features: product.description ? product.description.split('\n').filter((f: string) => f.trim()) : [],
              maxUsers: parseInt(product.metadata?.maxUsers || '0'),
              storage: product.metadata?.storage || '—',
              priority: 2,
            });
          }
        } else if (prices.data.length === 1) {
          // Single price - determine plan name from metadata or price amount
          const price = prices.data[0];
          const planName = product.metadata?.planName ||
            (price.metadata?.planName) ||
            ((price.unit_amount || 0) < 3000 ? 'Starter' : 'Pro');

          productsWithPrices.push({
            id: product.id,
            name: planName,
            price: price.unit_amount || 0,
            stripePriceId: price.id || '',
            paymentLink: paymentLinks[planName] || '',
            features: product.description ? product.description.split('\n').filter((f: string) => f.trim()) : [],
            maxUsers: parseInt(product.metadata?.maxUsers || '0'),
            storage: product.metadata?.storage || '—',
            priority: planName === 'Starter' ? 1 : 2,
          });
        }
      }

      // Sort by priority
      const sortedProducts = productsWithPrices.sort((a, b) => a.priority - b.priority);

      res.json(sortedProducts);
    } catch (error: any) {
      console.error('Error fetching products from Stripe:', error);
      // Fallback to hardcoded products on error
      const products = [
        {
          id: '1',
          name: 'Starter',
          price: 1900,
          features: ['Up to 1,000 users', '5GB storage', 'Email support', 'Basic analytics', 'API access'],
          maxUsers: 1000,
          storage: '5GB',
          priority: 1,
          stripePriceId: '',
          paymentLink: 'https://buy.stripe.com/test_4gM5kwbp37Un5NhbN4co000'
        },
        {
          id: '2',
          name: 'Pro',
          price: 4900,
          features: ['Up to 10,000 users', '50GB storage', 'Priority support', 'Advanced analytics', 'Unlimited API access', 'Custom domains', 'Team collaboration'],
          maxUsers: 10000,
          storage: '50GB',
          priority: 2,
          stripePriceId: '',
          paymentLink: 'https://buy.stripe.com/test_4gM00c64Jb6zfnR18qco001'
        },
      ];
      res.json(products);
    }
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
          // Stripe types can vary across API versions; use a safe accessor
          const subObj: any = event.data.object as any;
          const currentPeriodEndUnix: number | undefined = typeof subObj?.current_period_end === 'number' ? subObj.current_period_end : undefined;

          const dbSubscription = await storage.getSubscriptionByStripeId(String(subObj.id));
          if (dbSubscription) {
            await storage.updateSubscription(dbSubscription.id, {
              status: String(subObj.status || dbSubscription.status),
              currentPeriodEnd: currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000) : dbSubscription.currentPeriodEnd,
            });
          }
          break;

        case 'invoice.payment_succeeded':
          {
            const invoiceObj: any = event.data.object as any;
            if (invoiceObj?.subscription && typeof invoiceObj.subscription === 'string') {
              const sub = await storage.getSubscriptionByStripeId(invoiceObj.subscription);
              if (sub) {
                await storage.updateSubscription(sub.id, {
                  status: 'active'
                });
              }
            }
          }
          break;

        case 'invoice.payment_failed':
          {
            const failedInvoiceObj: any = event.data.object as any;
            if (failedInvoiceObj?.subscription && typeof failedInvoiceObj.subscription === 'string') {
              const sub = await storage.getSubscriptionByStripeId(failedInvoiceObj.subscription);
              if (sub) {
                await storage.updateSubscription(sub.id, {
                  status: 'past_due'
                });
              }
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