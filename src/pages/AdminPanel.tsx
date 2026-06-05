import React, { useState, useEffect } from "react";
import { Page, Book } from "../types";
import { BookCoverSVG } from "../components/common/UIComponents";
import { uploadImageToCloudinary } from "../utils/cloudinary";
import { DeveloperSettingsTab } from "../components/admin/DeveloperSettingsTab";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Reusable styling for form inputs in light modal context
const adminInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid rgba(115, 0, 0, 0.2)",
  borderRadius: 8,
  background: "#ffffff",
  color: "#1c1917",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none"
};

const adminSelectStyle: React.CSSProperties = {
  ...adminInputStyle,
  background: "#ffffff",
  height: "42px"
};

const adminTextareaStyle: React.CSSProperties = {
  ...adminInputStyle,
  resize: "vertical"
};

// Reusable styling for card widgets/containers in light theme
const adminCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1.5px solid rgba(115, 0, 0, 0.15)",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  color: "#1c1917"
};

export function AdminPanel({
  go,
  books,
  refreshBooks,
  refreshTestimonials,
  frontStats,
  testimonials
}: {
  go: (p: Page) => void;
  books: Book[];
  refreshBooks: () => any;
  refreshTestimonials?: () => any;
  frontStats: any;
  testimonials: any[];
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (sessionStorage.getItem("evercraft_admin_auth") === "true") return true;
    const localUserStr = localStorage.getItem("evercraft_user");
    if (localUserStr) {
      try {
        const u = JSON.parse(localUserStr);
        if (u && u.role && u.role !== "Customer") {
          return true;
        }
      } catch (e) {}
    }
    return false;
  });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState(() => {
    const sessEmail = sessionStorage.getItem("evercraft_admin_email");
    if (sessEmail) return sessEmail;
    const localUserStr = localStorage.getItem("evercraft_user");
    if (localUserStr) {
      try {
        const u = JSON.parse(localUserStr);
        if (u && u.role && u.role !== "Customer") {
          return u.email;
        }
      } catch (e) {}
    }
    return "admin@evercraft.com";
  });

  const [adminRole, setAdminRole] = useState(() => {
    const sessRole = sessionStorage.getItem("evercraft_admin_role");
    if (sessRole) return sessRole;
    const localUserStr = localStorage.getItem("evercraft_user");
    if (localUserStr) {
      try {
        const u = JSON.parse(localUserStr);
        if (u && u.role && u.role !== "Customer") {
          return u.role;
        }
      } catch (e) {}
    }
    return "Admin";
  });

  const [showUserAddressesModal, setShowUserAddressesModal] = useState(false);
  const [selectedUserIdForAddresses, setSelectedUserIdForAddresses] = useState<number | null>(null);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);

  const [adminTab, setAdminTab] = useState<
    "dashboard" | "books" | "users" | "orders" | "newsletter" | "messages" | "testimonials" | "team" | "developer"
  >(() => {
    return (sessionStorage.getItem("evercraft_adminTab") as any) || "dashboard";
  });

  const changeAdminTab = (
    tab: "dashboard" | "books" | "users" | "orders" | "newsletter" | "messages" | "testimonials" | "team" | "developer"
  ) => {
    setAdminTab(tab);
    sessionStorage.setItem("evercraft_adminTab", tab);
  };

  // Testimonials state
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);
  const [newTestimonial, setNewTestimonial] = useState({ name: "", role: "", text: "", rating: 5 });

  // Team state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);
  const [teamForm, setTeamForm] = useState({ name: "", role: "", description: "", category: "Editorial Team", image: "" });

  // Books state
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    title: "",
    titleHindi: "",
    author: "",
    authorHindi: "",
    mrp: "",
    price: "",
    isbn: "",
    genre: "",
    language: "English",
    pages: "",
    badge: "",
    rating: "5",
    reviews: "0",
    availability: "In Stock",
    stock: "0",
    publisher: "EverCraft Publications",
    amazonLink: "",
    flipkartLink: "",
    ondcLink: "",
    description: "",
    descriptionHindi: "",
    frontCoverUrl: "",
    backCoverUrl: "",
    is_upcoming: false,
    release_date: "Coming Soon"
  });

  // Derived discount for book modal preview
  const discount = (Number(bookForm.mrp) && Number(bookForm.price))
    ? Math.round(((Number(bookForm.mrp) - Number(bookForm.price)) / Number(bookForm.mrp) * 100))
    : 0;

  // Search/Filters states
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderDateRange, setOrderDateRange] = useState<"all" | "today" | "week" | "month" | "year">("all");

  const [stats, setStats] = useState({
    total_books: 0,
    total_users: 0,
    active_sessions: 0,
    total_orders: 0,
    total_subscribers: 0,
    total_publish_requests: 0,
    total_contact_messages: 0
  });

  const [users, setUsers] = useState<
    { id: number; n: string; e: string; p: string; s: string; img: string; role?: string }[]
  >([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_percent: "" });
  const [serviceInquiries, setServiceInquiries] = useState<any[]>([]);
  const [serviceFeedbacks, setServiceFeedbacks] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    gst_percent: "0",
    shipping_cost: "0",
    contact_email: "",
    contact_phone: "",
    contact_hours: "",
    contact_address: "",
    social_facebook: "",
    social_instagram: "",
    social_linkedin: "",
    social_x: ""
  });
  const [subscribers, setSubscribers] = useState<{ e: string; d: string }[]>([]);
  const [publishReqs, setPublishReqs] = useState<any[]>([]);
  const [contactMsgs, setContactMsgs] = useState<any[]>([]);
  const [cookieConsents, setCookieConsents] = useState<any[]>([]);

  const [fsReaders, setFsReaders] = useState(frontStats?.happy_readers || "500+");
  const [fsCities, setFsCities] = useState(frontStats?.cities_reached || "10+");
  const [fsPlatforms, setFsPlatforms] = useState(frontStats?.sales_platforms || "2");

  useEffect(() => {
    setFsReaders(frontStats?.happy_readers || "500+");
    setFsCities(frontStats?.cities_reached || "10+");
    setFsPlatforms(frontStats?.sales_platforms || "2");
  }, [frontStats]);

  // Fetch addresses when selectedUserIdForAddresses changes and modal is open
  useEffect(() => {
    if (showUserAddressesModal && selectedUserIdForAddresses !== null) {
      fetch(`${API_BASE_URL}/users/${selectedUserIdForAddresses}/addresses`)
        .then(r => r.json())
        .then(setUserAddresses)
        .catch(err => {
          console.error("Error fetching user addresses:", err);
          setUserAddresses([]);
        });
    } else {
      setUserAddresses([]);
    }
  }, [showUserAddressesModal, selectedUserIdForAddresses]);

  // Fetch Tab Specific Data
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE_URL}/stats`).then(r => r.json()).then(setStats).catch(() => {});
    if (adminTab === "users") fetch(`${API_BASE_URL}/users`).then(r => r.json()).then(setUsers).catch(() => {});
    if (adminTab === "orders") {
      fetch(`${API_BASE_URL}/orders`).then(r => r.json()).then(setOrders).catch(() => {});
      fetch(`${API_BASE_URL}/coupons`).then(r => r.json()).then(setCoupons).catch(() => {});
    }
    if (adminTab === "books" || adminTab === "dashboard") {
      fetch(`${API_BASE_URL}/settings`).then(r => r.json()).then(setSettings).catch(() => {});
    }
    if (adminTab === "newsletter") {
      fetch(`${API_BASE_URL}/subscribers`).then(r => r.json()).then(setSubscribers).catch(() => {});
      fetch(`${API_BASE_URL}/cookie-consents`).then(r => r.json()).then(setCookieConsents).catch(() => {});
    }
    if (adminTab === "messages") {
      fetch(`${API_BASE_URL}/publish-requests`).then(r => r.json()).then(setPublishReqs).catch(() => {});
      fetch(`${API_BASE_URL}/contact-messages`).then(r => r.json()).then(setContactMsgs).catch(() => {});
      fetch(`${API_BASE_URL}/service-inquiries`).then(r => r.json()).then(setServiceInquiries).catch(() => {});
      fetch(`${API_BASE_URL}/service-feedbacks`).then(r => r.json()).then(setServiceFeedbacks).catch(() => {});
    }
    if (adminTab === "testimonials") {
      refreshBooks();
    }
    if (adminTab === "team") {
      fetch(`${API_BASE_URL}/team-members`).then(r => r.json()).then(setTeamMembers).catch(() => {});
    }
  }, [adminTab, isAuthenticated, refreshBooks]);

  const isSuperAdmin = adminRole === "Super Admin" || adminRole === "Developer" || adminRole === "Master Admin";

  const hasTabAccess = (tab: string) => {
    if (tab === "developer") {
      return adminRole?.toLowerCase().includes("develop") || adminRole?.toLowerCase().includes("devlop") || adminRole?.toLowerCase() === "d" || adminRole?.toLowerCase() === "developer admin";
    }
    return true; // All admins have full access to all other tabs
  };

  useEffect(() => {
    if (isAuthenticated) {
      const allowedTabs = ["dashboard", "books", "users", "orders", "newsletter", "messages", "testimonials", "team", "developer"].filter(hasTabAccess);
      if (allowedTabs.length > 0 && !allowedTabs.includes(adminTab)) {
        changeAdminTab(allowedTabs[0] as any);
      }
    }
  }, [adminRole, isAuthenticated, adminTab]);

  const addCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount_percent) return;
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCoupon.code,
          discount_percent: parseInt(newCoupon.discount_percent)
        })
      });
      if (res.ok) {
        setNewCoupon({ code: "", discount_percent: "" });
        fetch(`${API_BASE_URL}/coupons`).then(r => r.json()).then(setCoupons);
        alert("Coupon added successfully!");
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || "Failed to add coupon."}`);
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await fetch(`${API_BASE_URL}/coupons/${id}`, { method: "DELETE" });
      setCoupons(coupons.filter(c => c.id !== id));
      alert("Coupon deleted.");
    } catch (err) {
      alert("Failed to delete coupon.");
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert("✅ Settings updated successfully!");
      else alert("❌ Failed to update settings.");
    } catch (err) {
      alert("❌ Network error.");
    }
  };

  // CSV Export Utility
  const downloadCSV = (ordersToExport: any[], filename: string) => {
    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Items Purchased",
      "Total Amount (INR)",
      "Discount Applied (INR)",
      "GST (INR)",
      "Shipping Cost (INR)",
      "Date Placed",
      "Tracking Status",
      "Shipping Address"
    ];

    const rows = ordersToExport.map(o => {
      let itemsStr = "";
      try {
        itemsStr = JSON.parse(o.items || "[]")
          .map((item: any) => `${item.qty}x ${item.title} (₹${item.price})`)
          .join(" | ");
      } catch (e) {
        itemsStr = "Error parsing item data";
      }

      const fullAddress = o.address ? `${o.address}, ${o.city}, ${o.pincode}`.replace(/"/g, '""') : "N/A";
      return [
        o.id,
        o.user_name || "Unknown",
        o.user_email || "N/A",
        o.user_phone || "N/A",
        `"${itemsStr.replace(/"/g, '""')}"`,
        (o.total || 0).toFixed(2),
        (o.discount_amount || 0).toFixed(2),
        (o.gst_amount || 0).toFixed(2),
        (o.shipping_cost || 0).toFixed(2),
        o.date || "",
        o.status || "",
        `"${fullAddress}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Date Range Checker
  const isDateInRange = (dateStr: string) => {
    if (orderDateRange === "all") return true;
    if (!dateStr) return false;

    const orderDate = new Date(dateStr);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    orderDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - orderDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (orderDateRange === "today") {
      return diffDays === 0 || dateStr === today.toISOString().split("T")[0];
    }
    if (orderDateRange === "week") {
      return diffDays <= 7;
    }
    if (orderDateRange === "month") {
      return diffDays <= 30;
    }
    if (orderDateRange === "year") {
      return diffDays <= 365;
    }
    return true;
  };

  // Filtered Lists
  const filteredUsers = users.filter(u => {
    const query = userSearchQuery.toLowerCase();
    return (
      (u.n || "").toLowerCase().includes(query) ||
      (u.e || "").toLowerCase().includes(query) ||
      (u.p || "").toLowerCase().includes(query)
    );
  });

  const filteredOrders = orders.filter(o => {
    const query = orderSearchQuery.toLowerCase();
    let itemsMatch = false;
    try {
      itemsMatch = JSON.parse(o.items || "[]").some((item: any) =>
        (item.title || "").toLowerCase().includes(query)
      );
    } catch (e) {}

    return (
      String(o.id).includes(query) ||
      (o.user_name || "").toLowerCase().includes(query) ||
      (o.user_email || "").toLowerCase().includes(query) ||
      (o.user_phone || "").toLowerCase().includes(query) ||
      itemsMatch
    );
  });

  const finalFilteredOrders = filteredOrders.filter(o => isDateInRange(o.date));
  const placedOrdersList = finalFilteredOrders.filter(o => o.status !== "Cancelled");
  const cancelledOrdersList = finalFilteredOrders.filter(o => o.status === "Cancelled");

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF5EF" }}>
        <div className="animate-bounceIn" style={{ background: "#ffffff", border: "1.5px solid rgba(115, 0, 0, 0.15)", padding: "40px", borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.05)", width: "100%", maxWidth: 400, textAlign: "center" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12, color: "#730000" }}>Admin Access</h2>
          <p style={{ color: "#1c1917", marginBottom: 32, fontWeight: 500 }}>Please log in from the main website to access the Admin Panel.</p>
          <button onClick={() => go("home")} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 16 }}>Go to Homepage</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#ffffff", fontFamily: "sans-serif" }}>
      {/* Sidebar - Branded in Logo Brown */}
      <div style={{ width: 260, height: "100vh", background: "#2D1B10", color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#D4AF37", marginBottom: 4 }}>EverCraft Admin</div>
          <div style={{ fontSize: 12, color: "#FAF5EF", marginBottom: 8, wordBreak: "break-all", opacity: 0.8 }}>{adminEmail}</div>
          <div style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 800,
            background: "#730000",
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: 0.5
          }}>{adminRole}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", padding: 16, gap: 8, flex: 1, overflowY: "auto" }}>
          {hasTabAccess("dashboard") && (
            <button onClick={() => changeAdminTab("dashboard")} style={{ textAlign: "left", padding: "12px 16px", background: adminTab === "dashboard" ? "#730000" : "transparent", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>📊 Dashboard</button>
          )}
          {hasTabAccess("books") && (
            <button onClick={() => changeAdminTab("books")} style={{ textAlign: "left", padding: "12px 16px", background: adminTab === "books" ? "#730000" : "transparent", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>📚 Manage Books</button>
          )}
          {hasTabAccess("team") && (
            <button onClick={() => changeAdminTab("team")} style={{ textAlign: "left", padding: "12px 16px", background: adminTab === "team" ? "#730000" : "transparent", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>👥 Team Management</button>
          )}
          {hasTabAccess("users") && (
            <button onClick={() => changeAdminTab("users")} style={{ textAlign: "left", padding: "12px 16px", background: adminTab === "users" ? "#730000" : "transparent", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>👥 Users & Logins</button>
          )}
          {hasTabAccess("orders") && (
            <button onClick={() => changeAdminTab("orders")} style={{ textAlign: "left", padding: "12px 16px", background: adminTab === "orders" ? "#730000" : "transparent", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>📦 Orders Management</button>
          )}
          {hasTabAccess("newsletter") && (
            <button onClick={() => changeAdminTab("newsletter")} style={{ textAlign: "left", padding: "12px 16px", background: adminTab === "newsletter" ? "#730000" : "transparent", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>🍪 Newsletter & Cookies</button>
          )}
          {hasTabAccess("messages") && (
            <button onClick={() => changeAdminTab("messages")} style={{ textAlign: "left", padding: "12px 16px", background: adminTab === "messages" ? "#730000" : "transparent", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>📥 Inquiries & Messages</button>
          )}
          {hasTabAccess("testimonials") && (
            <button onClick={() => changeAdminTab("testimonials")} style={{ textAlign: "left", padding: "12px 16px", background: adminTab === "testimonials" ? "#730000" : "transparent", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>⭐ Testimonials</button>
          )}
          {(adminRole?.toLowerCase().includes("develop") || adminRole?.toLowerCase().includes("devlop") || adminRole?.toLowerCase() === "d" || adminRole?.toLowerCase() === "developer admin") && (
            <button onClick={() => changeAdminTab("developer")} style={{ textAlign: "left", padding: "12px 16px", background: adminTab === "developer" ? "#730000" : "transparent", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>⚙️ Developer Options</button>
          )}
        </div>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => go("home")} style={{ width: "100%", padding: "12px", background: "#730000", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, textAlign: "center" }}>🏠 Back to Website</button>
          <button onClick={() => {
            sessionStorage.removeItem("evercraft_admin_auth");
            localStorage.removeItem("evercraft_user");
            setIsAuthenticated(false);
            window.location.href = "/";
          }} style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>⬅ Logout & Exit</button>
        </div>
      </div>

      {/* Main ContentScrolling Area - White theme */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto", height: "100vh", background: "#ffffff" }}>
        {adminTab === "dashboard" && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D1B10", marginBottom: 24 }}>Dashboard Overview</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 40 }}>
              {[
                { label: "Total Books", value: stats.total_books, icon: "📚" },
                { label: "Registered Users", value: stats.total_users, icon: "👥" },
                { label: "Active Sessions", value: stats.active_sessions, icon: "🟢" },
                { label: "Total Orders", value: stats.total_orders, icon: "📦" },
                { label: "Subscribers", value: stats.total_subscribers, icon: "💌" },
                { label: "Publish Requests", value: stats.total_publish_requests, icon: "✒️" },
                { label: "Contact Messages", value: stats.total_contact_messages, icon: "📩" }
              ].map(stat => (
                <div key={stat.label} style={{ background: "#ffffff", border: "1.5px solid rgba(115, 0, 0, 0.15)", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", color: "#1c1917" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#730000" }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: "#5C3A21", marginTop: 4, fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {(isSuperAdmin || adminRole === "Site Admin") && (
              <div style={{ ...adminCardStyle, marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Manage Homepage Stats</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch(`${API_BASE_URL}/front-stats`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ happy_readers: fsReaders, cities_reached: fsCities, sales_platforms: fsPlatforms })
                    });
                    if (!res.ok) {
                      const errData = await res.json().catch(() => ({}));
                      throw new Error(errData.detail || errData.message || "Failed to update stats on server. Check backend.");
                    }
                    refreshBooks();
                    alert("Homepage Stats Updated Successfully!");
                  } catch (err: any) {
                    alert(`Error updating stats: ${err.message}`);
                    console.error(err);
                  }
                }} style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>Happy Readers</label>
                    <input required value={fsReaders} onChange={e => setFsReaders(e.target.value)} style={adminInputStyle} />
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>Cities Reached</label>
                    <input required value={fsCities} onChange={e => setFsCities(e.target.value)} style={adminInputStyle} />
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>Sales Platforms</label>
                    <input required value={fsPlatforms} onChange={e => setFsPlatforms(e.target.value)} style={adminInputStyle} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: "11px 24px", height: "fit-content" }}>Update Stats</button>
                </form>
                <p style={{ fontSize: 13, color: "#5C3A21", marginTop: 14 }}>Note: "Books Published" on the home page is automatically calculated based on your listed books.</p>
              </div>
            )}

            {(isSuperAdmin || adminRole === "Site Admin") && (
              <div style={adminCardStyle}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Manage Website Details & Social Links</h3>
                <form onSubmit={saveSettings} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>Contact Email</label>
                      <input required type="email" value={settings.contact_email || ""} onChange={e => setSettings({ ...settings, contact_email: e.target.value })} style={adminInputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>Contact Phone</label>
                      <input required type="text" value={settings.contact_phone || ""} onChange={e => setSettings({ ...settings, contact_phone: e.target.value })} style={adminInputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>Working Hours</label>
                      <input required type="text" value={settings.contact_hours || ""} onChange={e => setSettings({ ...settings, contact_hours: e.target.value })} style={adminInputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>Office Address</label>
                      <input required type="text" value={settings.contact_address || ""} onChange={e => setSettings({ ...settings, contact_address: e.target.value })} style={adminInputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>Facebook URL</label>
                      <input required type="url" value={settings.social_facebook || ""} onChange={e => setSettings({ ...settings, social_facebook: e.target.value })} style={adminInputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>Instagram URL</label>
                      <input required type="url" value={settings.social_instagram || ""} onChange={e => setSettings({ ...settings, social_instagram: e.target.value })} style={adminInputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>LinkedIn URL</label>
                      <input required type="url" value={settings.social_linkedin || ""} onChange={e => setSettings({ ...settings, social_linkedin: e.target.value })} style={adminInputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>X (Twitter) URL</label>
                      <input required type="url" value={settings.social_x || ""} onChange={e => setSettings({ ...settings, social_x: e.target.value })} style={adminInputStyle} />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: "12px 24px", alignSelf: "flex-end" }}>Save Details</button>
                </form>
              </div>
            )}
          </div>
        )}

        {adminTab === "books" && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D1B10", marginBottom: 24 }}>Manage Books</h1>

            {isSuperAdmin && (
              <div style={{ ...adminCardStyle, marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Store Settings</h3>
                <form onSubmit={saveSettings} style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>GST Percent (%)</label>
                    <input required type="number" min="0" step="0.01" value={settings.gst_percent} onChange={e => setSettings({ ...settings, gst_percent: e.target.value })} style={adminInputStyle} />
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1917", marginBottom: 6 }}>Shipping Cost (₹)</label>
                    <input required type="number" min="0" step="1" value={settings.shipping_cost} onChange={e => setSettings({ ...settings, shipping_cost: e.target.value })} style={adminInputStyle} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: "11px 24px", height: "fit-content" }}>Save Settings</button>
                </form>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
              <div style={adminCardStyle}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#2D1B10" }}>Hero Section (Newly Launched)</h3>
                <select id="heroSelect" key={books.find(b => b.is_hero)?.id || "h"} defaultValue={books.find(b => b.is_hero)?.id || ""} style={adminSelectStyle}>
                  <option value="" disabled>Select a book</option>
                  {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
                <button onClick={async () => {
                  const id = (document.getElementById("heroSelect") as HTMLSelectElement).value;
                  if (id) {
                    await fetch(`${API_BASE_URL}/books/hero/${id}`, { method: "POST" });
                    await refreshBooks();
                    alert("Hero book updated successfully!");
                  }
                }} className="btn-primary" style={{ marginTop: 12, padding: "8px 16px" }}>Update Hero Book</button>
              </div>
              <div style={adminCardStyle}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#2D1B10" }}>Best Selling Section</h3>
                <select id="bestsellerSelect" key={books.find(b => b.is_bestseller)?.id || "b"} defaultValue={books.find(b => b.is_bestseller)?.id || ""} style={adminSelectStyle}>
                  <option value="" disabled>Select a book</option>
                  {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
                <button onClick={async () => {
                  const id = (document.getElementById("bestsellerSelect") as HTMLSelectElement).value;
                  if (id) {
                    await fetch(`${API_BASE_URL}/books/bestseller/${id}`, { method: "POST" });
                    await refreshBooks();
                    alert("Bestseller book updated successfully!");
                  }
                }} className="btn-primary" style={{ marginTop: 12, padding: "8px 16px" }}>Update Best Seller</button>
              </div>
            </div>

            <div style={adminCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2D1B10" }}>Shop Page Catalog</h3>
                <button onClick={() => {
                  setEditingBook(null);
                  setBookForm({
                    title: "", titleHindi: "", author: "", authorHindi: "",
                    mrp: "", price: "", isbn: "", genre: "", language: "English",
                    pages: "", badge: "", rating: "5", reviews: "0", availability: "In Stock",
                    stock: "0", publisher: "EverCraft Publications",
                    amazonLink: "", flipkartLink: "", ondcLink: "",
                    description: "", descriptionHindi: "", frontCoverUrl: "", backCoverUrl: "",
                    is_upcoming: false, release_date: "Coming Soon"
                  });
                  setShowAddBook(true);
                }} className="btn-primary" style={{ padding: "8px 16px" }}>+ Add New Book</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #730000", textAlign: "left", color: "#2D1B10" }}>
                    <th style={{ padding: 12 }}>ID</th>
                    <th style={{ padding: 12 }}>Title</th>
                    <th style={{ padding: 12 }}>Author</th>
                    <th style={{ padding: 12 }}>Price</th>
                    <th style={{ padding: 12 }}>Stock</th>
                    <th style={{ padding: 12 }}>Status</th>
                    <th style={{ padding: 12 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(b => (
                    <tr key={b.id} style={{ borderBottom: "1px solid rgba(115,0,0,0.1)", color: "#1c1917" }}>
                      <td style={{ padding: 12 }}>{b.id}</td>
                      <td style={{ padding: 12, fontWeight: 600 }}>{b.title}</td>
                      <td style={{ padding: 12 }}>{b.author}</td>
                      <td style={{ padding: 12 }}>₹{b.price}</td>
                      <td style={{ padding: 12 }}>{b.stock}</td>
                      <td style={{ padding: 12 }}><span style={{ background: b.available ? "#dcfce7" : "#fee2e2", color: b.available ? "#16a34a" : "#dc2626", padding: "4px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{b.available ? "Listed" : "Unlisted"}</span></td>
                      <td style={{ padding: 12 }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              setEditingBook(b);
                              setBookForm({
                                title: b.title || "",
                                titleHindi: b.titleHindi || "",
                                author: b.author || "",
                                authorHindi: b.authorHindi || "",
                                mrp: String(b.mrp || ""),
                                price: String(b.price || ""),
                                isbn: b.isbn || "",
                                genre: b.genre || "",
                                language: b.language || "English",
                                pages: String(b.pages || ""),
                                badge: b.badge || "",
                                rating: String(b.rating || "4.5"),
                                reviews: String(b.reviews || "0"),
                                availability: b.available ? "In Stock" : "Out of Stock",
                                frontCoverUrl: b.frontCover || "",
                                backCoverUrl: b.backCover || "",
                                amazonLink: b.amazonLink || "",
                                flipkartLink: b.flipkartLink || "",
                                ondcLink: b.ondcLink || "",
                                description: b.description || "",
                                descriptionHindi: b.descriptionHindi || "",
                                stock: String(b.stock || "0"),
                                is_upcoming: b.is_upcoming || false,
                                release_date: b.release_date || "",
                                publisher: b.publisher || ""
                              });
                              setShowAddBook(true);
                            }}
                            style={{ background: "#fef3c7", color: "#1c1917", border: "1.5px solid #2D1B10", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete "${b.title}"?`)) {
                                try {
                                  await fetch(`${API_BASE_URL}/books/${b.id}`, { method: 'DELETE' });
                                  refreshBooks();
                                  alert('Book deleted successfully');
                                } catch (e) {
                                  alert('Failed to delete book');
                                }
                              }
                            }}
                            style={{ background: "#fee2e2", color: "#dc2626", border: "1.5px solid #dc2626", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {books.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#6B7280" }}>No books available.</div>}
            </div>
          </div>
        )}

        {adminTab === "team" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D1B10", margin: 0 }}>Team Management</h1>
              <button
                onClick={() => {
                  setEditingTeam(null);
                  setTeamForm({ name: "", role: "", description: "", category: "Editorial Team", image: "" });
                  setShowAddTeam(true);
                }}
                className="btn-primary"
                style={{ padding: "10px 20px" }}
              >
                + Add Team Member
              </button>
            </div>

            <div style={adminCardStyle}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #730000", textAlign: "left", color: "#2D1B10" }}>
                    <th style={{ padding: 12, width: 80 }}>Photo</th>
                    <th style={{ padding: 12, minWidth: 150 }}>Name</th>
                    <th style={{ padding: 12, minWidth: 150 }}>Role</th>
                    <th style={{ padding: 12, minWidth: 150 }}>Category</th>
                    <th style={{ padding: 12, minWidth: 250 }}>Description</th>
                    <th style={{ padding: 12, width: 150 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map(m => (
                    <tr key={m.id} style={{ borderBottom: "1px solid rgba(115,0,0,0.1)", color: "#1c1917" }}>
                      <td style={{ padding: 12 }}>
                        {m.image ? (
                          <img src={m.image} alt={m.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FAF5EF", color: "#730000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: 12, fontWeight: 600 }}>{m.name}</td>
                      <td style={{ padding: 12, color: "#5C3A21" }}>{m.role}</td>
                      <td style={{ padding: 12 }}><span style={{ background: "#730000", color: "#ffffff", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{m.category}</span></td>
                      <td style={{ padding: 12, color: "#5C3A21", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.description}</td>
                      <td style={{ padding: 12, display: "flex", gap: 8 }}>
                        <button
                          onClick={() => {
                            setEditingTeam(m);
                            setTeamForm({
                              name: m.name || "",
                              role: m.role || "",
                              description: m.description || "",
                              category: m.category || "Editorial Team",
                              image: m.image || ""
                            });
                            setShowAddTeam(true);
                          }}
                          style={{ background: "#fef3c7", color: "#1c1917", border: "1.5px solid #2D1B10", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm("Are you sure you want to delete this team member?")) return;
                            try {
                              const res = await fetch(`${API_BASE_URL}/team-members/${m.id}`, { method: "DELETE" });
                              if (res.ok) {
                                setTeamMembers(teamMembers.filter(member => member.id !== m.id));
                                alert("Team member deleted successfully!");
                              } else {
                                alert("Failed to delete team member");
                              }
                            } catch (err) {
                              alert("Error deleting team member");
                            }
                          }}
                          style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {teamMembers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>
                        No team members registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === "developer" && (
          <DeveloperSettingsTab />
        )}

        {adminTab === "users" && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D1B10", marginBottom: 24 }}>Users & Logins</h1>
            <div style={adminCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2D1B10", margin: 0 }}>Recent Signups & Active Logins</h3>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  placeholder="🔍 Search users by Name, Email, or Phone..."
                  style={adminInputStyle}
                />
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #730000", textAlign: "left", color: "#2D1B10" }}>
                    <th style={{ padding: 12 }}>User Name</th>
                    <th style={{ padding: 12 }}>Email</th>
                    <th style={{ padding: 12 }}>Phone</th>
                    <th style={{ padding: 12 }}>Status</th>
                    <th style={{ padding: 12 }}>Role</th>
                    <th style={{ padding: 12 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid rgba(115,0,0,0.1)", color: "#1c1917" }}>
                      <td style={{ padding: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
                        {u.img ? (
                          <img src={u.img} style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }} alt={`${u.n || "User"} profile`} />
                        ) : (
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                            {(u.n || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                        {u.n || "Unnamed User"}
                      </td>
                      <td style={{ padding: 12 }}>{u.e}</td>
                      <td style={{ padding: 12 }}>{u.p}</td>
                      <td style={{ padding: 12 }}>{u.s}</td>
                      <td style={{ padding: 12 }}>
                        <select
                          value={u.role || "Customer"}
                          onChange={async e => {
                            const newRole = e.target.value;
                            try {
                              const res = await fetch(`${API_BASE_URL}/users/${u.id}/role`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ role: newRole })
                              });
                              if (res.ok) {
                                fetch(`${API_BASE_URL}/users`).then(r => r.json()).then(setUsers);
                                alert(`Successfully updated role for ${u.n} to ${newRole}`);
                              } else {
                                alert("Failed to update role");
                              }
                            } catch (err) {
                              alert("Error updating role");
                            }
                          }}
                          style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #2D1B10", outline: "none", background: "#ffffff", color: "#1c1917" }}
                        >
                          <option value="Customer">Customer</option>
                          <option value="Customer Support">Customer Support</option>
                          <option value="Shop Clerk">Shop Clerk</option>
                          <option value="Store Manager">Store Manager</option>
                          <option value="Editor">Editor</option>
                          <option value="Site Admin">Site Admin</option>
                          <option value="Super Admin">Super Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: 12, display: "flex", gap: 8 }}>
                        <button
                          onClick={() => {
                            setSelectedUserIdForAddresses(u.id);
                            setShowUserAddressesModal(true);
                          }}
                          style={{ background: "#FAF5EF", color: "#730000", border: "1.5px solid #730000", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                        >
                          View Addresses
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Are you sure you want to delete ${u.n}'s account?`)) return;
                              try {
                                const res = await fetch(`${API_BASE_URL}/users/${u.id}`, { method: "DELETE" });
                                if (res.ok) {
                                  fetch(`${API_BASE_URL}/users`).then(r => r.json()).then(setUsers);
                                  alert("Account deleted successfully");
                                } else {
                                  alert("Failed to delete account");
                                }
                              } catch (err) {
                                alert("Error deleting account");
                              }
                            }}
                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#6B7280" }}>No users found matching query.</div>}
            </div>
          </div>
        )}

        {adminTab === "orders" && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D1B10", marginBottom: 24 }}>Orders Management</h1>

            {(isSuperAdmin || adminRole === "Store Manager") && (
              <div style={{ ...adminCardStyle, marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Manage Coupon Codes</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <form onSubmit={addCoupon} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <h4 style={{ fontWeight: 600, color: "#2D1B10" }}>Add New Coupon</h4>
                    <input required value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="Coupon Code (e.g., NEWYEAR20)" style={adminInputStyle} />
                    <input required type="number" min="1" max="100" value={newCoupon.discount_percent} onChange={e => setNewCoupon({ ...newCoupon, discount_percent: e.target.value })} placeholder="Discount %" style={adminInputStyle} />
                    <button type="submit" className="btn-primary" style={{ padding: "11px 24px" }}>Add Coupon</button>
                  </form>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: 12, color: "#2D1B10" }}>Existing Coupons</h4>
                    <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                      {coupons.map(c => (
                        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAF5EF", color: "#1c1917", padding: "8px 12px", border: "1px solid rgba(115,0,0,0.15)", borderRadius: 8 }}>
                          <div>
                            <span style={{ fontWeight: 700, color: "#730000" }}>{c.code}</span>
                            <span style={{ marginLeft: 12, color: "#16a34a", fontWeight: 600 }}>{c.discount_percent}% OFF</span>
                          </div>
                          <button onClick={() => deleteCoupon(c.id)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", padding: "4px 8px", fontSize: 12, fontWeight: 700 }}>Delete</button>
                        </div>
                      ))}
                      {coupons.length === 0 && <p style={{ color: "#6B7280", fontSize: 13, textAlign: "center" }}>No coupons created yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADVANCED FILTER BAR */}
            <div style={{ ...adminCardStyle, marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Order Search, Filters & Export</h3>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={e => setOrderSearchQuery(e.target.value)}
                    placeholder="🔍 Search orders by ID, Name, Email, Phone or Book Titles..."
                    style={adminInputStyle}
                  />
                </div>
                <div style={{ minWidth: 150 }}>
                  <select value={orderDateRange} onChange={e => setOrderDateRange(e.target.value as any)} style={adminSelectStyle}>
                    <option value="all">📅 Date: All Time</option>
                    <option value="today">📅 Date: Today</option>
                    <option value="week">📅 Date: This Week</option>
                    <option value="month">📅 Date: This Month</option>
                    <option value="year">📅 Date: This Year</option>
                  </select>
                </div>
                <button onClick={() => downloadCSV(finalFilteredOrders, `orders_${orderDateRange}_export.csv`)} className="btn-primary" style={{ padding: "11px 24px", height: "fit-content" }}>
                  📥 Download Excel/CSV
                </button>
              </div>
            </div>

            {/* PLACED ORDERS SECTION */}
            <div style={{ ...adminCardStyle, marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Active & Placed Orders</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #730000", textAlign: "left", color: "#2D1B10" }}>
                    <th style={{ padding: 12 }}>Order ID</th>
                    <th style={{ padding: 12, minWidth: 160 }}>Customer Info</th>
                    <th style={{ padding: 12, minWidth: 200 }}>Items</th>
                    <th style={{ padding: 12, minWidth: 220 }}>Shipping Address</th>
                    <th style={{ padding: 12 }}>Total</th>
                    <th style={{ padding: 12 }}>Coupon</th>
                    <th style={{ padding: 12, minWidth: 120 }}>Date</th>
                    <th style={{ padding: 12 }}>Tracking Status</th>
                  </tr>
                </thead>
                <tbody>
                  {placedOrdersList.map(o => (
                    <tr key={o.id} style={{ borderBottom: "1px solid rgba(115,0,0,0.1)", color: "#1c1917" }}>
                      <td style={{ padding: 12, fontWeight: 800 }}>#{o.id}</td>
                      <td style={{ padding: 12 }}>
                        <div style={{ fontWeight: 600 }}>{o.user_name}</div>
                        <div style={{ fontSize: 11, color: "#5C3A21" }}>{o.user_email || "N/A"}</div>
                        <div style={{ fontSize: 11, color: "#5C3A21" }}>{o.user_phone || "N/A"}</div>
                      </td>
                      <td style={{ padding: 12, fontSize: 12, color: "#1c1917", whiteSpace: "pre-wrap", maxWidth: 200 }}>
                        {(() => {
                          try {
                            return JSON.parse(o.items || "[]").map((item: any) => `${item.qty}x ${item.title}`).join("\n");
                          } catch (e) {
                            return "Invalid item data";
                          }
                        })()}
                      </td>
                      <td style={{ padding: 12, fontSize: 12, color: "#1c1917", whiteSpace: "pre-wrap", maxWidth: 220 }}>
                        {o.address ? `${o.address}, ${o.city}, ${o.pincode}` : "N/A"}
                      </td>
                      <td style={{ padding: 12, color: "#730000", fontWeight: 700 }}>
                        <div>₹{(o.total || 0).toFixed(2)}</div>
                        {(o.discount_amount || 0) > 0 && <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>- ₹{(o.discount_amount || 0).toFixed(2)}</div>}
                      </td>
                      <td style={{ padding: 12, fontSize: 12, fontWeight: 600, color: "#1c1917" }}>{o.coupon_code || "N/A"}</td>
                      <td style={{ padding: 12, color: "#5C3A21" }}>{o.date}</td>
                      <td style={{ padding: 12 }}>
                        <select value={o.status} onChange={async e => {
                          const val = e.target.value;
                          await fetch(`${API_BASE_URL}/orders/${o.id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: val }) });
                          fetch(`${API_BASE_URL}/orders`).then(r => r.json()).then(setOrders);
                        }} style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #2D1B10", outline: "none", background: "#ffffff", color: "#1c1917" }}>
                          <option>Order Placed</option>
                          <option>Processing</option>
                          <option>Dispatched</option>
                          <option>In Transit</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {placedOrdersList.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#6B7280", width: "100%" }}>No active placed orders found</div>}
            </div>

            {/* CANCELLED ORDERS SECTION */}
            <div style={adminCardStyle}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#dc2626" }}>Cancelled Orders</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #dc2626", textAlign: "left", color: "#2D1B10" }}>
                    <th style={{ padding: 12 }}>Order ID</th>
                    <th style={{ padding: 12, minWidth: 160 }}>Customer Info</th>
                    <th style={{ padding: 12, minWidth: 200 }}>Items</th>
                    <th style={{ padding: 12, minWidth: 220 }}>Shipping Address</th>
                    <th style={{ padding: 12 }}>Total</th>
                    <th style={{ padding: 12 }}>Coupon</th>
                    <th style={{ padding: 12, minWidth: 120 }}>Date</th>
                    <th style={{ padding: 12 }}>Tracking Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cancelledOrdersList.map(o => (
                    <tr key={o.id} style={{ borderBottom: "1px solid rgba(220,38,38,0.1)", color: "#1c1917" }}>
                      <td style={{ padding: 12, fontWeight: 800 }}>#{o.id}</td>
                      <td style={{ padding: 12 }}>
                        <div style={{ fontWeight: 600 }}>{o.user_name}</div>
                        <div style={{ fontSize: 11, color: "#5C3A21" }}>{o.user_email || "N/A"}</div>
                        <div style={{ fontSize: 11, color: "#5C3A21" }}>{o.user_phone || "N/A"}</div>
                      </td>
                      <td style={{ padding: 12, fontSize: 12, color: "#1c1917", whiteSpace: "pre-wrap", maxWidth: 200 }}>
                        {(() => {
                          try {
                            return JSON.parse(o.items || "[]").map((item: any) => `${item.qty}x ${item.title}`).join("\n");
                          } catch (e) {
                            return "Invalid item data";
                          }
                        })()}
                      </td>
                      <td style={{ padding: 12, fontSize: 12, color: "#1c1917", whiteSpace: "pre-wrap", maxWidth: 220 }}>
                        {o.address ? `${o.address}, ${o.city}, ${o.pincode}` : "N/A"}
                      </td>
                      <td style={{ padding: 12, color: "#730000", fontWeight: 700 }}>
                        <div>₹{(o.total || 0).toFixed(2)}</div>
                        {(o.discount_amount || 0) > 0 && <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>- ₹{(o.discount_amount || 0).toFixed(2)}</div>}
                      </td>
                      <td style={{ padding: 12, fontSize: 12, fontWeight: 600, color: "#1c1917" }}>{o.coupon_code || "N/A"}</td>
                      <td style={{ padding: 12, color: "#5C3A21" }}>{o.date}</td>
                      <td style={{ padding: 12 }}>
                        <select value={o.status} onChange={async e => {
                          const val = e.target.value;
                          await fetch(`${API_BASE_URL}/orders/${o.id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: val }) });
                          fetch(`${API_BASE_URL}/orders`).then(r => r.json()).then(setOrders);
                        }} style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #2D1B10", outline: "none", background: "#ffffff", color: "#1c1917" }}>
                          <option>Order Placed</option>
                          <option>Processing</option>
                          <option>Dispatched</option>
                          <option>In Transit</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cancelledOrdersList.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#6B7280", width: "100%" }}>No cancelled orders found</div>}
            </div>
          </div>
        )}

        {adminTab === "newsletter" && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D1B10", marginBottom: 24 }}>Newsletter & Cookies</h1>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={adminCardStyle}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Newsletter Subscribers</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #730000", textAlign: "left", color: "#2D1B10" }}>
                      <th style={{ padding: 12 }}>Email ID</th>
                      <th style={{ padding: 12 }}>Date Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((u, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(115,0,0,0.1)", color: "#1c1917" }}>
                        <td style={{ padding: 12, fontWeight: 500 }}>{u.e}</td>
                        <td style={{ padding: 12, color: "#5C3A21" }}>{u.d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {subscribers.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#6B7280", width: "100%" }}>No subscribers found</div>}
              </div>

              <div style={adminCardStyle}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Cookie Consents</h3>
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #730000", textAlign: "left", color: "#2D1B10" }}>
                        <th style={{ padding: 12 }}>Session / User ID</th>
                        <th style={{ padding: 12 }}>Response</th>
                        <th style={{ padding: 12 }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cookieConsents.map((c, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(115,0,0,0.1)", color: "#1c1917" }}>
                          <td style={{ padding: 12, color: "#1c1917", fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" }}>
                            {c.user_id ? `User #${c.user_id}` : c.session_id}
                          </td>
                          <td style={{ padding: 12, fontWeight: 600 }}>
                            {c.status === "accepted" ? "Accepted ✅" : "Denied ❌"}
                          </td>
                          <td style={{ padding: 12, color: "#5C3A21", fontSize: 12 }}>{c.timestamp}</td>
                        </tr>
                      ))}
                      {cookieConsents.length === 0 && (
                        <tr><td colSpan={3} style={{ padding: 16, textAlign: "center", color: "#6B7280" }}>No cookie consents recorded yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {adminTab === "messages" && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D1B10", marginBottom: 24 }}>Inquiries & Messages</h1>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={adminCardStyle}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Publishing Requests</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #730000", textAlign: "left", color: "#2D1B10" }}>
                        <th style={{ padding: 12 }}>Date</th>
                        <th style={{ padding: 12 }}>Author</th>
                        <th style={{ padding: 12 }}>Contact</th>
                        <th style={{ padding: 12 }}>Country</th>
                        <th style={{ padding: 12 }}>Genre</th>
                        <th style={{ padding: 12 }}>Manuscript Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publishReqs.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(115,0,0,0.1)", color: "#1c1917", verticalAlign: "top" }}>
                          <td style={{ padding: 12, whiteSpace: "nowrap", color: "#5C3A21" }}>{r.date_submitted}</td>
                          <td style={{ padding: 12, fontWeight: 600 }}>{r.name}</td>
                          <td style={{ padding: 12 }}><div>{r.email}</div><div style={{ color: "#5C3A21", fontSize: 12 }}>{r.phone}</div></td>
                          <td style={{ padding: 12, fontWeight: 600 }}>{r.country || '-'}</td>
                          <td style={{ padding: 12 }}><span style={{ background: "#FAF5EF", color: "#730000", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, border: "1px solid rgba(115,0,0,0.15)" }}>{r.genre || '-'}</span></td>
                          <td style={{ padding: 12, maxWidth: 300, whiteSpace: "pre-wrap" }}>{r.manuscript}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {publishReqs.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#6B7280" }}>No publishing requests yet</div>}
                </div>
              </div>

              <div style={adminCardStyle}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Contact Form Messages</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #730000", textAlign: "left", color: "#2D1B10" }}>
                        <th style={{ padding: 12 }}>Date</th>
                        <th style={{ padding: 12 }}>Sender</th>
                        <th style={{ padding: 12 }}>Contact</th>
                        <th style={{ padding: 12 }}>Subject</th>
                        <th style={{ padding: 12 }}>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactMsgs.map((m, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(115,0,0,0.1)", color: "#1c1917", verticalAlign: "top" }}>
                          <td style={{ padding: 12, whiteSpace: "nowrap", color: "#5C3A21" }}>{m.date_submitted}</td>
                          <td style={{ padding: 12, fontWeight: 600 }}>{m.name}</td>
                          <td style={{ padding: 12 }}><div>{m.email}</div><div style={{ color: "#5C3A21", fontSize: 12 }}>{m.phone}</div></td>
                          <td style={{ padding: 12, fontWeight: 600, color: "#730000" }}>{m.subject}</td>
                          <td style={{ padding: 12, maxWidth: 300, whiteSpace: "pre-wrap" }}>{m.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {contactMsgs.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#6B7280" }}>No contact messages yet</div>}
                </div>
              </div>

              <div style={adminCardStyle}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Service Inquiries</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #730000", textAlign: "left", color: "#2D1B10" }}>
                        <th style={{ padding: 12 }}>Date</th>
                        <th style={{ padding: 12 }}>Service Name</th>
                        <th style={{ padding: 12 }}>Name</th>
                        <th style={{ padding: 12 }}>Contact</th>
                        <th style={{ padding: 12 }}>Project Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceInquiries.map((inq, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(115,0,0,0.1)", color: "#1c1917", verticalAlign: "top" }}>
                          <td style={{ padding: 12, whiteSpace: "nowrap", color: "#5C3A21" }}>{inq.date_submitted}</td>
                          <td style={{ padding: 12, fontWeight: 700, color: "#730000" }}>{inq.service_name}</td>
                          <td style={{ padding: 12, fontWeight: 600 }}>{inq.name}</td>
                          <td style={{ padding: 12 }}><div>{inq.email}</div><div style={{ color: "#5C3A21", fontSize: 12 }}>{inq.phone}</div></td>
                          <td style={{ padding: 12, maxWidth: 300, whiteSpace: "pre-wrap" }}>{inq.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {serviceInquiries.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#6B7280" }}>No service inquiries yet</div>}
                </div>
              </div>

              <div style={adminCardStyle}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#2D1B10" }}>Service Feedback Responses</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #730000", textAlign: "left", color: "#2D1B10" }}>
                        <th style={{ padding: 12 }}>Date</th>
                        <th style={{ padding: 12 }}>Service Name</th>
                        <th style={{ padding: 12 }}>Sender</th>
                        <th style={{ padding: 12 }}>Email</th>
                        <th style={{ padding: 12 }}>Rating</th>
                        <th style={{ padding: 12 }}>Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceFeedbacks.map((fb, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(115,0,0,0.1)", color: "#1c1917", verticalAlign: "top" }}>
                          <td style={{ padding: 12, whiteSpace: "nowrap", color: "#5C3A21" }}>{fb.date_submitted}</td>
                          <td style={{ padding: 12, fontWeight: 700, color: "#730000" }}>{fb.service_name}</td>
                          <td style={{ padding: 12, fontWeight: 600 }}>{fb.name}</td>
                          <td style={{ padding: 12 }}>{fb.email}</td>
                          <td style={{ padding: 12, fontWeight: 700, color: "#fbbf24" }}>{"★".repeat(fb.rating)}</td>
                          <td style={{ padding: 12, maxWidth: 300, whiteSpace: "pre-wrap" }}>{fb.feedback}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {serviceFeedbacks.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#6B7280" }}>No service feedback yet</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {adminTab === "testimonials" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D1B10", margin: 0 }}>Manage Testimonials</h1>
              <button
                onClick={() => {
                  setEditingTestimonial(null);
                  setNewTestimonial({ name: "", role: "", text: "", rating: 5 });
                  setShowAddTestimonial(true);
                }}
                className="btn-primary"
                style={{ padding: "10px 20px" }}
              >
                + Add Testimonial
              </button>
            </div>

            <div style={adminCardStyle}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #730000", textAlign: "left", color: "#2D1B10" }}>
                    <th style={{ padding: 12, width: 80 }}>Avatar</th>
                    <th style={{ padding: 12, minWidth: 150 }}>Author Name</th>
                    <th style={{ padding: 12, minWidth: 150 }}>Role</th>
                    <th style={{ padding: 12, minWidth: 300 }}>Review Text</th>
                    <th style={{ padding: 12, width: 100 }}>Rating</th>
                    <th style={{ padding: 12, width: 150 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map(t => (
                    <tr key={t.id} style={{ borderBottom: "1px solid rgba(115,0,0,0.1)", color: "#1c1917" }}>
                      <td style={{ padding: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FAF5EF", color: "#730000", border: "1px solid rgba(115,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                          {t.avatar || "T"}
                        </div>
                      </td>
                      <td style={{ padding: 12, fontWeight: 600 }}>{t.name}</td>
                      <td style={{ padding: 12, color: "#5C3A21" }}>{t.role}</td>
                      <td style={{ padding: 12, color: "#5C3A21", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.text}</td>
                      <td style={{ padding: 12, fontWeight: 700, color: "#fbbf24" }}>{"★".repeat(t.rating)}</td>
                      <td style={{ padding: 12, display: "flex", gap: 8 }}>
                        <button
                          onClick={() => {
                            setEditingTestimonial(t);
                            setNewTestimonial({ name: t.name, role: t.role, text: t.text, rating: t.rating });
                            setShowAddTestimonial(true);
                          }}
                          style={{ background: "#fef3c7", color: "#1c1917", border: "1.5px solid #2D1B10", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
                            try {
                              const res = await fetch(`${API_BASE_URL}/testimonials/${t.id}`, { method: "DELETE" });
                              if (res.ok) {
                                if (refreshTestimonials) refreshTestimonials();
                                alert("Testimonial deleted successfully!");
                              } else {
                                alert("Failed to delete testimonial");
                              }
                            } catch (err) {
                              alert("Error deleting testimonial");
                            }
                          }}
                          style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {testimonials.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>
                        No testimonials found in database. Showing default seeded ones on home page.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Popups in White Theme with Black Text & Logo Brown Border */}

      {/* User Addresses Modal */}
      {showUserAddressesModal && selectedUserIdForAddresses !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="animate-bounceIn" style={{ background: "#ffffff", border: "2px solid #2D1B10", width: "100%", maxWidth: 600, borderRadius: 24, padding: "32px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", color: "#1c1917" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#2D1B10" }}>User Addresses</h2>
              <button onClick={() => setShowUserAddressesModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>✕</button>
            </div>
            {userAddresses.length === 0 ? (
              <p style={{ color: "#6b7280", textAlign: "center" }}>No addresses found for this user.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                {userAddresses.map((addr, index) => (
                  <div key={index} style={{ border: "1px solid rgba(115, 0, 0, 0.15)", padding: 16, borderRadius: 12, background: "#FAF5EF", color: "#1c1917" }}>
                    <span style={{ background: "#730000", color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, marginBottom: 8, display: "inline-block" }}>{addr.type}</span>
                    <p style={{ fontSize: 14, color: "#1c1917", marginBottom: 4, fontWeight: 600 }}>{addr.address}</p>
                    <p style={{ fontSize: 13, color: "#5C3A21" }}>{addr.city}, {addr.pincode}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* UNIFIED ADD / EDIT BOOK MODAL */}
      {showAddBook && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="animate-bounceIn" style={{ background: "#ffffff", border: "2px solid #2D1B10", width: "100%", maxWidth: 800, borderRadius: 24, padding: "32px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", color: "#1c1917" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#2D1B10" }}>{editingBook ? `Edit Book: ${editingBook.title}` : "Add New Book"}</h2>
              <button onClick={() => { setShowAddBook(false); setEditingBook(null); }} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);

              const fileToDataUrl = (file: File | null): Promise<string> => {
                if (!file || file.size === 0) return Promise.resolve("");
                return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                });
              };

              const frontCoverBase64 = await fileToDataUrl(fd.get("frontCover") as File);
              const backCoverBase64 = await fileToDataUrl(fd.get("backCover") as File);

              let frontCover = bookForm.frontCoverUrl;
              let backCover = bookForm.backCoverUrl;

              try {
                if (frontCoverBase64) {
                  frontCover = await uploadImageToCloudinary(frontCoverBase64);
                }
                if (backCoverBase64) {
                  backCover = await uploadImageToCloudinary(backCoverBase64);
                }
              } catch (err) {
                alert("❌ Image upload to Cloudinary failed. Ensure your Cloudinary configurations are correct.");
                return;
              }

              const payload = {
                title: bookForm.title,
                titleHindi: bookForm.titleHindi,
                author: bookForm.author,
                authorHindi: bookForm.authorHindi,
                mrp: Number(bookForm.mrp) || 0,
                price: Number(bookForm.price) || 0,
                isbn: bookForm.isbn,
                genre: bookForm.genre,
                language: bookForm.language,
                pages: Number(bookForm.pages) || 0,
                badge: bookForm.badge,
                rating: Number(bookForm.rating) || 5.0,
                reviews: Number(bookForm.reviews) || 0,
                available: bookForm.availability === "In Stock",
                stock: Number(bookForm.stock) || 0,
                publisher: bookForm.publisher,
                frontCover,
                backCover,
                amazonLink: bookForm.amazonLink,
                flipkartLink: bookForm.flipkartLink,
                ondcLink: bookForm.ondcLink,
                description: bookForm.description,
                descriptionHindi: bookForm.descriptionHindi,
                is_hero: editingBook ? editingBook.is_hero : false,
                is_bestseller: editingBook ? editingBook.is_bestseller : false,
                is_upcoming: bookForm.is_upcoming,
                release_date: bookForm.release_date
              };

              try {
                const url = editingBook ? `${API_BASE_URL}/books/${editingBook.id}` : `${API_BASE_URL}/books`;
                const method = editingBook ? "PUT" : "POST";
                const response = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload)
                });

                if (!response.ok) {
                  const errData = await response.json();
                  alert(`Backend Error: ${JSON.stringify(errData)}`);
                  return;
                }

                refreshBooks();
                setShowAddBook(false);
                setEditingBook(null);
                alert(editingBook ? "Book Updated Successfully!" : "Book Saved Successfully!");
              } catch (err) {
                console.error(err);
                alert("Failed to connect to backend! Make sure Python server is running.");
              }
            }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>1. Title Name (English) *</label>
                  <input required type="text" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>2. Title Name (Hindi)</label>
                  <input type="text" value={bookForm.titleHindi} onChange={e => setBookForm({ ...bookForm, titleHindi: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>3. Author Name (English) *</label>
                  <input required type="text" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>4. Author Name (Hindi)</label>
                  <input type="text" value={bookForm.authorHindi} onChange={e => setBookForm({ ...bookForm, authorHindi: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>5. MRP (₹) *</label>
                  <input required type="number" value={bookForm.mrp} onChange={e => setBookForm({ ...bookForm, mrp: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>6. Selling Price (₹) *</label>
                  <input required type="number" value={bookForm.price} onChange={e => setBookForm({ ...bookForm, price: e.target.value })} style={adminInputStyle} />
                </div>
              </div>

              <div style={{ background: "#FAF5EF", border: "1.5px solid #730000", padding: "12px 16px", borderRadius: 8, color: "#730000", fontSize: 14, fontWeight: 700 }}>
                🏷️ Automatic Discount: {discount > 0 ? `${discount}% OFF` : "0% OFF"}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>7. ISBN No.</label>
                  <input type="text" value={bookForm.isbn} onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>8. Genre</label>
                  <input type="text" value={bookForm.genre} onChange={e => setBookForm({ ...bookForm, genre: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>9. Language</label>
                  <input type="text" value={bookForm.language} onChange={e => setBookForm({ ...bookForm, language: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>10. Total Pages</label>
                  <input type="number" value={bookForm.pages} onChange={e => setBookForm({ ...bookForm, pages: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>11. Stock Quantity *</label>
                  <input required type="number" value={bookForm.stock} onChange={e => setBookForm({ ...bookForm, stock: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>12. Publisher Name *</label>
                  <input required type="text" value={bookForm.publisher} onChange={e => setBookForm({ ...bookForm, publisher: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>13. Badge (e.g. New)</label>
                  <input type="text" value={bookForm.badge} onChange={e => setBookForm({ ...bookForm, badge: e.target.value })} placeholder="Leave empty for no tag" style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>14. Rating (Out of 5)</label>
                  <input type="number" step="0.1" max="5" min="0" value={bookForm.rating} onChange={e => setBookForm({ ...bookForm, rating: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>15. Verified Reviews</label>
                  <input type="number" value={bookForm.reviews} onChange={e => setBookForm({ ...bookForm, reviews: e.target.value })} style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>16. Availability</label>
                  <select value={bookForm.availability} onChange={e => setBookForm({ ...bookForm, availability: e.target.value })} style={adminSelectStyle}>
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, height: "42px", marginTop: "24px" }}>
                  <input 
                    type="checkbox" 
                    id="is_upcoming" 
                    checked={bookForm.is_upcoming} 
                    onChange={e => setBookForm({ ...bookForm, is_upcoming: e.target.checked })} 
                    style={{ width: "18px", height: "18px", cursor: "pointer" }} 
                  />
                  <label htmlFor="is_upcoming" style={{ fontSize: 13, fontWeight: 700, color: "#2D1B10", cursor: "pointer" }}>Is Upcoming Book</label>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>Upcoming Release Date / Label</label>
                  <input 
                    type="text" 
                    value={bookForm.release_date} 
                    onChange={e => setBookForm({ ...bookForm, release_date: e.target.value })} 
                    placeholder="e.g. July 2026 or Coming Soon" 
                    style={adminInputStyle} 
                    disabled={!bookForm.is_upcoming}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>17. Front Cover Image</label>
                  <input name="frontCover" type="file" accept="image/*" style={{ ...adminInputStyle, padding: "8px 14px" }} />
                  {editingBook && editingBook.frontCover && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "#6B7280" }}>Current front cover:</span>
                      <img src={editingBook.frontCover} alt="front preview" style={{ display: "block", height: 50, borderRadius: 4, marginTop: 4 }} />
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>18. Back Cover Image</label>
                  <input name="backCover" type="file" accept="image/*" style={{ ...adminInputStyle, padding: "8px 14px" }} />
                  {editingBook && editingBook.backCover && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "#6B7280" }}>Current back cover:</span>
                      <img src={editingBook.backCover} alt="back preview" style={{ display: "block", height: 50, borderRadius: 4, marginTop: 4 }} />
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>19. Amazon Link</label>
                  <input type="url" value={bookForm.amazonLink} onChange={e => setBookForm({ ...bookForm, amazonLink: e.target.value })} placeholder="https://amazon.in/..." style={adminInputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>20. Flipkart Link</label>
                  <input type="url" value={bookForm.flipkartLink} onChange={e => setBookForm({ ...bookForm, flipkartLink: e.target.value })} placeholder="https://flipkart.com/..." style={adminInputStyle} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>21. ONDC Link</label>
                  <input type="url" value={bookForm.ondcLink} onChange={e => setBookForm({ ...bookForm, ondcLink: e.target.value })} placeholder="https://www.ondc.org/..." style={adminInputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>22. Description (English)</label>
                <textarea rows={4} value={bookForm.description} onChange={e => setBookForm({ ...bookForm, description: e.target.value })} placeholder="Enter book description in English..." style={adminTextareaStyle}></textarea>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>23. Description (Hindi)</label>
                <textarea rows={4} value={bookForm.descriptionHindi} onChange={e => setBookForm({ ...bookForm, descriptionHindi: e.target.value })} placeholder="पुस्तक का संक्षिप्त विवरण हिंदी में दर्ज करें..." style={adminTextareaStyle}></textarea>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => { setShowAddBook(false); setEditingBook(null); }} style={{ padding: "12px 24px", background: "transparent", border: "1.5px solid rgba(115, 0, 0, 0.25)", borderRadius: 8, cursor: "pointer", fontWeight: 600, color: "#2D1B10" }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: "12px 32px" }}>Save Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEAM MEMBER MODAL */}
      {showAddTeam && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="animate-bounceIn" style={{ background: "#ffffff", border: "2px solid #2D1B10", width: "100%", maxWidth: 600, borderRadius: 24, padding: "32px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", color: "#1c1917" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#2D1B10" }}>{editingTeam ? "Edit Team Member" : "Add Team Member"}</h2>
              <button onClick={() => { setShowAddTeam(false); setEditingTeam(null); }} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);

              const fileToDataUrl = (file: File | null): Promise<string> => {
                if (!file || file.size === 0) return Promise.resolve("");
                return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                });
              };

              const imageFile = fd.get("teamImage") as File;
              const imageBase64 = await fileToDataUrl(imageFile);

              let image = teamForm.image;

              try {
                if (imageBase64) {
                  image = await uploadImageToCloudinary(imageBase64);
                }
              } catch (err) {
                alert("❌ Image upload to Cloudinary failed.");
                return;
              }

              const payload = {
                name: teamForm.name,
                role: teamForm.role,
                image,
                description: teamForm.description,
                category: teamForm.category
              };

              try {
                const url = editingTeam ? `${API_BASE_URL}/team-members/${editingTeam.id}` : `${API_BASE_URL}/team-members`;
                const method = editingTeam ? "PUT" : "POST";
                const response = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload)
                });

                if (!response.ok) {
                  alert("Failed to save team member");
                  return;
                }

                fetch(`${API_BASE_URL}/team-members`)
                  .then(r => r.json())
                  .then(setTeamMembers);

                setShowAddTeam(false);
                setEditingTeam(null);
                alert(editingTeam ? "Team Member Updated!" : "Team Member Added!");
              } catch (err) {
                console.error(err);
                alert("Failed to save team member");
              }
            }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>Full Name *</label>
                <input required type="text" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} style={adminInputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>Role / Position *</label>
                <input required type="text" value={teamForm.role} onChange={e => setTeamForm({ ...teamForm, role: e.target.value })} style={adminInputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>Category *</label>
                <select value={teamForm.category} onChange={e => setTeamForm({ ...teamForm, category: e.target.value })} style={adminSelectStyle}>
                  <option>Editorial Team</option>
                  <option>Design Team</option>
                  <option>Marketing Team</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>Profile Picture</label>
                <input name="teamImage" type="file" accept="image/*" style={{ ...adminInputStyle, padding: "8px 14px" }} />
                {editingTeam && editingTeam.image && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: "#6B7280" }}>Current image:</span>
                    <img src={editingTeam.image} alt="team preview" style={{ display: "block", width: 50, height: 50, borderRadius: "50%", objectFit: "cover", marginTop: 4 }} />
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>Short Description *</label>
                <textarea required rows={3} value={teamForm.description} onChange={e => setTeamForm({ ...teamForm, description: e.target.value })} placeholder="Tell us about their role and background..." style={adminTextareaStyle}></textarea>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => { setShowAddTeam(false); setEditingTeam(null); }} style={{ padding: "12px 24px", background: "transparent", border: "1.5px solid rgba(115, 0, 0, 0.25)", borderRadius: 8, cursor: "pointer", fontWeight: 600, color: "#2D1B10" }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: "12px 32px" }}>Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT TESTIMONIAL MODAL */}
      {showAddTestimonial && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="animate-bounceIn" style={{ background: "#ffffff", border: "2px solid #2D1B10", width: "100%", maxWidth: 500, borderRadius: 24, padding: "32px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", color: "#1c1917" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#2D1B10" }}>{editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}</h2>
              <button onClick={() => { setShowAddTestimonial(false); setEditingTestimonial(null); }} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault();
              try {
                const method = editingTestimonial ? "PUT" : "POST";
                const url = editingTestimonial ? `${API_BASE_URL}/testimonials/${editingTestimonial.id}` : `${API_BASE_URL}/testimonials`;

                const response = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(newTestimonial)
                });

                if (response.ok) {
                  if (refreshTestimonials) refreshTestimonials();
                  setShowAddTestimonial(false);
                  setEditingTestimonial(null);
                  alert(editingTestimonial ? "Testimonial Updated!" : "Testimonial Added!");
                } else {
                  alert("Failed to save testimonial");
                }
              } catch (err) {
                alert("Failed to connect to backend!");
              }
            }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>Author Name *</label>
                <input required type="text" value={newTestimonial.name} onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })} style={adminInputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>Role / Title (e.g. Writer, Reader) *</label>
                <input required type="text" value={newTestimonial.role} onChange={e => setNewTestimonial({ ...newTestimonial, role: e.target.value })} style={adminInputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>Rating (Stars) *</label>
                <select value={newTestimonial.rating} onChange={e => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })} style={adminSelectStyle}>
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B10", marginBottom: 6 }}>Review Content *</label>
                <textarea required rows={4} value={newTestimonial.text} onChange={e => setNewTestimonial({ ...newTestimonial, text: e.target.value })} placeholder="Write their testimonial..." style={adminTextareaStyle}></textarea>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => { setShowAddTestimonial(false); setEditingTestimonial(null); }} style={{ padding: "12px 24px", background: "transparent", border: "1.5px solid rgba(212, 175, 55, 0.25)", borderRadius: 8, cursor: "pointer", fontWeight: 600, color: "#2D1B10" }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: "12px 32px" }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
