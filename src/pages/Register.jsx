// pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Google Signup ──────────────────────────────────────────
  const handleGoogleSignup = () => {
    console.log("🔍 Google signup clicked");
    const backendUrl =
      import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.length < 2) e.name = "Name must be at least 2 characters";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Please enter a valid email";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";

    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Manual Registration ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      toast.success("📧 OTP sent to your email! Check your inbox.");

      // Navigate to OTP verification
      navigate("/verify-otp", {
        state: {
          userId: data.userId,
          email: form.email,
        },
      });
    } catch (error) {
      // Handle Google account suggestion
      if (error.response?.data?.suggestGoogle) {
        toast(
          "This email is already registered with Google. Please sign in with Google.",
          { icon: "🔍", duration: 5000 }
        );
        return;
      }

      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const pwScore = (() => {
    const p = form.password;
    if (!p) return 0;
    let sc = 0;
    if (p.length >= 6) sc++;
    if (p.length >= 10) sc++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) sc++;
    if (/\d/.test(p)) sc++;
    if (/[^A-Za-z0-9]/.test(p)) sc++;
    return Math.min(sc, 4);
  })();

  const pwMeta = [
    { label: "", color: "#e5e7eb" },
    { label: "Weak", color: "#f87171" },
    { label: "Fair", color: "#fbbf24" },
    { label: "Good", color: "#60a5fa" },
    { label: "Strong", color: "#34d399" },
  ][pwScore];

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logoBadge}>🎬</div>
          <h1 style={s.title}>Create Account</h1>
          <p style={s.sub}>Join us today — it takes less than a minute</p>
        </div>

        {/* ── Google Signup Button ── */}
        <button
          onClick={handleGoogleSignup}
          style={s.googleBtn}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
          Sign up with Google
        </button>

        {/* Info banner */}
        <div style={s.infoBanner}>
          ⚡ <strong>Fastest way:</strong> Google sign-up is instant, no OTP needed
        </div>

        {/* Divider */}
        <div style={s.divider}>
          <span style={s.dividerLine} />
          <span style={s.dividerText}>or create account manually</span>
          <span style={s.dividerLine} />
        </div>

        {/* ── Manual Registration Form ── */}
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              style={{
                ...s.input,
                ...(errors.name ? s.inputErr : {}),
              }}
            />
            {errors.name && <span style={s.errMsg}>⚠ {errors.name}</span>}
          </div>

          <div style={s.field}>
            <label style={s.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{
                ...s.input,
                ...(errors.email ? s.inputErr : {}),
              }}
            />
            {errors.email && <span style={s.errMsg}>⚠ {errors.email}</span>}
            <span style={s.helper}>
              📧 We'll send an OTP to verify this email
            </span>
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                style={{
                  ...s.input,
                  paddingRight: "44px",
                  ...(errors.password ? s.inputErr : {}),
                }}
              />
              <button
                type="button"
                style={s.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <span style={s.errMsg}>⚠ {errors.password}</span>
            )}
            {/* Password strength meter */}
            {form.password && (
              <div style={s.pwMeter}>
                <div style={s.pwBars}>
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      style={{
                        ...s.pwBar,
                        background: i <= pwScore ? pwMeta.color : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
                <span style={{ ...s.pwLabel, color: pwMeta.color }}>
                  {pwMeta.label}
                </span>
              </div>
            )}
          </div>

          <div style={s.field}>
            <label style={s.label}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                style={{
                  ...s.input,
                  paddingRight: "44px",
                  ...(errors.confirmPassword ? s.inputErr : {}),
                }}
              />
              <button
                type="button"
                style={s.eyeBtn}
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <span style={s.errMsg}>⚠ {errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...s.submitBtn,
              ...(loading ? s.disabledBtn : {}),
            }}
          >
            {loading ? "⏳ Sending OTP..." : "📧 Register & Send OTP"}
          </button>
        </form>

        <p style={s.terms}>
          By creating an account, you agree to our{" "}
          <span style={s.link}>Terms</span> and{" "}
          <span style={s.link}>Privacy Policy</span>
        </p>

        <p style={s.footer}>
          Already have an account?{" "}
          <Link to="/login" style={s.link}>
            Sign in
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
    maxWidth: "460px",
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
    marginBottom: "12px",
  },
  infoBanner: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "12.5px",
    color: "#166534",
    marginBottom: "20px",
    textAlign: "center",
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
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "5px" },
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
    transition: "all 0.2s",
  },
  inputErr: {
    borderColor: "#ef4444",
    background: "#fef2f2",
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
  errMsg: {
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "500",
    marginTop: "2px",
  },
  helper: {
    color: "#64748b",
    fontSize: "11.5px",
    marginTop: "2px",
  },
  pwMeter: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "6px",
  },
  pwBars: { display: "flex", gap: "4px", flex: 1 },
  pwBar: {
    flex: 1,
    height: "4px",
    borderRadius: "3px",
    transition: "background 0.25s",
  },
  pwLabel: { fontSize: "11px", fontWeight: "700", minWidth: "44px" },
  submitBtn: {
    padding: "14px",
    background: "#8b5cf6",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
    transition: "all 0.2s",
  },
  disabledBtn: { opacity: 0.6, cursor: "not-allowed" },
  terms: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "11.5px",
    marginTop: "16px",
    lineHeight: "1.6",
  },
  footer: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    marginTop: "8px",
  },
  link: { color: "#8b5cf6", fontWeight: "600", textDecoration: "none" },
};

export default Register;