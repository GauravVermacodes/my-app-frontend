import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import CustomVideoPlayer from "../components/CustomVideoPlayer";
import CommentItem from "../components/CommentItem";

// ✅ Enhanced Professional Theme
const THEME = {
  bg: "#f8fafc",
  bgGradient: "linear-gradient(180deg, #f8fafc 0%, #eff2f7 100%)",
  cardBg: "#ffffff",
  cardBgSubtle: "#f8fafc",
  cardBorder: "#e2e8f0",
  cardBorderHover: "#c7d2fe",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#64748b",
  textDim: "#94a3b8",
  accent: "#6366f1",
  accentDark: "#4338ca",
  accentDarker: "#3730a3",
  accentLight: "#818cf8",
  accentBg: "#eef2ff",
  accentBgHover: "#e0e7ff",
  success: "#10b981",
  successBg: "#ecfdf5",
  warning: "#f59e0b",
  warningBg: "#fffbeb",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  menuHover: "#f1f5f9",
  gold: "#f59e0b",
  gradientStart: "#667eea",
  gradientEnd: "#764ba2",
  royal1: "#1e3a8a",
  royal2: "#3730a3",
  royal3: "#4338ca",
};

const BACKEND_URL =
  (API.defaults.baseURL || "http://localhost:5000/api").replace("/api", "");

const buildUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
};

const parseTimeToSeconds = (input) => {
  if (typeof input === "number") return input;
  if (!input) return 0;
  const parts = String(input).split(":").map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
};

const secondsToTime = (secs) => {
  const s = Math.floor(secs || 0);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
};

// SVG Icons
const Icon = ({ name, size = 18, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    like: <><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></>,
    likeFill: <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" fill="currentColor" />,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
    scissors: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    play: <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />,
    prev: <><polygon points="19 20 9 12 19 4 19 20" fill="currentColor" /><line x1="5" y1="19" x2="5" y2="5" /></>,
    next: <><polygon points="5 4 15 12 5 20 5 4" fill="currentColor" /><line x1="19" y1="5" x2="19" y2="19" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    menu: <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>,
    film: <><rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></>,
    trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
    verified: <><path d="M12 2l2.4 2.8 3.6-.4.4 3.6 2.8 2.4-2.8 2.4-.4 3.6-3.6-.4L12 22l-2.4-2.8-3.6.4-.4-3.6L2.8 12l2.8-2.4.4-3.6 3.6.4z" fill="currentColor" stroke="none"/><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2.5" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    sort: <><path d="M3 6h18M6 12h12M10 18h4" /></>,
    comment: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    whatsapp: <><path d="M20.52 3.48A11.9 11.9 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 21.82c-1.85 0-3.66-.5-5.24-1.44l-.37-.22-3.68.97.98-3.58-.24-.37A9.86 9.86 0 012.18 12C2.18 6.6 6.6 2.18 12 2.18S21.82 6.6 21.82 12 17.4 21.82 12 21.82zm5.4-7.35c-.29-.15-1.75-.87-2.02-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.93 1.15-.17.2-.34.22-.63.07-.29-.14-1.24-.46-2.36-1.46-.87-.78-1.46-1.74-1.63-2.03-.17-.29-.02-.44.13-.59.14-.13.29-.34.44-.5.14-.17.19-.29.29-.48.1-.2.05-.36-.02-.5-.07-.15-.66-1.6-.91-2.19-.24-.57-.48-.5-.66-.51h-.56c-.2 0-.5.07-.77.36-.27.29-1.02.99-1.02 2.42s1.05 2.81 1.19 3c.14.2 2.05 3.13 4.97 4.39.69.3 1.24.48 1.66.61.7.22 1.34.19 1.85.12.56-.08 1.75-.72 2-1.41.24-.7.24-1.29.17-1.41-.07-.13-.26-.2-.55-.34z" fill="currentColor" stroke="none" /></>,
    twitter: <><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></>,
    facebook: <><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showCommentBtns, setShowCommentBtns] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [nextVideo, setNextVideo] = useState(null);

  const [showLocation, setShowLocation] = useState(false);
  const [commentSortBy, setCommentSortBy] = useState("top");

  const [series, setSeries] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [nextEpisode, setNextEpisode] = useState(null);
  const [previousEpisode, setPreviousEpisode] = useState(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(-1);

  const [showShare, setShowShare] = useState(false);
  const [showClip, setShowClip] = useState(false);
  const [clipStart, setClipStart] = useState("0:00");
  const [clipEnd, setClipEnd] = useState("0:30");
  const [clipTitle, setClipTitle] = useState("");

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1200;
  const isDesktop = windowWidth >= 1200;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [videoRes, commentsRes] = await Promise.all([
          API.get(`/videos/${id}`),
          API.get(`/comments/${id}`),
        ]);

        setVideo(videoRes.data);
        setLiked(videoRes.data.likes?.includes(user?.id || user?._id));
        setComments(commentsRes.data || []);

        try { await API.post(`/history/${id}`); } catch (e) {}

        if (videoRes.data.uploader?._id && videoRes.data.uploader._id !== (user?.id || user?._id)) {
          try {
            const subRes = await API.get(`/subscribe/status/${videoRes.data.uploader._id}`);
            setSubscribed(subRes.data.subscribed);
            setSubscribersCount(subRes.data.subscribersCount || 0);
          } catch (e) {}
        }
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error(error.response.data.message);
          navigate("/subscription");
        } else {
          toast.error("Video not found");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const { data } = await API.get(`/series/find-by-video/${id}`);
        setSeries(data.series);
        setCurrentEpisode(data.currentEpisode);
        setNextEpisode(data.nextEpisode);
        setPreviousEpisode(data.previousEpisode);
        setCurrentEpisodeIndex(data.currentEpisodeIndex);
      } catch (e) {
        setSeries(null);
        setNextEpisode(null);
      }
    };
    fetchSeries();
  }, [id]);

  useEffect(() => {
    if (series) return;
    const fetchSuggested = async () => {
      try {
        const { data } = await API.get("/videos", { params: { limit: 15 } });
        const filtered = (data.videos || []).filter((v) => v._id !== id);
        setSuggestedVideos(filtered);
        if (filtered.length > 0) setNextVideo(filtered[0]);
      } catch (e) {}
    };
    fetchSuggested();
  }, [id, series]);

  // ✅ NAVIGATE TO USER PROFILE (like Shorts)
  const handleChannelClick = () => {
    if (!video?.uploader?._id) return;
    const currentUserId = user?._id || user?.id;
    if (video.uploader._id === currentUserId) {
      navigate("/profile");
    } else {
      navigate(`/user/${video.uploader._id}`);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await API.put(`/videos/${id}/like`);
      setLiked(data.liked);
    } catch (error) { toast.error("Failed"); }
  };

  const handleSubscribe = async () => {
    if (!video?.uploader?._id) return;
    try {
      const { data } = await API.post(`/subscribe/${video.uploader._id}`);
      setSubscribed(data.subscribed);
      setSubscribersCount(data.subscribersCount || 0);
      toast.success(data.subscribed ? "Subscribed!" : "Unsubscribed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleDownload = async () => {
    try {
      const { data } = await API.post(`/downloads/${id}`);
      toast.success(`Downloaded! Remaining: ${data.remainingDownloads}`);
      window.open(buildUrl(data.videoUrl), "_blank");
    } catch (error) {
      toast.error(error.response?.data?.message || "Download failed");
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    if (newComment.length > 1000) {
      toast.error("Comment too long (max 1000 characters)");
      return;
    }
    try {
      const { data } = await API.post(`/comments/${id}`, {
        text: newComment,
        showLocation,
      });
      if (data.warning) {
        toast(`${data.warning}`, { duration: 5000, icon: "⚠️" });
      } else {
        toast.success("Comment added!");
      }
      setComments([data, ...comments]);
      setNewComment("");
      setShowCommentBtns(false);
    } catch (error) {
      if (error.response?.data?.blocked) {
        toast.error(`Comment blocked: ${error.response.data.reasons?.join(", ")}`, { duration: 6000 });
      } else {
        toast.error(error.response?.data?.message || "Comment failed");
      }
    }
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter((c) => c._id !== commentId));
    toast.success("Comment deleted");
  };

  const handleUpdateComment = (updatedComment) => {
    setComments(comments.map((c) => (c._id === updatedComment._id ? updatedComment : c)));
  };

  const getSortedComments = () => {
    const sorted = [...comments];
    if (commentSortBy === "top") sorted.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    else if (commentSortBy === "newest") sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (commentSortBy === "oldest") sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return sorted;
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out: ${video?.title}`;
    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
      setShowShare(false);
    } else if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`);
    else if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    else if (platform === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  };

  const openClipModal = () => {
    const videoEl = document.querySelector(".custom-player video");
    if (videoEl) {
      const currentSec = Math.floor(videoEl.currentTime || 0);
      setClipStart(secondsToTime(currentSec));
      setClipEnd(secondsToTime(currentSec + 30));
    }
    setClipTitle(video?.title || "");
    setShowClip(true);
  };

  const handleClip = async () => {
    try {
      const startSec = parseTimeToSeconds(clipStart);
      const endSec = parseTimeToSeconds(clipEnd);
      if (endSec <= startSec) { toast.error("End must be > start"); return; }
      await API.post(`/clips/${id}`, {
        startTime: startSec,
        endTime: endSec,
        title: clipTitle || video?.title,
      });
      toast.success("Clip saved!");
      setShowClip(false);
    } catch (error) { toast.error("Failed"); }
  };

  const handleVideoEnded = () => {
    if (nextEpisode?.video?._id) {
      toast.success(`Playing Episode ${nextEpisode.episodeNumber}`);
      setTimeout(() => navigate(`/video/${nextEpisode.video._id}`), 2000);
    } else if (nextVideo?._id) {
      setTimeout(() => navigate(`/video/${nextVideo._id}`), 2000);
    }
  };

  const formatViews = (v) => {
    if (!v) return "0";
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v;
  };

  const formatDuration = (s) => {
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const formatTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 365) return `${Math.floor(days / 365)}y ago`;
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    return "Today";
  };

  if (loading) {
    return (
      <div style={{ background: THEME.bgGradient, minHeight: "100vh", padding: 60, textAlign: "center", color: THEME.textSecondary }}>
        <div style={{
          width: 48, height: 48,
          border: `3px solid ${THEME.accentBg}`,
          borderTopColor: THEME.accent,
          borderRightColor: THEME.accent,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ fontWeight: 600, fontSize: 14 }}>Loading video...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!video) return null;

  const sortedComments = getSortedComments();
  const s = styles(isMobile, isTablet, isDesktop);
  const isOwnChannel = video.uploader?._id === (user?._id || user?.id);

  return (
    <div style={s.pageWrapper}>
      <style>{globalStyles}</style>

      <div style={s.grid}>
        {/* LEFT COLUMN */}
        <div style={s.leftColumn}>
          {/* Video Player */}
          <div style={s.playerWrap}>
            <CustomVideoPlayer
              src={buildUrl(video.videoUrl)}
              poster={buildUrl(video.thumbnailUrl)}
              title={series ? `${series.title} - Ep ${currentEpisode?.episodeNumber}: ${video.title}` : video.title}
              nextVideoId={nextEpisode?.video?._id || nextVideo?._id}
              nextVideoTitle={nextEpisode ? `Ep ${nextEpisode.episodeNumber}: ${nextEpisode.title}` : nextVideo?.title}
              onEnded={handleVideoEnded}
            />
          </div>

          {/* Series Bar */}
          {series && (
            <div style={s.seriesBar}>
              <div style={s.seriesBarGlow} />
              <div style={s.seriesBarLeft}>
                <div style={s.seriesBarIcon}>
                  <Icon name="film" size={22} color="white" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={s.seriesBarLabel}>
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", marginRight: 6, verticalAlign: "middle" }} />
                    PART OF SERIES
                  </div>
                  <div style={s.seriesBarTitle}>{series.title}</div>
                </div>
              </div>

              <div style={s.seriesBarActions}>
                {previousEpisode && (
                  <button
                    onClick={() => navigate(`/video/${previousEpisode.video._id}`)}
                    style={s.navBtn}
                    className="nav-btn"
                  >
                    <Icon name="prev" size={14} color="white" />
                    {!isMobile && ` Ep ${previousEpisode.episodeNumber}`}
                  </button>
                )}
                <div style={s.currentEpBadge}>
                  Ep {currentEpisode?.episodeNumber} / {series.episodes.length}
                </div>
                {nextEpisode && (
                  <button
                    onClick={() => navigate(`/video/${nextEpisode.video._id}`)}
                    style={s.navBtnNext}
                    className="nav-btn-next"
                  >
                    {!isMobile && `Ep ${nextEpisode.episodeNumber} `}
                    <Icon name="next" size={14} color={THEME.accentDark} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ✅ VIDEO TITLE + Meta */}
          <div style={s.videoDetailsCard}>
            <h1 style={s.videoTitle}>
              {series && (
                <span style={s.epBadgeInline}>
                  Ep {currentEpisode?.episodeNumber}
                </span>
              )}
              {video.title}
            </h1>

            {/* View meta at top */}
            <div style={s.topMetaRow}>
              <div style={s.metaChip}>
                <Icon name="eye" size={13} color={THEME.accent} />
                <span style={{ fontWeight: 700, color: THEME.textPrimary }}>
                  {formatViews(video.views)}
                </span>
                <span style={{ color: THEME.textMuted }}>views</span>
              </div>
              <div style={s.metaChip}>
                <Icon name="calendar" size={13} color={THEME.accent} />
                <span style={{ fontWeight: 600, color: THEME.textSecondary }}>
                  {formatTimeAgo(video.createdAt)}
                </span>
              </div>
              {video.isPremium && (
                <div style={s.premiumBadge}>
                  <span style={{ fontSize: 11 }}>👑</span>
                  PREMIUM
                </div>
              )}
            </div>

            {/* ✅ Channel + Actions Row */}
            <div style={s.actionsBar}>
              {/* ✅ Clickable Channel Info */}
              <div style={s.channelInfo}>
                <div
                  onClick={handleChannelClick}
                  className="channel-clickable"
                  style={s.channelClickable}
                >
                  <div style={s.channelAvatarWrap}>
                    {video.uploader?.avatar ? (
                      <img
                        src={buildUrl(video.uploader.avatar)}
                        alt={video.uploader.name}
                        style={s.channelAvatarImg}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div style={s.channelAvatar}>
                        {video.uploader?.name?.charAt(0).toUpperCase() || "W"}
                      </div>
                    )}
                    {subscribersCount > 100 && (
                      <div style={s.verifiedBadge}>
                        <Icon name="verified" size={14} color={THEME.accent} />
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={s.channelNameWrap}>
                      <div style={s.channelName}>
                        {video.uploader?.name || "Channel"}
                      </div>
                      <Icon name="external" size={12} color={THEME.textMuted} />
                    </div>
                    <div style={s.subCount}>
                      {formatViews(subscribersCount)} subscriber{subscribersCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {!isOwnChannel && (
                  <button
                    onClick={handleSubscribe}
                    className="subscribe-btn"
                    style={subscribed ? s.subscribedBtn : s.subscribeBtn}
                  >
                    {subscribed ? (
                      <>
                        <Icon name="bell" size={14} strokeWidth={2.5} />
                        Subscribed
                      </>
                    ) : (
                      <>
                        <Icon name="bell" size={14} color="white" strokeWidth={2.5} />
                        Subscribe
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Action Pills */}
              <div style={s.actionPills} className="action-pills-scroll">
                <button
                  onClick={handleLike}
                  className="action-pill"
                  style={{
                    ...s.actionPill,
                    ...(liked ? s.actionPillActive : {}),
                  }}
                >
                  <Icon name={liked ? "likeFill" : "like"} size={16} color={liked ? THEME.accent : THEME.textPrimary} />
                  {liked ? "Liked" : "Like"}
                </button>
                <button onClick={() => setShowShare(true)} className="action-pill" style={s.actionPill}>
                  <Icon name="share" size={16} />
                  Share
                </button>
                <button onClick={openClipModal} className="action-pill" style={s.actionPill}>
                  <Icon name="scissors" size={16} />
                  Clip
                </button>
                <button onClick={handleDownload} className="action-pill" style={s.actionPill}>
                  <Icon name="download" size={16} />
                  Save
                </button>
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <div style={s.descriptionBox}>
                <p style={s.descriptionText}>
                  {showFullDesc || video.description.length < 200
                    ? video.description
                    : `${video.description.slice(0, 200)}...`}
                </p>
                {video.description.length > 200 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    style={s.showMoreBtn}
                    className="show-more-btn"
                  >
                    {showFullDesc ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* COMMENTS */}
          <div style={s.commentsSection}>
            <div style={s.commentsHeader}>
              <div style={s.commentsCount}>
                <div style={s.commentsIconWrap}>
                  <Icon name="comment" size={18} color={THEME.accent} />
                </div>
                <span>{comments.length}</span>
                <span style={{ fontWeight: 500, color: THEME.textSecondary }}>
                  Comment{comments.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div style={s.sortWrap}>
                <Icon name="sort" size={14} color={THEME.textSecondary} />
                <select
                  value={commentSortBy}
                  onChange={(e) => setCommentSortBy(e.target.value)}
                  style={s.sortSelect}
                >
                  <option value="top">Top Comments</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Comment Input */}
            <div style={s.commentInputBox}>
              <div style={s.commentAvatar}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  style={s.commentInput}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onFocus={() => setShowCommentBtns(true)}
                  maxLength={1000}
                />

                {newComment.length > 800 && (
                  <div style={{
                    fontSize: 11,
                    color: newComment.length > 950 ? THEME.danger : THEME.warning,
                    marginTop: 4,
                    textAlign: "right",
                    fontWeight: 600,
                  }}>
                    {newComment.length}/1000
                  </div>
                )}

                {showCommentBtns && (
                  <>
                    <div style={s.privacyBox}>
                      <label style={s.privacyLabel}>
                        <input
                          type="checkbox"
                          checked={showLocation}
                          onChange={(e) => setShowLocation(e.target.checked)}
                          style={{ cursor: "pointer", accentColor: THEME.accent }}
                        />
                        <Icon name="globe" size={13} color={THEME.accent} />
                        <span>Show my country only (privacy-safe)</span>
                      </label>
                    </div>

                    <div style={s.moderationInfo}>
                      <Icon name="shield" size={13} color={THEME.textMuted} />
                      <span>Auto-moderated: Abusive content, spam & repeated characters are blocked</span>
                    </div>

                    <div style={s.commentBtns}>
                      <button
                        onClick={() => {
                          setNewComment("");
                          setShowCommentBtns(false);
                          setShowLocation(false);
                        }}
                        style={s.cancelBtn}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={!newComment.trim()}
                        onClick={handleComment}
                        className="submit-btn"
                        style={{
                          ...s.submitBtn,
                          opacity: newComment.trim() ? 1 : 0.5,
                          cursor: newComment.trim() ? "pointer" : "not-allowed",
                        }}
                      >
                        Comment
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {sortedComments.length === 0 ? (
              <div style={s.emptyComments}>
                <div style={s.emptyCommentsIconWrap}>
                  <Icon name="comment" size={28} color={THEME.accent} />
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: THEME.textPrimary, fontSize: 16 }}>
                  No comments yet
                </p>
                <p style={{ fontSize: 13, marginTop: 6, color: THEME.textSecondary, fontWeight: 500 }}>
                  Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              sortedComments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  currentUserId={user?._id || user?.id}
                  onUpdate={handleUpdateComment}
                  onDelete={handleDeleteComment}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={s.rightColumn}>
          {series ? (
            <SeriesSidebar
              series={series}
              currentVideoId={id}
              currentEpisodeIndex={currentEpisodeIndex}
              navigate={navigate}
              formatDuration={formatDuration}
              isMobile={isMobile}
            />
          ) : (
            <SuggestedSidebar
              videos={suggestedVideos}
              currentId={id}
              formatViews={formatViews}
              formatDuration={formatDuration}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <div style={s.modalOverlay} onClick={() => setShowShare(false)}>
          <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={s.modalIconWrap}>
                  <Icon name="share" size={16} color={THEME.accent} />
                </div>
                <h2 style={s.modalTitle}>Share this video</h2>
              </div>
              <button onClick={() => setShowShare(false)} style={s.modalClose} className="modal-close">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div style={s.shareOptions}>
              <div className="share-opt" style={s.shareOption} onClick={() => handleShare("whatsapp")}>
                <div style={{ ...s.shareIcon, background: "linear-gradient(135deg, #25d366, #128c7e)" }}>
                  <Icon name="whatsapp" size={24} color="white" />
                </div>
                <span style={s.shareLabel}>WhatsApp</span>
              </div>
              <div className="share-opt" style={s.shareOption} onClick={() => handleShare("twitter")}>
                <div style={{ ...s.shareIcon, background: "linear-gradient(135deg, #1da1f2, #0d8ecc)" }}>
                  <Icon name="twitter" size={22} color="white" />
                </div>
                <span style={s.shareLabel}>Twitter</span>
              </div>
              <div className="share-opt" style={s.shareOption} onClick={() => handleShare("facebook")}>
                <div style={{ ...s.shareIcon, background: "linear-gradient(135deg, #1877f2, #0e5cbf)" }}>
                  <Icon name="facebook" size={22} color="white" />
                </div>
                <span style={s.shareLabel}>Facebook</span>
              </div>
            </div>
            <div style={s.copyLinkBox}>
              <input readOnly value={window.location.href} style={s.copyInput} />
              <button onClick={() => handleShare("copy")} style={s.copyBtn} className="copy-btn">
                <Icon name="copy" size={14} color="white" />
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clip Modal */}
      {showClip && (
        <div style={s.modalOverlay} onClick={() => setShowClip(false)}>
          <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={s.modalIconWrap}>
                  <Icon name="scissors" size={18} color={THEME.accent} />
                </div>
                <h2 style={s.modalTitle}>Create Clip</h2>
              </div>
              <button onClick={() => setShowClip(false)} style={s.modalClose} className="modal-close">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={s.formLabel}>Clip Title</label>
              <input
                value={clipTitle}
                onChange={(e) => setClipTitle(e.target.value)}
                style={s.formInput}
                placeholder="Give your clip a name"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={s.formLabel}>Start Time</label>
                <input
                  value={clipStart}
                  onChange={(e) => setClipStart(e.target.value)}
                  style={s.formInput}
                  placeholder="0:00"
                />
              </div>
              <div>
                <label style={s.formLabel}>End Time</label>
                <input
                  value={clipEnd}
                  onChange={(e) => setClipEnd(e.target.value)}
                  style={s.formInput}
                  placeholder="0:30"
                />
              </div>
            </div>
            <button onClick={handleClip} style={s.primaryBtn} className="primary-btn">
              <Icon name="scissors" size={16} color="white" />
              Save Clip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ SERIES SIDEBAR ============
const SeriesSidebar = ({ series, currentVideoId, currentEpisodeIndex, navigate, formatDuration, isMobile }) => {
  const getEpisodeStatus = (index) => {
    if (index < currentEpisodeIndex) return "watched";
    if (index === currentEpisodeIndex) return "now";
    if (index === currentEpisodeIndex + 1) return "next";
    return "upcoming";
  };

  const progressPercent = ((currentEpisodeIndex + 1) / series.episodes.length) * 100;

  return (
    <div style={sidebarStyles.container}>
      <div style={sidebarStyles.header}>
        <div style={sidebarStyles.headerTop}>
          <div style={sidebarStyles.headerIconBtn}>
            <Icon name="film" size={18} color={THEME.accent} />
          </div>
          <div style={sidebarStyles.headerInfo}>
            <div style={sidebarStyles.headerTitle}>{series.title}</div>
            <div style={sidebarStyles.headerSubtitle}>
              Episode {currentEpisodeIndex + 1} of {series.episodes.length}
            </div>
          </div>
        </div>

        <div style={sidebarStyles.progressWrap}>
          <div style={sidebarStyles.progressBar}>
            <div
              style={{
                ...sidebarStyles.progressBarFill,
                width: `${progressPercent}%`,
              }}
            />
          </div>
          <span style={sidebarStyles.progressPercent}>{Math.round(progressPercent)}%</span>
        </div>
      </div>

      <div style={sidebarStyles.episodesList} className="sidebar-scroll">
        {series.episodes.map((ep, index) => {
          const status = getEpisodeStatus(index);
          const isCurrent = status === "now";
          const isWatched = status === "watched";
          const isNext = status === "next";

          return (
            <div
              key={ep._id || index}
              onClick={() => !isCurrent && navigate(`/video/${ep.video._id}`)}
              className={isCurrent ? "" : "sidebar-card"}
              style={{
                ...sidebarStyles.episodeCard,
                background: isCurrent ? THEME.accentBg : THEME.cardBg,
                borderColor: isCurrent ? THEME.accent : "transparent",
                cursor: isCurrent ? "default" : "pointer",
              }}
            >
              <div style={sidebarStyles.thumbnailWrap}>
                <img
                  src={buildUrl(ep.video?.thumbnailUrl)}
                  alt={ep.video?.title}
                  style={sidebarStyles.thumbnail}
                  loading="lazy"
                  onError={(e) => { e.target.src = "https://picsum.photos/160/90"; }}
                />

                {isWatched && (
                  <div style={sidebarStyles.indicatorOverlay}>
                    <div style={{ ...sidebarStyles.indicator, background: THEME.success }}>
                      <Icon name="check" size={16} color="white" strokeWidth={3} />
                    </div>
                  </div>
                )}
                {isCurrent && (
                  <div style={sidebarStyles.indicatorOverlay}>
                    <div style={{ ...sidebarStyles.indicator, background: THEME.accent, position: "relative" }}>
                      <div style={sidebarStyles.pulseDot} />
                      <Icon name="play" size={14} color="white" />
                    </div>
                  </div>
                )}

                <div style={sidebarStyles.episodeNumber}>{ep.episodeNumber}</div>

                {ep.video?.duration > 0 && (
                  <div style={sidebarStyles.duration}>
                    {formatDuration(ep.video.duration)}
                  </div>
                )}
              </div>

              <div style={sidebarStyles.info}>
                <div style={{
                  ...sidebarStyles.episodeTitle,
                  color: isCurrent ? THEME.accentDark : THEME.textPrimary,
                  fontWeight: isCurrent ? 700 : 600,
                }}>
                  {ep.video?.title}
                </div>

                <div style={sidebarStyles.channelLabel}>
                  {ep.video?.uploader?.name || "Channel"}
                </div>

                {isCurrent && (
                  <div style={{ ...sidebarStyles.statusBadge, background: THEME.accent, color: "white" }}>
                    <div style={sidebarStyles.badgeDot} />
                    NOW PLAYING
                  </div>
                )}
                {isNext && (
                  <div style={{ ...sidebarStyles.statusBadge, background: THEME.warning, color: "white" }}>
                    UP NEXT
                  </div>
                )}
                {isWatched && (
                  <div style={sidebarStyles.watchedText}>
                    <Icon name="check" size={11} color={THEME.success} strokeWidth={3} />
                    <span>Watched</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ SUGGESTED SIDEBAR ============
const SuggestedSidebar = ({ videos, currentId, formatViews, formatDuration, isMobile }) => {
  const formatTimeAgoLocal = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 365) return `${Math.floor(days / 365)}y ago`;
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    return "Today";
  };

  return (
    <div style={sidebarStyles.container}>
      <div style={sidebarStyles.header}>
        <div style={sidebarStyles.headerTop}>
          <div style={sidebarStyles.headerIconBtn}>
            <Icon name="trending" size={18} color={THEME.accent} />
          </div>
          <div style={sidebarStyles.headerInfo}>
            <div style={sidebarStyles.headerTitle}>Up Next</div>
            <div style={sidebarStyles.headerSubtitle}>Recommended for you</div>
          </div>
        </div>
      </div>

      <div style={sidebarStyles.episodesList} className="sidebar-scroll">
        {videos.map((v) => (
          <Link
            key={v._id}
            to={`/video/${v._id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="sidebar-card" style={sidebarStyles.episodeCard}>
              <div style={sidebarStyles.thumbnailWrap}>
                <img
                  src={buildUrl(v.thumbnailUrl)}
                  alt={v.title}
                  loading="lazy"
                  style={sidebarStyles.thumbnail}
                  onError={(e) => { e.target.src = "https://picsum.photos/160/90"; }}
                />
                <div className="thumb-play-overlay" style={sidebarStyles.thumbPlayOverlay}>
                  <div style={sidebarStyles.thumbPlayBtn}>
                    <Icon name="play" size={16} color={THEME.accentDark} />
                  </div>
                </div>
                {v.duration > 0 && (
                  <div style={sidebarStyles.duration}>{formatDuration(v.duration)}</div>
                )}
              </div>
              <div style={sidebarStyles.info}>
                <div style={{ ...sidebarStyles.episodeTitle, color: THEME.textPrimary }}>
                  {v.title}
                </div>
                <div style={sidebarStyles.channelLabel}>
                  {v.uploader?.name || "Channel"}
                </div>
                <div style={sidebarStyles.videoMeta}>
                  <span>{formatViews(v.views)} views</span>
                  {v.createdAt && (
                    <>
                      <span>•</span>
                      <span>{formatTimeAgoLocal(v.createdAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ============ STYLES ============
const styles = (isMobile, isTablet, isDesktop) => ({
  pageWrapper: {
    background: THEME.bgGradient,
    minHeight: "100vh",
    padding: isMobile ? "12px 10px 40px" : "20px 20px 40px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  grid: {
    maxWidth: 1600,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "minmax(0, 1fr) 400px",
    gap: isMobile ? 14 : 20,
    alignItems: "start",
  },
  leftColumn: { minWidth: 0, display: "flex", flexDirection: "column", gap: 16 },
  rightColumn: {},

  playerWrap: {
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(15,23,42,0.12)",
    border: `1px solid ${THEME.cardBorder}`,
  },

  // ═══════════ SERIES BAR ═══════════
  seriesBar: {
    position: "relative",
    background: `linear-gradient(135deg, ${THEME.royal1} 0%, ${THEME.royal2} 50%, ${THEME.royal3} 100%)`,
    borderRadius: 14,
    padding: isMobile ? "14px 16px" : "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    flexWrap: "wrap",
    gap: 12,
    boxShadow: "0 8px 24px rgba(30,58,138,0.3)",
    overflow: "hidden",
    border: `1px solid ${THEME.accent}`,
  },
  seriesBarGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)",
    filter: "blur(30px)",
    pointerEvents: "none",
  },
  seriesBarLeft: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 14,
    minWidth: 0,
    flex: 1,
    zIndex: 2,
  },
  seriesBarIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(251,191,36,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  seriesBarLabel: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.2,
    color: "#fbbf24",
  },
  seriesBarTitle: {
    fontSize: isMobile ? 14 : 16,
    fontWeight: 800,
    marginTop: 3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    letterSpacing: "-0.01em",
  },
  seriesBarActions: {
    position: "relative",
    display: "flex",
    gap: 6,
    alignItems: "center",
    flexWrap: "wrap",
    zIndex: 2,
  },
  navBtn: {
    padding: isMobile ? "8px" : "8px 14px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  navBtnNext: {
    padding: isMobile ? "8px" : "8px 14px",
    background: "white",
    color: THEME.accentDark,
    border: "none",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontFamily: "inherit",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  currentEpBadge: {
    padding: "7px 12px",
    background: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    color: "#fbbf24",
    letterSpacing: 0.3,
    border: "1px solid rgba(251,191,36,0.3)",
  },

  // ═══════════ VIDEO DETAILS ═══════════
  videoDetailsCard: {
    background: THEME.cardBg,
    borderRadius: 16,
    padding: isMobile ? 18 : 24,
    border: `1px solid ${THEME.cardBorder}`,
    boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
  },
  videoTitle: {
    fontSize: isMobile ? 18 : 22,
    fontWeight: 800,
    color: THEME.textPrimary,
    margin: "0 0 14px 0",
    lineHeight: 1.35,
    letterSpacing: "-0.02em",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  },
  epBadgeInline: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.3,
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
  },
  topMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  metaChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    background: THEME.accentBg,
    borderRadius: 20,
    fontSize: 12,
    border: `1px solid ${THEME.accentBgHover}`,
  },
  premiumBadge: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "white",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.5,
    boxShadow: "0 2px 8px rgba(245,158,11,0.35)",
  },
  actionsBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 18,
    paddingBottom: 18,
    borderBottom: `1px solid ${THEME.cardBorder}`,
  },
  channelInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: isMobile ? "1 1 100%" : "1 1 auto",
    minWidth: 0,
  },
  channelClickable: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    padding: "4px 8px 4px 4px",
    borderRadius: 12,
    transition: "all 0.15s",
    minWidth: 0,
    flex: 1,
  },
  channelAvatarWrap: {
    position: "relative",
    flexShrink: 0,
  },
  channelAvatar: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${THEME.gradientStart}, ${THEME.gradientEnd})`,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 18,
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(102,126,234,0.35)",
  },
  channelAvatarImg: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
    boxShadow: "0 4px 12px rgba(15,23,42,0.15)",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    background: "white",
    borderRadius: "50%",
    padding: 2,
    boxShadow: "0 2px 6px rgba(15,23,42,0.15)",
    display: "flex",
  },
  channelNameWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  channelName: {
    fontWeight: 700,
    color: THEME.textPrimary,
    fontSize: 14,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    letterSpacing: "-0.01em",
  },
  subCount: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
    fontWeight: 500,
  },
  subscribeBtn: {
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: 22,
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
    letterSpacing: "-0.01em",
  },
  subscribedBtn: {
    background: THEME.menuHover,
    color: THEME.textPrimary,
    border: `1.5px solid ${THEME.cardBorder}`,
    padding: "9px 18px",
    borderRadius: 22,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    transition: "all 0.15s",
  },
  actionPills: {
    display: "flex",
    gap: 8,
    flexWrap: isMobile ? "nowrap" : "wrap",
    overflowX: isMobile ? "auto" : "visible",
    paddingBottom: isMobile ? 4 : 0,
    width: isMobile ? "100%" : "auto",
  },
  actionPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 16px",
    background: THEME.menuHover,
    color: THEME.textPrimary,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 22,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  actionPillActive: {
    background: THEME.accentBg,
    color: THEME.accent,
    borderColor: THEME.accent,
    boxShadow: "0 2px 8px rgba(99,102,241,0.15)",
  },
  descriptionBox: {
    background: THEME.cardBgSubtle,
    borderRadius: 12,
    padding: 16,
    border: `1px solid ${THEME.cardBorder}`,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: THEME.textPrimary,
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontWeight: 500,
  },
  showMoreBtn: {
    background: "transparent",
    border: "none",
    color: THEME.accent,
    cursor: "pointer",
    padding: "6px 0 0",
    marginTop: 6,
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "inherit",
    letterSpacing: "-0.01em",
  },

  // ═══════════ COMMENTS ═══════════
  commentsSection: {
    background: THEME.cardBg,
    borderRadius: 16,
    padding: isMobile ? 18 : 24,
    border: `1px solid ${THEME.cardBorder}`,
    boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
  },
  commentsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    flexWrap: "wrap",
    gap: 12,
  },
  commentsCount: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: 800,
    color: THEME.textPrimary,
    display: "flex",
    alignItems: "center",
    gap: 10,
    letterSpacing: "-0.01em",
  },
  commentsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: THEME.accentBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${THEME.accentBgHover}`,
  },
  sortWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: THEME.menuHover,
    padding: "7px 12px",
    borderRadius: 10,
    border: `1px solid ${THEME.cardBorder}`,
  },
  sortSelect: {
    padding: "2px 8px 2px 4px",
    background: "transparent",
    color: THEME.textPrimary,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
    outline: "none",
  },
  commentInputBox: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
  },
  commentAvatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    flexShrink: 0,
    fontSize: 16,
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  commentInput: {
    width: "100%",
    padding: "10px 0",
    background: "transparent",
    border: "none",
    borderBottom: `2px solid ${THEME.cardBorder}`,
    color: THEME.textPrimary,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  privacyBox: {
    marginTop: 12,
    padding: "10px 14px",
    background: THEME.accentBg,
    borderRadius: 10,
    border: `1px solid ${THEME.accentBgHover}`,
  },
  privacyLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: THEME.textSecondary,
    cursor: "pointer",
    fontWeight: 500,
  },
  moderationInfo: {
    marginTop: 8,
    fontSize: 11,
    color: THEME.textMuted,
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    background: THEME.menuHover,
    borderRadius: 8,
    fontWeight: 500,
  },
  commentBtns: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 14,
  },
  cancelBtn: {
    padding: "9px 18px",
    background: "transparent",
    color: THEME.textPrimary,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 22,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  submitBtn: {
    padding: "10px 24px",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    border: "none",
    borderRadius: 22,
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
    letterSpacing: "-0.01em",
    transition: "all 0.15s",
  },
  emptyComments: {
    textAlign: "center",
    padding: "50px 20px",
    color: THEME.textSecondary,
    background: THEME.cardBgSubtle,
    borderRadius: 12,
    border: `1px dashed ${THEME.cardBorder}`,
  },
  emptyCommentsIconWrap: {
    width: 68,
    height: 68,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: "0 4px 16px rgba(99,102,241,0.15)",
    border: `1px solid ${THEME.accentBgHover}`,
  },

  // ═══════════ MODALS ═══════════
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    display: "flex",
    alignItems: isMobile ? "flex-end" : "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(6px)",
    padding: isMobile ? 0 : 16,
    animation: "fadeIn 0.2s ease",
  },
  modalBox: {
    background: THEME.cardBg,
    borderRadius: isMobile ? "20px 20px 0 0" : 18,
    padding: isMobile ? 22 : 26,
    width: "100%",
    maxWidth: 460,
    border: `1px solid ${THEME.cardBorder}`,
    boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
    animation: isMobile ? "slideUp 0.3s ease" : "modalPop 0.3s ease",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: THEME.accentBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${THEME.accentBgHover}`,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: THEME.textPrimary,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: THEME.menuHover,
    border: `1px solid ${THEME.cardBorder}`,
    color: THEME.textSecondary,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  },
  shareOptions: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: 22,
    gap: 12,
  },
  shareOption: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    padding: 10,
    borderRadius: 12,
    transition: "all 0.15s",
    flex: 1,
  },
  shareIcon: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
    transition: "all 0.2s",
  },
  shareLabel: {
    fontSize: 12,
    color: THEME.textPrimary,
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  copyLinkBox: {
    display: "flex",
    gap: 8,
    padding: 8,
    background: THEME.cardBgSubtle,
    borderRadius: 12,
    border: `1px solid ${THEME.cardBorder}`,
  },
  copyInput: {
    flex: 1,
    padding: "8px 12px",
    background: "transparent",
    border: "none",
    color: THEME.textSecondary,
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "inherit",
    outline: "none",
    minWidth: 0,
  },
  copyBtn: {
    padding: "10px 18px",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "inherit",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
    transition: "all 0.15s",
  },
  formLabel: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: THEME.textPrimary,
    marginBottom: 8,
    letterSpacing: "-0.01em",
    textTransform: "uppercase",
  },
  formInput: {
    width: "100%",
    padding: "12px 14px",
    background: THEME.cardBgSubtle,
    border: `1.5px solid ${THEME.cardBorder}`,
    color: THEME.textPrimary,
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontWeight: 500,
    transition: "border-color 0.15s",
  },
  primaryBtn: {
    width: "100%",
    padding: 13,
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    boxShadow: "0 6px 18px rgba(99,102,241,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "inherit",
    letterSpacing: "-0.01em",
    transition: "all 0.2s",
  },
});

// ============ SIDEBAR STYLES ============
const sidebarStyles = {
  container: {
    background: THEME.cardBg,
    borderRadius: 16,
    border: `1px solid ${THEME.cardBorder}`,
    boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    maxHeight: "calc(100vh - 100px)",
    position: "sticky",
    top: 80,
  },
  header: {
    padding: "18px 20px",
    borderBottom: `1px solid ${THEME.cardBorder}`,
    background: `linear-gradient(135deg, ${THEME.accentBg}, #fafbff)`,
  },
  headerTop: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: THEME.cardBg,
    border: `1px solid ${THEME.accentBgHover}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 6px rgba(99,102,241,0.1)",
  },
  headerInfo: { flex: 1, minWidth: 0 },
  headerTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: THEME.textPrimary,
    lineHeight: 1.3,
    letterSpacing: "-0.02em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
    fontWeight: 500,
  },
  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    background: THEME.cardBorder,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.accentDark})`,
    borderRadius: 3,
    transition: "width 0.3s ease",
    boxShadow: "0 0 8px rgba(99,102,241,0.5)",
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: 800,
    color: THEME.accentDark,
    minWidth: 32,
    textAlign: "right",
  },
  episodesList: {
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
    flex: 1,
  },
  episodeCard: {
    display: "flex",
    gap: 12,
    padding: 10,
    borderRadius: 12,
    border: "1px solid transparent",
    background: THEME.cardBg,
    transition: "all 0.2s",
    textDecoration: "none",
  },
  thumbnailWrap: {
    position: "relative",
    width: 130,
    height: 76,
    borderRadius: 10,
    overflow: "hidden",
    flexShrink: 0,
    background: THEME.menuHover,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s",
  },
  thumbPlayOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s",
  },
  thumbPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  indicatorOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  },
  indicator: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  },
  pulseDot: {
    position: "absolute",
    inset: -4,
    borderRadius: "50%",
    background: THEME.accent,
    opacity: 0.5,
    animation: "pulse 1.5s ease-in-out infinite",
  },
  episodeNumber: {
    position: "absolute",
    top: 5,
    left: 5,
    background: "rgba(0,0,0,0.85)",
    color: "#fbbf24",
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 7px",
    borderRadius: 5,
    minWidth: 20,
    textAlign: "center",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(251,191,36,0.3)",
  },
  duration: {
    position: "absolute",
    bottom: 5,
    right: 5,
    background: "rgba(0,0,0,0.85)",
    color: "white",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: 4,
    backdropFilter: "blur(4px)",
  },
  info: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    padding: "2px 0",
  },
  episodeTitle: {
    fontSize: 13,
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    wordBreak: "break-word",
  },
  channelLabel: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: 600,
    marginTop: 3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  videoMeta: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 3,
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontWeight: 500,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 9px",
    borderRadius: 6,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.5,
    alignSelf: "flex-start",
    marginTop: 5,
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "white",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  watchedText: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 10,
    color: THEME.success,
    fontWeight: 700,
    marginTop: 5,
  },
};

const globalStyles = `
  * { -webkit-tap-highlight-color: transparent; }
  html, body { overflow-x: hidden; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes modalPop {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.2; transform: scale(1.2); }
  }

  .sidebar-scroll::-webkit-scrollbar { width: 8px; }
  .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
  .sidebar-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #cbd5e1, #94a3b8);
    border-radius: 4px;
  }
  .sidebar-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #94a3b8, #64748b);
  }

  .action-pills-scroll::-webkit-scrollbar { display: none; }

  input:focus, textarea:focus, select:focus {
    border-color: #6366f1 !important;
  }

  @media (hover: hover) {
    .channel-clickable:hover {
      background: #f1f5f9;
      transform: translateX(2px);
    }
    .sidebar-card:hover {
      background: #f8fafc !important;
      border-color: #c7d2fe !important;
      transform: translateX(-2px);
      box-shadow: 0 4px 12px rgba(99,102,241,0.1);
    }
    .sidebar-card:hover .thumbnail {
      transform: scale(1.05);
    }
    .sidebar-card:hover .thumb-play-overlay {
      opacity: 1 !important;
    }
    .action-pill:hover {
      background: #e0e7ff !important;
      border-color: #6366f1 !important;
      color: #6366f1 !important;
      transform: translateY(-1px);
    }
    .subscribe-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(99,102,241,0.45) !important;
    }
    .nav-btn:hover {
      background: rgba(255,255,255,0.25) !important;
    }
    .nav-btn-next:hover {
      transform: scale(1.03);
      box-shadow: 0 6px 16px rgba(0,0,0,0.3) !important;
    }
    .share-opt:hover {
      background: #f1f5f9 !important;
      transform: translateY(-2px);
    }
    .share-opt:hover .share-icon-inner {
      transform: scale(1.05);
    }
    .modal-close:hover {
      background: #fef2f2 !important;
      color: #ef4444 !important;
      border-color: #fecaca !important;
    }
    .cancel-btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }
    .submit-btn:hover, .primary-btn:hover, .copy-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(99,102,241,0.5) !important;
    }
    .show-more-btn:hover {
      text-decoration: underline;
    }
  }

  button:active { transform: scale(0.98); }
`;

export default VideoPlayer;