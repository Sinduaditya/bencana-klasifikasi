import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

export default function AdminActivities() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("activity_logs")
      .select("*, profiles(username, email), datasets(original_name)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Gagal memuat aktivitas");
        else setLogs(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const downloadAll = async () => {
    try {
      const { data: datasets, error } = await supabase
        .from("datasets")
        .select("*, profiles(username)");
      if (error) throw error;
      const rows = [
        [
          "ID",
          "Nama File",
          "Pengguna",
          "Sumber",
          "Label",
          "Confidence",
          "Tanggal",
        ],
        ...datasets.map((d) => [
          d.id,
          d.original_name,
          d.profiles?.username || "-",
          d.source,
          d.result_label || "-",
          d.confidence_score
            ? (d.confidence_score * 100).toFixed(1) + "%"
            : "-",
          new Date(d.uploaded_at).toLocaleDateString("id-ID"),
        ]),
      ];
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dataset-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dataset berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh dataset");
    }
  };

  const actionLabel = {
    UPLOAD_DATASET: "Upload Dataset",
    PREDICT: "Klasifikasi",
    LOGIN: "Login",
    REGISTER: "Registrasi",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#0f172a",
              margin: 0,
            }}
          >
            Aktivitas
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
            Riwayat aktivitas pengguna
          </p>
        </div>
        <button
          onClick={downloadAll}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#0f172a",
            color: "white",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <Download size={16} /> Unduh Semua Dataset
        </button>
      </div>

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
            style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}
          >
            Memuat...
          </div>
        ) : logs.length === 0 ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}
          >
            Belum ada aktivitas
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
                {["Pengguna", "Aksi", "File", "Waktu"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom:
                      i < logs.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#0f172a",
                      }}
                    >
                      {log.profiles?.username}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {log.profiles?.email}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        padding: "3px 10px",
                        borderRadius: "99px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {actionLabel[log.action] || log.action}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    {log.datasets?.original_name || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    {new Date(log.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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