import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import { addToWatchList } from "../store/slices/watchListSlice";
import {
  addToHistory,
  downloadVideo,
  reportVideo,
  hideVideo,
} from "../store/slices/videosSlice";
import {
  fetchMyPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  createPlaylistWithVideo,
  selectMyPlaylists,
  selectPlaylistsLoading,
} from "../store/slices/playlistsSlice";

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
  // Cover gradient (warm royal)
  cover1: "#92400e",
  cover2: "#d97706",
  cover3: "#fbbf24",
};

const BACKEND = "http://localhost:5000";
const getUrl = (u) => {
  if (!u) return "";
  return u.startsWith("http") ? u : `${BACKEND}${u}`;
};

// SVG Icons
const Icon = ({ name, size = 18, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    bellFilled: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="currentColor" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    back: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 19" /></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    moreVertical: <><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="5" r="1.5" fill="currentColor" /><circle cx="12" cy="19" r="1.5" fill="currentColor" /></>,
    watchTogether: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>,
    queue: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    history: <><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><polyline points="12 7 12 12 15 15" /></>,
    playlist: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><polygon points="3 5 6 7 3 9 3 5" fill="currentColor" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    notInterested: <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></>,
    report: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
    verified: <><path d="M12 2l2.4 2.8 3.6-.4.4 3.6 2.8 2.4-2.8 2.4-.4 3.6-3.6-.4L12 22l-2.4-2.8-3.6.4-.4-3.6L2.8 12l2.8-2.4.4-3.6 3.6.4z" fill="currentColor" stroke="none"/><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2.5" /></>,
    play: <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();

  const userPlaylists = useSelector(selectMyPlaylists);
  const loadingPlaylists = useSelector(selectPlaylistsLoading);

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [activeTab, setActiveTab] = useState("videos");
  const [openMenuId, setOpenMenuId] = useState(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingVideo, setReportingVideo] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [savingVideoId, setSavingVideoId] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;

  useEffect(() => {
    fetchUserContent();
  }, [userId]);

  const fetchUserContent = async () => {
    try {
      setLoading(true);

      if (userId === (currentUser?._id || currentUser?.id)) {
        navigate("/profile");
        return;
      }

      let allUserContent = [];
      try {
        const { data } = await API.get("/videos");
        const allVideos = data.videos || data || [];
        allUserContent = allVideos.filter(
          (v) => v.uploader?._id === userId || v.uploader === userId
        );
      } catch (e) {
        console.error("Failed to fetch videos:", e);
      }

      try {
        const { data } = await API.get("/videos/shorts");
        const allShorts = data.shorts || data || [];
        const userShorts = allShorts.filter(
          (v) => v.uploader?._id === userId || v.uploader === userId
        );
        allUserContent = [...allUserContent, ...userShorts];
      } catch (e) {
        console.error("Failed to fetch shorts:", e);
      }

      const uniqueContent = Array.from(
        new Map(allUserContent.map((v) => [v._id, v])).values()
      );

      if (uniqueContent.length === 0) {
        toast.error("This user has no public content");
        setTimeout(() => navigate(-1), 1000);
        return;
      }

      const uploaderData = uniqueContent[0].uploader;
      setProfile({
        _id: uploaderData._id,
        name: uploaderData.name || "Unknown User",
        username:
          uploaderData.username ||
          uploaderData.name?.toLowerCase().replace(/\s+/g, "") ||
          "user",
        avatar: uploaderData.avatar,
        email: uploaderData.email,
        createdAt: uploaderData.createdAt || new Date(),
      });

      setVideos(uniqueContent.filter((v) => !v.duration || v.duration > 60));
      setShorts(uniqueContent.filter((v) => v.duration && v.duration <= 60));

      try {
        const { data } = await API.get(`/subscribe/status/${userId}`);
        setSubscribed(data.subscribed || false);
        setSubscribersCount(data.subscribersCount || 0);
      } catch (e) {
        console.log("Subscription status not available");
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
      toast.error("Failed to load profile");
      setTimeout(() => navigate(-1), 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!profile?._id) return;
    try {
      const { data } = await API.post(`/subscribe/${profile._id}`);
      setSubscribed(data.subscribed);
      setSubscribersCount(data.subscribersCount || 0);
      toast.success(data.subscribed ? "Subscribed!" : "Unsubscribed");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to subscribe");
    }
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/user/${userId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: profile.name, url });
        toast.success("Shared!");
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("🔗 Profile link copied!");
    }
  };

  // ============ MENU HANDLERS ============
  const handleAddToWatchList = (video, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    dispatch(addToWatchList(video));
    toast.success("📺 Added to Watch List!");
    setOpenMenuId(null);
  };

  const handleAddToQueue = (video, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const queue = JSON.parse(localStorage.getItem("videoQueue") || "[]");
    if (queue.some((v) => v._id === video._id)) {
      toast("Already in queue!", { icon: "ℹ️" });
    } else {
      queue.push({
        _id: video._id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
      });
      localStorage.setItem("videoQueue", JSON.stringify(queue));
      toast.success(`▶️ Added to queue (${queue.length} videos)`);
    }
    setOpenMenuId(null);
  };

  const handleAddToHistory = async (video, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      await dispatch(addToHistory(video._id)).unwrap();
      toast.success("📜 Added to History");
      setOpenMenuId(null);
    } catch (err) {
      toast.error(err || "Failed");
    }
  };

  const handleAddToPlaylist = async (video, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setOpenMenuId(null);
    setSavingVideoId(video._id);
    setShowPlaylistModal(true);
    setShowNewPlaylistInput(false);
    setNewPlaylistName("");
    try {
      await dispatch(fetchMyPlaylists()).unwrap();
    } catch (e) {
      toast.error("Failed to load playlists");
    }
  };

  const handleSaveToPlaylist = async (playlistId) => {
    try {
      await dispatch(addVideoToPlaylist({ playlistId, videoId: savingVideoId })).unwrap();
      toast.success("✅ Saved to playlist!");
    } catch (e) {
      if (e?.includes?.("already")) toast("Already in this playlist", { icon: "ℹ️" });
      else toast.error(e || "Failed to save");
    }
  };

  const handleRemoveFromPlaylist = async (playlistId) => {
    try {
      await dispatch(removeVideoFromPlaylist({ playlistId, videoId: savingVideoId })).unwrap();
      toast.success("Removed from playlist");
    } catch (e) {
      toast.error("Failed to remove");
    }
  };

  const handleCreateAndSave = async () => {
    if (!newPlaylistName.trim()) return toast.error("Name required");
    setCreatingPlaylist(true);
    try {
      await dispatch(createPlaylistWithVideo({
        name: newPlaylistName.trim(),
        videoId: savingVideoId,
      })).unwrap();
      toast.success(`✅ Saved to "${newPlaylistName}"!`);
      setNewPlaylistName("");
      setShowNewPlaylistInput(false);
    } catch (e) {
      toast.error(e || "Failed");
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const isVideoInPlaylist = (playlist) =>
    (playlist.videos || []).some((v) => (v._id || v) === savingVideoId);

  const handleDownload = async (video, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      const data = await dispatch(downloadVideo(video._id)).unwrap();
      toast.success(`📥 Download started! Remaining: ${data.remainingDownloads}`);
      const backendUrl = API.defaults.baseURL?.replace("/api", "") || "http://localhost:5000";
      const url = data.videoUrl?.startsWith("http") ? data.videoUrl : `${backendUrl}${data.videoUrl}`;
      window.open(url, "_blank");
      setOpenMenuId(null);
    } catch (err) {
      toast.error(err || "Download failed");
    }
  };

  const handleShare = (video, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    navigator.clipboard.writeText(`${window.location.origin}/video/${video._id}`);
    toast.success("🔗 Link copied!");
    setOpenMenuId(null);
  };

  const handleCopyLink = (video, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    navigator.clipboard.writeText(`${window.location.origin}/video/${video._id}`);
    toast.success("🔗 Link copied!");
    setOpenMenuId(null);
  };

  const handleNotInterested = (video, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    dispatch(hideVideo(video._id));
    setVideos((prev) => prev.filter((v) => v._id !== video._id));
    setShorts((prev) => prev.filter((v) => v._id !== video._id));
    toast.success("👋 We'll show you fewer videos like this");
    setOpenMenuId(null);
  };

  const handleReport = (video, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setReportingVideo(video);
    setShowReportModal(true);
    setOpenMenuId(null);
  };

  const handleSubmitReport = async () => {
    if (!reportReason) {
      toast.error("Please select a reason");
      return;
    }
    try {
      await dispatch(reportVideo({
        videoId: reportingVideo._id,
        reason: reportReason,
        description: reportDescription,
      })).unwrap();
      toast.success("🚩 Report submitted!");
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
      setReportingVideo(null);
    } catch (err) {
      toast.error(err || "Failed to submit");
    }
  };

  const formatCount = (n) => {
    if (!n) return "0";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n;
  };

  const formatTimeAgo = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 365) return `${Math.floor(days / 365)}y ago`;
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    return "Today";
  };

  const formatDuration = (s) => {
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const formatJoinDate = (date) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const menuOptions = [
    { iconName: "watchTogether", label: "Watch Together", action: handleAddToWatchList, highlight: true },
    { iconName: "queue", label: "Add to queue", action: handleAddToQueue },
    { iconName: "history", label: "Add to history", action: handleAddToHistory },
    { iconName: "playlist", label: "Save to playlist", action: handleAddToPlaylist },
    { iconName: "download", label: "Download", action: handleDownload },
    { iconName: "share", label: "Share", action: handleShare },
    { iconName: "copy", label: "Copy link", action: handleCopyLink },
    { iconName: "notInterested", label: "Not interested", action: handleNotInterested },
    { iconName: "report", label: "Report", action: handleReport, danger: true },
  ];

  if (loading) {
    return (
      <div style={styles(isMobile).loadingWrap}>
        <div style={styles(isMobile).spinner} />
        <p style={{ color: THEME.textSecondary, marginTop: 16, fontWeight: 600 }}>
          Loading profile...
        </p>
        <style>{globalStyles}</style>
      </div>
    );
  }

  if (!profile) return null;

  const s = styles(isMobile);
  const totalVideos = videos.length + shorts.length;
  const totalViews = [...videos, ...shorts].reduce(
    (sum, v) => sum + (v.views || 0),
    0
  );

  return (
    <div style={s.page}>
      <style>{globalStyles}</style>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={s.backBtn}
        className="back-btn"
      >
        <Icon name="back" size={16} />
        <span>Back</span>
      </button>

      <div style={s.container}>
        {/* PROFILE HEADER CARD */}
        <div style={s.profileCard} className="profile-card">
          {/* Cover with warm gradient */}
          <div style={s.coverWrap}>
            <div style={s.coverGradient} />
            <div style={s.coverPattern} />
            <div style={s.coverGlow1} />
            <div style={s.coverGlow2} />
          </div>

          <div style={s.profileContent}>
            {/* Avatar */}
            <div style={s.avatarWrap}>
              <div style={s.avatarRing}>
                {profile.avatar ? (
                  <img
                    src={getUrl(profile.avatar)}
                    alt={profile.name}
                    style={s.avatar}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div style={s.avatarFallback}>
                    {profile.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              {subscribersCount > 100 && (
                <div style={s.verifiedBadge} title="Popular creator">
                  <Icon name="verified" size={22} color={THEME.accent} />
                </div>
              )}
            </div>

            <div style={s.profileInfo}>
              <div style={s.nameWrap}>
                <h1 style={s.profileName}>{profile.name}</h1>
              </div>
              <div style={s.profileHandle}>@{profile.username}</div>

              <div style={s.metaRow}>
                <div style={s.metaItem}>
                  <Icon name="calendar" size={13} color={THEME.textMuted} />
                  <span>Joined {formatJoinDate(profile.createdAt)}</span>
                </div>
              </div>

              <div style={s.actionBtns}>
                <button
                  onClick={handleSubscribe}
                  className={subscribed ? "unsubscribe-btn" : "subscribe-btn"}
                  style={{
                    ...s.subscribeBtn,
                    background: subscribed
                      ? THEME.menuHover
                      : `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                    color: subscribed ? THEME.textPrimary : "white",
                    border: subscribed
                      ? `1.5px solid ${THEME.cardBorder}`
                      : "none",
                    boxShadow: subscribed
                      ? "none"
                      : "0 4px 14px rgba(217,119,6,0.4)",
                  }}
                >
                  {subscribed ? (
                    <>
                      <Icon name="check" size={15} />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <Icon name="bellFilled" size={15} color="white" />
                      <span>Subscribe</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareProfile}
                  style={s.shareBtn}
                  className="share-btn"
                >
                  <Icon name="share" size={15} />
                  {!isSmallMobile && <span>Share</span>}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={s.statsCardsWrap}>
              <StatCard
                icon="users"
                iconBg={THEME.accentBg}
                iconColor={THEME.accent}
                value={formatCount(subscribersCount)}
                label="Subscribers"
              />
              <StatCard
                icon="video"
                iconBg="#fef3c7"
                iconColor={THEME.accentDark}
                value={formatCount(totalVideos)}
                label="Videos"
              />
              <StatCard
                icon="eye"
                iconBg="#dcfce7"
                iconColor="#059669"
                value={formatCount(totalViews)}
                label="Views"
              />
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={s.tabsWrap}>
          <div style={s.tabs}>
            <TabButton
              iconName="video"
              label="Videos"
              count={videos.length}
              isActive={activeTab === "videos"}
              onClick={() => setActiveTab("videos")}
              isMobile={isMobile}
            />
            <TabButton
              iconName="zap"
              label="Shorts"
              count={shorts.length}
              isActive={activeTab === "shorts"}
              onClick={() => setActiveTab("shorts")}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div style={s.contentWrap}>
          {activeTab === "videos" && (
            <ContentGrid
              items={videos}
              type="video"
              navigate={navigate}
              formatCount={formatCount}
              formatTimeAgo={formatTimeAgo}
              formatDuration={formatDuration}
              isMobile={isMobile}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              menuOptions={menuOptions}
            />
          )}

          {activeTab === "shorts" && (
            <ContentGrid
              items={shorts}
              type="short"
              navigate={navigate}
              formatCount={formatCount}
              formatTimeAgo={formatTimeAgo}
              formatDuration={formatDuration}
              isMobile={isMobile}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              menuOptions={menuOptions}
            />
          )}
        </div>
      </div>

      {/* ============ REPORT MODAL ============ */}
      {showReportModal && reportingVideo && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(28,28,30,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, backdropFilter: "blur(6px)", padding: 16,
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowReportModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: THEME.cardBg,
              border: `1px solid ${THEME.cardBorder}`,
              borderRadius: 16,
              padding: isMobile ? 22 : 28,
              width: "100%",
              maxWidth: 500,
              color: THEME.textPrimary,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(28,28,30,0.25)",
              animation: "modalPop 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: THEME.dangerBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid #fecaca`,
              }}>
                <Icon name="report" size={18} color={THEME.danger} />
              </div>
              <div>
                <h2 style={{
                  margin: 0, color: THEME.danger,
                  fontSize: isMobile ? 18 : 20, fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}>
                  Report Video
                </h2>
                <p style={{
                  color: THEME.textSecondary, fontSize: 12, margin: "2px 0 0",
                  fontWeight: 500,
                }}>
                  Help us keep the community safe
                </p>
              </div>
            </div>
            <p style={{
              color: THEME.textSecondary, fontSize: 13, marginBottom: 20,
              wordBreak: "break-word", fontWeight: 500,
              padding: "8px 12px", background: THEME.menuHover, borderRadius: 8,
            }}>
              Reporting: <b style={{ color: THEME.textPrimary }}>{reportingVideo.title}</b>
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: "block", color: THEME.textPrimary,
                fontSize: 13, marginBottom: 10, fontWeight: 700,
                letterSpacing: "-0.01em",
              }}>
                Why are you reporting this video?
              </label>
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
                <label
                  key={r.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: 10,
                    background: reportReason === r.id ? THEME.dangerBg : "transparent",
                    borderRadius: 8, cursor: "pointer", marginBottom: 4,
                    border: reportReason === r.id
                      ? `1px solid ${THEME.danger}`
                      : `1px solid ${THEME.cardBorder}`,
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={r.id}
                    checked={reportReason === r.id}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{ accentColor: THEME.danger }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{r.label}</span>
                </label>
              ))}
            </div>
            <textarea
              placeholder="Additional details (optional, max 500 chars)"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              maxLength={500}
              style={{
                width: "100%", padding: 12,
                background: THEME.bg,
                border: `1.5px solid ${THEME.cardBorder}`,
                color: THEME.textPrimary,
                borderRadius: 10, minHeight: 80,
                fontFamily: "inherit", fontSize: 14, resize: "vertical",
                boxSizing: "border-box", outline: "none",
                fontWeight: 500,
              }}
            />
            <div style={{
              display: "flex", gap: 10, marginTop: 20,
              flexDirection: isMobile ? "column-reverse" : "row",
            }}>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                  setReportDescription("");
                }}
                style={{
                  flex: 1, padding: 12,
                  background: "transparent",
                  color: THEME.textPrimary,
                  border: `1px solid ${THEME.cardBorder}`,
                  borderRadius: 10, cursor: "pointer",
                  fontWeight: 600, fontSize: 14,
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportReason}
                style={{
                  flex: 1, padding: 12,
                  background: !reportReason
                    ? THEME.cardBorder
                    : "linear-gradient(135deg, #ef4444, #b91c1c)",
                  color: "white", border: "none", borderRadius: 10,
                  cursor: !reportReason ? "not-allowed" : "pointer",
                  fontWeight: 700, opacity: !reportReason ? 0.6 : 1,
                  fontFamily: "inherit",
                  boxShadow: !reportReason ? "none" : "0 4px 14px rgba(239,68,68,0.35)",
                }}
              >
                🚩 Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ PLAYLIST MODAL ============ */}
      {showPlaylistModal && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(28,28,30,0.5)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 9999, backdropFilter: "blur(6px)",
            padding: isMobile ? 0 : 16,
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowPlaylistModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: THEME.cardBg,
              borderRadius: isMobile ? "16px 16px 0 0" : 16,
              width: "100%",
              maxWidth: 420,
              maxHeight: isMobile ? "85vh" : "80vh",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(28,28,30,0.3)",
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${THEME.cardBorder}`,
            }}
          >
            <div style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${THEME.cardBorder}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${THEME.accentBgHover}`,
                }}>
                  <Icon name="playlist" size={16} color={THEME.accent} />
                </div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}>
                  Save to playlist
                </h3>
              </div>
              <button
                onClick={() => setShowPlaylistModal(false)}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: THEME.menuHover,
                  border: `1px solid ${THEME.cardBorder}`,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon name="close" size={16} color={THEME.textSecondary} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {loadingPlaylists ? (
                <div style={{ padding: 40, textAlign: "center", color: THEME.textSecondary, fontWeight: 500 }}>
                  Loading playlists...
                </div>
              ) : userPlaylists.length === 0 && !showNewPlaylistInput ? (
                <div style={{ padding: 40, textAlign: "center", color: THEME.textSecondary }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                  <p style={{ margin: 0, fontWeight: 600 }}>No playlists yet</p>
                  <p style={{ fontSize: 12, margin: "4px 0 0 0" }}>Create one below</p>
                </div>
              ) : (
                userPlaylists.map((playlist) => {
                  const isAdded = isVideoInPlaylist(playlist);
                  return (
                    <div
                      key={playlist._id}
                      onClick={() =>
                        isAdded
                          ? handleRemoveFromPlaylist(playlist._id)
                          : handleSaveToPlaylist(playlist._id)
                      }
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "12px 20px", cursor: "pointer",
                        background: isAdded ? THEME.accentBg : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 5,
                        border: isAdded ? `2px solid ${THEME.accent}` : "2px solid #d1d5db",
                        background: isAdded ? THEME.accent : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {isAdded && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 600,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {playlist.name}
                        </div>
                        <div style={{ fontSize: 12, color: THEME.textSecondary, marginTop: 2 }}>
                          {playlist.videos?.length || 0} videos
                          {playlist.isPublic ? " • Public" : " • Private"}
                        </div>
                      </div>
                      {isAdded && (
                        <span style={{
                          fontSize: 11, color: THEME.accentDark, fontWeight: 700,
                        }}>
                          ✓ Saved
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div style={{
              borderTop: `1px solid ${THEME.cardBorder}`,
              padding: "12px 20px",
              background: THEME.bg,
            }}>
              {showNewPlaylistInput ? (
                <div>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name"
                    autoFocus
                    style={{
                      width: "100%", padding: "10px 14px",
                      border: `1.5px solid ${THEME.cardBorder}`,
                      borderRadius: 10, fontSize: 14, outline: "none",
                      marginBottom: 10, boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPlaylistName.trim())
                        handleCreateAndSave();
                      if (e.key === "Escape") {
                        setShowNewPlaylistInput(false);
                        setNewPlaylistName("");
                      }
                    }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => {
                        setShowNewPlaylistInput(false);
                        setNewPlaylistName("");
                      }}
                      style={{
                        flex: 1, padding: 10, background: "transparent",
                        border: `1px solid ${THEME.cardBorder}`, borderRadius: 8,
                        cursor: "pointer", fontWeight: 600, fontSize: 13,
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateAndSave}
                      disabled={!newPlaylistName.trim() || creatingPlaylist}
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
                        boxShadow: !newPlaylistName.trim() || creatingPlaylist
                          ? "none"
                          : "0 3px 10px rgba(217,119,6,0.3)",
                      }}
                    >
                      {creatingPlaylist ? "Creating..." : "Create & Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewPlaylistInput(true)}
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
    </div>
  );
};

// ============ STAT CARD ============
const StatCard = ({ icon, iconBg, iconColor, value, label }) => (
  <div className="stat-card" style={{
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 14,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    transition: "all 0.2s",
    minWidth: 0,
    flex: 1,
    boxShadow: "0 1px 3px rgba(28,28,30,0.04)",
  }}>
    <div style={{
      width: 40,
      height: 40,
      borderRadius: 10,
      background: iconBg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      border: `1px solid ${iconColor}25`,
    }}>
      <Icon name={icon} size={18} color={iconColor} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: 18,
        fontWeight: 800,
        color: THEME.textPrimary,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11,
        color: THEME.textSecondary,
        fontWeight: 600,
        marginTop: 2,
        letterSpacing: 0.2,
      }}>
        {label}
      </div>
    </div>
  </div>
);

// ============ TAB BUTTON ============
const TabButton = ({ iconName, label, count, isActive, onClick, isMobile }) => (
  <button
    onClick={onClick}
    className="tab-btn"
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: isMobile ? "14px 20px" : "16px 26px",
      background: "transparent",
      border: "none",
      borderBottom: `3px solid ${isActive ? THEME.accent : "transparent"}`,
      color: isActive ? THEME.accentDark : THEME.textSecondary,
      fontSize: isMobile ? 13 : 14,
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.2s",
      fontFamily: "inherit",
      flexShrink: 0,
      position: "relative",
      letterSpacing: "-0.01em",
    }}
  >
    <Icon
      name={iconName}
      size={isMobile ? 15 : 16}
      color={isActive ? THEME.accentDark : THEME.textSecondary}
    />
    {label}
    <span
      style={{
        padding: "2px 9px",
        background: isActive
          ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`
          : THEME.menuHover,
        color: isActive ? "white" : THEME.textMuted,
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 800,
        transition: "all 0.2s",
      }}
    >
      {count}
    </span>
  </button>
);

// ============ VIDEO CARD MENU (PORTAL-BASED) ============
const VideoCardMenu = ({ item, isOpen, onToggle, onClose, menuOptions }) => {
  const triggerRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 220;
      const menuHeight = 380;
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
    const handleScrollResize = () => onClose();
    window.addEventListener("scroll", handleScrollResize, true);
    window.addEventListener("resize", handleScrollResize);
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const menuPortal =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <>
            <div
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={{
                position: "fixed", inset: 0, zIndex: 999998,
                background: "transparent",
              }}
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
              {menuOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={(e) => opt.action(item, e)}
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
                    color: opt.danger ? THEME.danger : THEME.textPrimary,
                    textAlign: "left",
                    transition: "background 0.12s",
                    fontFamily: "inherit",
                  }}
                >
                  <Icon
                    name={opt.iconName}
                    size={16}
                    color={opt.danger ? THEME.danger : THEME.textSecondary}
                  />
                  {opt.label}
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
          background: isOpen ? THEME.menuHover : "rgba(255,255,255,0.98)",
          border: `1px solid ${THEME.cardBorder}`,
          width: 32,
          height: 32,
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          boxShadow: "0 2px 6px rgba(28,28,30,0.15)",
          flexShrink: 0,
        }}
        aria-label="More options"
      >
        <Icon name="moreVertical" size={16} color={THEME.textPrimary} />
      </button>
      {menuPortal}
    </>
  );
};

// ============ CONTENT GRID ============
const ContentGrid = ({
  items, type, navigate,
  formatCount, formatTimeAgo, formatDuration,
  isMobile, openMenuId, setOpenMenuId, menuOptions,
}) => {
  if (items.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "60px 20px",
        background: THEME.cardBg,
        borderRadius: 14,
        border: `1px dashed ${THEME.cardBorder}`,
        boxShadow: "0 1px 3px rgba(28,28,30,0.04)",
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          border: `1px solid ${THEME.accentBgHover}`,
          boxShadow: "0 4px 16px rgba(217,119,6,0.15)",
        }}>
          <Icon
            name={type === "short" ? "zap" : "video"}
            size={32}
            color={THEME.accent}
          />
        </div>
        <h3 style={{
          margin: 0,
          color: THEME.textPrimary,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.01em",
        }}>
          No {type === "short" ? "shorts" : "videos"} yet
        </h3>
        <p style={{
          color: THEME.textSecondary,
          fontSize: 13,
          marginTop: 6,
          fontWeight: 500,
        }}>
          This user hasn't uploaded any {type === "short" ? "shorts" : "videos"} yet
        </p>
      </div>
    );
  }

  const gridCols =
    type === "short"
      ? isMobile
        ? "repeat(2, 1fr)"
        : "repeat(auto-fill, minmax(180px, 1fr))"
      : isMobile
      ? "1fr"
      : "repeat(auto-fill, minmax(280px, 1fr))";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: gridCols,
      gap: 14,
    }}>
      {items.map((item) => {
        const menuKey = `${type}-${item._id}`;
        return (
          <div
            key={item._id}
            onClick={() =>
              navigate(type === "short" ? "/shorts" : `/video/${item._id}`)
            }
            className="content-card"
            style={{
              background: THEME.cardBg,
              borderRadius: 14,
              overflow: "hidden",
              border: `1px solid ${THEME.cardBorder}`,
              cursor: "pointer",
              transition: "all 0.25s ease",
              position: "relative",
              boxShadow: "0 2px 6px rgba(28,28,30,0.05)",
            }}
          >
            <div style={{
              position: "relative",
              width: "100%",
              aspectRatio: type === "short" ? "9/16" : "16/9",
              background: "#000",
              overflow: "hidden",
            }}>
              {item.thumbnailUrl ? (
                <img
                  src={getUrl(item.thumbnailUrl)}
                  alt={item.title}
                  loading="lazy"
                  className="thumb-image"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                  }}
                  onError={(e) => { e.target.src = "https://picsum.photos/320/180"; }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(135deg, ${THEME.gradientStart}, ${THEME.gradientEnd})`,
                }}>
                  <Icon name="video" size={40} color="white" />
                </div>
              )}

              {/* Play overlay */}
              <div className="play-overlay" style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.25s",
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: 3,
                  boxShadow: "0 6px 20px rgba(217,119,6,0.5)",
                }}>
                  <Icon name="play" size={20} color="white" />
                </div>
              </div>

              {item.duration > 0 && (
                <span style={{
                  position: "absolute",
                  bottom: 6,
                  right: 6,
                  background: "rgba(0,0,0,0.85)",
                  color: "white",
                  padding: "3px 7px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  backdropFilter: "blur(4px)",
                  zIndex: 2,
                }}>
                  {formatDuration(item.duration)}
                </span>
              )}
              {type === "short" && (
                <div style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  background: `linear-gradient(135deg, ${THEME.danger}, ${THEME.warning})`,
                  color: "white",
                  padding: "3px 8px",
                  borderRadius: 5,
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  boxShadow: "0 2px 6px rgba(239,68,68,0.35)",
                  zIndex: 2,
                }}>
                  <Icon name="zap" size={9} color="white" />
                  SHORT
                </div>
              )}
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: THEME.textPrimary,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.4,
                    minHeight: 36,
                    letterSpacing: "-0.01em",
                  }}>
                    {item.title}
                  </h3>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 6,
                    fontSize: 11,
                    color: THEME.textMuted,
                    fontWeight: 600,
                  }}>
                    <Icon name="eye" size={11} color={THEME.accent} />
                    <span>{formatCount(item.views)}</span>
                    <span style={{ color: "#d4d0c8" }}>•</span>
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>

                <VideoCardMenu
                  item={item}
                  isOpen={openMenuId === menuKey}
                  onToggle={() =>
                    setOpenMenuId(openMenuId === menuKey ? null : menuKey)
                  }
                  onClose={() => setOpenMenuId(null)}
                  menuOptions={menuOptions}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============ STYLES ============
const styles = (isMobile) => ({
  page: {
    background: THEME.bgGradient,
    minHeight: "100vh",
    padding: isMobile ? "14px 12px 40px" : "24px 24px 48px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  container: { maxWidth: 1200, margin: "0 auto" },
  loadingWrap: {
    minHeight: "80vh",
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
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 16px",
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 12,
    color: THEME.textPrimary,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 18,
    fontFamily: "inherit",
    transition: "all 0.2s",
    boxShadow: "0 1px 3px rgba(28,28,30,0.04)",
  },

  // Profile Card
  profileCard: {
    background: THEME.cardBg,
    borderRadius: 20,
    border: `1px solid ${THEME.cardBorder}`,
    marginBottom: 20,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(28,28,30,0.06)",
  },
  coverWrap: {
    position: "relative",
    height: isMobile ? 120 : 180,
    overflow: "hidden",
  },
  coverGradient: {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(120deg, ${THEME.cover1} 0%, ${THEME.cover2} 50%, ${THEME.cover3} 100%)`,
  },
  coverPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
    opacity: 0.9,
  },
  coverGlow1: {
    position: "absolute",
    top: -50,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
    filter: "blur(30px)",
  },
  coverGlow2: {
    position: "absolute",
    bottom: -80,
    left: "30%",
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)",
    filter: "blur(40px)",
  },
  profileContent: {
    padding: isMobile ? "0 18px 22px" : "0 32px 28px",
    display: "flex",
    gap: isMobile ? 16 : 28,
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "center" : "flex-start",
    textAlign: isMobile ? "center" : "left",
    flexWrap: "wrap",
  },
  avatarWrap: {
    position: "relative",
    marginTop: isMobile ? -60 : -72,
    flexShrink: 0,
  },
  avatarRing: {
    padding: 4,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${THEME.cover2}, ${THEME.cover3})`,
    boxShadow: "0 8px 24px rgba(217,119,6,0.25)",
  },
  avatar: {
    width: isMobile ? 108 : 136,
    height: isMobile ? 108 : 136,
    borderRadius: "50%",
    objectFit: "cover",
    border: `4px solid ${THEME.cardBg}`,
    display: "block",
  },
  avatarFallback: {
    width: isMobile ? 108 : 136,
    height: isMobile ? 108 : 136,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${THEME.accentLight}, ${THEME.accentDarker})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: isMobile ? 44 : 56,
    fontWeight: 800,
    border: `4px solid ${THEME.cardBg}`,
    letterSpacing: "-0.02em",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    background: "white",
    borderRadius: "50%",
    padding: 2,
    boxShadow: "0 2px 8px rgba(28,28,30,0.15)",
    display: "flex",
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
    paddingTop: isMobile ? 8 : 24,
    width: isMobile ? "100%" : "auto",
  },
  nameWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: isMobile ? "center" : "flex-start",
    flexWrap: "wrap",
  },
  profileName: {
    margin: 0,
    fontSize: isMobile ? 24 : 30,
    fontWeight: 800,
    color: THEME.textPrimary,
    letterSpacing: "-0.03em",
    wordBreak: "break-word",
    lineHeight: 1.1,
  },
  profileHandle: {
    color: THEME.accent,
    fontSize: 14,
    marginTop: 6,
    fontWeight: 700,
    wordBreak: "break-all",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginTop: 12,
    flexWrap: "wrap",
    justifyContent: isMobile ? "center" : "flex-start",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12.5,
    color: THEME.textMuted,
    fontWeight: 600,
  },
  actionBtns: {
    display: "flex",
    gap: 10,
    marginTop: 18,
    flexWrap: "wrap",
    justifyContent: isMobile ? "center" : "flex-start",
  },
  subscribeBtn: {
    padding: "11px 24px",
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontFamily: "inherit",
    transition: "all 0.2s",
    letterSpacing: "-0.01em",
  },
  shareBtn: {
    padding: "11px 20px",
    background: THEME.cardBg,
    color: THEME.textPrimary,
    border: `1.5px solid ${THEME.cardBorder}`,
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  statsCardsWrap: {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",     // ✅ Equal 3 columns
  gap: 10,
  marginTop: isMobile ? 4 : 24,
  width: "100%",                              // ✅ Always full width
  maxWidth: isMobile ? "100%" : 460,          // ✅ Max width on desktop
},

  // Tabs
  tabsWrap: {
    background: THEME.cardBg,
    borderRadius: 14,
    border: `1px solid ${THEME.cardBorder}`,
    marginBottom: 20,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(28,28,30,0.04)",
  },
  tabs: {
    display: "flex",
    overflowX: "auto",
  },
  contentWrap: { minHeight: 200 },
});

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
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .profile-card, .content-card, .stat-card {
    animation: fadeInUp 0.4s ease both;
  }

  @media (hover: hover) {
    .back-btn:hover {
      border-color: #fbbf24 !important;
      color: #d97706 !important;
      background: #fef3c7 !important;
      transform: translateX(-2px);
      box-shadow: 0 4px 12px rgba(217,119,6,0.15);
    }
    .subscribe-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(217,119,6,0.5) !important;
    }
    .unsubscribe-btn:hover {
      background: #fef2f2 !important;
      color: #dc2626 !important;
      border-color: #fecaca !important;
    }
    .share-btn:hover {
      border-color: #fbbf24 !important;
      color: #d97706 !important;
      background: #fef3c7 !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(217,119,6,0.15);
    }
    .stat-card:hover {
      border-color: #fbbf24 !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(217,119,6,0.12);
    }
    .content-card:hover {
      transform: translateY(-4px);
      border-color: #fbbf24 !important;
      box-shadow: 0 12px 28px rgba(217,119,6,0.18);
    }
    .content-card:hover .thumb-image {
      transform: scale(1.06);
    }
    .content-card:hover .play-overlay {
      opacity: 1 !important;
    }
    .tab-btn:hover {
      color: #d97706 !important;
      background: #faf7f0;
    }
    .menu-trigger:hover {
      background: white !important;
      transform: scale(1.08);
      box-shadow: 0 4px 10px rgba(28,28,30,0.15) !important;
    }
    .menu-item:hover {
      background: #faf7f0 !important;
    }
  }

  button:active { transform: scale(0.97); }
  .tabs::-webkit-scrollbar { height: 0; display: none; }
`;

export default UserProfile;