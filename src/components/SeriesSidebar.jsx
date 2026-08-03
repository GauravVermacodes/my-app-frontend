import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND = "http://localhost:5000";
const getUrl = (u) =>
  !u
    ? "https://picsum.photos/160/90"
    : u.startsWith("http")
    ? u
    : `${BACKEND}${u}`;

const SeriesSidebar = ({ series, currentVideoId }) => {
  const navigate = useNavigate();
  const [autoPlay, setAutoPlay] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  if (!series || !series.episodes) return null;

  const currentIndex = series.episodes.findIndex(
    (ep) => ep.video._id === currentVideoId
  );

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const formatViews = (v) => {
    if (!v) return "0 views";
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v;
  };

  const totalDuration = series.episodes.reduce(
    (sum, ep) => sum + (ep.video.duration || 0),
    0
  );

  const formatTotalTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      navigate(`/video/${series.episodes[currentIndex - 1].video._id}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < series.episodes.length - 1) {
      navigate(`/video/${series.episodes[currentIndex + 1].video._id}`);
    }
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * series.episodes.length);
    navigate(`/video/${series.episodes[randomIndex].video._id}`);
  };

  return (
    <div style={styles.container}>
      {/* ============ HEADER (YouTube-Style) ============ */}
      <div style={styles.header}>
        {/* Top: Playlist Info */}
        <div style={styles.headerTop}>
          <div style={styles.headerLeft}>
            <div style={styles.playlistIconWrap}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </div>
            <div style={styles.headerInfo}>
              <div style={styles.playlistLabel}>Playlist</div>
              <h3 style={styles.playlistTitle}>{series.title}</h3>
              <div style={styles.playlistMeta}>
                <span style={styles.channelName}>
                  {series.creator?.name || "WatchNest"}
                </span>
                <span style={styles.dot}>•</span>
                <span>
                  {currentIndex + 1}/{series.episodes.length}
                </span>
                {totalDuration > 0 && (
                  <>
                    <span style={styles.dot}>•</span>
                    <span>{formatTotalTime(totalDuration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={styles.collapseBtn}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        {!collapsed && (
          <div style={styles.progressWrap}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${
                    ((currentIndex + 1) / series.episodes.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Controls Row */}
        {!collapsed && (
          <div style={styles.controls}>
            {/* Autoplay Toggle */}
            <div style={styles.autoplayWrap}>
              <span style={styles.autoplayLabel}>Autoplay</span>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                style={{
                  ...styles.toggle,
                  background: autoPlay ? "#065fd4" : "#ccc",
                }}
              >
                <div
                  style={{
                    ...styles.toggleThumb,
                    transform: autoPlay ? "translateX(18px)" : "translateX(2px)",
                  }}
                />
              </button>
            </div>

            {/* Shuffle */}
            <button
              onClick={handleShuffle}
              style={styles.controlBtn}
              title="Shuffle"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>

            {/* Loop */}
            <button style={styles.controlBtn} title="Loop">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ============ EPISODES LIST ============ */}
      {!collapsed && (
        <div style={styles.episodesList} className="episodes-scroll">
          {series.episodes.map((ep, index) => {
            const isCurrent = index === currentIndex;
            const isWatched = index < currentIndex;
            const isNext = index === currentIndex + 1;

            return (
              <div
                key={ep.video._id}
                onClick={() => !isCurrent && navigate(`/video/${ep.video._id}`)}
                style={{
                  ...styles.episodeCard,
                  background: isCurrent ? "#f2f2f2" : "transparent",
                  cursor: isCurrent ? "default" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.background = "#f9f9f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {/* ✅ Left: Episode Number or Now Playing */}
                <div style={styles.leftSection}>
                  {isCurrent ? (
                    <div style={styles.nowPlayingIndicator}>
                      <div style={styles.playingBars}>
                        <div style={styles.bar1} />
                        <div style={styles.bar2} />
                        <div style={styles.bar3} />
                      </div>
                    </div>
                  ) : isWatched ? (
                    <div style={styles.watchedCheck}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#606060"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                  ) : (
                    <div style={styles.episodeNumber}>{index + 1}</div>
                  )}
                </div>

                {/* ✅ Middle: Thumbnail */}
                <div style={styles.thumbnailWrap}>
                  <img
                    src={getUrl(ep.video.thumbnailUrl)}
                    alt={ep.video.title}
                    style={{
                      ...styles.thumbnail,
                      opacity: isWatched && !isCurrent ? 0.6 : 1,
                    }}
                    onError={(e) => {
                      e.target.src = "https://picsum.photos/160/90";
                    }}
                  />

                  {/* Duration badge */}
                  {ep.video.duration > 0 && (
                    <div style={styles.duration}>
                      {formatDuration(ep.video.duration)}
                    </div>
                  )}

                  {/* Now playing overlay */}
                  {isCurrent && (
                    <div style={styles.nowPlayingOverlay}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}

                  {/* Watched overlay */}
                  {isWatched && !isCurrent && (
                    <div style={styles.watchedOverlay}>
                      <div style={styles.watchedProgressBar}>
                        <div style={styles.watchedProgressFill} />
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ Right: Info */}
                <div style={styles.info}>
                  <h4
                    style={{
                      ...styles.episodeTitle,
                      color: isCurrent ? "#1a1a1a" : "#0f0f0f",
                      fontWeight: isCurrent ? 600 : 500,
                    }}
                  >
                    {ep.video.title}
                  </h4>

                  <div style={styles.channelInfo}>
                    <span>{ep.video.uploader?.name || "Channel"}</span>
                    {isCurrent && (
                      <span style={styles.nowText}>Now playing</span>
                    )}
                    {isNext && !isCurrent && (
                      <span style={styles.nextText}>Up next</span>
                    )}
                  </div>

                  {ep.video.views !== undefined && (
                    <div style={styles.stats}>
                      {formatViews(ep.video.views)} views
                    </div>
                  )}
                </div>

                {/* ✅ 3-Dot Menu */}
                <button
                  style={styles.menuBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle menu actions
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ============ FOOTER (Navigation Controls) ============ */}
      {!collapsed && (
        <div style={styles.footer}>
          <button
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
            style={{
              ...styles.footerBtn,
              opacity: currentIndex <= 0 ? 0.4 : 1,
              cursor: currentIndex <= 0 ? "not-allowed" : "pointer",
            }}
            title="Previous video"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <div style={styles.episodeProgress}>
            <div style={styles.currentEpisode}>
              Episode {currentIndex + 1} of {series.episodes.length}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex >= series.episodes.length - 1}
            style={{
              ...styles.footerBtn,
              opacity: currentIndex >= series.episodes.length - 1 ? 0.4 : 1,
              cursor:
                currentIndex >= series.episodes.length - 1
                  ? "not-allowed"
                  : "pointer",
            }}
            title="Next video"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes soundBar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        .episodes-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .episodes-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .episodes-scroll::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
        .episodes-scroll::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
      `}</style>
    </div>
  );
};

// ============ STYLES ============
const styles = {
  container: {
    background: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    maxHeight: "calc(100vh - 100px)",
    position: "sticky",
    top: 76,
  },

  // ============ HEADER ============
  header: {
    background: "#0f0f0f",
    color: "white",
    padding: "16px 20px",
  },
  headerTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  headerLeft: {
    display: "flex",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  playlistIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  playlistLabel: {
    fontSize: 11,
    color: "#aaa",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "white",
    margin: 0,
    marginBottom: 4,
    lineHeight: 1.3,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  playlistMeta: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#aaa",
  },
  channelName: {
    fontWeight: 500,
  },
  dot: {
    color: "#666",
  },
  collapseBtn: {
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
    flexShrink: 0,
    transition: "background 0.15s",
  },

  // Progress
  progressWrap: {
    marginTop: 4,
    marginBottom: 12,
  },
  progressBar: {
    height: 3,
    background: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #ef4444, #f97316)",
    borderRadius: 2,
    transition: "width 0.3s ease",
  },

  // Controls
  controls: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  autoplayWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginRight: "auto",
  },
  autoplayLabel: {
    fontSize: 13,
    color: "white",
    fontWeight: 500,
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
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },

  // ============ EPISODES LIST ============
  episodesList: {
    flex: 1,
    overflowY: "auto",
    padding: 0,
    display: "flex",
    flexDirection: "column",
  },

  // Episode Card
  episodeCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "8px 12px",
    transition: "background 0.15s",
    borderBottom: "1px solid #f5f5f5",
    position: "relative",
  },
  leftSection: {
    width: 24,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
  },
  episodeNumber: {
    fontSize: 13,
    color: "#606060",
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
  },

  // Now Playing Animation
  nowPlayingIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  playingBars: {
    display: "flex",
    alignItems: "flex-end",
    gap: 2,
    height: 14,
  },
  bar1: {
    width: 3,
    background: "#065fd4",
    borderRadius: 1,
    animation: "soundBar 0.6s ease-in-out infinite",
    animationDelay: "0s",
  },
  bar2: {
    width: 3,
    background: "#065fd4",
    borderRadius: 1,
    animation: "soundBar 0.6s ease-in-out infinite",
    animationDelay: "0.2s",
  },
  bar3: {
    width: 3,
    background: "#065fd4",
    borderRadius: 1,
    animation: "soundBar 0.6s ease-in-out infinite",
    animationDelay: "0.4s",
  },

  // Watched Check
  watchedCheck: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Thumbnail
  thumbnailWrap: {
    position: "relative",
    width: 100,
    height: 60,
    borderRadius: 6,
    overflow: "hidden",
    flexShrink: 0,
    background: "#000",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "opacity 0.2s",
  },
  duration: {
    position: "absolute",
    bottom: 3,
    right: 3,
    background: "rgba(0,0,0,0.85)",
    color: "white",
    fontSize: 10,
    fontWeight: 600,
    padding: "1px 4px",
    borderRadius: 3,
    backdropFilter: "blur(4px)",
  },
  nowPlayingOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  },
  watchedOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    background: "rgba(0,0,0,0.5)",
  },
  watchedProgressBar: {
    height: "100%",
    width: "100%",
    background: "#ef4444",
  },
  watchedProgressFill: {
    height: "100%",
    width: "100%",
    background: "#ef4444",
  },

  // Info
  info: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    paddingTop: 2,
  },
  episodeTitle: {
    fontSize: 14,
    lineHeight: 1.3,
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    wordBreak: "break-word",
  },
  channelInfo: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#606060",
    marginTop: 4,
  },
  nowText: {
    color: "#065fd4",
    fontWeight: 600,
    fontSize: 11,
  },
  nextText: {
    color: "#f59e0b",
    fontWeight: 600,
    fontSize: 11,
  },
  stats: {
    fontSize: 11,
    color: "#909090",
    marginTop: 2,
  },

  // Menu button
  menuBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "transparent",
    border: "none",
    color: "#606060",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    opacity: 0,
    transition: "opacity 0.15s, background 0.15s",
  },

  // ============ FOOTER ============
  footer: {
    padding: 12,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#f9fafb",
  },
  footerBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "white",
    color: "#0f0f0f",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  episodeProgress: {
    flex: 1,
    textAlign: "center",
  },
  currentEpisode: {
    fontSize: 13,
    color: "#606060",
    fontWeight: 500,
  },
};

// Show menu button on hover
const hoverStyles = `
  .episode-card:hover .menu-btn {
    opacity: 1 !important;
    background: rgba(0,0,0,0.05) !important;
  }
`;

export default SeriesSidebar;