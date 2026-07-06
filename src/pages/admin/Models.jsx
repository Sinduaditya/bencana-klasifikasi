import { useState, useEffect } from "react";
import { Link2, Zap, Trash2, CheckCircle, FileText } from "lucide-react";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

export default function AdminModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    hfEndpointUrl: "",
  });

  const fetchModels = () => {
    supabase
      .from("ai_models")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Gagal memuat model");
        else setModels(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hfEndpointUrl.trim())
      return toast.error("Isi URL endpoint Hugging Face");

    setSaving(true);
    try {
      const { error } = await supabase.from("ai_models").insert({
        name: form.name,
        description: form.description || null,
        hf_endpoint_url: form.hfEndpointUrl,
      });
      if (error) throw new Error(error.message);

      toast.success("Model berhasil didaftarkan");
      setForm({ name: "", description: "", hfEndpointUrl: "" });
      fetchModels();
    } catch (err) {
      toast.error(err.message || "Gagal mendaftarkan model");
    } finally {
      setSaving(false);
    }
  };

  const activate = async (id) => {
    const { error } = await supabase.rpc("activate_model", {
      target_id: id,
    });
    if (error) {
      toast.error("Gagal mengaktifkan model");
      return;
    }
    toast.success("Model diaktifkan — siap digunakan untuk prediksi");
    fetchModels();
  };

  const deleteModel = async (id) => {
    if (!confirm("Hapus model ini?")) return;
    const { error } = await supabase.from("ai_models").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus model");
      return;
    }
    toast.success("Model dihapus");
    fetchModels();
  };

  const activeModel = models.find((m) => m.is_active);

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
          Model AI
        </h1>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
          Daftarkan model yang sudah di-deploy ke Hugging Face dan aktifkan
          untuk digunakan prediksi
        </p>
      </div>

      {/* Info alur */}
      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#1d4ed8",
            fontWeight: "600",
            marginBottom: "6px",
          }}
        >
          Alur Penggunaan Model
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "#3b82f6",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: "#dbeafe",
              padding: "4px 12px",
              borderRadius: "99px",
            }}
          >
            1. Deploy model ke Hugging Face
          </span>
          <span>→</span>
          <span
            style={{
              background: "#dbeafe",
              padding: "4px 12px",
              borderRadius: "99px",
            }}
          >
            2. Daftarkan URL endpoint di sini
          </span>
          <span>→</span>
          <span
            style={{
              background: "#dbeafe",
              padding: "4px 12px",
              borderRadius: "99px",
            }}
          >
            3. Aktifkan model
          </span>
          <span>→</span>
          <span
            style={{
              background: "#dbeafe",
              padding: "4px 12px",
              borderRadius: "99px",
            }}
          >
            4. User upload → otomatis prediksi
          </span>
        </div>
      </div>

      {/* Model Aktif */}
      {activeModel && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={20} color="#16a34a" />
          </div>
          <div>
            <div
              style={{ fontWeight: "700", color: "#15803d", fontSize: "15px" }}
            >
              Model Aktif: {activeModel.name}
            </div>
            <div
              style={{ fontSize: "13px", color: "#16a34a", marginTop: "2px" }}
            >
              {activeModel.description ||
                "Sedang digunakan untuk prediksi user"}{" "}
              — {activeModel.hf_endpoint_url}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
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
          }}
        >
          Daftarkan Model Baru
        </h2>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Nama Model <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Contoh: MobileNetV2 Bencana v2"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Deskripsi (opsional)
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Contoh: Akurasi 92%, epoch 50"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              URL Endpoint Hugging Face <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="url"
              value={form.hfEndpointUrl}
              onChange={(e) =>
                setForm({ ...form, hfEndpointUrl: e.target.value })
              }
              required
              placeholder="https://xxxxx.hf.space atau https://api-inference.huggingface.co/models/xxx"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
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
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Link2 size={16} />
            {saving ? "Menyimpan..." : "Daftarkan Model"}
          </button>
        </form>
      </div>

      {/* Model List */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#0f172a",
              margin: 0,
            }}
          >
            Daftar Model ({models.length})
          </h2>
        </div>
        {loading ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}
          >
            Memuat...
          </div>
        ) : models.length === 0 ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}
          >
            <FileText size={36} style={{ marginBottom: "8px", opacity: 0.3 }} />
            <div>Belum ada model — daftarkan endpoint HF di atas</div>
          </div>
        ) : (
          models.map((m, i) => (
            <div
              key={m.id}
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom:
                  i < models.length - 1 ? "1px solid #f1f5f9" : "none",
                background: m.is_active ? "#f0fdf4" : "white",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: m.is_active ? "#dcfce7" : "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Zap size={20} color={m.is_active ? "#16a34a" : "#94a3b8"} />
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                    >
                      {m.name}
                    </span>
                    {m.is_active && (
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#16a34a",
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 10px",
                          borderRadius: "99px",
                        }}
                      >
                        AKTIF
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      marginTop: "3px",
                    }}
                  >
                    {m.description && (
                      <span style={{ marginRight: "8px" }}>
                        {m.description} •
                      </span>
                    )}
                    <span>{m.hf_endpoint_url}</span>
                    <span style={{ marginLeft: "8px" }}>
                      •{" "}
                      {new Date(m.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {!m.is_active && (
                  <button
                    onClick={() => activate(m.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#dcfce7",
                      color: "#16a34a",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    <CheckCircle size={14} /> Aktifkan
                  </button>
                )}
                {m.is_active && (
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#16a34a",
                      fontWeight: "500",
                      padding: "8px 16px",
                    }}
                  >
                    Sedang digunakan
                  </span>
                )}
                <button
                  onClick={() => deleteModel(m.id)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#fee2e2",
                    color: "#dc2626",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
