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
  successBg: "#ecfdf5",
  warning: "#f59e0b",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  menuHover: "#faf7f0",
};

// SVG Icons
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    play: <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />,
    moreVertical: <><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="5" r="1.5" fill="currentColor" /><circle cx="12" cy="19" r="1.5" fill="currentColor" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />,
    video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    hardDrive: <><line x1="22" y1="12" x2="2" y2="12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /><line x1="6" y1="16" x2="6.01" y2="16" /><line x1="10" y1="16" x2="10.01" y2="16" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const Downloads = () => {
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [openMenuId, setOpenMenuId] = useState(null);
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
  const isDesktop = windowWidth >= 1024;

  const BACKEND = "http://localhost:5000";
  const getUrl = (u) => {
    if (!u) return "https://picsum.photos/320/180";
    return u.startsWith("http") ? u : `${BACKEND}${u}`;
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/downloads/my");
      const valid = (data.downloads || []).filter((d) => d.video);
      setDownloads(valid);
    } catch (e) {
      console.error("Fetch error:", e);
      toast.error("Failed to load downloads");
    } finally {
      setLoading(false);
    }
  };

  const handleWatchOffline = (download) => {
    const videoUrl = getUrl(download.video?.videoUrl);
    window.open(videoUrl, "_blank");
    toast.success("Opening in new tab");
  };

  const handleDownloadAgain = (download) => {
    const videoUrl = getUrl(download.video?.videoUrl);
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `${download.video?.title || "video"}.mp4`;
    link.click();
    toast.success("📥 Downloading...");
  };

  const handleDelete = async (downloadId) => {
    if (!window.confirm("Remove from downloads?")) return;
    try {
      setDownloads(downloads.filter((d) => d._id !== downloadId));
      toast.success("Removed from downloads");
    } catch (e) {
      toast.error("Failed to remove");
    }
  };

  const handleShare = async (download) => {
    const url = `${window.location.origin}/video/${download.video._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: download.video.title, url });
        toast.success("Shared!");
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("🔗 Link copied!");
    }
  };

  const handleCopyLink = (download) => {
    const url = `${window.location.origin}/video/${download.video._id}`;
    navigator.clipboard.writeText(url);
    toast.success("🔗 Link copied!");
  };

  const handleOpenChannel = (download) => {
    if (download.video?.uploader?._id) {
      navigate(`/user/${download.video.uploader._id}`);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return d.toLocaleDateString();
  };

  const filteredDownloads = downloads
    .filter((d) => {
      if (!d.video) return false;
      const duration = d.video.duration || 0;
      const isShort = duration > 0 && duration <= 60;
      if (filter === "shorts" && !isShort) return false;
      if (filter === "videos" && isShort) return false;
      if (searchTerm) {
        const title = (d.video.title || "").toLowerCase();
        const uploader = (d.video.uploader?.name || "").toLowerCase();
        const query = searchTerm.toLowerCase();
        if (!title.includes(query) && !uploader.includes(query)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.downloadedAt || b.createdAt) - new Date(a.downloadedAt || a.createdAt);
      if (sortBy === "oldest") return new Date(a.downloadedAt || a.createdAt) - new Date(b.downloadedAt || b.createdAt);
      if (sortBy === "name") return (a.video?.title || "").localeCompare(b.video?.title || "");
      return 0;
    });

  const videosCount = downloads.filter((d) => {
    const dur = d.video?.duration || 0;
    return !dur || dur > 60;
  }).length;

  const shortsCount = downloads.filter((d) => {
    const dur = d.video?.duration || 0;
    return dur > 0 && dur <= 60;
  }).length;

  // Total size
  const totalSize = downloads.reduce((sum, d) => sum + (d.video?.fileSize || 0), 0);

  const s = styles(isMobile, isTablet, isSmallMobile);

  if (loading) {
    return (
      <div style={s.loadingContainer}>
        <div style={s.spinner} />
        <h2 style={s.loadingText}>Loading your downloads...</h2>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <style>{`
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-tap-highlight-color: transparent;
        }
        html, body { overflow-x: hidden; }

        .horizontal-scroll {
          scrollbar-width: thin;
          scrollbar-color: ${THEME.accentLight} transparent;
        }
        .horizontal-scroll::-webkit-scrollbar { height: 8px; }
        .horizontal-scroll::-webkit-scrollbar-track { background: transparent; }
        .horizontal-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, ${THEME.accentLight}, ${THEME.accent});
          border-radius: 10px;
        }
        .horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, ${THEME.accent}, ${THEME.accentDark});
        }
        @media (max-width: 640px) {
          .horizontal-scroll::-webkit-scrollbar { height: 0; }
        }

        @media (hover: hover) {
          .video-card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(217,119,6,0.15) !important;
            border-color: ${THEME.accentLight} !important;
          }
          .video-card-hover:hover .thumb-image {
            transform: scale(1.05);
          }
          .short-card-hover:hover {
            transform: translateY(-4px);
          }
          .short-card-hover:hover .short-overlay {
            opacity: 1 !important;
          }
          .short-card-hover:hover .short-thumb-img {
            transform: scale(1.05);
          }
          .action-btn:hover {
            background: ${THEME.accentBg} !important;
            border-color: ${THEME.accentLight} !important;
            color: ${THEME.accentDark} !important;
          }
          .action-btn-danger:hover {
            background: ${THEME.dangerBg} !important;
            border-color: #fecaca !important;
            color: ${THEME.danger} !important;
          }
          .tab-btn:hover {
            color: ${THEME.accentDark} !important;
          }
          .menu-trigger:hover {
            background: ${THEME.cardBg} !important;
            transform: scale(1.05);
          }
          .menu-item:hover {
            background: ${THEME.menuHover} !important;
          }
          .clear-search-btn:hover {
            background: ${THEME.accentBg} !important;
            color: ${THEME.accent} !important;
          }
          .primary-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(217,119,6,0.4) !important;
          }
        }
        .action-btn:active { transform: scale(0.95); }
        @media (max-width: 640px) {
          .short-overlay { opacity: 0 !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
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
          border-color: ${THEME.accent} !important;
          box-shadow: 0 0 0 3px rgba(217,119,6,0.12) !important;
        }
      `}</style>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>
            <Icon name="download" size={24} color={THEME.accent} />
          </div>
          <div>
            <h1 style={s.title}>
              My Downloads
              {downloads.length > 0 && (
                <span style={s.count}>{downloads.length}</span>
              )}
            </h1>
            <p style={s.subtitle}>
              Watch your saved videos anytime, even offline
            </p>
          </div>
        </div>

        {/* Storage info */}
        {downloads.length > 0 && (
          <div style={s.storageInfo}>
            <div style={s.storageIconWrap}>
              <Icon name="hardDrive" size={16} color={THEME.accent} />
            </div>
            <div>
              <div style={s.storageValue}>{formatBytes(totalSize)}</div>
              <div style={s.storageLabel}>Total Storage</div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Sort */}
      {downloads.length > 0 && (
        <div style={s.controls}>
          <div style={s.searchWrapper}>
            <div style={s.searchIcon}>
              <Icon name="search" size={18} color={THEME.textMuted} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search downloads..."
              style={s.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={s.clearBtn}
                className="clear-search-btn"
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
            <option value="recent">Recently added</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
      )}

      {/* Tabs */}
      {downloads.length > 0 && (
        <div className="horizontal-scroll" style={s.tabsContainer}>
          <button
            onClick={() => setFilter("all")}
            className="tab-btn"
            style={{ ...s.tab, ...(filter === "all" ? s.tabActive : {}) }}
          >
            All <span style={{ ...s.tabCount, ...(filter === "all" ? s.tabCountActive : {}) }}>{downloads.length}</span>
          </button>
          <button
            onClick={() => setFilter("videos")}
            className="tab-btn"
            style={{ ...s.tab, ...(filter === "videos" ? s.tabActive : {}) }}
          >
            Videos <span style={{ ...s.tabCount, ...(filter === "videos" ? s.tabCountActive : {}) }}>{videosCount}</span>
          </button>
          <button
            onClick={() => setFilter("shorts")}
            className="tab-btn"
            style={{ ...s.tab, ...(filter === "shorts" ? s.tabActive : {}) }}
          >
            Shorts <span style={{ ...s.tabCount, ...(filter === "shorts" ? s.tabCountActive : {}) }}>{shortsCount}</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {downloads.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIconWrap}>
            <Icon name="download" size={isMobile ? 42 : 50} color={THEME.accent} />
          </div>
          <h2 style={s.emptyTitle}>No downloads yet</h2>
          <p style={s.emptySubtitle}>
            Save videos to watch offline anytime, anywhere
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
      ) : filteredDownloads.length === 0 ? (
        <div style={s.emptyState}>
          <h3 style={s.emptyTitle}>No results found</h3>
          <p style={s.emptySubtitle}>Try different filters or search terms</p>
          <button
            onClick={() => { setSearchTerm(""); setFilter("all"); }}
            className="primary-btn"
            style={s.exploreBtn}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* SHORTS */}
          {(filter === "shorts" || filter === "all") && shortsCount > 0 && (
            <div style={{ marginBottom: isMobile ? 24 : 32 }}>
              {filter === "all" && (
                <div style={s.sectionHeader}>
                  <div style={s.sectionTitleWrap}>
                    <Icon name="zap" size={18} color={THEME.accent} />
                    <h2 style={s.sectionTitle}>Shorts</h2>
                  </div>
                  <span style={s.sectionCount}>{shortsCount} items</span>
                </div>
              )}
              <div className="horizontal-scroll" style={s.horizontalScroll}>
                {filteredDownloads
                  .filter((d) => {
                    const dur = d.video?.duration || 0;
                    return dur > 0 && dur <= 60;
                  })
                  .map((download) => (
                    <ShortCard
                      key={download._id}
                      download={download}
                      getUrl={getUrl}
                      isMenuOpen={openMenuId === `short-${download._id}`}
                      onToggleMenu={() =>
                        setOpenMenuId(openMenuId === `short-${download._id}` ? null : `short-${download._id}`)
                      }
                      onCloseMenu={() => setOpenMenuId(null)}
                      onWatch={() => navigate(`/video/${download.video._id}`)}
                      onWatchOffline={() => handleWatchOffline(download)}
                      onDelete={() => handleDelete(download._id)}
                      onShare={() => handleShare(download)}
                      onCopyLink={() => handleCopyLink(download)}
                      onOpenChannel={() => handleOpenChannel(download)}
                      formatDate={formatDate}
                      formatDuration={formatDuration}
                      isMobile={isMobile}
                      isSmallMobile={isSmallMobile}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* VIDEOS */}
          {(filter === "videos" || filter === "all") && videosCount > 0 && (
            <div>
              {filter === "all" && (
                <div style={s.sectionHeader}>
                  <div style={s.sectionTitleWrap}>
                    <Icon name="video" size={18} color={THEME.accent} />
                    <h2 style={s.sectionTitle}>Videos</h2>
                  </div>
                  <span style={s.sectionCount}>{videosCount} items</span>
                </div>
              )}
              <div className="horizontal-scroll" style={s.horizontalScroll}>
                {filteredDownloads
                  .filter((d) => {
                    const dur = d.video?.duration || 0;
                    return !dur || dur > 60;
                  })
                  .map((download) => (
                    <VideoCard
                      key={download._id}
                      download={download}
                      getUrl={getUrl}
                      isMenuOpen={openMenuId === `video-${download._id}`}
                      onToggleMenu={() =>
                        setOpenMenuId(openMenuId === `video-${download._id}` ? null : `video-${download._id}`)
                      }
                      onCloseMenu={() => setOpenMenuId(null)}
                      onWatch={() => navigate(`/video/${download.video._id}`)}
                      onWatchOffline={() => handleWatchOffline(download)}
                      onDelete={() => handleDelete(download._id)}
                      onShare={() => handleShare(download)}
                      onCopyLink={() => handleCopyLink(download)}
                      onOpenChannel={() => handleOpenChannel(download)}
                      onDownloadAgain={() => handleDownloadAgain(download)}
                      formatDate={formatDate}
                      formatDuration={formatDuration}
                      formatBytes={formatBytes}
                      isMobile={isMobile}
                      isSmallMobile={isSmallMobile}
                    />
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ================== CARD MENU (PORTAL) ================== */
const CardMenu = ({ isOpen, onToggle, onClose, onWatchOffline, onDownloadAgain, onShare, onCopyLink, onOpenChannel, onDelete, showDownload = true }) => {
  const triggerRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 220;
      const menuHeight = 280;
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
    { id: "watch", icon: "play", label: "Watch offline", action: onWatchOffline },
    ...(showDownload ? [{ id: "download", icon: "download", label: "Download again", action: onDownloadAgain }] : []),
    { id: "share", icon: "share", label: "Share", action: onShare },
    { id: "copy", icon: "copy", label: "Copy link", action: onCopyLink },
    { id: "channel", icon: "external", label: "Visit channel", action: onOpenChannel },
    { id: "delete", icon: "trash", label: "Remove", action: onDelete, danger: true },
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
              width: 220,
              padding: "6px 0",
              zIndex: 999999,
              animation: "menuFadeIn 0.15s ease",
              overflow: "hidden",
            }}
          >
            {menuItems.map((item) => (
              <button
                key={item.id}
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
                <Icon name={item.icon} size={15} color={item.danger ? THEME.danger : THEME.textSecondary} />
                {item.label}
              </button>
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
          background: isOpen ? THEME.cardBg : "rgba(255,255,255,0.95)",
          border: `1px solid ${THEME.cardBorder}`,
          width: 30,
          height: 30,
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          flexShrink: 0,
          boxShadow: "0 2px 6px rgba(28,28,30,0.15)",
        }}
        aria-label="More options"
      >
        <Icon name="moreVertical" size={15} color={THEME.textPrimary} />
      </button>
      {menuPortal}
    </>
  );
};

/* ================== VIDEO CARD ================== */
const VideoCard = ({
  download,
  getUrl,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onWatch,
  onWatchOffline,
  onDelete,
  onShare,
  onCopyLink,
  onOpenChannel,
  onDownloadAgain,
  formatDate,
  formatDuration,
  formatBytes,
  isMobile,
  isSmallMobile,
}) => {
  return (
    <div
      className="video-card-hover"
      style={{
        ...cardStyles.videoCard,
        width: isSmallMobile ? 240 : isMobile ? 270 : 300,
      }}
      onClick={onWatch}
    >
      <div style={cardStyles.videoThumbWrap}>
        <img
          src={getUrl(download.video?.thumbnailUrl)}
          alt={download.video?.title}
          className="thumb-image"
          style={cardStyles.videoThumb}
          loading="lazy"
          onError={(e) => { e.target.src = "https://picsum.photos/320/180"; }}
        />

        {/* 3-dot menu */}
        <div
          style={cardStyles.menuButtonWrap}
          onClick={(e) => e.stopPropagation()}
        >
          <CardMenu
            isOpen={isMenuOpen}
            onToggle={onToggleMenu}
            onClose={onCloseMenu}
            onWatchOffline={onWatchOffline}
            onDownloadAgain={onDownloadAgain}
            onShare={onShare}
            onCopyLink={onCopyLink}
            onOpenChannel={onOpenChannel}
            onDelete={onDelete}
            showDownload={true}
          />
        </div>

        {download.video?.duration > 0 && (
          <span style={cardStyles.durationBadge}>
            {formatDuration(download.video.duration)}
          </span>
        )}

        <div style={cardStyles.downloadedBadge}>
          <Icon name="check" size={11} color="white" strokeWidth={3} />
          Saved
        </div>
      </div>

      <div style={{ ...cardStyles.videoInfo, padding: isMobile ? 12 : 14 }}>
        <h3 style={{ ...cardStyles.videoTitle, fontSize: isMobile ? 13 : 14 }}>
          {download.video?.title || "Untitled"}
        </h3>

        <div style={cardStyles.metadata}>
          <div style={cardStyles.channelAvatar}>
            {download.video?.uploader?.name?.charAt(0).toUpperCase() || "W"}
          </div>
          <span style={cardStyles.channel}>
            {download.video?.uploader?.name || "Unknown"}
          </span>
        </div>

        <div style={cardStyles.videoStats}>
          <span style={cardStyles.statChip}>
            <Icon name="calendar" size={11} color={THEME.accent} />
            {formatDate(download.downloadedAt || download.createdAt)}
          </span>
          {download.video?.fileSize && (
            <>
              <span style={cardStyles.statDot}>•</span>
              <span style={cardStyles.statChip}>
                <Icon name="hardDrive" size={11} color={THEME.textMuted} />
                {formatBytes(download.video.fileSize)}
              </span>
            </>
          )}
        </div>

        <div style={cardStyles.tagRow}>
          <span style={cardStyles.planTag}>
            {download.userPlanAtDownload?.toUpperCase() || "FREE"}
          </span>
        </div>

        {/* Quick action buttons */}
        <div style={cardStyles.actions} onClick={(e) => e.stopPropagation()}>
          <button
            className="action-btn"
            onClick={onWatchOffline}
            style={cardStyles.actionBtnPrimary}
            title="Watch offline"
          >
            <Icon name="play" size={13} />
            Watch
          </button>
          <button
            className="action-btn"
            onClick={onDownloadAgain}
            style={cardStyles.actionBtn}
            title="Download again"
          >
            <Icon name="download" size={13} />
          </button>
          <button
            className="action-btn action-btn-danger"
            onClick={onDelete}
            style={cardStyles.actionBtn}
            title="Remove"
          >
            <Icon name="trash" size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================== SHORT CARD ================== */
const ShortCard = ({
  download,
  getUrl,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onWatch,
  onWatchOffline,
  onDelete,
  onShare,
  onCopyLink,
  onOpenChannel,
  formatDate,
  formatDuration,
  isMobile,
  isSmallMobile,
}) => {
  return (
    <div
      className="short-card-hover"
      style={{
        ...cardStyles.shortCard,
        width: isSmallMobile ? 140 : isMobile ? 155 : 180,
      }}
      onClick={onWatch}
    >
      <div style={cardStyles.shortThumbWrap}>
        <img
          src={getUrl(download.video?.thumbnailUrl)}
          alt={download.video?.title}
          className="short-thumb-img"
          style={cardStyles.shortThumb}
          loading="lazy"
          onError={(e) => { e.target.src = "https://picsum.photos/150/280"; }}
        />

        <div style={cardStyles.shortsLabel}>
          <Icon name="zap" size={9} color="white" />
          SHORT
        </div>

        {/* 3-dot menu */}
        <div
          style={cardStyles.shortMenuWrap}
          onClick={(e) => e.stopPropagation()}
        >
          <CardMenu
            isOpen={isMenuOpen}
            onToggle={onToggleMenu}
            onClose={onCloseMenu}
            onWatchOffline={onWatchOffline}
            onShare={onShare}
            onCopyLink={onCopyLink}
            onOpenChannel={onOpenChannel}
            onDelete={onDelete}
            showDownload={false}
          />
        </div>

        {download.video?.duration > 0 && (
          <div style={cardStyles.shortDuration}>
            {formatDuration(download.video.duration)}
          </div>
        )}

        <div style={cardStyles.shortDownloadedBadge} title="Downloaded">
          <Icon name="check" size={10} color="white" strokeWidth={3} />
        </div>

        <div className="short-overlay" style={cardStyles.shortOverlay}>
          <div style={cardStyles.shortPlayBtn}>
            <Icon name="play" size={isMobile ? 26 : 32} color="white" />
          </div>
        </div>
      </div>

      <div style={cardStyles.shortInfo}>
        <h4 style={{ ...cardStyles.shortTitle, fontSize: isMobile ? 12 : 13 }}>
          {download.video?.title || "Untitled"}
        </h4>
        <div style={cardStyles.shortMetaRow}>
          <div style={cardStyles.shortChannelAvatar}>
            {download.video?.uploader?.name?.charAt(0).toUpperCase() || "W"}
          </div>
          <p style={cardStyles.shortMeta}>
            {download.video?.uploader?.name || "Unknown"}
          </p>
        </div>
        <p style={cardStyles.shortDate}>
          {formatDate(download.downloadedAt || download.createdAt)}
        </p>
      </div>
    </div>
  );
};

/* ================== STYLES ================== */
const styles = (isMobile, isTablet, isSmallMobile) => ({
  container: {
    padding: isSmallMobile ? "12px 10px" : isMobile ? "14px 12px" : isTablet ? "20px 20px" : "28px 32px",
    maxWidth: 1400,
    margin: "0 auto",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    width: "100%",
    boxSizing: "border-box",
    overflowX: "hidden",
    background: THEME.bgGradient,
    minHeight: "100vh",
  },
  loadingContainer: {
    padding: isMobile ? 40 : 80,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
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
    marginBottom: 16,
  },
  loadingText: {
    color: THEME.textSecondary,
    fontSize: isMobile ? 14 : 15,
    fontWeight: 600,
    margin: 0,
  },
  header: {
    marginBottom: isMobile ? 20 : 28,
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
    fontSize: isSmallMobile ? 20 : isMobile ? 22 : 28,
    fontWeight: 800,
    color: THEME.textPrimary,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 8 : 12,
    letterSpacing: "-0.02em",
    flexWrap: "wrap",
  },
  count: {
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    fontSize: isMobile ? 12 : 13,
    padding: isMobile ? "3px 10px" : "4px 12px",
    borderRadius: 20,
    fontWeight: 800,
    boxShadow: "0 2px 6px rgba(217,119,6,0.3)",
  },
  subtitle: {
    color: THEME.textSecondary,
    marginTop: 4,
    marginBottom: 0,
    fontSize: isMobile ? 12 : 14,
    fontWeight: 500,
  },
  storageInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(28,28,30,0.04)",
  },
  storageIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: THEME.accentBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${THEME.accentBgHover}`,
  },
  storageValue: {
    fontSize: 14,
    fontWeight: 800,
    color: THEME.textPrimary,
    letterSpacing: "-0.01em",
  },
  storageLabel: {
    fontSize: 10,
    color: THEME.textSecondary,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 1,
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
    width: "100%",
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
    minWidth: isMobile ? "100%" : 170,
    width: isMobile ? "100%" : "auto",
    fontFamily: "inherit",
    color: THEME.textPrimary,
    outline: "none",
    boxSizing: "border-box",
    fontWeight: 500,
  },
  tabsContainer: {
    display: "flex",
    gap: isMobile ? 4 : 8,
    marginBottom: isMobile ? 18 : 24,
    borderBottom: `1px solid ${THEME.cardBorder}`,
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    paddingBottom: 0,
  },
  tab: {
    padding: isMobile ? "10px 12px" : "12px 20px",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    fontSize: isMobile ? 13 : 14,
    fontWeight: 600,
    color: THEME.textSecondary,
    transition: "all 0.2s",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  tabActive: {
    color: THEME.accentDark,
    borderBottomColor: THEME.accent,
    fontWeight: 700,
  },
  tabCount: {
    background: THEME.menuHover,
    color: THEME.textSecondary,
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: isMobile ? 10 : 11,
    fontWeight: 700,
  },
  tabCountActive: {
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: isMobile ? 12 : 14,
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
  horizontalScroll: {
    display: "flex",
    gap: isMobile ? 10 : 16,
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: isMobile ? 8 : 12,
    scrollBehavior: "smooth",
    WebkitOverflowScrolling: "touch",
    scrollSnapType: isMobile ? "x mandatory" : "none",
    marginLeft: isMobile ? -12 : 0,
    marginRight: isMobile ? -12 : 0,
    paddingLeft: isMobile ? 12 : 0,
    paddingRight: isMobile ? 12 : 0,
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
  /* Video Card */
  videoCard: {
    flexShrink: 0,
    background: THEME.cardBg,
    borderRadius: 14,
    border: `1px solid ${THEME.cardBorder}`,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.25s ease",
    boxShadow: "0 2px 6px rgba(28,28,30,0.05)",
    display: "flex",
    flexDirection: "column",
    scrollSnapAlign: "start",
  },
  videoThumbWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    overflow: "hidden",
    background: "#000",
  },
  videoThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.4s ease",
  },
  menuButtonWrap: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 5,
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    background: "rgba(0,0,0,0.85)",
    color: "white",
    padding: "3px 8px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.3,
    backdropFilter: "blur(4px)",
  },
  downloadedBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    background: "linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))",
    color: "white",
    padding: "4px 9px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 4,
    letterSpacing: 0.3,
    backdropFilter: "blur(4px)",
    boxShadow: "0 2px 6px rgba(16,185,129,0.35)",
  },
  videoInfo: {
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  videoTitle: {
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
  metadata: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: THEME.textSecondary,
  },
  channelAvatar: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${THEME.accentLight}, ${THEME.accentDark})`,
    color: "white",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 4px rgba(217,119,6,0.25)",
  },
  channel: {
    fontWeight: 600,
    color: THEME.textPrimary,
    fontSize: 12,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  videoStats: {
    display: "flex",
    gap: 8,
    fontSize: 11,
    color: THEME.textMuted,
    alignItems: "center",
    flexWrap: "wrap",
    fontWeight: 600,
  },
  statChip: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
  },
  statDot: {
    color: "#d4d0c8",
  },
  tagRow: {
    display: "flex",
    gap: 6,
    marginTop: 2,
  },
  planTag: {
    background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
    color: THEME.accentDark,
    padding: "3px 10px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.5,
    border: `1px solid ${THEME.accentBgHover}`,
  },
  actions: {
    display: "flex",
    gap: 6,
    marginTop: 8,
    paddingTop: 10,
    borderTop: `1px solid ${THEME.cardBorder}`,
  },
  actionBtnPrimary: {
    flex: 1,
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    border: "none",
    color: "white",
    height: 34,
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "inherit",
    padding: 0,
    boxShadow: "0 2px 6px rgba(217,119,6,0.25)",
  },
  actionBtn: {
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    color: THEME.textSecondary,
    height: 34,
    width: 34,
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    flexShrink: 0,
    fontFamily: "inherit",
  },

  /* Short Card */
  shortCard: {
    flexShrink: 0,
    cursor: "pointer",
    transition: "transform 0.25s ease",
    scrollSnapAlign: "start",
  },
  shortThumbWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "9/16",
    borderRadius: 14,
    overflow: "hidden",
    background: "#000",
    boxShadow: "0 4px 12px rgba(28,28,30,0.1)",
  },
  shortThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.4s ease",
  },
  shortsLabel: {
    position: "absolute",
    top: 8,
    left: 8,
    background: `linear-gradient(135deg, ${THEME.danger}, ${THEME.warning})`,
    color: "white",
    padding: "4px 8px",
    borderRadius: 5,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.5,
    display: "flex",
    alignItems: "center",
    gap: 3,
    boxShadow: "0 2px 6px rgba(239,68,68,0.35)",
    zIndex: 3,
  },
  shortMenuWrap: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 5,
  },
  shortDuration: {
    position: "absolute",
    bottom: 8,
    right: 8,
    background: "rgba(0,0,0,0.85)",
    color: "white",
    padding: "3px 7px",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    backdropFilter: "blur(4px)",
    zIndex: 3,
  },
  shortDownloadedBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(16,185,129,0.4)",
    zIndex: 3,
  },
  shortOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.25s",
    zIndex: 2,
  },
  shortPlayBtn: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
  },
  shortInfo: {
    padding: "12px 4px 0",
  },
  shortTitle: {
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    color: THEME.textPrimary,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.35,
    letterSpacing: "-0.01em",
    wordBreak: "break-word",
    minHeight: 34,
  },
  shortMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    margin: "6px 0 3px",
  },
  shortChannelAvatar: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${THEME.accentLight}, ${THEME.accentDark})`,
    color: "white",
    fontSize: 9,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 1px 3px rgba(217,119,6,0.25)",
  },
  shortMeta: {
    margin: 0,
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  shortDate: {
    margin: 0,
    fontSize: 10,
    color: THEME.textMuted,
    fontWeight: 500,
  },
};

export default Downloads;