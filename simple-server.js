import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as Sentry from '@sentry/node';

// Initialize Sentry with profiling
Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://a6c9e23b8ebe380495ffb8991a6541e6@log.levelingupdata.com/3",
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    Sentry.expressIntegration(),
    Sentry.httpIntegration(),
    Sentry.nativeNodeFetchIntegration(),
  ],
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.token;
      delete event.request.data.secret;
    }
    return event;
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Sentry is already configured with expressIntegration in the init

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Test endpoint for Sentry error tracking
app.get('/api/test-sentry', (req, res) => {
  try {
    throw new Error('This is a test error for Sentry!');
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: 'Test error sent to Sentry', error: error.message });
  }
});

// Test endpoint for Sentry performance monitoring
app.get('/api/test-performance', async (req, res) => {
  const span = Sentry.startSpan({
    name: 'Test Performance Endpoint',
    op: 'http.server',
  }, async (span) => {
    try {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Add some breadcrumbs
      Sentry.addBreadcrumb({
        message: 'Processing performance test',
        category: 'test',
        level: 'info',
      });
      
      span.setStatus({ code: 1, message: 'ok' });
      res.json({ 
        message: 'Performance test completed',
        duration: '100ms',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      span.setStatus({ code: 2, message: 'internal_error' });
      Sentry.captureException(error);
      res.status(500).json({ message: 'Performance test failed', error: error.message });
    }
  });
});

// Test endpoint for Sentry profiling
app.get('/api/test-profiling', (req, res) => {
  const startTime = Date.now();
  
  // Simulate CPU-intensive work for profiling
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }
  
  const duration = Date.now() - startTime;
  
  Sentry.addBreadcrumb({
    message: 'Profiling test completed',
    category: 'profiling',
    level: 'info',
    data: {
      duration: `${duration}ms`,
      iterations: 1000000,
      result: result.toFixed(2)
    }
  });
  
  res.json({
    message: 'Profiling test completed',
    duration: `${duration}ms`,
    iterations: 1000000,
    result: result.toFixed(2)
  });
});

// Serve static files from the built frontend
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Serve the React app for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  // If it's an API route, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For all other routes, serve the React app
  const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // If index.html doesn't exist, return a simple HTML page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LUD-SaaS</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; }
          .api-list { background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .api-item { margin: 10px 0; }
          .method { background: #007bff; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
          .endpoint { font-family: monospace; margin-left: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 LUD-SaaS API</h1>
          <p>Welcome to the LUD-SaaS API! The frontend is being built. Here are the available endpoints:</p>
          
          <div class="api-list">
            <h3>Available API Endpoints:</h3>
            <div class="api-item">
              <span class="method">GET</span>
              <span class="endpoint">/api/health</span> - Health check
            </div>
            <div class="api-item">
              <span class="method">GET</span>
              <span class="endpoint">/api/products</span> - Get available products
            </div>
          </div>
          
          <p><strong>Service URL:</strong> ${req.protocol}://${req.get('host')}</p>
          <p><strong>Status:</strong> ✅ Running</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Sentry error handler must be before any other error middleware
app.use(Sentry.expressErrorHandler());

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 LUD-SaaS server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🛍️  Products API: http://localhost:${port}/api/products`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
