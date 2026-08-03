import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

// ✅ UNIFIED THEME - Warm off-white with gold accents
const THEME = {
  bg: "#f4f2ee",
  bgGradient: "linear-gradient(180deg, #f4f2ee 0%, #eeece7 100%)",
  cardBg: "#ffffff",
  cardBorder: "#e8e5df",
  cardHoverBorder: "#fbbf24",
  textPrimary: "#1c1c1e",
  textSecondary: "#6e6e73",
  textMuted: "#8e8e93",
  accent: "#d97706",
  accentLight: "#fbbf24",
  accentDark: "#b45309",
  accentDarker: "#92400e",
  accentBg: "#fef3c7",
  accentBgHover: "#fde68a",
  success: "#10b981",
  warning: "#f59e0b",
  warningBg: "#fef3c7",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  menuHover: "#faf7f0",
  inputBg: "#faf7f0",
};

const CATEGORIES = [
  "Live Content", "LangChain & AI", "Comedy Shows", "Music Mixes",
  "UPSC Motivation", "Thrillers", "Animation", "Sci-Fi",
  "Sports", "Movies", "Automobile", "General",
];

// SVG Icons
const Icon = ({ name, size = 18, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />,
    check: <polyline points="20 6 9 17 4 12" />,
    warning: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    ban: <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    cloud: <><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></>,
    crown: <><path d="M2 20h20l-2-10-5 4-3-8-3 8-5-4z" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>,
    text: <><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></>,
    fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>,
    tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const Upload = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
  title: "",
  description: "",
  category: "General",
  isPremium: false,
  allowedPlans: ["free"],  // ✅ Only "free" selected by default
  duration: 0,
});
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [moderationResult, setModerationResult] = useState(null);
  const [isShort, setIsShort] = useState(false);

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
  const isDesktop = windowWidth >= 1024;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 500) {
      toast.error(`File too large: ${sizeMB.toFixed(1)}MB. Max 500MB`);
      return;
    }

    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";

    videoEl.onloadedmetadata = () => {
      const duration = Math.floor(videoEl.duration);
      setForm((prev) => ({ ...prev, duration }));

      if (duration <= 60) {
        setIsShort(true);
        toast.success(`⚡ Short detected! (${duration}s)`, { duration: 3000 });
      } else {
        setIsShort(false);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        toast.success(`📹 Video: ${mins}m ${secs}s`, { duration: 2000 });
      }

      URL.revokeObjectURL(videoEl.src);
    };

    videoEl.onerror = () => {
      URL.revokeObjectURL(videoEl.src);
    };

    videoEl.src = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handlePlanToggle = (plan) => {
  // ✅ Radio behavior — only one plan at a time
  setForm((prev) => ({
    ...prev,
    allowedPlans: [plan],
    // ✅ Auto-disable premium if "free" is selected
    isPremium: plan === "free" ? false : prev.isPremium,
  }));
};

  const checkModeration = async () => {
    if (!form.title && !form.description) return;
    try {
      const { data } = await API.post("/moderate/check", {
        title: form.title,
        description: form.description,
      });
      setModerationResult(data);
    } catch (error) {
      setModerationResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Title required");
    if (!videoFile) return toast.error("Video file required");
    if (form.allowedPlans.length === 0) {
      return toast.error("Select at least one access plan");
    }
    if (moderationResult?.blocked) {
      return toast.error("Please fix blocked content first");
    }

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("isPremium", form.isPremium);
    formData.append("allowedPlans", JSON.stringify(form.allowedPlans));
    formData.append("duration", form.duration || 0);
    formData.append("video", videoFile);
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    try {
      const { data } = await API.post("/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 10 * 60 * 1000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          }
        },
      });

      if (data.isShort || isShort) {
        toast.success("⚡ Short uploaded successfully!");
      } else {
        toast.success("✅ Video uploaded!");
      }

      if (data.warning) toast(`⚠️ ${data.warning}`, { icon: "⚠️" });

      navigate(isShort ? "/shorts" : "/");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Upload failed";
      toast.error(msg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const planConfig = {
    free: {
      bg: `linear-gradient(135deg, #64748b, #475569)`,
      icon: "users",
      label: "Free",
    },
    bronze: {
      bg: "linear-gradient(135deg, #cd7f32, #a0522d)",
      icon: "tag",
      label: "Bronze",
    },
    silver: {
      bg: "linear-gradient(135deg, #94a3b8, #64748b)",
      icon: "tag",
      label: "Silver",
    },
    gold: {
      bg: `linear-gradient(135deg, ${THEME.accentLight}, ${THEME.accentDark})`,
      icon: "crown",
      label: "Gold",
    },
  };

  const uploadRowGrid = isMobile
    ? "1fr"
    : isTablet
    ? "1fr 240px"
    : "1fr 280px";

  const twoColGrid = isMobile ? "1fr" : "1fr 1fr";

  return (
    <div style={styles.page(isMobile, isTablet)}>
      <style>{globalStyles}</style>

      <div style={styles.card(isMobile, isTablet)}>
        {/* Header */}
        <div style={styles.header(isMobile)}>
          <div style={styles.headerIcon(isMobile)}>
            <Icon name="upload" size={isMobile ? 20 : 24} color={THEME.accent} />
          </div>
          <div>
            <h1 style={styles.title(isMobile)}>Upload Video</h1>
            <p style={styles.subtitle(isMobile)}>
              Share your content with the world
            </p>
          </div>
        </div>

        {/* Moderation alerts */}
        {moderationResult?.blocked && (
          <div style={styles.alertDanger(isMobile)}>
            <div style={styles.alertIconWrap(THEME.danger)}>
              <Icon name="ban" size={16} color={THEME.danger} />
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Content Blocked</div>
              <div style={{ fontSize: 12 }}>{moderationResult.reason}</div>
            </div>
          </div>
        )}

        {moderationResult?.warning && !moderationResult?.blocked && (
          <div style={styles.alertWarning(isMobile)}>
            <div style={styles.alertIconWrap(THEME.warning)}>
              <Icon name="warning" size={16} color={THEME.warning} />
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Warning</div>
              <div style={{ fontSize: 12 }}>{moderationResult.warning}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Video + Thumbnail Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: uploadRowGrid,
            gap: isMobile ? 16 : 20,
            marginBottom: isMobile ? 18 : 24,
          }}>
            {/* Video File */}
            <div>
              <label style={styles.label(isMobile)}>
                <Icon name="video" size={14} color={THEME.accent} />
                Video File <span style={{ color: THEME.danger }}>*</span>
              </label>
              <label
                className="dropzone"
                style={styles.dropzoneLarge(isMobile)}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  style={{ display: "none" }}
                />
                {videoPreview ? (
                  <video
                    src={videoPreview}
                    controls
                    style={{
                      maxWidth: "100%",
                      maxHeight: isMobile ? 160 : 180,
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <>
                    <div style={styles.dropzoneIconWrap}>
                      <Icon name="video" size={isMobile ? 28 : 32} color={THEME.accent} />
                    </div>
                    <div style={styles.dropzoneTitle(isMobile)}>
                      {isMobile ? "Tap to select video" : "Select or drag video to upload"}
                    </div>
                    <div style={styles.dropzoneSubtitle(isMobile)}>
                      MP4, MOV, AVI, MKV, WEBM • Max 500MB
                    </div>
                    <div style={styles.dropzoneHint(isMobile)}>
                      <Icon name="zap" size={11} color={THEME.accent} />
                      Videos ≤ 60s become Shorts automatically
                    </div>
                  </>
                )}
              </label>
              {videoFile && (
                <div style={styles.fileInfo(isMobile)}>
                  <div style={styles.fileInfoRow}>
                    <span style={styles.fileName}>📁 {videoFile.name}</span>
                    <span style={styles.fileSize}>
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  {form.duration > 0 && (
                    <div style={styles.fileDuration}>
                      <Icon name="clock" size={11} color={THEME.textSecondary} />
                      <span>{form.duration}s</span>
                      {isShort && (
                        <span style={styles.shortBadge}>
                          <Icon name="zap" size={9} color="white" />
                          SHORT
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail */}
            <div>
              <label style={styles.label(isMobile)}>
                <Icon name="image" size={14} color={THEME.accent} />
                Thumbnail
                <span style={styles.optionalTag}>optional</span>
              </label>
              <label
                className="dropzone"
                style={styles.dropzoneThumb(isMobile)}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  style={{ display: "none" }}
                />
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: isMobile ? 130 : 180,
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <>
                    <div style={styles.dropzoneIconWrap}>
                      <Icon name="image" size={isMobile ? 24 : 28} color={THEME.accent} />
                    </div>
                    <div style={styles.dropzoneThumbText(isMobile)}>
                      Select a custom<br />
                      thumbnail image
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Title + Category Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: twoColGrid,
            gap: isMobile ? 16 : 20,
            marginBottom: isMobile ? 16 : 20,
          }}>
            <div>
              <label style={styles.label(isMobile)}>
                <Icon name="text" size={14} color={THEME.accent} />
                Title <span style={{ color: THEME.danger }}>*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                onBlur={checkModeration}
                placeholder={isShort ? "Enter short title (catchy!)" : "e.g., My Awesome Vlog"}
                required
                style={styles.input(isMobile)}
              />
            </div>

            <div>
              <label style={styles.label(isMobile)}>
                <Icon name="tag" size={14} color={THEME.accent} />
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={styles.select(isMobile)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description + Access Plans Row */}
          {/* Description + Access Plans Row */}
<div style={{
  display: "grid",
  gridTemplateColumns: twoColGrid,
  gap: isMobile ? 16 : 20,
  marginBottom: isMobile ? 16 : 20,
}}>
  {/* ✅ DESCRIPTION - This was missing! */}
  <div>
    <label style={styles.label(isMobile)}>
      <Icon name="fileText" size={14} color={THEME.accent} />
      Description
    </label>
    <textarea
      name="description"
      value={form.description}
      onChange={handleChange}
      onBlur={checkModeration}
      placeholder="Enter a brief description to help viewers find your video..."
      rows={4}
      style={styles.textarea(isMobile)}
    />
  </div>

  {/* ACCESS PLANS */}
  <div>
    <label style={styles.label(isMobile)}>
      <Icon name="lock" size={14} color={THEME.accent} />
      Access Plan
      <span style={{
        fontSize: 10,
        color: THEME.textMuted,
        fontWeight: 500,
        marginLeft: 4,
      }}>
        (choose one)
      </span>
    </label>
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8,
    }}>
      {["free", "bronze", "silver", "gold"].map((plan) => {
        const isActive = form.allowedPlans.includes(plan);
        const config = planConfig[plan];
        return (
          <label
            key={plan}
            className="plan-btn"
            style={{
              padding: isMobile ? "11px 10px" : "12px 14px",
              borderRadius: 10,
              background: isActive ? config.bg : THEME.inputBg,
              color: isActive ? "white" : THEME.textMuted,
              cursor: "pointer",
              fontSize: isMobile ? 13 : 14,
              fontWeight: 700,
              textTransform: "capitalize",
              transition: "all 0.2s",
              boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
              textAlign: "center",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              border: isActive ? "2px solid rgba(255,255,255,0.3)" : `1px solid ${THEME.cardBorder}`,
              letterSpacing: "-0.01em",
              position: "relative",
            }}
          >
            <input
              type="radio"
              name="accessPlan"
              checked={isActive}
              onChange={() => handlePlanToggle(plan)}
              style={{ display: "none" }}
            />
            <Icon name={config.icon} size={13} color={isActive ? "white" : THEME.textMuted} />
            {config.label}
            {isActive && (
              <div style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              }}>
                <Icon name="check" size={11} color={THEME.accent} strokeWidth={3} />
              </div>
            )}
          </label>
        );
      })}
    </div>
    {form.allowedPlans.includes("free") && (
      <div style={{
        marginTop: 8,
        fontSize: 11,
        color: THEME.textMuted,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 10px",
        background: THEME.menuHover,
        borderRadius: 8,
      }}>
        <Icon name="users" size={12} color={THEME.textMuted} />
        Free plan — accessible to everyone, premium disabled
      </div>
    )}
  </div>
</div>

          {/* Premium Toggle — Hidden/Disabled for Free plan */}
<div style={{
  ...styles.premiumRow(isMobile),
  opacity: form.allowedPlans.includes("free") ? 0.5 : 1,
  pointerEvents: form.allowedPlans.includes("free") ? "none" : "auto",
  position: "relative",
}}>
  <div style={styles.premiumLeft}>
    <div style={styles.premiumIconWrap}>
      <Icon name="crown" size={18} color={
        form.allowedPlans.includes("free") ? THEME.textMuted : THEME.accent
      } />
    </div>
    <div>
      <div style={{
        ...styles.premiumTitle(isMobile),
        color: form.allowedPlans.includes("free") ? THEME.textMuted : THEME.accentDarker,
      }}>
        Mark as Premium
        {form.allowedPlans.includes("free") && (
          <span style={{
            fontSize: 10,
            color: THEME.textMuted,
            fontWeight: 500,
            marginLeft: 6,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            (not available for free)
          </span>
        )}
      </div>
      <div style={styles.premiumSubtitle(isMobile)}>
        {form.allowedPlans.includes("free")
          ? "Switch to a paid plan to enable premium content"
          : "Only paid users can watch this content"
        }
      </div>
    </div>
  </div>
  <label style={styles.toggleWrap}>
    <input
      type="checkbox"
      name="isPremium"
      checked={form.isPremium}
      onChange={handleChange}
      disabled={form.allowedPlans.includes("free")}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <span style={{
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      background: form.allowedPlans.includes("free")
        ? "#e2e8f0"
        : form.isPremium
        ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`
        : "#d1d5db",
      borderRadius: 24,
      transition: "0.3s",
      boxShadow: form.isPremium && !form.allowedPlans.includes("free")
        ? "0 2px 6px rgba(217,119,6,0.3)"
        : "none",
    }} />
    <span style={{
      position: "absolute",
      height: 20,
      width: 20,
      left: form.isPremium && !form.allowedPlans.includes("free") ? 26 : 3,
      top: 3,
      background: "white",
      borderRadius: "50%",
      transition: "0.3s",
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    }} />
  </label>

  {/* Disabled overlay for free plan */}
  {form.allowedPlans.includes("free") && (
    <div style={{
      position: "absolute",
      top: 6,
      right: 10,
      fontSize: 9,
      color: THEME.textMuted,
      fontWeight: 600,
      padding: "2px 8px",
      background: THEME.menuHover,
      borderRadius: 4,
      border: `1px solid ${THEME.cardBorder}`,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    }}>
      Disabled
    </div>
  )}
</div>

          {/* Short indicator */}
          {isShort && videoFile && (
            <div style={styles.shortBanner(isMobile)}>
              <div style={styles.shortBannerIcon}>
                <Icon name="zap" size={isMobile ? 22 : 26} color="white" />
              </div>
              <div>
                <div style={styles.shortBannerTitle(isMobile)}>
                  Uploading as a Short!
                </div>
                <div style={styles.shortBannerText(isMobile)}>
                  Videos under 60 seconds appear on the Shorts page
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {loading && (
            <div style={{ marginBottom: 16 }}>
              <div style={styles.progressWrap}>
                <div style={{
                  width: `${progress}%`,
                  background: isShort
                    ? `linear-gradient(90deg, ${THEME.danger}, ${THEME.warning})`
                    : `linear-gradient(90deg, ${THEME.accent}, ${THEME.accentDark})`,
                  height: 24,
                  transition: "width 0.3s",
                  color: "white",
                  textAlign: "center",
                  fontSize: 12,
                  lineHeight: "24px",
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}>
                  {progress}%
                </div>
              </div>
              <div style={styles.progressLabel}>
                <Icon name="cloud" size={12} color={THEME.textSecondary} />
                Uploading your {isShort ? "short" : "video"}...
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
            style={{
              width: "100%",
              padding: isMobile ? "13px" : "14px",
              background: loading
                ? THEME.cardBorder
                : isShort
                ? `linear-gradient(135deg, ${THEME.danger}, ${THEME.warning})`
                : `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: isMobile ? 14 : 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: loading
                ? "none"
                : isShort
                ? "0 6px 18px rgba(239,68,68,0.4)"
                : "0 6px 18px rgba(217,119,6,0.4)",
              transition: "all 0.2s",
              fontFamily: "inherit",
              letterSpacing: "-0.01em",
            }}
          >
            {loading ? (
              <>
                <div style={styles.btnSpinner} />
                Uploading... {progress}%
              </>
            ) : isShort ? (
              <>
                <Icon name="zap" size={16} color="white" />
                Upload Short
              </>
            ) : (
              <>
                <Icon name="cloud" size={16} color="white" />
                Upload Video
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ================== STYLES ================== */
const styles = {
  page: (isMobile, isTablet) => ({
    minHeight: "100vh",
    background: THEME.bgGradient,
    padding: isMobile ? "16px 12px" : isTablet ? "28px 20px" : "40px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    boxSizing: "border-box",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  }),
  card: (isMobile, isTablet) => ({
    background: THEME.cardBg,
    borderRadius: isMobile ? 16 : 20,
    boxShadow: "0 8px 32px rgba(28,28,30,0.06)",
    padding: isMobile ? "20px 16px" : isTablet ? "28px" : "36px",
    maxWidth: 920,
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid ${THEME.cardBorder}`,
  }),
  header: (isMobile) => ({
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 12 : 14,
    marginBottom: isMobile ? 22 : 30,
    paddingBottom: isMobile ? 20 : 24,
    borderBottom: `1px solid ${THEME.cardBorder}`,
  }),
  headerIcon: (isMobile) => ({
    width: isMobile ? 44 : 52,
    height: isMobile ? 44 : 52,
    background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: `1px solid ${THEME.accentBgHover}`,
    boxShadow: "0 2px 8px rgba(217,119,6,0.12)",
  }),
  title: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? 22 : 26,
    fontWeight: 800,
    color: THEME.textPrimary,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  }),
  subtitle: (isMobile) => ({
    margin: "4px 0 0 0",
    color: THEME.textSecondary,
    fontSize: isMobile ? 12 : 14,
    fontWeight: 500,
  }),
  alertDanger: (isMobile) => ({
    background: THEME.dangerBg,
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: 12,
    marginBottom: 16,
    border: `1px solid #fecaca`,
    fontSize: isMobile ? 13 : 14,
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  }),
  alertWarning: (isMobile) => ({
    background: THEME.accentBg,
    color: THEME.accentDarker,
    padding: "12px 16px",
    borderRadius: 12,
    marginBottom: 16,
    border: `1px solid ${THEME.accentBgHover}`,
    fontSize: isMobile ? 13 : 14,
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  }),
  alertIconWrap: (color) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: `1px solid ${color}30`,
  }),
  label: (isMobile) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: isMobile ? 13 : 14,
    fontWeight: 700,
    color: THEME.textPrimary,
    marginBottom: 8,
    letterSpacing: "-0.01em",
  }),
  optionalTag: {
    fontSize: 10,
    color: THEME.textMuted,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    padding: "2px 6px",
    background: THEME.menuHover,
    borderRadius: 4,
  },
  dropzoneLarge: (isMobile) => ({
    border: `2px dashed ${THEME.cardBorder}`,
    borderRadius: 14,
    padding: isMobile ? "24px 16px" : "32px 20px",
    textAlign: "center",
    cursor: "pointer",
    background: THEME.inputBg,
    transition: "all 0.2s",
    minHeight: isMobile ? 200 : 240,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
  }),
  dropzoneThumb: (isMobile) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: `2px dashed ${THEME.cardBorder}`,
    borderRadius: 14,
    padding: 20,
    textAlign: "center",
    cursor: "pointer",
    background: THEME.inputBg,
    minHeight: isMobile ? 160 : 240,
    transition: "all 0.2s",
    width: "100%",
    boxSizing: "border-box",
  }),
  dropzoneIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    border: `1px solid ${THEME.accentBgHover}`,
    boxShadow: "0 4px 12px rgba(217,119,6,0.15)",
  },
  dropzoneTitle: (isMobile) => ({
    fontSize: isMobile ? 14 : 16,
    fontWeight: 700,
    color: THEME.textPrimary,
    marginBottom: 6,
    letterSpacing: "-0.01em",
  }),
  dropzoneSubtitle: (isMobile) => ({
    fontSize: isMobile ? 11 : 13,
    color: THEME.textSecondary,
    fontWeight: 500,
    marginBottom: 8,
  }),
  dropzoneHint: (isMobile) => ({
    fontSize: isMobile ? 11 : 12,
    color: THEME.accentDark,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    background: THEME.accentBg,
    borderRadius: 20,
    border: `1px solid ${THEME.accentBgHover}`,
    marginTop: 4,
  }),
  dropzoneThumbText: (isMobile) => ({
    fontSize: isMobile ? 12 : 13,
    color: THEME.textSecondary,
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: "-0.01em",
  }),
  fileInfo: (isMobile) => ({
    marginTop: 10,
    padding: "10px 14px",
    background: THEME.accentBg,
    borderRadius: 10,
    border: `1px solid ${THEME.accentBgHover}`,
  }),
  fileInfoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  fileName: {
    fontSize: 12,
    color: THEME.accentDarker,
    fontWeight: 600,
    wordBreak: "break-word",
    flex: 1,
    minWidth: 0,
  },
  fileSize: {
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: 700,
    padding: "2px 8px",
    background: "white",
    borderRadius: 6,
    border: `1px solid ${THEME.accentBgHover}`,
    flexShrink: 0,
  },
  fileDuration: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: 600,
    flexWrap: "wrap",
  },
  shortBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    background: `linear-gradient(135deg, ${THEME.danger}, ${THEME.warning})`,
    color: "white",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.5,
    boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
  },
  input: (isMobile) => ({
    width: "100%",
    padding: isMobile ? "11px 14px" : "12px 16px",
    borderRadius: 10,
    border: `1.5px solid ${THEME.cardBorder}`,
    fontSize: isMobile ? 13 : 14,
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: THEME.inputBg,
    color: THEME.textPrimary,
    fontWeight: 500,
  }),
  select: (isMobile) => ({
    width: "100%",
    padding: isMobile ? "11px 14px" : "12px 16px",
    borderRadius: 10,
    border: `1.5px solid ${THEME.cardBorder}`,
    fontSize: isMobile ? 13 : 14,
    outline: "none",
    background: THEME.inputBg,
    cursor: "pointer",
    boxSizing: "border-box",
    color: THEME.textPrimary,
    fontFamily: "inherit",
    fontWeight: 500,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236e6e73%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: 40,
  }),
  textarea: (isMobile) => ({
    width: "100%",
    padding: isMobile ? "11px 14px" : "12px 16px",
    borderRadius: 10,
    border: `1.5px solid ${THEME.cardBorder}`,
    fontSize: isMobile ? 13 : 14,
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: THEME.inputBg,
    color: THEME.textPrimary,
    fontWeight: 500,
    minHeight: 100,
    transition: "all 0.2s",
  }),
  premiumRow: (isMobile) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    padding: "14px 16px",
    background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
    borderRadius: 12,
    marginBottom: isMobile ? 16 : 20,
    border: `1px solid ${THEME.accentBgHover}`,
  }),
  premiumLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  premiumIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: `1px solid ${THEME.accentBgHover}`,
    boxShadow: "0 2px 6px rgba(217,119,6,0.1)",
  },
  premiumTitle: (isMobile) => ({
    fontSize: isMobile ? 13 : 14,
    fontWeight: 700,
    color: THEME.accentDarker,
    letterSpacing: "-0.01em",
  }),
  premiumSubtitle: (isMobile) => ({
    fontSize: isMobile ? 11 : 12,
    color: THEME.accentDark,
    marginTop: 2,
    fontWeight: 500,
  }),
  toggleWrap: {
    position: "relative",
    display: "inline-block",
    width: 48,
    height: 26,
    cursor: "pointer",
    flexShrink: 0,
  },
  shortBanner: (isMobile) => ({
    background: `linear-gradient(135deg, ${THEME.danger}, ${THEME.warning})`,
    color: "white",
    padding: isMobile ? "12px 14px" : "14px 18px",
    borderRadius: 12,
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 6px 20px rgba(239,68,68,0.35)",
  }),
  shortBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid rgba(255,255,255,0.3)",
  },
  shortBannerTitle: (isMobile) => ({
    fontWeight: 800,
    fontSize: isMobile ? 14 : 15,
    letterSpacing: "-0.01em",
  }),
  shortBannerText: (isMobile) => ({
    fontSize: isMobile ? 11 : 12,
    opacity: 0.95,
    marginTop: 2,
    fontWeight: 500,
  }),
  progressWrap: {
    background: THEME.menuHover,
    borderRadius: 12,
    overflow: "hidden",
    border: `1px solid ${THEME.cardBorder}`,
  },
  progressLabel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: 600,
  },
  btnSpinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

const globalStyles = `
  * { -webkit-tap-highlight-color: transparent; }
  html, body { overflow-x: hidden; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (hover: hover) {
    .dropzone:hover {
      border-color: ${THEME.accent} !important;
      background: ${THEME.accentBg} !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(217,119,6,0.15);
    }
    .plan-btn:hover {
      transform: translateY(-1px);
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(217,119,6,0.5) !important;
    }
  }

  input:focus, select:focus, textarea:focus {
    border-color: ${THEME.accent} !important;
    box-shadow: 0 0 0 3px rgba(217,119,6,0.12) !important;
    background: white !important;
  }

  button:active { transform: scale(0.98); }
`;

export default Upload;