import { useState, useEffect, useRef, useCallback, useLayoutEffect, FC } from "react";
import { Routes, Route, Link, useNavigate, useLocation, useParams, } from "react-router-dom";
import { Page, Book, CartItem, User } from "./types";
import { SOCIAL_LINKS } from "./constants/data"; 
import { uploadImageToCloudinary } from "./utils/cloudinary";
import { BookCoverSVG, Logo, Toast, NewsletterSection } from "./components/common/UIComponents";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { BookPage } from "./pages/BookPage";

import { ServicesPage } from "./pages/ServicesPage";
import { AboutPage } from "./pages/AboutPage";
import { PublishPage } from "./pages/PublishPage";
import { ContactPage } from "./pages/ContactPage";
import { CartPage } from "./pages/CartPage";
import { AdminPanel } from "./pages/AdminPanel";
import { Footer } from "./components/layout/Footer";
import { ServiceDetailPage } from "./pages/ServiceDetailPage";
import { FreeReaderPage } from "./pages/FreeReaderPage";
import { PrivacyPolicyPage, TermsConditionsPage, RefundPolicyPage } from "./pages/Policies";
import { supabase } from "./utils/supabase";
import { LoginModal } from "./components/modals/LoginModal";
import { ErrorBoundary } from "./components/ErrorBoundary";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const NewsletterPopup: FC<{user: User, onClose: () => void, showToast: (msg: string) => void}> = ({ user, onClose, showToast }) => {
    const [email, setEmail] = useState(user.email || "");
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            showToast("⚠️ Please enter your email.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/subscribers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                showToast("✅ Subscribed successfully! Thank you for joining our newsletter.");
                localStorage.setItem("evercraft_subscribed_newsletter", "true");
                onClose();
            } else {
                const err = await res.json();
                if (res.status === 500 && (err.detail || "").includes("Duplicate entry")) {
                    showToast("👍 You are already subscribed to our newsletter!");
                } else {
                    showToast(`❌ ${err.detail || "Subscription failed."}`);
                }
                localStorage.setItem("evercraft_subscribed_newsletter", "true"); // Don't show again even if failed
                onClose();
            }
        } catch (err) {
            showToast("❌ Network error during subscription.");
        }
        setLoading(false);
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div className="animate-bounceIn" style={{ background: "#1C1917", width: "100%", maxWidth: 480, borderRadius: 24, padding: 32, textAlign: 'center', position: 'relative', boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: "#f3f4f6", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💌</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#FAF5EF", marginBottom: 12 }}>Subscribe to Our Newsletter</h2>
                <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 24 }}>Get the latest updates on new releases, special offers, and author events.</p>
                <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email address" style={{ width: "100%", padding: "14px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                    <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "14px", fontSize: 15 }}>{loading ? "Subscribing..." : "Subscribe Now"}</button>
                </form>
            </div>
        </div>
    );
}

const CookieConsentPopup: FC<{ onConsent: (status: 'accepted' | 'denied') => void }> = ({ onConsent }) => {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{
        maxWidth: 400, width: '100%',
        background: '#1c1917', color: '#fff', padding: '24px', borderRadius: 16,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center'
      }} className="animate-bounceIn">
        <h4 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>🍪 We use cookies</h4>
        <p style={{ fontSize: 14, color: '#a1a09f', lineHeight: 1.6, margin: 0 }}>
          This website uses cookies to ensure you get the best experience. By continuing to use this site, you agree to our use of cookies.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, width: '100%' }}>
          <button
            onClick={() => onConsent('accepted')}
            className="btn-primary"
            style={{ flex: 1, padding: '10px 16px', fontSize: 14 }}
          >
            Accept
          </button>
          <button
            onClick={() => onConsent('denied')}
            style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── IMAGE CROPPER MODAL ──────────────────────────────────────────────────────
function ImageCropperModal({ imageSrc, onCrop, onCancel }: { imageSrc: string, onCrop: (b64: string) => void, onCancel: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const minDim = Math.min(img.width, img.height);
      const scale = (120 / minDim) * zoom;
      const w = img.width * scale;
      const h = img.height * scale;
      const cx = (120 - w) / 2 + offset.x;
      const cy = (120 - h) / 2 + offset.y;
      ctx.drawImage(img, cx, cy, w, h);
    };
    img.src = imageSrc;
  }, [imageSrc, zoom, offset]);

  const handlePointerDown = (e: any) => { setDragging(true); setDragStart({ x: (e.touches ? e.touches[0].clientX : e.clientX) - offset.x, y: (e.touches ? e.touches[0].clientY : e.clientY) - offset.y }); };
  const handlePointerMove = (e: any) => { if (dragging) setOffset({ x: (e.touches ? e.touches[0].clientX : e.clientX) - dragStart.x, y: (e.touches ? e.touches[0].clientY : e.clientY) - dragStart.y }); };
  const handlePointerUp = () => setDragging(false);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="animate-bounceIn" style={{ background: "#1C1917", padding: 24, borderRadius: 16, textAlign: "center", width: 300 }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#FAF5EF" }}>Crop Profile Image</h3>
        <div style={{ width: 120, height: 120, border: "2px dashed #b45309", borderRadius: "50%", margin: "0 auto", overflow: "hidden", cursor: dragging ? "grabbing" : "grab", touchAction: "none" }} onMouseDown={handlePointerDown} onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp} onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}>
          <canvas ref={canvasRef} width={120} height={120} style={{ display: "block", margin: "0 auto" }} />
        </div>
        <div style={{ margin: "20px 0" }}><label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 8 }}>Zoom Image</label><input type="range" min="1" max="3" step="0.05" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} style={{ width: "100%" }} /></div>
        <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16 }}>Drag image inside the circle to adjust</p>
        <div style={{ display: "flex", gap: 10 }}><button onClick={onCancel} style={{ flex: 1, padding: "10px", border: "1px solid rgba(212, 175, 55, 0.2)", background: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Cancel</button><button onClick={() => { if(canvasRef.current) onCrop(canvasRef.current.toDataURL("image/jpeg", 0.6)); }} className="btn-primary" style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 }}>Apply & Save</button></div>
      </div>
    </div>
  );
}

// ─── USER DASHBOARD MODAL ────────────────────────────────────────────────────
function UserDashboardModal({ tab, currentUser, setCurrentUser, onClose, showToast }: { tab: string, currentUser: User, setCurrentUser: (u: User) => void, onClose: () => void, showToast: (msg: string) => void }) {
  const [activeTab, setActiveTab] = useState(tab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Profile State
  const [name, setName] = useState(currentUser.name || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [profileImg, setProfileImg] = useState(currentUser.profile_image || "");
  const [cropImageRaw, setCropImageRaw] = useState<string | null>(null);

  // Addresses State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddr, setNewAddr] = useState({ type: "Home", address: "", city: "", pincode: "" });
  const [showAddrForm, setShowAddrForm] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [pwdOtpSent, setPwdOtpSent] = useState(false);
  const [pwdOtp, setPwdOtp] = useState("");
  const [enteredPwdOtp, setEnteredPwdOtp] = useState("");

  useEffect(() => {
    if(activeTab === "Address") {
      fetch(`${API_BASE_URL}/users/${currentUser.id}/addresses`).then(r => r.json()).then(setAddresses).catch(()=>{});
    }
    if(activeTab === "Orders") {
      fetch(`${API_BASE_URL}/users/${currentUser.id}/orders`).then(r => r.json()).then(setOrders).catch(()=>{});
    }
  }, [activeTab, currentUser.id]);

  const saveProfile = async (newImgBase64?: string | any) => {
    let finalImg = typeof newImgBase64 === "string" ? newImgBase64 : profileImg;

    // Agar image nayi hai to usko database me bhejney se pehle Cloudinary par upload karo
    if (finalImg && finalImg.startsWith("data:image")) {
      showToast("⏳ Uploading image to Cloudinary...");
      try {
        finalImg = await uploadImageToCloudinary(finalImg);
        setProfileImg(finalImg); // React UI me base64 hata kar original Cloudinary URL set karo
      } catch(e: any) {
        showToast("❌ Upload Failed! Did you create the 'evercraft' unsigned preset?");
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "", email: email || "", phone: phone || "", profile_image: finalImg || "" })
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        localStorage.setItem("evercraft_user", JSON.stringify(updated));
        showToast("Profile Updated Successfully!");
      } else {
        const errData = await res.json();
        showToast(`❌ Update Failed: ${errData.detail || "Database Error"}`);
        console.error("Backend Error:", errData);
      }
    } catch(e: any) { 
      showToast(`❌ Network Error: ${e.message}`); 
      console.error(e);
    }
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr)
      });
      if (res.ok) {
        setShowAddrForm(false);
        setNewAddr({ type: "Home", address: "", city: "", pincode: "" }); // Form ko reset karein
        showToast("✅ Address Added Successfully!");
        fetch(`${API_BASE_URL}/users/${currentUser.id}/addresses`).then(r => r.json()).then(setAddresses); // Address list refresh karein
      } else {
        showToast("❌ Failed to add address. Server error.");
      }
    } catch (err) {
      showToast("❌ Network error. Could not connect to server.");
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdOtpSent) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentUser.email })
        });
        if (res.ok) {
          setPwdOtpSent(true);
          showToast("✉️ The verification OTP has been sent to your email!");
        } else {
          showToast("❌ Failed to send OTP.");
        }
      } catch (err) {
        showToast("❌ Network error. Could not send OTP.");
      }
      return;
    }

    // Verify OTP first
    try {
      const verifyRes = await fetch(`${API_BASE_URL}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email, otp: enteredPwdOtp, verify_only: true })
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        showToast(`❌ ${err.detail || "Invalid or expired OTP!"}`);
        return;
      }

      // Update password
      const changeRes = await fetch(`${API_BASE_URL}/users/${currentUser.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword })
      });

      if (changeRes.ok) {
        showToast("✅ Password Changed Successfully!");
        setPwdOtpSent(false);
        setNewPassword("");
        setEnteredPwdOtp("");
      } else {
        showToast("❌ Error changing password");
      }
    } catch(e) {
      showToast("❌ Network error while updating password.");
    }
  };

  return (
    <>
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
       <div className="animate-bounceIn user-dashboard-modal" style={{ background: "#2D1B10", width: "100%", maxWidth: 700, borderRadius: 24, overflow: "hidden", display: "flex", height: "80vh", position: "relative", border: "1.5px solid rgba(212, 175, 55, 0.25)" }}>
        
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#1C1109", border: "none", fontSize: 16, cursor: "pointer", color: "#D4AF37", zIndex: 10, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.color = "#1C1109"; }} onMouseLeave={e => { e.currentTarget.style.background = "#1C1109"; e.currentTarget.style.color = "#D4AF37"; }}>✕</button>

       {/* Sidebar */}
       <div className="user-dashboard-sidebar" style={{ width: 200, background: "#1C1109", borderRight: "1.5px solid rgba(212, 175, 55, 0.15)", padding: 20, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20, color: "#D4AF37" }}>My Account</h3>
          {["Profile", "Orders", "Address", "Password"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ width: "100%", textAlign: "left", padding: "12px 14px", border: "none", borderRadius: 10, background: activeTab === t ? "#D4AF37" : "transparent", color: activeTab === t ? "#1C1109" : "#FAF5EF", fontWeight: 700, cursor: "pointer", marginBottom: 6, transition: "all 0.2s" }}>
              {t === "Orders" ? "My Orders" : t === "Address" ? "My Addresses" : t === "Password" ? "Change Password" : t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto", position: "relative", color: "#FAF5EF" }}>
          <div className="user-dashboard-mobile-header">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: '#1C1109', border: 'none', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#D4AF37" }}>My Account</h3>
              <p style={{ fontSize: 13, color: '#E6D5C3', marginTop: 2 }}>{activeTab}</p>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="animate-slideDown" style={{ position: 'absolute', top: 75, left: 20, right: 20, background: '#1C1109', zIndex: 20, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.4)', border: '1.5px solid rgba(212, 175, 55, 0.25)', padding: 12 }}>
              {["Profile", "Orders", "Address", "Password"].map(t => (
                <button key={t} onClick={() => { setActiveTab(t); setMobileMenuOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "12px 14px", border: "none", borderRadius: 10, background: activeTab === t ? "#D4AF37" : "transparent", color: activeTab === t ? "#1C1109" : "#FAF5EF", fontWeight: 700, cursor: "pointer", marginBottom: 2, transition: "all 0.2s" }}>
                  {t === "Orders" ? "My Orders" : t === "Address" ? "My Addresses" : t === "Password" ? "Change Password" : t}
                </button>
              ))}
            </div>
          )}

          {activeTab === "Profile" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#FAF5EF" }}>Personal Information</h2>
              <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                  <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="dashboard-input" />
                  <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="dashboard-input" />
                  <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="dashboard-input" />
                  <button onClick={() => saveProfile()} className="btn-primary" style={{ padding: "12px", width: 120 }}>Save Profile</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 120, height: 120, borderRadius: "50%", background: "#1C1109", border: "2px dashed #D4AF37", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {profileImg ? <img src={profileImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setProfileImg("")} /> : <span style={{ fontSize: 32, color: "#D4AF37" }}>👤</span>}
                  </div>
                  <label style={{ cursor: "pointer", color: "#D4AF37", fontWeight: 700, fontSize: 13, background: "#1C1109", border: "1px solid rgba(212, 175, 55, 0.3)", padding: "6px 14px", borderRadius: 20 }}>
                    Change Image
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          const compressed = await compressImage(e.target.files[0], 1);
                          setCropImageRaw(compressed);
                        } catch (err: any) {
                          showToast(`⚠️ ${err.message || "Failed to process image"}`);
                        }
                      }
                      e.target.value = "";
                    }} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Orders" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#FAF5EF" }}>Order History</h2>
              {orders.length === 0 ? <p style={{ color: "#E6D5C3" }}>No orders placed yet.</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {orders.map(o => {
                    let items = [];
                    try {
                      items = JSON.parse(o.items || "[]");
                    } catch (e) {
                      console.error("Failed to parse order items:", o.items);
                    }
                    return (
                      <div key={o.id} style={{ border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 12, padding: 16, background: "rgba(28, 17, 9, 0.5)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, borderBottom: "1px solid rgba(212, 175, 55, 0.15)", paddingBottom: 10 }}>
                          <span style={{ fontWeight: 700, color: "#FAF5EF" }}>Order #{o.id}</span>
                          <span style={{ fontSize: 12, color: "#E6D5C3" }}>{o.date}</span>
                        </div>
                        {items.map((i: any) => <div key={i.id} style={{ fontSize: 14, color: "#FAF5EF", marginBottom: 4 }}>{i.qty} x {i.title}</div>)}
                        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1C1109", padding: 10, borderRadius: 8, border: "1px solid rgba(212, 175, 55, 0.15)" }}>
                          <strong style={{ color: "#D4AF37" }}>Total: ₹{o.total}</strong>
                          <span style={{ background: o.status === "Delivered" ? "#dcfce7" : "#FAF5EF", color: o.status === "Delivered" ? "#16a34a" : "#aa7c11", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>Track Status: {o.status}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "Address" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#FAF5EF" }}>Saved Addresses</h2>
                <button onClick={() => setShowAddrForm(!showAddrForm)} style={{ background: "#1C1109", color: "#D4AF37", border: "1.5px solid #D4AF37", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>+ Add New</button>
              </div>
              {showAddrForm && ( 
                <form onSubmit={addAddress} style={{ background: "#1C1109", padding: 16, borderRadius: 12, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12, border: "1.5px solid rgba(212, 175, 55, 0.3)" }}>
                  <select required value={newAddr.type} onChange={e => setNewAddr({...newAddr, type: e.target.value})} className="dashboard-select"><option>Home</option><option>Work</option><option>Other</option></select>
                  <textarea required placeholder="Full Address" value={newAddr.address} onChange={e => setNewAddr({...newAddr, address: e.target.value})} className="dashboard-textarea" />
                  <div style={{ display: "flex", gap: 10 }}>
                    <input required placeholder="City" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} className="dashboard-input" />
                    <input required placeholder="Pincode" value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} className="dashboard-input" />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: 10 }}>Save Address</button>
                </form>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="address-grid">
                {addresses.map(a => (
                  <div key={a.id} style={{ border: "1px solid rgba(212, 175, 55, 0.3)", padding: 16, borderRadius: 12, background: "rgba(28, 17, 9, 0.5)" }}>
                    <span style={{ background: "#1C1109", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, marginBottom: 8, display: "inline-block", color: "#D4AF37", border: "1px solid rgba(212, 175, 55, 0.15)" }}>{a.type}</span>
                    <p style={{ fontSize: 14, color: "#FAF5EF", marginBottom: 4 }}>{a.address}</p>
                    <p style={{ fontSize: 13, color: "#E6D5C3" }}>{a.city}, {a.pincode}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Password" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#FAF5EF" }}>Change Password</h2>
              <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
                <input required type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="dashboard-input" />
                {pwdOtpSent && (
                  <>
                    <input required placeholder="Enter OTP" value={enteredPwdOtp} onChange={e => setEnteredPwdOtp(e.target.value)} className="dashboard-input" style={{ letterSpacing: 2, textAlign: "center" }} />
                    <div style={{ textAlign: "right", marginTop: -8 }}>
                      <button type="button" onClick={async () => {
                        try {
                          const res = await fetch(`${API_BASE_URL}/users/send-otp`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: currentUser.email })
                          });
                          if (res.ok) {
                            showToast("✉️ The OTP has been resent to your email!");
                          } else {
                            showToast("❌ Failed to resend OTP.");
                          }
                        } catch (err) {
                          showToast("❌ Network error. Failed to resend OTP.");
                        }
                      }} style={{ background: "none", border: "none", color: "#D4AF37", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Resend OTP</button>
                    </div>
                  </>
                )}
                <button type="submit" className="btn-primary" style={{ padding: "12px" }}>{pwdOtpSent ? "Verify & Change Password" : "Send OTP to Change"}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>

    <style>{`
      .user-dashboard-mobile-header {
        display: none;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        border-bottom: 1px solid rgba(212, 175, 55, 0.15);
        padding-bottom: 16px;
      }
      .dashboard-input {
        background: #1C1109 !important;
        color: #ffffff !important;
        border: 1.5px solid rgba(212, 175, 55, 0.25) !important;
        padding: 12px 16px !important;
        border-radius: 10px !important;
        outline: none !important;
        width: 100% !important;
        box-sizing: border-box !important;
        transition: all 0.2s;
      }
      .dashboard-input:focus {
        border-color: #D4AF37 !important;
        box-shadow: 0 0 8px rgba(212, 175, 55, 0.2) !important;
      }
      .dashboard-input::placeholder {
        color: rgba(255, 255, 255, 0.45) !important;
      }
      .dashboard-textarea {
        background: #1C1109 !important;
        color: #ffffff !important;
        border: 1.5px solid rgba(212, 175, 55, 0.25) !important;
        padding: 12px 16px !important;
        border-radius: 10px !important;
        outline: none !important;
        resize: vertical !important;
        width: 100% !important;
        box-sizing: border-box !important;
        transition: all 0.2s;
      }
      .dashboard-textarea:focus {
        border-color: #D4AF37 !important;
        box-shadow: 0 0 8px rgba(212, 175, 55, 0.2) !important;
      }
      .dashboard-textarea::placeholder {
        color: rgba(255, 255, 255, 0.45) !important;
      }
      .dashboard-select {
        background: #1C1109 !important;
        color: #ffffff !important;
        border: 1.5px solid rgba(212, 175, 55, 0.25) !important;
        padding: 12px 16px !important;
        border-radius: 10px !important;
        outline: none !important;
        width: 100% !important;
        box-sizing: border-box !important;
        transition: all 0.2s;
      }
      .dashboard-select:focus {
        border-color: #D4AF37 !important;
        box-shadow: 0 0 8px rgba(212, 175, 55, 0.2) !important;
      }
      @media (max-width: 640px) {
        .user-dashboard-sidebar { display: none !important; }
        .user-dashboard-mobile-header { display: flex; }
        .address-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>

    {cropImageRaw && (
      <ImageCropperModal
        imageSrc={cropImageRaw}
        onCrop={(base64) => {
          setProfileImg(base64);
          setCropImageRaw(null);
          saveProfile(base64);
        }}
        onCancel={() => setCropImageRaw(null)}
      />
    )}
    </>
  );
}

// ─── BOOK PAGE WRAPPER ────────────────────────────────────────────────────────
function BookPageWrapper({ books, addToCart, go }: { books: Book[], addToCart: (b: Book) => void, go: (p: Page | string) => void }) {
  const { id } = useParams();
  const book = books.find(b => String(b.id) === id);
  if (!book) return <div style={{ padding: "100px 24px", textAlign: "center", fontSize: 20 }}>Book not found!</div>;
  return <BookPage book={book} addToCart={addToCart} go={go as any} />;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("evercraft_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedBook, setSelectedBook] = useState<Book | null>(() => {
    const saved = sessionStorage.getItem("evercraft_selectedBook");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("evercraft_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<"Profile"|"Orders"|"Address"|"Password">("Profile");
  const [frontStats, setFrontStats] = useState<any>({ books_published: "0", happy_readers: "500+", cities_reached: "10+", sales_platforms: "2" });
  const [settings, setSettings] = useState<any>({
    contact_email: "evercraft2026@gmail.com",
    contact_phone: "+91 90090 36633",
    contact_hours: "Mon–Fri, 10 AM – 6 PM IST",
    contact_address: "Vrindavan Nagar, Bhopal - 462022",
    social_facebook: "https://www.facebook.com/EvercraftPublications",
    social_instagram: "https://www.instagram.com/evercraft_publications/",
    social_linkedin: "https://www.linkedin.com/company/bookpublishing/about/",
    social_x: "#"
  });
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [newsletterPopupOpen, setNewsletterPopupOpen] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("evercraft_cart", JSON.stringify(cart));
      if (currentUser) {
        fetch(`${API_BASE_URL}/users/${currentUser.id}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: JSON.stringify(cart) })
        }).catch(err => console.error("Error syncing cart to database:", err));
      }
    } catch (err) {
      console.warn("Storage Full: Cannot save cart to local storage", err);
    }
  }, [cart, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetch(`${API_BASE_URL}/users/${currentUser.id}/cart`)
        .then(res => res.json())
        .then(data => {
          if (data && data.items) {
            try {
              const dbItems = JSON.parse(data.items);
              if (dbItems && dbItems.length > 0) {
                setCart(dbItems);
              }
            } catch (e) {
              console.error("Failed to parse cart items:", e);
            }
          }
        })
        .catch(err => console.error("Error fetching cart from database:", err));
    }
  }, [currentUser]);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/books`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) setBooks(data);
      }
    } catch(err) {
      console.error("Backend not connected yet.");
    }
  }, []);

  const fetchFrontStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/front-stats`, { cache: "no-store" });
      if (res.ok) setFrontStats(await res.json());
    } catch(err) {}
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSettings((prev: any) => ({ ...prev, ...data }));
      }
    } catch(err) {}
  }, []);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch(err) {}
  }, []);

  const refreshAll = useCallback(() => {
    fetchBooks();
    fetchFrontStats();
    fetchTestimonials();
  }, [fetchBooks, fetchFrontStats, fetchTestimonials]);

  // Set Tab Logo (Favicon) and Title dynamically
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = "/favicon.png";
    document.title = "EverCraft Publications";
    fetchBooks();
    fetchFrontStats();
    fetchSettings();
    fetchTestimonials();
  }, [fetchBooks, fetchFrontStats, fetchSettings, fetchTestimonials]);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { email, user_metadata } = session.user;
        const name = user_metadata?.full_name || user_metadata?.name || email?.split('@')[0] || "OAuth User";
        const profile_image = user_metadata?.avatar_url || "";
        
        try {
          const response = await fetch(`${API_BASE_URL}/users/supabase-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name, profile_image })
          });
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
            localStorage.setItem("evercraft_user", JSON.stringify(userData));
            setToast("Logged in successfully!");
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            setToast("❌ OAuth login failed.");
          }
        } catch (err) {
          console.error("OAuth Login Error:", err);
          setToast("❌ Connection error during OAuth login.");
        } finally {
          await supabase?.auth.signOut();
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [setCurrentUser]);

  useEffect(() => {
    // Generate or retrieve a unique session ID for the user
    let sid = sessionStorage.getItem('evercraft_session_id');
    if (!sid) {
      sid = `SESS_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      sessionStorage.setItem('evercraft_session_id', sid);
    }
    setSessionId(sid);

    const consentGiven = localStorage.getItem('evercraft_cookie_consent');
    if (!consentGiven) {
      setShowCookieConsent(true);
    } else {
      setShowCookieConsent(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && 
        localStorage.getItem('evercraft_subscribed_newsletter') !== 'true' && 
        sessionStorage.getItem('evercraft_newsletter_closed') !== 'true') {
      setNewsletterPopupOpen(true);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const navigate = useNavigate();
  const location = useLocation();

  const go = useCallback((page: Page | string) => {
    navigate(page === "home" ? "/" : `/${page}`);
  }, [navigate]);

  // Page change hone par upar scroll karein
  useLayoutEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [location.pathname]);

  const addToCart = useCallback((book: Book) => {
    if (book.stock <= 0) {
      setToast(`"${book.title}" is out of stock!`);
      return;
    }
    setCart(prev => {
      const ex = prev.find(i => i.id === book.id);
      if (ex) {
        if (ex.qty >= book.stock) {
          setToast(`Cannot add more than ${book.stock} for "${book.title}"!`);
          return prev;
        }
        return prev.map(i => i.id === book.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...book, qty: 1 }];
    });
    setToast(`"${book.title}" added to cart!`);
  }, []);

  const removeFromCart = useCallback((id: number) => setCart(p => p.filter(i => i.id !== id)), []);
  const updateQty = useCallback((id: number, qty: number, stock?: number) => {
    if (qty < 1) { removeFromCart(id); return; }
    if (stock !== undefined && qty > stock) {
      setToast(`Cannot exceed available stock (${stock})!`);
      return;
    }
    setCart(p => p.map(i => i.id === id ? { ...i, qty } : i));
  }, [removeFromCart]);

  const openBook = useCallback((book: Book) => {
    navigate(`/book/${book.id}`);
  }, [navigate]);
  // Ensure cart items are valid before reducing
  const validCart = cart.filter(item => item && typeof item === 'object' && item.id && typeof item.price === 'number' && typeof item.qty === 'number');
  const cartCount = validCart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = validCart.reduce((s, i) => s + i.price * i.qty, 0);
  const filtered = books.filter(b =>
    (b.title || "").toLowerCase().includes((search || "").toLowerCase()) ||
    (b.titleHindi || "").includes(search || "") ||
    (b.author || "").toLowerCase().includes((search || "").toLowerCase())
  );
  
  const handleLogout = () => {
    if(currentUser) fetch(`${API_BASE_URL}/users/logout/${currentUser.id}`, { method: "POST" }).catch(()=>{});
    setCurrentUser(null);
    localStorage.removeItem("evercraft_user");
    localStorage.removeItem("token");
    setCart([]);
    sessionStorage.removeItem("evercraft_subscribed_newsletter");
    setUserMenuOpen(false);
    setToast("Logged out successfully");
  };

  const handleCookieConsent = async (status: 'accepted' | 'denied') => {
    localStorage.setItem('evercraft_cookie_consent', status);
    setShowCookieConsent(false);

    try {
      await fetch(`${API_BASE_URL}/cookie-consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: currentUser?.id || null,
          status: status,
        }),
      });
    } catch (err) {
      console.error("Failed to record cookie consent", err);
    }
  };
  const NAV_ITEMS = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Publish With Us", path: "/publish" },
    { label: "Contact", path: "/contact" },
    { label: "Shop", path: "/shop" },
  ];

  return (
    <div ref={topRef} style={{ minHeight: "100vh", background: "#FAF5EF" }}>
      {/* Admin page par Navbar na dikhayein */}
      {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/read') &&
      <nav ref={navRef} style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "#FFFFFF",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        borderBottom: "none"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textDecoration: "none" }}>
            <Logo size={42} />
          </Link>

          {/* Desktop nav */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }} className="hidden-mobile">
            {NAV_ITEMS.map(n => {
              const isActive = location.pathname === n.path;
              return (
                <Link
                  key={n.label}
                  to={n.path}
                  className={`nav-link${isActive ? " active" : ""}`}
                  style={isActive ? {
                    background: "#730000",
                    color: "#ffffff",
                    padding: "8px 20px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                    textDecoration: "none"
                  } : {
                    color: "#730000",
                    fontWeight: 600,
                    textDecoration: "none",
                    padding: "8px 16px"
                  }}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {currentUser ? (
              <div style={{ position: "relative" }} ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{
                  width: 38, height: 38, borderRadius: "50%", background: currentUser.profile_image ? "transparent" : "linear-gradient(135deg, #D4AF37, #730000)", color: "#fff",
                  border: "2px solid #D4AF37", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "hidden"
                }}>
                  {currentUser.profile_image ? <img src={currentUser.profile_image} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.currentTarget.style.display='none'} /> : (currentUser.name || 'U').charAt(0).toUpperCase()}
                </button>
                {userMenuOpen && (
                  <div className="animate-slideDown" style={{ position: "absolute", top: 48, right: 0, width: 240, background: "#ffffff", borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.15)", border: "1.5px solid #D4AF37", overflow: "hidden", zIndex: 9999 }}>
                    <div style={{ padding: "16px", background: "#FAF5EF", display: "flex", alignItems: "center", gap: 12, borderBottom: "1.5px solid rgba(115, 0, 0, 0.15)" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: currentUser.profile_image ? "transparent" : "linear-gradient(135deg, #D4AF37, #730000)", color: "#fff", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        {currentUser.profile_image ? <img src={currentUser.profile_image} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.currentTarget.style.display='none'} /> : (currentUser.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontWeight: 800, color: "#1c1917", fontSize: 15, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{currentUser.name || 'User'}</div>
                        <div style={{ fontSize: 12, color: "#5C3A21", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{currentUser.email}</div>
                      </div>
                    </div>
                    <div style={{ padding: "8px 0" }}>
                      {currentUser.role && currentUser.role !== "Customer" && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} style={{ display: "block", textAlign: "left", padding: "10px 20px", textDecoration: "none", fontSize: 14, color: "#D4AF37", fontWeight: 700 }} onMouseEnter={e => e.currentTarget.style.background = "#FAF5EF"} onMouseLeave={e => e.currentTarget.style.background = "none"}>🔑 Admin Panel</Link>
                      )}
                      {["Profile", "Orders", "Address", "Password"].map(item => (
                        <button key={item} onClick={() => { setDashboardTab(item as any); setDashboardOpen(true); setUserMenuOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#1c1917", fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.background = "#FAF5EF"} onMouseLeave={e => e.currentTarget.style.background = "none"}>{item === "Orders" ? "My Orders" : item === "Address" ? "My Addresses" : item === "Password" ? "Change Password" : item}</button>
                      ))}
                    </div>
                    <div style={{ padding: "8px", borderTop: "1px solid rgba(115, 0, 0, 0.15)" }}>
                      <button onClick={handleLogout} style={{ width: "100%", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: "pointer", fontSize: 14 }} onMouseEnter={e => e.currentTarget.style.background = "#fecaca"} onMouseLeave={e => e.currentTarget.style.background = "#fee2e2"}>Logout</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setLoginOpen(true)} style={{
                background: "transparent", color: "#730000", border: "1.5px solid #730000",
                borderRadius: "9999px", padding: "8px 24px", cursor: "pointer", fontWeight: 700,
                fontSize: 14, transition: "all 0.2s"
              }} onMouseEnter={e => { e.currentTarget.style.background = "#730000"; e.currentTarget.style.color = "#ffffff"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#730000"; }}>
                Login
              </button>
            )}
            <Link to="/cart" style={{
              position: "relative", background: "#730000", color: "#ffffff",
              border: "none", borderRadius: "9999px", padding: "8px 24px", cursor: "pointer",
              fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, textDecoration: 'none'
            }}>
              <span>🛒</span>
              <span className="hidden-mobile">Cart</span>
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: -8, right: -8, background: "#ffffff",
                  color: "#730000", borderRadius: "50%", width: 20, height: 20,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, border: "1px solid #730000"
                }}>{cartCount}</span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, padding: 4, color: "#730000" }}
              className="show-mobile">
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="animate-slideDown" style={{ background: "#ffffff", padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
            {NAV_ITEMS.map(n => (
              <Link key={n.label} to={n.path} onClick={() => setMenuOpen(false)} className={`nav-link${location.pathname === n.path ? " active" : ""}`} style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 2, color: "#730000", textDecoration: "none", padding: "8px 12px" }}>
                {n.label}
              </Link>
            ))}
          </div>
        )}
      </nav>}

      {/* ── PAGES ── */}
      <main style={{ paddingTop: !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/read') ? 64 : 0 }}>
        <Routes>
          <Route path="/" element={<HomePage go={go as any} addToCart={addToCart} openBook={openBook} books={books} frontStats={frontStats} testimonials={testimonials} />} />
          <Route path="/shop" element={<ShopPage search={search} setSearch={setSearch} filtered={filtered} addToCart={addToCart} openBook={openBook} />} />
          <Route path="/services" element={<ServicesPage go={go as any} />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/about" element={<AboutPage go={go as any} />} />
          <Route path="/publish" element={<PublishPage settings={settings} />} />
          <Route path="/contact" element={<ContactPage settings={settings} />} />
          <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} updateQty={updateQty} total={cartTotal} go={go as any} currentUser={currentUser} setCart={setCart} showToast={setToast} setLoginOpen={setLoginOpen} setDashboardOpen={setDashboardOpen} setDashboardTab={setDashboardTab} />} />
          <Route path="/book/:id" element={<BookPageWrapper books={books} addToCart={addToCart} go={go} />} />
          <Route path="/read/:id" element={<FreeReaderPage books={books} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-conditions" element={<TermsConditionsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/admin" element={
            <ErrorBoundary>
              <AdminPanel go={go as any} books={books} refreshBooks={refreshAll} refreshTestimonials={fetchTestimonials} frontStats={frontStats} testimonials={testimonials} />
            </ErrorBoundary>
          } />
        </Routes>
      </main>

      {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/read') && <Footer books={books} settings={settings} />}

      {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/read') && showCookieConsent && <CookieConsentPopup onConsent={handleCookieConsent} />}
      {dashboardOpen && currentUser && <UserDashboardModal tab={dashboardTab} currentUser={currentUser} setCurrentUser={setCurrentUser} onClose={() => setDashboardOpen(false)} showToast={setToast} />}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} showToast={setToast} go={go} setCurrentUser={setCurrentUser} />}
      {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/read') && newsletterPopupOpen && currentUser && (
        <NewsletterPopup 
          user={currentUser} 
          onClose={() => {
            setNewsletterPopupOpen(false);
            sessionStorage.setItem('evercraft_newsletter_closed', 'true');
          }} 
          showToast={setToast} 
        />
      )}
      <div className="toast-wrapper-top-center">
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
        .toast-wrapper-top-center > div {
          position: fixed !important;
          bottom: auto !important;
          top: 24px !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
          margin: 0 !important;
          z-index: 999999 !important;
        }
      `}</style>
    </div>
  );
}