import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SERVICES } from "../constants/data";
import { SEO } from "../components/common/SEO";
import { Breadcrumbs } from "../components/common/Breadcrumbs";
import { TextMarquee } from "../components/common/TextMarquee";
import { WordReveal } from "../components/common/WordReveal";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = SERVICES.find((s: any) => s.slug === slug);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const [selectedRating, setSelectedRating] = useState(5);

  const handleInquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const inq = {
      service_name: service?.title || "Unknown Service",
      name: fd.get("inqName")?.toString() || "",
      email: fd.get("inqEmail")?.toString() || "",
      phone: fd.get("inqPhone")?.toString() || "",
      message: fd.get("inqMsg")?.toString() || "",
    };

    try {
      const res = await fetch(`${API_BASE_URL}/service-inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inq),
      });
      if (res.ok) {
        alert("🎉 Inquiry submitted successfully! Our team will contact you soon.");
        e.currentTarget.reset();
      } else {
        alert("❌ Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      alert("❌ Server connection error. Please try again.");
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fb = {
      service_name: service?.title || "Unknown Service",
      name: fd.get("fbName")?.toString() || "",
      email: fd.get("fbEmail")?.toString() || "",
      rating: selectedRating,
      feedback: fd.get("fbComments")?.toString() || "",
    };

    try {
      const res = await fetch(`${API_BASE_URL}/service-feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fb),
      });
      if (res.ok) {
        alert("🎉 Thank you! Your feedback has been submitted.");
        e.currentTarget.reset();
        setSelectedRating(5);
      } else {
        alert("❌ Failed to submit feedback. Please try again.");
      }
    } catch (err) {
      alert("❌ Server connection error. Please try again.");
    }
  };

  if (!service) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#730000", marginBottom: 12 }}>Service Not Found</h2>
        <p style={{ color: "#5c5c5c", marginBottom: 24 }}>The service you're looking for doesn't exist.</p>
        <Link to="/services" className="btn-primary">← Back to Services</Link>
      </div>
    );
  }

  const svc = service as any;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF5EF" }}>
      <SEO title={service.title} description={service.desc} />
      {/* HERO */}
      <section style={{ 
        background: "linear-gradient(135deg, #1f0000 0%, #730000 50%, #1f0000 100%)", 
        minHeight: "calc(100vh - 112px)", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        padding: "40px 24px", 
        textAlign: "center", 
        color: "#FAF5EF", 
        position: "relative", 
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        <div style={{ width: "100%", maxWidth: "1200px", display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
          <Breadcrumbs 
            theme="dark"
            items={[
            { title: 'Services', path: '/services' },
            { title: service.title, path: `/services/${service.slug}` }
          ]} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: "relative", zIndex: 1, width: "100%" }}
        >
          <Link to="/services" style={{ color: "#D4AF37", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            ← Back to All Services
          </Link>
          <div style={{ fontSize: 72, marginBottom: 20 }}>{service.icon}</div>
          <h1 style={{ fontSize: "clamp(38px,5.5vw,56px)", fontWeight: 800, marginBottom: 16, color: "#FAF5EF", fontFamily: "'Playfair Display', Georgia, serif" }}>
            <WordReveal text={service.title} once={true} />
          </h1>
          <p style={{ color: "#FAF5EF", opacity: 0.9, fontSize: 18, maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            {service.desc}
          </p>
        </motion.div>
      </section>

      {/* MARQUEE */}
      <TextMarquee
        items={[service.title, "Premium Quality", "Expert Team", "Fast Turnaround", "Affordable Pricing", service.title]}
        bgColor="#D4AF37"
        textColor="#550000"
        speed={20}
      />

      {/* ABOUT THIS SERVICE */}
      <section style={{ padding: "80px 24px", background: "#FAF5EF" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="section-badge" style={{ color: "#730000" }}>About This Service</span>
            <h2 className="section-title" style={{ marginBottom: 20, color: "#730000" }}><WordReveal text="What We Offer" /></h2>
            <div className="divider" style={{ margin: "16px 0 32px 0", background: "#730000" }} />
            <p style={{ color: "#730000", opacity: 0.85, fontSize: 16, lineHeight: 1.8, maxWidth: 800 }}>
              {svc.longDesc || service.desc}
            </p>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      {svc.features && svc.features.length > 0 && (
        <section style={{ padding: "80px 24px", background: "#ffffff" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: "center", marginBottom: 48 }}
            >
              <span className="section-badge" style={{ color: "#730000" }}>What's Included</span>
              <h2 className="section-title" style={{ color: "#730000" }}><WordReveal text="Key Features" /></h2>
              <div className="divider" style={{ background: "#730000" }} />
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}
              className="features-grid"
            >
              {svc.features.map((f: string, i: number) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="card-hover"
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                    border: "1.5px solid rgba(115, 0, 0, 0.08)"
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: `${service.color}15`, color: service.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800, flexShrink: 0
                  }}>✓</div>
                  <span style={{ color: "#730000", fontSize: 14, fontWeight: 600, lineHeight: 1.6 }}>{f}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* PROCESS STEPS */}
      {svc.processSteps && svc.processSteps.length > 0 && (
        <section style={{ padding: "80px 24px", background: "#FAF5EF" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: "center", marginBottom: 48 }}
            >
              <span className="section-badge" style={{ color: "#730000" }}>How It Works</span>
              <h2 className="section-title" style={{ color: "#730000" }}><WordReveal text="Our Process" /></h2>
              <div className="divider" style={{ background: "#730000" }} />
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              style={{ display: "flex", flexDirection: "column", gap: 24 }}
            >
              {svc.processSteps.map((p: any, i: number) => (
                <motion.div
                  key={p.step}
                  variants={fadeInUp}
                  className="card-hover"
                  style={{
                    display: "flex", alignItems: "center", gap: 24, padding: "28px 32px",
                    background: "#ffffff", borderRadius: 18,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                    border: "1.5px solid rgba(115, 0, 0, 0.08)"
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "#730000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#D4AF37", fontWeight: 900, fontSize: 18, flexShrink: 0
                  }}>{p.step}</div>
                  <div>
                    <h3 style={{ fontWeight: 800, color: "#730000", fontSize: 18, marginBottom: 4 }}>{p.title}</h3>
                    <p style={{ color: "#5c5c5c", fontSize: 14, lineHeight: 1.6 }}>{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: "100px 24px", background: "#ffffff", position: "relative", overflow: "hidden" }}>
        {/* Subtle Glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, #FAF5EF 0%, #ffffff 70%)", pointerEvents: "none" }} />
        
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-badge" style={{ color: "#730000" }}>Get Started</span>
            <h2 className="section-title" style={{ color: "#730000", fontSize: "clamp(28px, 5vw, 48px)", marginTop: 6, marginBottom: 16 }}>
              <WordReveal text={`Ready to Get Started with ${service.title.split(" ").map((w: string) => `*${w}*`).join(" ")}?`} once={true} />
            </h2>
            <p style={{ color: "#730000", opacity: 0.8, fontSize: 16, marginBottom: 36, lineHeight: 1.7, maxWidth: 580, margin: "0 auto 36px" }}>
              Submit your manuscript today and let our experts bring your book to life.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/publish" className="btn-primary" style={{ textDecoration: "none" }}>Submit Your Manuscript ✒️</Link>
              <Link to="/contact" className="btn-outline" style={{ textDecoration: "none", border: "1.5px solid #730000", color: "#730000" }}>Contact Us</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* INQUIRY & FEEDBACK FORMS */}
      <section style={{ padding: "80px 24px", background: "#FAF5EF", borderTop: "1px solid rgba(115, 0, 0, 0.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }} className="forms-grid">
            
            {/* INQUIRY/DATA COLLECTION FORM */}
            <div style={{ background: "#ffffff", padding: 32, borderRadius: 24, border: "1.5px solid rgba(115, 0, 0, 0.1)", display: "flex", flexDirection: "column", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <span className="section-badge" style={{ color: "#730000", textAlign: "left", display: "inline-block", alignSelf: "flex-start", marginBottom: 12 }}>Consultation</span>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#730000", marginBottom: 10, fontFamily: "'Playfair Display', Georgia, serif" }}>Request a Consultation</h3>
              <p style={{ color: "#5c5c5c", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>Interested in this service? Fill out the form below, and our publishing experts will get in touch with you within 24-48 hours.</p>
              
              <form onSubmit={handleInquirySubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Full Name *</label>
                  <input required type="text" name="inqName" placeholder="Enter your name" style={{ width: "100%", padding: "12px 14px", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, boxSizing: "border-box", background: "#ffffff", color: "#730000" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Email Address *</label>
                  <input required type="email" name="inqEmail" placeholder="Enter your email" style={{ width: "100%", padding: "12px 14px", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, boxSizing: "border-box", background: "#ffffff", color: "#730000" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Phone Number *</label>
                  <input required type="tel" name="inqPhone" placeholder="Enter your mobile number" style={{ width: "100%", padding: "12px 14px", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, boxSizing: "border-box", background: "#ffffff", color: "#730000" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Project Details / Message *</label>
                  <textarea required rows={4} name="inqMsg" placeholder="Tell us about your manuscript (genre, word count, completion status)..." style={{ width: "100%", padding: "12px 14px", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, boxSizing: "border-box", background: "#ffffff", color: "#730000", resize: "vertical" }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "14px", width: "100%", marginTop: 8 }}>
                  Submit Inquiry ✒️
                </button>
              </form>
            </div>

            {/* SERVICE FEEDBACK FORM */}
            <div style={{ background: "#ffffff", padding: 32, borderRadius: 24, border: "1.5px solid rgba(115, 0, 0, 0.1)", display: "flex", flexDirection: "column", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <span className="section-badge" style={{ color: "#730000", textAlign: "left", display: "inline-block", alignSelf: "flex-start", marginBottom: 12 }}>Feedback</span>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#730000", marginBottom: 10, fontFamily: "'Playfair Display', Georgia, serif" }}>Service Feedback</h3>
              <p style={{ color: "#5c5c5c", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>Have you used our service before? Share your experience with us and help us improve our services.</p>
              
              <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Full Name *</label>
                  <input required type="text" name="fbName" placeholder="Enter your name" style={{ width: "100%", padding: "12px 14px", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, boxSizing: "border-box", background: "#ffffff", color: "#730000" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Email Address *</label>
                  <input required type="email" name="fbEmail" placeholder="Enter your email" style={{ width: "100%", padding: "12px 14px", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, boxSizing: "border-box", background: "#ffffff", color: "#730000" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Service Rating *</label>
                  <div style={{ display: "flex", gap: 10, margin: "6px 0" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: 26,
                          cursor: "pointer",
                          padding: 0,
                          color: star <= selectedRating ? "#fbbf24" : "#e5e7eb",
                          transition: "transform 0.1s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#730000", marginBottom: 6 }}>Your Feedback *</label>
                  <textarea required rows={4} name="fbComments" placeholder="Describe your experience with this service..." style={{ width: "100%", padding: "12px 14px", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 10, boxSizing: "border-box", background: "#ffffff", color: "#730000", resize: "vertical" }} />
                </div>
                <button type="submit" className="btn-outline" style={{ padding: "14px", width: "100%", marginTop: 8, border: "1.5px solid #730000", color: "#730000" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(115,0,0,0.05)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  Submit Feedback
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      <style>{`
        .features-grid { @media(max-width:640px){grid-template-columns:1fr!important;} }
        .forms-grid { @media(max-width:768px){grid-template-columns:1fr!important; gap:36px!important;} }
      `}</style>
    </div>
  );
}
