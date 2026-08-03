import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const THEME = {
  bg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  accent: "#6366f1",
  accentDark: "#4338ca",
  accentBg: "#eef2ff",
  success: "#10b981",
  successBg: "#ecfdf5",
  warning: "#f59e0b",
  danger: "#ef4444",
  menuHover: "#f1f5f9",
  gradientStart: "#667eea",
  gradientEnd: "#764ba2",
};

const CATEGORIES = [
  { id: "General", icon: "grid" },
  { id: "Thrillers", icon: "film" },
  { id: "Comedy Shows", icon: "smile" },
  { id: "Movies", icon: "video" },
  { id: "Animation", icon: "art" },
  { id: "Sci-Fi", icon: "rocket" },
];

// SVG Icons
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    film: <><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></>,
    video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    back: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 19" /></>,
    home: <><path d="M3 12l9-9 9 9M5 10v10h14V10" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
    smile: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></>,
    art: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></>,
    rocket: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /></>,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const CreateSeries = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [myVideos, setMyVideos] = useState([]);
  const [seriesId, setSeriesId] = useState(null);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [searchVideos, setSearchVideos] = useState("");

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    isPremium: false,
    allowedPlans: ["free", "bronze", "silver", "gold"],
  });

  useEffect(() => {
    if (step === 2) {
      fetchMyVideos();
    }
  }, [step]);

  const fetchMyVideos = async () => {
    setVideosLoading(true);
    try {
      const { data } = await API.get("/videos/my-videos");
      setMyVideos(data.videos || []);
    } catch (e) {
      toast.error("Failed to load videos");
    } finally {
      setVideosLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title required");

    setLoading(true);
    try {
      const { data } = await API.post("/series", form);
      setSeriesId(data.series._id);
      setSeries(data.series);
      toast.success("Series created!");
      setStep(2);
    } catch (e) {
      toast.error("Failed to create");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEpisode = async (videoId) => {
    try {
      const { data } = await API.post(`/series/${seriesId}/add-episode`, {
        videoId,
      });
      setSeries(data.series);
      toast.success("Episode added!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const handleRemoveEpisode = async (videoId) => {
    try {
      const { data } = await API.delete(`/series/${seriesId}/episode/${videoId}`);
      setSeries(data.series);
      toast.success("Episode removed");
    } catch (e) {
      toast.error("Failed");
    }
  };

  const BACKEND = "http://localhost:5000";
  const getUrl = (u) =>
    !u ? "https://picsum.photos/160/90" : u.startsWith("http") ? u : `${BACKEND}${u}`;

  const formatViews = (v) => {
    if (!v) return "0 views";
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M views`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K views`;
    return `${v} views`;
  };

  // Filter videos by search
  const filteredVideos = myVideos.filter((v) =>
    (v.title || "").toLowerCase().includes(searchVideos.toLowerCase())
  );

  const s = styles(isMobile);

  return (
    <div style={s.page}>
      <style>{globalStyles}</style>

      <div style={s.container}>
        {/* Header with Progress */}
        <div style={s.pageHeader}>
          <div style={s.headerLeft}>
            <div style={s.headerIconBox}>
              <Icon name="layers" size={22} color={THEME.accent} />
            </div>
            <div>
              <h1 style={s.pageTitle}>
                {step === 1 ? "Create Series" : "Add Episodes"}
              </h1>
              <p style={s.pageSubtitle}>
                {step === 1
                  ? "Group videos into a series"
                  : `${series?.episodes?.length || 0} episode${series?.episodes?.length !== 1 ? "s" : ""} added`}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div style={s.stepsWrap}>
          <StepIndicator num={1} label="Details" active={step >= 1} completed={step > 1} />
          <div style={{ ...s.stepConnector, background: step > 1 ? THEME.accent : THEME.cardBorder }} />
          <StepIndicator num={2} label="Episodes" active={step >= 2} completed={false} />
        </div>

        {step === 1 ? (
          /* ══════════ STEP 1: Create Series ══════════ */
          <form onSubmit={handleCreate} style={s.form}>
            {/* Title */}
            <div style={s.field}>
              <label style={s.label}>
                Series Title <span style={s.required}>*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Breaking Bad Season 1"
                style={s.input}
                required
                maxLength={100}
              />
              <span style={s.hint}>{form.title.length}/100 characters</span>
            </div>

            {/* Description */}
            <div style={s.field}>
              <label style={s.label}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what your series is about..."
                style={{ ...s.input, minHeight: 100, resize: "vertical", fontFamily: "inherit" }}
                maxLength={500}
              />
              <span style={s.hint}>
                {form.description.length}/500 characters
              </span>
            </div>

            {/* Category Selector */}
            <div style={s.field}>
              <label style={s.label}>Category</label>
              <div style={s.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.id })}
                    className="category-btn"
                    style={{
                      ...s.categoryBtn,
                      ...(form.category === cat.id ? s.categoryBtnActive : {}),
                    }}
                  >
                    <div
                      style={{
                        ...s.categoryIconBox,
                        background: form.category === cat.id ? THEME.accent : THEME.menuHover,
                        color: form.category === cat.id ? "white" : THEME.textSecondary,
                      }}
                    >
                      <Icon name={cat.icon} size={16} />
                    </div>
                    <span style={s.categoryLabel}>{cat.id}</span>
                    {form.category === cat.id && (
                      <div style={s.categoryCheck}>
                        <Icon name="check" size={12} color="white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Toggle */}
            <div style={s.premiumBox}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <div style={s.premiumIconBox}>
                  <Icon name="star" size={16} color="#f59e0b" />
                </div>
                <div>
                  <div style={s.premiumLabel}>Premium Series</div>
                  <div style={s.premiumDesc}>Only available for paid plans</div>
                </div>
              </div>
              <label style={s.switchWrap}>
                <input
                  type="checkbox"
                  checked={form.isPremium}
                  onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    ...s.switch,
                    background: form.isPremium ? THEME.accent : "#cbd5e1",
                  }}
                >
                  <div
                    style={{
                      ...s.switchDot,
                      left: form.isPremium ? 22 : 2,
                    }}
                  />
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div style={s.btnRow}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={s.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !form.title.trim()}
                style={{
                  ...s.submitBtn,
                  ...(loading || !form.title.trim() ? s.disabledBtn : {}),
                }}
              >
                {loading ? (
                  <>
                    <div style={s.spinnerSmall} />
                    Creating...
                  </>
                ) : (
                  <>
                    Create & Add Episodes
                    <Icon name="arrow" size={16} color="white" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ══════════ STEP 2: Add Episodes ══════════ */
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Series Info Card */}
            <div style={s.seriesInfoCard}>
              <div style={s.seriesInfoTop}>
                <div style={s.seriesIconBox}>
                  <Icon name="layers" size={20} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={s.seriesTitle}>{series?.title}</h2>
                  <div style={s.seriesMeta}>
                    <span style={s.seriesMetaItem}>
                      <Icon name="film" size={12} />
                      {series?.category || "General"}
                    </span>
                    <span style={s.seriesMetaDot}>•</span>
                    <span style={s.seriesMetaItem}>
                      {series?.episodes?.length || 0} episode
                      {series?.episodes?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
              {series?.description && (
                <p style={s.seriesDesc}>{series.description}</p>
              )}
            </div>

            {/* Added Episodes Section */}
            {series?.episodes?.length > 0 && (
              <div style={s.sectionCard}>
                <div style={s.sectionHeader}>
                  <div style={s.sectionHeaderLeft}>
                    <div style={{ ...s.sectionIconBox, background: THEME.successBg, color: THEME.success }}>
                      <Icon name="check" size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 style={s.sectionTitle}>Added Episodes</h3>
                      <p style={s.sectionSub}>
                        Episodes are ordered by when they were added
                      </p>
                    </div>
                  </div>
                  <span style={s.countBadge}>{series.episodes.length}</span>
                </div>

                <div style={s.episodesList}>
                  {series.episodes.map((ep) => (
                    <div key={ep._id} style={s.addedEpisodeCard}>
                      <div style={s.episodeNumber}>{ep.episodeNumber}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.addedEpisodeTitle}>{ep.title}</div>
                        <div style={s.addedEpisodeMeta}>
                          Episode {ep.episodeNumber}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveEpisode(ep.video._id || ep.video)}
                        className="remove-btn"
                        style={s.removeBtn}
                        aria-label="Remove episode"
                      >
                        <Icon name="trash" size={14} />
                        {!isMobile && "Remove"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Videos Section */}
            <div style={s.sectionCard}>
              <div style={s.sectionHeader}>
                <div style={s.sectionHeaderLeft}>
                  <div style={{ ...s.sectionIconBox, background: THEME.accentBg, color: THEME.accent }}>
                    <Icon name="video" size={16} />
                  </div>
                  <div>
                    <h3 style={s.sectionTitle}>Your Videos</h3>
                    <p style={s.sectionSub}>
                      Click a video to add it as an episode
                    </p>
                  </div>
                </div>
                <span style={s.countBadge}>{myVideos.length}</span>
              </div>

              {/* Search bar */}
              {myVideos.length > 3 && (
                <div style={{ position: "relative", marginBottom: 14 }}>
                  <svg
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: THEME.textMuted,
                      pointerEvents: "none",
                    }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={searchVideos}
                    onChange={(e) => setSearchVideos(e.target.value)}
                    placeholder="Search your videos..."
                    style={{ ...s.input, paddingLeft: 38 }}
                  />
                </div>
              )}

              {videosLoading ? (
                <div style={s.emptyState}>
                  <div style={s.spinnerLg} />
                  <p style={s.emptyText}>Loading your videos...</p>
                </div>
              ) : myVideos.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={s.emptyIconBox}>
                    <Icon name="upload" size={28} color={THEME.textMuted} />
                  </div>
                  <h4 style={s.emptyTitle}>No videos yet</h4>
                  <p style={s.emptyText}>
                    Upload some videos first before creating episodes
                  </p>
                  <button
                    onClick={() => navigate("/upload")}
                    style={s.uploadBtn}
                  >
                    <Icon name="upload" size={14} color="white" />
                    Upload Video
                  </button>
                </div>
              ) : filteredVideos.length === 0 ? (
                <div style={s.emptyState}>
                  <p style={s.emptyText}>No videos match your search</p>
                  <button
                    onClick={() => setSearchVideos("")}
                    style={s.uploadBtn}
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div style={s.videosList}>
                  {filteredVideos.map((v) => {
                    const alreadyAdded = series?.episodes?.some(
                      (e) => e.video === v._id || e.video?._id === v._id
                    );
                    return (
                      <div
                        key={v._id}
                        className={alreadyAdded ? "" : "video-card"}
                        style={{
                          ...s.videoCard,
                          opacity: alreadyAdded ? 0.55 : 1,
                          cursor: alreadyAdded ? "default" : "pointer",
                          background: alreadyAdded ? THEME.menuHover : THEME.cardBg,
                        }}
                        onClick={() => !alreadyAdded && handleAddEpisode(v._id)}
                      >
                        <div style={s.videoThumbWrap}>
                          <img
                            src={getUrl(v.thumbnailUrl)}
                            alt={v.title}
                            style={s.videoThumb}
                            loading="lazy"
                          />
                          {alreadyAdded && (
                            <div style={s.videoOverlay}>
                              <Icon name="check" size={20} color="white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={s.videoTitle}>{v.title}</div>
                          <div style={s.videoMeta}>
                            <Icon name="eye" size={11} />
                            {formatViews(v.views)}
                          </div>
                        </div>
                        {alreadyAdded ? (
                          <div style={s.addedBadge}>
                            <Icon name="check" size={12} color={THEME.success} strokeWidth={3} />
                            Added
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddEpisode(v._id);
                            }}
                            style={s.addBtn}
                          >
                            <Icon name="plus" size={14} color="white" strokeWidth={2.5} />
                            {!isMobile && "Add"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Done Button */}
            <button
              onClick={() => navigate("/my-series")}
              style={s.doneBtn}
            >
              <Icon name="check" size={18} color="white" strokeWidth={2.5} />
              Done - View My Series
            </button>

            <button
              onClick={() => navigate("/")}
              style={s.linkBtn}
            >
              <Icon name="home" size={14} />
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ STEP INDICATOR ============
const StepIndicator = ({ num, label, active, completed }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: completed
          ? THEME.success
          : active
          ? THEME.accent
          : THEME.cardBg,
        border: `2px solid ${completed ? THEME.success : active ? THEME.accent : THEME.cardBorder}`,
        color: completed || active ? "white" : THEME.textMuted,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        transition: "all 0.3s",
      }}
    >
      {completed ? <Icon name="check" size={14} color="white" strokeWidth={3} /> : num}
    </div>
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: active ? THEME.textPrimary : THEME.textMuted,
        transition: "color 0.3s",
      }}
    >
      {label}
    </span>
  </div>
);

// ============ STYLES ============
const styles = (isMobile) => ({
  page: {
    minHeight: "calc(100vh - 60px)",
    background: THEME.bg,
    padding: isMobile ? "16px 12px" : "28px 20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: THEME.textPrimary,
  },
  container: {
    maxWidth: 720,
    margin: "0 auto",
  },

  pageHeader: {
    marginBottom: 20,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
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
  pageTitle: {
    margin: 0,
    fontSize: isMobile ? 22 : 26,
    fontWeight: 700,
    color: THEME.textPrimary,
    letterSpacing: "-0.02em",
  },
  pageSubtitle: {
    margin: "4px 0 0",
    color: THEME.textSecondary,
    fontSize: isMobile ? 13 : 14,
  },

  stepsWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    padding: "14px 18px",
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 12,
    justifyContent: "center",
  },
  stepConnector: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    maxWidth: 80,
    transition: "background 0.3s",
  },

  form: {
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 16,
    padding: isMobile ? 20 : 28,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: THEME.textPrimary,
    fontWeight: 600,
    display: "flex",
    gap: 4,
    letterSpacing: "-0.01em",
  },
  required: { color: THEME.danger },
  hint: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 2,
    fontWeight: 500,
  },
  input: {
    padding: "11px 14px",
    background: THEME.bg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 10,
    color: THEME.textPrimary,
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },

  // Category
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
    gap: 8,
  },
  categoryBtn: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    background: THEME.cardBg,
    border: `2px solid ${THEME.cardBorder}`,
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
    textAlign: "left",
  },
  categoryBtnActive: {
    borderColor: THEME.accent,
    background: THEME.accentBg,
  },
  categoryIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: THEME.textPrimary,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  categoryCheck: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: THEME.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // Premium
  premiumBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 12,
  },
  premiumIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid #fde68a",
  },
  premiumLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: THEME.textPrimary,
  },
  premiumDesc: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  switchWrap: {
    display: "inline-block",
    cursor: "pointer",
  },
  switch: {
    position: "relative",
    width: 40,
    height: 22,
    borderRadius: 20,
    transition: "background 0.2s",
  },
  switchDot: {
    position: "absolute",
    top: 2,
    width: 18,
    height: 18,
    background: "white",
    borderRadius: "50%",
    transition: "left 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
  },

  // Buttons
  btnRow: {
    display: "flex",
    gap: 10,
    marginTop: 8,
    flexDirection: isMobile ? "column-reverse" : "row",
  },
  cancelBtn: {
    padding: "12px 20px",
    background: "transparent",
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 10,
    color: THEME.textPrimary,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    flex: isMobile ? "unset" : "0 0 auto",
  },
  submitBtn: {
    flex: 1,
    padding: "12px 20px",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    border: "none",
    borderRadius: 10,
    color: "white",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "inherit",
    transition: "transform 0.15s",
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  spinnerSmall: {
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  spinnerLg: {
    width: 32,
    height: 32,
    border: "3px solid #e2e8f0",
    borderTopColor: THEME.accent,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 12px",
  },

  // ═══ Step 2 ═══
  seriesInfoCard: {
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    borderRadius: 16,
    padding: isMobile ? 18 : 22,
    color: "white",
    boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
  },
  seriesInfoTop: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  seriesIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backdropFilter: "blur(4px)",
  },
  seriesTitle: {
    margin: 0,
    fontSize: isMobile ? 18 : 22,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    wordBreak: "break-word",
  },
  seriesMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: 500,
    flexWrap: "wrap",
  },
  seriesMetaItem: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  seriesMetaDot: {
    opacity: 0.6,
  },
  seriesDesc: {
    margin: "14px 0 0",
    fontSize: 13,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.9)",
  },

  // Section Card
  sectionCard: {
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 16,
    padding: isMobile ? 16 : 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
    flex: 1,
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: THEME.textPrimary,
    letterSpacing: "-0.01em",
  },
  sectionSub: {
    margin: "2px 0 0",
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: 500,
  },
  countBadge: {
    padding: "4px 12px",
    background: THEME.accentBg,
    color: THEME.accentDark,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },

  // Added episodes
  episodesList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  addedEpisodeCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    background: THEME.successBg,
    border: "1px solid #a7f3d0",
    borderRadius: 10,
  },
  episodeNumber: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: THEME.success,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
    boxShadow: "0 2px 6px rgba(16,185,129,0.3)",
  },
  addedEpisodeTitle: {
    fontWeight: 600,
    fontSize: 14,
    color: THEME.textPrimary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  addedEpisodeMeta: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 2,
    fontWeight: 500,
  },
  removeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: isMobile ? 8 : "8px 12px",
    background: "white",
    border: `1px solid ${THEME.danger}`,
    color: THEME.danger,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    transition: "all 0.15s",
  },

  // Videos list
  videosList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  videoCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 10,
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 10,
    transition: "all 0.15s",
  },
  videoThumbWrap: {
    position: "relative",
    width: isMobile ? 80 : 100,
    height: isMobile ? 46 : 56,
    borderRadius: 6,
    overflow: "hidden",
    flexShrink: 0,
    background: THEME.menuHover,
  },
  videoThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  videoOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(16,185,129,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  videoTitle: {
    fontWeight: 600,
    fontSize: 13,
    color: THEME.textPrimary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginBottom: 4,
  },
  videoMeta: {
    fontSize: 11,
    color: THEME.textSecondary,
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontWeight: 500,
  },
  addedBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    background: THEME.successBg,
    color: THEME.success,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid #a7f3d0",
    flexShrink: 0,
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: isMobile ? 8 : "8px 14px",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "inherit",
    boxShadow: "0 2px 6px rgba(99,102,241,0.3)",
    flexShrink: 0,
    transition: "transform 0.15s",
  },

  // Empty state
  emptyState: {
    textAlign: "center",
    padding: "32px 20px",
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: THEME.menuHover,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
  },
  emptyTitle: {
    margin: "0 0 6px",
    fontSize: 16,
    fontWeight: 600,
    color: THEME.textPrimary,
  },
  emptyText: {
    color: THEME.textSecondary,
    fontSize: 13,
    margin: "0 0 16px",
  },
  uploadBtn: {
    padding: "10px 20px",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },

  // Bottom buttons
  doneBtn: {
    width: "100%",
    padding: 14,
    background: `linear-gradient(135deg, ${THEME.success}, #059669)`,
    color: "white",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
  },
  linkBtn: {
    background: "transparent",
    border: "none",
    color: THEME.textMuted,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: 8,
    margin: "0 auto",
    fontWeight: 500,
  },
});

const globalStyles = `
  * { -webkit-tap-highlight-color: transparent; }
  @keyframes spin { to { transform: rotate(360deg); } }

  input:focus, textarea:focus, select:focus {
    border-color: ${THEME.accent} !important;
    box-shadow: 0 0 0 3px ${THEME.accentBg};
  }

  @media (hover: hover) {
    .category-btn:hover {
      border-color: ${THEME.accent} !important;
      transform: translateY(-1px);
    }
    .video-card:hover {
      border-color: ${THEME.accent} !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99,102,241,0.1) !important;
    }
    .remove-btn:hover {
      background: ${THEME.danger} !important;
      color: white !important;
    }
    button:not(:disabled):hover {
      opacity: 0.95;
    }
  }
  button:active { transform: scale(0.98); }
`;

export default CreateSeries;