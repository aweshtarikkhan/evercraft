import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const adminCardStyle = { background: "#ffffff", border: "1.5px solid rgba(115, 0, 0, 0.15)", padding: "24px", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" };
const adminInputStyle = { padding: "12px 16px", borderRadius: 8, border: "2px solid rgba(115, 0, 0, 0.1)", fontSize: 15, background: "#faf5ef", color: "#1c1917", outline: "none", width: "100%", transition: "all 0.3s ease" };

const FONTS = [
  "Inter", "Playfair Display", "Roboto", "Lora", "Outfit", "Merriweather", "Poppins", "Montserrat"
];

export const DeveloperSettingsTab: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>("home");

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
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

  // Group content keys by their prefix (e.g., home, about, services, privacy)
  const groupedContent = useMemo(() => {
    const groups: Record<string, string[]> = {};
    contentKeys.forEach(key => {
      const parts = key.split('_');
      if (parts.length >= 2) {
        const pageGroup = parts[1]; // 'home', 'about', etc.
        if (!groups[pageGroup]) groups[pageGroup] = [];
        groups[pageGroup].push(key);
      }
    });
    // Add any global ones like footer
    if (!groups['global']) groups['global'] = [];
    contentKeys.forEach(key => {
      if (key.startsWith('content_footer')) {
         if (!groups['global'].includes(key)) groups['global'].push(key);
      }
    });
    return groups;
  }, [contentKeys]);

  const availablePages = Object.keys(groupedContent).filter(p => p !== 'footer'); // footer is handled globally usually

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D1B10", marginBottom: 24 }}>Developer Options & CMS</h1>
      
      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button type="submit" className="btn-primary" disabled={saving} style={{ padding: "12px 24px", fontSize: 16 }}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        <div style={{ ...adminCardStyle, marginBottom: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#730000" }}>🎨 Theme & Styling</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {themeKeys.map(key => {
              const label = key.replace('theme_', '').replace(/_/g, ' ');
              const isFont = key.includes('font');
              const isColor = key.includes('color');

              return (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#5c3a21', textTransform: 'capitalize' }}>
                    {label}
                  </label>
                  {isFont ? (
                    <select
                      value={localSettings[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      style={{ ...adminInputStyle, cursor: "pointer", appearance: "auto" }}
                    >
                      {FONTS.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                      ))}
                    </select>
                  ) : isColor ? (
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <input
                        type="color"
                        value={localSettings[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        style={{ width: 50, height: 50, padding: 0, border: "none", borderRadius: 8, cursor: "pointer", background: "transparent" }}
                      />
                      <input 
                        type="text" 
                        value={localSettings[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        style={{ ...adminInputStyle, flex: 1 }}
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={localSettings[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      style={adminInputStyle}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ ...adminCardStyle, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#730000", margin: 0 }}>📝 Content Manager</h3>
              <p style={{ color: "#6b7280", margin: "8px 0 0 0", fontSize: 14 }}>Select a page below to edit its specific content lines.</p>
            </div>
            
            <select 
              value={selectedPage} 
              onChange={e => setSelectedPage(e.target.value)}
              style={{ padding: "10px 16px", borderRadius: 8, border: "2px solid #730000", color: "#730000", fontWeight: 700, outline: "none", cursor: "pointer", appearance: "auto", minWidth: 200, fontSize: 15 }}
            >
              {availablePages.map(page => (
                <option key={page} value={page}>{page.toUpperCase()} PAGE</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: "20px", background: "#fdfcfa", borderRadius: 12, border: "1px dashed rgba(115, 0, 0, 0.2)" }}>
            {groupedContent[selectedPage]?.length > 0 ? (
              groupedContent[selectedPage].map(key => {
                const label = key.replace(`content_${selectedPage}_`, '').replace(`content_`, '').replace(/_/g, ' ');
                const isLongText = key.includes('text') || key.includes('description') || key.includes('content') || key.includes('p1') || key.includes('p2');
                
                return (
                  <div key={key}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: '#5c3a21', textTransform: 'capitalize' }}>
                      {label}
                    </label>
                    {isLongText ? (
                      <textarea
                        value={localSettings[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        style={{ ...adminInputStyle, minHeight: 120, resize: "vertical", fontFamily: "inherit" }}
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
                )
              })
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                No editable fields found for this section.
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
