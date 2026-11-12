import { useState, useRef } from "react";
import logoImg from "@/imports/Logo.jpeg";
import dashboardWelcomeImg from "@/imports/DashboardWelcome.jpeg";

// ─── Types ────────────────────────────────────────────────────────────────────
type View = "login" | "dashboard" | "promos" | "gallery" | "feedback" | "settings";
type Theme = "light" | "dark";

interface User { name: string; email: string; role: string; photo?: string; }
interface Inquiry { id: number; name: string; destination: string; date: string; status: "New" | "In Progress" | "Resolved"; }
interface Promo { id: number; title: string; destination: string; discount: string; validUntil: string; active: boolean; photo?: string; }
interface GalleryPhoto { id: number; url: string; caption: string; category: string; }
interface Feedback { id: number; guest: string; rating: number; comment: string; date: string; approved: boolean; screenshot?: string; }

// ─── Seed data ─────────────────────────────────────────────────────────────────
const seedInquiries: Inquiry[] = [];

const seedPromos: Promo[] = [
  { id: 1, title: "Summer Escape Package", destination: "Palawan", discount: "20% off", validUntil: "2026-10-31", active: true },
  { id: 2, title: "Asia Explorer Bundle", destination: "Japan + Korea", discount: "₱5,000 off", validUntil: "2026-11-15", active: true },
  { id: 3, title: "Honeymoon Special", destination: "Bali, Indonesia", discount: "15% off", validUntil: "2026-09-30", active: false },
];

const seedGallery: GalleryPhoto[] = [
  { id: 1, url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=450&fit=crop&auto=format", caption: "Palawan Underground River", category: "Destinations" },
  { id: 2, url: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=600&h=450&fit=crop&auto=format", caption: "Boracay White Beach", category: "Beaches" },
  { id: 3, url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=450&fit=crop&auto=format", caption: "Tokyo City Lights", category: "International" },
  { id: 4, url: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&h=450&fit=crop&auto=format", caption: "Bali Rice Terraces", category: "International" },
  { id: 5, url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600&h=450&fit=crop&auto=format", caption: "Siargao Surfing", category: "Adventure" },
  { id: 6, url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=450&fit=crop&auto=format", caption: "Luxury Resort Stay", category: "Accommodations" },
];

const seedFeedback: Feedback[] = [
  { id: 1, guest: "Maria Santos", rating: 5, comment: "World Viewcation made our Palawan trip unforgettable! Every detail was perfectly arranged.", date: "2026-08-28", approved: true },
  { id: 2, guest: "James Tan", rating: 4, comment: "Great service and very responsive team. The Japan package was well-organized.", date: "2026-08-20", approved: true },
  { id: 3, guest: "Lea Bautista", rating: 5, comment: "Best travel agency in Laguna! They handled everything from visa to hotel. Highly recommend.", date: "2026-09-01", approved: false },
];

// ─── Icons ──────────────────────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Tag: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  Image: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  MessageSquare: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  ),
  Eye: () => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Check: () => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Star: ({ filled }: { filled: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#e07b20" : "none"} stroke="#e07b20" strokeWidth={2}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
    </svg>
  ),
  Globe: () => (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  Plane: () => (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-1-5.5.5L10 6 1.8 4.2l-1 1.7L9 11 6 14H3l-1 1.5 3 1.5 1.5 3L8 19l1.5-1L9 15l3-3 5 6.2 1.8-1z"/>
    </svg>
  ),
  Users: () => (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  EyeOpen: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  ),
};

// ─── Login Page ──────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email === "admin@viewcation.com" && password === "admin123") {
        onLogin({ name: "Admin User", email, role: "Administrator" });
      } else {
        setError("Invalid credentials. Try admin@viewcation.com / admin123");
      }
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e4f91 0%, #2563b0 50%, #3b9ede 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ position: "absolute", borderRadius: "50%", background: "rgba(255,255,255,0.04)", width: `${120 + i * 80}px`, height: `${120 + i * 80}px`, top: `${10 + i * 12}%`, left: `${-5 + i * 18}%` }} />
        ))}
      </div>
      <div style={{ width: "100%", maxWidth: "440px", position: "relative" }}>
        {/* Logo card */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <img src={logoImg} alt="World Viewcation Travel & Tours logo" style={{ width: "110px", height: "110px", borderRadius: "20px", objectFit: "cover", border: "3px solid rgba(255,255,255,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }} />
            <div>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "18px", color: "white", lineHeight: 1.2 }}>World Viewcation</div>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: "13px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Travel & Tours</div>
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "20px", padding: "36px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "22px", fontWeight: 700, color: "#1a2e4a", marginBottom: "4px" }}>Admin Sign In</h2>
          <p style={{ color: "#6b82a0", fontSize: "14px", marginBottom: "28px" }}>Access the admin dashboard</p>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", color: "#b91c1c", fontSize: "13px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handle}>
            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="admin@viewcation.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input className="form-input" type={showPw ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: "42px" }} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b82a0", display: "flex", alignItems: "center", padding: "2px" }}>
                  {showPw ? <Icon.EyeOff /> : <Icon.EyeOpen />}
                </button>
              </div>
            </div>
            <button className="btn-primary" type="submit" style={{ width: "100%", padding: "13px", fontSize: "15px" }} disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#6b82a0" }}>
            Need access?{" "}
            <a href="mailto:support@worldviewcationtravelandtours.com" style={{ color: "#1e4f91", fontWeight: 600, textDecoration: "none", fontFamily: "Poppins, sans-serif" }}>
              Contact support
            </a>
          </div>

          <div style={{ marginTop: "20px", padding: "12px 14px", background: "#f0f5fb", borderRadius: "10px", fontSize: "12px", color: "#6b82a0" }}>
            <strong>Demo credentials:</strong> admin@viewcation.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: Icon.Dashboard },
  { id: "promos", label: "Promo Creation", icon: Icon.Tag },
  { id: "gallery", label: "Gallery", icon: Icon.Image },
  { id: "feedback", label: "Guest Feedback", icon: Icon.MessageSquare },
  { id: "settings", label: "Settings", icon: Icon.Settings },
] as const;

function Sidebar({ view, setView, user, onLogout }: { view: View; setView: (v: View) => void; user: User; onLogout: () => void }) {
  return (
    <div style={{ width: "240px", minWidth: "240px", height: "100vh", background: "linear-gradient(180deg, #1a3d7c 0%, #1e4f91 60%, #1a4580 100%)", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 100, overflowY: "auto" }}>
      {/* Brand */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={logoImg} alt="Logo" style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }} />
          <div>
            <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "13px", color: "white", lineHeight: 1.3 }}>World Viewcation</div>
            <div style={{ fontFamily: "Poppins, sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em" }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <div style={{ fontFamily: "Poppins, sans-serif", fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px" }}>Main Menu</div>
        {NAV.map(({ id, label, icon: IconComp }) => (
          <button key={id} className={`sidebar-link ${view === id ? "active" : ""}`} style={{ width: "100%", border: "none", textAlign: "left", background: view === id ? "rgba(255,255,255,0.18)" : "transparent" }} onClick={() => setView(id as View)}>
            <span className="link-icon"><IconComp /></span>
            {label}
          </button>
        ))}
      </nav>

      {/* User & Logout */}
      <div style={{ padding: "16px 12px 24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 10px", marginBottom: "6px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(90,130,40,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "white", fontFamily: "Poppins, sans-serif", flexShrink: 0, overflow: "hidden" }}>
            {user.photo ? (
              <img src={user.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : user.name.charAt(0)}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{user.role}</div>
          </div>
        </div>
        <button className="sidebar-link" style={{ width: "100%", border: "none", background: "transparent" }} onClick={onLogout}>
          <span className="link-icon"><Icon.Logout /></span>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard Home ──────────────────────────────────────────────────────────────
function DashboardHome({ user, inquiries }: { user: User; inquiries: Inquiry[] }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const stats = [
    { label: "Inquiries Received", value: 0, note: "Today", icon: Icon.Mail, color: "#1e4f91", background: "#e8f4fd" },
    { label: "Total Inquiries", value: 0, note: "All time", icon: Icon.Users, color: "#5a8228", background: "#edf4e0" },
    { label: "Active Promos", value: 0, note: "Currently live", icon: Icon.Tag, color: "#e07b20", background: "#fff4e8" },
    { label: "Published Feedback", value: 0, note: "Guest testimonials", icon: Icon.MessageSquare, color: "#2563b0", background: "#eaf2ff" },
  ];

  const statusColor = (s: string) => s === "New" ? { bg: "#e8f4fd", color: "#1e4f91" } : s === "In Progress" ? { bg: "#edf4e0", color: "#5a8228" } : { bg: "#f0fdf4", color: "#166534" };

  return (
    <div>
      {/* Greeting */}
      <div style={{
        backgroundColor: "#073f90",
        backgroundImage: `linear-gradient(90deg, rgba(4,42,96,0.98) 0%, rgba(4,42,96,0.9) 42%, rgba(4,42,96,0.12) 72%), url(${dashboardWelcomeImg})`,
        backgroundSize: "100% 100%, auto 100%",
        backgroundPosition: "center, right center",
        backgroundRepeat: "no-repeat",
        borderRadius: "20px",
        padding: "32px 36px",
        marginBottom: "28px",
        minHeight: "270px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <div style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.78)", marginBottom: "6px" }}>
          {greeting}, {user.name.split(" ")[0]} 👋
        </div>
        <h1 style={{ fontFamily: "Poppins, sans-serif", fontSize: "28px", fontWeight: 800, color: "white", marginBottom: "8px", lineHeight: 1.2 }}>
          Welcome back to<br />Viewcation Admin
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px" }}>
          Here's what's happening with your travel inquiries today.
        </p>
        <div style={{ marginTop: "35px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "6px 14px" }}>
          <span style={{ width: "8px", height: "8px", background: "#7ee07a", borderRadius: "50%", display: "inline-block" }} />
          <span style={{ color: "white", fontSize: "13px", fontFamily: "Poppins, sans-serif" }}>Dashboard is live</span>
        </div>
      </div>

      {/* Status overview */}
      <div className="status-grid" aria-label="Dashboard status overview">
        {stats.map(({ label, value, note, icon: StatIcon, color, background }) => (
          <div key={label} className="stat-card status-card">
            <div className="status-icon" style={{ color, background }}>
              <StatIcon />
            </div>
            <div>
              <div className="status-label">{label}</div>
              <div className="status-value">{value}</div>
              <div className="status-note">{note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Inquiries Table */}
      <div className="section-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "17px", fontWeight: 700, color: "#1a2e4a" }}>Recent Inquiries</h2>
          <span style={{ fontSize: "12px", color: "#6b82a0" }}>Last 7 days</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #d4e2f0" }}>
                {["Guest Name", "Destination", "Date", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#6b82a0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inquiries.map(inq => {
                const sc = statusColor(inq.status);
                return (
                  <tr key={inq.id} style={{ borderBottom: "1px solid #f0f5fb", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fbff")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "13px 12px", fontWeight: 600, fontSize: "14px", color: "#1a2e4a" }}>{inq.name}</td>
                    <td style={{ padding: "13px 12px", fontSize: "14px", color: "#6b82a0" }}>{inq.destination}</td>
                    <td style={{ padding: "13px 12px", fontSize: "13px", color: "#6b82a0" }}>{new Date(inq.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td style={{ padding: "13px 12px" }}>
                      <span className="badge" style={{ background: sc.bg, color: sc.color }}>{inq.status}</span>
                    </td>
                  </tr>
                );
              })}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "42px 16px", textAlign: "center" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#e8f4fd", color: "#1e4f91", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                      <Icon.Mail />
                    </div>
                    <div style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 600, color: "#1a2e4a" }}>No inquiries yet</div>
                    <div style={{ fontSize: "12px", color: "#6b82a0", marginTop: "3px" }}>New guest inquiries will appear here.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Promo Creation ──────────────────────────────────────────────────────────────
function PromosPanel() {
  const [promos, setPromos] = useState<Promo[]>(seedPromos);
  const [form, setForm] = useState({ title: "", destination: "", discount: "", validUntil: "", photo: "" });
  const [showForm, setShowForm] = useState(false);
  const [photoName, setPhotoName] = useState("");
  const [photoError, setPhotoError] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.destination || !form.discount || !form.validUntil) return;
    setPromos(p => [...p, { ...form, id: Date.now(), active: true }]);
    setForm({ title: "", destination: "", discount: "", validUntil: "", photo: "" });
    setPhotoName("");
    setPhotoError("");
    if (photoRef.current) photoRef.current.value = "";
    setShowForm(false);
  };

  const uploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setPhotoError("Please choose a PNG, JPG, or WEBP image.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("The promo photo must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      setForm(current => ({ ...current, photo: event.target?.result as string }));
      setPhotoName(file.name);
    };
    reader.onerror = () => setPhotoError("We couldn't read that image. Please try another file.");
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setForm(current => ({ ...current, photo: "" }));
    setPhotoName("");
    setPhotoError("");
    if (photoRef.current) photoRef.current.value = "";
  };

  const toggle = (id: number) => setPromos(p => p.map(pr => pr.id === id ? { ...pr, active: !pr.active } : pr));
  const remove = (id: number) => setPromos(p => p.filter(pr => pr.id !== id));
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "22px", fontWeight: 700, color: "#1a2e4a" }}>Promo Creation</h2>
          <p style={{ color: "#6b82a0", fontSize: "14px", marginTop: "4px" }}>Manage travel promotions displayed on the website</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon.Plus /> {showForm ? "Cancel" : "Add Promo"}
        </button>
      </div>

      {showForm && (
        <div className="section-card" style={{ marginBottom: "24px", borderTop: "3px solid #1e4f91" }}>
          <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "16px", color: "#1a2e4a", marginBottom: "20px" }}>New Promotion</h3>
          <form onSubmit={add}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label className="form-label">Promo Title</label>
                <input className="form-input" placeholder="e.g. Summer Escape Package" value={form.title} onChange={set("title")} />
              </div>
              <div>
                <label className="form-label">Destination</label>
                <input className="form-input" placeholder="e.g. Palawan, Philippines" value={form.destination} onChange={set("destination")} />
              </div>
              <div>
                <label className="form-label">Discount / Offer</label>
                <input className="form-input" placeholder="e.g. 20% off or ₱3,000 off" value={form.discount} onChange={set("discount")} />
              </div>
              <div>
                <label className="form-label">Valid Until</label>
                <input className="form-input" type="date" value={form.validUntil} onChange={set("validUntil")} />
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">
                Promo Photo <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                ref={photoRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={uploadPhoto}
                style={{ display: "none" }}
              />
              {form.photo ? (
                <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "14px", border: "1.5px solid #d4e2f0", borderRadius: "12px", background: "#f8fbff" }}>
                  <img src={form.photo} alt="Selected promo preview" style={{ width: "144px", height: "90px", objectFit: "cover", borderRadius: "8px", border: "1px solid #d4e2f0", background: "white" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 600, color: "#1a2e4a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{photoName}</div>
                    <div style={{ fontSize: "12px", color: "#6b82a0", marginTop: "3px" }}>Photo ready to attach</div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <button type="button" className="btn-outline" onClick={() => photoRef.current?.click()} style={{ padding: "6px 12px", fontSize: "11px" }}>Replace</button>
                      <button type="button" onClick={removePhoto} style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: "#fef2f2", color: "#b91c1c", fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>Remove</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  style={{ width: "100%", padding: "22px", borderRadius: "12px", border: "1.5px dashed #8fc8eb", background: "#f8fbff", color: "#1e4f91", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", fontFamily: "Poppins, sans-serif" }}
                >
                  <Icon.Upload />
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>Upload promo photo</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 400, color: "#6b82a0" }}>PNG, JPG, or WEBP up to 5 MB</span>
                </button>
              )}
              {photoError && <div role="alert" style={{ color: "#b91c1c", fontSize: "12px", marginTop: "7px" }}>{photoError}</div>}
            </div>
            <button className="btn-primary" type="submit">Save Promotion</button>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gap: "14px" }}>
        {promos.map(promo => (
          <div key={promo.id} className="section-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
              {promo.photo ? (
                <img src={promo.photo} alt={`${promo.title} promo`} style={{ width: "76px", height: "58px", borderRadius: "10px", objectFit: "cover", border: "1px solid #d4e2f0", flexShrink: 0 }} />
              ) : (
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: promo.active ? "#e8f4fd" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: promo.active ? "#1e4f91" : "#94a3b8", flexShrink: 0 }}>
                  <Icon.Tag />
                </div>
              )}
              <div>
                <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "15px", color: "#1a2e4a" }}>{promo.title}</div>
                <div style={{ fontSize: "13px", color: "#6b82a0", marginTop: "3px" }}>{promo.destination} · <strong style={{ color: "#5a8228" }}>{promo.discount}</strong> · Valid until {new Date(promo.validUntil).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="badge" style={{ background: promo.active ? "#edf4e0" : "#f1f5f9", color: promo.active ? "#5a8228" : "#94a3b8" }}>
                {promo.active ? "Active" : "Inactive"}
              </span>
              <button onClick={() => toggle(promo.id)} className="btn-outline" style={{ padding: "7px 14px", fontSize: "12px" }}>
                {promo.active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => remove(promo.id)} style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "#b91c1c", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fef2f2")}>
                <Icon.Trash />
              </button>
            </div>
          </div>
        ))}
        {promos.length === 0 && (
          <div className="section-card" style={{ textAlign: "center", padding: "48px", color: "#6b82a0" }}>
            <div style={{ fontSize: "14px" }}>No promotions yet. Add your first promo above.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Gallery Management ──────────────────────────────────────────────────────────
function GalleryPanel() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(seedGallery);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ url: "", caption: "", category: "Destinations" });
  const [filter, setFilter] = useState("All");
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = ["All", "Destinations", "Beaches", "International", "Adventure", "Accommodations"];
  const filtered = filter === "All" ? photos : photos.filter(p => p.category === filter);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.caption) return;
    const url = form.url || `https://images.unsplash.com/photo-${Date.now() % 1000000000}?w=600&h=450&fit=crop`;
    setPhotos(p => [...p, { id: Date.now(), url, caption: form.caption, category: form.category }]);
    setForm({ url: "", caption: "", category: "Destinations" });
    setShowForm(false);
  };

  const remove = (id: number) => setPhotos(p => p.filter(ph => ph.id !== id));
  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "22px", fontWeight: 700, color: "#1a2e4a" }}>Gallery Management</h2>
          <p style={{ color: "#6b82a0", fontSize: "14px", marginTop: "4px" }}>Manage photos displayed on the website gallery</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon.Plus /> {showForm ? "Cancel" : "Add Photo"}
        </button>
      </div>

      {showForm && (
        <div className="section-card" style={{ marginBottom: "24px", borderTop: "3px solid #5a8228" }}>
          <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "16px", color: "#1a2e4a", marginBottom: "20px" }}>Add New Photo</h3>
          <form onSubmit={add}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label className="form-label">Caption</label>
                <input className="form-input" placeholder="e.g. Sunset at El Nido, Palawan" value={form.caption} onChange={setF("caption")} />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={setF("category")} style={{ cursor: "pointer" }}>
                  {categories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">Image URL (or leave blank for placeholder)</label>
              <input className="form-input" placeholder="https://images.unsplash.com/..." value={form.url} onChange={setF("url")} />
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button className="btn-green" type="submit">Save Photo</button>
              <button type="button" className="btn-outline" onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon.Upload /> Upload from Device
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = ev => setForm(f => ({ ...f, url: ev.target?.result as string }));
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ padding: "7px 16px", borderRadius: "20px", border: "1.5px solid", fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
              background: filter === c ? "#1e4f91" : "white",
              color: filter === c ? "white" : "#6b82a0",
              borderColor: filter === c ? "#1e4f91" : "#d4e2f0"
            }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {filtered.map(photo => (
          <div key={photo.id} className="gallery-item">
            <img src={photo.url} alt={photo.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div className="gallery-overlay">
              <button onClick={() => remove(photo.id)}
                style={{ background: "rgba(185,28,28,0.85)", border: "none", borderRadius: "8px", padding: "8px 14px", color: "white", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
                <Icon.Trash /> Remove
              </button>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.65))", padding: "20px 14px 12px" }}>
              <div style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 600, color: "white" }}>{photo.caption}</div>
              <span style={{ fontSize: "11px", background: "rgba(30,79,145,0.75)", color: "white", padding: "2px 8px", borderRadius: "10px", marginTop: "4px", display: "inline-block" }}>{photo.category}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1" }}>
            <div className="section-card" style={{ textAlign: "center", padding: "48px", color: "#6b82a0" }}>No photos in this category.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Feedback Panel ──────────────────────────────────────────────────────────────
function FeedbackPanel() {
  const [items, setItems] = useState<Feedback[]>(seedFeedback);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ guest: "", rating: 5, comment: "", screenshot: "" });
  const [screenshotName, setScreenshotName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const screenshotRef = useRef<HTMLInputElement>(null);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guest || !form.comment) return;
    setItems(f => [...f, { ...form, id: Date.now(), date: new Date().toISOString().split("T")[0], approved: false }]);
    setForm({ guest: "", rating: 5, comment: "", screenshot: "" });
    setScreenshotName("");
    setUploadError("");
    if (screenshotRef.current) screenshotRef.current.value = "";
    setShowForm(false);
  };

  const uploadScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose a valid image file.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("The screenshot must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      setForm(current => ({ ...current, screenshot: event.target?.result as string }));
      setScreenshotName(file.name);
    };
    reader.onerror = () => setUploadError("We couldn't read that image. Please try another file.");
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setForm(current => ({ ...current, screenshot: "" }));
    setScreenshotName("");
    setUploadError("");
    if (screenshotRef.current) screenshotRef.current.value = "";
  };

  const toggleApproval = (id: number) => setItems(f => f.map(item => item.id === id ? { ...item, approved: !item.approved } : item));
  const remove = (id: number) => setItems(f => f.filter(item => item.id !== id));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "22px", fontWeight: 700, color: "#1a2e4a" }}>Guest Feedback</h2>
          <p style={{ color: "#6b82a0", fontSize: "14px", marginTop: "4px" }}>Manage and publish testimonials on the website</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon.Plus /> {showForm ? "Cancel" : "Add Feedback"}
        </button>
      </div>

      {showForm && (
        <div className="section-card" style={{ marginBottom: "24px", borderTop: "3px solid #e07b20" }}>
          <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "16px", color: "#1a2e4a", marginBottom: "20px" }}>Add Guest Feedback</h3>
          <form onSubmit={add}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label className="form-label">Guest Name</label>
                <input className="form-input" placeholder="e.g. Maria Santos" value={form.guest} onChange={e => setForm(f => ({ ...f, guest: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Rating (1–5)</label>
                <select className="form-input" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))} style={{ cursor: "pointer" }}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? "s" : ""}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">Comment / Testimonial</label>
              <textarea className="form-input" placeholder="Enter the guest's feedback..." rows={3} value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} style={{ resize: "vertical" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">
                Feedback Screenshot <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                ref={screenshotRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={uploadScreenshot}
                style={{ display: "none" }}
              />
              {form.screenshot ? (
                <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "14px", border: "1.5px solid #d4e2f0", borderRadius: "12px", background: "#f8fbff" }}>
                  <img src={form.screenshot} alt="Selected feedback screenshot preview" style={{ width: "128px", height: "86px", objectFit: "cover", borderRadius: "8px", border: "1px solid #d4e2f0", background: "white" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 600, color: "#1a2e4a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{screenshotName}</div>
                    <div style={{ fontSize: "12px", color: "#6b82a0", marginTop: "3px" }}>Screenshot ready to attach</div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <button type="button" className="btn-outline" onClick={() => screenshotRef.current?.click()} style={{ padding: "6px 12px", fontSize: "11px" }}>Replace</button>
                      <button type="button" onClick={removeScreenshot} style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: "#fef2f2", color: "#b91c1c", fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>Remove</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => screenshotRef.current?.click()}
                  style={{ width: "100%", padding: "22px", borderRadius: "12px", border: "1.5px dashed #8fc8eb", background: "#f8fbff", color: "#1e4f91", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", fontFamily: "Poppins, sans-serif" }}
                >
                  <Icon.Upload />
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>Upload feedback screenshot</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 400, color: "#6b82a0" }}>PNG, JPG, or WEBP up to 5 MB</span>
                </button>
              )}
              {uploadError && <div role="alert" style={{ color: "#b91c1c", fontSize: "12px", marginTop: "7px" }}>{uploadError}</div>}
            </div>
            <button className="btn-primary" type="submit">Save Feedback</button>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gap: "14px" }}>
        {items.map(item => (
          <div key={item.id} className="section-card" style={{ borderLeft: `4px solid ${item.approved ? "#5a8228" : "#d4e2f0"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "15px", color: "#1e4f91", flexShrink: 0 }}>
                    {item.guest.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "15px", color: "#1a2e4a" }}>{item.guest}</div>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1,2,3,4,5].map(s => <Icon.Star key={s} filled={s <= item.rating} />)}
                    </div>
                  </div>
                  <span className="badge" style={{ marginLeft: "auto", background: item.approved ? "#edf4e0" : "#fef9e7", color: item.approved ? "#5a8228" : "#92400e" }}>
                    {item.approved ? "Published" : "Pending"}
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "8px" }}>"{item.comment}"</p>
                {item.screenshot && (
                  <div style={{ margin: "12px 0" }}>
                    <div style={{ fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 600, color: "#6b82a0", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Feedback screenshot</div>
                    <img src={item.screenshot} alt={`Feedback screenshot from ${item.guest}`} style={{ display: "block", width: "220px", maxWidth: "100%", height: "132px", objectFit: "cover", borderRadius: "10px", border: "1px solid #d4e2f0", background: "#f8fbff" }} />
                  </div>
                )}
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Submitted {new Date(item.date).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button onClick={() => toggleApproval(item.id)} className="btn-outline" style={{ padding: "7px 14px", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                  {item.approved ? <><Icon.Eye /> Hide</> : <><Icon.Check /> Publish</>}
                </button>
                <button onClick={() => remove(item.id)} style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "#b91c1c" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#fef2f2")}>
                  <Icon.Trash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Panel ──────────────────────────────────────────────────────────────
function SettingsPanel({ user, onUpdate, theme, onThemeChange }: { user: User; onUpdate: (u: User) => void; theme: Theme; onThemeChange: (t: Theme) => void }) {
  const [profile, setProfile] = useState({ name: user.name, email: user.email, phone: "09084175922", role: user.role, photo: user.photo || "" });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [tab, setTab] = useState<"profile" | "security" | "theme">("profile");
  const photoRef = useRef<HTMLInputElement>(null);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...user, name: profile.name, email: profile.email, role: profile.role, photo: profile.photo });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const uploadProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setPhotoError("Please choose a PNG, JPG, or WEBP image.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("The profile picture must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = event => setProfile(current => ({ ...current, photo: event.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const tabs: { id: typeof tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "theme", label: "Theme" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "22px", fontWeight: 700, color: "#1a2e4a" }}>Settings</h2>
        <p style={{ color: "#6b82a0", fontSize: "14px", marginTop: "4px" }}>Manage your account preferences</p>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "white", borderRadius: "12px", padding: "6px", border: "1px solid #d4e2f0", width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 500, transition: "all 0.2s",
              background: tab === t.id ? "#1e4f91" : "transparent",
              color: tab === t.id ? "white" : "#6b82a0" }}>
            {t.label}
          </button>
        ))}
      </div>

      {saved && (
        <div style={{ background: "#edf4e0", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#166534", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon.Check /> Changes saved successfully.
        </div>
      )}

      {tab === "profile" && (
        <div className="section-card" style={{ maxWidth: "640px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px", paddingBottom: "24px", borderBottom: "1px solid #f0f5fb" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #1e4f91, #3b9ede)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 700, color: "white", fontFamily: "Poppins, sans-serif", overflow: "hidden", border: "3px solid white", boxShadow: "0 0 0 1px #d4e2f0" }}>
                {profile.photo ? (
                  <img src={profile.photo} alt="Profile preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : profile.name.charAt(0)}
              </div>
              <input
                ref={photoRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={uploadProfilePhoto}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                aria-label="Change profile picture"
                title="Change profile picture"
                style={{ position: "absolute", right: "-3px", bottom: "-2px", width: "27px", height: "27px", borderRadius: "50%", border: "2px solid white", background: "#1e4f91", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 7px rgba(30,79,145,0.3)", padding: 0 }}
              >
                <Icon.Plus />
              </button>
            </div>
            <div>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "18px", color: "#1a2e4a" }}>{profile.name}</div>
              <div style={{ color: "#6b82a0", fontSize: "14px" }}>{profile.role}</div>
              <button type="button" onClick={() => photoRef.current?.click()} style={{ background: "none", border: "none", color: "#1e4f91", fontFamily: "Poppins, sans-serif", fontSize: "12px", fontWeight: 600, cursor: "pointer", padding: "4px 0 0" }}>
                Change profile picture
              </button>
            </div>
          </div>
          {photoError && <div role="alert" style={{ color: "#b91c1c", fontSize: "12px", marginTop: "-16px", marginBottom: "20px" }}>{photoError}</div>}
          <form onSubmit={saveProfile}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select className="form-input" value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))} style={{ cursor: "pointer" }}>
                  <option>Staff</option><option>Manager</option><option>Administrator</option>
                </select>
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">Agency Name</label>
              <input className="form-input" value="World Viewcation Travel & Tours" disabled style={{ background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }} />
            </div>
            <button className="btn-primary" type="submit">Save Changes</button>
          </form>
        </div>
      )}

      {tab === "security" && (
        <div className="section-card" style={{ maxWidth: "480px" }}>
          <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "16px", color: "#1a2e4a", marginBottom: "20px" }}>Change Password</h3>
          <form onSubmit={e => { e.preventDefault(); if (passwords.next === passwords.confirm && passwords.next.length >= 6) { setPasswords({ current: "", next: "", confirm: "" }); setSaved(true); setTimeout(() => setSaved(false), 2500); } }}>
            {(["current", "next", "confirm"] as const).map((k, i) => (
              <div key={k} style={{ marginBottom: "16px" }}>
                <label className="form-label">{["Current Password", "New Password", "Confirm New Password"][i]}</label>
                <input className="form-input" type="password" value={passwords[k]} onChange={e => setPasswords(p => ({ ...p, [k]: e.target.value }))} placeholder={["Enter current password", "Min. 6 characters", "Repeat new password"][i]} />
              </div>
            ))}
            <button className="btn-primary" type="submit" style={{ marginTop: "8px" }}>Update Password</button>
          </form>
        </div>
      )}

      {tab === "theme" && (
        <div className="section-card" style={{ maxWidth: "480px" }}>
          <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "16px", color: "var(--text)", marginBottom: "8px" }}>Appearance</h3>
          <p style={{ fontSize: "13px", color: "#6b82a0", marginBottom: "24px" }}>Choose how the admin dashboard looks for you.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {([["light", "Light", "Clean white interface, easy on the eyes in bright environments."] , ["dark", "Dark", "Dark surfaces reduce glare and are great for low-light settings."]] as [Theme, string, string][]).map(([val, label, desc]) => (
              <button key={val} onClick={() => onThemeChange(val)}
                style={{ textAlign: "left", padding: "20px", borderRadius: "14px", cursor: "pointer", transition: "all 0.2s", border: `2px solid ${theme === val ? "#1e4f91" : "#d4e2f0"}`, background: theme === val ? "#e8f4fd" : "white" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: theme === val ? "#1e4f91" : "#f0f5fb", color: theme === val ? "white" : "#6b82a0" }}>
                  {val === "light" ? <Icon.Sun /> : <Icon.Moon />}
                </div>
                <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "15px", color: "#1a2e4a", marginBottom: "4px" }}>{label}</div>
                <div style={{ fontSize: "12px", color: "#6b82a0", lineHeight: 1.5 }}>{desc}</div>
                {theme === val && (
                  <div style={{ marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "4px", background: "#1e4f91", color: "white", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                    <Icon.Check /> Active
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── App Shell ───────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>("login");
  const [user, setUser] = useState<User | null>(null);
  const [inquiries] = useState<Inquiry[]>(seedInquiries);
  const [theme, setTheme] = useState<Theme>("light");

  const login = (u: User) => { setUser(u); setView("dashboard"); };
  const logout = () => { setUser(null); setView("login"); };

  const dark = theme === "dark";
  const bg = dark ? "#0f1c2e" : "#f0f5fb";
  const mainBg = dark ? "#0f1c2e" : "#f0f5fb";

  if (!user || view === "login") return <LoginPage onLogin={login} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: mainBg, colorScheme: dark ? "dark" : "light" }}>
      {dark && (
        <style>{`
          .section-card { background: #162032 !important; border-color: #1e3050 !important; }
          .stat-card { background: #162032 !important; border-color: #1e3050 !important; }
          .status-label, .status-note { color: #7a9ab8 !important; }
          .status-value { color: #e2eaf4 !important; }
          .form-input { background: #1a2d45 !important; border-color: #1e3050 !important; color: #e2eaf4 !important; }
          .form-label { color: #a8bdd4 !important; }
          table thead tr { border-color: #1e3050 !important; }
          table tbody tr { border-color: #1a2a40 !important; }
          table th { color: #6b8aaa !important; }
          table td { color: #c8d9ec !important; }
          h1, h2, h3, h4 { color: #e2eaf4 !important; }
          p { color: #7a9ab8; }
          .btn-outline { color: #7ab3e0 !important; border-color: #2a4a6e !important; }
          .btn-outline:hover { background: #1e4f91 !important; color: white !important; }
        `}</style>
      )}
      <Sidebar view={view} setView={setView} user={user} onLogout={logout} />
      <main style={{ marginLeft: "240px", flex: 1, padding: "32px 36px", minHeight: "100vh", overflowY: "auto", background: bg }}>
        <div style={{ maxWidth: "1100px" }}>
          {view === "dashboard" && <DashboardHome user={user} inquiries={inquiries} />}
          {view === "promos" && <PromosPanel />}
          {view === "gallery" && <GalleryPanel />}
          {view === "feedback" && <FeedbackPanel />}
          {view === "settings" && <SettingsPanel user={user} onUpdate={u => setUser(u)} theme={theme} onThemeChange={setTheme} />}
        </div>
      </main>
    </div>
  );
}
