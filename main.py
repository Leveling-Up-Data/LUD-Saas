"""
Stripe Webhook Test Server
This server receives and logs all Stripe webhook events for testing purposes.
"""

import os
import json
from flask import Flask, request, jsonify
import stripe
from datetime import datetime

app = Flask(__name__)

# Load Stripe configuration from environment variables
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')

if not STRIPE_SECRET_KEY:
    print("⚠️  WARNING: STRIPE_SECRET_KEY not set. Please set it as an environment variable.")
    print("   Example: export STRIPE_SECRET_KEY=sk_test_...")
else:
    stripe.api_key = STRIPE_SECRET_KEY

if not STRIPE_WEBHOOK_SECRET:
    print("⚠️  WARNING: STRIPE_WEBHOOK_SECRET not set. Webhook signature verification will be disabled.")
    print("   For production, always set this to verify webhook authenticity.")
    print("   You can get this from: https://dashboard.stripe.com/webhooks")

# Store received events (in-memory, for demonstration)
# In production, you'd store these in a database
received_events = []


def log_event(event_type, event_data):
    """Log event details to console with formatting"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print("\n" + "=" * 80)
    print(f"📦 STRIPE WEBHOOK EVENT RECEIVED")
    print(f"   Time: {timestamp}")
    print(f"   Type: {event_type}")
    print(f"   ID: {event_data.get('id', 'N/A')}")
    print("-" * 80)
    
    # Pretty print the event data
    event_json = json.dumps(event_data, indent=2, default=str)
    print(event_json)
    print("=" * 80 + "\n")


@app.route('/webhook', methods=['POST'])
def webhook():
    """
    Stripe webhook endpoint
    Receives all Stripe events and logs them for testing
    """
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    if not sig_header:
        print("⚠️  Missing Stripe-Signature header")
        return jsonify({'error': 'Missing Stripe-Signature header'}), 400
    
    # Verify webhook signature if secret is configured
    if STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            print(f"❌ Invalid payload: {e}")
            return jsonify({'error': 'Invalid payload'}), 400
        except stripe.error.SignatureVerificationError as e:
            print(f"❌ Invalid signature: {e}")
            return jsonify({'error': 'Invalid signature'}), 400
    else:
        # If webhook secret not set, parse event without verification (for testing only)
        print("⚠️  WARNING: Webhook signature verification disabled!")
        try:
            event = json.loads(payload)
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON: {e}")
            return jsonify({'error': 'Invalid JSON'}), 400
    
    # Extract event details
    event_type = event.get('type', 'unknown')
    event_id = event.get('id', 'unknown')
    event_data = event.get('data', {})
    event_object = event_data.get('object', {})
    
    # Log the event
    log_event(event_type, event)
    
    # Store event (for demonstration - in production, save to database)
    received_events.append({
        'id': event_id,
        'type': event_type,
        'received_at': datetime.now().isoformat(),
        'data': event
    })
    
    # Handle specific event types (expand as needed for your integration)
    try:
        if event_type == 'customer.subscription.created':
            handle_subscription_created(event_object)
        elif event_type == 'customer.subscription.updated':
            handle_subscription_updated(event_object)
        elif event_type == 'customer.subscription.deleted':
            handle_subscription_deleted(event_object)
        elif event_type == 'invoice.payment_succeeded':
            handle_payment_succeeded(event_object)
        elif event_type == 'invoice.payment_failed':
            handle_payment_failed(event_object)
        elif event_type == 'customer.created':
            handle_customer_created(event_object)
        elif event_type == 'customer.updated':
            handle_customer_updated(event_object)
        elif event_type == 'payment_intent.succeeded':
            handle_payment_intent_succeeded(event_object)
        elif event_type == 'payment_intent.payment_failed':
            handle_payment_intent_failed(event_object)
        else:
            print(f"ℹ️  Unhandled event type: {event_type}")
            print(f"   You can add a handler function for this event type in main.py")
    except Exception as e:
        print(f"❌ Error handling event {event_type}: {e}")
    
    # Always return 200 to acknowledge receipt
    return jsonify({'received': True, 'event_id': event_id, 'event_type': event_type}), 200


# Event handler functions (customize these for your integration)

def handle_subscription_created(subscription):
    """Handle subscription creation"""
    print(f"✅ Subscription created: {subscription.get('id')}")
    print(f"   Customer: {subscription.get('customer')}")
    print(f"   Status: {subscription.get('status')}")
    print(f"   Plan: {subscription.get('items', {}).get('data', [{}])[0].get('price', {}).get('id', 'N/A')}")


def handle_subscription_updated(subscription):
    """Handle subscription update"""
    print(f"🔄 Subscription updated: {subscription.get('id')}")
    print(f"   Status: {subscription.get('status')}")
    print(f"   Current period end: {subscription.get('current_period_end')}")


def handle_subscription_deleted(subscription):
    """Handle subscription deletion"""
    print(f"🗑️  Subscription deleted: {subscription.get('id')}")
    print(f"   Status: {subscription.get('status')}")


def handle_payment_succeeded(invoice):
    """Handle successful payment"""
    print(f"💰 Payment succeeded!")
    print(f"   Invoice: {invoice.get('id')}")
    print(f"   Amount: ${invoice.get('amount_paid', 0) / 100:.2f}")
    print(f"   Customer: {invoice.get('customer')}")
    if invoice.get('subscription'):
        print(f"   Subscription: {invoice.get('subscription')}")


def handle_payment_failed(invoice):
    """Handle failed payment"""
    print(f"❌ Payment failed!")
    print(f"   Invoice: {invoice.get('id')}")
    print(f"   Amount: ${invoice.get('amount_due', 0) / 100:.2f}")
    print(f"   Customer: {invoice.get('customer')}")


def handle_customer_created(customer):
    """Handle customer creation"""
    print(f"👤 Customer created: {customer.get('id')}")
    print(f"   Email: {customer.get('email', 'N/A')}")


def handle_customer_updated(customer):
    """Handle customer update"""
    print(f"👤 Customer updated: {customer.get('id')}")
    print(f"   Email: {customer.get('email', 'N/A')}")


def handle_payment_intent_succeeded(payment_intent):
    """Handle successful payment intent"""
    print(f"💳 Payment intent succeeded: {payment_intent.get('id')}")
    print(f"   Amount: ${payment_intent.get('amount', 0) / 100:.2f}")
    print(f"   Currency: {payment_intent.get('currency', 'usd').upper()}")


def handle_payment_intent_failed(payment_intent):
    """Handle failed payment intent"""
    print(f"💳 Payment intent failed: {payment_intent.get('id')}")
    print(f"   Error: {payment_intent.get('last_payment_error', {}).get('message', 'Unknown error')}")


@app.route('/events', methods=['GET'])
def list_events():
    """
    List all received events (for testing/debugging)
    """
    return jsonify({
        'total_events': len(received_events),
        'events': received_events[-50:]  # Last 50 events
    })


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'stripe_configured': STRIPE_SECRET_KEY is not None,
        'webhook_secret_configured': STRIPE_WEBHOOK_SECRET is not None,
        'total_events_received': len(received_events)
    })


@app.route('/', methods=['GET'])
def index():
    """Root endpoint with instructions"""
    return jsonify({
        'service': 'Stripe Webhook Test Server',
        'endpoints': {
            '/webhook': 'POST - Stripe webhook endpoint',
            '/events': 'GET - List all received events',
            '/health': 'GET - Health check'
        },
        'configuration': {
            'stripe_secret_key': '✅ Set' if STRIPE_SECRET_KEY else '❌ Not set',
            'webhook_secret': '✅ Set' if STRIPE_WEBHOOK_SECRET else '❌ Not set'
        },
        'instructions': [
            '1. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET environment variables',
            '2. Run: python main.py',
            '3. Use ngrok or similar to expose localhost:5000 to the internet',
            '4. Configure Stripe webhook URL: https://your-ngrok-url.ngrok.io/webhook',
            '5. Select all events or specific events you want to receive',
            '6. Test by creating a subscription, payment, etc. in Stripe dashboard'
        ]
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("\n" + "=" * 80)
    print("🚀 Stripe Webhook Test Server Starting")
    print("=" * 80)
    print(f"📍 Server will run on: http://localhost:{port}")
    print(f"📡 Webhook endpoint: http://localhost:{port}/webhook")
    print(f"📋 Events list: http://localhost:{port}/events")
    print(f"❤️  Health check: http://localhost:{port}/health")
    
    if STRIPE_SECRET_KEY:
        print(f"✅ Stripe secret key: {STRIPE_SECRET_KEY[:20]}...")
    else:
        print("❌ Stripe secret key: NOT SET")
    
    if STRIPE_WEBHOOK_SECRET:
        print(f"✅ Webhook secret: {STRIPE_WEBHOOK_SECRET[:20]}...")
    else:
        print("❌ Webhook secret: NOT SET (signature verification disabled)")
    
    print("\n💡 To test locally with Stripe:")
    print("   1. Install ngrok: https://ngrok.com/download")
    print("   2. Run: ngrok http 5000")
    print("   3. Copy the https URL (e.g., https://abc123.ngrok.io)")
    print("   4. In Stripe Dashboard > Webhooks > Add endpoint")
    print("   5. URL: https://abc123.ngrok.io/webhook")
    print("   6. Select events or 'Send all events'")
    print("   7. Copy the webhook signing secret and set STRIPE_WEBHOOK_SECRET")
    print("=" * 80 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=True)

