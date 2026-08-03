import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
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
  infoBg: "#eff6ff",
};

// SVG Icons
const Icon = ({ name, size = 18, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    shieldCheck: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
    laptop: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="20" x2="22" y2="20" /></>,
    smartphone: <><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></>,
    monitor: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    warning: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    refresh: <><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>,
    devices: <><rect x="4" y="4" width="16" height="12" rx="2" /><line x1="2" y1="20" x2="22" y2="20" /></>,
    circleDot: <circle cx="12" cy="12" r="4" fill="currentColor" />,
    google: <><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></>,
  };

  if (name === "google") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        {icons[name]}
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const getDeviceIcon = (deviceName) => {
  if (!deviceName) return "monitor";
  const name = deviceName.toLowerCase();
  if (name.includes("iphone") || name.includes("android") || name.includes("mobile")) return "smartphone";
  if (name.includes("mac") || name.includes("windows") || name.includes("linux")) return "laptop";
  return "monitor";
};

const SecuritySettings = () => {
  const { logout, user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [singleDeviceMode, setSingleDeviceMode] = useState(true);
  const [activeDevice, setActiveDevice] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({});

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

  useEffect(() => { fetchDevices(); }, []);

  useEffect(() => {
    if (showConfirmModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showConfirmModal]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.get("/auth/devices");
      setDevices(data.devices || []);
      setSingleDeviceMode(data.singleDeviceMode !== false);
      setActiveDevice(data.activeDevice);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load devices");
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (config, action) => {
    setConfirmConfig(config);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (confirmAction) await confirmAction();
    setShowConfirmModal(false);
  };

  const handleRemoveDevice = (deviceId) => {
    openConfirmModal(
      {
        iconName: "trash",
        iconColor: THEME.danger,
        title: "Remove Device?",
        message: "This device will be signed out immediately and won't be able to access your account.",
        confirmText: "Remove Device",
        danger: true,
      },
      async () => {
        try {
          await API.delete(`/auth/devices/${deviceId}`);
          toast.success("Device removed");
          fetchDevices();
        } catch (e) {
          toast.error("Failed to remove device");
        }
      }
    );
  };

  const handleLogoutAll = () => {
    openConfirmModal(
      {
        iconName: "warning",
        iconColor: THEME.warning,
        title: "Logout From All Devices?",
        message: "You'll need to sign in again on every device including this one.",
        confirmText: "Logout Everywhere",
        danger: true,
      },
      async () => {
        try {
          await API.post("/auth/logout-all");
          toast.success("Logged out from all devices");
          logout();
          window.location.href = "/login";
        } catch (e) {
          toast.error("Failed");
        }
      }
    );
  };

  const handleLogoutOthers = () => {
    openConfirmModal(
      {
        iconName: "logout",
        iconColor: THEME.warning,
        title: "Sign Out Other Devices?",
        message: "All other devices will be signed out. Your current session remains active.",
        confirmText: "Sign Out Others",
        danger: false,
      },
      async () => {
        try {
          const { data } = await API.post("/auth/logout-others");
          if (data.token) localStorage.setItem("token", data.token);
          toast.success("All other devices signed out!");
          fetchDevices();
        } catch (e) {
          toast.error("Failed");
        }
      }
    );
  };

  const handleToggleSingleDevice = async () => {
    try {
      const { data } = await API.post("/auth/toggle-single-device");
      setSingleDeviceMode(data.singleDeviceMode);
      toast.success(data.message);
    } catch (e) {
      toast.error("Failed");
    }
  };

  const getPlanStyle = (plan) => {
    const p = (plan || "free").toLowerCase();
    if (p === "gold") return { bg: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#fff" };
    if (p === "silver") return { bg: "linear-gradient(135deg, #94a3b8, #64748b)", color: "#fff" };
    if (p === "bronze") return { bg: "linear-gradient(135deg, #b45309, #92400e)", color: "#fff" };
    return { bg: THEME.menuHover, color: THEME.textPrimary };
  };

  const s = styles(isMobile, isTablet);

  return (
    <div style={s.page}>
      <style>{globalStyles}</style>

      <div style={s.container}>
        {/* HEADER */}
        <div style={s.header}>
          <div style={s.headerIconBox}>
            <Icon name="shield" size={22} color={THEME.textPrimary} />
          </div>
          <div>
            <h1 style={s.title}>Security Settings</h1>
            <p style={s.subtitle}>Manage your account security and trusted devices</p>
          </div>
        </div>

        {/* ACCOUNT INFO CARD */}
        <Card>
          <SectionHeader iconName="user" title="Account Information" isMobile={isMobile} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <InfoRow
              iconName="mail"
              label="Email"
              value={user?.email}
              isMobile={isMobile}
            />
            <InfoRow
              iconName="award"
              label="Membership Plan"
              isMobile={isMobile}
              value={
                <span style={{
                  background: getPlanStyle(user?.plan).bg,
                  color: getPlanStyle(user?.plan).color,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  border: (user?.plan || "").toLowerCase() === "free" ? `1px solid ${THEME.cardBorder}` : "none",
                }}>
                  {user?.plan || "free"}
                </span>
              }
            />
            {activeDevice && (
              <InfoRow
                iconName={getDeviceIcon(activeDevice)}
                label="Active On"
                value={activeDevice}
                isMobile={isMobile}
              />
            )}
          </div>
        </Card>

        {/* SINGLE DEVICE MODE */}
        <Card>
          <SectionHeader iconName="smartphone" title="Single Device Login" isMobile={isMobile} />

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            padding: "14px 16px",
            background: singleDeviceMode ? THEME.successBg : THEME.menuHover,
            borderRadius: 12,
            border: `1px solid ${singleDeviceMode ? "#a7f3d0" : THEME.cardBorder}`,
            marginBottom: 14,
            flexWrap: isMobile ? "wrap" : "nowrap",
          }}>
            <div style={{ flex: 1, minWidth: isMobile ? "100%" : "auto" }}>
              <p style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 14,
                color: THEME.textPrimary,
                letterSpacing: "-0.01em",
              }}>
                Allow login from only ONE device at a time
              </p>
              <p style={{
                margin: "4px 0 0 0",
                color: THEME.textSecondary,
                fontSize: 12,
                lineHeight: 1.5,
                fontWeight: 500,
              }}>
                Like WhatsApp Web — a new login will kick out your old session
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={handleToggleSingleDevice}
              style={{
                position: "relative",
                width: 50,
                height: 28,
                borderRadius: 20,
                background: singleDeviceMode ? THEME.success : "#cbd5e1",
                border: "none",
                cursor: "pointer",
                transition: "background 0.3s",
                flexShrink: 0,
                padding: 0,
              }}
              aria-label={singleDeviceMode ? "Disable single device mode" : "Enable single device mode"}
            >
              <div style={{
                position: "absolute",
                top: 2,
                left: singleDeviceMode ? 24 : 2,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "white",
                transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              }} />
            </button>
          </div>

          <button
            onClick={handleLogoutOthers}
            className="warning-btn"
            style={{
              width: "100%",
              padding: "12px 20px",
              background: THEME.warningBg,
              color: "#a16207",
              border: `1px solid #fde68a`,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
            }}
          >
            <Icon name="logout" size={16} />
            Sign Out All Other Devices
          </button>
        </Card>

        {/* TRUSTED DEVICES */}
        <Card>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 10,
          }}>
            <SectionHeader
              iconName="devices"
              title="Trusted Devices"
              count={devices.length}
              noMargin
              isMobile={isMobile}
            />

            {devices.length > 0 && (
              <button
                onClick={handleLogoutAll}
                className="danger-btn"
                style={{
                  padding: "8px 14px",
                  background: THEME.dangerBg,
                  color: THEME.danger,
                  border: `1px solid #fecaca`,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                <Icon name="logout" size={13} />
                Logout All
              </button>
            )}
          </div>

          {loading ? (
            <div style={s.loadingBox}>
              <div style={s.spinner} />
              <p style={{ margin: "12px 0 0", color: THEME.textSecondary, fontWeight: 500 }}>
                Loading devices...
              </p>
            </div>
          ) : error ? (
            <div style={{
              padding: 20,
              background: THEME.dangerBg,
              borderRadius: 12,
              border: `1px solid #fecaca`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Icon name="warning" size={18} color={THEME.danger} />
                <p style={{
                  color: THEME.danger,
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 14,
                }}>
                  {error}
                </p>
              </div>
              <p style={{
                color: THEME.textSecondary,
                fontSize: 12,
                margin: "0 0 12px 0",
                fontWeight: 500,
              }}>
                Try logging out and logging in again to fix this.
              </p>
              <button
                onClick={fetchDevices}
                style={{
                  padding: "8px 14px",
                  background: THEME.accent,
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "inherit",
                }}
              >
                <Icon name="refresh" size={13} color="white" />
                Retry
              </button>
            </div>
          ) : devices.length === 0 ? (
            <div style={s.emptyBox}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: THEME.accentBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <Icon name="devices" size={26} color={THEME.accent} />
              </div>
              <p style={{ margin: 0, fontWeight: 700, color: THEME.textPrimary, fontSize: 15 }}>
                No trusted devices yet
              </p>
              <p style={{ fontSize: 13, marginTop: 4, color: THEME.textSecondary, fontWeight: 500 }}>
                Devices will appear here after your next login
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {devices.map((device) => (
                <DeviceCard
                  key={device._id}
                  device={device}
                  onRemove={() => handleRemoveDevice(device._id)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </Card>

        {/* HOW SECURITY WORKS */}
        <Card>
          <SectionHeader iconName="info" title="How Security Works" isMobile={isMobile} />

          <div style={{
            background: THEME.infoBg,
            borderRadius: 12,
            padding: isMobile ? 14 : 18,
            border: `1px solid #dbeafe`,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <SecurityRule iconName="pin" text="Login from new city/state → OTP required" />
              <SecurityRule iconName="laptop" text="Login from new device → OTP required" />
              <SecurityRule iconName="lock" text="New login → Automatically kicks out old device (if enabled)" />
              <SecurityRule iconName="mail" text="Email alert sent for every suspicious login" />
              <SecurityRule iconName="clock" text="Session checked every 30 seconds automatically" />
              <SecurityRule iconName="google" text="Password managed securely via Google Sign-In" />
            </div>
          </div>
        </Card>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div style={s.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowConfirmModal(false)}
              style={s.modalClose}
              aria-label="Close"
            >
              <Icon name="close" size={16} />
            </button>

            <div style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: `${confirmConfig.iconColor}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              border: `2px solid ${confirmConfig.iconColor}33`,
            }}>
              <Icon name={confirmConfig.iconName} size={28} color={confirmConfig.iconColor} />
            </div>

            <h2 style={{
              margin: "0 0 8px 0",
              color: THEME.textPrimary,
              fontSize: 20,
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: "-0.01em",
            }}>
              {confirmConfig.title}
            </h2>
            <p style={{
              color: THEME.textSecondary,
              fontSize: 14,
              margin: "0 0 24px 0",
              lineHeight: 1.5,
              textAlign: "center",
              fontWeight: 500,
            }}>
              {confirmConfig.message}
            </p>

            <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column-reverse" : "row" }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "transparent",
                  color: THEME.textPrimary,
                  border: `1px solid ${THEME.cardBorder}`,
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: 12,
                  background: confirmConfig.danger
                    ? `linear-gradient(135deg, ${THEME.danger}, #dc2626)`
                    : `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "inherit",
                  boxShadow: confirmConfig.danger
                    ? "0 4px 12px rgba(239,68,68,0.3)"
                    : "0 4px 12px rgba(99,102,241,0.3)",
                }}
              >
                {confirmConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ REUSABLE COMPONENTS ============

const Card = ({ children }) => (
  <div style={{
    background: THEME.cardBg,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    border: `1px solid ${THEME.cardBorder}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }}>
    {children}
  </div>
);

const SectionHeader = ({ iconName, title, count, noMargin, isMobile }) => (
  <div style={{
    margin: noMargin ? 0 : "0 0 16px 0",
    display: "flex",
    alignItems: "center",
    gap: 10,
  }}>
    <Icon name={iconName} size={18} color={THEME.textPrimary} />
    <h2 style={{
      margin: 0,
      fontSize: isMobile ? 15 : 16,
      fontWeight: 700,
      color: THEME.textPrimary,
      letterSpacing: "-0.01em",
    }}>
      {title}
    </h2>
    {count !== undefined && (
      <span style={{
        background: THEME.accentBg,
        color: THEME.accentDark,
        fontSize: 12,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 20,
      }}>
        {count}
      </span>
    )}
  </div>
);

const InfoRow = ({ iconName, label, value, isMobile }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 16px",
    background: THEME.bg,
    borderRadius: 10,
    border: `1px solid ${THEME.cardBorder}`,
    gap: 12,
    flexWrap: isMobile ? "wrap" : "nowrap",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <span style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: THEME.cardBg,
        border: `1px solid ${THEME.cardBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: THEME.textSecondary,
        flexShrink: 0,
      }}>
        <Icon name={iconName} size={14} />
      </span>
      <span style={{
        color: THEME.textSecondary,
        fontSize: 13,
        fontWeight: 500,
      }}>
        {label}
      </span>
    </div>
    <span style={{
      color: THEME.textPrimary,
      fontSize: 13,
      fontWeight: 700,
      textAlign: "right",
      wordBreak: "break-word",
      minWidth: 0,
    }}>
      {value}
    </span>
  </div>
);

const DeviceCard = ({ device, onRemove, isMobile }) => (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    background: device.isCurrent ? THEME.successBg : THEME.bg,
    padding: 14,
    borderRadius: 12,
    border: `1px solid ${device.isCurrent ? "#a7f3d0" : THEME.cardBorder}`,
    gap: 12,
    flexWrap: "wrap",
    transition: "all 0.2s",
  }}>
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      flex: 1,
      minWidth: isMobile ? "100%" : 200,
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: device.isCurrent ? "white" : THEME.cardBg,
        border: `1px solid ${device.isCurrent ? "#a7f3d0" : THEME.cardBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: device.isCurrent ? THEME.success : THEME.textSecondary,
      }}>
        <Icon name={getDeviceIcon(device.deviceName)} size={18} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: THEME.textPrimary,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          letterSpacing: "-0.01em",
        }}>
          <span style={{ wordBreak: "break-word" }}>{device.deviceName}</span>
          {device.isCurrent && (
            <span style={{
              background: THEME.success,
              color: "white",
              padding: "3px 10px",
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.5,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "white",
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
              ACTIVE NOW
            </span>
          )}
        </div>
        <div style={{
          fontSize: 12,
          color: THEME.textSecondary,
          marginTop: 6,
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontWeight: 500,
        }}>
          <Icon name="pin" size={11} color={THEME.textMuted} />
          <span>{device.city}, {device.state}, {device.country}</span>
        </div>
        <div style={{
          fontSize: 11,
          color: THEME.textMuted,
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontWeight: 500,
        }}>
          <Icon name="clock" size={11} color={THEME.textMuted} />
          Last active: {new Date(device.lastSeen).toLocaleString()}
        </div>
      </div>
    </div>

    {!device.isCurrent && (
      <button
        onClick={onRemove}
        className="remove-device-btn"
        style={{
          padding: isMobile ? "8px 14px" : "8px 12px",
          background: "transparent",
          color: THEME.danger,
          border: `1px solid ${THEME.danger}`,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontFamily: "inherit",
          width: isMobile ? "100%" : "auto",
          justifyContent: "center",
        }}
      >
        <Icon name="trash" size={13} />
        Remove
      </button>
    )}
  </div>
);

const SecurityRule = ({ iconName, text }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 4px",
  }}>
    <div style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      background: "white",
      border: `1px solid #dbeafe`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: THEME.accent,
      flexShrink: 0,
    }}>
      <Icon name={iconName} size={14} color={iconName === "google" ? undefined : THEME.accent} />
    </div>
    <span style={{
      fontSize: 13,
      color: THEME.textPrimary,
      fontWeight: 500,
      lineHeight: 1.4,
    }}>
      {text}
    </span>
  </div>
);

// ============ STYLES ============
const styles = (isMobile, isTablet) => ({
  page: {
    background: THEME.bg,
    minHeight: "100vh",
    padding: isMobile ? "16px 12px 40px" : "28px 20px 40px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  container: {
    maxWidth: 900,
    margin: "0 auto",
  },
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
    background: THEME.menuHover,
    border: `1px solid ${THEME.cardBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: isMobile ? 22 : 26,
    fontWeight: 700,
    color: THEME.textPrimary,
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: THEME.textSecondary,
    margin: 0,
    fontSize: isMobile ? 13 : 14,
  },
  loadingBox: {
    padding: 40,
    textAlign: "center",
    background: THEME.bg,
    borderRadius: 12,
    border: `1px solid ${THEME.cardBorder}`,
  },
  spinner: {
    width: 32,
    height: 32,
    border: `3px solid ${THEME.cardBorder}`,
    borderTopColor: THEME.accent,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  emptyBox: {
    padding: 40,
    textAlign: "center",
    background: THEME.bg,
    borderRadius: 12,
    border: `1px solid ${THEME.cardBorder}`,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    display: "flex",
    alignItems: isMobile ? "flex-end" : "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(4px)",
    padding: isMobile ? 0 : 16,
    animation: "fadeIn 0.2s ease",
  },
  modal: {
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: isMobile ? "20px 20px 0 0" : 16,
    padding: isMobile ? 24 : 28,
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    position: "relative",
    animation: isMobile ? "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 30,
    height: 30,
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
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }

  @media (hover: hover) {
    .warning-btn:hover {
      background: #f59e0b !important;
      color: white !important;
      border-color: #f59e0b !important;
    }
    .danger-btn:hover {
      background: #ef4444 !important;
      color: white !important;
      border-color: #ef4444 !important;
    }
    .remove-device-btn:hover {
      background: #ef4444 !important;
      color: white !important;
    }
    button:not(:disabled):hover {
      opacity: 0.95;
    }
  }

  button:active { transform: scale(0.98); }
`;

export default SecuritySettings;