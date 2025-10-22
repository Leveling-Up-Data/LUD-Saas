import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

// Optional Sentry (disabled if dependency missing)
let Sentry: any = null;

const app = express();

// Sentry is already configured with expressIntegration in the init

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  // Try to enable Sentry if available
  try {
    const mod = await import("@sentry/node");
    Sentry = mod;
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
      beforeSend(event: any) {
        if (event.request?.data) {
          delete (event.request.data as any).password;
          delete (event.request.data as any).token;
          delete (event.request.data as any).secret;
        }
        return event;
      },
    });
  } catch (e: any) {
    console.warn("Sentry is not installed; continuing without Sentry.");
  }

  const server = await registerRoutes(app);

  // Sentry error handler must be before any other error middleware
  if (Sentry?.expressErrorHandler) {
    app.use(Sentry.expressErrorHandler());
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    const { serveStatic } = await import("./vite");
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Cloud Run requires the PORT environment variable to be used
  // Default to 8080 if not specified (Cloud Run standard)
  const port = parseInt(process.env.PORT || '8080', 10);

  // Ensure we're in production mode for Cloud Run
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV = 'production';
  }
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    console.log(`${formattedTime} [express] serving on port ${port}`);
  });
})();
