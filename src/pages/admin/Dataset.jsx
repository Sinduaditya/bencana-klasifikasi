import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Image, Filter, FolderOpen } from "lucide-react";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const LABELS = [
  { value: "LONGSOR", label: "Longsor", color: "#ef4444", bg: "#fee2e2" },
  { value: "KEKERINGAN", label: "Kekeringan", color: "#f59e0b", bg: "#fef3c7" },
  {
    value: "TIDAK_TERKLASIFIKASI",
    label: "Tidak Terklasifikasi",
    color: "#94a3b8",
    bg: "#f1f5f9",
  },
];

const LabelBadge = ({ label }) => {
  const info = LABELS.find((l) => l.value === label);
  if (!info)
    return (
      <span style={{ color: "#94a3b8", fontSize: "13px" }}>Belum diproses</span>
    );
  return (
    <span
      style={{
        background: info.bg,
        color: info.color,
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      {info.label}
    </span>
  );
};

export default function AdminDataset() {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [label, setLabel] = useState("LONGSOR");
  const [filterLabel, setFilterLabel] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileRef = useRef();

  const fetchDatasets = (lbl = filterLabel, src = filterSource) => {
    setLoading(true);
    let query = supabase
      .from("datasets")
      .select("*, profiles(username)")
      .order("uploaded_at", { ascending: false });
    if (lbl) query = query.eq("result_label", lbl);
    if (src) query = query.eq("source", src);
    query
      .then(async ({ data, error }) => {
        if (error || !data) {
          toast.error("Gagal memuat dataset");
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
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0)
      return toast.error("Pilih file gambar terlebih dahulu");

    setUploading(true);
    setUploadProgress(0);

    try {
      const BATCH_SIZE = 50;
      let uploaded = 0;

      for (let i = 0; i < selectedFiles.length; i += BATCH_SIZE) {
        const batch = selectedFiles.slice(i, i + BATCH_SIZE);

        const rows = await Promise.all(
          batch.map(async (f) => {
            const path = `${user.id}/${crypto.randomUUID()}-${f.name}`;
            const { error: uploadError } = await supabase.storage
              .from("datasets")
              .upload(path, f);
            if (uploadError) throw new Error(uploadError.message);
            return {
              user_id: user.id,
              file_path: path,
              original_name: f.name,
              source: "ADMIN",
              result_label: label,
              confidence_score: 1.0,
            };
          }),
        );

        const { error: insertError } = await supabase
          .from("datasets")
          .insert(rows);
        if (insertError) throw new Error(insertError.message);

        uploaded += batch.length;
        setUploadProgress(Math.round((uploaded / selectedFiles.length) * 100));
      }

      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: `UPLOAD_BULK_${selectedFiles.length}_${label}`,
      });

      toast.success(`${selectedFiles.length} gambar berhasil diupload!`);
      setSelectedFiles([]);
      fileRef.current.value = "";
      fetchDatasets();
    } catch (err) {
      toast.error(err.message || "Gagal upload");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus dataset ini?")) return;
    const dataset = datasets.find((d) => d.id === id);
    if (dataset) {
      await supabase.storage.from("datasets").remove([dataset.file_path]);
    }
    const { error } = await supabase.from("datasets").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus");
      return;
    }
    toast.success("Dataset dihapus");
    fetchDatasets();
  };

  const handleFilter = (lbl, src) => {
    setFilterLabel(lbl);
    setFilterSource(src);
    fetchDatasets(lbl, src);
  };

  // Statistik
  const stats = {
    total: datasets.length,
    longsor: datasets.filter((d) => d.result_label === "LONGSOR").length,
    kekeringan: datasets.filter((d) => d.result_label === "KEKERINGAN").length,
    belum: datasets.filter((d) => !d.result_label).length,
  };

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
          Dataset
        </h1>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
          Upload dan kelola dataset training
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Total",
            value: stats.total,
            color: "#3b82f6",
            bg: "#eff6ff",
          },
          {
            label: "Longsor",
            value: stats.longsor,
            color: "#ef4444",
            bg: "#fee2e2",
          },
          {
            label: "Kekeringan",
            value: stats.kekeringan,
            color: "#f59e0b",
            bg: "#fef3c7",
          },
          {
            label: "Belum Dilabel",
            value: stats.belum,
            color: "#94a3b8",
            bg: "#f1f5f9",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "700", color: s.color }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upload Form */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #e2e8f0",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#0f172a",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FolderOpen size={18} /> Upload Dataset (Bulk)
        </h2>

        <form onSubmit={handleBulkUpload}>
          {/* Label Selection */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "10px",
              }}
            >
              Label / Kelas Gambar
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              {LABELS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLabel(l.value)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "2px solid",
                    borderColor: label === l.value ? l.color : "#e2e8f0",
                    background: label === l.value ? l.bg : "white",
                    color: label === l.value ? l.color : "#64748b",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* File Input */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Pilih Gambar (bisa pilih ratusan sekaligus)
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed #e2e8f0",
                borderRadius: "12px",
                padding: "32px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                background: "#f8fafc",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#3b82f6")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#e2e8f0")
              }
            >
              <Upload
                size={32}
                color="#94a3b8"
                style={{ marginBottom: "8px" }}
              />
              <div
                style={{
                  color: "#374151",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
              >
                Klik untuk pilih gambar atau seret ke sini
              </div>
              <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                JPG, PNG, WEBP — bisa pilih banyak file sekaligus (Ctrl+A untuk
                semua)
              </div>
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* File Preview Info */}
          {selectedFiles.length > 0 && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: "700",
                      color: "#16a34a",
                      fontSize: "15px",
                    }}
                  >
                    {selectedFiles.length} file
                  </span>
                  <span style={{ color: "#374151", fontSize: "14px" }}>
                    {" "}
                    dipilih — akan dilabel sebagai{" "}
                  </span>
                  <span
                    style={{
                      fontWeight: "700",
                      color: LABELS.find((l) => l.value === label)?.color,
                    }}
                  >
                    {LABELS.find((l) => l.value === label)?.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFiles([]);
                    fileRef.current.value = "";
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ✕
                </button>
              </div>
              {/* Preview thumbnails */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginTop: "10px",
                  flexWrap: "wrap",
                }}
              >
                {selectedFiles.slice(0, 10).map((f, i) => (
                  <div
                    key={i}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      background: "#e2e8f0",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
                {selectedFiles.length > 10 && (
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "6px",
                      background: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    +{selectedFiles.length - 10}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                  fontSize: "13px",
                  color: "#374151",
                }}
              >
                <span>Mengupload... {uploadProgress}%</span>
                <span>
                  {Math.round((selectedFiles.length * uploadProgress) / 100)}/
                  {selectedFiles.length} file
                </span>
              </div>
              <div
                style={{
                  background: "#e2e8f0",
                  borderRadius: "99px",
                  height: "8px",
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: "100%",
                    borderRadius: "99px",
                    background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || selectedFiles.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              border: "none",
              background: selectedFiles.length > 0 ? "#0f172a" : "#e2e8f0",
              color: selectedFiles.length > 0 ? "white" : "#94a3b8",
              fontSize: "14px",
              fontWeight: "600",
              cursor:
                uploading || selectedFiles.length === 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            <Upload size={16} />
            {uploading
              ? `Mengupload ${uploadProgress}%...`
              : `Upload ${selectedFiles.length > 0 ? selectedFiles.length + " Gambar" : "Dataset"}`}
          </button>
        </form>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid #e2e8f0",
          marginBottom: "16px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Filter size={16} color="#64748b" />
        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
          Filter:
        </span>
        {[
          { label: "Semua", value: "", src: "" },
          { label: "Longsor", value: "LONGSOR", src: "" },
          { label: "Kekeringan", value: "KEKERINGAN", src: "" },
          {
            label: "Tidak Terklasifikasi",
            value: "TIDAK_TERKLASIFIKASI",
            src: "",
          },
          { label: "Dari Admin", value: "", src: "ADMIN" },
          { label: "Dari User", value: "", src: "USER" },
        ].map((f) => (
          <button
            key={f.label}
            onClick={() => handleFilter(f.value, f.src)}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid",
              borderColor:
                filterLabel === f.value && filterSource === f.src
                  ? "#0f172a"
                  : "#e2e8f0",
              background:
                filterLabel === f.value && filterSource === f.src
                  ? "#0f172a"
                  : "white",
              color:
                filterLabel === f.value && filterSource === f.src
                  ? "white"
                  : "#64748b",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Dataset Table */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#0f172a",
              margin: 0,
            }}
          >
            Semua Dataset ({datasets.length})
          </h2>
        </div>

        {loading ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}
          >
            Memuat...
          </div>
        ) : datasets.length === 0 ? (
          <div
            style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}
          >
            <Image size={40} style={{ marginBottom: "12px", opacity: 0.3 }} />
            <div>Belum ada dataset</div>
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
                {[
                  "Gambar",
                  "Nama File",
                  "Pengguna",
                  "Sumber",
                  "Label / Kelas",
                  "Confidence",
                  "Tanggal",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datasets.map((d, i) => (
                <tr
                  key={d.id}
                  style={{
                    borderBottom:
                      i < datasets.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                        background: "#f1f5f9",
                        overflow: "hidden",
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
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "13px",
                      color: "#374151",
                      maxWidth: "160px",
                    }}
                  >
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.original_name}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    {d.profiles?.username || "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        background:
                          d.source === "ADMIN" ? "#eff6ff" : "#f5f3ff",
                        color: d.source === "ADMIN" ? "#1d4ed8" : "#6d28d9",
                        padding: "3px 10px",
                        borderRadius: "99px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {d.source}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <LabelBadge label={d.result_label} />
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    {d.confidence_score
                      ? `${(d.confidence_score * 100).toFixed(1)}%`
                      : "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    {new Date(d.uploaded_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => handleDelete(d.id)}
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
                      <Trash2 size={14} />
                    </button>
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