import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { username: form.username } },
      });
      if (error) throw new Error(error.message);
      setSuccess(true);
      toast.success("Registrasi berhasil! Tunggu konfirmasi admin.");
    } catch (err) {
      toast.error(err.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "24px",
            padding: "48px",
            textAlign: "center",
            maxWidth: "420px",
          }}
        >
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Registrasi Berhasil!
          </h2>
          <p className="text-blue-200 text-sm mb-6">
            Akun Anda sedang menunggu konfirmasi dari admin. Silakan login
            setelah dikonfirmasi.
          </p>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "12px 32px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "white",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
            }}
          >
            Ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "24px",
          padding: "48px",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌍</div>
          <h1 className="text-2xl font-bold text-white">Buat Akun Baru</h1>
          <p className="text-blue-200 text-sm mt-1">
            Daftar untuk mulai menggunakan sistem
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            {
              label: "Username",
              key: "username",
              type: "text",
              placeholder: "johndoe",
            },
            {
              label: "Email",
              key: "email",
              type: "email",
              placeholder: "email@example.com",
            },
            {
              label: "Password",
              key: "password",
              type: "password",
              placeholder: "••••••••",
            },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-blue-200 text-sm mb-1 block">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "white",
              fontWeight: "600",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="text-center text-blue-200 text-sm mt-6">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}