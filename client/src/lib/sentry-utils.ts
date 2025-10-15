import * as Sentry from "@sentry/react";

// Sentry utility functions for enhanced monitoring

/**
 * Capture user feedback with context
 */
export const captureUserFeedback = (message: string, email?: string, name?: string) => {
  Sentry.captureUserFeedback({
    event_id: Sentry.lastEventId(),
    name: name || 'Anonymous',
    email: email || '',
    comments: message,
  });
};

/**
 * Add breadcrumb for user actions
 */
export const addUserActionBreadcrumb = (action: string, category: string = 'user') => {
  Sentry.addBreadcrumb({
    message: action,
    category,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
};

/**
 * Set user context for better debugging
 */
export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

/**
 * Clear user context (for logout)
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};

/**
 * Capture performance measurement
 */
export const capturePerformance = (name: string, duration: number, tags?: Record<string, string>) => {
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    category: 'performance',
    level: 'info',
    data: {
      duration,
      ...tags,
    },
  });
};

/**
 * Start a custom span
 */
export const startSpan = (name: string, op: string = 'custom', callback: (span: any) => void) => {
  return Sentry.startSpan({
    name,
    op,
  }, callback);
};

/**
 * Capture API call with context
 */
export const captureApiCall = (url: string, method: string, status?: number, duration?: number) => {
  Sentry.addBreadcrumb({
    message: `${method} ${url}`,
    category: 'http',
    level: status && status >= 400 ? 'error' : 'info',
    data: {
      url,
      method,
      status_code: status,
      duration,
    },
  });
};

/**
 * Capture navigation event
 */
export const captureNavigation = (from: string, to: string) => {
  Sentry.addBreadcrumb({
    message: `Navigation: ${from} → ${to}`,
    category: 'navigation',
    level: 'info',
  });
};

/**
 * Capture error with additional context
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};

/**
 * Capture message with level
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level);
};
