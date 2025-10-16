// PocketBase Hook: Create Subscription
// This hook handles subscription creation with Stripe integration
// Place this file in your PocketBase hooks directory

onBeforeServe((e) => {
  // Add custom route for subscription creation
  e.router.add("POST", "/api/create-subscription", (c) => {
    return new Promise(async (resolve) => {
      try {
        const { userId, stripePriceId } = await c.req.json();
        
        if (!userId || !stripePriceId) {
          return resolve(c.json({
            error: "User ID and price ID required"
          }, 400));
        }

        // Get user data
        const user = await $app.dao().findFirstRecordByData("users", "id", userId);
        if (!user) {
          return resolve(c.json({
            error: "User not found"
          }, 404));
        }

        // Get product data
        const product = await $app.dao().findFirstRecordByData("products", "stripePriceId", stripePriceId);
        if (!product) {
          return resolve(c.json({
            error: "Product not found"
          }, 404));
        }

        // Check if user already has an active subscription
        if (user.get("stripeSubscriptionId")) {
          // You might want to check Stripe API here to verify subscription status
          return resolve(c.json({
            error: "User already has a subscription"
          }, 400));
        }

        // Initialize Stripe
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        let customerId = user.get("stripeCustomerId");
        
        // Create Stripe customer if doesn't exist
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.get("email"),
            name: user.get("name"),
          });
          customerId = customer.id;
          
          // Update user with Stripe customer ID
          user.set("stripeCustomerId", customerId);
          await $app.dao().saveRecord(user);
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

        // Update user with Stripe subscription ID
        user.set("stripeSubscriptionId", subscription.id);
        await $app.dao().saveRecord(user);

        // Create subscription record in PocketBase
        const subscriptionRecord = new Record($app.dao().findCollectionByNameOrId("subscriptions"));
        subscriptionRecord.set("userId", userId);
        subscriptionRecord.set("plan", product.get("name").toLowerCase());
        subscriptionRecord.set("stripeSubscriptionId", subscription.id);
        subscriptionRecord.set("status", subscription.status);
        subscriptionRecord.set("currentPeriodEnd", new Date(subscription.current_period_end * 1000).toISOString());
        subscriptionRecord.set("amount", product.get("price"));
        subscriptionRecord.set("trialEnd", subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null);
        
        await $app.dao().saveRecord(subscriptionRecord);

        const latest_invoice = subscription.latest_invoice;
        const payment_intent = latest_invoice?.payment_intent;

        resolve(c.json({
          subscriptionId: subscription.id,
          clientSecret: payment_intent?.client_secret,
          status: subscription.status
        }));

      } catch (error) {
        console.error('Subscription creation error:', error);
        resolve(c.json({
          error: "Error creating subscription: " + error.message
        }, 500));
      }
    });
  });
});
