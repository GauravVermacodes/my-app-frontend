import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
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
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  menuHover: "#faf7f0",
  gradientStart: "#fbbf24",
  gradientEnd: "#d97706",
};

// SVG Icons Component
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    scissors: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></>,
    play: <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />,
    moreVertical: <><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="5" r="1.5" fill="currentColor" /><circle cx="12" cy="19" r="1.5" fill="currentColor" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
    film: <><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const MyClips = () => {
  const navigate = useNavigate();
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingClip, setDeletingClip] = useState(null);
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

  const BACKEND = "http://localhost:5000";
  const getUrl = (u) => {
    if (!u) return "https://picsum.photos/320/180";
    return u.startsWith("http") ? u : `${BACKEND}${u}`;
  };

  const loadClips = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/clips/my");
      setClips(data.clips || []);
    } catch (e) {
      console.error("Failed to load clips:", e);
      toast.error("Failed to load clips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClips();
  }, []);

  const openDeleteModal = (clip) => {
    setDeletingClip(clip);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingClip) return;
    try {
      await API.delete(`/clips/${deletingClip._id}`);
      setClips(clips.filter((c) => c._id !== deletingClip._id));
      toast.success("Clip deleted");
      setShowDeleteModal(false);
      setDeletingClip(null);
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const handleShare = async (clip) => {
    const url = `${window.location.origin}/video/${clip.video?._id}?t=${clip.startTime}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: clip.title, url });
        toast.success("Shared!");
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("🔗 Link copied!");
    }
  };

  const handleCopyLink = (clip) => {
    const url = `${window.location.origin}/video/${clip.video?._id}?t=${clip.startTime}`;
    navigator.clipboard.writeText(url);
    toast.success("🔗 Link copied!");
  };

  const handleWatchOriginal = (clip) => {
    if (clip.video?._id) {
      navigate(`/video/${clip.video._id}`);
    }
  };

  const secsToTime = (s) => {
    const totalSecs = Math.floor(s || 0);
    const m = Math.floor(totalSecs / 60);
    const r = totalSecs % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const getClipDuration = (clip) => {
    return (clip.endTime || 0) - (clip.startTime || 0);
  };

  const formatDate = (date) => {
    if (!date) return "Recently";
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

  const filteredClips = clips
    .filter((c) => {
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      return (
        (c.title || "").toLowerCase().includes(query) ||
        (c.video?.title || "").toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "duration") return getClipDuration(b) - getClipDuration(a);
      return 0;
    });

  // Total clip duration
  const totalDuration = clips.reduce((sum, c) => sum + getClipDuration(c), 0);
  const formatTotalTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const s = styles(isMobile, isSmallMobile);

  if (loading) {
    return (
      <div style={s.loadingContainer}>
        <div style={s.spinner} />
        <p style={{ color: THEME.textSecondary, fontWeight: 600, marginTop: 12 }}>
          Loading your clips...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <style>{globalStyles}</style>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>
            <Icon name="scissors" size={24} color={THEME.accent} />
          </div>
          <div>
            <h1 style={s.title}>
              My Clips
              {clips.length > 0 && (
                <span style={s.count}>{clips.length}</span>
              )}
            </h1>
            <p style={s.subtitle}>
              Save memorable moments from your favorite videos
            </p>
          </div>
        </div>

        {/* Stats */}
        {clips.length > 0 && (
          <div style={s.headerStats}>
            <div style={s.statPill}>
              <Icon name="clock" size={14} color={THEME.accent} />
              <div>
                <div style={s.statValue}>{formatTotalTime(totalDuration)}</div>
                <div style={s.statLabel}>Total Time</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Sort */}
      {clips.length > 0 && (
        <div style={s.controls}>
          <div style={s.searchWrapper}>
            <div style={s.searchIcon}>
              <Icon name="search" size={16} color={THEME.textMuted} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your clips..."
              style={s.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="clear-search-btn"
                style={s.clearBtn}
              >
                ×
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={s.sortSelect}
          >
            <option value="recent">Recently created</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name (A–Z)</option>
            <option value="duration">Longest first</option>
          </select>
        </div>
      )}

      {/* EMPTY STATE */}
      {clips.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIconWrap}>
            <Icon name="scissors" size={isMobile ? 42 : 50} color={THEME.accent} />
          </div>
          <h2 style={s.emptyTitle}>No clips yet</h2>
          <p style={s.emptySubtitle}>
            Create clips from videos to save memorable moments and highlights
          </p>
          <button
            onClick={() => navigate("/")}
            className="primary-btn"
            style={s.exploreBtn}
          >
            <Icon name="video" size={16} color="white" />
            Explore Videos
          </button>
        </div>
      ) : filteredClips.length === 0 ? (
        <div style={s.emptyState}>
          <h3 style={s.emptyTitle}>No results found</h3>
          <p style={s.emptySubtitle}>Try different search terms</p>
          <button
            onClick={() => setSearchTerm("")}
            className="primary-btn"
            style={s.exploreBtn}
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* Section Header */}
          <div style={s.sectionHeader}>
            <div style={s.sectionTitleWrap}>
              <Icon name="scissors" size={18} color={THEME.accent} />
              <h2 style={s.sectionTitle}>All Clips</h2>
            </div>
            <span style={s.sectionCount}>{filteredClips.length} items</span>
          </div>

          {/* Clips Grid */}
          <div style={s.grid}>
            {filteredClips.map((clip) => (
              <ClipCard
                key={clip._id}
                clip={clip}
                getUrl={getUrl}
                isMenuOpen={openMenuId === clip._id}
                onToggleMenu={() =>
                  setOpenMenuId(openMenuId === clip._id ? null : clip._id)
                }
                onCloseMenu={() => setOpenMenuId(null)}
                onDelete={() => openDeleteModal(clip)}
                onShare={() => handleShare(clip)}
                onCopyLink={() => handleCopyLink(clip)}
                onWatchOriginal={() => handleWatchOriginal(clip)}
                secsToTime={secsToTime}
                getClipDuration={getClipDuration}
                formatDate={formatDate}
                isMobile={isMobile}
              />
            ))}
          </div>
        </>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && deletingClip && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(28,28,30,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(6px)",
            padding: 16,
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: THEME.cardBg,
              border: `1px solid ${THEME.cardBorder}`,
              borderRadius: 18,
              padding: isMobile ? 24 : 32,
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 20px 60px rgba(28,28,30,0.25)",
              textAlign: "center",
              animation: "modalPop 0.3s ease",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: THEME.dangerBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                border: `1px solid #fecaca`,
              }}
            >
              <Icon name="trash" size={28} color={THEME.danger} />
            </div>
            <h2
              style={{
                margin: "0 0 8px 0",
                color: THEME.textPrimary,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Delete Clip?
            </h2>
            <p
              style={{
                color: THEME.textSecondary,
                fontSize: 14,
                margin: "0 0 24px 0",
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              Are you sure you want to delete{" "}
              <b style={{ color: THEME.textPrimary }}>"{deletingClip.title}"</b>?
              <br />
              This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column-reverse" : "row" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
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
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: 12,
                  background: `linear-gradient(135deg, ${THEME.danger}, #dc2626)`,
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "inherit",
                  boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================== CLIP CARD ================== */
const ClipCard = ({
  clip,
  getUrl,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onDelete,
  onShare,
  onCopyLink,
  onWatchOriginal,
  secsToTime,
  getClipDuration,
  formatDate,
  isMobile,
}) => {
  const clipDuration = getClipDuration(clip);
  const clipDurationText = clipDuration < 60
    ? `${Math.floor(clipDuration)}s`
    : `${Math.floor(clipDuration / 60)}m ${Math.floor(clipDuration % 60)}s`;

  return (
    <div className="clip-card" style={cardStyles.card}>
      {/* Thumbnail with time range */}
      <Link
        to={`/video/${clip.video?._id}?t=${clip.startTime}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div style={cardStyles.thumbWrap}>
          <img
            src={getUrl(clip.video?.thumbnailUrl)}
            alt={clip.title}
            className="thumb-image"
            style={cardStyles.thumb}
            loading="lazy"
            onError={(e) => { e.target.src = "https://picsum.photos/320/180"; }}
          />

          {/* Play overlay */}
          <div className="play-overlay" style={cardStyles.playOverlay}>
            <div style={cardStyles.playBtn}>
              <Icon name="play" size={20} color={THEME.accentDark} />
            </div>
          </div>

          {/* CLIP badge */}
          <div style={cardStyles.clipBadge}>
            <Icon name="scissors" size={10} color="white" />
            CLIP
          </div>

          {/* Duration badge */}
          <div style={cardStyles.durationBadge}>
            <Icon name="clock" size={10} color="#fbbf24" />
            {clipDurationText}
          </div>

          {/* Time range at bottom */}
          <div style={cardStyles.timeRange}>
            <span style={cardStyles.timeStart}>{secsToTime(clip.startTime)}</span>
            <div style={cardStyles.timeArrow}>→</div>
            <span style={cardStyles.timeEnd}>{secsToTime(clip.endTime)}</span>
          </div>
        </div>
      </Link>

      {/* Info section */}
      <div style={cardStyles.info}>
        <h3 style={cardStyles.title}>{clip.title || "Untitled Clip"}</h3>

        {clip.video?.title && (
          <div style={cardStyles.sourceRow}>
            <div style={cardStyles.sourceIconWrap}>
              <Icon name="film" size={11} color={THEME.accent} />
            </div>
            <span style={cardStyles.sourceText}>
              From: {clip.video.title}
            </span>
          </div>
        )}

        <div style={cardStyles.metaRow}>
          <span style={cardStyles.metaItem}>
            <Icon name="calendar" size={11} color={THEME.textMuted} />
            {formatDate(clip.createdAt)}
          </span>
        </div>

        {/* Action buttons */}
        <div style={cardStyles.actions}>
          <Link
            to={`/video/${clip.video?._id}?t=${clip.startTime}`}
            style={{ textDecoration: "none", flex: 1 }}
          >
            <button
              className="btn-primary-action"
              style={cardStyles.watchBtn}
            >
              <Icon name="play" size={12} color="white" />
              Watch Clip
            </button>
          </Link>

          <div style={{ position: "relative" }}>
            <CardMenu
              isOpen={isMenuOpen}
              onToggle={onToggleMenu}
              onClose={onCloseMenu}
              onShare={onShare}
              onCopyLink={onCopyLink}
              onWatchOriginal={onWatchOriginal}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================== CARD MENU (PORTAL) ================== */
const CardMenu = ({ isOpen, onToggle, onClose, onShare, onCopyLink, onWatchOriginal, onDelete }) => {
  const triggerRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 200;
      const padding = 12;

      let top = rect.bottom + 6;
      let left = rect.right - menuWidth;

      if (top + menuHeight > window.innerHeight - padding) {
        top = rect.top - menuHeight - 6;
      }
      if (left < padding) left = padding;
      if (left + menuWidth > window.innerWidth - padding) {
        left = window.innerWidth - menuWidth - padding;
      }
      if (top < padding) top = padding;

      setMenuPos({ top, left });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => onClose();
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const menuItems = [
    { id: "share", icon: "share", label: "Share clip", action: onShare },
    { id: "copy", icon: "copy", label: "Copy link", action: onCopyLink },
    { id: "original", icon: "external", label: "Watch original", action: onWatchOriginal },
    { id: "delete", icon: "trash", label: "Delete clip", action: onDelete, danger: true, divider: true },
  ];

  const menuPortal = isOpen && typeof document !== "undefined"
    ? createPortal(
        <>
          <div
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{ position: "fixed", inset: 0, zIndex: 999998, background: "transparent" }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              background: THEME.cardBg,
              borderRadius: 12,
              boxShadow: "0 20px 50px rgba(28,28,30,0.22), 0 6px 14px rgba(28,28,30,0.1)",
              border: `1px solid ${THEME.cardBorder}`,
              width: 200,
              padding: "6px 0",
              zIndex: 999999,
              animation: "menuFadeIn 0.15s ease",
              overflow: "hidden",
            }}
          >
            {menuItems.map((item) => (
              <React.Fragment key={item.id}>
                {item.divider && (
                  <div style={{ height: 1, background: THEME.cardBorder, margin: "4px 0" }} />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                    onClose();
                  }}
                  className="menu-item"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    color: item.danger ? THEME.danger : THEME.textPrimary,
                    textAlign: "left",
                    transition: "background 0.12s",
                    fontFamily: "inherit",
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={15}
                    color={item.danger ? THEME.danger : THEME.textSecondary}
                  />
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="menu-trigger"
        style={{
          width: 34,
          height: 34,
          background: THEME.menuHover,
          border: `1px solid ${THEME.cardBorder}`,
          borderRadius: 8,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          flexShrink: 0,
          padding: 0,
        }}
        aria-label="More options"
      >
        <Icon name="moreVertical" size={15} color={THEME.textSecondary} />
      </button>
      {menuPortal}
    </>
  );
};

/* ================== STYLES ================== */
const styles = (isMobile, isSmallMobile) => ({
  container: {
    padding: isSmallMobile ? "12px 10px" : isMobile ? "14px 12px" : "24px 24px 40px",
    maxWidth: 1400,
    margin: "0 auto",
    minHeight: "100vh",
    background: THEME.bgGradient,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    boxSizing: "border-box",
    width: "100%",
    overflowX: "hidden",
  },
  loadingContainer: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: THEME.bgGradient,
  },
  spinner: {
    width: 44,
    height: 44,
    border: `3px solid ${THEME.cardBorder}`,
    borderTopColor: THEME.accent,
    borderRightColor: THEME.accent,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  header: {
    marginBottom: isMobile ? 20 : 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: 16,
    flexWrap: "wrap",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: `1px solid ${THEME.accentBgHover}`,
    boxShadow: "0 2px 8px rgba(217,119,6,0.12)",
  },
  title: {
    margin: 0,
    fontSize: isSmallMobile ? 20 : isMobile ? 22 : 26,
    fontWeight: 800,
    color: THEME.textPrimary,
    letterSpacing: "-0.02em",
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  count: {
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    fontSize: 13,
    padding: "3px 11px",
    borderRadius: 20,
    fontWeight: 800,
    boxShadow: "0 2px 6px rgba(217,119,6,0.3)",
  },
  subtitle: {
    margin: "4px 0 0 0",
    color: THEME.textSecondary,
    fontSize: isMobile ? 12 : 14,
    fontWeight: 500,
  },
  headerStats: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  statPill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(28,28,30,0.04)",
  },
  statValue: {
    fontSize: 15,
    fontWeight: 800,
    color: THEME.textPrimary,
    letterSpacing: "-0.01em",
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: 10,
    color: THEME.textSecondary,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  controls: {
    display: "flex",
    gap: isMobile ? 8 : 12,
    marginBottom: isMobile ? 16 : 20,
    flexWrap: "wrap",
    flexDirection: isMobile ? "column" : "row",
  },
  searchWrapper: {
    flex: 1,
    minWidth: 0,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: THEME.textMuted,
    pointerEvents: "none",
    display: "flex",
  },
  searchInput: {
    width: "100%",
    padding: isMobile ? "10px 40px 10px 42px" : "11px 40px 11px 44px",
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    color: THEME.textPrimary,
    boxSizing: "border-box",
    transition: "all 0.2s",
    fontWeight: 500,
  },
  clearBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: THEME.menuHover,
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    color: THEME.textSecondary,
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    padding: 0,
    transition: "all 0.15s",
  },
  sortSelect: {
    padding: isMobile ? "10px 14px" : "11px 16px",
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    minWidth: isMobile ? "100%" : 180,
    width: isMobile ? "100%" : "auto",
    fontFamily: "inherit",
    color: THEME.textPrimary,
    outline: "none",
    boxSizing: "border-box",
    fontWeight: 500,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  sectionTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: isMobile ? 15 : 18,
    fontWeight: 800,
    color: THEME.textPrimary,
    margin: 0,
    letterSpacing: "-0.01em",
  },
  sectionCount: {
    fontSize: isMobile ? 11 : 12,
    color: THEME.textMuted,
    fontWeight: 600,
    padding: "3px 10px",
    background: THEME.menuHover,
    borderRadius: 20,
    border: `1px solid ${THEME.cardBorder}`,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: isSmallMobile
      ? "1fr"
      : isMobile
      ? "repeat(2, 1fr)"
      : "repeat(auto-fill, minmax(280px, 1fr))",
    gap: isMobile ? 12 : 16,
  },
  emptyState: {
    textAlign: "center",
    padding: isMobile ? "48px 20px" : "80px 40px",
    background: THEME.cardBg,
    borderRadius: 16,
    border: `1px dashed ${THEME.cardBorder}`,
    boxShadow: "0 2px 8px rgba(28,28,30,0.04)",
  },
  emptyIconWrap: {
    width: isMobile ? 88 : 100,
    height: isMobile ? 88 : 100,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 8px 24px rgba(217,119,6,0.15)",
    border: `1px solid ${THEME.accentBgHover}`,
  },
  emptyTitle: {
    color: THEME.textPrimary,
    marginBottom: 8,
    fontSize: isMobile ? 18 : 22,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  emptySubtitle: {
    color: THEME.textSecondary,
    marginBottom: isMobile ? 22 : 26,
    fontSize: isMobile ? 13 : 14,
    fontWeight: 500,
    maxWidth: 400,
    marginLeft: "auto",
    marginRight: "auto",
    lineHeight: 1.6,
  },
  exploreBtn: {
    padding: isMobile ? "12px 26px" : "13px 28px",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    fontFamily: "inherit",
    boxShadow: "0 6px 18px rgba(217,119,6,0.4)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    letterSpacing: "-0.01em",
    transition: "all 0.2s",
  },
});

const cardStyles = {
  card: {
    background: THEME.cardBg,
    borderRadius: 14,
    overflow: "hidden",
    border: `1px solid ${THEME.cardBorder}`,
    transition: "all 0.25s ease",
    boxShadow: "0 2px 6px rgba(28,28,30,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  thumbWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    overflow: "hidden",
    background: "#000",
    cursor: "pointer",
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.4s ease",
  },
  playOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.25s",
    zIndex: 2,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
    marginBottom: 40,
  },
  clipBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    padding: "4px 9px",
    borderRadius: 6,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.6,
    display: "flex",
    alignItems: "center",
    gap: 4,
    boxShadow: "0 2px 6px rgba(217,119,6,0.4)",
    zIndex: 3,
  },
  durationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "rgba(0,0,0,0.85)",
    color: "#fbbf24",
    padding: "3px 8px",
    borderRadius: 5,
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 4,
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(251,191,36,0.3)",
    zIndex: 3,
  },
  timeRange: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    padding: "5px 10px",
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(6px)",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 3,
  },
  timeStart: {
    color: "white",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
    letterSpacing: 0.3,
  },
  timeArrow: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: 700,
  },
  timeEnd: {
    color: "white",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
    letterSpacing: 0.3,
  },
  info: {
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  title: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: THEME.textPrimary,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
    wordBreak: "break-word",
    minHeight: 39,
  },
  sourceRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    background: THEME.accentBg,
    borderRadius: 8,
    border: `1px solid ${THEME.accentBgHover}`,
  },
  sourceIconWrap: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  sourceText: {
    fontSize: 11,
    color: THEME.accentDarker,
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 11,
    color: THEME.textMuted,
    fontWeight: 600,
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  actions: {
    display: "flex",
    gap: 8,
    marginTop: 4,
  },
  watchBtn: {
    width: "100%",
    padding: "10px 14px",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    boxShadow: "0 3px 8px rgba(217,119,6,0.3)",
    transition: "all 0.15s",
    letterSpacing: "-0.01em",
  },
};

const globalStyles = `
  * { -webkit-tap-highlight-color: transparent; }
  html, body { overflow-x: hidden; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modalPop {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes menuFadeIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236e6e73%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px !important;
  }
  input:focus, select:focus {
    border-color: #d97706 !important;
    box-shadow: 0 0 0 3px rgba(217,119,6,0.12) !important;
  }

  @media (hover: hover) {
    .clip-card:hover {
      transform: translateY(-4px);
      border-color: #fbbf24 !important;
      box-shadow: 0 12px 28px rgba(217,119,6,0.18) !important;
    }
    .clip-card:hover .thumb-image {
      transform: scale(1.05);
    }
    .clip-card:hover .play-overlay {
      opacity: 1 !important;
    }
    .clear-search-btn:hover {
      background: #fef3c7 !important;
      color: #d97706 !important;
    }
    .btn-primary-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 14px rgba(217,119,6,0.45) !important;
    }
    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(217,119,6,0.5) !important;
    }
    .menu-item:hover {
      background: #faf7f0 !important;
    }
    .menu-trigger:hover {
      background: #fef3c7 !important;
      border-color: #fbbf24 !important;
      color: #d97706 !important;
    }
  }

  button:active { transform: scale(0.98); }
`;

export default MyClips;