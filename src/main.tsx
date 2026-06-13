import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./assets/index.css";
import App from "./App";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Protected endpoints that actually need the Authorization header
const PROTECTED_PREFIXES = [
  "/users/", "/orders", "/coupons", "/subscribers",
  "/cookie-consent", "/publish-request", "/contact-message",
  "/service-inquir", "/service-feedback", "/team-member",
  "/settings/sync", "/admin"
];

const originalFetch = window.fetch;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  
  // Only attach token to protected API endpoints (not public ones like /books, /front-stats, /testimonials)
  if (url.includes(API_BASE_URL)) {
    const pathAfterApi = url.split(API_BASE_URL)[1] || "";
    const isProtected = PROTECTED_PREFIXES.some(prefix => pathAfterApi.startsWith(prefix));
    
    if (isProtected) {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new Headers(init?.headers);
        headers.set('Authorization', `Bearer ${token}`);
        return originalFetch(input, { ...init, headers });
      }
    }
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);
