import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Page, Book } from "../types";
import { Stars, Disc, NotifyMeButton } from "../components/common/UIComponents";
import { SERVICES, TESTIMONIALS } from "../constants/data";
import { TextMarquee } from "../components/common/TextMarquee";
import { WordReveal } from "../components/common/WordReveal";
import { useSettings } from "../contexts/SettingsContext";
import { SEO } from "../components/common/SEO";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
} as const;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const textReveal = {
  hidden: { opacity: 0, filter: "blur(6px)", y: 15 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.8, ease: "easeOut" } }
} as const;

const bookSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 25 },
      opacity: { duration: 0.25 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 25 },
      opacity: { duration: 0.2 }
    }
  })
};

const HERO_TAGLINES = [
    { 
      title: "Crafting Every Word Into A *Masterpiece*", 
      subtitle: "India's new-media publishing platform — bridging authors and readers across the nation. From raw manuscript to bookshelf masterpiece." 
    },
    { 
      title: "Discover *Stories* That Resonate With The Soul", 
      subtitle: "Explore books that inspire, enlighten, and transform." 
    },
    { 
      title: "Your Trusted Book *Publishing* Partner", 
      subtitle: "End-to-end Publishing Services from manuscript to marketplace — Amazon, Flipkart & ONDC" 
    }
  ];

export function HomePage({ go, addToCart, openBook, books, frontStats, testimonials }: { go: (p: Page | string) => void; addToCart: (b: Book) => void; openBook: (b: Book) => void; books: Book[]; frontStats: any; testimonials: any[] }) {
    const { settings } = useSettings();
    const testScrollRef = useRef<HTMLDivElement>(null);
    const [taglineIndex, setTaglineIndex] = useState(0);
    const [formStatus, setFormStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', country: '' });

    const currentHeroTaglines = [
        {
            title: settings.content_home_hero_title || HERO_TAGLINES[0].title,
            subtitle: settings.content_home_hero_subtitle || HERO_TAGLINES[0].subtitle
        },
        HERO_TAGLINES[1],
        HERO_TAGLINES[2]
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setTaglineIndex(prev => (prev + 1) % currentHeroTaglines.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [currentHeroTaglines.length]);

    // Testimonials auto-slide
    useEffect(() => {
        const interval = setInterval(() => {
            if (testScrollRef.current) {
                const container = testScrollRef.current;
                const maxScrollLeft = container.scrollWidth - container.clientWidth;
                if (container.scrollLeft >= maxScrollLeft - 10) {
                    container.scrollTo({ left: 0, behavior: "smooth" });
                } else {
                    container.scrollBy({ left: 374, behavior: "smooth" });
                }
            }
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const scrollTest = (dir: 'left' | 'right') => {
        if (testScrollRef.current) {
            testScrollRef.current.scrollBy({ left: dir === 'left' ? -374 : 374, behavior: "smooth" });
        }
    };

    const heroBook = books.find(b => b.is_hero) || books[0];
    const bestsellerBook = books.find(b => b.is_bestseller) || books[0];


    return (
        <div>
            <SEO 
                title="Best Book Publishing House in India"
                description="EverCraft Publications — India's leading book publishing company. Publish, print, edit & distribute your books on Amazon & Flipkart. Trusted by 500+ authors in Indore, Bhopal & across India."
                keywords="best book publishing house India, publish book in indore, publish book in bhopal, self publishing India, book printing services, book publisher near me, amazon book publishing, ISBN registration India, academic publishing, book editing services, print on demand India, EverCraft Publications"
            />
            {/* HERO */}
            <section style={{
                background: "linear-gradient(135deg, #1f0000 0%, #730000 50%, #1f0000 100%)",
                minHeight: "85vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden"
            }}>
                {/* Floating Decorative Elements */}
                <div style={{ position: "absolute", top: "15%", left: "5%", opacity: 0.15, fontSize: 32, transform: "rotate(-15deg)", pointerEvents: "none" }}>📚</div>
                <div style={{ position: "absolute", top: "45%", left: "42%", opacity: 0.12, fontSize: 24, transform: "rotate(10deg)", pointerEvents: "none" }}>✍️</div>
                <div style={{ position: "absolute", bottom: "15%", left: "38%", opacity: 0.15, fontSize: 28, transform: "rotate(-5deg)", pointerEvents: "none" }}>📖</div>
                <div style={{ position: "absolute", top: "20%", right: "8%", opacity: 0.15, fontSize: 36, transform: "rotate(20deg)", pointerEvents: "none" }}>🪶</div>
                <div style={{ position: "absolute", bottom: "25%", right: "45%", opacity: 0.12, fontSize: 28, transform: "rotate(-25deg)", pointerEvents: "none" }}>🦉</div>
                <div style={{ position: "absolute", top: "60%", right: "4%", opacity: 0.15, fontSize: 32, transform: "rotate(15deg)", pointerEvents: "none" }}>🌟</div>

                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "center", width: "100%", position: "relative", zIndex: 10 }}
                    className="hero-grid">
                    {/* Text */}
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.div 
                            variants={fadeInUp}
                            style={{ display: "none" }} // Hidden per user request
                        >
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4AF37", display: "inline-block", marginRight: 8 }} />
                            <span style={{ color: "#FAF5EF", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>New-Media Publishing Platform</span>
                        </motion.div>
                        
                        {/* Dynamic Tagline Container to avoid content jumps */}
                        <div style={{ minHeight: "240px", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                            <motion.div
                                key={taglineIndex}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <h1 
                                    style={{ fontSize: "clamp(38px,5.5vw,64px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-1.5px", fontFamily: "'Playfair Display', Georgia, serif" }}
                                >
                                    <WordReveal 
                                        text={currentHeroTaglines[taglineIndex].title} 
                                        once={false}
                                        delay={0.1}
                                    />
                                </h1>
                                
                                <p 
                                    style={{ color: "#FAF5EF", opacity: 0.9, fontSize: 16, lineHeight: 1.7, marginBottom: 40, maxWidth: 500 }}
                                >
                                    {currentHeroTaglines[taglineIndex].subtitle}
                                </p>
                            </motion.div>
                        </div>
                        
                        <motion.div variants={fadeInUp} style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
                            <button className="btn-primary" onClick={() => go("shop")} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>Browse Books <span style={{ fontSize: 14 }}>→</span></button>
                            <button className="btn-outline" onClick={() => go("publish")} style={{ border: "2px solid #D4AF37", color: "#ffffff", background: "transparent" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.1)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>Publish With Us</button>
                        </motion.div>

                        {/* Slide Indicators */}
                        <motion.div variants={fadeInUp} style={{ display: "flex", gap: 8, marginTop: 32 }}>
                            {currentHeroTaglines.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setTaglineIndex(idx)}
                                    style={{
                                        width: idx === taglineIndex ? 36 : 12,
                                        height: 4,
                                        borderRadius: 2,
                                        background: idx === taglineIndex ? "#D4AF37" : "rgba(250, 245, 239, 0.3)",
                                        border: "none",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        padding: 0
                                    }}
                                />
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Featured Book Visual */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                    >
                        <div style={{
                            position: "relative",
                            width: 320,
                            height: 450,
                            border: "2px dashed rgba(212, 175, 55, 0.4)",
                            borderRadius: 24,
                            background: "rgba(250, 245, 239, 0.03)",
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 24,
                            cursor: heroBook ? "pointer" : "default"
                        }}
                        onClick={() => heroBook && openBook(heroBook)}
                        >
                            {heroBook ? (
                                <div style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative"
                                }}>
                                    {heroBook.frontCover ? (
                                        <img 
                                            src={heroBook.frontCover} 
                                            alt={heroBook.title} 
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "340px",
                                                borderRadius: 8,
                                                objectFit: "contain",
                                                filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.6))",
                                                transition: "transform 0.3s ease"
                                            }}
                                            className="book-cover-hover"
                                        />
                                    ) : (
                                        <div style={{
                                            width: 200,
                                            height: 290,
                                            borderRadius: "4px 8px 8px 4px",
                                            background: "linear-gradient(135deg, #730000 0%, #350404 100%)",
                                            boxShadow: "0 15px 30px rgba(0,0,0,0.5), inset 6px 0 8px rgba(255,255,255,0.05)",
                                            borderLeft: "3px solid rgba(0,0,0,0.2)",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "24px 16px",
                                            boxSizing: "border-box"
                                        }}>
                                            <div style={{ color: "#D4AF37", fontSize: 24 }}>📖</div>
                                            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
                                                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16, fontWeight: 700, color: "#FAF5EF", lineHeight: 1.2 }}>{heroBook.title}</span>
                                                <span style={{ fontSize: 11, color: "#D4AF37" }}>{heroBook.author}</span>
                                            </div>
                                            <span style={{ fontSize: 9, fontWeight: 700, color: "#FAF5EF", opacity: 0.6, letterSpacing: 1 }}>EverCraft Title</span>
                                        </div>
                                    )}
                                    <div style={{
                                        marginTop: 20,
                                        color: "#FAF5EF",
                                        fontWeight: 700,
                                        fontSize: 13,
                                        letterSpacing: 0.5,
                                        background: "rgba(115,0,0,0.85)",
                                        padding: "6px 14px",
                                        borderRadius: 20,
                                        border: "1px solid rgba(212, 175, 55, 0.3)"
                                    }}>
                                        Featured Title ✨
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: 20 }}>
                                    <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                                    <div style={{ color: "#FAF5EF", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Books Coming Soon</div>
                                    <div style={{ color: "#FAF5EF", opacity: 0.6, fontSize: 12 }}>Stay tuned for our upcoming spiritually enriching releases!</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                <style>{`
          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; text-align: center; }
            .hero-grid > div:last-child { order: -1; }
          }
        `}</style>
            </section>
            
            <TextMarquee 
                items={["Manuscript Evaluation", "Editing & Proofreading", "Cover & Layout Design", "Premium Printing", "Nationwide Distribution", "Marketing & Promotion", "Author Success"]}
                speed={25}
                bgColor="#D4AF37"
                textColor="#550000"
            />

            {/* STATS */}
            <section style={{ background: "#FAF5EF", borderTop: "1.5px solid rgba(115, 0, 0, 0.15)", borderBottom: "1.5px solid rgba(115, 0, 0, 0.15)", padding: "40px 24px" }}>
                <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }} className="stats-grid">
                    {[
                        [`${frontStats?.books_published || "0"}+`, "Books Published"],
                        [frontStats?.happy_readers || "0+", "Happy Readers"],
                        [frontStats?.cities_reached || "0+", "Cities Reached"],
                        [frontStats?.sales_platforms || "0+", "Sales Platforms"]
                    ].map(([v, l]) => (
                        <div key={l as string}>
                            <div style={{ fontSize: 36, fontWeight: 900, color: "#730000", lineHeight: 1 }}>{v}</div>
                            <div style={{ color: "#5C3A21", fontSize: 13, fontWeight: 700, marginTop: 6 }}>{l}</div>
                        </div>
                    ))}
                </div>
                <style>{`.stats-grid { @media (max-width:600px) { grid-template-columns: repeat(2,1fr)!important; } }`}</style>
            </section>

            {/* CTA / PUBLISH FORM */}
            <section style={{ padding: "60px 24px", background: "#ffffff" }}>
                <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 style={{ color: "#730000", fontSize: "clamp(16px, 2.5vw, 24px)", fontWeight: 800, marginBottom: 32, letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                            WANT TO PUBLISH YOUR BOOK? SIGN UP TODAY!
                        </h2>
                        
                        <form 
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setFormStatus('submitting');
                                try {
                                    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
                                    const res = await fetch(`${API_BASE_URL}/publish-requests`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(formData)
                                    });
                                    if (res.ok) {
                                        setFormStatus('success');
                                        setFormData({ name: '', email: '', phone: '', country: '' });
                                        setTimeout(() => setFormStatus('idle'), 4000);
                                    } else {
                                        setFormStatus('error');
                                    }
                                } catch (err) {
                                    setFormStatus('error');
                                }
                            }}
                            style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", alignItems: "center" }}
                        >
                            <input 
                                required
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                style={{ flex: "1 1 150px", padding: "14px 20px", borderRadius: 8, border: "1px solid rgba(115,0,0,0.1)", fontSize: 14, outline: "none", background: "#FAF5EF", color: "#1c1917" }}
                            />
                            <input 
                                required
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                style={{ flex: "1 1 150px", padding: "14px 20px", borderRadius: 8, border: "1px solid rgba(115,0,0,0.1)", fontSize: 14, outline: "none", background: "#FAF5EF", color: "#1c1917" }}
                            />
                            <input 
                                required
                                type="tel"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                style={{ flex: "1 1 150px", padding: "14px 20px", borderRadius: 8, border: "1px solid rgba(115,0,0,0.1)", fontSize: 14, outline: "none", background: "#FAF5EF", color: "#1c1917" }}
                            />
                            <select 
                                required
                                value={formData.country}
                                onChange={e => setFormData({...formData, country: e.target.value})}
                                style={{ flex: "1 1 150px", padding: "14px 20px", borderRadius: 8, border: "1px solid rgba(115,0,0,0.1)", fontSize: 14, outline: "none", background: "#FAF5EF", color: formData.country ? "#1c1917" : "#6b7280" }}
                            >
                                <option value="" disabled>Country</option>
                                <option value="India">India</option>
                                <option value="USA">USA</option>
                                <option value="UK">UK</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                                <option value="Other">Other</option>
                            </select>

                            <div style={{ flexBasis: "100%", height: 8 }}></div>

                            <button 
                                type="submit" 
                                disabled={formStatus === 'submitting'}
                                style={{ 
                                    flex: "1 1 100%", 
                                    maxWidth: 1170, 
                                    padding: "16px 32px", 
                                    background: "#D4AF37", 
                                    color: "#1c1917", 
                                    fontWeight: 800, 
                                    fontSize: 16, 
                                    border: "none", 
                                    borderRadius: 8, 
                                    cursor: "pointer",
                                    boxShadow: "0 4px 15px rgba(212, 175, 55, 0.4)",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(212, 175, 55, 0.6)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(212, 175, 55, 0.4)"; }}
                            >
                                {formStatus === 'submitting' ? 'Submitting...' : formStatus === 'success' ? 'Thank You!' : 'Publish Your Book Today!'}
                            </button>
                            {formStatus === 'error' && <div style={{ color: "#ff8080", fontSize: 14, marginTop: 8, width: "100%" }}>Failed to submit request. Please try again.</div>}
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* FEATURED BOOK */}
            <section style={{ padding: "80px 24px", background: "#FAF5EF" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 56 }}>
                        <span className="section-badge" style={{ color: "#D4AF37" }}>Top Choice</span>
                        <h2 className="section-title" style={{ color: "#730000", marginTop: 4 }}>
                            <WordReveal text="Our Best-Selling Book" once={true} />
                        </h2>
                        <div className="divider" />
                    </div>
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeIn}
                        style={{ background: "transparent", overflow: "hidden" }}
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="feat-grid">
                            {/* Cover side */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                {!bestsellerBook || bestsellerBook.title === "Bestseller Coming Soon" ? (
                                    /* Beautiful custom CSS placeholder book cover */
                                    <div style={{
                                        position: "relative",
                                        width: 290,
                                        height: 410,
                                        borderRadius: "4px 12px 12px 4px",
                                        background: "linear-gradient(135deg, #78625B 0%, #3B2A24 100%)",
                                        boxShadow: "0 15px 30px rgba(115,0,0,0.15), inset 8px 0 10px rgba(255,255,255,0.05), inset -8px 0 10px rgba(0,0,0,0.2)",
                                        borderLeft: "4px solid rgba(0,0,0,0.3)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "48px 24px",
                                        boxSizing: "border-box"
                                    }}>
                                        <div style={{ position: "absolute", inset: 12, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, pointerEvents: "none" }} />
                                        <div style={{ color: "#D4AF37", fontSize: 32 }}>🍁</div>
                                        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
                                            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#FAF5EF", lineHeight: 1.2 }}>Bestseller</span>
                                            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#FAF5EF", lineHeight: 1.2 }}>Coming</span>
                                            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#FAF5EF", lineHeight: 1.2 }}>Soon</span>
                                        </div>
                                        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 9, fontWeight: 700, color: "#D4AF37", letterSpacing: 2, textTransform: "uppercase" }}>EverCraft Debut</div>
                                    </div>
                                ) : (
                                    /* Real Book cover */
                                    <div key={`bestseller-${bestsellerBook.id}`} style={{ position: "relative", cursor: "pointer" }} onClick={() => openBook(bestsellerBook)}>
                                        <div style={{ position: "absolute", inset: -12, background: "radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)", filter: "blur(12px)" }} />
                                        <div style={{ transition: "transform 0.3s" }} onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")} onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
                                            {bestsellerBook.frontCover ? (
                                                <img src={bestsellerBook.frontCover} alt={bestsellerBook.title} style={{ width: 290, height: 410, borderRadius: 8, filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.15))", objectFit: "cover", background: "#f3f4f6" }} />
                                            ) : (
                                                <div style={{ width: 290, height: 410, borderRadius: 8, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.15))", color: "#9ca3af", fontWeight: 700 }}>No Cover</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Featured Debut Pill Badge */}
                                <div style={{
                                    marginTop: 24,
                                    background: "#D4AF37",
                                    color: "#FAF5EF",
                                    padding: "8px 18px",
                                    borderRadius: 20,
                                    fontWeight: 700,
                                    fontSize: 12,
                                    letterSpacing: 0.5,
                                    boxShadow: "0 4px 10px rgba(212, 175, 55, 0.2)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6
                                }}>
                                    <span>★</span> FEATURED DEBUT
                                </div>
                            </div>

                            {/* Info side */}
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                {!bestsellerBook || bestsellerBook.title === "Bestseller Coming Soon" ? (
                                    /* Coming Soon layout matching Screenshot 2 */
                                    <>
                                        <span className="section-badge" style={{ textAlign: "left", marginBottom: 12 }}>Featured Release</span>
                                        <h2 className="section-title" style={{ color: "#730000", marginBottom: 20, textAlign: "left", fontSize: "clamp(28px, 4.5vw, 44px)" }}>
                                            <WordReveal text="Our best-selling book, *unveiled* soon" once={true} />
                                        </h2>
                                        <p style={{ color: "#730000", opacity: 0.85, fontSize: 15, lineHeight: 1.8, marginBottom: 28, maxWidth: 500 }}>
                                            Stay tuned — our debut bestseller is in final production. A story crafted with care, printed with intention, and ready to find its readers.
                                        </p>
                                        
                                        {/* Bullets */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14, fontWeight: 700, color: "#730000" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4AF37" }} />
                                                <span>Premium paper</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#730000" }} />
                                                <span>Hand-finished cover</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4AF37" }} />
                                                <span>Nationwide release</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* Real buyable book details */
                                    <>
                                         <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                                             <span style={{ background: "#FAF5EF", color: "#D4AF37", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 1, border: "1px solid rgba(212, 175, 55, 0.3)" }}>{bestsellerBook.genre}</span>
                                             {bestsellerBook.is_upcoming ? (
                                                 <span style={{ background: "#FAF5EF", color: "#aa7c11", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(212,175,55,0.3)" }}>
                                                     ⏳ Upcoming Release: {bestsellerBook.release_date || "Coming Soon"}
                                                 </span>
                                             ) : (
                                                 <span style={{ background: bestsellerBook.available ? "#dcfce7" : "#fee2e2", color: bestsellerBook.available ? "#16a34a" : "#dc2626", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                                                     {bestsellerBook.available ? `✅ In Stock: ${bestsellerBook.stock ?? 0} copies left` : "❌ Out of Stock"}
                                                 </span>
                                             )}
                                         </div>
                                         <h3 style={{ fontSize: 32, fontWeight: 800, color: "#730000", marginBottom: 4, lineHeight: 1.2, fontFamily: "'Playfair Display', Georgia, serif" }}>{bestsellerBook.title}</h3>
                                         {bestsellerBook.titleHindi && bestsellerBook.titleHindi !== bestsellerBook.title && <h4 style={{ fontSize: 18, color: "#D4AF37", fontWeight: 700, marginBottom: 8 }}>{bestsellerBook.titleHindi}</h4>}
                                         <p style={{ color: "#5c5c5c", marginBottom: 16, fontSize: 15 }}>by <strong style={{ color: "#730000" }}>{bestsellerBook.author}</strong> {bestsellerBook.authorHindi !== bestsellerBook.author && <span style={{ color: "#D4AF37" }}>({bestsellerBook.authorHindi})</span>}</p>
                                         <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, background: "#FAF5EF", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(115,0,0,0.1)" }}>
                                             <Stars rating={bestsellerBook.rating} />
                                             <strong style={{ color: "#D4AF37" }}>{bestsellerBook.rating}</strong>
                                             <span style={{ color: "#5c5c5c", fontSize: 13 }}>({bestsellerBook.reviews} reviews)</span>
                                         </div>
                                         <p style={{ color: "#730000", opacity: 0.8, lineHeight: 1.7, fontSize: 14, marginBottom: 20 }}>{bestsellerBook.description.length > 250 ? bestsellerBook.description.slice(0, 250) + "..." : bestsellerBook.description}</p>
                                         
                                         {bestsellerBook.is_upcoming ? (
                                             <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
                                                 <span style={{ fontSize: 28, fontWeight: 900, color: "#aa7c11" }}>Coming Soon</span>
                                             </div>
                                         ) : (
                                             <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
                                                 <span style={{ fontSize: 32, fontWeight: 900, color: "#730000" }}>₹{bestsellerBook.price}</span>
                                                 {bestsellerBook.mrp > bestsellerBook.price && (
                                                     <>
                                                         <span style={{ fontSize: 18, color: "#5c5c5c", textDecoration: "line-through" }}>₹{bestsellerBook.mrp}</span>
                                                         <Disc pct={Math.round(((bestsellerBook.mrp - bestsellerBook.price) / bestsellerBook.mrp) * 100)} />
                                                     </>
                                                 )}
                                             </div>
                                         )}
 
                                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "#FAF5EF", borderRadius: 12, padding: 14, marginBottom: 24, fontSize: 13, color: "#730000", border: "1.5px solid rgba(115,0,0,0.1)" }}>
                                             <div>📖 <strong>{bestsellerBook.pages}</strong> Pages</div>
                                             <div>🌐 <strong>{bestsellerBook.language}</strong></div>
                                             <div>🔖 ISBN: <strong style={{ fontSize: 11 }}>{bestsellerBook.isbn}</strong></div>
                                             <div>📦 Stock: <strong>{bestsellerBook.stock ?? 0} copies left</strong></div>
                                         </div>
                                         <div style={{ display: "flex", gap: 12 }}>
                                             {bestsellerBook.is_upcoming ? (
                                                 <>
                                                   <NotifyMeButton bookId={bestsellerBook.id} className="btn-primary" style={{ flex: 1, background: "#730000", color: "#fff", border: "none" }} />
                                                   <button className="btn-primary" style={{ flex: 1, background: "transparent", border: "2px solid #730000", color: "#730000" }}>💖 Wishlist</button>
                                                 </>
                                             ) : bestsellerBook.price === 0 ? (
                                                 <Link to={`/read/${bestsellerBook.id}`} className="btn-primary" style={{ flex: 1, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", background: "#059669" }}>📖 Read Now</Link>
                                             ) : (
                                                 <button className="btn-primary" style={{ flex: 1 }} onClick={() => addToCart(bestsellerBook)}>🛒 Add to Cart</button>
                                             )}
                                             {!bestsellerBook.is_upcoming && (
                                                 <button onClick={() => openBook(bestsellerBook)} style={{ flex: 1, border: "2px solid #730000", color: "#730000", background: "none", borderRadius: "9999px", padding: "12px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14, transition: "all 0.2s" }}
                                                     onMouseEnter={e => { e.currentTarget.style.background = "rgba(115,0,0,0.05)"; }} onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
                                                     📖 View Details
                                                 </button>
                                             )}
                                         </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
                <style>{`.feat-grid { @media(max-width:768px){grid-template-columns:1fr!important;} }`}</style>
            </section>

            {/* SERVICES PREVIEW */}
            <section style={{ padding: "80px 24px", background: "#ffffff", borderTop: "1px solid rgba(115, 0, 0, 0.05)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 48 }}>
                        <div>
                            <span className="section-badge" style={{ textAlign: "left", display: "block" }}>What We Offer</span>
                            <h2 className="section-title" style={{ textAlign: "left", margin: 0, color: "#730000" }}>
                                <WordReveal text="End-to-end *Publishing* Services" once={true} />
                            </h2>
                        </div>
                        <button
                            onClick={() => go("services")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#730000",
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: "pointer",
                                textDecoration: "underline",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                paddingBottom: 6
                            }}
                        >
                            View all services →
                        </button>
                    </div>
                    
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} 
                        className="srv-grid"
                    >
                        {SERVICES.map((s, idx) => (
                            <motion.div 
                                variants={fadeInUp}
                                key={s.title} 
                                className="card-hover" 
                                style={{ 
                                    background: "#ffffff", 
                                    border: "1.5px solid rgba(115, 0, 0, 0.08)", 
                                    borderRadius: 16, 
                                    padding: "32px 28px", 
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
                                }}
                                onClick={() => go(`services/${s.slug}`)}
                            >
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#730000", opacity: 0.6 }}>
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <div style={{ 
                                    width: 44, 
                                    height: 44, 
                                    borderRadius: "50%", 
                                    background: "#D4AF37", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    fontSize: 18, 
                                    marginTop: 16,
                                    boxShadow: "0 4px 10px rgba(212, 175, 55, 0.2)"
                                }}>
                                    {s.icon}
                                </div>
                                <h3 style={{ 
                                    color: "#730000", 
                                    fontFamily: "'Playfair Display', Georgia, serif", 
                                    fontWeight: 800, 
                                    fontSize: 18, 
                                    marginTop: 20, 
                                    marginBottom: 8 
                                }}>
                                    {s.title}
                                </h3>
                                <p style={{ color: "#730000", opacity: 0.8, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
                <style>{`.srv-grid { @media(max-width:900px){grid-template-columns:repeat(2,1fr)!important;} @media(max-width:560px){grid-template-columns:1fr!important;} }`}</style>
            </section>

            {/* TESTIMONIALS */}
            <section style={{ padding: "80px 24px", background: "#730000" }}>
                <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        style={{ textAlign: "center", marginBottom: 56 }}
                    >
                        <span className="section-badge" style={{ color: "#D4AF37" }}>Author & Readers Stories</span>
                        <h2 className="section-title" style={{ color: "#ffffff", marginTop: 4 }}><WordReveal text="What they _say_" wordClassName="text-white" /></h2>
                    </motion.div>

                    <div 
                        ref={testScrollRef}
                        style={{ 
                            display: "flex", 
                            gap: 24, 
                            overflowX: "auto", 
                            scrollBehavior: "smooth", 
                            scrollSnapType: "x mandatory",
                            padding: "20px 10px"
                        }} 
                        className="testimonials-slider"
                    >
                        {(testimonials && testimonials.length > 0 ? testimonials : TESTIMONIALS).map((t, idx) => (
                            <div 
                                key={t.name} 
                                className="card-hover testimonial-card" 
                                style={{ 
                                    background: "rgba(255, 255, 255, 0.08)", 
                                    borderRadius: 16, 
                                    padding: 28, 
                                    border: "1px solid rgba(255, 255, 255, 0.15)", 
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                    display: "flex",
                                    flexDirection: "column",
                                    scrollSnapAlign: "start"
                                }}
                            >
                                <Stars rating={t.rating} size={15} />
                                <p style={{ 
                                    fontFamily: "'Playfair Display', Georgia, serif", 
                                    color: "#ffffff", 
                                    fontStyle: "italic", 
                                    lineHeight: 1.7, 
                                    fontSize: 14, 
                                    margin: "14px 0 20px" 
                                }}>
                                    "{t.text}"
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto" }}>
                                    <div style={{ 
                                        width: 38, 
                                        height: 38, 
                                        borderRadius: "50%", 
                                        background: "#D4AF37", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        color: "#FAF5EF", 
                                        fontWeight: 800, 
                                        fontSize: 13 
                                    }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: "#ffffff" }}>{t.name}</div>
                                        <div className="testi-role" style={{ fontSize: 12, color: "#D4AF37" }}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 32 }}>
                        <button 
                            onClick={() => scrollTest('left')} 
                            style={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: "50%", 
                                border: "1.5px solid rgba(255,255,255,0.3)", 
                                background: "transparent", 
                                color: "#ffffff", 
                                fontSize: 18, 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                cursor: "pointer", 
                                transition: "all 0.2s" 
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#730000"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ffffff"; }}
                        >
                            ←
                        </button>
                        <button 
                            onClick={() => scrollTest('right')} 
                            style={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: "50%", 
                                border: "1.5px solid rgba(255,255,255,0.3)", 
                                background: "transparent", 
                                color: "#ffffff", 
                                fontSize: 18, 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                cursor: "pointer", 
                                transition: "all 0.2s" 
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#730000"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ffffff"; }}
                        >
                            →
                        </button>
                    </div>
                </div>
                <style>{`
                    .testimonials-slider::-webkit-scrollbar { display: none; }
                    .testimonials-slider { -ms-overflow-style: none; scrollbar-width: none; }
                    .testimonial-card { flex: 0 0 350px; }
                    @media(max-width: 640px) {
                        .testimonial-card { flex: 0 0 85vw; }
                    }
                `}</style>
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
                        <span className="section-badge" style={{ color: "#730000" }}>Your Turn</span>
                        <h2 className="section-title" style={{ color: "#730000", fontSize: "clamp(28px, 5vw, 48px)", marginTop: 6, marginBottom: 16 }}>
                            <WordReveal text="Ready to share your story with the *world*?" once={true} />
                        </h2>
                        <p style={{ color: "#730000", opacity: 0.8, fontSize: 16, marginBottom: 36, lineHeight: 1.7, maxWidth: 580, margin: "0 auto 36px" }}>
                            Join the EverCraft family. We'll take your manuscript from raw draft to published masterpiece.
                        </p>
                        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                            <button onClick={() => go("publish")} className="btn-primary">
                                Start Publishing Journey ✒️
                            </button>
                            <button onClick={() => go("contact")} className="btn-outline">
                                Talk to Our Team
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

