
// pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../App";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ── Google Login ───────────────────────────────────────────
  const handleGoogleLogin = () => {
    console.log("🔍 Google button clicked");

    // ✅ Vite uses import.meta.env (not process.env)
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const fullUrl = `${backendUrl}/api/auth/google`;

    console.log("🔍 Redirecting to:", fullUrl);

    // Full page redirect (not fetch/axios!)
    window.location.href = fullUrl;
  };

  // ── Local Login ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);

      if (data.requiresOTP) {
        toast(`🛡️ ${data.message}`, { duration: 6000, icon: "🔐" });
        navigate("/verify-otp", {
          state: {
            userId: data.userId,
            email: form.email,
            fromLogin: true,
            location: data.location,
            device: data.device,
          },
        });
        return;
      }

      if (data.previousSessionInvalidated) {
        toast("⚠️ Your previous session has been signed out", {
          duration: 5000,
          icon: "📱",
        });
      }

      // Handle Google-only account suggestion
      if (data.suggestGoogle) {
        toast("This account uses Google Sign-In.", { icon: "🔍" });
        return;
      }

      login(data.user, data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      // Check if backend suggests Google login
      if (error.response?.data?.suggestGoogle) {
        toast("This email is linked to Google. Please sign in with Google.", {
          icon: "🔍",
          duration: 5000,
        });
        return;
      }
      if (
        error.response?.status === 403 &&
        error.response?.data?.userId
      ) {
        toast("Please verify your email first", { icon: "📧" });
        navigate("/verify-otp", {
          state: {
            userId: error.response.data.userId,
            email: form.email,
          },
        });
        return;
      }
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logoBadge}>🎬</div>
          <h1 style={s.title}>Welcome Back</h1>
          <p style={s.sub}>Sign in to your account</p>
        </div>

        {/* ── Google Button ── */}
        <button
          onClick={handleGoogleLogin}
          style={s.googleBtn}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 
                 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 
                 2.684-3.875 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54
                 -1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 
                 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282
                 -1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 
                 4.038l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 
                 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 
                 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={s.divider}>
          <span style={s.dividerLine} />
          <span style={s.dividerText}>or sign in with email</span>
          <span style={s.dividerLine} />
        </div>

        {/* ── Local Login Form ── */}
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={s.input}
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                style={{ ...s.input, paddingRight: "44px" }}
                required
              />
              <button
                type="button"
                style={s.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...s.submitBtn,
              ...(loading ? s.disabledBtn : {}),
            }}
          >
            {loading ? "⏳ Signing in..." : "🚀 Sign In"}
          </button>
        </form>

        <p style={s.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={s.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "#f8fafc",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "40px 36px",
    boxShadow: "0 4px 24px rgba(15,23,42,0.06)",
  },
  header: { textAlign: "center", marginBottom: "24px" },
  logoBadge: {
    width: "60px",
    height: "60px",
    borderRadius: "16px",
    background: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
    border: "1px solid #ddd6fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    margin: "0 auto 14px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
  },
  sub: { margin: "6px 0 0", color: "#64748b", fontSize: "14px" },
  googleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "13px 20px",
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e2e8f0",
  },
  dividerText: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", color: "#475569", fontWeight: "600" },
  input: {
    padding: "13px 16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  eyeBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  submitBtn: {
    padding: "14px",
    background: "#8b5cf6",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
    transition: "all 0.2s",
  },
  disabledBtn: { opacity: 0.6, cursor: "not-allowed" },
  footer: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    marginTop: "20px",
  },
  link: { color: "#8b5cf6", fontWeight: "600", textDecoration: "none" },
};

export default Login;

