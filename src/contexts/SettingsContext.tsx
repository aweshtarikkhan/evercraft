import React, { createContext, useContext, useState, useEffect } from 'react';

type SettingsContextType = {
  settings: Record<string, string>;
  refreshSettings: () => Promise<void>;
  updateSettings: (updates: Record<string, string>) => Promise<boolean>;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  refreshSettings: async () => {},
  updateSettings: async () => false,
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  const refreshSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        
        // Apply theme variables dynamically to the document root
        const root = document.documentElement;
        if (data.theme_primary_color) {
          root.style.setProperty('--primary-color', data.theme_primary_color);
        }
        if (data.theme_background_color) {
          root.style.setProperty('--bg-color', data.theme_background_color);
          document.body.style.backgroundColor = data.theme_background_color;
        }
        if (data.theme_primary_font) {
          root.style.setProperty('--primary-font', `"${data.theme_primary_font}", sans-serif`);
          document.body.style.fontFamily = `"${data.theme_primary_font}", sans-serif`;
        }
        if (data.theme_heading_font) {
          root.style.setProperty('--heading-font', `"${data.theme_heading_font}", sans-serif`);
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const updateSettings = async (updates: Record<string, string>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await refreshSettings();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update settings:", err);
      return false;
    }
  };

  useEffect(() => {
    // Initial fetch
    refreshSettings();
    
    // Automatically sync content.json to database on load (adds missing keys)
    fetch(`${API_BASE_URL}/settings/sync`, { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
