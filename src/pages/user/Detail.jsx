import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mountain, CloudRain } from "lucide-react";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

const glass = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "20px",
};

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("datasets")
      .select("*, ai_models(name)")
      .eq("id", id)
      .single()
      .then(async ({ data: row, error }) => {
        if (error || !row) {
          toast.error("Data tidak ditemukan");
          navigate("/dashboard/riwayat");
          return;
        }
        const { data: signed } = await supabase.storage
          .from("datasets")
          .createSignedUrl(row.file_path, 3600);
        setData({ ...row, signedUrl: signed?.signedUrl });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const labelInfo = {
    LONGSOR: {
      color: "#ef4444",
      bg: "rgba(239,68,68,0.15)",
      label: "Longsor",
      icon: <Mountain size={24} />,
    },
    KEKERINGAN: {
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.15)",
      label: "Kekeringan",
      icon: <CloudRain size={24} />,
    },
    TIDAK_TERKLASIFIKASI: {
      color: "#94a3b8",
      bg: "rgba(148,163,184,0.15)",
      label: "Tidak Terklasifikasi",
      icon: "?",
    },
  };

  if (loading)
    return (
      <div
        style={{
          ...glass,
          padding: "60px",
          textAlign: "center",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        Memuat...
      </div>
    );
  if (!data) return null;

  const info = data.result_label ? labelInfo[data.result_label] : null;

  return (
    <div>
      <button
        onClick={() => navigate("/dashboard/riwayat")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "10px",
          color: "rgba(255,255,255,0.7)",
          padding: "8px 16px",
          cursor: "pointer",
          fontSize: "14px",
          marginBottom: "24px",
        }}
      >
        <ArrowLeft size={16} /> Kembali ke Riwayat
      </button>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* Image */}
        <div style={{ ...glass, padding: "20px" }}>
          <img
            src={data.signedUrl}
            alt={data.original_name}
            style={{
              width: "100%",
              borderRadius: "12px",
              objectFit: "contain",
              maxHeight: "400px",
            }}
          />
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ ...glass, padding: "24px" }}>
            <div
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "12px",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Nama File
            </div>
            <div
              style={{ color: "white", fontWeight: "600", fontSize: "15px" }}
            >
              {data.original_name}
            </div>
          </div>

          <div style={{ ...glass, padding: "24px" }}>
            <div
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "12px",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Hasil Klasifikasi
            </div>
            {info ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    background: info.bg,
                    border: `1px solid ${info.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: info.color,
                  }}
                >
                  {info.icon}
                </div>
                <div>
                  <div
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: "22px",
                    }}
                  >
                    {info.label}
                  </div>
                  <div
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}
                  >
                    Confidence:{" "}
                    {data.confidence_score
                      ? `${(data.confidence_score * 100).toFixed(1)}%`
                      : "N/A"}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
                Belum ada hasil klasifikasi
              </div>
            )}
          </div>

          <div style={{ ...glass, padding: "24px" }}>
            <div
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "12px",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Informasi Lain
            </div>
            {[
              ["Model", data.ai_models?.name || "Tidak ada"],
              ["Sumber", data.source],
              [
                "Tanggal Upload",
                new Date(data.uploaded_at).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              ],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}
                >
                  {k}
                </span>
                <span
                  style={{
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}