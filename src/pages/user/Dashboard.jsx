import { useState, useRef } from "react";
import { Upload, CloudRain, Mountain, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

const glass = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "20px",
};

const faqs = [
  {
    q: "Apa itu klasifikasi bencana?",
    a: "Sistem ini menggunakan AI untuk menganalisis gambar dan mengklasifikasikan jenis bencana seperti longsor atau kekeringan secara otomatis.",
  },
  {
    q: "Bagaimana cara menggunakan sistem ini?",
    a: "Upload gambar pada form di atas, sistem akan memproses dan menampilkan hasil klasifikasi beserta tingkat kepercayaan model.",
  },
  {
    q: "Format gambar apa yang didukung?",
    a: "Sistem mendukung format JPG, PNG, dan WEBP dengan ukuran maksimal 5MB per gambar.",
  },
  {
    q: "Seberapa akurat hasil klasifikasi?",
    a: "Akurasi bergantung pada model yang digunakan. Hasil ditampilkan beserta confidence score untuk transparansi.",
  },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Pilih gambar terlebih dahulu");
    setUploading(true);
    try {
      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("datasets")
        .upload(path, file);
      if (uploadError) throw new Error(uploadError.message);

      const { data: dataset, error: insertError } = await supabase
        .from("datasets")
        .insert({
          user_id: user.id,
          file_path: path,
          original_name: file.name,
          source: user.role === "ADMIN" ? "ADMIN" : "USER",
        })
        .select()
        .single();
      if (insertError) throw new Error(insertError.message);

      await supabase.from("activity_logs").insert({
        user_id: user.id,
        dataset_id: dataset.id,
        action: "UPLOAD_DATASET",
      });

      const { data: classifyResult, error: classifyError } =
        await supabase.functions.invoke("classify", {
          body: { datasetId: dataset.id },
        });
      if (classifyError) {
        toast.error("Upload berhasil, tapi klasifikasi gagal: " + classifyError.message);
      } else {
        toast.success("Gambar berhasil dianalisis!");
      }

      setResult({
        resultLabel: classifyResult?.result_label ?? dataset.result_label,
        confidenceScore:
          classifyResult?.confidence_score ?? dataset.confidence_score,
      });
    } catch (err) {
      toast.error(err.message || "Gagal mengupload");
    } finally {
      setUploading(false);
    }
  };

  const labelInfo = {
    LONGSOR: {
      icon: <Mountain size={20} />,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.15)",
      label: "Longsor",
    },
    KEKERINGAN: {
      icon: <CloudRain size={20} />,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.15)",
      label: "Kekeringan",
    },
    TIDAK_TERKLASIFIKASI: {
      icon: "?",
      color: "#94a3b8",
      bg: "rgba(148,163,184,0.15)",
      label: "Tidak Terklasifikasi",
    },
  };

  return (
    <div>
      {/* Hero */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "48px",
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: "99px",
            padding: "6px 16px",
            fontSize: "13px",
            color: "#93c5fd",
            marginBottom: "16px",
          }}
        >
          Sistem Klasifikasi Bencana Berbasis AI
        </div>
        <h1
          style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "white",
            margin: "0 0 16px",
            lineHeight: 1.2,
          }}
        >
          Deteksi Bencana
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Longsor & Kekeringan
          </span>
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "16px",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          Upload gambar wilayah dan biarkan AI kami menganalisis potensi bencana
          secara otomatis dengan akurasi tinggi.
        </p>
      </div>

      {/* Upload Form */}
      <div style={{ ...glass, padding: "32px", marginBottom: "32px" }}>
        <h2
          style={{
            color: "white",
            fontWeight: "700",
            fontSize: "20px",
            marginBottom: "8px",
          }}
        >
          Analisis Gambar
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          {user
            ? "Upload gambar untuk diklasifikasikan oleh model AI"
            : "Login atau daftar untuk menggunakan fitur ini"}
        </p>

        {user ? (
          <form onSubmit={handleUpload}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed rgba(255,255,255,0.2)",
                borderRadius: "16px",
                padding: "40px",
                textAlign: "center",
                cursor: "pointer",
                background: preview ? "transparent" : "rgba(255,255,255,0.03)",
                marginBottom: "16px",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    maxHeight: "240px",
                    borderRadius: "12px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div>
                  <Upload
                    size={36}
                    color="rgba(255,255,255,0.3)"
                    style={{ marginBottom: "12px" }}
                  />
                  <div
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    Klik atau seret gambar ke sini
                  </div>
                  <div
                    style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}
                  >
                    JPG, PNG, WEBP — maks 5MB
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            </div>

            {file && (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "13px",
                  }}
                >
                  {file.name} ({(file.size / 1024).toFixed(0)} KB)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setResult(null);
                  }}
                  style={{
                    background: "rgba(248,113,113,0.15)",
                    border: "1px solid rgba(248,113,113,0.3)",
                    borderRadius: "10px",
                    color: "#f87171",
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Hapus
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: file
                  ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                  : "rgba(255,255,255,0.1)",
                color: "white",
                fontWeight: "700",
                fontSize: "15px",
                cursor: !file || uploading ? "not-allowed" : "pointer",
                opacity: !file || uploading ? 0.6 : 1,
              }}
            >
              {uploading ? "Menganalisis..." : "Analisis Gambar"}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div
              style={{ color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}
            >
              Anda perlu login untuk menggunakan fitur ini
            </div>
            <a
              href="/login"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                borderRadius: "12px",
                background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                color: "white",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Login Sekarang
            </a>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              borderRadius: "14px",
              background: result.resultLabel
                ? labelInfo[result.resultLabel]?.bg
                : "rgba(255,255,255,0.06)",
              border: `1px solid ${result.resultLabel ? labelInfo[result.resultLabel]?.color + "40" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {result.resultLabel ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: labelInfo[result.resultLabel]?.bg,
                    border: `1px solid ${labelInfo[result.resultLabel]?.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: labelInfo[result.resultLabel]?.color,
                  }}
                >
                  {labelInfo[result.resultLabel]?.icon}
                </div>
                <div>
                  <div
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: "18px",
                    }}
                  >
                    {labelInfo[result.resultLabel]?.label}
                  </div>
                  <div
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}
                  >
                    Confidence:{" "}
                    {result.confidenceScore
                      ? `${(result.confidenceScore * 100).toFixed(1)}%`
                      : "N/A"}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                Upload berhasil. Model sedang diproses atau belum ada model
                aktif.
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAQ */}
      <div style={{ ...glass, padding: "32px" }}>
        <h2
          style={{
            color: "white",
            fontWeight: "700",
            fontSize: "20px",
            marginBottom: "20px",
          }}
        >
          Pertanyaan Umum
        </h2>
        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{
              borderBottom:
                i < faqs.length - 1
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "none",
              paddingBottom: "16px",
              marginBottom: "16px",
            }}
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span
                style={{
                  color: "white",
                  fontWeight: "500",
                  fontSize: "15px",
                  textAlign: "left",
                }}
              >
                {faq.q}
              </span>
              <ChevronDown
                size={18}
                color="rgba(255,255,255,0.4)"
                style={{
                  transform: openFaq === i ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                  flexShrink: 0,
                  marginLeft: "16px",
                }}
              />
            </button>
            {openFaq === i && (
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  margin: "12px 0 0",
                }}
              >
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "40px",
          paddingBottom: "20px",
          color: "rgba(255,255,255,0.3)",
          fontSize: "13px",
        }}
      >
        © 2025 Bencana AI — Sistem Klasifikasi Bencana Longsor & Kekeringan
      </div>
    </div>
  );
}