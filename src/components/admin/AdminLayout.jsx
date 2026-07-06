import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Database,
  Cpu,
  Users,
  Activity,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/dataset", label: "Dataset", icon: Database },
  { to: "/admin/models", label: "Model AI", icon: Cpu },
  { to: "/admin/users", label: "Pengguna", icon: Users },
  { to: "/admin/activities", label: "Aktivitas", icon: Activity },
  { to: "/admin/messages", label: "Pesan", icon: MessageSquare },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? "72px" : "240px",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s ease",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "18px",
            }}
          >
            🌍
          </div>
          {!collapsed && (
            <div>
              <div
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: "14px",
                  lineHeight: 1.2,
                }}
              >
                Bencana AI
              </div>
              <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                Admin Panel
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
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
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    marginBottom: "4px",
                    background: isActive
                      ? "rgba(59,130,246,0.15)"
                      : "transparent",
                    color: isActive ? "#60a5fa" : "#94a3b8",
                    transition: "all 0.15s",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: isActive ? "600" : "400",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>
                  )}
                  {!collapsed && isActive && (
                    <ChevronRight size={14} style={{ marginLeft: "auto" }} />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div
          style={{
            padding: "12px 8px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {!collapsed && (
            <div
              style={{
                padding: "10px 12px",
                marginBottom: "8px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{ color: "white", fontSize: "13px", fontWeight: "600" }}
              >
                {user?.username}
              </div>
              <div style={{ color: "#64748b", fontSize: "11px" }}>
                {user?.email}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "transparent",
              border: "none",
              color: "#f87171",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          marginLeft: collapsed ? "72px" : "240px",
          flex: 1,
          transition: "margin-left 0.25s ease",
          minHeight: "100vh",
        }}
      >
        {/* Topbar */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 24px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              padding: "6px",
            }}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span
              style={{ fontSize: "14px", color: "#374151", fontWeight: "500" }}
            >
              {user?.username}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}