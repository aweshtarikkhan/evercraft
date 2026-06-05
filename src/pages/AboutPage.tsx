import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TextMarquee } from "../components/common/TextMarquee";
import { WordReveal } from "../components/common/WordReveal";
import { useSettings } from "../contexts/SettingsContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const fadeInUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export function AboutPage({ go }: { go: (p: any) => void }) {
  const { settings } = useSettings();
  const team = [
    { name: "Editorial Team", role: "Expert Editors & Proofreaders", icon: "✍️", desc: "Seasoned literary professionals who transform raw manuscripts into polished masterpieces." },
    { name: "Design Studio", role: "Cover & Layout Designers", icon: "🎨", desc: "Creative minds who craft visually stunning covers and interiors that stand out on any shelf." },
    { name: "Marketing Wing", role: "Digital Marketing Specialists", icon: "📢", desc: "Strategists who amplify your book's reach through targeted campaigns and author branding." },
    { name: "Distribution Hub", role: "Logistics & Platform Partners", icon: "🚚", desc: "Ensuring your book reaches readers across India — online and in physical stores." },
  ];

  const [activeTeamDetails, setActiveTeamDetails] = useState<string | null>(null);
  const [dbTeamMembers, setDbTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/team-members`)
      .then(r => {
        if (r.ok) return r.json();
        throw new Error("Failed to fetch");
      })
      .then(data => {
        if (data && data.length > 0) {
          setDbTeamMembers(data);
        }
      })
      .catch(err => {
        console.warn("Using fallback team members list due to fetch error:", err);
      });
  }, []);

  const dbEditorial = dbTeamMembers.filter(m => m.category === "Editorial Team");
  const dbDesign = dbTeamMembers.filter(m => m.category === "Design Team" || m.category === "Design Studio");
  const dbMarketing = dbTeamMembers.filter(m => m.category === "Marketing Team" || m.category === "Marketing Wing");

  const editorialMembers = dbEditorial.length > 0 ? dbEditorial.map(m => ({
    name: m.name,
    role: m.role,
    img: m.image || "",
    linkedin: "https://linkedin.com",
    desc: m.description
  })) : [
    { name: "Aarav Sharma", role: "Chief Editor", img: "", linkedin: "https://linkedin.com", desc: "10+ years of experience in fiction editing. Loves historical novels and guiding new authors." },
    { name: "Priya Patel", role: "Senior Proofreader", img: "", linkedin: "https://linkedin.com", desc: "Eagle-eyed proofreader who ensures every manuscript is grammatically flawless and ready for print." },
    { name: "Rahul Verma", role: "Acquisitions Editor", img: "", linkedin: "https://linkedin.com", desc: "Expert in scouting fresh talent and acquiring bestselling titles that resonate with readers." },
    { name: "Neha Gupta", role: "Copy Editor", img: "", linkedin: "https://linkedin.com", desc: "Specializes in non-fiction and biographies, refining author voices while keeping authenticity." }
  ];

  const designMembers = dbDesign.length > 0 ? dbDesign.map(m => ({
    name: m.name,
    role: m.role,
    img: m.image || "",
    linkedin: "https://linkedin.com",
    desc: m.description
  })) : [
    { name: "Vikram Singh", role: "Art Director", img: "", linkedin: "https://linkedin.com", desc: "Award-winning designer with an eye for typography and composition." },
    { name: "Ananya Desai", role: "Cover Illustrator", img: "", linkedin: "https://linkedin.com", desc: "Specializes in vibrant, custom illustrations that bring stories to life." },
    { name: "Rohan Kapoor", role: "Typesetter", img: "", linkedin: "https://linkedin.com", desc: "Ensures the interior layout is perfectly formatted for a seamless reading experience." },
    { name: "Meera Joshi", role: "Digital Asset Designer", img: "", linkedin: "https://linkedin.com", desc: "Creates engaging promotional graphics for our authors' marketing campaigns." }
  ];

  const marketingMembers = dbMarketing.length > 0 ? dbMarketing.map(m => ({
    name: m.name,
    role: m.role,
    img: m.image || "",
    linkedin: "https://linkedin.com",
    desc: m.description
  })) : [
    { name: "Karan Malhotra", role: "Marketing Head", img: "", linkedin: "https://linkedin.com", desc: "Strategic thinker focused on maximizing book visibility and author branding." },
    { name: "Sanya Iyer", role: "Social Media Manager", img: "", linkedin: "https://linkedin.com", desc: "Crafts viral content and manages vibrant reader communities online." },
    { name: "Tariq Ali", role: "PR Specialist", img: "", linkedin: "https://linkedin.com", desc: "Connects authors with media outlets, bloggers, and literary influencers." },
    { name: "Pooja Nair", role: "Ad Strategist", img: "", linkedin: "https://linkedin.com", desc: "Data-driven expert in running high-converting ad campaigns across platforms." }
  ];

  const distributionPartners = [
    { name: "Amazon", bg: "linear-gradient(135deg, #f97316, #ea580c)", icon: "📦", desc: "Your books available on Amazon India and globally, reaching millions of active readers." },
    { name: "Flipkart", bg: "linear-gradient(135deg, #2563eb, #1d4ed8)", icon: "🛍️", desc: "Extensive reach across Indian tier-2 and tier-3 cities with India's homegrown e-commerce leader." },
    { name: "ONDC", bg: "linear-gradient(135deg, #2563eb, #1d4ed8)", icon: "🌐", desc: "Empowering decentralized, direct-to-consumer sales across India's revolutionary digital network." }
  ];

  let modalData: any[] = [];
  let modalTitle = "";
  let isDistribution = false;

  if (activeTeamDetails === "Editorial Team") { modalData = editorialMembers; modalTitle = "Editorial Team"; }
  else if (activeTeamDetails === "Design Studio") { modalData = designMembers; modalTitle = "Design Studio"; }
  else if (activeTeamDetails === "Marketing Wing") { modalData = marketingMembers; modalTitle = "Marketing Wing"; }
  else if (activeTeamDetails === "Distribution Hub") { modalData = distributionPartners; modalTitle = "Distribution Partners"; isDistribution = true; }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* HERO */}
      <div style={{ 
        background: "#ffffff", 
        borderBottom: "1.5px solid rgba(115, 0, 0, 0.15)",
        minHeight: "45vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "40px 24px", 
        textAlign: "center", 
        color: "#730000", 
        position: "relative", 
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: "relative", width: "100%" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", border: "1.5px solid rgba(115, 0, 0, 0.2)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
            <span style={{ color: "#730000", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Our Story</span>
          </div>
          <h1 style={{ fontSize: "clamp(38px,5.5vw,56px)", fontWeight: 800, marginTop: 10, marginBottom: 16, color: "#730000", fontFamily: "'Playfair Display', Georgia, serif" }}>
            <WordReveal text={settings.content_home_about_title || "Why Choose Evercraft?"} once={true} />
          </h1>
          <p style={{ color: "#5C3A21", opacity: 0.9, fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            {settings.content_home_about_text || "We believe every story deserves to be heard. Our team of expert editors, designers, and marketers work closely with authors to ensure their books reach the right audience."}
          </p>
        </motion.div>
      </div>

      {/* MARQUEE */}
      <TextMarquee 
        items={["Excellence", "Integrity", "Innovation", "Author-First", "Diverse Voices", "Quality Printing", "Nationwide Reach"]} 
        speed={20} 
        bgColor="#D4AF37" 
        textColor="#550000" 
      />

         <div style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 800, color: "#2D1B10", marginBottom: 24, fontFamily: "'Playfair Display', Georgia, serif" }}>
            <WordReveal text={settings.content_about_hero_title || "About EverCraft *Publications*"} once={true} />
          </h1>
          <p style={{ fontSize: "clamp(16px,2vw,20px)", color: "#5C3A21", opacity: 0.9, maxWidth: 800, margin: "0 auto", lineHeight: 1.6 }}>
            {settings.content_about_hero_subtitle || "A new-media publishing platform building sustainable literary ecosystems that connect authors and readers across India."}
          </p>
        </div>

        {/* Mission / Vision Section */}
        <div style={{ background: "#ffffff", padding: "80px 24px", borderTop: "1px solid rgba(115, 0, 0, 0.1)", borderBottom: "1px solid rgba(115, 0, 0, 0.1)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 60, alignItems: "center" }}>
            <motion.div variants={fadeInUp}>
              <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#730000", marginBottom: 24, fontFamily: "'Playfair Display', Georgia, serif" }}>
                {settings.content_about_mission_title || "Not Just Publishing Books — Building Literary Ecosystems"}
              </h2>
              <p style={{ fontSize: 16, color: "#5C3A21", opacity: 0.9, lineHeight: 1.8, marginBottom: 16 }}>
                {settings.content_about_mission_p1 || "At EverCraft Publications, we believe every story deserves to be told and every voice deserves to be heard. We are more than a publishing house — we are a complete literary ecosystem that nurtures authors from their very first draft to a thriving readership."}
              </p>
              <p style={{ fontSize: 16, color: "#5C3A21", opacity: 0.9, lineHeight: 1.8 }}>
                {settings.content_about_mission_p2 || "Our platform provides end-to-end publishing services, ensuring that authors receive professional support at every stage — from manuscript evaluation and editing to cover design, printing, distribution, and marketing."}
              </p>
            </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ background: "#ffffff", borderRadius: 24, padding: 40, border: "1.5px solid rgba(115, 0, 0, 0.15)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
          >
            {[
              { icon: "🎯", title: "Our Vision", text: "To be India's most trusted and author-centric publishing platform." },
              { icon: "💡", title: "Our Approach", text: "Collaborative editing, transparent feedback, and thoughtful author-reader engagement." },
              { icon: "🤝", title: "Our Promise", text: "Every author gets personal attention, professional quality, and genuine partnership." },
            ].map(v => (
              <div key={v.title} style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>{v.icon}</span>
                <div>
                  <h4 style={{ fontWeight: 800, color: "#730000", marginBottom: 6, fontSize: 16 }}>{v.title}</h4>
                  <p style={{ color: "#2D1B10", fontSize: 14, lineHeight: 1.6 }}>{v.text}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* EXPERT TEAMS */}
      <section style={{ padding: "80px 24px", background: "#FAF5EF", borderTop: "1.5px solid rgba(115, 0, 0, 0.15)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="section-badge">The People Behind EverCraft</span>
            <h2 className="section-title" style={{color: "#730000"}}><WordReveal text="Our Expert Teams" wordClassName="brown-gold-text" /></h2>
            <div className="divider" />
          </div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }} 
            className="team-grid"
          >
            {team.map(t => (
              <motion.div 
                variants={fadeInUp}
                key={t.name} 
                className="card-hover" 
                onClick={() => setActiveTeamDetails(t.name)}
                style={{ background: "#ffffff", borderRadius: 20, padding: 28, textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", border: "1.5px solid rgba(115, 0, 0, 0.15)", cursor: "pointer" }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{t.icon}</div>
                <h3 style={{ fontWeight: 800, color: "#730000", marginBottom: 6 }}>{t.name}</h3>
                <p style={{ color: "#aa7c11", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{t.role}</p>
                <p style={{ color: "#5c3a21", fontSize: 13, lineHeight: 1.6 }}>{t.desc}</p>
                <div style={{ fontSize: 13, color: "#730000", fontWeight: 700, marginTop: 14 }}>
                  {t.name === "Distribution Hub" ? "View Partners →" : "View Members →"}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section style={{ padding: "80px 24px", background: "#730000" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="section-badge" style={{ color: "#D4AF37" }}>The EverCraft Edge</span>
            <h2 className="section-title" style={{ color: "#fff", marginTop: 4 }}>
              <WordReveal text="Why Choose EverCraft?" once={true} />
            </h2>
          </div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} 
            className="why-grid"
          >
            {[
              { icon: "⚡", title: "Fast Turnaround", desc: "From manuscript to published book in record time without compromising quality." },
              { icon: "💎", title: "Premium Quality", desc: "Best-in-class editing, design, and printing that matches international standards." },
              { icon: "🌐", title: "Wide Reach", desc: "Your book available on Amazon, Flipkart, ONDC, and major bookstores across India." },
              { icon: "🤝", title: "Author-First", desc: "Transparent royalties, dedicated support, and your creative vision always respected." },
            ].map(w => (
              <motion.div 
                variants={fadeInUp}
                key={w.title} 
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: 16, padding: 24, transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#ffffff"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 36, marginBottom: 14 }}>{w.icon}</div>
                <h3 style={{ fontWeight: 800, color: "#fff", marginBottom: 8, fontSize: 16 }}>{w.title}</h3>
                <p style={{ color: "#FAF5EF", opacity: 0.85, fontSize: 13, lineHeight: 1.6 }}>{w.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", background: "#ffffff", borderTop: "1.5px solid rgba(115, 0, 0, 0.15)", position: "relative", overflow: "hidden" }}>
        {/* Subtle Glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, #FAF5EF 0%, #ffffff 70%)", pointerEvents: "none" }} />
        
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="section-badge" style={{ color: "#730000" }}>Get in Touch</span>
            <h2 className="section-title" style={{ color: "#730000", fontSize: "clamp(28px, 5vw, 48px)", marginTop: 6, marginBottom: 16 }}>
              <WordReveal text="Be Part of the EverCraft *Story*" once={true} />
            </h2>
            <p style={{ color: "#2D1B10", opacity: 0.9, fontSize: 16, marginBottom: 32, maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.7 }}>
              Whether you're an aspiring author or an avid reader, there's a place for you here.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => go("publish")} className="btn-primary" style={{ cursor: "pointer" }}>Publish With Us ✒️</button>
              <button onClick={() => go("shop")} className="btn-outline" style={{ cursor: "pointer" }}>Browse Books 📚</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TEAM MEMBERS MODAL */}
      {activeTeamDetails && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="animate-bounceIn" style={{ background: "#FAF5EF", width: "100%", maxWidth: 1000, borderRadius: 24, padding: 32, position: "relative", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", border: "1.5px solid rgba(115, 0, 0, 0.15)" }}>
            <button onClick={() => setActiveTeamDetails(null)} style={{ position: "absolute", top: 20, right: 20, background: "#f3f4f6", border: "none", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 16, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#6b7280"; }}>✕</button>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#730000", marginBottom: 32, textAlign: "center" }}>{modalTitle}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
              {isDistribution ? (
                modalData.map((p: any) => (
                  <div key={p.name} style={{ background: p.bg, borderRadius: 18, padding: 32, textAlign: "center", color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>{p.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{p.name}</div>
                    <div style={{ opacity: 0.85, fontSize: 13, lineHeight: 1.6 }}>{p.desc}</div>
                  </div>
                ))
              ) : (
                modalData.map((m: any) => (
                  <div key={m.name} className="team-member-card" style={{ background: "#ffffff", borderRadius: 16, overflow: "hidden", border: "1.5px solid rgba(115, 0, 0, 0.15)", position: "relative", display: "flex", flexDirection: "column", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                    {/* Base Content */}
                    <div style={{ height: 220, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {m.img ? <img src={m.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={m.name} /> : <span style={{ fontSize: 48 }}>👤</span>}
                    </div>
                    <div style={{ padding: 20, textAlign: "center" }}>
                      <h3 style={{ fontWeight: 800, color: "#730000", fontSize: 18, marginBottom: 4 }}>{m.name}</h3>
                      <p style={{ color: "#aa7c11", fontSize: 14, fontWeight: 600 }}>{m.role}</p>
                    </div>
  
                    {/* Hover Overlay */}
                    <div className="team-member-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #730000 0%, #550000 100%)", padding: 24, color: "#fff", display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.2 }}>{m.name}</h3>
                        <a href={m.linkedin} target="_blank" rel="noreferrer" style={{ color: "#fff", textDecoration: "none", background: "rgba(255,255,255,0.15)", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.background = "#2563eb"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"} title="LinkedIn Profile">
                          <svg width="1.1em" height="1.1em" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        </a>
                      </div>
                      <p style={{ color: "#F3E5AB", fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>{m.role}</p>
                      <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 1.6 }}>{m.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .abt-grid { @media(max-width:768px){grid-template-columns:1fr!important;} }
        .team-grid { @media(max-width:900px){grid-template-columns:repeat(2,1fr)!important;} @media(max-width:500px){grid-template-columns:1fr!important;} }
        .why-grid { @media(max-width:900px){grid-template-columns:repeat(2,1fr)!important;} @media(max-width:500px){grid-template-columns:1fr!important;} }
        .team-member-card .team-member-overlay { transform: translateY(101%); transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
        .team-member-card:hover .team-member-overlay { transform: translateY(0); }
      `}</style>
    </div>
  );
}