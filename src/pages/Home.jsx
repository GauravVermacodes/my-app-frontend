import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  addToWatchList,
  selectIsInWatchList,
  selectWatchListCount,
} from '../store/slices/watchListSlice';
import {
  fetchVideos,
  addToHistory,
  downloadVideo,
  reportVideo,
  hideVideo,
  setActiveCategory,
  selectAllVideos,
  selectVideosLoading,
  selectActiveCategory,
  selectShorts,
  selectRegularVideos,
} from "../store/slices/videosSlice";

import {
  fetchMyPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  createPlaylistWithVideo,
  selectMyPlaylists,
  selectPlaylistsLoading,
} from "../store/slices/playlistsSlice";

const CATEGORIES = [
  { name: "All", icon: "", subtitle: "Live Content" },
  { name: "LangChain & AI", icon: "" },
  { name: "Comedy Shows", icon: "" },
  { name: "UPSC Motivation", icon: "" },
  { name: "Sci-Fi", icon: "" },
  { name: "Sports", icon: "" },
  { name: "Music Mixes", icon: "" },
  { name: "Thrillers", icon: "" },
  { name: "Animation", icon: "" },
  { name: "Movies", icon: "" },
  { name: "Movement", icon: "" },
  { name: "Automatics", icon: "" },
];

// ✅ UPDATED THEME - Soft warm off-white background matching reference image
const THEME = {
  bg: "#f4f2ee",              // ← Soft warm off-white (was #f5f5f7)
  bgGradient: "linear-gradient(180deg, #f4f2ee 0%, #eeece7 100%)",
  cardBg: "#ffffff",           // Pure white cards for contrast
  cardBorder: "#e8e5df",       // ← Warm border (was #e5e5ea)
  cardHoverBorder: "#d4d0c8",  // Warm hover border
  textPrimary: "#1c1c1e",
  textSecondary: "#6e6e73",
  textMuted: "#8e8e93",
  accent: "#d97706",           // ← Gold accent (matches Create btn)
  accentLight: "#fbbf24",
  accentDark: "#b45309",
  accentBg: "#fef3c7",
  chipBg: "#ffffff",
  chipActive: "#fef3c7",       // ← Gold tint for active chip
  chipBorder: "#e8e5df",       // Warm border
  chipActiveBorder: "#fbbf24", // Gold active border
  menuBg: "#ffffff",
  menuBorder: "#e8e5df",
  menuHover: "#fef3c7",        // Gold tint on hover
  scrollTrack: "#eeece7",
  scrollThumb: "#d4d0c8",
  scrollThumbHover: "#a8a49b",
  danger: "#ef4444",
  // Section header for QUICK CLIPS
  sectionAccent: "#f59e0b",
};

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const videos = useSelector(selectAllVideos);
  const loading = useSelector(selectVideosLoading);
  const activeCategory = useSelector(selectActiveCategory);
  const shorts = useSelector(selectShorts);
  const regularVideos = useSelector(selectRegularVideos);
  const userPlaylists = useSelector(selectMyPlaylists);
  const loadingPlaylists = useSelector(selectPlaylistsLoading);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingVideo, setReportingVideo] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const menuRefs = useRef({});
  const shortsScrollRef = useRef(null);
  const videosScrollRef = useRef(null);
  const wrapperRef = useRef(null);

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [savingVideoId, setSavingVideoId] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);

  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(wrapperRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const isXSmall = containerWidth < 380;
  const isSmallMobile = containerWidth < 480;
  const isMobile = containerWidth < 720;
  const isTablet = containerWidth >= 720 && containerWidth < 960;
  const isSmallLaptop = containerWidth >= 960 && containerWidth < 1200;
  const isDesktop = containerWidth >= 1200;

  useEffect(() => {
    dispatch(fetchVideos({ category: activeCategory, search: searchQuery }));
  }, [dispatch, activeCategory, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuId) {
        const menuEl = menuRefs.current[openMenuId];
        if (menuEl && !menuEl.contains(e.target)) {
          setOpenMenuId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleCategoryChange = (category) => dispatch(setActiveCategory(category));
  const handleAddToWatchList = (video, e) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(addToWatchList(video));
    toast.success('📺 Added to Watch List!');
    setOpenMenuId(null);
  };
  const handleAddToWatchLater = async (video, e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await dispatch(addToHistory(video._id)).unwrap();
      toast.success("📜 Added to History");
      setOpenMenuId(null);
    } catch (err) { toast.error(err || "Failed"); }
  };
  const handleAddToPlaylist = async (video, e) => {
    e.preventDefault(); e.stopPropagation();
    setOpenMenuId(null);
    setSavingVideoId(video._id);
    setShowPlaylistModal(true);
    setShowNewPlaylistInput(false);
    setNewPlaylistName("");
    try { await dispatch(fetchMyPlaylists()).unwrap(); }
    catch (e) { toast.error("Failed to load playlists"); }
  };
  const handleSaveToPlaylist = async (playlistId) => {
    try {
      await dispatch(addVideoToPlaylist({ playlistId, videoId: savingVideoId })).unwrap();
      toast.success("✅ Saved to playlist!");
    } catch (e) {
      if (e?.includes("already")) toast("Already in this playlist", { icon: "ℹ️" });
      else toast.error(e || "Failed to save");
    }
  };
  const handleRemoveFromPlaylist = async (playlistId) => {
    try {
      await dispatch(removeVideoFromPlaylist({ playlistId, videoId: savingVideoId })).unwrap();
      toast.success("Removed from playlist");
    } catch (e) { toast.error("Failed to remove"); }
  };
  const handleCreateAndSave = async () => {
    if (!newPlaylistName.trim()) return toast.error("Name required");
    setCreatingPlaylist(true);
    try {
      await dispatch(createPlaylistWithVideo({ name: newPlaylistName.trim(), videoId: savingVideoId })).unwrap();
      toast.success(`✅ Saved to "${newPlaylistName}"!`);
      setNewPlaylistName("");
      setShowNewPlaylistInput(false);
    } catch (e) { toast.error(e || "Failed"); }
    finally { setCreatingPlaylist(false); }
  };
  const isVideoInPlaylist = (playlist) =>
    (playlist.videos || []).some((v) => (v._id || v) === savingVideoId);

  const handleDownload = async (video, e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const data = await dispatch(downloadVideo(video._id)).unwrap();
      toast.success(`📥 Download started! Remaining: ${data.remainingDownloads}`);
      const backendUrl = API.defaults.baseURL?.replace("/api", "") || "http://localhost:5000";
      const url = data.videoUrl?.startsWith("http") ? data.videoUrl : `${backendUrl}${data.videoUrl}`;
      window.open(url, "_blank");
      setOpenMenuId(null);
    } catch (err) { toast.error(err || "Download failed"); }
  };
  const handleShare = (video, e) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/video/${video._id}`);
    toast.success("🔗 Link copied!");
    setOpenMenuId(null);
  };
  const handleReport = (video, e) => {
    e.preventDefault(); e.stopPropagation();
    setReportingVideo(video); setShowReportModal(true); setOpenMenuId(null);
  };
  const handleNotInterested = (video, e) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(hideVideo(video._id));
    toast.success("👋 We'll show you fewer videos like this");
    setOpenMenuId(null);
  };
  const handleAddToQueue = (video, e) => {
    e.preventDefault(); e.stopPropagation();
    const queue = JSON.parse(localStorage.getItem("videoQueue") || "[]");
    if (queue.some((v) => v._id === video._id)) toast("Already in queue!", { icon: "ℹ️" });
    else {
      queue.push({ _id: video._id, title: video.title, thumbnailUrl: video.thumbnailUrl, duration: video.duration });
      localStorage.setItem("videoQueue", JSON.stringify(queue));
      toast.success(`▶️ Added to queue (${queue.length} videos)`);
    }
    setOpenMenuId(null);
  };
  const handleCopyLink = (video, e) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/video/${video._id}`);
    toast.success("🔗 Link copied!");
    setOpenMenuId(null);
  };
  const handleSubmitReport = async () => {
    if (!reportReason) { toast.error("Please select a reason"); return; }
    try {
      await dispatch(reportVideo({ videoId: reportingVideo._id, reason: reportReason, description: reportDescription })).unwrap();
      toast.success("🚩 Report submitted!");
      setShowReportModal(false);
      setReportReason(""); setReportDescription(""); setReportingVideo(null);
    } catch (err) { toast.error(err || "Failed to submit"); }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views || 0;
  };
  const formatTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 365) return `${Math.floor(days / 365)}y ago`;
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    return "Today";
  };
  const getMediaUrl = (url) => {
    if (!url) return "https://picsum.photos/320/180";
    if (url.startsWith("http")) return url;
    const baseURL = API.defaults.baseURL?.replace("/api", "") || "http://localhost:5000";
    return `${baseURL}${url}`;
  };

  const menuOptions = [
    { icon: "📺", label: "Watch Together", action: handleAddToWatchList, highlight: true },
    { icon: "➕", label: "Add to queue", action: handleAddToQueue },
    { icon: "🕐", label: "Add to history", action: handleAddToWatchLater },
    { icon: "💾", label: "Save to playlist", action: handleAddToPlaylist },
    { icon: "⬇️", label: "Download", action: handleDownload },
    { icon: "🔗", label: "Share", action: handleShare },
    { icon: "📋", label: "Copy link", action: handleCopyLink },
    { icon: "🚫", label: "Not interested", action: handleNotInterested },
    { icon: "🚩", label: "Report", action: handleReport, danger: true },
  ];

  const categoryMinWidth = isXSmall ? 100 : isSmallMobile ? 110 : isMobile ? 120 : 140;
  const videoCardMinWidth = isXSmall ? 200 : isSmallMobile ? 220 : 240;
  const sidebarWidth = isTablet ? 260 : isSmallLaptop ? 300 : isDesktop ? 340 : 300;
  const wrapperPadding = isXSmall ? 10 : isSmallMobile ? 12 : isMobile ? 14 : 18;

  return (
   <div
    ref={wrapperRef}
    className="home-wrapper"
    style={{
      background: THEME.bgGradient,
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      width: "100%",
      minHeight: "100%",
      //height: isMobile ? "auto" : "calc(100vh - 56px)",
      //overflow: isMobile ? "auto" : "hidden",
      padding: wrapperPadding,         // ✅ Simple uniform padding
    }}
  >
       {/* ✅ CATEGORY CHIPS - Always single row, horizontally scrollable */}
    <div
      className="category-scroll"
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        gap: 8,
        marginBottom: 14,
        overflowX: "auto",
        overflowY: "hidden",
        paddingBottom: 6,
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        flexShrink: 0,
        width:"100%",
      }}
    >
        {CATEGORIES.map((cat) => (
        <button
          key={cat.name}
          onClick={() => handleCategoryChange(cat.name)}
          className="category-chip"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: isMobile ? 6 : 8,
            padding: isXSmall ? "8px 14px" : isMobile ? "9px 16px" : "10px 18px",
            background: activeCategory === cat.name ? THEME.chipActive : THEME.chipBg,
            border: activeCategory === cat.name
              ? `1.5px solid ${THEME.chipActiveBorder}`
              : `1px solid ${THEME.chipBorder}`,
            borderRadius: 10,
            color: activeCategory === cat.name ? THEME.accentDark : THEME.textPrimary,
            cursor: "pointer",
            transition: "all 0.2s",
            textAlign: "left",
            minHeight: isMobile ? 40 : 46,
            boxShadow: activeCategory === cat.name
              ? "0 2px 6px rgba(217,119,6,0.12)"
              : "0 1px 2px rgba(28,28,30,0.04)",
            flexShrink: 0,
            flexGrow: 0,
            whiteSpace: "nowrap",
            fontFamily: "inherit",
            minWidth: "fit-content",
          }}
        >
            {cat.icon && (
            <span style={{ fontSize: isMobile ? 14 : 15, flexShrink: 0 }}>
              {cat.icon}
            </span>
          )}
          <div style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}>
            <span
              style={{
                fontSize: isXSmall ? 11 : isMobile ? 12 : 13,
                fontWeight: activeCategory === cat.name ? 700 : 600,
                whiteSpace: "nowrap",
              }}
            >
              {cat.name}
            </span>
            {cat.subtitle && !isMobile && (
              <span
                style={{
                  fontSize: 10,
                  color: activeCategory === cat.name ? THEME.accentDark : THEME.textMuted,
                  whiteSpace: "nowrap",
                  opacity: 0.85,
                }}
              >
                {cat.subtitle}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: isMobile ? 40 : 60, color: THEME.textSecondary }}>
          <div style={{
            width: 40, height: 40,
            border: `3px solid ${THEME.cardBorder}`,
            borderTopColor: THEME.accent,
            borderRightColor: THEME.accent,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px"
          }} />
          <p style={{ fontWeight: 600 }}>Loading videos...</p>
        </div>
      ) : regularVideos.length === 0 && shorts.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: isMobile ? 40 : 60,
          color: THEME.textSecondary,
          background: THEME.cardBg,
          borderRadius: 14,
          border: `1px dashed ${THEME.cardBorder}`,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
          <h3 style={{ color: THEME.textPrimary, margin: "0 0 8px" }}>No videos found</h3>
          <p>Try uploading one or changing category filter.</p>
        </div>
      ) : (
        <div
          className="main-content-grid"
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : `minmax(0, 1fr) ${sidebarWidth}px`,
            gap: isMobile ? 20 : 16,
            flex: isMobile ? "unset" : 1,
            minHeight: 0,
            overflow: isMobile ? "visible" : "hidden",
            width: "100%",
          }}
        >
          {/* ============ LEFT SIDE - Videos ============ */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: isMobile ? "visible" : "hidden", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexShrink: 0 }}>
              <h2 style={{
                color: THEME.textPrimary,
                fontSize: isMobile ? 15 : 16,
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.01em"
              }}>
                Videos
              </h2>
              {isMobile && regularVideos.length > 4 && (
                <span style={{ fontSize: 11, color: THEME.textSecondary, fontWeight: 500 }}>
                  {regularVideos.length} videos
                </span>
              )}
            </div>

            <div
              ref={videosScrollRef}
              className={isMobile ? "" : "custom-scrollbar"}
              style={{
                overflowY: isMobile ? "visible" : "auto",
                overflowX: "hidden",
                flex: isMobile ? "unset" : 1,
                paddingRight: isMobile ? 0 : 6,
                minHeight: 0,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isXSmall
                    ? "1fr"
                    : isMobile
                    ? "repeat(2, 1fr)"
                    : containerWidth < 900
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)",
                  gap: isXSmall ? 8 : isMobile ? 10 : 12,
                }}
              >
                {regularVideos.map((video) => (
                  <div key={video._id} style={{ position: "relative", minWidth: 0 }}>
                    <Link to={`/video/${video._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div
                        className="video-card"
                        style={{
                          background: THEME.cardBg,
                          borderRadius: 12,
                          overflow: "hidden",
                          border: `1px solid ${THEME.cardBorder}`,
                          transition: "all 0.2s",
                          boxShadow: "0 1px 3px rgba(28,28,30,0.05)",
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          <img
                            src={getMediaUrl(video.thumbnailUrl)}
                            alt={video.title}
                            loading="lazy"
                            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                            onError={(e) => { e.target.src = "https://picsum.photos/320/180"; }}
                          />
                          {video.isPremium && (
                            <span style={{
                              position: "absolute", top: 8, left: 8,
                              background: "linear-gradient(135deg, #fbbf24, #d97706)",
                              color: "#fff", fontSize: 9, fontWeight: 800,
                              padding: "3px 7px", borderRadius: 4, letterSpacing: 0.5,
                              boxShadow: "0 2px 6px rgba(217,119,6,0.35)",
                            }}>
                              PREMIUM
                            </span>
                          )}
                          {video.duration > 0 && (
                            <span style={{
                              position: "absolute", bottom: 6, right: 6,
                              background: "rgba(28,28,30,0.85)",
                              color: "white", fontSize: 10, fontWeight: 600,
                              padding: "2px 5px", borderRadius: 3,
                              backdropFilter: "blur(4px)",
                            }}>
                              {formatDuration(video.duration)}
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: isXSmall ? "7px 9px" : isMobile ? "8px 10px" : "10px 12px" }}>
                          <div style={{
                            width: isMobile ? 26 : 28,
                            height: isMobile ? 26 : 28,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #fbbf24, #d97706)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: 700, fontSize: 12, flexShrink: 0,
                            boxShadow: "0 2px 4px rgba(217,119,6,0.25)",
                          }}>
                            {video.uploader?.name?.charAt(0).toUpperCase() || "W"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0, paddingRight: 18 }}>
                            <h3 style={{
                              color: THEME.textPrimary,
                              fontSize: 12, fontWeight: 600,
                              margin: 0, marginBottom: 2, lineHeight: 1.3,
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                              overflow: "hidden", wordBreak: "break-word",
                              letterSpacing: "-0.01em",
                            }}>
                              {video.title}
                            </h3>
                            <p style={{
                              color: THEME.textSecondary,
                              fontSize: 10, margin: 0,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                              fontWeight: 500,
                            }}>
                              {video.uploader?.name || "WatchNest"} • {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div
                      ref={(el) => (menuRefs.current[video._id] = el)}
                      style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
                      onClick={(e) => e.preventDefault()}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          setOpenMenuId(openMenuId === video._id ? null : video._id);
                        }}
                        style={{
                          width: isMobile ? 28 : 26, height: isMobile ? 28 : 26,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.98)",
                          color: THEME.textPrimary,
                          border: `1px solid ${THEME.cardBorder}`,
                          cursor: "pointer",
                          fontSize: 14, fontWeight: "bold",
                          boxShadow: "0 2px 6px rgba(28,28,30,0.15)",
                        }}
                      >
                        ⋮
                      </button>

                      {openMenuId === video._id && (
                        <div style={{
                          position: "absolute", top: isMobile ? 34 : 32, right: 0,
                          background: THEME.menuBg,
                          border: `1px solid ${THEME.menuBorder}`,
                          borderRadius: 10,
                          minWidth: isMobile ? 190 : 210,
                          overflow: "hidden",
                          zIndex: 100,
                          boxShadow: "0 8px 24px rgba(28,28,30,0.12)",
                        }}>
                          {menuOptions.map((opt, i) => (
                            <button key={i} onClick={(e) => opt.action(video, e)} className="menu-item"
                              style={{
                                width: "100%", padding: "9px 14px",
                                background: "transparent", border: "none",
                                color: opt.danger ? THEME.danger : THEME.textPrimary,
                                textAlign: "left", cursor: "pointer", fontSize: 13,
                                display: "flex", alignItems: "center", gap: 10,
                                fontFamily: "inherit",
                              }}
                            >
                              <span style={{ fontSize: 16 }}>{opt.icon}</span>
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============ RIGHT SIDE - Shorts ============ */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: isMobile ? "visible" : "hidden", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexShrink: 0 }}>
              <span style={{ fontSize: isMobile ? 16 : 18, color: THEME.sectionAccent }}>⚡</span>
              <h2 style={{
                color: THEME.textPrimary,
                fontSize: isMobile ? 15 : 16,
                fontWeight: 800,
                margin: 0,
                letterSpacing: 0.5
              }}>
                QUICK CLIPS
              </h2>
              <Link to="/shorts" style={{
                color: THEME.textSecondary,
                textDecoration: "none",
                fontSize: 12,
                marginLeft: "auto",
                fontWeight: 500,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = THEME.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = THEME.textSecondary}
              >
                View all →
              </Link>
            </div>

            {shorts.length === 0 ? (
              <div style={{
                padding: isMobile ? 30 : 40,
                textAlign: "center",
                color: THEME.textSecondary,
                background: THEME.cardBg,
                borderRadius: 12,
                border: `1px solid ${THEME.cardBorder}`
              }}>
                No shorts available
              </div>
            ) : isMobile ? (
              <div
                className="shorts-mobile-scroll"
                style={{
                  display: "flex", gap: 10,
                  overflowX: "auto", overflowY: "hidden",
                  paddingBottom: 8,
                  WebkitOverflowScrolling: "touch",
                  scrollSnapType: "x mandatory",
                  marginLeft: -wrapperPadding,
                  marginRight: -wrapperPadding,
                  paddingLeft: wrapperPadding,
                  paddingRight: wrapperPadding,
                }}
              >
                {shorts.map((short) => (
                  <div key={short._id} style={{
                    position: "relative", flexShrink: 0,
                    width: isXSmall ? 120 : isSmallMobile ? 135 : 150,
                    scrollSnapAlign: "start",
                  }}>
                    <Link to="/shorts" style={{ textDecoration: "none" }}>
                      <div style={{
                        width: "100%", aspectRatio: "9/16",
                        borderRadius: 10, overflow: "hidden", position: "relative",
                        background: THEME.cardBg,
                        border: `1px solid ${THEME.cardBorder}`,
                        boxShadow: "0 1px 3px rgba(28,28,30,0.05)",
                      }}>
                        <img
                          src={getMediaUrl(short.thumbnailUrl)}
                          alt={short.title}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.target.src = "https://picsum.photos/150/240"; }}
                        />
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <div style={{
                          color: THEME.textPrimary, fontSize: 11, fontWeight: 600,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          overflow: "hidden", lineHeight: 1.3,
                          letterSpacing: "-0.01em",
                        }}>
                          {short.title}
                        </div>
                        <div style={{ color: THEME.textSecondary, fontSize: 10, marginTop: 2, fontWeight: 500 }}>
                          {formatViews(short.views)} views
                        </div>
                      </div>
                    </Link>

                    <div ref={(el) => (menuRefs.current[short._id] = el)} style={{ position: "absolute", top: 5, right: 5, zIndex: 10 }} onClick={(e) => e.preventDefault()}>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenuId(openMenuId === short._id ? null : short._id); }}
                        style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: "rgba(255,255,255,0.98)",
                          color: THEME.textPrimary,
                          border: `1px solid ${THEME.cardBorder}`,
                          cursor: "pointer",
                          fontSize: 12, fontWeight: "bold",
                          boxShadow: "0 1px 4px rgba(28,28,30,0.15)",
                        }}
                      >
                        ⋮
                      </button>
                      {openMenuId === short._id && (
                        <div style={{
                          position: "absolute", top: 28, right: 0,
                          background: THEME.menuBg,
                          border: `1px solid ${THEME.menuBorder}`,
                          borderRadius: 10, minWidth: 180,
                          overflow: "hidden", zIndex: 100,
                          boxShadow: "0 8px 24px rgba(28,28,30,0.12)"
                        }}>
                          {menuOptions.slice(0, 6).map((opt, i) => (
                            <button key={i} onClick={(e) => opt.action(short, e)} className="menu-item"
                              style={{
                                width: "100%", padding: "9px 14px", background: "transparent", border: "none",
                                color: opt.danger ? THEME.danger : THEME.textPrimary,
                                textAlign: "left", cursor: "pointer", fontSize: 12,
                                display: "flex", alignItems: "center", gap: 9, fontFamily: "inherit"
                              }}>
                              <span>{opt.icon}</span>
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop/Tablet: Grid */
              <div ref={shortsScrollRef} className="custom-scrollbar" style={{ overflowY: "auto", overflowX: "hidden", flex: 1, paddingRight: 6, minHeight: 0 }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(auto-fill, minmax(${sidebarWidth < 280 ? 110 : 130}px, 1fr))`,
                  gap: 10,
                }}>
                  {shorts.map((short) => (
                    <div key={short._id} style={{ position: "relative", minWidth: 0 }}>
                      <Link to="/shorts" style={{ textDecoration: "none" }}>
                        <div className="short-card" style={{
                          width: "100%", aspectRatio: "9/16",
                          borderRadius: 10, overflow: "hidden", position: "relative",
                          background: THEME.cardBg,
                          border: `1px solid ${THEME.cardBorder}`,
                          transition: "all 0.2s",
                          boxShadow: "0 1px 3px rgba(28,28,30,0.05)",
                        }}>
                          <img
                            src={getMediaUrl(short.thumbnailUrl)}
                            alt={short.title}
                            loading="lazy"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.target.src = "https://picsum.photos/150/240"; }}
                          />
                        </div>
                        <div style={{ marginTop: 5 }}>
                          <div style={{
                            color: THEME.textPrimary, fontSize: 11, fontWeight: 600,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            letterSpacing: "-0.01em",
                          }}>
                            {short.title}
                          </div>
                          <div style={{ color: THEME.textSecondary, fontSize: 10, marginTop: 1, fontWeight: 500 }}>
                            {formatViews(short.views)} views
                          </div>
                        </div>
                      </Link>

                      <div ref={(el) => (menuRefs.current[short._id] = el)} style={{ position: "absolute", top: 5, right: 5, zIndex: 10 }} onClick={(e) => e.preventDefault()}>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenuId(openMenuId === short._id ? null : short._id); }}
                          style={{
                            width: 22, height: 22, borderRadius: "50%",
                            background: "rgba(255,255,255,0.98)",
                            color: THEME.textPrimary,
                            border: `1px solid ${THEME.cardBorder}`,
                            cursor: "pointer",
                            fontSize: 12, fontWeight: "bold",
                            boxShadow: "0 1px 4px rgba(28,28,30,0.15)"
                          }}
                        >
                          ⋮
                        </button>
                        {openMenuId === short._id && (
                          <div style={{
                            position: "absolute", top: 28, right: 0,
                            background: THEME.menuBg,
                            border: `1px solid ${THEME.menuBorder}`,
                            borderRadius: 10, minWidth: 190,
                            overflow: "hidden", zIndex: 100,
                            boxShadow: "0 8px 24px rgba(28,28,30,0.12)"
                          }}>
                            {menuOptions.slice(0, 6).map((opt, i) => (
                              <button key={i} onClick={(e) => opt.action(short, e)} className="menu-item"
                                style={{
                                  width: "100%", padding: "9px 14px", background: "transparent", border: "none",
                                  color: opt.danger ? THEME.danger : THEME.textPrimary,
                                  textAlign: "left", cursor: "pointer", fontSize: 12,
                                  display: "flex", alignItems: "center", gap: 9, fontFamily: "inherit"
                                }}>
                                <span>{opt.icon}</span>
                                <span>{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && reportingVideo && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(28,28,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, backdropFilter: "blur(6px)", padding: 16
        }} onClick={() => setShowReportModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: THEME.cardBg,
            border: `1px solid ${THEME.cardBorder}`,
            borderRadius: 14,
            padding: isMobile ? 20 : 28,
            width: "100%", maxWidth: 500,
            color: THEME.textPrimary,
            maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(28,28,30,0.25)"
          }}>
            <h2 style={{ margin: "0 0 8px 0", color: THEME.danger, fontSize: isMobile ? 18 : 20 }}>🚩 Report Video</h2>
            <p style={{ color: THEME.textSecondary, fontSize: 13, marginBottom: 20, wordBreak: "break-word" }}>Reporting: <b>{reportingVideo.title}</b></p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: THEME.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: 600 }}>Why are you reporting this video?</label>
              {[
                { id: "inappropriate", label: "🔞 Inappropriate content" },
                { id: "violent", label: "⚠️ Violent or harmful" },
                { id: "spam", label: "📢 Spam or misleading" },
                { id: "harassment", label: "💢 Harassment or bullying" },
                { id: "hate_speech", label: "🚫 Hate speech" },
                { id: "misinformation", label: "❌ False information" },
                { id: "copyright", label: "©️ Copyright violation" },
                { id: "other", label: "📝 Other" },
              ].map((r) => (
                <label key={r.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: 10,
                  background: reportReason === r.id ? "rgba(239,68,68,0.08)" : "transparent",
                  borderRadius: 8, cursor: "pointer", marginBottom: 4,
                  border: reportReason === r.id ? `1px solid ${THEME.danger}` : `1px solid ${THEME.cardBorder}`,
                  transition: "all 0.15s",
                }}>
                  <input type="radio" name="report_reason" value={r.id} checked={reportReason === r.id} onChange={(e) => setReportReason(e.target.value)} />
                  <span style={{ fontSize: 14 }}>{r.label}</span>
                </label>
              ))}
            </div>
            <textarea placeholder="Additional details (optional, max 500 chars)" value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} maxLength={500}
              style={{
                width: "100%", padding: 12,
                background: THEME.bg,
                border: `1px solid ${THEME.cardBorder}`,
                color: THEME.textPrimary,
                borderRadius: 10, minHeight: 80,
                fontFamily: "inherit", fontSize: 14, resize: "vertical", boxSizing: "border-box",
                outline: "none",
              }} />
            <div style={{ display: "flex", gap: 8, marginTop: 20, flexDirection: isMobile ? "column-reverse" : "row" }}>
              <button onClick={() => { setShowReportModal(false); setReportReason(""); setReportDescription(""); }}
                style={{
                  flex: 1, padding: 12, background: "transparent",
                  color: THEME.textPrimary,
                  border: `1px solid ${THEME.cardBorder}`,
                  borderRadius: 10, cursor: "pointer", fontWeight: 600,
                  fontFamily: "inherit",
                }}>
                Cancel
              </button>
              <button onClick={handleSubmitReport} disabled={!reportReason}
                style={{
                  flex: 1, padding: 12,
                  background: !reportReason ? THEME.cardBorder : "linear-gradient(135deg, #ef4444, #b91c1c)",
                  color: "white", border: "none", borderRadius: 10,
                  cursor: !reportReason ? "not-allowed" : "pointer",
                  fontWeight: 700, opacity: !reportReason ? 0.6 : 1,
                  fontFamily: "inherit",
                }}>
                🚩 Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAYLIST MODAL */}
      {showPlaylistModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(28,28,30,0.55)",
          display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center",
          zIndex: 9999, backdropFilter: "blur(6px)", padding: isMobile ? 0 : 16
        }} onClick={() => setShowPlaylistModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "white",
            borderRadius: isMobile ? "16px 16px 0 0" : 16,
            width: "100%", maxWidth: 400,
            maxHeight: isMobile ? "85vh" : "80vh",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(28,28,30,0.3)",
            display: "flex", flexDirection: "column"
          }}>
            <div style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${THEME.cardBorder}`,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>Save to playlist</h3>
              <button onClick={() => setShowPlaylistModal(false)} style={{
                width: 32, height: 32, borderRadius: "50%",
                background: THEME.bg, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {loadingPlaylists ? (
                <div style={{ padding: 40, textAlign: "center", color: THEME.textSecondary }}>Loading playlists...</div>
              ) : userPlaylists.length === 0 && !showNewPlaylistInput ? (
                <div style={{ padding: 40, textAlign: "center", color: THEME.textSecondary }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                  <p style={{ margin: 0 }}>No playlists yet</p>
                  <p style={{ fontSize: 12, margin: "4px 0 0 0" }}>Create one below</p>
                </div>
              ) : (
                userPlaylists.map((playlist) => {
                  const isAdded = isVideoInPlaylist(playlist);
                  return (
                    <div key={playlist._id} onClick={() => isAdded ? handleRemoveFromPlaylist(playlist._id) : handleSaveToPlaylist(playlist._id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "12px 20px", cursor: "pointer",
                        background: isAdded ? THEME.accentBg : "transparent",
                        transition: "background 0.15s",
                      }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 5,
                        border: isAdded ? `2px solid ${THEME.accent}` : "2px solid #d1d5db",
                        background: isAdded ? THEME.accent : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        {isAdded && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{playlist.name}</div>
                        <div style={{ fontSize: 12, color: THEME.textSecondary, marginTop: 2 }}>
                          {playlist.videos?.length || 0} videos{playlist.isPublic ? " • Public" : " • Private"}
                        </div>
                      </div>
                      {isAdded && <span style={{ fontSize: 11, color: THEME.accent, fontWeight: 700 }}>✓ Saved</span>}
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ borderTop: `1px solid ${THEME.cardBorder}`, padding: "12px 20px", background: THEME.bg }}>
              {showNewPlaylistInput ? (
                <div>
                  <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Playlist name" autoFocus
                    style={{
                      width: "100%", padding: "10px 14px",
                      border: `1.5px solid ${THEME.cardBorder}`,
                      borderRadius: 10, fontSize: 14, outline: "none",
                      marginBottom: 10, boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter" && newPlaylistName.trim()) handleCreateAndSave(); if (e.key === "Escape") { setShowNewPlaylistInput(false); setNewPlaylistName(""); } }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setShowNewPlaylistInput(false); setNewPlaylistName(""); }}
                      style={{
                        flex: 1, padding: 10, background: "transparent",
                        border: `1px solid ${THEME.cardBorder}`, borderRadius: 8,
                        cursor: "pointer", fontWeight: 600, fontSize: 13,
                        fontFamily: "inherit",
                      }}>
                      Cancel
                    </button>
                    <button onClick={handleCreateAndSave} disabled={!newPlaylistName.trim() || creatingPlaylist}
                      style={{
                        flex: 1, padding: 10,
                        background: !newPlaylistName.trim() || creatingPlaylist
                          ? THEME.cardBorder
                          : `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                        color: !newPlaylistName.trim() || creatingPlaylist ? "#9ca3af" : "white",
                        border: "none", borderRadius: 8,
                        cursor: !newPlaylistName.trim() || creatingPlaylist ? "not-allowed" : "pointer",
                        fontWeight: 700, fontSize: 13,
                        fontFamily: "inherit",
                      }}>
                      {creatingPlaylist ? "Creating..." : "Create & Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNewPlaylistInput(true)}
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: "transparent",
                    border: `1.5px dashed ${THEME.cardBorder}`,
                    borderRadius: 10, cursor: "pointer",
                    fontSize: 14, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 10,
                    color: THEME.textPrimary,
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = THEME.accent;
                    e.currentTarget.style.color = THEME.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = THEME.cardBorder;
                    e.currentTarget.style.color = THEME.textPrimary;
                  }}
                >
                  <span style={{ fontSize: 20 }}>+</span>
                  <span>Create new playlist</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        html, body { overflow-x: hidden; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${THEME.scrollTrack};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${THEME.scrollThumb};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${THEME.scrollThumbHover};
        }
        .category-scroll::-webkit-scrollbar,
        .shorts-mobile-scroll::-webkit-scrollbar { height: 0; display: none; }

        @media (hover: hover) {
          .category-chip:hover {
            background: ${THEME.chipActive} !important;
            border-color: ${THEME.accentLight} !important;
            transform: translateY(-1px);
            box-shadow: 0 3px 8px rgba(217,119,6,0.15) !important;
          }
          .video-card:hover {
            transform: translateY(-2px);
            border-color: ${THEME.accentLight} !important;
            box-shadow: 0 6px 16px rgba(217,119,6,0.12) !important;
          }
          .short-card:hover {
            transform: translateY(-2px);
            border-color: ${THEME.accentLight} !important;
            box-shadow: 0 6px 16px rgba(217,119,6,0.15) !important;
          }
          .menu-item:hover {
            background: ${THEME.menuHover} !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;