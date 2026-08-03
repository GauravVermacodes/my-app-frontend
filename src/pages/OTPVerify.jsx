import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../App";
import toast from "react-hot-toast";

const OTPVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = location.state?.userId;
  const email = location.state?.email;
  const fromLogin = location.state?.fromLogin;
  const deviceInfo = location.state?.device;
  const locationInfo = location.state?.location;

  useEffect(() => {
    if (!userId) {
      toast.error("Invalid session");
      navigate("/login");
    }
  }, [userId]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Enter 6-digit OTP");

    setLoading(true);
    try {
      // ✅ Verify OTP with deviceVerification flag if from login
      const { data } = await API.post("/auth/verify-otp", {
        userId,
        otp,
        deviceVerification: fromLogin,
      });

      // ✅ If OTP verify returns token → save it
      if (data.token && data.user) {
        login(data.user, data.token);
        toast.success(
          fromLogin
            ? "🛡️ Device verified! Welcome back."
            : "✅ Account verified!"
        );
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await API.post("/auth/resend-otp", { userId });
      toast.success("New OTP sent!");
    } catch (e) {
      toast.error("Resend failed");
    }
  };

  return (
    <div style={{ maxWidth: 450, margin: "60px auto", padding: 20 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 60 }}>
          {fromLogin ? "🛡️" : "📧"}
        </div>
        <h2>{fromLogin ? "Verify New Device" : "Verify Email"}</h2>
        <p style={{ color: "#666" }}>
          OTP sent to: <b>{email}</b>
        </p>

        {/* ✅ Show device/location info for new device login */}
        {fromLogin && (
          <div
            style={{
              background: "#fff3cd",
              padding: 16,
              borderRadius: 8,
              margin: "20px 0",
              textAlign: "left",
              border: "1px solid #ffc107",
            }}
          >
            <p style={{ margin: 0, fontSize: 13 }}>
              <b>⚠️ New login detected from:</b>
            </p>
            <p style={{ margin: "8px 0", fontSize: 14 }}>
              📍 <b>Location:</b> {locationInfo}
            </p>
            <p style={{ margin: 0, fontSize: 14 }}>
              💻 <b>Device:</b> {deviceInfo}
            </p>
            <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "#856404" }}>
              If this wasn't you, cancel and change your password immediately!
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          style={{
            width: "100%",
            padding: 15,
            margin: "20px 0",
            fontSize: 24,
            textAlign: "center",
            letterSpacing: 8,
            border: "2px solid #ccc",
            borderRadius: 8,
          }}
          autoFocus
        />

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          style={{
            width: "100%",
            padding: 12,
            background: otp.length === 6 ? "#ff0000" : "#999",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button
          onClick={handleResend}
          style={{
            background: "none",
            border: "none",
            color: "#065fd4",
            cursor: "pointer",
          }}
        >
          Resend OTP
        </button>
      </div>

      <p style={{ marginTop: 30, fontSize: 12, color: "#999", textAlign: "center" }}>
        💡 If email doesn't arrive, check backend terminal for OTP
      </p>
    </div>
  );
};

export default OTPVerify;