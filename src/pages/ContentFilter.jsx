import React, { useState, useEffect } from "react";
import API from "../api/axios";
import PinInput from "../components/PinInput";
import toast from "react-hot-toast";

const THEME = {
  bg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  cardHoverBorder: "#6366f1",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  accent: "#6366f1",
  accentDark: "#4338ca",
  accentBg: "#eef2ff",
  success: "#10b981",
  successBg: "#ecfdf5",
  warning: "#f59e0b",
  warningBg: "#fffbeb",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  menuHover: "#f1f5f9",
};

// SVG Icons
const Icon = ({ name, size = 18, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    shieldCheck: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></>,
    shieldX: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    unlock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></>,
    key: <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></>,
    warning: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    power: <><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const ContentFilter = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("view");
  const [step, setStep] = useState(1);
  const [tempData, setTempData] = useState({});
  const [error, setError] = useState("");
  const [pinLength, setPinLength] = useState(4);
  const [busy, setBusy] = useState(false);
  const [clearCounter, setClearCounter] = useState(0);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  useEffect(() => { fetchStatus(); }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (mode !== "view") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mode]);

  const fetchStatus = async () => {
    try {
      const { data } = await API.get(`/content-filter/status?t=${Date.now()}`);
      setStatus({ ...data });
      setPinLength(data.pinLength || 4);
    } catch (e) {
      toast.error("Failed to load status");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async (pin) => {
    setError("");
    if (step === 1) {
      setTempData({ pin });
      setStep(2);
      setClearCounter((c) => c + 1);
      toast("Enter the same PIN again to confirm", { icon: "🔒" });
      return;
    }
    if (pin !== tempData.pin) {
      setError("PINs don't match. Start over.");
      setTempData({});
      setStep(1);
      setClearCounter((c) => c + 1);
      return;
    }
    setBusy(true);
    try {
      const { data } = await API.post("/content-filter/set-pin", {
        pin: tempData.pin,
        confirmPin: pin,
      });
      toast.success(data.message || "PIN set & Filter ACTIVATED!", { duration: 4000 });
      setStatus({
        enabled: data.enabled === true,
        hasPin: data.hasPin === true,
        pinLength: data.pinLength || 4,
        failedAttempts: 0,
        isLocked: false,
        lockedUntil: null,
        lockedMinutesRemaining: 0,
        violationCount: status?.violationCount || 0,
        setAt: data.setAt || new Date().toISOString(),
        email: status?.email,
      });
      resetMode();
      setTimeout(fetchStatus, 500);
    } catch (e) {
      setError(e.response?.data?.message || "Failed");
      setClearCounter((c) => c + 1);
      if (e.response?.data?.hasPin) {
        setTimeout(() => { resetMode(); fetchStatus(); }, 2000);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleChangePin = async (pin) => {
    setError("");
    if (step === 1) {
      setTempData({ currentPin: pin });
      setStep(2);
      setClearCounter((c) => c + 1);
      toast("Now enter your NEW PIN", { icon: "🔑" });
      return;
    }
    if (step === 2) {
      setTempData({ ...tempData, newPin: pin });
      setStep(3);
      setClearCounter((c) => c + 1);
      toast("Confirm your new PIN", { icon: "✅" });
      return;
    }
    if (pin !== tempData.newPin) {
      setError("New PINs don't match");
      setStep(2);
      setClearCounter((c) => c + 1);
      return;
    }
    setBusy(true);
    try {
      await API.post("/content-filter/change-pin", {
        currentPin: tempData.currentPin,
        newPin: tempData.newPin,
        confirmNewPin: pin,
      });
      toast.success("PIN changed successfully!");
      resetMode();
      await fetchStatus();
    } catch (e) {
      const msg = e.response?.data?.message || "Failed";
      const attemptsLeft = e.response?.data?.attemptsLeft;
      if (attemptsLeft !== undefined) {
        setError(`Wrong current PIN. ${attemptsLeft} attempts left.`);
        setStep(1);
        setTempData({});
      } else {
        setError(msg);
      }
      setClearCounter((c) => c + 1);
      if (e.response?.status === 423) {
        setTimeout(() => { resetMode(); fetchStatus(); }, 2000);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async (pin) => {
    setError("");
    setBusy(true);
    try {
      const { data } = await API.post("/content-filter/toggle", { pin });
      toast.success(data.message);
      resetMode();
      await fetchStatus();
    } catch (e) {
      const msg = e.response?.data?.message || "Failed";
      const attemptsLeft = e.response?.data?.attemptsLeft;
      setError(attemptsLeft !== undefined ? `Wrong PIN. ${attemptsLeft} attempts left.` : msg);
      setClearCounter((c) => c + 1);
      if (e.response?.status === 423) {
        setTimeout(() => { resetMode(); fetchStatus(); }, 2000);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (pin) => {
    setError("");
    setBusy(true);
    try {
      await API.post("/content-filter/remove", { pin });
      toast.success("Filter removed successfully");
      resetMode();
      await fetchStatus();
    } catch (e) {
      const msg = e.response?.data?.message || "Failed";
      const attemptsLeft = e.response?.data?.attemptsLeft;
      setError(attemptsLeft !== undefined ? `Wrong PIN. ${attemptsLeft} attempts left.` : msg);
      setClearCounter((c) => c + 1);
    } finally {
      setBusy(false);
    }
  };

  const resetMode = () => {
    setMode("view");
    setStep(1);
    setTempData({});
    setError("");
    setClearCounter((c) => c + 1);
  };

  const startAction = (action) => {
    if (action === "set" && status?.hasPin) {
      toast.error("PIN already exists. Use 'Change PIN' instead.");
      return;
    }
    if (action === "change" && !status?.hasPin) {
      toast.error("No PIN set. Use 'Set PIN' first.");
      return;
    }
    setMode(action);
    setStep(1);
    setTempData({});
    setError("");
    setClearCounter((c) => c + 1);
  };

  const getModalConfig = () => {
    if (mode === "set") {
      return step === 1
        ? { icon: "lock", title: "Create PIN", subtitle: `Choose a ${pinLength}-digit PIN`, color: THEME.accent }
        : { icon: "shieldCheck", title: "Confirm PIN", subtitle: "Enter the same PIN again", color: THEME.accent };
    }
    if (mode === "change") {
      if (step === 1) return { icon: "unlock", title: "Enter Current PIN", subtitle: "Verify your current PIN", color: THEME.warning };
      if (step === 2) return { icon: "key", title: "Create New PIN", subtitle: "Choose your new PIN", color: THEME.accent };
      return { icon: "shieldCheck", title: "Confirm New PIN", subtitle: "Enter new PIN again", color: THEME.accent };
    }
    if (mode === "toggle") {
      return status?.enabled
        ? { icon: "power", title: "Turn OFF Filter", subtitle: "Enter your PIN to continue", color: THEME.danger }
        : { icon: "shieldCheck", title: "Turn ON Filter", subtitle: "Enter your PIN to continue", color: THEME.success };
    }
    if (mode === "remove") {
      return { icon: "trash", title: "Remove Filter", subtitle: "This will permanently remove your PIN", color: THEME.danger };
    }
    return { icon: "shield", title: "", subtitle: "", color: THEME.accent };
  };

  const getStepIndicator = () => {
    let total = 1;
    if (mode === "set") total = 2;
    if (mode === "change") total = 3;
    if (total === 1) return null;

    return (
      <div style={styles(isMobile).stepIndicator}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              ...styles(isMobile).stepDot,
              width: step > i || step === i + 1 ? 32 : 8,
              background: step > i ? THEME.success : step === i + 1 ? THEME.accent : THEME.cardBorder,
            }}
          />
        ))}
      </div>
    );
  };

  const s = styles(isMobile, isTablet);

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.loadingContainer}>
          <div style={s.spinner} />
          <h2 style={s.loadingText}>Loading Safe Search...</h2>
        </div>
        <style>{globalStyles}</style>
      </div>
    );
  }

  const visualState = !status?.hasPin ? "no-pin" : status?.enabled ? "protected" : "paused";

  const statusConfig = {
    protected: {
      icon: "shieldCheck",
      label: "Protected",
      description: "Content filter is active and secure",
      color: THEME.success,
      bg: THEME.successBg,
      border: "#a7f3d0",
    },
    paused: {
      icon: "shield",
      label: "Paused",
      description: "PIN is set but filter is currently OFF",
      color: THEME.warning,
      bg: THEME.warningBg,
      border: "#fde68a",
    },
    "no-pin": {
      icon: "shieldX",
      label: "Not Protected",
      description: "No PIN set — content filtering is disabled",
      color: THEME.danger,
      bg: THEME.dangerBg,
      border: "#fecaca",
    },
  }[visualState];

  const modalConfig = getModalConfig();

  return (
    <div style={s.page}>
      <style>{globalStyles}</style>

      <div style={s.container}>
        {/* HEADER */}
        <div style={s.header}>
          <div style={s.headerIconBox}>
            <Icon name="filter" size={22} color={THEME.accent} />
          </div>
          <div>
            <h1 style={s.title}>Safe Search</h1>
            <p style={s.subtitle}>
              Protect your account with customizable content filtering
            </p>
          </div>
        </div>

        {/* STATUS CARD */}
        <div style={s.statusCard}>
          {/* Status Banner */}
          <div style={{
            ...s.statusBanner,
            background: statusConfig.bg,
            border: `1px solid ${statusConfig.border}`,
          }}>
            <div style={{
              ...s.statusIconBox,
              background: "white",
              border: `2px solid ${statusConfig.color}`,
              color: statusConfig.color,
            }}>
              <Icon name={statusConfig.icon} size={26} color={statusConfig.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
                color: statusConfig.color,
                marginBottom: 4,
              }}>
                STATUS
              </div>
              <h2 style={{
                fontSize: isMobile ? 18 : 20,
                fontWeight: 700,
                margin: 0,
                color: THEME.textPrimary,
                letterSpacing: "-0.01em",
              }}>
                {statusConfig.label}
              </h2>
              <p style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: THEME.textSecondary,
                fontWeight: 500,
              }}>
                {statusConfig.description}
              </p>
            </div>

            {status?.isLocked && (
              <div style={s.lockedBadge}>
                <Icon name="lock" size={13} color="white" />
                {status.lockedMinutesRemaining}m
              </div>
            )}
          </div>

          {/* Info Bar */}
          {status?.hasPin && (
            <div style={s.infoBar}>
              <div style={s.infoItem}>
                <div style={s.infoIconBox}>
                  <Icon name="lock" size={14} color={THEME.textSecondary} />
                </div>
                <div>
                  <div style={s.infoLabel}>Security</div>
                  <div style={s.infoValue}>{status.pinLength}-digit PIN</div>
                </div>
              </div>
              <div style={s.infoDivider} />
              <div style={s.infoItem}>
                <div style={s.infoIconBox}>
                  <Icon name="calendar" size={14} color={THEME.textSecondary} />
                </div>
                <div>
                  <div style={s.infoLabel}>Last Updated</div>
                  <div style={s.infoValue}>
                    {status.setAt
                      ? new Date(status.setAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning for paused state */}
          {visualState === "paused" && !status?.isLocked && (
            <div style={s.warning}>
              <div style={s.warningIconBox}>
                <Icon name="warning" size={18} color={THEME.warning} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.warningTitle}>Filter is currently OFF</div>
                <div style={s.warningSub}>Turn it ON to start blocking harmful content</div>
              </div>
              <button
                onClick={() => startAction("toggle")}
                style={s.warningBtn}
              >
                <Icon name="power" size={13} color="white" />
                Turn ON
              </button>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div style={s.actions}>
            {!status?.hasPin ? (
              <button
                onClick={() => startAction("set")}
                style={{ ...s.btn, ...s.btnPrimary, width: "100%" }}
                className="filter-btn"
              >
                <Icon name="shieldCheck" size={16} color="white" />
                Set PIN & Enable Protection
              </button>
            ) : (
              <>
                <button
                  onClick={() => startAction("toggle")}
                  disabled={status?.isLocked}
                  style={{
                    ...s.btn,
                    ...(status?.enabled ? s.btnOutline : s.btnSuccess),
                    flex: isMobile ? "1 1 100%" : "1",
                  }}
                  className="filter-btn"
                >
                  {status?.enabled ? (
                    <>
                      <Icon name="power" size={16} />
                      Turn OFF
                    </>
                  ) : (
                    <>
                      <Icon name="power" size={16} color="white" />
                      Turn ON
                    </>
                  )}
                </button>

                <button
                  onClick={() => startAction("change")}
                  disabled={status?.isLocked}
                  style={{
                    ...s.btn,
                    ...s.btnDark,
                    flex: isMobile ? "1 1 100%" : "1",
                  }}
                  className="filter-btn"
                >
                  <Icon name="key" size={16} color="white" />
                  Change PIN
                </button>

                <button
                  onClick={() => startAction("remove")}
                  disabled={status?.isLocked}
                  style={{
                    ...s.btn,
                    ...s.btnOutlineDanger,
                    flex: isMobile ? "1 1 100%" : "1",
                  }}
                  className="filter-btn"
                >
                  <Icon name="trash" size={16} />
                  Remove
                </button>
              </>
            )}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: THEME.accentBg,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="info" size={16} color={THEME.accent} />
            </div>
            <h2 style={s.sectionTitle}>How It Works</h2>
          </div>

          <div style={s.infoGrid}>
            <InfoCard iconName="lock" title="PIN Setup" description="Setting a PIN immediately activates content filtering across your account" isMobile={isMobile} />
            <InfoCard iconName="key" title="PIN Change" description="Requires your existing PIN for authorization to prevent unauthorized changes" isMobile={isMobile} />
            <InfoCard iconName="filter" title="Auto Filtering" description="Harmful content and explicit search results are automatically blocked" isMobile={isMobile} />
            <InfoCard iconName="clock" title="Security Lockout" description="Consecutive incorrect PIN entries lock changes for 2 hours" isMobile={isMobile} />
            <InfoCard iconName="shield" title="Active Protection" description="Content filtering works across search, video recommendations, and shorts" isMobile={isMobile} />
            <InfoCard
              iconName="bell"
              title="Notifications"
              description={
                <>
                  Alerts sent to{" "}
                  <span style={{ color: THEME.accent, fontWeight: 600, wordBreak: "break-all" }}>
                    {status?.email || "your email"}
                  </span>
                </>
              }
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>

      {/* PIN MODAL */}
      {mode !== "view" && (
        <div style={s.modalOverlay} onClick={resetMode}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={resetMode}
              style={s.modalClose}
              aria-label="Close"
            >
              <Icon name="close" size={18} />
            </button>

            {/* Modal Icon */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: `${modalConfig.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              border: `2px solid ${modalConfig.color}33`,
            }}>
              <Icon name={modalConfig.icon} size={28} color={modalConfig.color} />
            </div>

            {/* Title */}
            <h2 style={{
              margin: "0 0 6px",
              fontSize: 20,
              fontWeight: 700,
              color: THEME.textPrimary,
              textAlign: "center",
              letterSpacing: "-0.01em",
            }}>
              {modalConfig.title}
            </h2>
            <p style={{
              margin: "0 0 20px",
              fontSize: 13,
              color: THEME.textSecondary,
              textAlign: "center",
              fontWeight: 500,
            }}>
              {modalConfig.subtitle}
            </p>

            {getStepIndicator()}

            <PinInput
              length={pinLength}
              onComplete={
                mode === "set"
                  ? handleSetPin
                  : mode === "change"
                  ? handleChangePin
                  : mode === "toggle"
                  ? handleToggle
                  : handleRemove
              }
              disabled={busy || status?.isLocked}
              error={error}
              autoFocus
              showKeypad
              clearTrigger={clearCounter}
            />

            <button
              onClick={resetMode}
              style={{ ...s.btn, ...s.btnOutline, width: "100%", marginTop: 20 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ INFO CARD ============
const InfoCard = ({ iconName, title, description, isMobile }) => (
  <div style={{
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 12,
    padding: isMobile ? 14 : 16,
    display: "flex",
    gap: 12,
    transition: "all 0.2s",
    cursor: "default",
  }}
    className="info-card"
  >
    <div style={{
      width: 40,
      height: 40,
      borderRadius: 10,
      background: THEME.accentBg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon name={iconName} size={18} color={THEME.accent} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: THEME.textPrimary,
        marginBottom: 4,
        letterSpacing: "-0.01em",
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 12,
        color: THEME.textSecondary,
        lineHeight: 1.5,
        fontWeight: 500,
      }}>
        {description}
      </div>
    </div>
  </div>
);

// ============ STYLES ============
const styles = (isMobile, isTablet) => ({
  page: {
    padding: isMobile ? "16px 12px 40px" : "28px 20px 40px",
    minHeight: "100vh",
    background: THEME.bg,
    color: THEME.textPrimary,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  container: {
    maxWidth: 960,
    margin: "0 auto",
  },
  loadingContainer: {
    padding: 80,
    textAlign: "center",
  },
  spinner: {
    width: 40,
    height: 40,
    border: `3px solid ${THEME.cardBorder}`,
    borderTopColor: THEME.accent,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  loadingText: {
    color: THEME.textSecondary,
    fontSize: 16,
    fontWeight: 500,
    margin: 0,
  },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: THEME.accentBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: isMobile ? 22 : 26,
    fontWeight: 700,
    margin: "0 0 4px",
    color: THEME.textPrimary,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: THEME.textSecondary,
    fontSize: isMobile ? 13 : 14,
    margin: 0,
  },

  // Status Card
  statusCard: {
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 16,
    padding: isMobile ? 16 : 20,
    marginBottom: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  statusBanner: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: isMobile ? 14 : 16,
    borderRadius: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  statusIconBox: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  lockedBadge: {
    background: `linear-gradient(135deg, ${THEME.danger}, #dc2626)`,
    color: "white",
    padding: "6px 12px",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
    flexShrink: 0,
  },

  // Info Bar
  infoBar: {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 12 : 20,
    padding: isMobile ? 14 : 16,
    background: THEME.bg,
    borderRadius: 10,
    marginBottom: 16,
    border: `1px solid ${THEME.cardBorder}`,
    flexWrap: isMobile ? "wrap" : "nowrap",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: isMobile ? "100%" : "auto",
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: 11,
    color: THEME.textMuted,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    color: THEME.textPrimary,
    fontWeight: 700,
    marginTop: 2,
  },
  infoDivider: {
    width: 1,
    height: 32,
    background: THEME.cardBorder,
    display: isMobile ? "none" : "block",
  },

  // Warning
  warning: {
    marginBottom: 16,
    padding: isMobile ? 12 : 14,
    background: THEME.warningBg,
    border: `1px solid #fde68a`,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  warningIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: `1px solid #fde68a`,
  },
  warningTitle: {
    fontWeight: 700,
    color: "#78350f",
    fontSize: 14,
    letterSpacing: "-0.01em",
  },
  warningSub: {
    fontSize: 12,
    color: "#92400e",
    marginTop: 2,
    fontWeight: 500,
  },
  warningBtn: {
    padding: isMobile ? "10px 16px" : "8px 14px",
    background: `linear-gradient(135deg, ${THEME.success}, #059669)`,
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "inherit",
    flexShrink: 0,
    width: isMobile ? "100%" : "auto",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(16,185,129,0.3)",
  },

  // Actions
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  btn: {
    padding: "11px 18px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "1px solid transparent",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    minHeight: 42,
  },
  btnPrimary: {
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  btnSuccess: {
    background: `linear-gradient(135deg, ${THEME.success}, #059669)`,
    color: "white",
    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
  },
  btnDark: {
    background: THEME.textPrimary,
    color: "white",
    borderColor: THEME.textPrimary,
  },
  btnOutline: {
    background: THEME.cardBg,
    color: THEME.textPrimary,
    borderColor: THEME.cardBorder,
  },
  btnOutlineDanger: {
    background: THEME.cardBg,
    color: THEME.danger,
    borderColor: THEME.cardBorder,
  },

  // Section
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: isMobile ? 17 : 19,
    fontWeight: 700,
    margin: 0,
    color: THEME.textPrimary,
    letterSpacing: "-0.01em",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : isTablet
      ? "1fr 1fr"
      : "1fr 1fr 1fr",
    gap: 12,
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    display: "flex",
    alignItems: isMobile ? "flex-end" : "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: isMobile ? 0 : 16,
    backdropFilter: "blur(4px)",
    animation: "fadeIn 0.2s ease",
  },
  modal: {
    background: THEME.cardBg,
    borderRadius: isMobile ? "20px 20px 0 0" : 16,
    padding: isMobile ? 24 : 28,
    width: "100%",
    maxWidth: 440,
    maxHeight: "90vh",
    overflowY: "auto",
    color: THEME.textPrimary,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    position: "relative",
    animation: isMobile ? "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: THEME.menuHover,
    border: "none",
    cursor: "pointer",
    color: THEME.textSecondary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  },

  // Step indicator
  stepIndicator: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
    marginBottom: 20,
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
    transition: "all 0.3s",
  },
});

const globalStyles = `
  * { -webkit-tap-highlight-color: transparent; }
  html, body { overflow-x: hidden; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @media (hover: hover) {
    .filter-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.12);
    }
    .info-card:hover {
      border-color: #6366f1 !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(99,102,241,0.1) !important;
    }
    button:not(:disabled):hover {
      opacity: 0.95;
    }
  }

  button:active:not(:disabled) { transform: scale(0.98); }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
  }
`;

export default ContentFilter;