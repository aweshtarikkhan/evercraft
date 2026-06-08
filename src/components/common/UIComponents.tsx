import { useEffect, useState } from "react";

export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db", fontSize: size }}>{s <= Math.round(rating) ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export function Disc({ pct }: { pct: number }) {
  return <span style={{ background: "#fef2f2", color: "#dc2626", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{pct}% OFF</span>;
}

export function BookCoverSVG({ src, width = 160, height = 224, badge }: { src?: string; width?: number; height?: number; badge?: string }) {
  return (
    <div style={{ position: "relative", width, height, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))" }}>
      {src ? (
        <img src={src} alt="Book Cover" style={{ width: "100%", height: "100%", borderRadius: 8, objectFit: "cover", background: "#f3f4f6" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", borderRadius: 8, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13, fontWeight: 600 }}>No Cover</div>
      )}
      {badge && (
        <span style={{ position: "absolute", top: 8, right: 8, background: "#ef4444", color: "#fff", padding: "4px 8px", borderRadius: 12, fontSize: 12, fontWeight: 800, boxShadow: "0 2px 4px rgba(0,0,0,0.2)", zIndex: 10 }}>
          {badge}
        </span>
      )}
    </div>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function Logo({ size = 50 }: { size?: number }) {
  return (
    <img
      src="/Images/Evercraft Logo.webp"
      alt="Evercraft Logo"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

export function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="animate-bounceIn" style={{
      position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
      background: "linear-gradient(135deg, #065f46, #047857)",
      color: "white", padding: "14px 20px", borderRadius: 14,
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", gap: 10, maxWidth: 340
    }}>
      <span style={{ fontSize: 20 }}>✅</span>
      <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: 16, padding: 0 }}>✕</button>
    </div>
  );
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) setVisible(true);
  }, []);

  const handleConsent = (status: "accepted" | "denied") => {
    localStorage.setItem("cookieConsent", status);
    setVisible(false);
    console.log(`User Cookie Consent recorded: ${status}`);
  };

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: 20 }}>
      <div className="animate-bounceIn" style={{ background: "#1C1917", border: "1px solid rgba(212, 175, 55, 0.3)", padding: "28px", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", maxWidth: 380, width: "100%", textAlign: "center" }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#FAF5EF", marginBottom: 8 }}>🍪 We Value Your Privacy</h3>
        <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept", you consent to our use of cookies.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" onClick={() => handleConsent("accepted")} style={{ flex: 1, padding: "10px", fontSize: 13 }}>Accept</button>
          <button onClick={() => handleConsent("denied")} style={{ flex: 1, padding: "10px", fontSize: 13, background: "transparent", border: "1.5px solid rgba(212, 175, 55, 0.25)", color: "#374151", borderRadius: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>Deny</button>
        </div>
      </div>
    </div>
  );
}

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const resp = await fetch(`${API_BASE_URL}/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (resp.ok) {
        setSubscribed(true);
      } else {
        alert("❌ Failed to subscribe.");
      }
    } catch (err) {
      alert("❌ Server connection error.");
    }
  };

  if (subscribed) return (
    <section style={{ padding: "60px 24px", background: "#1C1917", textAlign: "center", borderTop: "1px solid rgba(212, 175, 55, 0.1)" }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#b45309", marginBottom: 12 }}>Thank You for Subscribing! 🎉</h2>
      <p style={{ color: "#78716c", fontSize: 16 }}>You're now on our mailing list. Keep an eye on your inbox for the latest updates!</p>
    </section>
  );

  return (
    <section style={{ padding: "60px 24px", background: "#1C1917", textAlign: "center", borderTop: "1px solid rgba(212, 175, 55, 0.1)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
       <div style={{ fontSize: 40, marginBottom: 16 }}>💌</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#FAF5EF", marginBottom: 12 }}>Subscribe to Our Newsletter</h2>
        <p style={{ color: "#57534e", fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>Get the latest updates on new book releases, author interviews, and exclusive publishing tips straight to your inbox.</p>
        <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <input required type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)}
           style={{ flex: "1 1 250px", padding: "14px 20px", borderRadius: 12, border: "2px solid rgba(212, 175, 55, 0.3)", fontSize: 15, outline: "none", boxShadow: "0 4px 12px rgba(180,83,9,0.05)" }}
            onFocus={e => e.target.style.borderColor = "#b45309"} onBlur={e => e.target.style.borderColor = "rgba(212, 175, 55, 0.3)"} />
          <button type="submit" className="btn-primary" style={{ padding: "14px 28px", fontSize: 15, flexShrink: 0 }}>Subscribe</button>
        </form>
      </div>
    </section>
  );
}

export function NotifyMeButton({ bookId, style, className }: { bookId: number; style?: React.CSSProperties; className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleNotify = async () => {
    const email = prompt("Enter your email address to get notified:");
    if (!email) return;

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/books/${bookId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (resp.ok) {
        alert("You have been added to the notification list!");
      } else {
        alert("Failed to subscribe. Please try again.");
      }
    } catch (e) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleNotify} 
      className={className} 
      style={{ ...style, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
      disabled={loading}
    >
      {loading ? "Subscribing..." : "🔔 Notify me when available"}
    </button>
  );
}
