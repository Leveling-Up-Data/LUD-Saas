// PocketBase Hook: Stripe Webhook Handler
// This hook handles Stripe webhook events for subscription updates
// Place this file in your PocketBase hooks directory

onBeforeServe((e) => {
  // Add custom route for Stripe webhooks
  e.router.add("POST", "/api/webhook", (c) => {
    return new Promise(async (resolve) => {
      try {
        const sig = c.req.header("stripe-signature");
        const body = await c.req.text();
        
        if (!sig) {
          return resolve(c.json({
            error: "Missing stripe-signature header"
          }, 400));
        }

        // Initialize Stripe
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        // Verify webhook signature
        let event;
        try {
          event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
          console.error('Webhook signature verification failed:', err.message);
          return resolve(c.json({
            error: 'Webhook signature verification failed'
          }, 400));
        }

        // Handle the event
        switch (event.type) {
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            await handleSubscriptionUpdate(event.data.object);
            break;
            
          case 'invoice.payment_succeeded':
            await handlePaymentSucceeded(event.data.object);
            break;
            
          case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
            
          default:
            console.log(`Unhandled event type ${event.type}`);
        }

        resolve(c.json({ received: true }));

      } catch (error) {
        console.error('Webhook error:', error);
        resolve(c.json({
          error: 'Webhook error: ' + error.message
        }, 400));
      }
    });
  });
});

// Helper function to handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  try {
    const subscriptionRecord = await $app.dao().findFirstRecordByData(
      "subscriptions", 
      "stripeSubscriptionId", 
      subscription.id
    );
    
    if (subscriptionRecord) {
      subscriptionRecord.set("status", subscription.status);
      subscriptionRecord.set("currentPeriodEnd", new Date(subscription.current_period_end * 1000).toISOString());
      await $app.dao().saveRecord(subscriptionRecord);
      
      console.log(`Updated subscription ${subscription.id} status to ${subscription.status}`);
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

// Helper function to handle successful payments
async function handlePaymentSucceeded(invoice) {
  try {
    if (invoice.subscription && typeof invoice.subscription === 'string') {
      const subscriptionRecord = await $app.dao().findFirstRecordByData(
        "subscriptions", 
        "stripeSubscriptionId", 
        invoice.subscription
      );
      
      if (subscriptionRecord) {
        subscriptionRecord.set("status", "active");
        await $app.dao().saveRecord(subscriptionRecord);
        
        console.log(`Payment succeeded for subscription ${invoice.subscription}`);
      }
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Helper function to handle failed payments
async function handlePaymentFailed(invoice) {
  try {
    if (invoice.subscription && typeof invoice.subscription === 'string') {
      const subscriptionRecord = await $app.dao().findFirstRecordByData(
        "subscriptions", 
        "stripeSubscriptionId", 
        invoice.subscription
      );
      
      if (subscriptionRecord) {
        subscriptionRecord.set("status", "past_due");
        await $app.dao().saveRecord(subscriptionRecord);
        
        console.log(`Payment failed for subscription ${invoice.subscription}`);
      }
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
