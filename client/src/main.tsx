import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/lib/auth-context";

// Sentry initialization is disabled to avoid build-time resolution issues.
// If you need Sentry, ensure the dependency is installed and re-enable.

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
