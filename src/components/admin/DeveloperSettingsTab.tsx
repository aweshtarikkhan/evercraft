import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const adminCardStyle = { background: "#ffffff", border: "1.5px solid rgba(115, 0, 0, 0.15)", padding: "24px", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" };
const adminInputStyle = { padding: "12px 16px", borderRadius: 8, border: "2px solid rgba(115, 0, 0, 0.1)", fontSize: 15, background: "#faf5ef", color: "#1c1917", outline: "none", width: "100%", transition: "all 0.3s ease" };

export const DeveloperSettingsTab: React.FC = () => {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Send only changes to server? No, just send what's in localSettings to simplify, or maybe filter.
    // The backend handles bulk update.
    const success = await updateSettings(localSettings);
    if (success) {
      alert('Settings saved successfully! Website UI updated.');
    } else {
      alert('Failed to save settings.');
    }
    setSaving(false);
  };

  const themeKeys = Object.keys(localSettings).filter(k => k.startsWith('theme_'));
  const contentKeys = Object.keys(localSettings).filter(k => k.startsWith('content_'));

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D1B10", marginBottom: 24 }}>Developer Options & CMS</h1>
      
      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        <div style={{ ...adminCardStyle, marginBottom: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#730000" }}>🎨 Theme & Styling</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {themeKeys.map(key => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#5c3a21', textTransform: 'capitalize' }}>
                  {key.replace('theme_', '').replace(/_/g, ' ')}
                </label>
                <input
                  type={key.includes('color') ? "color" : "text"}
                  value={localSettings[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{ ...adminInputStyle, padding: key.includes('color') ? "4px 8px" : adminInputStyle.padding, height: key.includes('color') ? 50 : "auto", cursor: key.includes('color') ? "pointer" : "text" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...adminCardStyle, marginBottom: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#730000" }}>📝 Website Content Manager</h3>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>Edit website text here. Changes reflect immediately on save.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {contentKeys.map(key => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#5c3a21', textTransform: 'capitalize' }}>
                  {key.replace('content_', '').replace(/_/g, ' ')}
                </label>
                {localSettings[key] && localSettings[key].length > 100 ? (
                  <textarea
                    value={localSettings[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={{ ...adminInputStyle, minHeight: 120, resize: "vertical" }}
                  />
                ) : (
                  <input
                    type="text"
                    value={localSettings[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={adminInputStyle}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
