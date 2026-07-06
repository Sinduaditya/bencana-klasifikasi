import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw new Error("Email atau password salah");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, email, role, status")
        .eq("id", data.user.id)
        .single();
      if (profileError) throw new Error("Gagal memuat profil");

      if (profile.status === "PENDING") {
        await supabase.auth.signOut();
        throw new Error("Akun belum dikonfirmasi admin");
      }
      if (profile.status === "REJECTED") {
        await supabase.auth.signOut();
        throw new Error("Akun ditolak admin");
      }

      login(profile);
      toast.success("Login berhasil!");
      navigate(profile.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-white">Klasifikasi Bencana</h1>
          <p className="text-blue-200 text-sm mt-1">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-blue-200 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="email@example.com"
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
          <div>
            <label className="text-blue-200 text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="••••••••"
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
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-blue-200 text-sm mt-6">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}