import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  History,
  Mail,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Beranda", icon: LayoutDashboard, end: true },
  { to: "/dashboard/riwayat", label: "Riwayat", icon: History },
  { to: "/dashboard/kontak", label: "Kontak", icon: Mail },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

const glass = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.15)",
};

export default function UserLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
        position: "relative",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "fixed",
          top: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(59,130,246,0.15)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(139,92,246,0.1)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Navbar */}
      <nav
        style={{
          ...glass,
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>🌍</span>
          <span style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>
            Bencana AI
          </span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: "4px" }} className="desktop-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={{ textDecoration: "none" }}
            >
              {({ isActive }) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: isActive
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                    color: isActive ? "white" : "rgba(255,255,255,0.6)",
                    fontSize: "14px",
                    fontWeight: isActive ? "600" : "400",
                    transition: "all 0.15s",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={16} />
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              ...glass,
              borderRadius: "10px",
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span
              style={{ color: "white", fontSize: "13px", fontWeight: "500" }}
            >
              {user?.username}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              ...glass,
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: "10px",
              padding: "8px 14px",
              color: "#f87171",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(248,113,113,0.1)",
            }}
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </nav>

      {/* Content */}
      <main
        style={{ padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" }}
      >
        <Outlet />
      </main>
    </div>
  );
}