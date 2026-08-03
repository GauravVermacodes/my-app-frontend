import React, { useEffect } from "react";

const BlockedSearchModal = ({ isOpen, onClose, query, reason, severity, email }) => {
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 8 seconds
      const timer = setTimeout(onClose, 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.3s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a20, #2a1a1a)",
          border: "2px solid #f44336",
          borderRadius: 16,
          padding: 32,
          maxWidth: 500,
          width: "90%",
          textAlign: "center",
          color: "white",
          boxShadow: "0 20px 60px rgba(244,67,54,0.4)",
          animation: "slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f44336, #d32f2f)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 50,
            boxShadow: "0 4px 20px rgba(244,67,54,0.5)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        >
          🚫
        </div>

        {/* Title */}
        <h2
          style={{
            margin: "0 0 12px 0",
            fontSize: 26,
            color: "#f44336",
            fontWeight: 700,
          }}
        >
          Search Blocked
        </h2>

        {/* Query */}
        <div
          style={{
            background: "rgba(0,0,0,0.4)",
            padding: 16,
            borderRadius: 10,
            margin: "16px 0",
            border: "1px solid rgba(244,67,54,0.3)",
          }}
        >
          <div style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 6 }}>
            YOUR SEARCH
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              color: "#f44336",
              wordBreak: "break-word",
            }}
          >
            "{query}"
          </div>
        </div>

        {/* Reason */}
        <div
          style={{
            background: "rgba(255,152,0,0.1)",
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            border: "1px solid rgba(255,152,0,0.3)",
          }}
        >
          <div style={{ fontSize: 12, color: "#ff9800", marginBottom: 4 }}>
            ⚠️ Reason
          </div>
          <div style={{ fontSize: 13, color: "white" }}>{reason}</div>
        </div>

        {/* Info */}
        <div
          style={{
            padding: 16,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 10,
            marginBottom: 20,
            fontSize: 13,
            color: "#a1a1aa",
            lineHeight: 1.6,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            🛡️ Your <b style={{ color: "white" }}>Content Filter</b> protected you from harmful content.
          </div>
          <div>
            📧 An alert has been sent to your email:{" "}
            <b style={{ color: "white" }}>{email || "your account"}</b>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #f44336, #d32f2f)",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(244,67,54,0.3)",
          }}
        >
          I Understand
        </button>

        <div style={{ fontSize: 11, color: "#71717a", marginTop: 12 }}>
          This popup will auto-close in 8 seconds
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default BlockedSearchModal;