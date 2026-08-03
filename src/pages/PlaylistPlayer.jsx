import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../App";
import toast from "react-hot-toast";
import CustomVideoPlayer from "../components/CustomVideoPlayer";

const THEME = {
  bg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  cardHoverBorder: "#6366f1",
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

const BACKEND = "http://localhost:5000";
const buildUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${BACKEND}${url}`;
};

// SVG Icons
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    play: <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />,
    prev: <><polygon points="19 20 9 12 19 4 19 20" fill="currentColor" /><line x1="5" y1="19" x2="5" y2="5" /></>,
    next: <><polygon points="5 4 15 12 5 20 5 4" fill="currentColor" /><line x1="19" y1="5" x2="19" y2="19" /></>,
    shuffle: <><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></>,
    loop: <><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    back: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 19" /></>,
    video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const PlaylistPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [shuffled, setShuffled] = useState(false);
  const [loopPlaylist, setLoopPlaylist] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

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
    loadPlaylist();
  }, [id]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && showSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, showSidebar]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/playlists/${id}`);
      setPlaylist(data);
      setCurrentIndex(0);
    } catch (e) {
      console.error("Load playlist failed:", e);
      toast.error("Failed to load playlist");
      navigate("/playlists");
    } finally {
      setLoading(false);
    }
  };

  const currentVideo = playlist?.videos?.[currentIndex] || null;

  const handleNext = () => {
    if (!playlist?.videos) return;
    if (currentIndex < playlist.videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (loopPlaylist) {
      setCurrentIndex(0);
      toast("Restarting playlist", { icon: "🔁" });
    } else {
      toast("Playlist finished!", { icon: "🎉" });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleShuffle = () => {
    if (!playlist?.videos) return;
    const randomIdx = Math.floor(Math.random() * playlist.videos.length);
    setCurrentIndex(randomIdx);
    setShuffled(!shuffled);
    toast(shuffled ? "Shuffle OFF" : "Shuffle ON");
  };

  const handleVideoEnded = () => {
    if (autoPlay) handleNext();
  };

  const handleRemoveFromPlaylist = async (videoId) => {
    if (!window.confirm("Remove this video from playlist?")) return;
    try {
      await API.delete(`/playlists/${id}/remove/${videoId}`);
      toast.success("Removed from playlist");
      loadPlaylist();
    } catch (e) {
      toast.error("Failed to remove");
    }
  };

  const handleSelectVideo = (index) => {
    setCurrentIndex(index);
    if (isMobile) setShowSidebar(false);
  };

  const formatDuration = (s) => {
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const formatViews = (v) => {
    if (!v) return "0";
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v;
  };

  const totalDuration = (playlist?.videos || []).reduce(
    (sum, v) => sum + (v.duration || 0), 0
  );

  const formatTotalTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} min`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{
          width: 40, height: 40,
          border: `3px solid ${THEME.cardBorder}`,
          borderTopColor: THEME.accent,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px",
        }} />
        <h2 style={{ color: THEME.textSecondary, fontSize: 16, fontWeight: 500 }}>
          Loading playlist...
        </h2>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!playlist || !playlist.videos?.length) {
    return (
      <div style={styles.emptyContainer}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: THEME.accentBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Icon name="list" size={36} color={THEME.accent} />
        </div>
        <h2 style={{ margin: "0 0 8px", color: THEME.textPrimary, fontSize: 22, fontWeight: 700 }}>
          Playlist is empty
        </h2>
        <p style={{ color: THEME.textSecondary, fontSize: 14, marginBottom: 24 }}>
          Add some videos to get started
        </p>
        <button onClick={() => navigate("/playlists")} style={styles.backBtn}>
          <Icon name="back" size={16} color="white" />
          Back to Playlists
        </button>
      </div>
    );
  }

  return (
    <div style={styles(isMobile).pageWrapper}>
      <style>{globalStyles}</style>

      {/* MOBILE: Playlist toggle bar */}
      {isMobile && !showSidebar && (
        <div style={styles(isMobile).mobilePlaylistBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: THEME.accentBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon name="list" size={18} color={THEME.accent} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: THEME.textPrimary,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {playlist.name}
              </div>
              <div style={{ fontSize: 11, color: THEME.textSecondary }}>
                {currentIndex + 1} / {playlist.videos.length}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSidebar(true)}
            style={{
              padding: "8px 14px",
              background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            <Icon name="list" size={14} color="white" />
            View All
          </button>
        </div>
      )}

      <div style={styles(isMobile).layout}>
        {/* ============ LEFT - Video Player ============ */}
        <div style={styles(isMobile).playerSection}>
          {currentVideo && (
            <>
              <div style={styles(isMobile).playerWrap}>
                <CustomVideoPlayer
                  src={buildUrl(currentVideo.videoUrl)}
                  poster={buildUrl(currentVideo.thumbnailUrl)}
                  title={currentVideo.title}
                  nextVideoId={
                    currentIndex < playlist.videos.length - 1
                      ? playlist.videos[currentIndex + 1]?._id
                      : null
                  }
                  nextVideoTitle={
                    currentIndex < playlist.videos.length - 1
                      ? playlist.videos[currentIndex + 1]?.title
                      : null
                  }
                  onEnded={handleVideoEnded}
                  autoPlay={currentIndex > 0}
                />
              </div>

              {/* Video Info Card */}
              <div style={styles(isMobile).videoInfoCard}>
                <h1 style={styles(isMobile).videoTitle}>
                  {currentVideo.title}
                </h1>

                <div style={styles(isMobile).videoMetaRow}>
                  <div style={styles(isMobile).channelInfo}>
                    <div style={styles(isMobile).channelAvatar}>
                      {(currentVideo.uploader?.name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={styles(isMobile).channelName}>
                        {currentVideo.uploader?.name || "Channel"}
                      </div>
                      <div style={styles(isMobile).videoMeta}>
                        <Icon name="eye" size={11} />
                        <span>{formatViews(currentVideo.views)} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Nav Buttons */}
                  <div style={styles(isMobile).navBtns}>
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex <= 0}
                      style={{
                        ...styles(isMobile).navBtn,
                        opacity: currentIndex <= 0 ? 0.4 : 1,
                        cursor: currentIndex <= 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      <Icon name="prev" size={14} />
                      {!isMobile && "Previous"}
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentIndex >= playlist.videos.length - 1 && !loopPlaylist}
                      style={{
                        ...styles(isMobile).navBtnNext,
                        opacity: (currentIndex >= playlist.videos.length - 1 && !loopPlaylist) ? 0.4 : 1,
                        cursor: (currentIndex >= playlist.videos.length - 1 && !loopPlaylist) ? "not-allowed" : "pointer",
                      }}
                    >
                      {!isMobile && "Next"}
                      <Icon name="next" size={14} color="white" />
                    </button>
                  </div>
                </div>

                {currentVideo.description && (
                  <div style={styles(isMobile).videoDescBox}>
                    <p style={styles(isMobile).videoDesc}>
                      {currentVideo.description.slice(0, 300)}
                      {currentVideo.description.length > 300 ? "..." : ""}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ============ RIGHT SIDEBAR ============ */}
        {/* Backdrop for mobile */}
        {isMobile && showSidebar && (
          <div
            style={styles(isMobile).backdrop}
            onClick={() => setShowSidebar(false)}
          />
        )}

        <div
          style={{
            ...styles(isMobile).sidebarContainer,
            ...(isMobile ? {
              transform: showSidebar ? "translateX(0)" : "translateX(100%)",
            } : {}),
          }}
        >
          {/* Sidebar Header */}
          <div style={styles(isMobile).sidebarHeader}>
            <div style={styles(isMobile).headerTop}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                <div style={styles(isMobile).headerIconBox}>
                  <Icon name="list" size={20} color="white" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={styles(isMobile).playlistLabel}>PLAYING FROM PLAYLIST</div>
                  <h3 style={styles(isMobile).playlistTitle}>{playlist.name}</h3>
                  <div style={styles(isMobile).playlistMeta}>
                    <Icon name="user" size={10} color="rgba(255,255,255,0.7)" />
                    <span>{playlist.user?.name || "You"}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span>{currentIndex + 1}/{playlist.videos.length}</span>
                    {totalDuration > 0 && (
                      <>
                        <span style={{ opacity: 0.5 }}>•</span>
                        <span>{formatTotalTime(totalDuration)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isMobile && (
                <button
                  onClick={() => setShowSidebar(false)}
                  style={styles(isMobile).closeBtn}
                >
                  <Icon name="close" size={18} color="white" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div style={styles(isMobile).progressBar}>
              <div
                style={{
                  ...styles(isMobile).progressFill,
                  width: `${((currentIndex + 1) / playlist.videos.length) * 100}%`,
                }}
              />
            </div>

            {/* Controls */}
            <div style={styles(isMobile).controls}>
              <div style={styles(isMobile).autoplayWrap}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                  Autoplay
                </span>
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  style={{
                    ...styles(isMobile).toggle,
                    background: autoPlay ? THEME.accent : "rgba(255,255,255,0.2)",
                  }}
                >
                  <div
                    style={{
                      ...styles(isMobile).toggleThumb,
                      transform: autoPlay ? "translateX(18px)" : "translateX(2px)",
                    }}
                  />
                </button>
              </div>

              <button
                onClick={handleShuffle}
                style={{
                  ...styles(isMobile).controlBtn,
                  background: shuffled ? THEME.accent : "rgba(255,255,255,0.1)",
                  color: "white",
                }}
                title="Shuffle"
              >
                <Icon name="shuffle" size={14} color="white" />
              </button>

              <button
                onClick={() => {
                  setLoopPlaylist(!loopPlaylist);
                  toast(loopPlaylist ? "Loop OFF" : "Loop ON");
                }}
                style={{
                  ...styles(isMobile).controlBtn,
                  background: loopPlaylist ? THEME.accent : "rgba(255,255,255,0.1)",
                  color: "white",
                }}
                title="Loop"
              >
                <Icon name="loop" size={14} color="white" />
              </button>
            </div>
          </div>

          {/* Video List */}
          <div style={styles(isMobile).episodesList} className="playlist-scroll">
            {playlist.videos.map((video, index) => {
              const isCurrent = index === currentIndex;
              const isWatched = index < currentIndex;

              return (
                <div
                  key={video._id}
                  onClick={() => handleSelectVideo(index)}
                  className={isCurrent ? "" : "playlist-item"}
                  style={{
                    ...styles(isMobile).episodeCard,
                    background: isCurrent ? THEME.accentBg : THEME.cardBg,
                    borderLeft: isCurrent ? `3px solid ${THEME.accent}` : "3px solid transparent",
                    cursor: isCurrent ? "default" : "pointer",
                  }}
                >
                  {/* Left: Number or Playing indicator */}
                  <div style={styles(isMobile).leftSection}>
                    {isCurrent ? (
                      <div style={styles(isMobile).playingBars}>
                        <div style={{ ...styles(isMobile).bar, animation: "soundBar 0.6s ease-in-out infinite" }} />
                        <div style={{ ...styles(isMobile).bar, animation: "soundBar 0.6s ease-in-out infinite 0.2s" }} />
                        <div style={{ ...styles(isMobile).bar, animation: "soundBar 0.6s ease-in-out infinite 0.4s" }} />
                      </div>
                    ) : isWatched ? (
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: THEME.success,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon name="check" size={12} color="white" strokeWidth={3} />
                      </div>
                    ) : (
                      <span style={styles(isMobile).episodeNum}>{index + 1}</span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div style={styles(isMobile).thumbWrap}>
                    <img
                      src={buildUrl(video.thumbnailUrl)}
                      alt={video.title}
                      loading="lazy"
                      style={{
                        ...styles(isMobile).thumb,
                        opacity: isWatched && !isCurrent ? 0.6 : 1,
                      }}
                      onError={(e) => { e.target.src = "https://picsum.photos/120/68"; }}
                    />
                    {video.duration > 0 && (
                      <span style={styles(isMobile).durationBadge}>
                        {formatDuration(video.duration)}
                      </span>
                    )}
                    {isCurrent && (
                      <div style={styles(isMobile).nowPlayingOverlay}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: THEME.accent,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        }}>
                          <Icon name="play" size={14} color="white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={styles(isMobile).info}>
                    <h4 style={{
                      ...styles(isMobile).episodeTitle,
                      fontWeight: isCurrent ? 700 : 600,
                      color: isCurrent ? THEME.accentDark : THEME.textPrimary,
                    }}>
                      {video.title}
                    </h4>
                    <div style={styles(isMobile).channelNameSmall}>
                      {video.uploader?.name || "Channel"}
                    </div>
                    {isCurrent && (
                      <div style={styles(isMobile).nowPlayingBadge}>
                        <div style={styles(isMobile).nowPlayingDot} />
                        NOW PLAYING
                      </div>
                    )}
                    {isWatched && (
                      <div style={styles(isMobile).watchedBadge}>
                        <Icon name="check" size={10} color={THEME.success} strokeWidth={3} />
                        <span>Watched</span>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromPlaylist(video._id);
                    }}
                    className="remove-btn"
                    style={styles(isMobile).removeBtn}
                    title="Remove from playlist"
                  >
                    <Icon name="trash" size={13} color={THEME.textMuted} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={styles(isMobile).footer}>
            <button
              onClick={handlePrevious}
              disabled={currentIndex <= 0}
              style={{
                ...styles(isMobile).footerBtn,
                opacity: currentIndex <= 0 ? 0.4 : 1,
                cursor: currentIndex <= 0 ? "not-allowed" : "pointer",
              }}
            >
              <Icon name="prev" size={14} />
              Prev
            </button>
            <div style={styles(isMobile).footerInfo}>
              {currentIndex + 1} / {playlist.videos.length}
            </div>
            <button
              onClick={handleNext}
              disabled={currentIndex >= playlist.videos.length - 1 && !loopPlaylist}
              style={{
                ...styles(isMobile).footerBtnNext,
                opacity: (currentIndex >= playlist.videos.length - 1 && !loopPlaylist) ? 0.4 : 1,
                cursor: (currentIndex >= playlist.videos.length - 1 && !loopPlaylist) ? "not-allowed" : "pointer",
              }}
            >
              Next
              <Icon name="next" size={14} color="white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ STYLES ============
const styles = (isMobile) => ({
  pageWrapper: {
    padding: isMobile ? "12px 10px" : 20,
    minHeight: "100vh",
    background: THEME.bg,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  loadingContainer: {
    padding: 80,
    textAlign: "center",
    color: THEME.textSecondary,
    background: THEME.bg,
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  emptyContainer: {
    padding: isMobile ? "60px 20px" : 80,
    textAlign: "center",
    color: THEME.textPrimary,
    background: THEME.bg,
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  backBtn: {
    padding: "12px 24px",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
    fontFamily: "inherit",
  },

  // Mobile playlist bar
  mobilePlaylistBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },

  layout: {
    maxWidth: 1500,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) 400px",
    gap: isMobile ? 12 : 20,
    alignItems: "start",
  },

  // Backdrop
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 998,
    animation: "fadeIn 0.2s ease",
  },

  // Player
  playerSection: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  playerWrap: {
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  videoInfoCard: {
    background: THEME.cardBg,
    borderRadius: 14,
    padding: isMobile ? 16 : 20,
    border: `1px solid ${THEME.cardBorder}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  videoTitle: {
    fontSize: isMobile ? 16 : 19,
    fontWeight: 700,
    color: THEME.textPrimary,
    margin: "0 0 14px 0",
    lineHeight: 1.35,
    letterSpacing: "-0.01em",
  },
  videoMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    paddingBottom: 14,
    borderBottom: `1px solid ${THEME.cardBorder}`,
    marginBottom: 14,
  },
  channelInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
    flex: 1,
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${THEME.gradientStart}, ${THEME.gradientEnd})`,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  },
  channelName: {
    fontWeight: 700,
    color: THEME.textPrimary,
    fontSize: 14,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  videoMeta: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
    fontWeight: 500,
  },
  navBtns: {
    display: "flex",
    gap: 8,
    flexShrink: 0,
  },
  navBtn: {
    padding: "8px 14px",
    background: THEME.menuHover,
    color: THEME.textPrimary,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  navBtnNext: {
    padding: "8px 14px",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "inherit",
    boxShadow: "0 2px 6px rgba(99,102,241,0.25)",
    transition: "all 0.15s",
  },
  videoDescBox: {
    background: THEME.menuHover,
    borderRadius: 10,
    padding: 14,
    border: `1px solid ${THEME.cardBorder}`,
  },
  videoDesc: {
    fontSize: 13,
    color: THEME.textPrimary,
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  // Sidebar
  sidebarContainer: {
    background: THEME.cardBg,
    borderRadius: isMobile ? 0 : 14,
    border: isMobile ? "none" : `1px solid ${THEME.cardBorder}`,
    boxShadow: isMobile ? "-8px 0 32px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    maxHeight: isMobile ? "100vh" : "calc(100vh - 100px)",
    position: isMobile ? "fixed" : "sticky",
    top: isMobile ? 0 : 80,
    right: isMobile ? 0 : "auto",
    width: isMobile ? "min(85vw, 380px)" : "auto",
    height: isMobile ? "100vh" : "auto",
    zIndex: isMobile ? 999 : "auto",
    transition: isMobile ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
  },
  sidebarHeader: {
    background: `linear-gradient(135deg, #1e293b, #334155)`,
    color: "white",
    padding: isMobile ? "16px" : "18px 20px",
    flexShrink: 0,
  },
  headerTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.15s",
  },
  playlistLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
  },
  playlistTitle: {
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
    marginBottom: 5,
    color: "white",
    letterSpacing: "-0.01em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  playlistMeta: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: 500,
    flexWrap: "wrap",
  },
  progressBar: {
    height: 4,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressFill: {
    height: "100%",
    background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.accentDark})`,
    borderRadius: 2,
    transition: "width 0.3s ease",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  autoplayWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginRight: "auto",
  },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.2s",
    padding: 0,
  },
  toggleThumb: {
    position: "absolute",
    top: 2,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "white",
    transition: "transform 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  },
  controlBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  },

  // Episodes
  episodesList: {
    flex: 1,
    overflowY: "auto",
    padding: 0,
  },
  episodeCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderBottom: `1px solid ${THEME.menuHover}`,
    transition: "all 0.15s",
    position: "relative",
  },
  leftSection: {
    width: 24,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  episodeNum: {
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: 600,
  },
  playingBars: {
    display: "flex",
    alignItems: "flex-end",
    gap: 2,
    height: 14,
  },
  bar: {
    width: 3,
    background: THEME.accent,
    borderRadius: 1,
  },
  thumbWrap: {
    position: "relative",
    width: 110,
    height: 62,
    borderRadius: 8,
    overflow: "hidden",
    flexShrink: 0,
    background: THEME.menuHover,
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    background: "rgba(0,0,0,0.85)",
    color: "white",
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: 4,
    backdropFilter: "blur(4px)",
  },
  nowPlayingOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    minWidth: 0,
    padding: "2px 0",
  },
  episodeTitle: {
    fontSize: 13,
    lineHeight: 1.35,
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    letterSpacing: "-0.01em",
    wordBreak: "break-word",
  },
  channelNameSmall: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 4,
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  nowPlayingBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "2px 8px",
    background: THEME.accent,
    color: "white",
    borderRadius: 5,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.5,
    marginTop: 5,
  },
  nowPlayingDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "white",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  watchedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 10,
    color: THEME.success,
    fontWeight: 600,
    marginTop: 4,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: isMobile ? 1 : 0,
    transition: "all 0.15s",
    flexShrink: 0,
  },

  // Footer
  footer: {
    padding: 12,
    borderTop: `1px solid ${THEME.cardBorder}`,
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: THEME.bg,
    flexShrink: 0,
  },
  footerBtn: {
    padding: "8px 14px",
    background: THEME.cardBg,
    color: THEME.textPrimary,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  footerBtnNext: {
    padding: "8px 14px",
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontFamily: "inherit",
    boxShadow: "0 2px 6px rgba(99,102,241,0.25)",
    transition: "all 0.15s",
  },
  footerInfo: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: 600,
  },
});

const globalStyles = `
  * { -webkit-tap-highlight-color: transparent; }
  html, body { overflow-x: hidden; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes soundBar {
    0%, 100% { height: 4px; }
    50% { height: 14px; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }

  .playlist-scroll::-webkit-scrollbar { width: 6px; }
  .playlist-scroll::-webkit-scrollbar-track { background: transparent; }
  .playlist-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  .playlist-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  @media (hover: hover) {
    .playlist-item:hover {
      background: #f1f5f9 !important;
    }
    .playlist-item:hover .remove-btn {
      opacity: 1 !important;
    }
    .remove-btn:hover {
      background: #fef2f2 !important;
    }
    .remove-btn:hover svg {
      stroke: #ef4444 !important;
    }
    button:not(:disabled):hover {
      opacity: 0.95;
    }
  }

  button:active { transform: scale(0.98); }
`;

export default PlaylistPlayer;