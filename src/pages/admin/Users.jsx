import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, Search } from "lucide-react";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

const badge = (status) => {
  const map = {
    ACTIVE: { bg: "#dcfce7", color: "#16a34a", label: "Aktif" },
    PENDING: { bg: "#fef9c3", color: "#ca8a04", label: "Menunggu" },
    REJECTED: { bg: "#fee2e2", color: "#dc2626", label: "Ditolak" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      {s.label}
    </span>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchUsers = () => {
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, username, email, status, created_at")
      .eq("role", "USER")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Gagal memuat data pengguna");
        else setUsers(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Gagal memperbarui status");
      return;
    }
    toast.success(
      status === "ACTIVE" ? "Pengguna dikonfirmasi" : "Pengguna ditolak",
    );
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!confirm("Hapus pengguna ini?")) return;
    const { error } = await supabase.functions.invoke("delete-user", {
      body: { userId: id },
    });
    if (error) {
      toast.error("Gagal menghapus pengguna");
      return;
    }
    toast.success("Pengguna dihapus");
    fetchUsers();
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || u.status === filter;
    return matchSearch && matchFilter;
  });

  const filterBtns = ["ALL", "PENDING", "ACTIVE", "REJECTED"];

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
          Pengguna
        </h1>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
          Kelola akun pengguna dan konfirmasi registrasi
        </p>
      </div>

      {/* Filter & Search */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              outline: "none",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {filterBtns.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "500",
                border: "1px solid",
                cursor: "pointer",
                background: filter === f ? "#0f172a" : "white",
                color: filter === f ? "white" : "#64748b",
                borderColor: filter === f ? "#0f172a" : "#e2e8f0",
              }}
            >
              {f === "ALL"
                ? "Semua"
                : f === "PENDING"
                  ? "Menunggu"
                  : f === "ACTIVE"
                    ? "Aktif"
                    : "Ditolak"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}
          >
            Memuat data...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}
          >
            Tidak ada pengguna ditemukan
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {["Username", "Email", "Status", "Bergabung", "Aksi"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom:
                      i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "13px",
                          fontWeight: "700",
                          flexShrink: 0,
                        }}
                      >
                        {user.username[0].toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#0f172a",
                        }}
                      >
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    {user.email}
                  </td>
                  <td style={{ padding: "14px 16px" }}>{badge(user.status)}</td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: "13px",
                      color: "#94a3b8",
                    }}
                  >
                    {new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {user.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => updateStatus(user.id, "ACTIVE")}
                            title="Konfirmasi"
                            style={{
                              background: "#dcfce7",
                              border: "none",
                              borderRadius: "8px",
                              padding: "6px 8px",
                              cursor: "pointer",
                              color: "#16a34a",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => updateStatus(user.id, "REJECTED")}
                            title="Tolak"
                            style={{
                              background: "#fee2e2",
                              border: "none",
                              borderRadius: "8px",
                              padding: "6px 8px",
                              cursor: "pointer",
                              color: "#dc2626",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {user.status === "REJECTED" && (
                        <button
                          onClick={() => updateStatus(user.id, "ACTIVE")}
                          title="Aktifkan"
                          style={{
                            background: "#dcfce7",
                            border: "none",
                            borderRadius: "8px",
                            padding: "6px 8px",
                            cursor: "pointer",
                            color: "#16a34a",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id)}
                        title="Hapus"
                        style={{
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 8px",
                          cursor: "pointer",
                          color: "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
