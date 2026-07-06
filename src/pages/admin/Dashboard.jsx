import { useState, useEffect } from "react";
import { Users, Database, Cpu, AlertCircle } from "lucide-react";
import { supabase } from "../../services/supabase";

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div
    style={{
      background: "white",
      borderRadius: "16px",
      padding: "24px",
      border: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }}
  >
    <div
      style={{
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={24} color={color} />
    </div>
    <div>
      <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>
        {value}
      </div>
      <div style={{ fontSize: "14px", color: "#64748b" }}>{label}</div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .rpc("dashboard_stats")
      .then(({ data, error }) =>
        setStats(
          error
            ? {
                totalUsers: 0,
                pendingUsers: 0,
                totalDatasets: 0,
                totalModels: 0,
              }
            : data,
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "200px",
        }}
      >
        <div style={{ color: "#64748b" }}>Memuat data...</div>
      </div>
    );

  const cards = [
    {
      icon: Users,
      label: "Total Pengguna",
      value: stats?.totalUsers ?? 0,
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      icon: AlertCircle,
      label: "Menunggu Konfirmasi",
      value: stats?.pendingUsers ?? 0,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
    {
      icon: Database,
      label: "Total Dataset",
      value: stats?.totalDatasets ?? 0,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      icon: Cpu,
      label: "Total Model AI",
      value: stats?.totalModels ?? 0,
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#0f172a",
            margin: 0,
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
          Selamat datang di panel administrasi
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {cards.map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </div>

      {/* Label Distribution */}
      {stats?.labelCounts?.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#0f172a",
              marginBottom: "16px",
            }}
          >
            Distribusi Klasifikasi
          </h2>
          {stats.labelCounts.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "120px",
                  fontSize: "13px",
                  color: "#374151",
                  fontWeight: "500",
                }}
              >
                {item.result_label || "Belum diproses"}
              </div>
              <div
                style={{
                  flex: 1,
                  background: "#f1f5f9",
                  borderRadius: "99px",
                  height: "8px",
                }}
              >
                <div
                  style={{
                    width: `${Math.min((item.count / (stats.totalDatasets || 1)) * 100, 100)}%`,
                    height: "100%",
                    borderRadius: "99px",
                    background:
                      item.result_label === "LONGSOR"
                        ? "#ef4444"
                        : item.result_label === "KEKERINGAN"
                          ? "#f59e0b"
                          : "#94a3b8",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  width: "30px",
                  textAlign: "right",
                }}
              >
                {item.count}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}