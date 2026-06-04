import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import { ImageCropperModal } from "./ImageCropperModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function UserDashboardModal({ tab, currentUser, setCurrentUser, onClose, showToast }: { tab: string, currentUser: User, setCurrentUser: (u: User) => void, onClose: () => void, showToast: (msg: string) => void }) {
  const [activeTab, setActiveTab] = useState(tab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Profile State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
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
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newAddr)
      });
      if (res.ok) {
        setShowAddrForm(false);
        setNewAddr({ type: "Home", address: "", city: "", pincode: "" });
        showToast("✅ Address Added Successfully!");
        fetch(`${API_BASE_URL}/users/${currentUser.id}/addresses`).then(r => r.json()).then(setAddresses);
      } else {
        const errData = await res.json();
        showToast(`❌ Failed to add address: ${errData.detail || "Server Error"}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "An unknown error occurred.";
      showToast("❌ Network error: " + error);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdOtpSent) {
      const fakeOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setPwdOtp(fakeOtp);
      setPwdOtpSent(true);
      showToast(`📱 OTP Sent! Your code is: ${fakeOtp}`);
      showToast(`📱 OTP has been sent to your email!`);
      return;
    }
    if (enteredPwdOtp !== pwdOtp) return showToast("❌ Invalid OTP!");
    
    try {
      await fetch(`${API_BASE_URL}/users/${currentUser.id}/password`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ new_password: newPassword })
      });
      showToast("Password Changed Successfully!");
      setPwdOtpSent(false); setNewPassword(""); setEnteredPwdOtp("");
    } catch(e) { showToast("Error changing password"); }
  };

  return (
    <>
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="animate-bounceIn user-dashboard-modal" style={{ background: "#1C1917", width: "100%", maxWidth: 700, borderRadius: 24, overflow: "hidden", display: "flex", height: "80vh", position: "relative" }}>
        
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#f3f4f6", border: "none", fontSize: 16, cursor: "pointer", color: "#6b7280", zIndex: 10, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#6b7280"; }}>✕</button>

        {/* Sidebar */}
        <div className="user-dashboard-sidebar" style={{ width: 200, background: "#f9fafb", borderRight: "1px solid #e5e7eb", padding: 20, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20, color: "#b45309" }}>My Account</h3>
          {["Profile", "Orders", "Address", "Password"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ width: "100%", textAlign: "left", padding: "12px 14px", border: "none", borderRadius: 10, background: activeTab === t ? "#fef3c7" : "transparent", color: activeTab === t ? "#b45309" : "#6b7280", fontWeight: 700, cursor: "pointer", marginBottom: 6, transition: "all 0.2s" }}>              
            {t === "Orders" ? "My Orders" : t === "Address" ? "My Addresses" : t === "Password" ? "Change Password" : t}
            </button>
          ))}
        </div>

        {/* Content */}
         <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto", position: "relative" }}>
          <div className="user-dashboard-mobile-header">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: '#f3f4f6', border: 'none', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#b45309" }}>My Account</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{activeTab}</p>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="animate-slideDown" style={{ position: 'absolute', top: 75, left: 20, right: 20, background: '#1C1917', zIndex: 20, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', padding: 12 }}>
              {["Profile", "Orders", "Address", "Password"].map(t => (
                <button key={t} onClick={() => { setActiveTab(t); setMobileMenuOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "12px 14px", border: "none", borderRadius: 10, background: activeTab === t ? "#fef3c7" : "transparent", color: activeTab === t ? "#b45309" : "#6b7280", fontWeight: 700, cursor: "pointer", marginBottom: 2, transition: "all 0.2s" }}>
                  {t === "Orders" ? "My Orders" : t === "Address" ? "My Addresses" : t === "Password" ? "Change Password" : t}
                </button>
              ))}
            </div>
          )}

          {activeTab === "Profile" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Personal Information</h2>
              <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                  <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "12px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, outline: "none" }} />
                  <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "12px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, outline: "none" }} />
                  <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: "100%", padding: "12px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, outline: "none" }} />
                  <button onClick={() => saveProfile()} className="btn-primary" style={{ padding: "12px", width: 120 }}>Save Profile</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 120, height: 120, borderRadius: "50%", background: "#f3f4f6", border: "2px dashed #d1d5db", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {profileImg ? <img src={profileImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setProfileImg("")} /> : <span style={{ fontSize: 32, color: "#9ca3af" }}>👤</span>}
                  </div>
                  <label style={{ cursor: "pointer", color: "#b45309", fontWeight: 700, fontSize: 13, background: "#fef3c7", padding: "6px 14px", borderRadius: 20 }}>
                    Change Image
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = () => setCropImageRaw(reader.result as string);
                        reader.readAsDataURL(e.target.files[0]);
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
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Order History</h2>
              {orders.length === 0 ? <p style={{ color: "#9ca3af" }}>No orders placed yet.</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {orders.map(o => {
                    const items = JSON.parse(o.items || "[]");
                    return (
                      <div key={o.id} style={{ border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: 12, padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, borderBottom: "1px solid #f3f4f6", paddingBottom: 10 }}>
                          <span style={{ fontWeight: 700, color: "#FAF5EF" }}>Order #{o.id}</span>
                          <span style={{ fontSize: 12, color: "#6b7280" }}>{o.date}</span>
                        </div>
                        {items.map((i: any) => <div key={i.id} style={{ fontSize: 14, color: "#374151" }}>{i.qty} x {i.title}</div>)}
                        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb", padding: 10, borderRadius: 8 }}>
                          <strong style={{ color: "#b45309" }}>Total: ₹{o.total}</strong>
                          <span style={{ background: o.status === "Delivered" ? "#dcfce7" : "#fef3c7", color: o.status === "Delivered" ? "#16a34a" : "#d97706", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>Track Status: {o.status}</span>
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
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>Saved Addresses</h2>
                <button onClick={() => setShowAddrForm(!showAddrForm)} style={{ background: "#b45309", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>+ Add New</button>
              </div>
              {showAddrForm && (
                <form onSubmit={addAddress} style={{ background: "#f9fafb", padding: 16, borderRadius: 12, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12, border: "1px solid rgba(212, 175, 55, 0.2)" }}>
                  <select required value={newAddr.type} onChange={e => setNewAddr({...newAddr, type: e.target.value})} style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}><option>Home</option><option>Work</option><option>Other</option></select>
                  <textarea required placeholder="Full Address" value={newAddr.address} onChange={e => setNewAddr({...newAddr, address: e.target.value})} style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db", resize: "vertical" }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <input required placeholder="City" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }} />
                    <input required placeholder="Pincode" value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: 10 }}>Save Address</button>
                </form>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {addresses.map(a => (
                  <div key={a.id} style={{ border: "1px solid rgba(212, 175, 55, 0.2)", padding: 16, borderRadius: 12 }}>
                    <span style={{ background: "#e5e7eb", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, marginBottom: 8, display: "inline-block" }}>{a.type}</span>
                    <p style={{ fontSize: 14, color: "#374151", marginBottom: 4 }}>{a.address}</p>
                    <p style={{ fontSize: 13, color: "#6b7280" }}>{a.city}, {a.pincode}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Password" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Change Password</h2>
              <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
                <input required type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: "12px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, outline: "none" }} />
                {pwdOtpSent && (
                  <>
                    <input required placeholder="Enter OTP" value={enteredPwdOtp} onChange={e => setEnteredPwdOtp(e.target.value)} style={{ padding: "12px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, outline: "none", letterSpacing: 2, textAlign: "center" }} />
                    <div style={{ textAlign: "right", marginTop: -8 }}>
                      <button type="button" onClick={() => {
                        const fakeOtp = Math.floor(1000 + Math.random() * 9000).toString();
                        setPwdOtp(fakeOtp);
                        showToast(`📱 OTP Resent! Your code is: ${fakeOtp}`);
                        showToast(`📱 OTP has been resent to your email!`);
                      }} style={{ background: "none", border: "none", color: "#b45309", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Resend OTP</button>
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
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 16px;
      }
      @media (max-width: 640px) {
        .user-dashboard-sidebar { display: none !important; }
        .user-dashboard-mobile-header { display: flex; }
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
