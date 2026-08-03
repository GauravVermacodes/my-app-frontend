import React, { useState, useEffect, useRef, useCallback } from "react";

const PinInput = ({
  length = 4,
  onComplete,
  disabled = false,
  autoFocus = true,
  showKeypad = true,
  title,
  subtitle,
  error,
  clearTrigger,          // ✅ NEW - increment this to clear PIN
  showValue = false,     // ✅ NEW - show digits instead of dots
}) => {
  const [pin, setPin] = useState(Array(length).fill(""));
  const [activeIdx, setActiveIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRefs = useRef([]);
  const submittedRef = useRef(false);  // ✅ Prevent double-submit

  // ============ AUTO-FOCUS ON MOUNT ============
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [autoFocus]);

  // ============ CLEAR ON ERROR ============
  useEffect(() => {
    if (error) {
      resetPin();
    }
  }, [error]);

  // ============ CLEAR ON TRIGGER (for step changes) ============
  useEffect(() => {
    if (clearTrigger !== undefined) {
      resetPin();
    }
  }, [clearTrigger]);

  const resetPin = useCallback(() => {
    setPin(Array(length).fill(""));
    setActiveIdx(0);
    setIsCompleted(false);
    submittedRef.current = false;
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, [length]);

  // ============ HANDLE INPUT CHANGE ============
  const handleChange = (val, idx) => {
    if (disabled || isCompleted) return;
    if (!/^\d?$/.test(val)) return;

    const newPin = [...pin];
    newPin[idx] = val;
    setPin(newPin);

    // Move to next
    if (val && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
      setActiveIdx(idx + 1);
    }

    // ✅ Check if complete
    if (newPin.every((d) => d !== "") && !submittedRef.current) {
      submittedRef.current = true;
      setIsCompleted(true);
      const fullPin = newPin.join("");
      
      // ✅ Small delay to show the last digit before submitting
      setTimeout(() => {
        onComplete(fullPin);
      }, 150);
    }
  };

  // ============ HANDLE KEYBOARD ============
  const handleKeyDown = (e, idx) => {
    if (disabled || isCompleted) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (pin[idx]) {
        const newPin = [...pin];
        newPin[idx] = "";
        setPin(newPin);
      } else if (idx > 0) {
        const newPin = [...pin];
        newPin[idx - 1] = "";
        setPin(newPin);
        inputRefs.current[idx - 1]?.focus();
        setActiveIdx(idx - 1);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
      setActiveIdx(idx - 1);
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
      setActiveIdx(idx + 1);
    }
  };

  // ============ HANDLE KEYPAD ============
  const handleKeypadClick = (num) => {
    if (disabled || isCompleted) return;

    if (num === "clear") {
      resetPin();
      return;
    }

    if (num === "back") {
      if (activeIdx > 0 && !pin[activeIdx]) {
        const newPin = [...pin];
        newPin[activeIdx - 1] = "";
        setPin(newPin);
        setActiveIdx(activeIdx - 1);
        inputRefs.current[activeIdx - 1]?.focus();
      } else if (pin[activeIdx]) {
        const newPin = [...pin];
        newPin[activeIdx] = "";
        setPin(newPin);
      }
      return;
    }

    // ✅ Find first empty slot (not just activeIdx)
    const emptyIdx = pin.findIndex((d) => d === "");
    if (emptyIdx !== -1) {
      handleChange(num.toString(), emptyIdx);
    }
  };

  // ============ HANDLE PASTE ============
  const handlePaste = (e) => {
    if (disabled || isCompleted) return;
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (pasted) {
      const newPin = pasted.split("").concat(Array(length - pasted.length).fill(""));
      setPin(newPin);

      if (pasted.length === length) {
        submittedRef.current = true;
        setIsCompleted(true);
        setTimeout(() => onComplete(pasted), 150);
      } else {
        inputRefs.current[pasted.length]?.focus();
        setActiveIdx(pasted.length);
      }
    }
  };

  const isFilled = (idx) => pin[idx] !== "";

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      {/* TITLE */}
      {title && (
        <h3
          style={{
            textAlign: "center",
            color: "white",
            margin: "0 0 8px 0",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {title}
        </h3>
      )}

      {/* SUBTITLE */}
      {subtitle && (
        <p
          style={{
            textAlign: "center",
            color: "#a1a1aa",
            fontSize: 13,
            margin: "0 0 28px 0",
          }}
        >
          {subtitle}
        </p>
      )}

      {/* PIN INPUTS */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {pin.map((digit, idx) => (
          <div
            key={idx}
            style={{ position: "relative" }}
          >
            <input
              ref={(el) => (inputRefs.current[idx] = el)}
              type={showValue ? "text" : "password"}
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              disabled={disabled || isCompleted}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onFocus={() => setActiveIdx(idx)}
              onPaste={handlePaste}
              autoComplete="off"
              style={{
                width: 55,
                height: 65,
                textAlign: "center",
                fontSize: 32,
                fontWeight: "bold",
                background: isFilled(idx)
                  ? isCompleted
                    ? "linear-gradient(135deg, #10b981, #059669)"  // ✅ Green when complete
                    : "linear-gradient(135deg, #065fd4, #4a90e2)"   // Blue when filled
                  : "#1a1a20",
                color: "white",
                border:
                  activeIdx === idx && !isCompleted
                    ? "2px solid #ff0000"
                    : error
                    ? "2px solid #f44336"
                    : isFilled(idx)
                    ? "2px solid transparent"
                    : "2px solid #2a2a30",
                borderRadius: 12,
                outline: "none",
                transition: "all 0.2s",
                caretColor: "transparent",
                boxShadow:
                  activeIdx === idx && !isCompleted
                    ? "0 0 0 4px rgba(255,0,0,0.15)"
                    : isFilled(idx)
                    ? "0 4px 12px rgba(6,95,212,0.3)"
                    : "none",
                cursor: disabled || isCompleted ? "not-allowed" : "text",
                transform: isFilled(idx) ? "scale(1.05)" : "scale(1)",
              }}
            />
          </div>
        ))}
      </div>

      {/* PROGRESS DOTS */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginBottom: 20,
        }}
      >
        {pin.map((digit, idx) => (
          <div
            key={idx}
            style={{
              width: digit ? 20 : 8,
              height: 4,
              borderRadius: 2,
              background: digit
                ? isCompleted
                  ? "#10b981"
                  : "#065fd4"
                : "#2a2a30",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          style={{
            textAlign: "center",
            color: "#f44336",
            fontSize: 13,
            marginBottom: 16,
            padding: "10px 16px",
            background: "rgba(244,67,54,0.1)",
            borderRadius: 8,
            border: "1px solid rgba(244,67,54,0.3)",
            animation: "shake 0.4s",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {isCompleted && !error && (
        <div
          style={{
            textAlign: "center",
            color: "#10b981",
            fontSize: 13,
            marginBottom: 16,
            padding: "10px 16px",
            background: "rgba(16,185,129,0.1)",
            borderRadius: 8,
            border: "1px solid rgba(16,185,129,0.3)",
          }}
        >
          ✓ Processing...
        </div>
      )}

      {/* NUMERIC KEYPAD */}
      {showKeypad && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginTop: 24,
            maxWidth: 280,
            margin: "24px auto 0",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeypadClick(num)}
              disabled={disabled || isCompleted}
              style={{
                ...keypadBtn,
                opacity: disabled || isCompleted ? 0.4 : 1,
                cursor: disabled || isCompleted ? "not-allowed" : "pointer",
              }}
              onMouseDown={(e) => {
                if (!disabled && !isCompleted) {
                  e.currentTarget.style.transform = "scale(0.92)";
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #065fd4, #4a90e2)";
                }
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = "#1a1a20";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = "#1a1a20";
              }}
            >
              {num}
            </button>
          ))}

          {/* CLEAR BUTTON */}
          <button
            onClick={() => handleKeypadClick("clear")}
            disabled={disabled || isCompleted}
            style={{
              ...keypadBtn,
              fontSize: 11,
              background: "rgba(244,67,54,0.15)",
              color: "#f44336",
              border: "1px solid rgba(244,67,54,0.3)",
              opacity: disabled || isCompleted ? 0.4 : 1,
            }}
          >
            CLEAR
          </button>

          {/* 0 BUTTON */}
          <button
            onClick={() => handleKeypadClick(0)}
            disabled={disabled || isCompleted}
            style={{
              ...keypadBtn,
              opacity: disabled || isCompleted ? 0.4 : 1,
            }}
            onMouseDown={(e) => {
              if (!disabled && !isCompleted) {
                e.currentTarget.style.transform = "scale(0.92)";
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #065fd4, #4a90e2)";
              }
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "#1a1a20";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "#1a1a20";
            }}
          >
            0
          </button>

          {/* BACKSPACE */}
          <button
            onClick={() => handleKeypadClick("back")}
            disabled={disabled || isCompleted}
            style={{
              ...keypadBtn,
              fontSize: 22,
              opacity: disabled || isCompleted ? 0.4 : 1,
            }}
          >
            ⌫
          </button>
        </div>
      )}

      {/* Add CSS animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};

const keypadBtn = {
  width: "100%",
  height: 65,
  background: "#1a1a20",
  color: "white",
  border: "1px solid #2a2a30",
  borderRadius: 12,
  fontSize: 24,
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.15s",
  userSelect: "none",
  outline: "none",
};

export default PinInput;