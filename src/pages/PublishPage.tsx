import React, { useState } from "react";
import { motion } from "framer-motion";
import { NewsletterSection } from "../components/common/UIComponents";
import { WordReveal } from "../components/common/WordReveal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function PublishPage({ settings = {} }: { settings?: any }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", genre: "", manuscript: "" });
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#FAF5EF", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }} className="animate-bounceIn">
        <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: "#730000", marginBottom: 12 }}>Manuscript Submitted!</h2>
        <p style={{ color: "#2D1B10", marginBottom: 8, fontSize: 16 }}>Thank you <strong>{form.name}</strong> for reaching out to EverCraft Publications.</p>
        <p style={{ color: "#5C3A21", marginBottom: 32, fontSize: 15 }}>Our editorial team will review your submission and get back to you within <strong>3–5 business days</strong>.</p>
        <button className="btn-primary" onClick={() => setSubmitted(false)}>Submit Another Manuscript</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* HERO */}
      <div style={{ background: "#ffffff", borderBottom: "1.5px solid rgba(115, 0, 0, 0.15)", padding: "80px 24px", textAlign: "center", color: "#730000" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", border: "1.5px solid rgba(115, 0, 0, 0.2)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
            <span style={{ color: "#730000", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>For Authors</span>
          </div>
          <h1 style={{ fontSize: "clamp(38px,5.5vw,56px)", fontWeight: 800, marginTop: 10, marginBottom: 16, color: "#730000", fontFamily: "'Playfair Display', Georgia, serif" }}>
            <WordReveal text={settings.content_publish_hero_title || "Publish With *EverCraft*"} once={true} />
          </h1>
          <p style={{ color: "#5C3A21", opacity: 0.9, fontSize: 16, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            {settings.content_publish_hero_subtitle || "Start your publishing journey today. Submit your manuscript and our expert team will guide you every step of the way."}
          </p>
        </motion.div>
      </div>

      <div style={{ padding: "80px 24px", background: "#FAF5EF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }} className="pub-grid">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#730000", marginBottom: 32 }}>Submit Your Manuscript</h2>
            <form onSubmit={async e => { 
              e.preventDefault(); 
              try {
                await fetch(`${API_BASE_URL}/publish-requests`, {
                  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
                });
              } catch(err) {
                console.error(err);
              }
              setSubmitted(true); 
            }} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { k: "name", label: "Full Name *", type: "text", ph: "Your full name" },
                { k: "email", label: "Email Address *", type: "email", ph: "your@email.com" },
                { k: "phone", label: "Phone Number *", type: "tel", ph: "+91 98765 43210" },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#730000", marginBottom: 6 }}>{f.label}</label>
                  <input required type={f.type} placeholder={f.ph} value={(form as any)[f.k]}
                    onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                    style={{ width: "100%", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", transition: "border 0.2s", boxSizing: "border-box", background: "#ffffff", color: "#2D1B10" }}
                    onFocus={e => e.target.style.borderColor = "#730000"} onBlur={e => e.target.style.borderColor = "rgba(115, 0, 0, 0.15)"} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Genre / Category *</label>
                <select required value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}
                  style={{ width: "100%", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", cursor: "pointer", boxSizing: "border-box", background: "#ffffff", color: "#2D1B10" }}>
                  <option value="" style={{color: "#2D1B10"}}>Select genre</option>
                  {["Spirituality", "Self-Help", "Fiction", "Non-Fiction", "Biography", "Poetry", "Children's Books", "Educational", "Health & Wellness", "Business", "Other"].map(g => <option key={g} value={g} style={{color: "#2D1B10"}}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#730000", marginBottom: 6 }}>About Your Manuscript *</label>
                <textarea required rows={5} placeholder="Briefly describe your manuscript — title, theme, target audience, word count, and why it should be published..."
                  value={form.manuscript} onChange={e => setForm({ ...form, manuscript: e.target.value })}
                  style={{ width: "100%", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", background: "#ffffff", color: "#2D1B10" }}
                  onFocus={e => e.target.style.borderColor = "#730000"} onBlur={e => e.target.style.borderColor = "rgba(115, 0, 0, 0.15)"} />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: "15px 20px", fontSize: 16 }}>Submit Manuscript ✒️</button>
              <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}>By submitting, you agree to our privacy policy. We respond within 3–5 business days.</p>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            <div style={{ background: "#ffffff", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 20, padding: 32, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#730000", marginBottom: 20 }}>Why Publish With Us?</h3>
              {["Free initial manuscript evaluation", "Professional editing & proofreading", "Premium cover & layout design", "High-quality printing", "Pan-India distribution network", "Listed on Amazon, Flipkart & ONDC", "Digital marketing & promotion", "Transparent royalty structure", "Dedicated author support team"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(115, 0, 0, 0.1)" }}>
                  <span style={{ color: "#16a34a", fontWeight: 800 }}>✅</span>
                  <span style={{ fontSize: 14, color: "#2D1B10", fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
            
            <div style={{ background: "#730000", border: "1px solid rgba(212, 175, 55, 0.15)", borderRadius: 20, padding: 32, color: "#fff" }}>
              <div style={{ fontSize: 36, marginBottom: 12, display: "flex", color: "#D4AF37" }}>
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "#D4AF37" }}>Prefer to Talk?</h3>
              <p style={{ opacity: 0.9, fontSize: 14, marginBottom: 16, lineHeight: 1.6, color: "#FAF5EF" }}>Our publishing consultants are available to discuss your project personally.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14, color: "#FAF5EF" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18, display: "flex", color: "#D4AF37" }}><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></span>
                  <span>{settings.contact_email || "evercraft2026@gmail.com"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18, display: "flex", color: "#D4AF37" }}><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>
                  <span>{settings.contact_phone || "+91 90090 36633"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18, display: "flex", color: "#D4AF37" }}><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></span>
                  <span>{settings.contact_hours || "Mon–Fri, 10 AM – 6 PM IST"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <NewsletterSection />
      <style>{`.pub-grid { @media(max-width:900px){grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}