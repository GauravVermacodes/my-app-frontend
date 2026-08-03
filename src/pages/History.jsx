import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

// ✅ UPDATED THEME - Warm off-white with gold accents
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
};

// SVG Icons
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    moreVertical: <><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="5" r="1.5" fill="currentColor" /><circle cx="12" cy="19" r="1.5" fill="currentColor" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    playlist: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    report: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [pauseHistory, setPauseHistory] = useState(false);
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

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/history");
      const validHistory = (data.history || []).filter((h) => h.video);
      setHistory(validHistory);
    } catch (e) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const paused = localStorage.getItem("historyPaused") === "true";
    setPauseHistory(paused);
  }, []);

  const handleRemove = async (id) => {
    try {
      await API.delete(`/history/${id}`);
      setHistory(history.filter((h) => h._id !== id));
      toast.success("Removed from history");
    } catch (e) {
      toast.error("Failed to remove");
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear ALL watch history?\n\nThis cannot be undone.")) return;
    try {
      await API.delete("/history/clear");
      setHistory([]);
      toast.success("History cleared");
    } catch (e) {
      toast.error("Failed to clear");
    }
  };

  const handlePauseHistory = () => {
    const newVal = !pauseHistory;
    setPauseHistory(newVal);
    localStorage.setItem("historyPaused", newVal.toString());
    toast.success(newVal ? "History paused" : "History resumed");
  };

  const handleShare = async (video) => {
    const url = `${window.location.origin}/video/${video._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, url });
        toast.success("Shared!");
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("🔗 Link copied!");
    }
  };

  const handleCopyLink = (video) => {
    const url = `${window.location.origin}/video/${video._id}`;
    navigator.clipboard.writeText(url);
    toast.success("🔗 Link copied!");
  };

  const handleAddToPlaylist = (video) => {
    navigate("/playlists");
    toast.success("Choose a playlist");
  };

  const handleDownload = async (video) => {
    try {
      const { data } = await API.post(`/downloads/${video._id}`);
      toast.success(`📥 Download started!`);
      const backendUrl = API.defaults.baseURL?.replace("/api", "") || BACKEND;
      const url = data.videoUrl?.startsWith("http") ? data.videoUrl : `${backendUrl}${data.videoUrl}`;
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Download failed");
    }
  };

  const handleReport = (video) => {
    toast("🚩 Report modal — implement your report flow", { icon: "🚩" });
  };

  const handleOpenChannel = (video) => {
    if (video?.uploader?._id) {
      navigate(`/user/${video.uploader._id}`);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const formatViews = (v) => {
    if (!v) return "0 views";
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M views`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K views`;
    return `${v} views`;
  };

  const formatWatchTime = (date) => {
    const now = new Date();
    const watched = new Date(date);
    const diff = now - watched;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const groupByDate = (items) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setDate(thisMonth.getDate() - 30);

    const groups = {
      Today: [],
      Yesterday: [],
      "This week": [],
      "This month": [],
      Older: [],
    };

    items.forEach((item) => {
      const date = new Date(item.watchedAt);
      if (date >= today) groups.Today.push(item);
      else if (date >= yesterday) groups.Yesterday.push(item);
      else if (date >= thisWeek) groups["This week"].push(item);
      else if (date >= thisMonth) groups["This month"].push(item);
      else groups.Older.push(item);
    });

    return groups;
  };

  const filteredHistory = history
    .filter((h) => {
      if (!h.video) return false;
      const duration = h.video.duration || 0;
      const isShort = duration > 0 && duration <= 60;
      if (filter === "shorts" && !isShort) return false;
      if (filter === "videos" && isShort) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const title = (h.video.title || "").toLowerCase();
        const channel = (h.video.uploader?.name || "").toLowerCase();
        if (!title.includes(query) && !channel.includes(query)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.watchedAt) - new Date(a.watchedAt);
      if (sortBy === "oldest") return new Date(a.watchedAt) - new Date(b.watchedAt);
      if (sortBy === "name") return (a.video?.title || "").localeCompare(b.video?.title || "");
      return 0;
    });

  const grouped = groupByDate(filteredHistory);

  const videoCount = history.filter((h) => {
    const dur = h.video?.duration || 0;
    return !dur || dur > 60;
  }).length;

  const shortsCount = history.filter((h) => {
    const dur = h.video?.duration || 0;
    return dur > 0 && dur <= 60;
  }).length;

  const s = styles(isMobile, isTablet, isSmallMobile, isDesktop);

  if (loading) {
    return (
      <div style={s.loadingContainer}>
        <div style={s.spinner} />
        <h2 style={s.loadingText}>Loading history...</h2>
      </div>
    );
  }

  return (
    <div style={s.pageContainer}>
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
          .history-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px rgba(217,119,6,0.15) !important;
            border-color: ${THEME.accentLight} !important;
          }
          .history-card:hover .thumb-image {
            transform: scale(1.05);
          }
          .sidebar-action:hover {
            background: ${THEME.accentBg} !important;
            border-color: ${THEME.accentLight} !important;
            color: ${THEME.accentDark} !important;
          }
          .sidebar-action:hover svg { color: ${THEME.accent} !important; }
          .menu-item:hover {
            background: ${THEME.menuHover} !important;
          }
          .tab-btn:hover {
            color: ${THEME.accentDark} !important;
          }
          .menu-trigger:hover {
            background: ${THEME.cardBg} !important;
            transform: scale(1.05);
          }
          .clear-search-btn:hover {
            background: ${THEME.accentBg} !important;
            color: ${THEME.accent} !important;
          }
        }
        .history-card:active { transform: scale(0.99); }
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

      <div style={s.layout}>
        {/* MAIN CONTENT */}
        <div style={s.mainContent}>
          {/* Header */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={THEME.accent} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h1 style={s.title}>Watch history</h1>
                <p style={s.subtitle}>Videos you've watched are shown here</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={s.searchBar}>
            <svg
              style={s.searchIcon}
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search watch history"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Filter Tabs */}
          {history.length > 0 && (
            <div style={s.tabsRow}>
              <div className="horizontal-scroll" style={s.tabsContainer}>
                <button
                  className="tab-btn"
                  onClick={() => setFilter("all")}
                  style={{ ...s.tab, ...(filter === "all" ? s.tabActive : {}) }}
                >
                  All <span style={{ ...s.tabCount, ...(filter === "all" ? s.tabCountActive : {}) }}>{history.length}</span>
                </button>
                <button
                  className="tab-btn"
                  onClick={() => setFilter("videos")}
                  style={{ ...s.tab, ...(filter === "videos" ? s.tabActive : {}) }}
                >
                  Videos <span style={{ ...s.tabCount, ...(filter === "videos" ? s.tabCountActive : {}) }}>{videoCount}</span>
                </button>
                <button
                  className="tab-btn"
                  onClick={() => setFilter("shorts")}
                  style={{ ...s.tab, ...(filter === "shorts" ? s.tabActive : {}) }}
                >
                  Shorts <span style={{ ...s.tabCount, ...(filter === "shorts" ? s.tabCountActive : {}) }}>{shortsCount}</span>
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={s.sortSelect}
              >
                <option value="recent">Recently watched</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
          )}

          {/* Mobile Quick Actions */}
          {!isDesktop && history.length > 0 && (
            <div style={s.mobileActions}>
              <button onClick={handlePauseHistory} style={s.mobileActionBtn}>
                {pauseHistory ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                )}
                <span>{pauseHistory ? "Resume" : "Pause"}</span>
              </button>
              <button
                onClick={handleClear}
                style={{ ...s.mobileActionBtn, color: THEME.danger, borderColor: "#fecaca" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                <span>Clear all</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {history.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>
                <div style={s.emptyIconInner}>
                  <svg width={isMobile ? "44" : "52"} height={isMobile ? "44" : "52"} viewBox="0 0 24 24" fill="none" stroke={THEME.accent} strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
              <h2 style={s.emptyTitle}>Keep track of what you watch</h2>
              <p style={s.emptySubtitle}>
                Watch history isn't visible when you're signed out.
                Videos you watch will show up here.
              </p>
              <button onClick={() => navigate("/")} style={s.exploreBtn}>
                Explore Videos
              </button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={s.emptyState}>
              <h3 style={s.emptyTitle}>No results found</h3>
              <p style={s.emptySubtitle}>Try different search terms</p>
              <button
                onClick={() => { setSearchTerm(""); setFilter("all"); }}
                style={s.exploreBtn}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {Object.entries(grouped).map(([groupName, items]) => {
                if (items.length === 0) return null;
                return (
                  <div key={groupName} style={s.dateGroup}>
                    <div style={s.dateGroupHeader}>
                      <h2 style={s.dateGroupTitle}>{groupName}</h2>
                      <span style={s.dateGroupCount}>{items.length} items</span>
                    </div>
                    <div className="horizontal-scroll" style={s.horizontalScroll}>
                      {items.map((h) => (
                        <HistoryCard
                          key={h._id}
                          item={h}
                          getUrl={getUrl}
                          isMenuOpen={openMenuId === h._id}
                          onToggleMenu={() => setOpenMenuId(openMenuId === h._id ? null : h._id)}
                          onCloseMenu={() => setOpenMenuId(null)}
                          onRemove={() => handleRemove(h._id)}
                          onShare={() => handleShare(h.video)}
                          onCopyLink={() => handleCopyLink(h.video)}
                          onAddToPlaylist={() => handleAddToPlaylist(h.video)}
                          onDownload={() => handleDownload(h.video)}
                          onReport={() => handleReport(h.video)}
                          onOpenChannel={() => handleOpenChannel(h.video)}
                          onWatch={() => navigate(`/video/${h.video._id}`)}
                          formatDuration={formatDuration}
                          formatViews={formatViews}
                          formatWatchTime={formatWatchTime}
                          isMobile={isMobile}
                          isSmallMobile={isSmallMobile}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* SIDEBAR - Desktop only */}
        {isDesktop && (
          <div style={s.sidebar}>
            <div style={s.sidebarInner}>
              <div style={s.sidebarSection}>
                <div style={s.sidebarLabel}>Manage history</div>
              </div>

              <button
                onClick={handleClear}
                className="sidebar-action"
                style={s.sidebarAction}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                <span>Clear all watch history</span>
              </button>

              <button
                onClick={handlePauseHistory}
                className="sidebar-action"
                style={s.sidebarAction}
              >
                {pauseHistory ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                )}
                <span>{pauseHistory ? "Resume watch history" : "Pause watch history"}</span>
              </button>

              <button
                onClick={() => navigate("/security")}
                className="sidebar-action"
                style={s.sidebarAction}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                <span>Manage all history</span>
              </button>

              <div style={s.infoBanner}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={THEME.accent} strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div style={s.infoText}>
                  Your watch history helps us recommend better content and lets you easily find videos you've watched before.
                </div>
              </div>

              {history.length > 0 && (
                <div style={s.statsCard}>
                  <div style={s.statsTitle}>Statistics</div>
                  <div style={s.statItem}>
                    <span>Total watched</span>
                    <strong style={{ color: THEME.accentDark }}>{history.length}</strong>
                  </div>
                  <div style={s.statItem}>
                    <span>Videos</span>
                    <strong style={{ color: THEME.accentDark }}>{videoCount}</strong>
                  </div>
                  <div style={s.statItem}>
                    <span>Shorts</span>
                    <strong style={{ color: THEME.accentDark }}>{shortsCount}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================== CARD MENU (PORTAL) ================== */
const CardMenu = ({ isOpen, onToggle, onClose, item, onShare, onCopyLink, onAddToPlaylist, onDownload, onReport, onOpenChannel, onRemove }) => {
  const triggerRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 220;
      const menuHeight = 320;
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
    { id: "share", icon: "share", label: "Share", action: onShare },
    { id: "copy", icon: "copy", label: "Copy link", action: onCopyLink },
    { id: "playlist", icon: "playlist", label: "Save to playlist", action: onAddToPlaylist },
    { id: "download", icon: "download", label: "Download", action: onDownload },
    { id: "channel", icon: "external", label: "Visit channel", action: onOpenChannel },
    { id: "report", icon: "report", label: "Report", action: onReport },
    { id: "remove", icon: "trash", label: "Remove from history", action: onRemove, danger: true },
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
                <Icon
                  name={item.icon}
                  size={15}
                  color={item.danger ? THEME.danger : THEME.textSecondary}
                />
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
          width: 32,
          height: 32,
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
        <Icon name="moreVertical" size={16} color={THEME.textPrimary} />
      </button>
      {menuPortal}
    </>
  );
};

/* ================== HISTORY CARD ================== */
const HistoryCard = ({
  item,
  getUrl,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onRemove,
  onShare,
  onCopyLink,
  onAddToPlaylist,
  onDownload,
  onReport,
  onOpenChannel,
  onWatch,
  formatDuration,
  formatViews,
  formatWatchTime,
  isMobile,
  isSmallMobile,
}) => {
  const isShort = item.video?.duration > 0 && item.video?.duration <= 60;
  const cardWidth = isSmallMobile ? 240 : isMobile ? 270 : 300;

  return (
    <div
      className="history-card"
      style={{ ...cardStyles.card, width: cardWidth }}
      onClick={onWatch}
    >
      {/* Thumbnail */}
      <div style={cardStyles.thumbWrap}>
        <img
          src={getUrl(item.video?.thumbnailUrl)}
          alt={item.video?.title}
          className="thumb-image"
          style={cardStyles.thumb}
          loading="lazy"
          onError={(e) => { e.target.src = "https://picsum.photos/320/180"; }}
        />

        {/* 3-dot menu button - top right */}
        <div
          style={cardStyles.menuButtonWrap}
          onClick={(e) => e.stopPropagation()}
        >
          <CardMenu
            isOpen={isMenuOpen}
            onToggle={onToggleMenu}
            onClose={onCloseMenu}
            item={item}
            onShare={onShare}
            onCopyLink={onCopyLink}
            onAddToPlaylist={onAddToPlaylist}
            onDownload={onDownload}
            onReport={onReport}
            onOpenChannel={onOpenChannel}
            onRemove={onRemove}
          />
        </div>

        {item.video?.duration > 0 && (
          <span style={cardStyles.durationBadge}>
            {formatDuration(item.video.duration)}
          </span>
        )}

        {isShort && <span style={cardStyles.shortsBadge}>SHORT</span>}

        {/* Watched progress bar */}
        <div style={cardStyles.progressBar}>
          <div style={cardStyles.progressFill} />
        </div>

        {/* Watched indicator */}
        <div style={cardStyles.watchedIndicator}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Watched
        </div>
      </div>

      {/* Info */}
      <div style={cardStyles.info}>
        <h3 style={cardStyles.videoTitle}>
          {item.video?.title || "Untitled"}
        </h3>

        <div style={cardStyles.metadata}>
          <div style={cardStyles.channelAvatar}>
            {item.video?.uploader?.name?.charAt(0).toUpperCase() || "W"}
          </div>
          <span style={cardStyles.channel}>
            {item.video?.uploader?.name || "Unknown"}
            {item.video?.uploader?.verified && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill={THEME.accent} style={{ marginLeft: 4, verticalAlign: "middle" }}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </span>
        </div>

        <div style={cardStyles.statsRow}>
          <span style={cardStyles.viewsChip}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={THEME.accent} strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {formatViews(item.video?.views)}
          </span>
          <span style={cardStyles.dot}>•</span>
          <span style={cardStyles.timeChip}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={THEME.textMuted} strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formatWatchTime(item.watchedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ================== STYLES ================== */
const styles = (isMobile, isTablet, isSmallMobile, isDesktop) => ({
  pageContainer: {
    padding: isSmallMobile ? "12px 10px" : isMobile ? "14px 12px" : isTablet ? "20px 20px" : "28px 32px",
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
  layout: {
    display: "grid",
    gridTemplateColumns: isDesktop ? "1fr 300px" : "1fr",
    gap: isDesktop ? 24 : 0,
  },
  mainContent: { minWidth: 0 },
  sidebar: { minWidth: 0 },
  sidebarInner: {
    position: "sticky",
    top: 20,
  },
  header: {
    marginBottom: isMobile ? 16 : 22,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
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
    marginBottom: 4,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: THEME.textSecondary,
    fontSize: isMobile ? 12 : 14,
    margin: 0,
    fontWeight: 500,
  },
  searchBar: {
    position: "relative",
    marginBottom: isMobile ? 14 : 20,
    maxWidth: isDesktop ? 500 : "100%",
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: THEME.textMuted,
    pointerEvents: "none",
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
  tabsRow: {
    display: "flex",
    gap: 12,
    marginBottom: isMobile ? 14 : 20,
    borderBottom: `1px solid ${THEME.cardBorder}`,
    alignItems: "center",
    flexWrap: isMobile ? "wrap" : "nowrap",
  },
  tabsContainer: {
    display: "flex",
    gap: isMobile ? 4 : 8,
    flex: 1,
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    minWidth: 0,
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
  sortSelect: {
    padding: isMobile ? "8px 12px" : "10px 14px",
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    color: THEME.textPrimary,
    fontFamily: "inherit",
    outline: "none",
    marginBottom: isMobile ? 8 : 0,
    width: isMobile ? "100%" : "auto",
    minWidth: isMobile ? "auto" : 160,
    boxSizing: "border-box",
    fontWeight: 500,
  },
  mobileActions: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
  },
  mobileActionBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "11px 14px",
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: THEME.textPrimary,
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  emptyState: {
    textAlign: "center",
    padding: isMobile ? "48px 20px" : "80px 40px",
    background: THEME.cardBg,
    borderRadius: 16,
    border: `1px dashed ${THEME.cardBorder}`,
    boxShadow: "0 2px 8px rgba(28,28,30,0.04)",
  },
  emptyIcon: {
    marginBottom: isMobile ? 20 : 24,
    display: "flex",
    justifyContent: "center",
  },
  emptyIconInner: {
    width: isMobile ? 88 : 100,
    height: isMobile ? 88 : 100,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    lineHeight: 1.6,
    maxWidth: 400,
    marginLeft: "auto",
    marginRight: "auto",
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
    letterSpacing: "-0.01em",
  },
  dateGroup: {
    marginBottom: isMobile ? 24 : 32,
    animation: "slideIn 0.3s ease-out",
  },
  dateGroupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: isMobile ? 10 : 14,
  },
  dateGroupTitle: {
    fontSize: isMobile ? 15 : 18,
    fontWeight: 800,
    color: THEME.textPrimary,
    margin: 0,
    letterSpacing: "-0.01em",
  },
  dateGroupCount: {
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

  // Sidebar
  sidebarSection: {
    marginBottom: 12,
  },
  sidebarLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: THEME.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sidebarAction: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "11px 14px",
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: THEME.textPrimary,
    marginBottom: 8,
    transition: "all 0.15s",
    textAlign: "left",
    fontFamily: "inherit",
  },
  infoBanner: {
    padding: 14,
    background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    border: `1px solid ${THEME.accentBgHover}`,
  },
  infoText: {
    fontSize: 12,
    color: THEME.accentDarker,
    lineHeight: 1.5,
    fontWeight: 600,
  },
  statsCard: {
    padding: 16,
    background: THEME.cardBg,
    borderRadius: 12,
    border: `1px solid ${THEME.cardBorder}`,
    boxShadow: "0 2px 8px rgba(28,28,30,0.04)",
  },
  statsTitle: {
    fontSize: 11,
    fontWeight: 800,
    color: THEME.textPrimary,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: `1px solid ${THEME.cardBorder}`,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: 600,
  },
});

const cardStyles = {
  card: {
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
  thumbWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    overflow: "hidden",
    background: "#000",
  },
  thumb: {
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
  shortsBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    background: `linear-gradient(135deg, ${THEME.danger}, ${THEME.warning})`,
    color: "white",
    padding: "4px 9px",
    borderRadius: 5,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.6,
    boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    background: "rgba(255,255,255,0.3)",
  },
  progressFill: {
    height: "100%",
    width: "100%",
    background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.accentDark})`,
  },
  watchedIndicator: {
    position: "absolute",
    bottom: 8,
    left: 8,
    background: "rgba(16,185,129,0.95)",
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
  info: {
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
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 12,
  },
  statsRow: {
    display: "flex",
    gap: 8,
    fontSize: 11,
    color: THEME.textMuted,
    alignItems: "center",
    flexWrap: "wrap",
    fontWeight: 600,
  },
  viewsChip: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    color: THEME.textSecondary,
  },
  timeChip: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    color: "#d4d0c8",
  },
};

export default History;