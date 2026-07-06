import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Lock } from "lucide-react";
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
};

export default function UserProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword)
      return toast.error("Password baru tidak cocok");
    if (form.newPassword.length < 6)
      return toast.error("Password minimal 6 karakter");
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: form.oldPassword,
      });
      if (signInError) throw new Error("Password lama salah");

      const { error: updateError } = await supabase.auth.updateUser({
        password: form.newPassword,
      });
      if (updateError) throw new Error(updateError.message);

      toast.success("Password berhasil diubah");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "white",
            margin: 0,
          }}
        >
          Profile
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            margin: "6px 0 0",
            fontSize: "14px",
          }}
        >
          Informasi akun dan pengaturan
        </p>
      </div>

      {/* Info */}
      <div style={{ ...glass, padding: "28px", marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "28px",
              fontWeight: "700",
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div
              style={{ color: "white", fontWeight: "700", fontSize: "20px" }}
            >
              {user?.username}
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
              {user?.email}
            </div>
          </div>
        </div>
        {[
          ["Username", user?.username],
          ["Email", user?.email],
          ["Role", user?.role],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
              {k}
            </span>
            <span
              style={{ color: "white", fontSize: "14px", fontWeight: "500" }}
            >
              {v}
            </span>
          </div>
        ))}
      </div>

      {/* Change Password */}
      <div style={{ ...glass, padding: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <Lock size={18} color="#60a5fa" />
          <h2
            style={{
              color: "white",
              fontWeight: "600",
              fontSize: "16px",
              margin: 0,
            }}
          >
            Ganti Password
          </h2>
        </div>
        <form
          onSubmit={handleChange}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          {[
            {
              label: "Password Lama",
              key: "oldPassword",
              placeholder: "••••••••",
            },
            {
              label: "Password Baru",
              key: "newPassword",
              placeholder: "••••••••",
            },
            {
              label: "Konfirmasi Password Baru",
              key: "confirmPassword",
              placeholder: "••••••••",
            },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "13px",
                  fontWeight: "500",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                {label}
              </label>
              <input
                type="password"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
                placeholder={placeholder}
                style={inputStyle}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "13px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Menyimpan..." : "Simpan Password"}
          </button>
        </form>
      </div>
    </div>
  );
}