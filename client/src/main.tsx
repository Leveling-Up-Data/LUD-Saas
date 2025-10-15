import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/lib/auth-context";

// Initialize Sentry with advanced features
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "https://e71bb93939caf221e2a6591396405c81@log.levelingupdata.com/2",
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration({
      // Enable tracing for all navigation
      enableLongTask: true,
    }),
    Sentry.replayIntegration({
      // Enhanced replay configuration
      maskAllText: false,
      blockAllMedia: false,
      maskAllInputs: false,
      // Network capture for better debugging
      networkDetailAllowUrls: [
        window.location.origin,
        'https://api.levelingupdata.com',
        'https://pb.levelingupdata.com',
      ],
      networkCaptureBodies: true,
      networkRequestHeaders: ['User-Agent', 'Content-Type', 'Authorization'],
      networkResponseHeaders: ['Content-Type', 'Content-Length'],
      // Performance optimization
      beforeAddBreadcrumb: (breadcrumb: any) => {
        // Filter out sensitive breadcrumbs
        if (breadcrumb.category === 'console' && breadcrumb.message?.includes('password')) {
          return null;
        }
        return breadcrumb;
      },
    }),
    // Additional integrations for better monitoring
    // Sentry.feedbackIntegration({
    //   colorScheme: 'light',
    //   showBranding: false,
    // }),
  ],
  // Performance Monitoring
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  // Session Replay - Enhanced configuration
  replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 0.5,
  replaysOnErrorSampleRate: 1.0,
  // Profiling
  profilesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  // Additional options
  beforeSend(event: any) {
    // Filter out sensitive data
    if (event.request?.data) {
      delete (event.request.data as any).password;
      delete (event.request.data as any).token;
    }
    return event;
  },
  beforeSendTransaction(event: any) {
    // Filter out sensitive transaction data
    if (event.transaction?.includes('password')) {
      return null;
    }
    return event;
  },
});

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
