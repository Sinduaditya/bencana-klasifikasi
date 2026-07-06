import { useState, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = () => {
    supabase
      .from("messages")
      .select("*, profiles(username, email)")
      .order("sent_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Gagal memuat pesan");
        else setMessages(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleReply = async () => {
    if (!reply.trim()) return toast.error("Isi balasan terlebih dahulu");
    setSending(true);
    try {
      const { error } = await supabase
        .from("messages")
        .update({ reply, is_replied: true })
        .eq("id", selected.id);
      if (error) throw error;
      toast.success("Balasan terkirim");
      setReply("");
      setSelected(null);
      fetchMessages();
    } catch {
      toast.error("Gagal mengirim balasan");
    } finally {
      setSending(false);
    }
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
          Pesan
        </h1>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
          Pesan masuk dari pengguna
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: selected ? "1fr 1fr" : "1fr",
          gap: "20px",
        }}
      >
        {/* List */}
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
          ) : messages.length === 0 ? (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}
            >
              Tidak ada pesan
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={m.id}
                onClick={() => {
                  setSelected(m);
                  setReply("");
                }}
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  borderBottom:
                    i < messages.length - 1 ? "1px solid #f1f5f9" : "none",
                  background: selected?.id === m.id ? "#f8fafc" : "white",
                  borderLeft:
                    selected?.id === m.id
                      ? "3px solid #3b82f6"
                      : "3px solid transparent",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#0f172a",
                    }}
                  >
                    {m.profiles?.username}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {m.is_replied ? (
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#16a34a",
                          fontSize: "11px",
                          fontWeight: "600",
                          padding: "2px 8px",
                          borderRadius: "99px",
                        }}
                      >
                        Dibalas
                      </span>
                    ) : (
                      <span
                        style={{
                          background: "#fef9c3",
                          color: "#ca8a04",
                          fontSize: "11px",
                          fontWeight: "600",
                          padding: "2px 8px",
                          borderRadius: "99px",
                        }}
                      >
                        Baru
                      </span>
                    )}
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {new Date(m.sent_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "2px",
                  }}
                >
                  {m.subject}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.body}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail & Reply */}
        {selected && (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "24px",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "16px",
                      color: "#0f172a",
                    }}
                  >
                    {selected.subject}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    dari {selected.profiles?.username} ({selected.profiles?.email})
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  ✕
                </button>
              </div>
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "16px",
                  fontSize: "14px",
                  color: "#374151",
                  lineHeight: 1.6,
                }}
              >
                {selected.body}
              </div>
            </div>

            {selected.reply && (
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#16a34a",
                    marginBottom: "8px",
                  }}
                >
                  Balasan Anda:
                </div>
                <div
                  style={{
                    background: "#f0fdf4",
                    borderRadius: "12px",
                    padding: "16px",
                    fontSize: "14px",
                    color: "#374151",
                    lineHeight: 1.6,
                  }}
                >
                  {selected.reply}
                </div>
              </div>
            )}

            {!selected.is_replied && (
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#374151",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Tulis Balasan
                </label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Ketik balasan di sini..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={handleReply}
                  disabled={sending}
                  style={{
                    marginTop: "10px",
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
                    cursor: sending ? "not-allowed" : "pointer",
                    opacity: sending ? 0.7 : 1,
                  }}
                >
                  <Send size={14} />
                  {sending ? "Mengirim..." : "Kirim Balasan"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}