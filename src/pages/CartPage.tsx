import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Page, CartItem, User } from "../types";
import { BookCoverSVG, Stars } from "../components/common/UIComponents";
import { WordReveal } from "../components/common/WordReveal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function CartPage({ cart, removeFromCart, updateQty, total, go, currentUser, setCart, showToast, setLoginOpen, setDashboardOpen, setDashboardTab }: {
  cart: CartItem[]; removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void; total: number; go: (p: Page) => void; currentUser: User | null; setCart: any; showToast: (msg: string) => void; setLoginOpen: any; setDashboardOpen: (v: boolean) => void; setDashboardTab: (v: "Profile" | "Orders" | "Address" | "Password") => void;
}) {
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<"placed" | "cancelled" | null>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [showAddressSelection, setShowAddressSelection] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ type: "Home", address: "", city: "", pincode: "" });
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [settings, setSettings] = useState({ gst_percent: '0', shipping_cost: '0' });

  useEffect(() => {
    if (showOrderSummary) {
      fetch(`${API_BASE_URL}/settings`).then(r => r.json()).then(setSettings).catch(() => showToast("Could not fetch store settings."));
    }
  }, [showOrderSummary]);

  if (orderStatus === "placed") return (
    <div style={{ minHeight: "100vh", background: "#FAF5EF", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }} className="animate-bounceIn">
        <div style={{ fontSize: 80, marginBottom: 24 }}>🎊</div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: "#730000", marginBottom: 12 }}>Order Placed Successfully!</h2>
        <p style={{ color: "#2D1B10", fontSize: 16, marginBottom: 8 }}>Thank you for your purchase! You'll receive an email confirmation shortly.</p>
        <p style={{ color: "#5C3A21", fontSize: 14, marginBottom: 32 }}>Your books will be delivered within 5–7 business days.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={() => go("shop")}>Continue Shopping 📚</button>
          <button onClick={() => { go("home"); setDashboardTab("Orders"); setDashboardOpen(true); }} style={{ background: "none", border: "2px solid #730000", color: "#730000", borderRadius: 12, padding: "12px 24px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Track Your Order 🚚</button>
        </div>
      </div>
    </div>
  );

  if (orderStatus === "cancelled") return (
    <div style={{ minHeight: "100vh", background: "#FAF5EF", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }} className="animate-bounceIn">
        <div style={{ fontSize: 80, marginBottom: 24 }}>❌</div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: "#730000", marginBottom: 12 }}>Order Payment Cancelled</h2>
        <p style={{ color: "#2D1B10", fontSize: 16, marginBottom: 8 }}>Your order has been recorded as Cancelled because the transaction was not completed.</p>
        <p style={{ color: "#5C3A21", fontSize: 14, marginBottom: 32 }}>You can review the items in the shop or try placing the order again.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={() => go("shop")}>Continue Shopping 📚</button>
          <button onClick={() => { setOrderStatus(null); setShowOrderSummary(false); setShowAddressSelection(false); }} style={{ background: "none", border: "2px solid #730000", color: "#730000", borderRadius: 12, padding: "12px 24px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Try Checkout Again 🔄</button>
        </div>
      </div>
    </div>
  );

  const handleApplyCoupon = async () => {
    if (!coupon) return showToast("⚠️ Please enter a coupon code.");
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/validate/${coupon}`);
      if (res.ok) {
        const couponData = await res.json();
        const newDiscount = total * (couponData.discount_percent / 100);
        setDiscount(newDiscount);
        showToast(`✅ Coupon Applied! You saved ₹${newDiscount.toFixed(2)}.`);
      } else {
        setDiscount(0);
        const err = await res.json();
        showToast(`❌ ${err.detail || "Invalid coupon code."}`);
      }
    } catch (err) {
      setDiscount(0);
      showToast("❌ Error validating coupon.");
    }
  };

  const validCart = cart.filter(item => item && typeof item === 'object' && item.id && typeof item.price === 'number' && typeof item.qty === 'number');
  const totalMRP = validCart.reduce((s, i) => s + (i.mrp || i.price) * i.qty, 0);
  const subtotal = total;
  const gstAmount = (subtotal - discount) * (parseFloat(settings.gst_percent || '0') / 100);
  const shippingCost = parseFloat(settings.shipping_cost || '0');
  const finalTotal = subtotal - discount + gstAmount + shippingCost;

  const fetchAddresses = async () => {
    if (!currentUser) return;
    try {
        const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}/addresses`);
        if (res.ok) {
            const data = await res.json();
            setAddresses(data);
            if (data.length > 0 && !selectedAddressId) {
                setSelectedAddressId(data[0].id);
            }
        }
    } catch (err) {
        showToast("❌ Could not fetch addresses.");
    }
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr)
      });
      if (res.ok) {
        setShowAddrForm(false);
        setNewAddr({ type: "Home", address: "", city: "", pincode: "" });
        showToast("✅ Address Added Successfully!");
        fetchAddresses();
      } else {
        showToast("❌ Failed to add address. Server error.");
      }
    } catch (err) {
      showToast("❌ Network error. Could not connect to server.");
    }
  };

  const handlePlaceOrder = async (status: "Order Placed" | "Cancelled") => {
    if (!selectedAddressId) {
        showToast("⚠️ Please select a shipping address.");
        return;
    }
    if (!currentUser) return;

    setLoading(true);
    try {
        const items_for_backend = validCart.map(c => ({ id: c.id, qty: c.qty, title: c.title, price: c.price }));
        const res = await fetch(`${API_BASE_URL}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: currentUser.id,
                items: items_for_backend,
                total: finalTotal,
                shipping_address_id: selectedAddressId,
                coupon_code: discount > 0 ? coupon.toUpperCase() : null,
                status: status,
            })
        });
        if (res.ok) {
            setOrderStatus(status === "Order Placed" ? "placed" : "cancelled");
            setCart([]);
        } else {
            let errorMsg = "Server Error";
            try {
                const err = await res.json();
                if (Array.isArray(err.detail)) {
                    errorMsg = err.detail.map((d: any) => `Issue with '${d.loc ? d.loc[d.loc.length - 1] : 'unknown'}': ${d.msg}`).join('; ');
                } else {
                    errorMsg = err.detail || `Status ${res.status}: ${res.statusText}`;
                }
            } catch (jsonError) {
                errorMsg = `Status ${res.status}: ${res.statusText}`;
            }
            showToast("❌ Order Failed: " + errorMsg);
        }
    } catch (e) {
        const error = e instanceof Error ? e.message : "An unknown error occurred.";
        showToast("Error placing order: " + error);
    }
    setLoading(false);
  };

  if (showOrderSummary) {
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    const bookDiscount = totalMRP - total;
    return (
      <div style={{ minHeight: "100vh", background: "#FAF5EF", padding: "48px 24px" }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }} className="animate-bounceIn">
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, color: "#730000" }}>Order Summary</h2>

          {/* Address and Contact */}
          <div style={{ border: "1.5px solid rgba(115, 0, 0, 0.15)", padding: 20, borderRadius: 12, background: "#ffffff", marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#730000', marginBottom: 8 }}>Shipping To:</h3>
                {selectedAddress && (
                  <>
                    <p style={{ fontSize: 14, color: "#2D1B10", marginBottom: 4 }}>{selectedAddress.address}</p>
                    <p style={{ fontSize: 13, color: "#5C3A21" }}>{selectedAddress.city}, {selectedAddress.pincode}</p>
                  </>
                )}
                <p style={{ fontSize: 14, color: "#2D1B10", marginTop: 8 }}><b>Contact:</b> {currentUser?.phone}</p>
              </div>
              <button onClick={() => { setShowOrderSummary(false); setShowAddressSelection(true); }} style={{ background: 'none', border: '1px solid #730000', color: '#730000', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Change</button>
            </div>
          </div>

          {/* Product List */}
          <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {validCart.map(item => (
              <div key={item.id} style={{ background: "#ffffff", borderRadius: 12, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.03)", border: "1.5px solid rgba(115, 0, 0, 0.15)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <BookCoverSVG src={item.frontCover} width={80} height={112} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 800, color: "#730000", fontSize: 16, lineHeight: 1.3 }}>{item.title}</h3>
                  {item.titleHindi && item.titleHindi !== item.title && <p style={{ fontSize: 13, color: "#aa7c11", marginBottom: 6 }}>{item.titleHindi}</p>}
                  <p style={{ fontSize: 13, color: "#5c3a21", marginBottom: 4 }}>by <strong style={{color: '#2D1B10'}}>{item.author}</strong> {item.authorHindi && item.authorHindi !== item.author && `(${item.authorHindi})`}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#aa7c11', marginBottom: 12 }}>
                    <Stars rating={item.rating} size={14} />
                    <span>({item.reviews} reviews)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#730000" }}>₹{item.price}</span>
                    {item.mrp && item.mrp > item.price && <span style={{ fontSize: 14, color: "#9ca3af", textDecoration: "line-through" }}>₹{item.mrp}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 'auto', flexShrink: 0 }}>
                  <p style={{ fontSize: 13, color: '#5c3a21' }}>Qty: {item.qty}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code */}
          <div style={{ background: "#ffffff", border: "1.5px solid rgba(115, 0, 0, 0.15)", padding: 20, borderRadius: 12, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#730000', marginBottom: 12 }}>Apply Coupon</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter Coupon Code" style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, outline: 'none', background: '#ffffff', color: '#2D1B10' }} />
              <button onClick={handleApplyCoupon} style={{ background: '#730000', color: '#ffffff', border: '2px solid #730000', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Apply</button>
            </div>
          </div>

          {/* Payment Details */}
          <div style={{ background: "#ffffff", border: "1.5px solid rgba(115, 0, 0, 0.15)", padding: 20, borderRadius: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#730000', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>Payment Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#2D1B10' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total MRP</span><span>₹{totalMRP.toFixed(2)}</span></div>
              {bookDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}><span>Book Discount</span><span>- ₹{bookDiscount.toFixed(2)}</span></div>}
              {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}><span>Coupon Discount</span><span>- ₹{discount.toFixed(2)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GST ({settings.gst_percent}%)</span><span>+ ₹{gstAmount.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><span>{shippingCost > 0 ? `+ ₹${shippingCost.toFixed(2)}` : <span style={{ color: '#16a34a', fontWeight: 600 }}>FREE</span>}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#730000', paddingTop: 10, marginTop: 4, borderTop: '1px solid #f3f4f6' }}>
                <span>To Pay</span>
                <span style={{ color: '#730000' }}>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: 20, padding: "15px 20px", fontSize: 15, opacity: loading ? 0.7 : 1 }}
              onClick={() => {
                if (!selectedAddressId) {
                  showToast("⚠️ Please select a shipping address.");
                  return;
                }
                setShowPaymentGateway(true);
              }}
              disabled={loading}>
              {loading ? "Processing... ⏳" : `Confirm & Pay ₹${finalTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showAddressSelection) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF5EF", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#ffffff", borderRadius: 18, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1.5px solid rgba(115, 0, 0, 0.15)", width: '100%', maxWidth: 600 }} className="animate-bounceIn">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#730000" }}>Select Shipping Address</h2>
            <button onClick={() => setShowAddressSelection(false)} style={{ background: "none", border: "none", fontSize: 14, cursor: "pointer", color: "#5C3A21", fontWeight: 600 }}>← Back to Cart</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, maxHeight: '30vh', overflowY: 'auto', paddingRight: 8 }}>
            {addresses.map(a => (
              <div key={a.id} onClick={() => setSelectedAddressId(a.id)} style={{ border: "2px solid", borderColor: selectedAddressId === a.id ? "#730000" : "#e5e7eb", padding: 16, borderRadius: 12, cursor: 'pointer', background: selectedAddressId === a.id ? '#FAF5EF' : '#f9fafb', transition: 'all 0.2s' }}>
                <span style={{ background: selectedAddressId === a.id ? "#730000" : "#e5e7eb", color: selectedAddressId === a.id ? "#ffffff" : "#2d1b10", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, marginBottom: 8, display: "inline-block" }}>{a.type}</span>
                <p style={{ fontSize: 14, color: "#2d1b10", marginBottom: 4 }}>{a.address}</p>
                <p style={{ fontSize: 13, color: "#5C3A21" }}>{a.city}, {a.pincode}</p>
              </div>
            ))}
            {addresses.length === 0 && !showAddrForm && <p style={{ color: "#6b7280", textAlign: 'center', padding: '20px 0' }}>No saved addresses. Please add one.</p>}
          </div>
          <div style={{ marginTop: 12, padding: 16, background: '#FAF5EF', borderRadius: 12, border: '1.5px solid rgba(115, 0, 0, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 13, color: '#5C3A21', marginBottom: 2 }}>Contact Number</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#730000' }}>{currentUser?.phone}</p>
            </div>
            <button onClick={() => { setDashboardTab("Profile"); setDashboardOpen(true); }} style={{ background: 'none', border: '1px solid #730000', color: '#730000', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Change</button>
          </div>
          {showAddrForm ? (
            <form onSubmit={addAddress} style={{ background: "#ffffff", padding: 16, borderRadius: 12, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12, border: "1.5px solid rgba(115, 0, 0, 0.15)" }}>
              <h3 style={{fontSize: 16, fontWeight: 700, color: '#730000'}}>Add a New Address</h3>
              <select required value={newAddr.type} onChange={e => setNewAddr({...newAddr, type: e.target.value})} style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db", background: '#ffffff', color: '#2D1B10' }}><option>Home</option><option>Work</option><option>Other</option></select>
              <textarea required placeholder="Full Address" value={newAddr.address} onChange={e => setNewAddr({...newAddr, address: e.target.value})} style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db", resize: "vertical", background: '#ffffff', color: '#2D1B10' }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input required placeholder="City" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #d1d5db", background: '#ffffff', color: '#2D1B10' }} />
                <input required placeholder="Pincode" value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #d1d5db", background: '#ffffff', color: '#2D1B10' }} />
              </div>
              <div style={{display: 'flex', gap: 10, marginTop: 4}}>
                <button type="submit" className="btn-primary" style={{ padding: 10, flex: 1 }}>Save Address</button>
                <button type="button" onClick={() => setShowAddrForm(false)} style={{ padding: 10, background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#2d1b10' }}>Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowAddrForm(true)} style={{ width: "100%", background: "none", border: "2px dashed #730000", color: "#730000", padding: "12px", borderRadius: 12, cursor: "pointer", fontWeight: 600, marginBottom: 24, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#730000'} onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}>
              + Add New Address
            </button>
          )}
          <button className="btn-primary" style={{ width: "100%", marginTop: 0, padding: "15px 20px", fontSize: 15, opacity: loading || !selectedAddressId ? 0.7 : 1 }}
            onClick={() => {
              if (!selectedAddressId) {
                showToast("⚠️ Please select a shipping address.");
                return;
              }
              setShowAddressSelection(false);
              setShowOrderSummary(true);
            }}
            disabled={loading || !selectedAddressId}>
            Continue to Summary →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAF5EF" }}>
      <div style={{ background: "#ffffff", padding: "80px 24px", textAlign: "center", color: "#730000", borderBottom: "1.5px solid rgba(115, 0, 0, 0.15)" }}>
        <h1 style={{ fontSize: "clamp(38px,5.5vw,56px)", fontWeight: 800, marginBottom: 16, color: "#730000", fontFamily: "'Playfair Display', Georgia, serif" }}>
          <WordReveal text="Your *Cart* 🛒" once={true} />
        </h1>
        {cart.length > 0 && <p style={{ color: "#5C3A21", opacity: 0.9, fontSize: 15, marginTop: 8 }}>{cart.length} item{cart.length !== 1 ? "s" : ""} in your cart</p>}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🛒</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#730000", marginBottom: 10 }}>Your Cart is Empty</h2>
            <p style={{ color: "#6b7280", marginBottom: 32 }}>Looks like you haven't added any books yet!</p>
            <button className="btn-primary" style={{ fontSize: 16, padding: "14px 32px" }} onClick={() => go("shop")}>Browse Books 📚</button>
          </div>
        ) : (
          <>
            {/* Items */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 120, minHeight: '30vh' }}
            >
              {validCart.map(item => (
                <div key={item.id} style={{ background: "#ffffff", borderRadius: 18, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.04)", border: "1.5px solid rgba(115, 0, 0, 0.15)", display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ flexShrink: 0 }}>
                    <BookCoverSVG src={item.frontCover} width={80} height={112} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 800, color: "#730000", fontSize: 16, lineHeight: 1.3, marginBottom: 4 }}>{item.title}</h3>
                    {item.titleHindi && item.titleHindi !== item.title && <p style={{ fontSize: 13, color: "#aa7c11", marginBottom: 4 }}>{item.titleHindi}</p>}
                    <p style={{ fontSize: 12, color: "#5c3a21", marginBottom: 12 }}>by {item.author}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 8, overflow: "hidden", background: "#ffffff" }}>
                        <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: "none", border: "none", padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#730000" }}>−</button>
                        <span style={{ padding: "6px 14px", fontWeight: 700, fontSize: 14, borderLeft: "1.5px solid rgba(115, 0, 0, 0.15)", borderRight: "1.5px solid rgba(115, 0, 0, 0.15)", color: "#2d1b10" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1, item.stock)} style={{ background: "none", border: "none", padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#730000" }}>+</button>
                      </div>
                      <strong style={{ color: "#730000", fontSize: 18 }}>₹{item.price * item.qty}</strong>
                      <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 600 }}>🗑️ Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Bottom Summary Bar */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ffffff', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', borderTop: '1.5px solid rgba(115, 0, 0, 0.15)', padding: '16px 24px', zIndex: 100 }}>
              <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 14, color: '#5c3a21' }}>Total MRP: <span style={{ textDecoration: 'line-through' }}>₹{totalMRP.toFixed(2)}</span></p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#2d1b10' }}>Total Price: <span style={{ color: '#730000' }}>₹{total.toFixed(2)}</span></p>
                </div>
                <button className="btn-primary" style={{ padding: "15px 30px", fontSize: 16 }}
                  onClick={() => {
                    if (!currentUser) {
                      showToast("⚠️ Please Login to place an order!");
                      setLoginOpen(true);
                      return;
                    }
                    if (validCart.length > 0) fetchAddresses();
                    setShowAddressSelection(true);
                  }}
                  disabled={loading || cart.length === 0}
                >
                  Place Order →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {showPaymentGateway && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="animate-bounceIn" style={{ background: "#FAF5EF", width: "100%", maxWidth: 500, borderRadius: 24, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.3)", border: "1.5px solid rgba(115, 0, 0, 0.15)", color: "#730000" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#730000", fontFamily: "'Playfair Display', Georgia, serif" }}>EverCraft Publications</div>
              <div style={{ fontSize: 12, color: "#aa7c11", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>Secured Payment Gateway</div>
            </div>
            
            <div style={{ background: "#ffffff", border: "1.5px solid rgba(115, 0, 0, 0.15)", padding: 18, borderRadius: 12, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#5C3A21", marginBottom: 6 }}>
                <span>Transaction Amount:</span>
                <strong style={{ fontSize: 18, color: "#730000" }}>₹{finalTotal.toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#5C3A21" }}>
                <span>Customer Email:</span>
                <span>{currentUser?.email}</span>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#730000", marginBottom: 8 }}>Select Payment Mode</label>
              <select style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1.5px solid rgba(115, 0, 0, 0.2)", background: "#ffffff", color: "#2D1B10", fontSize: 14, fontWeight: 600 }}>
                <option>💳 Credit / Debit Card</option>
                <option>📱 UPI (GPay, PhonePe, Paytm)</option>
                <option>🏦 Net Banking</option>
              </select>
            </div>

            <div style={{ background: "#ffffff", border: "1.5px solid rgba(115, 0, 0, 0.1)", padding: 16, borderRadius: 12, marginBottom: 24, fontSize: 13, color: "#5C3A21", lineHeight: 1.6 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, color: "#aa7c11", fontWeight: 700 }}>
                <span>🛡️</span> <span>Secure Sandbox Simulator</span>
              </div>
              <span>This is a secure mock sandbox payment gateway simulating checkout success or cancel/exit behaviors. No real money will be charged.</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button 
                onClick={async () => {
                  setShowPaymentGateway(false);
                  await handlePlaceOrder("Order Placed");
                }}
                disabled={loading}
                className="btn-primary" 
                style={{ width: "100%", padding: "14px", fontSize: 15 }}
              >
                {loading ? "Simulating Success... ⏳" : "Simulate Successful Payment (Pay Now) ✅"}
              </button>
              <button 
                onClick={async () => {
                  setShowPaymentGateway(false);
                  await handlePlaceOrder("Cancelled");
                }}
                disabled={loading}
                style={{ width: "100%", padding: "14px", background: "none", border: "2px solid #730000", color: "#730000", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
              >
                {loading ? "Simulating Exit... ⏳" : "Cancel / Exit Payment Gateway ❌"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`.cart-grid { @media(max-width:768px){grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}