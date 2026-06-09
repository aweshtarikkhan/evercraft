import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./assets/index.css";
import App from "./App";
import { SettingsProvider } from "./contexts/SettingsContext";

const originalFetch = window.fetch;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  
  // Only attach token to our own API
  if (url.includes(API_BASE_URL)) {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Bearer ${token}`);
      return originalFetch(input, { ...init, headers });
    }
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
