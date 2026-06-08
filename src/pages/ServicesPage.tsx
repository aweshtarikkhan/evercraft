import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SERVICES } from "../constants/data";
import { SEO } from "../components/common/SEO";
import { Breadcrumbs } from "../components/common/Breadcrumbs";
import { TextMarquee } from "../components/common/TextMarquee";
import { WordReveal } from "../components/common/WordReveal";
import { useSettings } from "../contexts/SettingsContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

export function ServicesPage({ go }: { go: (p: any) => void }) {
  const { settings } = useSettings();
  const process = [
    { step: "01", title: "Submit Manuscript", desc: "Send us your manuscript for a free initial evaluation by our expert editorial team.", icon: "📝" },
    { step: "02", title: "Editorial Review", desc: "Our editors provide detailed feedback, suggestions, and a roadmap for improvement.", icon: "🔍" },
    { step: "03", title: "Design & Layout", desc: "Professional cover design and interior layout crafted to perfection.", icon: "🎨" },
    { step: "04", title: "Print & Distribute", desc: "High-quality printing and nationwide distribution across all major platforms.", icon: "📦" },
    { step: "05", title: "Market & Promote", desc: "Targeted marketing campaigns to maximize your book's reach and sales.", icon: "📈" },
    { step: "06", title: "Author Success", desc: "Ongoing support, royalty management, and community building for your author brand.", icon: "✨" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FAF5EF" }}>
      <SEO 
        title="Book Publishing Services – Editing, Printing, Distribution"
        description="Explore EverCraft's complete book publishing services — manuscript editing, book cover design, ISBN registration, printing, and global distribution on Amazon & Flipkart."
        keywords="book publishing services India, book editing services, book cover design, ISBN registration India, book printing services, book distribution India, amazon book listing, self publishing services, manuscript editing"
        url="https://www.evercraft.co.in/services"
      />
      {/* HERO */}
      <div style={{ 
        background: "#ffffff", 
        minHeight: "45vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        padding: "40px 24px", 
        textAlign: "center", 
        borderBottom: "1.5px solid rgba(115, 0, 0, 0.15)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ width: "100%", maxWidth: "1200px", display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
          <Breadcrumbs items={[{ title: 'Services', path: '/services' }]} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: "100%" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid rgba(115, 0, 0, 0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 20, background: "rgba(115, 0, 0, 0.05)" }}>
            <span style={{ color: "#730000", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Publishing Partner</span>
          </div>
          <h1 style={{ fontSize: "clamp(38px,5.5vw,56px)", fontWeight: 800, marginTop: 10, marginBottom: 16, color: "#730000", fontFamily: "'Playfair Display', Georgia, serif" }}>
            <WordReveal text={settings.content_services_hero_title || "Our *Services*"} once={true} />
          </h1>
          <p style={{ color: "#730000", opacity: 0.8, fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            {settings.content_services_hero_subtitle || "Professional editing, design, marketing, and distribution services to turn your manuscript into a bestseller."}
          </p>
        </motion.div>
      </div>

      {/* MARQUEE */}
      <TextMarquee 
        items={SERVICES.map(s => s.title)} 
        speed={30} 
        bgColor="#D4AF37" 
        textColor="#550000" 
      />

      {/* SERVICES LIST */}
      <section style={{ padding: "80px 24px", background: "#FAF5EF" }}>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }} 
          className="srv2-grid"
        >
          {SERVICES.map(s => (
            <Link 
              key={s.title}
              to={`/services/${s.slug}`} 
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <motion.div 
                variants={fadeInUp}
                className="card-hover" 
                style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", height: "100%", display: "flex", flexDirection: "column", border: "1.5px solid rgba(115, 0, 0, 0.08)" }}
              >
                <div style={{ background: s.color, padding: "36px 28px", color: "#fff" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{s.icon}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800 }}>{s.title}</h3>
                </div>
                <div style={{ background: "#ffffff", padding: "22px 28px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <p style={{ color: "#730000", opacity: 0.85, lineHeight: 1.7, fontSize: 14, marginBottom: 16 }}>{s.desc}</p>
                  <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Learn More <span className="arrow">→</span>
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* PROCESS */}
      <section style={{ padding: "80px 24px", background: "#ffffff", borderTop: "1px solid rgba(115, 0, 0, 0.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 56 }}
          >
            <span className="section-badge" style={{ color: "#730000" }}>How It Works</span>
            <h2 className="section-title" style={{ color: "#730000" }}><WordReveal text="Your Publishing Journey" /></h2>
            <div className="divider" />
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} 
            className="proc-grid"
          >
            {process.map(p => (
              <motion.div 
                variants={fadeInUp}
                key={p.step} 
                className="card-hover" 
                style={{ background: "#ffffff", borderRadius: 18, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)", border: "1.5px solid rgba(212, 175, 55, 0.25)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #D4AF37, #aa7c11)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 900, fontSize: 15 }}>{p.step}</div>
                  <span style={{ fontSize: 28 }}>{p.icon}</span>
                </div>
                <h3 style={{ fontWeight: 800, color: "#730000", fontSize: 17, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ color: "#5c5c5c", fontSize: 13, lineHeight: 1.6 }}>{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section style={{ padding: "80px 24px", background: "#730000" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <span className="section-badge" style={{ color: "#D4AF37" }}>Marketplaces</span>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", marginBottom: 10 }}>
            <WordReveal text="Available On All Major Platforms" once={true} />
          </h2>
          <p style={{ color: "#FAF5EF", opacity: 0.8, marginBottom: 40, fontSize: 16 }}>Your book listed across India's leading online and offline marketplaces.</p>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} 
            className="plat-grid"
          >
            {[
              { name: "Amazon", icon: "📦", bg: "#550000", border: "1px solid rgba(212, 175, 55, 0.15)", desc: "India's largest e-commerce platform" },
              { name: "Flipkart", icon: "🛍️", bg: "#550000", border: "1px solid rgba(212, 175, 55, 0.15)", desc: "India's homegrown retail giant" },
              { name: "ONDC", icon: "🌐", bg: "#550000", border: "1px solid rgba(212, 175, 55, 0.15)", desc: "India's open network for digital commerce" },
            ].map(p => (
              <motion.div 
                variants={fadeInUp}
                key={p.name} 
                style={{ background: p.bg, border: p.border, borderRadius: 18, padding: 32, textAlign: "center", color: "#fff", boxShadow: "0 10px 20px rgba(0,0,0,0.15)" }}
              >
                <div style={{ fontSize: 44, marginBottom: 14 }}>{p.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#D4AF37" }}>{p.name}</div>
                <div style={{ opacity: 0.85, fontSize: 13, color: "#FAF5EF" }}>{p.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", background: "#ffffff", position: "relative", overflow: "hidden" }}>
        {/* Subtle Glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, #FAF5EF 0%, #ffffff 70%)", pointerEvents: "none" }} />
        
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="section-badge" style={{ color: "#730000" }}>Get Started</span>
            <h2 className="section-title" style={{ color: "#730000", fontSize: "clamp(28px, 5vw, 48px)", marginTop: 6, marginBottom: 16 }}>
              <WordReveal text="Ready to Get *Published*?" once={true} />
            </h2>
            <p style={{ color: "#730000", opacity: 0.8, fontSize: 16, marginBottom: 36, lineHeight: 1.7, maxWidth: 580, margin: "0 auto 36px" }}>
              Submit your manuscript today and take the first step toward becoming a published author.
            </p>
            <button onClick={() => go("publish")} className="btn-primary">Submit Your Manuscript ✒️</button>
          </motion.div>
        </div>
      </section>
      
      <style>{`
        .srv2-grid { @media(max-width:900px){grid-template-columns:repeat(2,1fr)!important;} @media(max-width:580px){grid-template-columns:1fr!important;} }
        .proc-grid { @media(max-width:900px){grid-template-columns:repeat(2,1fr)!important;} @media(max-width:580px){grid-template-columns:1fr!important;} }
        .plat-grid { @media(max-width:640px){grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}