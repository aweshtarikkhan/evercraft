import React, { useState, useCallback } from "react";
import { Page, User } from "../../types";
import { supabase } from "../../utils/supabase";
import { uploadImageToCloudinary, compressImage } from "../../utils/cloudinary";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function LoginModal({ onClose, showToast, go, setCurrentUser }: { onClose: () => void, showToast: (msg: string) => void, go: (p: Page) => void, setCurrentUser: (u: User) => void }) {
  const [tab, setTab] = useState<"user" | "signup" | "forgot">("user");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileImgRaw, setProfileImgRaw] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "signup" && !otpSent) {
      // 1. Check duplicate email/phone before sending OTP
      try {
        const checkRes = await fetch(`${API_BASE_URL}/users/check-duplicate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, phone })
        });
        if (!checkRes.ok) {
          const err = await checkRes.json();
          showToast(`⚠️ ${err.detail || "Account already exists. Please login instead."}`);
          return;
        }
      } catch (err) {
        showToast("❌ Network error while verifying account.");
        return;
      }

      // 2. Send signup OTP via Supabase signUp
      if (!supabase) {
        showToast("⚠️ Supabase is not configured. Please check your credentials.");
        return;
      }

      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone
            }
          }
        });
        if (error) {
          showToast(`❌ Supabase Signup Error: ${error.message}`);
        } else {
          setOtpSent(true);
          showToast("📱 Verification code sent to your email via Supabase!");
        }
      } catch (err) {
        showToast("❌ Failed to connect to Supabase!");
      }
    } else if (tab === "signup" && otpSent) {
      // 3. Verify OTP via Supabase (type: 'signup')
      if (!supabase) {
        showToast("⚠️ Supabase is not configured.");
        return;
      }

      const cleanToken = enteredOtp.replace(/\s+/g, "");
      try {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: cleanToken,
          type: "signup"
        });
        
        if (error) {
          showToast(`❌ Invalid OTP: ${error.message}`);
          return;
        }
      } catch (err) {
        showToast("❌ Error verifying verification code.");
        return;
      }

      // 4. Create User in Local Database
      try {
        let finalProfileImg = "";
        if (profileImgRaw) {
          showToast("⏳ Uploading profile picture...");
          try {
            finalProfileImg = await uploadImageToCloudinary(profileImgRaw);
          } catch(e) {
            showToast("⚠️ Image upload failed, continuing without it.");
          }
        }

        const signupReq = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password, profile_image: finalProfileImg, status: "Logged In" })
        });
        
        if (!signupReq.ok) {
          showToast("❌ Server Error: Unable to create account.");
          return;
        }

        // Auto login after signup
        const res = await fetch(`${API_BASE_URL}/users/login`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        if(res.ok) {
           const data = await res.json();
           // Backend returns user data directly, not wrapped in {user: ...}
           const userData = data.user || data;
           if (userData && userData.id) {
             setCurrentUser(userData);
             localStorage.setItem("evercraft_user", JSON.stringify(userData));
           }
           if (data.token) localStorage.setItem("token", data.token);
           showToast("Account created successfully!");
           onClose();
        } else {
           showToast("❌ Signup successful, but auto-login failed.");
        }
      } catch(e) { showToast("Failed to connect to server!"); }
    } else if (tab === "forgot" && !otpSent) {
      // 1. Verify email exists in local database
      try {
        const checkEmailRes = await fetch(`${API_BASE_URL}/users/check-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        if (!checkEmailRes.ok) {
          showToast("⚠️ User with this email does not exist.");
          return;
        }
      } catch (err) {
        showToast("❌ Network error while verifying email.");
        return;
      }

      // 2. Send password reset OTP via Supabase
      if (!supabase) {
        showToast("⚠️ Supabase is not configured.");
        return;
      }

      try {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
          showToast(`❌ Supabase OTP Error: ${error.message}`);
        } else {
          setOtpSent(true);
          showToast("📱 Reset code sent to your email via Supabase!");
        }
      } catch (err) {
        showToast("❌ Failed to connect to Supabase!");
      }
    } else if (tab === "forgot" && otpSent) {
      // 3. Verify OTP via Supabase (type: 'email' for signInWithOtp)
      if (!supabase) {
        showToast("⚠️ Supabase is not configured.");
        return;
      }

      const cleanToken = enteredOtp.replace(/\s+/g, "");
      try {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: cleanToken,
          type: "email"
        });
        if (error) {
          showToast(`❌ Invalid or expired reset code: ${error.message}`);
          return;
        }
      } catch (err) {
        showToast("❌ Error verifying reset code.");
        return;
      }

      // 4. Reset password in local database
      try {
        const resetRes = await fetch(`${API_BASE_URL}/users/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, new_password: password })
        });
        if (resetRes.ok) {
          showToast("🎉 Password updated successfully! Please login with your new password.");
          setTab("user");
          setOtpSent(false);
          setPassword("");
          setEnteredOtp("");
        } else {
          showToast("❌ Failed to update password.");
        }
      } catch (err) {
        showToast("❌ Failed to connect to server!");
      }
    } else if (tab === "user") {
      try {
        const res = await fetch(`${API_BASE_URL}/users/login`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        if(res.ok) {
           const data = await res.json();
           const userData = data.user || data;
           if (userData && (userData.id || userData.email)) {
             setCurrentUser(userData);
             localStorage.setItem("evercraft_user", JSON.stringify(userData));
           } else {
             // Fallback if structure is unexpected
             setCurrentUser(userData);
             localStorage.setItem("evercraft_user", JSON.stringify(userData));
           }
           if (data.token) localStorage.setItem("token", data.token);
           showToast("Logged in successfully!");
           onClose();
        } else showToast("Invalid email or password!");
      } catch(e) { showToast("Failed to connect to server!"); }
    }
  }, [tab, otpSent, enteredOtp, name, email, phone, password, setCurrentUser, showToast, onClose]);

  const title = tab === "user" ? "User Login" : tab === "signup" ? "User Signup" : otpSent ? "Reset Password" : "Forgot Password";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="animate-bounceIn" style={{ background: "#1C1917", width: "100%", maxWidth: 420, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", border: "1.5px solid rgba(212, 175, 55, 0.25)" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 16px 0" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: "0 32px 32px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#FAF5EF", marginBottom: 24, textAlign: "center" }}>{title}</h2>

          {/* Tabs */}
          {tab !== "forgot" && (
            <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.08)", padding: 6, borderRadius: 12, marginBottom: 24 }}>
              <button type="button" onClick={() => { setTab("user"); setOtpSent(false); }} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s", background: tab === "user" ? "#b45309" : "transparent", color: tab === "user" ? "#ffffff" : "#a8a29e", boxShadow: tab === "user" ? "0 2px 8px rgba(0,0,0,0.15)" : "none" }}>User Login</button>
              <button type="button" onClick={() => { setTab("signup"); setOtpSent(false); }} style={{ flex: 1.2, padding: "10px 0", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s", background: tab === "signup" ? "#b45309" : "transparent", color: tab === "signup" ? "#ffffff" : "#a8a29e", boxShadow: tab === "signup" ? "0 2px 8px rgba(0,0,0,0.15)" : "none" }}>Switch to Signup</button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {tab === "signup" && !otpSent && (
              <>
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#1C1109", border: "2px dashed #D4AF37", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {profileImgRaw ? <img src={profileImgRaw} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24, color: "#D4AF37" }}>👤</span>}
                  </div>
                  <label style={{ cursor: "pointer", color: "#D4AF37", fontWeight: 700, fontSize: 13, background: "#1C1109", border: "1px solid rgba(212, 175, 55, 0.3)", padding: "8px 16px", borderRadius: 20 }}>
                    Upload Photo (Optional)
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          const compressed = await compressImage(e.target.files[0], 1);
                          setProfileImgRaw(compressed);
                        } catch (err: any) {
                          showToast(`⚠️ ${err.message || "Failed to process image"}`);
                        }
                      }
                      e.target.value = "";
                    }} />
                  </label>
                </div>
                <input required type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "14px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#1c1917" }} />
                <input required type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "14px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#1c1917" }} />
                <input required type="tel" placeholder="Mobile No." value={phone} onChange={e => setPhone(e.target.value)} style={{ width: "100%", padding: "14px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#1c1917" }} />
                
                <div style={{ position: "relative", width: "100%" }}>
                  <input required type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "14px 44px 14px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#1c1917" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 16, display: "flex", alignItems: "center", color: "#b45309" }}>
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </>
            )}

            {tab === "signup" && otpSent && (
              <>
                <p style={{ fontSize: 14, color: "#a8a29e", textAlign: "center", marginBottom: 8 }}>Please enter the OTP verification code sent to your email <strong>{email}</strong>.</p>
                <input required type="text" placeholder="Enter OTP" value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)} style={{ width: "100%", padding: "14px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#1c1917", textAlign: "center", letterSpacing: 6, fontWeight: 700 }} />
                <div style={{ textAlign: "right", marginTop: -8 }}>
                  <button type="button" onClick={async () => {
                    if (!supabase) return;
                    try {
                      const { error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                          data: {
                            name,
                            phone
                          }
                        }
                      });
                      if (error) {
                        showToast(`❌ Error: ${error.message}`);
                      } else {
                        showToast("📱 Verification code resent to your email!");
                      }
                    } catch (err) {
                      showToast("❌ Failed to connect to Supabase!");
                    }
                  }} style={{ background: "none", border: "none", color: "#D4AF37", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Resend Verification Code</button>
                </div>
              </>
            )}

            {tab === "user" && (
              <>
                <input required type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "14px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#1c1917" }} />
                
                <div style={{ position: "relative", width: "100%" }}>
                  <input required type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "14px 44px 14px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#1c1917" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 16, display: "flex", alignItems: "center", color: "#b45309" }}>
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>

                <div style={{ textAlign: "right", marginTop: -8 }}>
                  <button type="button" onClick={() => { setTab("forgot"); setOtpSent(false); setPassword(""); }} style={{ background: "none", border: "none", color: "#D4AF37", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Forgot Password?</button>
                </div>
              </>
            )}

            {tab === "forgot" && !otpSent && (
              <>
                <p style={{ fontSize: 14, color: "#a8a29e", textAlign: "center", marginBottom: 8 }}>Enter your registered email address to receive a verification code for password reset.</p>
                <input required type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "14px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#1c1917" }} />
                <div style={{ textAlign: "left", marginTop: -8 }}>
                  <button type="button" onClick={() => { setTab("user"); setOtpSent(false); }} style={{ background: "none", border: "none", color: "#FAF5EF", opacity: 0.6, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← Back to Login</button>
                </div>
              </>
            )}

            {tab === "forgot" && otpSent && (
              <>
                <p style={{ fontSize: 14, color: "#a8a29e", textAlign: "center", marginBottom: 8 }}>Enter the verification code sent to <strong>{email}</strong> and set your new password.</p>
                
                <input required type="text" placeholder="Enter OTP" value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)} style={{ width: "100%", padding: "14px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#1c1917", textAlign: "center", letterSpacing: 6, fontWeight: 700 }} />
                
                <div style={{ position: "relative", width: "100%" }}>
                  <input required type={showPassword ? "text" : "password"} placeholder="Enter New Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "14px 44px 14px 16px", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#1c1917" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 16, display: "flex", alignItems: "center", color: "#b45309" }}>
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -8 }}>
                  <button type="button" onClick={() => { setTab("user"); setOtpSent(false); }} style={{ background: "none", border: "none", color: "#FAF5EF", opacity: 0.6, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← Cancel</button>
                  <button type="button" onClick={async () => {
                    if (!supabase) return;
                    try {
                      const { error } = await supabase.auth.signInWithOtp({ email });
                      if (error) {
                        showToast(`❌ Error: ${error.message}`);
                      } else {
                        showToast("📱 Reset code resent to your email!");
                      }
                    } catch (err) {
                      showToast("❌ Failed to connect to Supabase!");
                    }
                  }} style={{ background: "none", border: "none", color: "#D4AF37", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Resend Reset Code</button>
                </div>
              </>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: 8, padding: "16px", fontSize: 15, width: "100%" }}>
              {tab === "user" ? "Login" : tab === "signup" ? (!otpSent ? "Send Verification Code" : "Verify & Create Account") : (!otpSent ? "Send Reset Code" : "Reset Password")}
            </button>
          </form>

          {/* Social Logins */}
          {(tab === "user" || tab === "signup") && (
            <>
              <div style={{ display: "flex", alignItems: "center", margin: "20px 0", gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.15)" }}></div>
                <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: 1 }}>or login with</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.15)" }}></div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  type="button"
                  onClick={async () => {
                    if (!supabase) {
                      showToast("⚠️ Google Login not configured. Setup Supabase keys in .env");
                      return;
                    }
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: { redirectTo: window.location.origin }
                    });
                    if (error) showToast(`❌ Google Login Error: ${error.message}`);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    width: "100%",
                    padding: "12px",
                    background: "#FAF5EF",
                    color: "#2D1B10",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#E6D5C3"}
                  onMouseLeave={e => e.currentTarget.style.background = "#FAF5EF"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>


              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default LoginModal;
