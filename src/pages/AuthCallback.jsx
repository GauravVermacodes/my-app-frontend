// pages/AuthCallback.jsx
// This page handles the redirect from Google OAuth
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios"; // ✅ Use your configured axios instance

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      setStatus("❌ Authentication failed. Redirecting...");
      setTimeout(() => navigate("/login?error=" + error), 2000);
      return;
    }

    if (token) {
      // ✅ Use API instance which points to Render backend URL
      API.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          const userData = response.data;
          // Store token and user in context/localStorage
          login(userData, token);
          setStatus("✅ Signed in successfully!");
          navigate("/dashboard");
        })
        .catch((err) => {
          console.error("Profile fetch error:", err);
          setStatus("❌ Failed to fetch profile.");
          setTimeout(() => navigate("/login"), 2000);
        });
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, login]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.spinner}>⏳</div>
        <p style={styles.text}>{status}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  spinner: { fontSize: "48px", marginBottom: "16px" },
  text: { color: "#374151", fontSize: "16px", fontWeight: "500" },
};

export default AuthCallback;