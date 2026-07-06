import { useState } from "react";
import { Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

const glass = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "20px",
};
const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export default function UserKontak() {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        user_id: user.id,
        subject: form.subject,
        body: form.body,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Pesan berhasil dikirim!");
    } catch {
      toast.error("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "white",
            margin: 0,
          }}
        >
          Hubungi Kami
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            margin: "8px 0 0",
            fontSize: "14px",
          }}
        >
          Ada pertanyaan? Kirim pesan dan kami akan segera membalas
        </p>
      </div>

      <div style={{ ...glass, padding: "32px" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h2
              style={{ color: "white", fontWeight: "700", marginBottom: "8px" }}
            >
              Pesan Terkirim!
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              Admin akan membalas pesan Anda segera.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setForm({ subject: "", body: "" });
              }}
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Kirim Pesan Lain
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "13px",
                  fontWeight: "500",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Subjek
              </label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                placeholder="Masukkan subjek pesan..."
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "13px",
                  fontWeight: "500",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Pesan
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
                placeholder="Tulis pesan Anda di sini..."
                rows={5}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "white",
                fontWeight: "600",
                fontSize: "15px",
                cursor: sending ? "not-allowed" : "pointer",
                opacity: sending ? 0.7 : 1,
              }}
            >
              <Send size={16} />
              {sending ? "Mengirim..." : "Kirim Pesan"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}