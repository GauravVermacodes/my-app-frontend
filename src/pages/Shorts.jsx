import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const BACKEND = "http://localhost:5000";
const getUrl = (u) => {
  if (!u) return "";
  return u.startsWith("http") ? u : `${BACKEND}${u}`;
};

// SVG Icons
const Icon = ({ name, size = 24, color = "currentColor", strokeWidth = 2, fill = "none" }) => {
  const icons = {
    heart: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></>,
    heartFill: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="none" />,
    thumbsDown: <><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" /></>,
    comment: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    share: <><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></>,
    more: <><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    play: <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />,
    pause: <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>,
    send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    queue: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    hide: <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>,
    flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
    verified: <><path d="M12 2l2.4 4.8L20 8l-4 4 1 6-5-2.5L7 18l1-6-4-4 5.6-1.2z" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    whatsapp: <><path d="M20.52 3.48A11.9 11.9 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM17.4 14.47c-.29-.15-1.75-.87-2.02-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.93 1.15-.17.2-.34.22-.63.07-.29-.14-1.24-.46-2.36-1.46-.87-.78-1.46-1.74-1.63-2.03-.17-.29-.02-.44.13-.59.14-.13.29-.34.44-.5.14-.17.19-.29.29-.48.1-.2.05-.36-.02-.5-.07-.15-.66-1.6-.91-2.19-.24-.57-.48-.5-.66-.51h-.56c-.2 0-.5.07-.77.36-.27.29-1.02.99-1.02 2.42s1.05 2.81 1.19 3c.14.2 2.05 3.13 4.97 4.39.69.3 1.24.48 1.66.61.7.22 1.34.19 1.85.12.56-.08 1.75-.72 2-1.41.24-.7.24-1.29.17-1.41-.07-.13-.26-.2-.55-.34z" fill="currentColor" stroke="none" /></>,
    twitter: <><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></>,
    facebook: <><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    warning: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    chevronUp: <><polyline points="18 15 12 9 6 15" /></>,
    chevronDown: <><polyline points="6 9 12 15 18 9" /></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const Shorts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shorts, setShorts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subscribedChannels, setSubscribedChannels] = useState({});

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showPlayIcon, setShowPlayIcon] = useState(null);

  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const menuRef = useRef(null);

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

  const currentShort = shorts[currentIndex];

  // Fetch shorts
  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const { data } = await API.get("/videos/shorts");
        setShorts(data.shorts || []);

        // Check subscription status for each unique uploader
        const uniqueUploaders = [
          ...new Set((data.shorts || []).map((s) => s.uploader?._id).filter(Boolean)),
        ];
        const subs = {};
        await Promise.all(
          uniqueUploaders.map(async (uploaderId) => {
            if (uploaderId === (user?._id || user?.id)) return;
            try {
              const res = await API.get(`/subscribe/status/${uploaderId}`);
              subs[uploaderId] = {
                subscribed: res.data.subscribed,
                count: res.data.subscribersCount || 0,
              };
            } catch (e) {}
          })
        );
        setSubscribedChannels(subs);
      } catch (e) {
        toast.error("Failed to load shorts");
      } finally {
        setLoading(false);
      }
    };
    fetchShorts();
  }, [user]);

  // Play current, pause others
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentIndex, shorts]);

  useEffect(() => {
    if (showComments && currentShort) loadComments();
  }, [currentIndex, showComments, currentShort]);

  const loadComments = async () => {
    if (!currentShort) return;
    try {
      const { data } = await API.get(`/comments/${currentShort._id}`);
      setComments(data || []);
    } catch (e) {
      console.log("Failed to load comments");
    }
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== currentIndex && newIndex < shorts.length) {
      setCurrentIndex(newIndex);
      setShowComments(false);
      setShowMoreMenu(false);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (showComments) return;
      if (e.key === "ArrowDown" && currentIndex < shorts.length - 1) {
        scrollToIndex(currentIndex + 1);
      } else if (e.key === "ArrowUp" && currentIndex > 0) {
        scrollToIndex(currentIndex - 1);
      } else if (e.key === " ") {
        e.preventDefault();
        handleTogglePlay(currentIndex);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, shorts.length, showComments]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToIndex = (index) => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: index * container.clientHeight,
        behavior: "smooth",
      });
    }
  };

  // ============ ACTIONS ============
  const handleLike = async (short) => {
    try {
      const { data } = await API.put(`/videos/${short._id}/like`);
      setShorts((prev) =>
        prev.map((s) =>
          s._id === short._id
            ? {
                ...s,
                likes: data.liked
                  ? [...(s.likes || []), user?._id]
                  : (s.likes || []).filter((id) => id !== user?._id),
              }
            : s
        )
      );
    } catch (e) {
      toast.error("Failed to like");
    }
  };

  // ✅ WORKING Subscribe Functionality
  const handleSubscribe = async (short) => {
    if (!short?.uploader?._id) return;
    if (short.uploader._id === (user?._id || user?.id)) {
      toast("You can't subscribe to yourself", { icon: "ℹ️" });
      return;
    }

    try {
      const { data } = await API.post(`/subscribe/${short.uploader._id}`);
      setSubscribedChannels((prev) => ({
        ...prev,
        [short.uploader._id]: {
          subscribed: data.subscribed,
          count: data.subscribersCount || 0,
        },
      }));
      toast.success(data.subscribed ? "Subscribed!" : "Unsubscribed");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const handleProfileClick = (uploader) => {
  if (!uploader?._id) {
    toast.error("Profile not available");
    return;
  }
  if (uploader._id === (user?._id || user?.id)) {
    navigate("/profile");  // Own profile
  } else {
    navigate(`/user/${uploader._id}`);  // ✅ NEW - Public profile
  }
};

  const handleShare = () => setShowShareModal(true);

  const shareToSocial = (platform) => {
    const url = `${window.location.origin}/video/${currentShort._id}`;
    const text = `Check out this short: ${currentShort.title}`;

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } else if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`);
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    } else if (platform === "email") {
      window.open(`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`);
    }
    setShowShareModal(false);
  };

  const handleTogglePlay = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play();
        setShowPlayIcon("play");
      } else {
        video.pause();
        setShowPlayIcon("pause");
      }
      setTimeout(() => setShowPlayIcon(null), 500);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentShort) return;
    setPostingComment(true);
    try {
      const { data } = await API.post(`/comments/${currentShort._id}`, {
        text: newComment,
      });
      setComments([data, ...comments]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (e) {
      if (e.response?.data?.blocked) toast.error("Comment blocked");
      else toast.error("Failed to post");
    } finally {
      setPostingComment(false);
    }
  };

  const menuActions = [
    { iconName: "save", label: "Save video", onClick: () => { toast.success("Saved to library"); setShowMoreMenu(false); } },
    {
      iconName: "download", label: "Download",
      onClick: async () => {
        try {
          const { data } = await API.post(`/downloads/${currentShort._id}`);
          window.open(getUrl(data.videoUrl), "_blank");
          toast.success(`Downloaded! ${data.remainingDownloads} left`);
        } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
        setShowMoreMenu(false);
      },
    },
    {
      iconName: "queue", label: "Add to queue",
      onClick: () => {
        const queue = JSON.parse(localStorage.getItem("videoQueue") || "[]");
        if (!queue.some((v) => v._id === currentShort._id)) {
          queue.push(currentShort);
          localStorage.setItem("videoQueue", JSON.stringify(queue));
          toast.success("Added to queue");
        } else toast("Already in queue!", { icon: "ℹ️" });
        setShowMoreMenu(false);
      },
    },
    {
      iconName: "link", label: "Copy link",
      onClick: () => {
        navigator.clipboard.writeText(`${window.location.origin}/video/${currentShort._id}`);
        toast.success("Link copied!");
        setShowMoreMenu(false);
      },
    },
    {
      iconName: "hide", label: "Not interested",
      onClick: () => {
        setShorts(shorts.filter((s) => s._id !== currentShort._id));
        toast.success("We'll show fewer like this");
        setShowMoreMenu(false);
      },
    },
    {
      iconName: "flag", label: "Report",
      onClick: () => { setReportModalOpen(true); setShowMoreMenu(false); },
      danger: true,
    },
  ];

  const handleSubmitReport = async () => {
    if (!reportReason) { toast.error("Please select a reason"); return; }
    try {
      await API.post(`/videos/${currentShort._id}/report`, { reason: reportReason }).catch(() => {});
      toast.success("Report submitted");
      setReportModalOpen(false);
      setReportReason("");
    } catch (e) { toast.error("Failed to report"); }
  };

  const formatTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "Just now";
  };

  const formatCount = (n) => {
    if (!n) return "0";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n;
  };

  if (loading) {
    return (
      <div style={styles(isMobile).loadingContainer}>
        <div style={styles(isMobile).spinner} />
        <h2 style={{ color: "white", marginTop: 16, fontWeight: 500 }}>Loading shorts...</h2>
        <style>{globalStyles}</style>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div style={styles(isMobile).loadingContainer}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
        }}>
          <Icon name="zap" size={36} color="#fbbf24" />
        </div>
        <h2 style={{ color: "white", margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>
          No shorts yet
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          Upload videos ≤ 60 seconds to see them here
        </p>
        <style>{globalStyles}</style>
      </div>
    );
  }

  const isSubscribed = currentShort?.uploader?._id
    ? subscribedChannels[currentShort.uploader._id]?.subscribed
    : false;

  const isOwnVideo = currentShort?.uploader?._id === (user?._id || user?.id);

  return (
    <>
      <style>{globalStyles}</style>

      {/* MAIN VIDEO SCROLL AREA */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          ...styles(isMobile).container,
          right: showComments && !isMobile ? 400 : 0,
          transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {shorts.map((short, index) => {
          const uploaderSub = subscribedChannels[short.uploader?._id];
          const shortIsSubscribed = uploaderSub?.subscribed;
          const isMyVideo = short.uploader?._id === (user?._id || user?.id);

          return (
            <div key={short._id} style={styles(isMobile).shortStyle}>
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={getUrl(short.videoUrl)}
                poster={getUrl(short.thumbnailUrl)}
                loop
                playsInline
                onClick={() => handleTogglePlay(index)}
                style={styles(isMobile).videoStyle}
              />

              {/* Play/Pause indicator */}
              {index === currentIndex && showPlayIcon && (
                <div style={styles(isMobile).playIndicator}>
                  <Icon name={showPlayIcon} size={48} color="white" fill="white" />
                </div>
              )}

              {/* Gradient overlay for readability */}
              <div style={styles(isMobile).gradientOverlay} />

              {/* Info overlay (bottom-left) */}
              <div style={styles(isMobile).infoOverlay}>
                {/* Channel Info Row */}
                <div style={styles(isMobile).channelRow}>
                  <div
                    style={styles(isMobile).avatarClickable}
                    onClick={() => handleProfileClick(short.uploader)}
                  >
                    {short.uploader?.avatar ? (
                      <img
                        src={getUrl(short.uploader.avatar)}
                        alt={short.uploader.name}
                        style={styles(isMobile).avatarImg}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div style={styles(isMobile).avatarFallback}>
                        {short.uploader?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  <div
                    style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                    onClick={() => handleProfileClick(short.uploader)}
                  >
                    <div style={styles(isMobile).channelName}>
                      @{short.uploader?.name || "channel"}
                    </div>
                    <div style={styles(isMobile).viewCount}>
                      {formatCount(short.views)} views
                    </div>
                  </div>

                  {/* ✅ Subscribe Button (only if not own video) */}
                  {!isMyVideo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubscribe(short);
                      }}
                      style={{
                        ...styles(isMobile).subscribeBtn,
                        background: shortIsSubscribed ? "rgba(255,255,255,0.2)" : "#ef4444",
                        color: "white",
                        border: shortIsSubscribed ? "1px solid rgba(255,255,255,0.3)" : "none",
                      }}
                    >
                      {shortIsSubscribed ? (
                        <>
                          <Icon name="bell" size={12} color="white" />
                          Subscribed
                        </>
                      ) : (
                        "Subscribe"
                      )}
                    </button>
                  )}
                </div>

                {/* Title */}
                <h3 style={styles(isMobile).videoTitle}>{short.title}</h3>

                {/* Description */}
                {short.description && (
                  <p style={styles(isMobile).videoDesc}>
                    {short.description.slice(0, isMobile ? 80 : 120)}
                    {short.description.length > (isMobile ? 80 : 120) ? "..." : ""}
                  </p>
                )}
              </div>

              {/* Action buttons (right side) */}
              <div style={styles(isMobile).actionsStyle}>
                <ActionButton
                  iconName={short.likes?.includes(user?._id) ? "heartFill" : "heart"}
                  count={short.likes?.length || 0}
                  onClick={() => handleLike(short)}
                  active={short.likes?.includes(user?._id)}
                  activeColor="#ef4444"
                  isMobile={isMobile}
                />

                <ActionButton
                  iconName="thumbsDown"
                  onClick={() => toast("Dislike registered")}
                  isMobile={isMobile}
                />

                <ActionButton
                  iconName="comment"
                  count={index === currentIndex ? comments.length : 0}
                  onClick={() => setShowComments(!showComments)}
                  active={showComments && index === currentIndex}
                  isMobile={isMobile}
                />

                <ActionButton
                  iconName="share"
                  label="Share"
                  onClick={handleShare}
                  isMobile={isMobile}
                />

                {/* More menu */}
                <div style={{ position: "relative" }} ref={menuRef}>
                  <ActionButton
                    iconName="more"
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    active={showMoreMenu && index === currentIndex}
                    isMobile={isMobile}
                  />

                  {showMoreMenu && index === currentIndex && (
                    <div style={styles(isMobile).moreMenu}>
                      {menuActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={action.onClick}
                          className="menu-item"
                          style={{
                            ...styles(isMobile).menuItem,
                            color: action.danger ? "#ef4444" : "white",
                          }}
                        >
                          <Icon name={action.iconName} size={16} color={action.danger ? "#ef4444" : "white"} />
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rotating disc avatar */}
                <div
                  style={styles(isMobile).discAvatar}
                  onClick={() => handleProfileClick(short.uploader)}
                >
                  {short.uploader?.avatar ? (
                    <img
                      src={getUrl(short.uploader.avatar)}
                      alt={short.uploader.name}
                      style={styles(isMobile).discImg}
                    />
                  ) : (
                    <div style={styles(isMobile).discFallback}>
                      {short.uploader?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
              </div>

              {/* Nav hint (first only) */}
              {index === 0 && shorts.length > 1 && (
                <div style={styles(isMobile).navHint}>
                  <Icon name="chevronUp" size={14} color="white" />
                  <span>Swipe up for next</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ✅ COMMENTS PANEL */}
      {showComments && currentShort && (
        <>
          {/* Backdrop on mobile */}
          {isMobile && (
            <div
              style={styles(isMobile).backdrop}
              onClick={() => setShowComments(false)}
            />
          )}

          <div style={styles(isMobile).commentsPanel}>
            {/* Header */}
            <div style={styles(isMobile).commentsHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: "white", fontWeight: 700 }}>
                  Comments
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                  {comments.length} {comments.length === 1 ? "comment" : "comments"}
                </p>
              </div>
              <button
                onClick={() => setShowComments(false)}
                style={styles(isMobile).closeCommentsBtn}
                className="close-btn"
              >
                <Icon name="close" size={18} color="white" />
              </button>
            </div>

            {/* Comment input */}
            <div style={styles(isMobile).commentInputContainer}>
              <div style={styles(isMobile).commentInputAvatar}>
                {user?.avatar ? (
                  <img src={getUrl(user.avatar)} alt={user.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                style={styles(isMobile).commentInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newComment.trim()) handleAddComment();
                }}
              />
              {newComment.trim() && (
                <button
                  onClick={handleAddComment}
                  disabled={postingComment}
                  style={styles(isMobile).postBtn}
                >
                  {postingComment ? "..." : <Icon name="send" size={14} color="white" />}
                </button>
              )}
            </div>

            {/* Comments list */}
            <div style={styles(isMobile).commentsList} className="comments-scroll">
              {comments.length === 0 ? (
                <div style={styles(isMobile).emptyComments}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 12px",
                  }}>
                    <Icon name="comment" size={24} color="#94a3b8" />
                  </div>
                  <p style={{ margin: 0, fontWeight: 600, color: "white" }}>No comments yet</p>
                  <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} style={styles(isMobile).commentItem}>
                    <div style={styles(isMobile).commentAvatar}>
                      {comment.user?.avatar ? (
                        <img src={getUrl(comment.user.avatar)} alt={comment.user.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        comment.user?.name?.charAt(0).toUpperCase() || "?"
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>
                          @{comment.user?.name || "User"}
                        </span>
                        <span style={{ fontSize: 11, color: "#71717a", fontWeight: 500 }}>
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "white", lineHeight: 1.4, wordBreak: "break-word" }}>
                        {comment.text}
                      </p>
                      <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
                        <button style={styles(isMobile).commentActionBtn} onClick={() => toast("Coming soon!")}>
                          <Icon name="heart" size={12} color="#94a3b8" />
                          {comment.likes?.length || 0}
                        </button>
                        <button style={styles(isMobile).commentActionBtn} onClick={() => toast("Reply coming soon!")}>
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* SHARE MODAL */}
      {showShareModal && (
        <div style={styles(isMobile).modalOverlay} onClick={() => setShowShareModal(false)}>
          <div style={styles(isMobile).modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles(isMobile).modalHeader}>
              <h2 style={styles(isMobile).modalTitle}>Share</h2>
              <button onClick={() => setShowShareModal(false)} style={styles(isMobile).modalCloseBtn}>
                <Icon name="close" size={16} color="white" />
              </button>
            </div>

            <div style={styles(isMobile).shareGrid}>
              <ShareOption iconName="whatsapp" label="WhatsApp" bg="#25d366" onClick={() => shareToSocial("whatsapp")} />
              <ShareOption iconName="twitter" label="Twitter" bg="#1da1f2" onClick={() => shareToSocial("twitter")} />
              <ShareOption iconName="facebook" label="Facebook" bg="#1877f2" onClick={() => shareToSocial("facebook")} />
              <ShareOption iconName="mail" label="Email" bg="#ea4335" onClick={() => shareToSocial("email")} />
            </div>

            <div style={styles(isMobile).copyLinkBox}>
              <input
                readOnly
                value={`${window.location.origin}/video/${currentShort._id}`}
                style={styles(isMobile).copyInput}
              />
              <button onClick={() => shareToSocial("copy")} style={styles(isMobile).copyBtn}>
                <Icon name="copy" size={12} color="white" />
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportModalOpen && (
        <div style={styles(isMobile).modalOverlay} onClick={() => setReportModalOpen(false)}>
          <div style={styles(isMobile).modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles(isMobile).modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(239,68,68,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="flag" size={18} color="#ef4444" />
                </div>
                <h2 style={{ ...styles(isMobile).modalTitle, color: "#ef4444" }}>Report Video</h2>
              </div>
              <button onClick={() => setReportModalOpen(false)} style={styles(isMobile).modalCloseBtn}>
                <Icon name="close" size={16} color="white" />
              </button>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>
              Why are you reporting this?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
              {[
                { id: "inappropriate", label: "Inappropriate content" },
                { id: "violent", label: "Violent or harmful" },
                { id: "spam", label: "Spam or misleading" },
                { id: "harassment", label: "Harassment or bullying" },
                { id: "hate_speech", label: "Hate speech" },
                { id: "misinformation", label: "False information" },
                { id: "copyright", label: "Copyright violation" },
              ].map((r) => (
                <label
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 12,
                    background: reportReason === r.id ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: reportReason === r.id ? "1px solid #ef4444" : "1px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.id}
                    checked={reportReason === r.id}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{ cursor: "pointer", accentColor: "#ef4444" }}
                  />
                  <span style={{ fontSize: 13, color: "white", fontWeight: 500 }}>{r.label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 20, flexDirection: isMobile ? "column-reverse" : "row" }}>
              <button
                onClick={() => { setReportModalOpen(false); setReportReason(""); }}
                style={styles(isMobile).cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportReason}
                style={{
                  ...styles(isMobile).submitReportBtn,
                  opacity: !reportReason ? 0.4 : 1,
                  cursor: !reportReason ? "not-allowed" : "pointer",
                }}
              >
                <Icon name="flag" size={14} color="white" />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============ COMPONENTS ============
const ActionButton = ({ iconName, count, label, onClick, active, activeColor, isMobile }) => (
  <button
    onClick={onClick}
    className="action-btn"
    style={{
      background: "transparent",
      border: "none",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      transition: "all 0.2s",
      color: "white",
    }}
  >
    <div style={{
      width: isMobile ? 46 : 50,
      height: isMobile ? 46 : 50,
      borderRadius: "50%",
      background: active ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(8px)",
      transition: "all 0.2s",
    }}>
      <Icon
        name={iconName}
        size={isMobile ? 22 : 24}
        color={active && activeColor ? activeColor : "white"}
      />
    </div>
    {count !== undefined && count > 0 && (
      <span style={{ fontSize: 11, color: "white", marginTop: 4, fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
        {formatCount(count)}
      </span>
    )}
    {label && (
      <span style={{ fontSize: 10, color: "white", marginTop: 4, fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
        {label}
      </span>
    )}
  </button>
);

const ShareOption = ({ iconName, label, bg, onClick }) => (
  <div
    onClick={onClick}
    className="share-option"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
      padding: 10,
      borderRadius: 10,
      transition: "background 0.15s",
    }}
  >
    <div style={{
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    }}>
      <Icon name={iconName} size={22} color="white" />
    </div>
    <span style={{ fontSize: 12, color: "white", fontWeight: 600 }}>{label}</span>
  </div>
);

const formatCount = (n) => {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n;
};

// ============ STYLES ============
const styles = (isMobile) => ({
  container: {
    position: "fixed",
    top: isMobile ? 56 : 60,
    left: isMobile ? 0 : 240,
    bottom: 0,
    overflowY: "scroll",
    scrollSnapType: "y mandatory",
    background: "#000",
    scrollBehavior: "smooth",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  shortStyle: {
    height: isMobile ? "calc(100vh - 56px)" : "calc(100vh - 60px)",
    width: "100%",
    scrollSnapAlign: "start",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
  },
  videoStyle: {
    height: "100%",
    maxWidth: isMobile ? "100%" : "460px",
    width: "auto",
    objectFit: "contain",
    cursor: "pointer",
  },
  gradientOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.3) 100%)",
    pointerEvents: "none",
    zIndex: 1,
  },
  playIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 5,
    animation: "fadeOut 0.5s ease-out forwards",
    backdropFilter: "blur(4px)",
  },
  infoOverlay: {
    position: "absolute",
    bottom: isMobile ? 20 : 30,
    left: isMobile ? 12 : 20,
    right: isMobile ? 80 : 90,
    color: "white",
    zIndex: 10,
  },
  channelRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  avatarClickable: {
    cursor: "pointer",
    flexShrink: 0,
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid white",
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    border: "2px solid white",
  },
  channelName: {
    fontWeight: 700,
    fontSize: 14,
    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  viewCount: {
    fontSize: 11,
    opacity: 0.9,
    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
    marginTop: 2,
    fontWeight: 500,
  },
  subscribeBtn: {
    padding: "7px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 5,
    transition: "all 0.15s",
    flexShrink: 0,
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  videoTitle: {
    margin: "0 0 6px 0",
    fontSize: isMobile ? 14 : 15,
    fontWeight: 600,
    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
  },
  videoDesc: {
    fontSize: 13,
    opacity: 0.95,
    margin: 0,
    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
    lineHeight: 1.4,
  },
  actionsStyle: {
    position: "absolute",
    right: isMobile ? 8 : 14,
    bottom: isMobile ? 20 : 30,
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 14 : 18,
    zIndex: 10,
    alignItems: "center",
  },
  discAvatar: {
    width: isMobile ? 42 : 46,
    height: isMobile ? 42 : 46,
    borderRadius: "50%",
    border: "2px solid white",
    overflow: "hidden",
    cursor: "pointer",
    marginTop: 4,
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
  },
  discImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  discFallback: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 700,
    fontSize: 16,
  },
  navHint: {
    position: "absolute",
    top: 16,
    left: "50%",
    transform: "translateX(-50%)",
    color: "white",
    fontSize: 11,
    fontWeight: 600,
    zIndex: 10,
    pointerEvents: "none",
    background: "rgba(0,0,0,0.6)",
    padding: "6px 14px",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    gap: 6,
    backdropFilter: "blur(8px)",
    animation: "bounce 2s ease-in-out infinite",
  },
  loadingContainer: {
    position: "fixed",
    top: isMobile ? 56 : 60,
    left: isMobile ? 0 : 240,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
    color: "white",
    textAlign: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  spinner: {
    width: 44,
    height: 44,
    border: "3px solid rgba(255,255,255,0.2)",
    borderTopColor: "#ef4444",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  // Comments Panel
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 498,
    animation: "fadeIn 0.2s ease",
  },
  commentsPanel: {
    position: "fixed",
    top: isMobile ? "auto" : 60,
    bottom: 0,
    right: 0,
    width: isMobile ? "100%" : 400,
    height: isMobile ? "80vh" : "auto",
    background: "#18181b",
    borderLeft: isMobile ? "none" : "1px solid #27272a",
    borderTop: isMobile ? "1px solid #27272a" : "none",
    borderRadius: isMobile ? "20px 20px 0 0" : "0",
    display: "flex",
    flexDirection: "column",
    zIndex: 500,
    animation: isMobile ? "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  commentsHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #27272a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeCommentsBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "white",
    cursor: "pointer",
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },
  commentInputContainer: {
    padding: "12px 16px",
    display: "flex",
    gap: 10,
    alignItems: "center",
    borderBottom: "1px solid #27272a",
  },
  commentInputAvatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #4338ca)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
    overflow: "hidden",
  },
  commentInput: {
    flex: 1,
    padding: "9px 14px",
    background: "#27272a",
    border: "1px solid #3f3f46",
    borderRadius: 20,
    color: "white",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    minWidth: 0,
  },
  postBtn: {
    padding: "9px 12px",
    background: "linear-gradient(135deg, #6366f1, #4338ca)",
    color: "white",
    border: "none",
    borderRadius: 20,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontFamily: "inherit",
    flexShrink: 0,
  },
  commentsList: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 16px",
  },
  emptyComments: {
    textAlign: "center",
    padding: 40,
    color: "#94a3b8",
  },
  commentItem: {
    display: "flex",
    gap: 10,
    marginBottom: 14,
    padding: 10,
    borderRadius: 10,
    transition: "background 0.15s",
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
    overflow: "hidden",
  },
  commentActionBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 11,
    padding: "4px 6px",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontFamily: "inherit",
    fontWeight: 500,
  },

  // More menu
  moreMenu: {
    position: "absolute",
    right: isMobile ? 55 : 65,
    top: -10,
    background: "rgba(24,24,27,0.98)",
    border: "1px solid #3f3f46",
    borderRadius: 12,
    minWidth: 200,
    padding: "6px 0",
    boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
    backdropFilter: "blur(16px)",
    zIndex: 100,
    animation: "fadeIn 0.15s ease",
  },
  menuItem: {
    width: "100%",
    padding: "10px 14px",
    background: "transparent",
    border: "none",
    color: "white",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 12,
    transition: "background 0.15s",
    fontFamily: "inherit",
    fontWeight: 500,
  },

  // Modals
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: isMobile ? "flex-end" : "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(6px)",
    padding: isMobile ? 0 : 16,
    animation: "fadeIn 0.2s ease",
  },
  modal: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: isMobile ? "20px 20px 0 0" : 14,
    padding: isMobile ? 20 : 24,
    width: "100%",
    maxWidth: 420,
    animation: isMobile ? "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "white",
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  shareGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    marginBottom: 20,
  },
  copyLinkBox: {
    display: "flex",
    gap: 8,
    padding: 10,
    background: "#0f0f14",
    borderRadius: 10,
    border: "1px solid #27272a",
  },
  copyInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: 12,
    outline: "none",
    fontFamily: "monospace",
    minWidth: 0,
  },
  copyBtn: {
    padding: "6px 14px",
    background: "linear-gradient(135deg, #6366f1, #4338ca)",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontFamily: "inherit",
    flexShrink: 0,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    background: "transparent",
    color: "white",
    border: "1px solid #3f3f46",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
    fontFamily: "inherit",
    fontSize: 14,
  },
  submitReportBtn: {
    flex: 1,
    padding: 12,
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontFamily: "inherit",
    fontSize: 14,
    boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
  },
});

const globalStyles = `
  * { -webkit-tap-highlight-color: transparent; }
  html, body { overflow-x: hidden; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); } }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes slideInFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(-4px); }
  }

  .comments-scroll::-webkit-scrollbar { width: 6px; }
  .comments-scroll::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 3px;
  }

  @media (hover: hover) {
    .action-btn:hover > div {
      background: rgba(255,255,255,0.35) !important;
      transform: scale(1.1);
    }
    .share-option:hover {
      background: rgba(255,255,255,0.1) !important;
      transform: scale(1.05);
    }
    .menu-item:hover {
      background: rgba(255,255,255,0.1) !important;
    }
    .close-btn:hover {
      background: rgba(255,255,255,0.2) !important;
    }
  }

  button:active { transform: scale(0.96); }
`;

export default Shorts;