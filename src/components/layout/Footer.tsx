import React from "react";
import { Page, Book } from "../../types";
import { SOCIAL_LINKS } from "../../constants/data";
import { Link } from "react-router-dom";

export function Footer({ go, books = [], settings = {} }: { go?: (p: Page) => void; books?: Book[]; settings?: any }) {
  const facebookUrl = settings.social_facebook || "https://www.facebook.com/EvercraftPublications";
  const instagramUrl = settings.social_instagram || "https://www.instagram.com/evercraft_publications/";
  const linkedinUrl = settings.social_linkedin || "https://www.linkedin.com/company/bookpublishing/about/";
  const xUrl = settings.social_x || "#";

  const localSocialLinks = [
    { name: "Facebook", url: facebookUrl, icon: <svg width="1.2em" height="1.2em" fill="currentColor" viewBox="2 2 20 20"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg> },
    { name: "Instagram", url: instagramUrl, icon: <svg width="1.2em" height="1.2em" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 1.76-6.98 6.979-.058 1.28-.072 1.688-.072 4.948s.014 3.666.072 4.947c.2 5.232 2.646 6.78 6.98 6.98 1.28.058 1.689.072 4.947.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-1.771 6.979-6.98.059-1.281.073-1.687.073-4.947s-.014-3.668-.072-4.948c-.2-5.231-2.628-6.779-6.979-6.979-1.281-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg> },
    { name: "LinkedIn", url: linkedinUrl, icon: <svg width="1.2em" height="1.2em" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg> },
    { name: "X", url: xUrl, icon: <svg width="1.1em" height="1.1em" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg> }
  ];

  const book = books[0];
  return (
    <footer style={{ background: "#1C1109", color: "#FAF5EF", borderTop: "1.5px solid rgba(212, 175, 55, 0.25)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 40 }} className="footer-grid">
        {/* Brand */}
        <div>
          <Link to="/" style={{ marginBottom: 16, display: 'inline-block' }}>
            <img src="/Images/Evercraft Logo 2.png" alt="Evercraft Publications" style={{ width: 105, height: 105, objectFit: "contain" }} />
          </Link>
          <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 20, opacity: 0.9, color: "#E6D5C3" }}>India's new-media publishing platform — building sustainable literary ecosystems that connect authors and readers.</p>
          <div style={{ display: "flex", gap: 8 }}>
            {localSocialLinks.map(({ icon, name, url }) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" title={name} style={{ width: 36, height: 36, background: "rgba(212, 175, 55, 0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, transition: "all 0.2s", color: "#D4AF37", textDecoration: "none" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.color = "#1C1109"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)"; e.currentTarget.style.color = "#D4AF37"; }}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: "#D4AF37", fontWeight: 800, marginBottom: 20, fontSize: 13, textTransform: "uppercase", letterSpacing: 2 }}>Quick Links</h4>
          {[
            ["Home", "home"],
            ["About Us", "about"],
            ["Our Services", "services"],
            ["Publish With Us", "publish"],
            ["Contact Us", "contact"],
            ["Shop Books", "shop"]
          ].map(([label, page]) => (
            <Link key={page} to={page === "home" ? "/" : `/${page}`} style={{ display: "block", textDecoration: "none", color: "#FAF5EF", opacity: 0.85, fontSize: 14, padding: "5px 0", transition: "all 0.2s", textAlign: "left" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#D4AF37"; e.currentTarget.style.opacity = "1"; }} onMouseLeave={e => { e.currentTarget.style.color = "#FAF5EF"; e.currentTarget.style.opacity = "0.85"; }}>
              → {label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: "#D4AF37", fontWeight: 800, marginBottom: 20, fontSize: 13, textTransform: "uppercase", letterSpacing: 2 }}>Contact</h4>
          {[
            [<svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>, settings.contact_email || "evercraft2026@gmail.com"],
            [<svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>, settings.contact_phone || "+91 90090 36633"],
            [<svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, settings.contact_hours || "Mon–Fri, 10 AM – 6 PM IST"],
            [<svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>, settings.contact_address || "Vrindavan Nagar, Bhopal - 462022"]
          ].map(([icon, text], i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, fontSize: 13, alignItems: "center", color: "#FAF5EF" }}>
              <span style={{ flexShrink: 0, display: "flex", color: "#D4AF37", opacity: 0.9 }}>{icon as React.ReactNode}</span><span style={{ opacity: 0.85 }}>{text as React.ReactNode}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, background: "rgba(212, 175, 55, 0.08)", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 12, padding: 14, fontSize: 12, lineHeight: 1.6, color: "#FAF5EF" }}>
            <span style={{ color: "#D4AF37", fontWeight: 700 }}>For Authors: </span>
            <span style={{ opacity: 0.85 }}>Submit your manuscript and our team will review it within 3–5 business days.</span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1.5px solid rgba(212, 175, 55, 0.2)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#E6D5C3" }}>
          <span>© 2026 EverCraft Publications All Rights Reserved Emerging Thoughts Pvt. Ltd. CIN#U73200MP2025PTC074472</span>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { name: "Privacy Policy", link: "/Images/Privacy Policy - EverCraft Publications.pdf" },
              { name: "Terms & Conditions", link: "/Images/Terms & Conditions - EverCraft Publications.pdf" },
              { name: "Refund Policy", link: "/Images/Refund Policy - EverCraft Publications.pdf" }
            ].map(t => (
              <a 
                key={t.name} 
                href={t.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                type="application/pdf"
                style={{ cursor: "pointer", transition: "color 0.2s", color: "#E6D5C3", textDecoration: "none" }} 
                onMouseEnter={e => e.currentTarget.style.color = "#D4AF37"} 
                onMouseLeave={e => e.currentTarget.style.color = "#E6D5C3"}
                onClick={(e) => {
                  e.preventDefault();
                  const pdfWindow = window.open("");
                  if (pdfWindow) {
                    pdfWindow.document.write(`
                      <html>
                        <head><title>${t.name}</title></head>
                        <body style="margin: 0; overflow: hidden;">
                          <embed src="${t.link}" type="application/pdf" width="100%" height="100%" />
                        </body>
                      </html>
                    `);
                    pdfWindow.document.close();
                  } else {
                    window.open(t.link, "_blank");
                  }
                }}
              >
                {t.name}
              </a>
            ))}
          </div>
        </div>
      </div>
      <style>{`.footer-grid { @media(max-width:900px){grid-template-columns:1fr 1fr!important;} @media(max-width:560px){grid-template-columns:1fr!important;} }`}</style>
    </footer>
  );
}
