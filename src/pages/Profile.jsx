// src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ✅ UPDATED THEME - Warm off-white with gold accents
const THEME = {
  bg: "#f4f2ee",                    // ← Warm off-white
  bgGradient: "linear-gradient(180deg, #f4f2ee 0%, #eeece7 100%)",
  cardBg: "#ffffff",
  cardBorder: "#e8e5df",            // ← Warm border
  cardHoverBorder: "#fbbf24",       // ← Gold hover
  textPrimary: "#1c1c1e",
  textSecondary: "#6e6e73",
  textMuted: "#8e8e93",
  accent: "#d97706",                // ← Gold (amber-600)
  accentLight: "#fbbf24",           // ← Light gold
  accentDark: "#b45309",            // ← Dark gold
  accentDarker: "#92400e",
  accentBg: "#fef3c7",              // ← Gold tint bg
  accentBgHover: "#fde68a",         // ← Gold hover bg
  success: "#10b981",
  successBg: "#ecfdf5",
  warning: "#f59e0b",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  menuHover: "#faf7f0",             // ← Warm hover
  gradientStart: "#fbbf24",
  gradientEnd: "#d97706",
};

const GENDER_OPTIONS = [
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

// SVG Icons
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    at: <><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    crown: <><path d="M2 20h20l-2-12-5 5-5-8-5 8-5-5z" /></>,
    award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
    video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
    list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    scissors: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    film: <><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></>,
    gem: <><polygon points="6 3 18 3 22 9 12 22 2 9" /><line x1="11" y1="3" x2="8" y2="9" /><line x1="13" y1="3" x2="16" y2="9" /><line x1="2" y1="9" x2="22" y2="9" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    warning: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ videos: 0, playlists: 0, clips: 0 });
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    mobileNumber: "",
    address: "",
    country: "",
    gender: "prefer_not_to_say",
    birthDate: "",
  });

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmallMobile = windowWidth < 400;
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, videosRes, playlistsRes, clipsRes] =
          await Promise.all([
            API.get("/auth/profile"),
            API.get("/videos/my-videos").catch(() => ({ data: { count: 0 } })),
            API.get("/playlists/my").catch(() => ({ data: { count: 0 } })),
            API.get("/clips/my").catch(() => ({ data: { count: 0 } })),
          ]);

        const profileData = profileRes.data;
        setProfile(profileData);
        setStats({
          videos: videosRes.data.count || videosRes.data.videos?.length || 0,
          playlists: playlistsRes.data.count || playlistsRes.data.playlists?.length || 0,
          clips: clipsRes.data.count || clipsRes.data.clips?.length || 0,
        });

        setEditForm({
          name: profileData.name || "",
          username: profileData.username || "",
          mobileNumber: profileData.mobileNumber || "",
          address: profileData.address || "",
          country: profileData.country || "",
          gender: profileData.gender || "prefer_not_to_say",
          birthDate: profileData.birthDate
            ? new Date(profileData.birthDate).toISOString().split("T")[0]
            : "",
        });
      } catch (e) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const { data } = await API.put("/auth/profile", {
        name: editForm.name.trim(),
        username: editForm.username.trim() || undefined,
        mobileNumber: editForm.mobileNumber.trim(),
        address: editForm.address.trim(),
        country: editForm.country.trim(),
        gender: editForm.gender,
        birthDate: editForm.birthDate || undefined,
      });

      const updatedProfile = data.user || data;
      setProfile((prev) => ({ ...prev, ...updatedProfile }));

      if (updateUser) {
        updateUser({
          name: updatedProfile.name,
          username: updatedProfile.username,
          avatar: updatedProfile.avatar,
        });
      }

      toast.success("Profile updated");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: profile.name || "",
      username: profile.username || "",
      mobileNumber: profile.mobileNumber || "",
      address: profile.address || "",
      country: profile.country || "",
      gender: profile.gender || "prefer_not_to_say",
      birthDate: profile.birthDate
        ? new Date(profile.birthDate).toISOString().split("T")[0]
        : "",
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await API.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const avatarUrl = data.user?.avatar || data.avatar;

      if (avatarUrl) {
        setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
        if (updateUser) updateUser({ avatar: avatarUrl });
        toast.success("Avatar updated");
      } else {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const { data: updateData } = await API.put("/auth/profile", {
              avatar: reader.result,
            });
            const newAvatar = updateData.user?.avatar || updateData.avatar || reader.result;
            setProfile((prev) => ({ ...prev, avatar: newAvatar }));
            if (updateUser) updateUser({ avatar: newAvatar });
            toast.success("Avatar updated");
          } catch (err) {
            toast.error("Failed to upload avatar");
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await API.put("/auth/profile", { avatar: "" });
      setProfile((prev) => ({ ...prev, avatar: "" }));
      if (updateUser) updateUser({ avatar: "" });
      toast.success("Avatar removed");
    } catch (err) {
      toast.error("Failed to remove avatar");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const getAvatarUrl = () => {
    if (profile?.avatar) {
      if (profile.avatar.startsWith("http")) return profile.avatar;
      if (profile.avatar.startsWith("data:")) return profile.avatar;
      const baseURL =
        API.defaults.baseURL?.replace("/api", "") || "http://localhost:5000";
      return `${baseURL}${profile.avatar}`;
    }
    return null;
  };

  const getPlanStyle = (plan) => {
    const p = (plan || "free").toLowerCase();
    if (p === "gold") return { bg: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", icon: "crown" };
    if (p === "silver") return { bg: "linear-gradient(135deg, #94a3b8, #64748b)", color: "#fff", icon: "award" };
    if (p === "bronze") return { bg: "linear-gradient(135deg, #b45309, #92400e)", color: "#fff", icon: "award" };
    return { bg: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`, color: "#fff", icon: "shield" };
  };

  const formatJoinDate = (date) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: THEME.bgGradient }}>
        <div style={{ textAlign: "center", color: THEME.textSecondary }}>
          <div style={{
            width: 44, height: 44,
            border: `3px solid ${THEME.cardBorder}`,
            borderTopColor: THEME.accent,
            borderRightColor: THEME.accent,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ fontWeight: 600 }}>Loading profile...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) return null;

  const planStyle = getPlanStyle(profile.plan);
  const avatarUrl = getAvatarUrl();

  const avatarSize = isSmallMobile ? 90 : isMobile ? 100 : 120;

  return (
    <div style={{
      background: THEME.bgGradient,
      minHeight: "100vh",
      padding: isMobile ? "16px 12px" : "28px 24px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <style>{`
        * {
          -webkit-tap-highlight-color: transparent;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        html, body { overflow-x: hidden; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, select:focus {
          border-color: ${THEME.accent} !important;
          box-shadow: 0 0 0 3px rgba(217,119,6,0.12);
        }
        select {
          -webkit-appearance: none; -moz-appearance: none; appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236e6e73%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px !important;
        }
        @media (hover: hover) {
          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(217,119,6,0.15) !important;
            border-color: ${THEME.accentLight} !important;
          }
          .action-btn:hover {
            background: ${THEME.accentBg} !important;
            border-color: ${THEME.accentLight} !important;
            color: ${THEME.accentDark} !important;
            transform: translateY(-2px);
          }
          .action-btn:hover .action-icon-wrap {
            background: ${THEME.accent} !important;
            color: white !important;
          }
          .logout-btn:hover {
            background: ${THEME.danger} !important;
            color: white !important;
          }
          .edit-btn:hover {
            background: ${THEME.accentBg} !important;
            border-color: ${THEME.accentLight} !important;
            color: ${THEME.accentDark} !important;
          }
          .info-row:hover {
            border-color: ${THEME.accentLight} !important;
            background: #fefbf3 !important;
          }
        }
        .action-btn:active, .stat-card:active { transform: scale(0.98); }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* ============ HEADER CARD ============ */}
        <div style={{
          background: THEME.cardBg,
          borderRadius: 18,
          padding: 0,
          border: `1px solid ${THEME.cardBorder}`,
          boxShadow: "0 2px 8px rgba(28,28,30,0.05)",
          marginBottom: isMobile ? 14 : 20,
          overflow: "hidden",
        }}>
          {/* Cover gradient - GOLD */}
          <div style={{
            height: isMobile ? 90 : 130,
            background: `linear-gradient(135deg, ${THEME.accentDarker} 0%, ${THEME.accent} 50%, ${THEME.accentLight} 100%)`,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative glow */}
            <div style={{
              position: "absolute",
              top: -40, right: -40,
              width: 180, height: 180,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
              filter: "blur(30px)",
            }} />
            <div style={{
              position: "absolute",
              bottom: -60, left: "20%",
              width: 200, height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)",
              filter: "blur(40px)",
            }} />
          </div>

          {/* Main content */}
          <div style={{
            padding: isMobile ? "0 16px 20px" : "0 32px 28px",
            display: "flex",
            gap: isMobile ? 16 : 24,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
            textAlign: isMobile ? "center" : "left",
            position: "relative",
          }}>
            {/* Avatar */}
            <div style={{
              position: "relative",
              marginTop: isMobile ? -avatarSize / 2 : -avatarSize / 2,
              flexShrink: 0,
            }}>
              <div
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: "50%",
                  background: avatarUrl
                    ? `url(${avatarUrl}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${THEME.accentLight}, ${THEME.accentDark})`,
                  color: "white",
                  fontSize: avatarUrl ? 0 : avatarSize * 0.4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  border: `4px solid ${THEME.cardBg}`,
                  boxShadow: "0 6px 20px rgba(217,119,6,0.25)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  letterSpacing: "-0.02em",
                }}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
                title="Click to change avatar"
              >
                {!avatarUrl && profile.name?.charAt(0).toUpperCase()}
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(28,28,30,0.55)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: avatarHover ? 1 : 0, transition: "opacity 0.2s", color: "white",
                }}>
                  <Icon name="camera" size={24} />
                </div>
              </div>

              {uploadingAvatar && (
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(255,255,255,0.9)",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 28, height: 28, border: `3px solid ${THEME.accentBg}`,
                    borderTopColor: THEME.accent, borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }} />
                </div>
              )}

              {profile.authProvider === "google" && (
                <div style={{
                  position: "absolute", bottom: 4, right: 4, width: 28, height: 28,
                  borderRadius: "50%", background: "#fff", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  border: `2px solid ${THEME.cardBg}`,
                  boxShadow: "0 2px 8px rgba(28,28,30,0.15)",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />

              {avatarUrl && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}
                  style={{
                    position: "absolute", top: -2, right: -2, width: 26, height: 26,
                    borderRadius: "50%", background: THEME.danger, color: "white",
                    border: `2px solid ${THEME.cardBg}`, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                    boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
                  }}
                  title="Remove avatar"
                >
                  <Icon name="close" size={12} strokeWidth={3} />
                </button>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: isMobile ? 8 : 20, width: "100%" }}>
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400, margin: isMobile ? "0 auto" : "0" }}>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    style={{
                      fontSize: isMobile ? 20 : 24, fontWeight: 700, color: THEME.textPrimary,
                      border: `1.5px solid ${THEME.cardBorder}`, borderRadius: 10,
                      padding: "8px 12px", width: "100%", outline: "none", boxSizing: "border-box",
                      background: THEME.menuHover, fontFamily: "inherit", letterSpacing: "-0.01em",
                    }}
                  />
                  <input
                    name="username"
                    value={editForm.username}
                    onChange={handleChange}
                    placeholder="Username"
                    style={{
                      fontSize: 14, color: THEME.textSecondary,
                      border: `1.5px solid ${THEME.cardBorder}`, borderRadius: 8,
                      padding: "8px 12px", width: "100%", outline: "none", boxSizing: "border-box",
                      background: THEME.menuHover, fontFamily: "inherit",
                    }}
                  />
                </div>
              ) : (
                <>
                  <h1 style={{
                    margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 800,
                    color: THEME.textPrimary, letterSpacing: "-0.02em", wordBreak: "break-word",
                  }}>
                    {profile.name}
                  </h1>
                  {profile.username && (
                    <p style={{
                      color: THEME.accent,
                      margin: "4px 0 0",
                      fontSize: 14,
                      fontWeight: 600,
                    }}>
                      @{profile.username}
                    </p>
                  )}
                </>
              )}

              <div style={{
                display: "flex", alignItems: "center", gap: 6, marginTop: 10,
                fontSize: 13, color: THEME.textSecondary, flexWrap: "wrap",
                justifyContent: isMobile ? "center" : "flex-start",
                fontWeight: 500,
              }}>
                <Icon name="mail" size={14} color={THEME.accent} />
                <span style={{ wordBreak: "break-all" }}>{profile.email}</span>
                {profile.authProvider === "google" && (
                  <span style={{
                    fontSize: 10, background: THEME.accentBg, color: THEME.accentDark,
                    padding: "2px 7px", borderRadius: 4, fontWeight: 700,
                    border: `1px solid ${THEME.accentBgHover}`,
                  }}>
                    Google
                  </span>
                )}
              </div>

              <div style={{
                display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14,
                justifyContent: isMobile ? "center" : "flex-start",
              }}>
                <span style={{
                  background: planStyle.bg, color: planStyle.color,
                  padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800,
                  textTransform: "uppercase", letterSpacing: 0.5,
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
                }}>
                  <Icon name={planStyle.icon} size={13} />
                  {profile.plan || "free"} Plan
                </span>

                <span style={{
                  background: THEME.menuHover, color: THEME.textSecondary,
                  padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                  border: `1px solid ${THEME.cardBorder}`,
                }}>
                  <Icon name="calendar" size={13} color={THEME.accent} />
                  Joined {formatJoinDate(profile.createdAt)}
                </span>
              </div>
            </div>

            {/* Edit / Save Button */}
            <div style={{
              flexShrink: 0, paddingTop: isMobile ? 4 : 20,
              width: isMobile ? "100%" : "auto",
            }}>
              {isEditing ? (
                <div style={{ display: "flex", gap: 8, width: isMobile ? "100%" : "auto" }}>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      flex: isMobile ? 1 : "none",
                      padding: "10px 18px", background: "transparent",
                      color: THEME.textPrimary, border: `1px solid ${THEME.cardBorder}`,
                      borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      flex: isMobile ? 1 : "none",
                      padding: "10px 20px",
                      background: saving ? "#cbd5e1" : `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                      color: "white", border: "none", borderRadius: 10,
                      fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      fontFamily: "inherit",
                      boxShadow: "0 3px 10px rgba(217,119,6,0.3)",
                    }}
                  >
                    <Icon name="save" size={14} />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              ) : (
                <button
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                  style={{
                    width: isMobile ? "100%" : "auto",
                    padding: "10px 20px", background: THEME.cardBg,
                    color: THEME.textPrimary, border: `1.5px solid ${THEME.cardBorder}`,
                    borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}
                >
                  <Icon name="edit" size={14} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ============ EDIT FORM ============ */}
        {isEditing && (
          <div style={{
            background: THEME.cardBg, borderRadius: 16,
            padding: isMobile ? 16 : 24,
            border: `1.5px solid ${THEME.accent}`,
            boxShadow: `0 0 0 3px ${THEME.accentBg}, 0 4px 20px rgba(217,119,6,0.15)`,
            marginBottom: isMobile ? 14 : 20,
            animation: "fadeIn 0.3s ease",
          }}>
            <h2 style={{
              fontSize: isMobile ? 15 : 17, fontWeight: 800, color: THEME.textPrimary,
              margin: "0 0 18px 0", display: "flex", alignItems: "center", gap: 10,
              letterSpacing: "-0.01em",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${THEME.accentBgHover}`,
              }}>
                <Icon name="edit" size={16} color={THEME.accent} />
              </div>
              Edit Profile Details
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 14,
            }}>
              <div>
                <label style={labelStyle}>Gender</label>
                <select name="gender" value={editForm.gender} onChange={handleChange} style={inputStyle}>
                  {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Birth Date</label>
                <input type="date" name="birthDate" value={editForm.birthDate} onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Mobile Number</label>
                <input type="tel" name="mobileNumber" value={editForm.mobileNumber} onChange={handleChange}
                  placeholder="+91 9876543210" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Country</label>
                <input type="text" name="country" value={editForm.country} onChange={handleChange}
                  placeholder="India" style={inputStyle} />
              </div>

              <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}>
                <label style={labelStyle}>Address</label>
                <input type="text" name="address" value={editForm.address} onChange={handleChange}
                  placeholder="123 Main Street, City" style={inputStyle} />
              </div>
            </div>

            <div style={{
              display: "flex", gap: 10, marginTop: 22,
              justifyContent: isMobile ? "stretch" : "flex-end",
              flexDirection: isMobile ? "column-reverse" : "row",
            }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: "11px 24px", background: "transparent",
                  color: THEME.textPrimary, border: `1px solid ${THEME.cardBorder}`,
                  borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "11px 28px",
                  background: saving ? "#cbd5e1" : `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                  color: "white", border: "none", borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(217,119,6,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "inherit",
                }}
              >
                <Icon name="save" size={15} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* ============ STATS GRID ============ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
          gap: isMobile ? 10 : 16,
          marginBottom: isMobile ? 14 : 20,
        }}>
          <StatCard iconName="video" label="Videos" value={stats.videos} color={THEME.accent} to="/my-videos" description="View all your videos" isMobile={isMobile} />
          <StatCard iconName="list" label="Playlists" value={stats.playlists} color={THEME.success} to="/playlists" description="Manage your playlists" isMobile={isMobile} />
          <StatCard iconName="scissors" label="Clips" value={stats.clips} color={THEME.warning} to="/my-clips" description="Your created clips" isMobile={isMobile} />
        </div>

        {/* ============ QUICK ACTIONS ============ */}
        <div style={{
          background: THEME.cardBg, borderRadius: 16,
          padding: isMobile ? 16 : 24,
          border: `1px solid ${THEME.cardBorder}`,
          marginBottom: isMobile ? 14 : 20,
          boxShadow: "0 2px 8px rgba(28,28,30,0.04)",
        }}>
          <h2 style={sectionTitleStyle(isMobile)}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginRight: 10, border: `1px solid ${THEME.accentBgHover}`,
            }}>
              <Icon name="upload" size={16} color={THEME.accent} />
            </div>
            Quick Actions
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(180px, 1fr))",
            gap: isMobile ? 8 : 10,
          }}>
            <ActionButton iconName="upload" label="Upload Video" onClick={() => navigate("/upload")} />
            <ActionButton iconName="clock" label="Watch History" onClick={() => navigate("/history")} />
            <ActionButton iconName="download" label="Downloads" onClick={() => navigate("/downloads")} />
            <ActionButton iconName="film" label="My Videos" onClick={() => navigate("/my-videos")} />
            <ActionButton iconName="gem" label="Plans & Billing" onClick={() => navigate("/subscription")} />
            <ActionButton iconName="shield" label="Security" onClick={() => navigate("/security")} />
          </div>
        </div>

        {/* ============ ACCOUNT INFO ============ */}
        <div style={{
          background: THEME.cardBg, borderRadius: 16,
          padding: isMobile ? 16 : 24,
          border: `1px solid ${THEME.cardBorder}`,
          marginBottom: isMobile ? 14 : 20,
          boxShadow: "0 2px 8px rgba(28,28,30,0.04)",
        }}>
          <h2 style={sectionTitleStyle(isMobile)}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginRight: 10, border: `1px solid ${THEME.accentBgHover}`,
            }}>
              <Icon name="user" size={16} color={THEME.accent} />
            </div>
            Account Information
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <InfoRow iconName="user" label="Full Name" value={profile.name} />
            {profile.username && <InfoRow iconName="at" label="Username" value={`@${profile.username}`} />}
            <InfoRow iconName="mail" label="Email" value={profile.email} />
            <InfoRow iconName="award" label="Membership" value={<span style={{ textTransform: "capitalize" }}>{profile.plan || "Free"} Plan</span>} />
            <InfoRow iconName="calendar" label="Member Since" value={formatJoinDate(profile.createdAt)} />
            {profile.gender && profile.gender !== "prefer_not_to_say" && (
              <InfoRow iconName="users" label="Gender" value={<span style={{ textTransform: "capitalize" }}>{profile.gender}</span>} />
            )}
            {profile.mobileNumber && <InfoRow iconName="phone" label="Mobile" value={profile.mobileNumber} />}
            {profile.country && <InfoRow iconName="globe" label="Country" value={profile.country} />}
            {profile.address && <InfoRow iconName="pin" label="Address" value={profile.address} />}
            {profile.authProvider && (
              <InfoRow iconName="lock" label="Auth Method" value={<span style={{ textTransform: "capitalize" }}>{profile.authProvider}</span>} />
            )}
          </div>
        </div>

        {/* ============ SIGN OUT ============ */}
        <div style={{
          background: THEME.cardBg, borderRadius: 16,
          padding: isMobile ? 16 : 24,
          border: `1px solid ${THEME.cardBorder}`,
          boxShadow: "0 2px 8px rgba(28,28,30,0.04)",
        }}>
          <h2 style={{
            fontSize: isMobile ? 15 : 17, fontWeight: 800, color: THEME.danger,
            margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: 10,
            letterSpacing: "-0.01em",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: THEME.dangerBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid #fecaca`,
            }}>
              <Icon name="warning" size={16} color={THEME.danger} />
            </div>
            Session
          </h2>
          <p style={{ color: THEME.textSecondary, fontSize: 13, margin: "0 0 16px 0", fontWeight: 500 }}>
            Signing out will end your current session.
          </p>
          <button
            className="logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              padding: "11px 24px", background: "transparent",
              color: THEME.danger, border: `1.5px solid ${THEME.danger}`,
              borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
              fontFamily: "inherit",
              width: isMobile ? "100%" : "auto",
              justifyContent: "center",
            }}
          >
            <Icon name="logout" size={15} />
            Sign Out
          </button>
        </div>
      </div>

      {/* ============ LOGOUT MODAL ============ */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(28,28,30,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, backdropFilter: "blur(6px)", padding: 16,
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: THEME.cardBg, border: `1px solid ${THEME.cardBorder}`,
              borderRadius: 18, padding: isMobile ? 24 : 32,
              width: "100%", maxWidth: 420,
              boxShadow: "0 20px 60px rgba(28,28,30,0.25)", textAlign: "center",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: THEME.dangerBg, display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px",
              border: `1px solid #fecaca`,
            }}>
              <Icon name="logout" size={28} color={THEME.danger} />
            </div>
            <h2 style={{
              margin: "0 0 8px 0", color: THEME.textPrimary, fontSize: 20, fontWeight: 800,
              letterSpacing: "-0.01em",
            }}>
              Sign Out?
            </h2>
            <p style={{ color: THEME.textSecondary, fontSize: 14, margin: "0 0 24px 0", fontWeight: 500 }}>
              Are you sure you want to sign out?
            </p>
            <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column-reverse" : "row" }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: 12, background: "transparent",
                  color: THEME.textPrimary, border: `1px solid ${THEME.cardBorder}`,
                  borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14,
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1, padding: 12,
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "white", border: "none", borderRadius: 10,
                  cursor: "pointer", fontWeight: 700, fontSize: 14,
                  fontFamily: "inherit", boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
                }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ HELPERS ============
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 700,
  color: THEME.textPrimary, marginBottom: 6, letterSpacing: 0.3,
  textTransform: "uppercase",
};

const inputStyle = {
  width: "100%", padding: "11px 14px",
  border: `1.5px solid ${THEME.cardBorder}`, borderRadius: 10,
  fontSize: 14, fontFamily: "inherit", outline: "none",
  background: THEME.bg, color: THEME.textPrimary,
  boxSizing: "border-box", transition: "all 0.2s",
  fontWeight: 500,
};

const sectionTitleStyle = (isMobile) => ({
  fontSize: isMobile ? 15 : 17,
  fontWeight: 800,
  color: THEME.textPrimary,
  margin: "0 0 16px 0",
  letterSpacing: "-0.01em",
  display: "flex",
  alignItems: "center",
});

// ============ SUB COMPONENTS ============
const StatCard = ({ iconName, label, value, color, to, description, isMobile }) => (
  <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
    <div
      className="stat-card"
      style={{
        background: THEME.cardBg,
        border: `1px solid ${THEME.cardBorder}`,
        borderRadius: 14,
        padding: isMobile ? 16 : 20,
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 2px 6px rgba(28,28,30,0.04)",
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: `${color}18`, color: color,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        border: `1px solid ${color}25`,
      }}>
        <Icon name={iconName} size={24} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: isMobile ? 26 : 30, fontWeight: 800, color: THEME.textPrimary,
          lineHeight: 1.1, letterSpacing: "-0.02em",
        }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textPrimary, marginTop: 3 }}>{label}</div>
        <div style={{
          fontSize: 11, color: THEME.textSecondary, marginTop: 3,
          display: "flex", alignItems: "center", gap: 4, fontWeight: 500,
        }}>
          {description}
          <Icon name="arrow" size={11} color={color} />
        </div>
      </div>
    </div>
  </Link>
);

const ActionButton = ({ iconName, label, onClick }) => (
  <button
    className="action-btn"
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px", background: THEME.menuHover,
      color: THEME.textPrimary, border: `1px solid ${THEME.cardBorder}`,
      borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
      textAlign: "left", transition: "all 0.2s", fontFamily: "inherit",
      width: "100%",
    }}
  >
    <span
      className="action-icon-wrap"
      style={{
        width: 32, height: 32, borderRadius: 8,
        background: THEME.accentBg, color: THEME.accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.2s",
        border: `1px solid ${THEME.accentBgHover}`,
      }}
    >
      <Icon name={iconName} size={16} />
    </span>
    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
  </button>
);

const InfoRow = ({ iconName, label, value }) => (
  <div
    className="info-row"
    style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 14px", background: THEME.menuHover, borderRadius: 10,
      border: `1px solid ${THEME.cardBorder}`, gap: 12,
      transition: "all 0.2s",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <span style={{ color: THEME.accent, display: "flex", flexShrink: 0 }}>
        <Icon name={iconName} size={16} />
      </span>
      <span style={{ color: THEME.textSecondary, fontSize: 13, fontWeight: 600 }}>{label}</span>
    </div>
    <span style={{
      color: THEME.textPrimary, fontSize: 13, fontWeight: 700,
      textAlign: "right", wordBreak: "break-word", minWidth: 0,
    }}>{value}</span>
  </div>
);

export default Profile;