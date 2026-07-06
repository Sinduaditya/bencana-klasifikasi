import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mountain, CloudRain, Clock, Image } from "lucide-react";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

const glass = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "20px",
};

const labelInfo = {
  LONGSOR: { color: "#ef4444", bg: "rgba(239,68,68,0.15)", label: "Longsor" },
  KEKERINGAN: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    label: "Kekeringan",
  },
  TIDAK_TERKLASIFIKASI: {
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.15)",
    label: "Tidak Terklasifikasi",
  },
};

export default function UserRiwayat() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("datasets")
      .select("*")
      .order("uploaded_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error || !data) {
          toast.error("Gagal memuat riwayat");
          return;
        }
        const { data: signed } = await supabase.storage
          .from("datasets")
          .createSignedUrls(
            data.map((d) => d.file_path),
            3600,
          );
        setDatasets(
          data.map((d, i) => ({ ...d, signedUrl: signed?.[i]?.signedUrl })),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "white",
            margin: 0,
          }}
        >
          Riwayat Analisis
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            margin: "6px 0 0",
            fontSize: "14px",
          }}
        >
          Semua gambar yang pernah Anda upload dan hasilnya
        </p>
      </div>

      {loading ? (
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
      ) : datasets.length === 0 ? (
        <div style={{ ...glass, padding: "60px", textAlign: "center" }}>
          <Clock
            size={48}
            color="rgba(255,255,255,0.2)"
            style={{ marginBottom: "16px" }}
          />
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "15px",
              marginBottom: "8px",
            }}
          >
            Belum ada riwayat
          </div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
            Upload gambar di halaman Beranda untuk memulai
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {datasets.map((d) => {
            const info = d.result_label ? labelInfo[d.result_label] : null;
            return (
              <div
                key={d.id}
                onClick={() => navigate(`/dashboard/detail/${d.id}`)}
                style={{
                  ...glass,
                  padding: "20px",
                  cursor: "pointer",
                  transition: "transform 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")
                }
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "100%",
                    height: "160px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.06)",
                    marginBottom: "16px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={d.signedUrl}
                    alt={d.original_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "white",
                    marginBottom: "8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {d.original_name}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {info ? (
                    <span
                      style={{
                        background: info.bg,
                        color: info.color,
                        padding: "4px 12px",
                        borderRadius: "99px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {info.label}
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "12px",
                      }}
                    >
                      Belum diproses
                    </span>
                  )}
                  <span
                    style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}
                  >
                    {new Date(d.uploaded_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}