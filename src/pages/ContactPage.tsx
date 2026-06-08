import React, { useState } from "react";
import { motion } from "framer-motion";
import { SEO } from "../components/common/SEO";
import { Breadcrumbs } from "../components/common/Breadcrumbs";
import { NewsletterSection } from "../components/common/UIComponents";
import { SOCIAL_LINKS } from "../constants/data";
import { WordReveal } from "../components/common/WordReveal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function ContactPage({ settings = {} }: { settings?: any }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#FAF5EF", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }} className="animate-bounceIn">
        <div style={{ fontSize: 80, marginBottom: 24 }}>📩</div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: "#730000", marginBottom: 12 }}>Message Sent!</h2>
        <p style={{ color: "#2D1B10", fontSize: 16, marginBottom: 32 }}>Thank you <strong>{form.name}</strong>! We've received your message and will get back to you within 24–48 hours.</p>
        <button className="btn-primary" onClick={() => setSubmitted(false)}>Send Another Message</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      <SEO 
        title="Contact Us" 
        description="Get in touch with EverCraft Publications. We are here to answer your queries regarding book publishing, buying books, and other services."
      />
      {/* HERO */}
      <div style={{ background: "#ffffff", borderBottom: "1.5px solid rgba(115, 0, 0, 0.15)", padding: "40px 24px", textAlign: "center", color: "#730000" }}>
        <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
          <Breadcrumbs items={[{ title: 'Contact Us', path: '/contact' }]} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", border: "1.5px solid rgba(115, 0, 0, 0.2)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
            <span style={{ color: "#730000", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Contact Us</span>
          </div>
          <h1 style={{ fontSize: "clamp(38px,5.5vw,56px)", fontWeight: 800, marginBottom: 14, color: "#730000", fontFamily: "'Playfair Display', Georgia, serif" }}>
            <WordReveal text="Get In *Touch*" once={true} />
          </h1>
          <p style={{ color: "#5C3A21", opacity: 0.9, fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Have questions about publishing or an existing order? We'd love to hear from you.
          </p>
        </motion.div>
      </div>

      <div style={{ padding: "80px 24px", background: "#FAF5EF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 3fr", gap: 60 }} className="con-grid">
          {/* Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            {[
              { icon: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>, title: "Our Office", lines: [settings.contact_address || "Vrindavan Nagar, Bhopal - 462022"] },
              { icon: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>, title: "Email Us", lines: [settings.contact_email || "evercraft2026@gmail.com"] },
              { icon: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>, title: "Call Us", lines: [settings.contact_phone || "+91 90090 36633", settings.contact_hours || "Mon–Fri, 10 AM – 6 PM IST"] },
              { icon: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>, title: "Buy Our Books", lines: ["Available on Amazon, Flipkart & ONDC" , "And major bookstores nationwide"] },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: 20, background: "#ffffff", borderRadius: 16, border: "1.5px solid rgba(115, 0, 0, 0.15)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                <span style={{ fontSize: 24, flexShrink: 0, color: "#730000", display: "flex", marginTop: 2 }}>{c.icon}</span>
                <div>
                  <h4 style={{ fontWeight: 800, color: "#730000", marginBottom: 6, fontSize: 15 }}>{c.title}</h4>
                  {c.lines.map(l => <p key={l} style={{ color: "#2D1B10", fontSize: 13, lineHeight: 1.5 }}>{l}</p>)}
                </div>
              </div>
            ))}
            
            <div style={{ background: "#730000", border: "1px solid rgba(212, 175, 55, 0.15)", borderRadius: 16, padding: 24, color: "#fff" }}>
              <h4 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, color: "#D4AF37" }}>Follow EverCraft</h4>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { name: "Facebook", url: settings.social_facebook || "https://www.facebook.com/EvercraftPublications", icon: SOCIAL_LINKS.find(s => s.name === "Facebook")?.icon },
                  { name: "Instagram", url: settings.social_instagram || "https://www.instagram.com/evercraft_publications/", icon: SOCIAL_LINKS.find(s => s.name === "Instagram")?.icon },
                  { name: "LinkedIn", url: settings.social_linkedin || "https://www.linkedin.com/company/bookpublishing/about/", icon: SOCIAL_LINKS.find(s => s.name === "LinkedIn")?.icon },
                  { name: "X", url: settings.social_x || "#", icon: SOCIAL_LINKS.find(s => s.name === "X")?.icon }
                ].map(({ icon, name, url }) => (
                  <a key={name} href={url} target="_blank" rel="noreferrer" title={name} style={{ width: 40, height: 40, background: "rgba(255,255,255,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, transition: "background 0.2s", color: "inherit", textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#730000", marginBottom: 32 }}>Send Us a Message</h2>
            <form onSubmit={async e => { 
              e.preventDefault(); 
              try {
                await fetch(`${API_BASE_URL}/contact-messages`, {
                  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
                });
              } catch(err) {
                console.error(err);
              }
              setSubmitted(true); 
            }} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="con-form-row">
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Full Name *</label>
                  <input required placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{ width: "100%", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#2D1B10" }}
                    onFocus={e => e.target.style.borderColor = "#730000"} onBlur={e => e.target.style.borderColor = "rgba(115, 0, 0, 0.15)"} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Email Address *</label>
                  <input required type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: "100%", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#2D1B10" }}
                    onFocus={e => e.target.style.borderColor = "#730000"} onBlur={e => e.target.style.borderColor = "rgba(115, 0, 0, 0.15)"} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="con-form-row">
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Phone Number</label>
                  <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: "100%", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#2D1B10" }}
                    onFocus={e => e.target.style.borderColor = "#730000"} onBlur={e => e.target.style.borderColor = "rgba(115, 0, 0, 0.15)"} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Subject *</label>
                  <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    style={{ width: "100%", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", cursor: "pointer", boxSizing: "border-box", background: "#ffffff", color: "#2D1B10" }}>
                    <option value="" style={{color: "#2D1B10"}}>Select subject</option>
                    {["Publishing Inquiry","Book Order","General Query","Media & Press","Partnership","Feedback","Other"].map(s => <option key={s} value={s} style={{color: "#2D1B10"}}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Message *</label>
                <textarea required rows={6} placeholder="How can we help you?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ width: "100%", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", background: "#ffffff", color: "#2D1B10" }}
                  onFocus={e => e.target.style.borderColor = "#730000"} onBlur={e => e.target.style.borderColor = "rgba(115, 0, 0, 0.15)"} />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: "15px 20px", fontSize: 16 }}>Send Message 📤</button>
            </form>
          </motion.div>
        </div>
      </div>
      <NewsletterSection />
      <style>{`
        .con-grid { @media(max-width:900px){grid-template-columns:1fr!important;} }
        .con-form-row { @media(max-width:480px){grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}