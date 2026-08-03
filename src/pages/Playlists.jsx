import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

// ✅ UPDATED THEME - Warm off-white background with gold accents
const THEME = {
  bg: "#f4f2ee",                    // ← Warm off-white (matches Home)
  bgGradient: "linear-gradient(180deg, #f4f2ee 0%, #eeece7 100%)",
  cardBg: "#ffffff",
  cardBorder: "#e8e5df",            // ← Warm border
  cardHoverBorder: "#fbbf24",       // ← Gold hover
  textPrimary: "#1c1c1e",
  textSecondary: "#6e6e73",
  textMuted: "#8e8e93",
  accent: "#d97706",                // ← Gold accent (amber-600)
  accentLight: "#fbbf24",           // ← Light gold (amber-400)
  accentDark: "#b45309",            // ← Dark gold (amber-700)
  accentDarker: "#92400e",          // ← Deepest gold
  accentBg: "#fef3c7",              // ← Gold background tint
  accentBgHover: "#fde68a",         // ← Gold hover tint
  success: "#10b981",
  successBg: "#ecfdf5",
  warning: "#f59e0b",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  menuHover: "#faf7f0",             // ← Warm hover
  gradientStart: "#fbbf24",         // ← Gold gradient
  gradientEnd: "#d97706",           // ← Gold gradient
};

// SVG Icons
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    play: <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" />,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const Playlists = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const scrollRef = useRef(null);
  const wrapperRef = useRef(null);

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

  const isXSmall = containerWidth < 400;
  const isMobile = containerWidth < 720;
  const isTablet = containerWidth >= 720 && containerWidth < 1024;
  const isDesktop = containerWidth >= 1024;

  const BACKEND = "http://localhost:5000";
  const getUrl = (u) => {
    if (!u) return "https://picsum.photos/320/180";
    return u.startsWith("http") ? u : `${BACKEND}${u}`;
  };

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/playlists/my");
      setPlaylists(data.playlists || []);
    } catch (e) {
      console.error("Failed to load playlists:", e);
      toast.error("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    if (showCreate) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showCreate]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && showCreate) {
        setShowCreate(false);
        setName("");
        setDescription("");
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showCreate]);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Playlist name required");

    setCreating(true);
    try {
      await API.post("/playlists", { name, description });
      toast.success("Playlist created!");
      setShowCreate(false);
      setName("");
      setDescription("");
      await loadPlaylists();
    } catch (e) {
      console.error("Create failed:", e);
      toast.error(e.response?.data?.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, playlistName) => {
    if (!window.confirm(`Delete "${playlistName}"?`)) return;
    try {
      await API.delete(`/playlists/${id}`);
      setPlaylists(playlists.filter((p) => p._id !== id));
      toast.success("Playlist deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const handleShare = (id, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/playlist/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const handlePlayAll = (playlist, e) => {
    e?.stopPropagation();
    if (playlist.videos?.length > 0) {
      navigate(`/playlist/${playlist._id}`);
    } else {
      toast("No videos in this playlist", { icon: "ℹ️" });
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredPlaylists = playlists
    .filter((p) => {
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(query) ||
        (p.description || "").toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "videos") return (b.videos?.length || 0) - (a.videos?.length || 0);
      return 0;
    });

  const cardWidth = isXSmall ? 240 : isMobile ? 270 : isTablet ? 290 : 310;

  const scrollHorizontal = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -600 : 600;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const wrapperPadding = isXSmall ? 12 : isMobile ? 14 : 20;

  if (loading) {
    return (
      <div ref={wrapperRef} style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: THEME.bgGradient,
      }}>
        <div style={{ textAlign: "center", color: THEME.textSecondary }}>
          <div style={{
            width: 44,
            height: 44,
            border: `3px solid ${THEME.cardBorder}`,
            borderTopColor: THEME.accent,
            borderRightColor: THEME.accent,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ fontWeight: 600 }}>Loading playlists...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        background: THEME.bgGradient,
        minHeight: "100vh",
        padding: `${wrapperPadding}px 0`,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{globalStyles}</style>

      {/* HEADER */}
      <div style={{ padding: `0 ${wrapperPadding}px`, marginBottom: 20 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: 14,
          marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
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
            }}>
              <Icon name="list" size={24} color={THEME.accent} />
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? 22 : 26,
                fontWeight: 800,
                color: THEME.textPrimary,
                letterSpacing: "-0.02em",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                Playlists
                {playlists.length > 0 && (
                  <span style={{
                    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                    color: "white",
                    fontSize: 13,
                    padding: "3px 11px",
                    borderRadius: 20,
                    fontWeight: 800,
                    boxShadow: "0 2px 6px rgba(217,119,6,0.3)",
                  }}>
                    {playlists.length}
                  </span>
                )}
              </h1>
              <p style={{
                margin: "4px 0 0 0",
                color: THEME.textSecondary,
                fontSize: isMobile ? 12 : 14,
                fontWeight: 500,
              }}>
                Organize your favorite videos into collections
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="btn-new-playlist"
            style={{
              padding: isMobile ? "10px 18px" : "12px 22px",
              background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
              color: "white",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(217,119,6,0.35)",
              fontFamily: "inherit",
              width: isMobile ? "100%" : "auto",
              transition: "all 0.2s",
              letterSpacing: "-0.01em",
            }}
          >
            <Icon name="plus" size={16} color="white" strokeWidth={2.5} />
            New Playlist
          </button>
        </div>

        {/* Search & Sort */}
        {playlists.length > 0 && (
          <div style={{
            display: "flex",
            gap: 10,
            flexDirection: isMobile ? "column" : "row",
          }}>
            <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
              <div style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: THEME.textMuted,
                pointerEvents: "none",
              }}>
                <Icon name="search" size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search playlists..."
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 38px",
                  background: THEME.cardBg,
                  border: `1px solid ${THEME.cardBorder}`,
                  borderRadius: 10,
                  fontSize: 14,
                  outline: "none",
                  color: THEME.textPrimary,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: THEME.menuHover,
                    border: "none",
                    cursor: "pointer",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    color: THEME.textSecondary,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "10px 14px",
                background: THEME.cardBg,
                border: `1px solid ${THEME.cardBorder}`,
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 14,
                color: THEME.textPrimary,
                fontFamily: "inherit",
                outline: "none",
                minWidth: isMobile ? "100%" : 180,
                boxSizing: "border-box",
                fontWeight: 500,
              }}
            >
              <option value="recent">Recently created</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name (A–Z)</option>
              <option value="videos">Most videos</option>
            </select>
          </div>
        )}
      </div>

      {/* EMPTY STATE */}
      {playlists.length === 0 ? (
        <div style={{ padding: `0 ${wrapperPadding}px` }}>
          <div style={{
            background: THEME.cardBg,
            borderRadius: 16,
            padding: isMobile ? "48px 24px" : "72px 40px",
            textAlign: "center",
            border: `1px dashed ${THEME.cardBorder}`,
            boxShadow: "0 1px 3px rgba(28,28,30,0.04)",
          }}>
            <div style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 24px rgba(217,119,6,0.18)",
              border: `1px solid ${THEME.accentBgHover}`,
            }}>
              <Icon name="list" size={38} color={THEME.accent} />
            </div>
            <h2 style={{
              margin: "0 0 8px 0",
              color: THEME.textPrimary,
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}>
              No playlists yet
            </h2>
            <p style={{
              color: THEME.textSecondary,
              fontSize: 14,
              margin: "0 auto 26px",
              maxWidth: 400,
              lineHeight: 1.6,
              fontWeight: 500,
            }}>
              Create playlists to organize your favorite videos into curated collections
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-new-playlist"
              style={{
                padding: "13px 28px",
                background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                color: "white",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 6px 18px rgba(217,119,6,0.4)",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s",
                letterSpacing: "-0.01em",
              }}
            >
              <Icon name="plus" size={16} color="white" strokeWidth={2.5} />
              Create First Playlist
            </button>
          </div>
        </div>
      ) : filteredPlaylists.length === 0 ? (
        <div style={{ padding: `0 ${wrapperPadding}px` }}>
          <div style={{
            background: THEME.cardBg,
            borderRadius: 16,
            padding: "48px 24px",
            textAlign: "center",
            border: `1px solid ${THEME.cardBorder}`,
          }}>
            <h3 style={{ color: THEME.textPrimary, fontSize: 18, margin: "0 0 8px", fontWeight: 700 }}>
              No results found
            </h3>
            <p style={{ color: THEME.textSecondary, fontSize: 14, margin: "0 0 20px" }}>
              Try different search terms
            </p>
            <button
              onClick={() => setSearchTerm("")}
              style={{
                padding: "10px 24px",
                background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                color: "white",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                fontFamily: "inherit",
                boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
              }}
            >
              Clear search
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `0 ${wrapperPadding}px`,
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{
                color: THEME.textPrimary,
                fontSize: isMobile ? 16 : 18,
                fontWeight: 800,
                margin: 0,
                letterSpacing: "-0.01em",
              }}>
                All Playlists
              </h2>
              <span style={{ fontSize: 12, color: THEME.textSecondary, fontWeight: 600 }}>
                ({filteredPlaylists.length})
              </span>
            </div>

            {isDesktop && filteredPlaylists.length > 3 && (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="arrow-btn"
                  onClick={() => scrollHorizontal("left")}
                  style={arrowBtnStyle}
                >
                  ‹
                </button>
                <button
                  className="arrow-btn"
                  onClick={() => scrollHorizontal("right")}
                  style={arrowBtnStyle}
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {/* HORIZONTAL SCROLL */}
          <div
            ref={scrollRef}
            className="horizontal-scroll"
            style={{
              display: "flex",
              gap: isMobile ? 12 : 16,
              overflowX: "auto",
              overflowY: "hidden",
              paddingBottom: 12,
              paddingLeft: wrapperPadding,
              paddingRight: wrapperPadding,
              WebkitOverflowScrolling: "touch",
              scrollSnapType: isMobile ? "x mandatory" : "none",
              scrollBehavior: "smooth",
            }}
          >
            {filteredPlaylists.map((playlist) => (
              <div
                key={playlist._id}
                style={{
                  position: "relative",
                  flexShrink: 0,
                  width: cardWidth,
                  scrollSnapAlign: "start",
                }}
              >
                <div
                  className="playlist-card"
                  onClick={() => handlePlayAll(playlist)}
                  style={{
                    background: THEME.cardBg,
                    borderRadius: 14,
                    overflow: "hidden",
                    border: `1px solid ${THEME.cardBorder}`,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    boxShadow: "0 1px 3px rgba(28,28,30,0.05)",
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                    overflow: "hidden",
                    background: "#000",
                  }}>
                    {playlist.videos?.[0]?.thumbnailUrl ? (
                      <img
                        src={getUrl(playlist.videos[0].thumbnailUrl)}
                        alt={playlist.name}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.4s ease",
                          display: "block",
                        }}
                        onError={(e) => {
                          e.target.src = "https://picsum.photos/320/180";
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: `linear-gradient(135deg, ${THEME.gradientStart}, ${THEME.gradientEnd})`,
                        color: "white",
                      }}>
                        <Icon name="list" size={40} color="white" />
                        <span style={{ fontSize: 11, opacity: 0.9, fontWeight: 600 }}>
                          Empty playlist
                        </span>
                      </div>
                    )}

                    {/* Right side stack overlay */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "42%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.85))",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      color: "white",
                      backdropFilter: "blur(2px)",
                    }}>
                      <Icon name="list" size={18} color="#fbbf24" />
                      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: "#fbbf24" }}>
                        {playlist.videos?.length || 0}
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.9, letterSpacing: 0.5, fontWeight: 700 }}>
                        {(playlist.videos?.length || 0) === 1 ? "VIDEO" : "VIDEOS"}
                      </div>
                    </div>

                    {/* Play overlay */}
                    <div
                      className="play-overlay"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        opacity: 0,
                        transition: "opacity 0.25s",
                      }}
                    >
                      <div style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 20px rgba(217,119,6,0.5)",
                        paddingLeft: 4,
                      }}>
                        <Icon name="play" size={22} color="white" />
                      </div>
                      <span style={{ color: "white", fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em" }}>
                        Play all
                      </span>
                    </div>

                    {/* Public/Private badge */}
                    <div style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      background: playlist.isPublic
                        ? "linear-gradient(135deg, rgba(217,119,6,0.95), rgba(180,83,9,0.95))"
                        : "rgba(28,28,30,0.85)",
                      color: "white",
                      padding: "4px 9px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 0.4,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      backdropFilter: "blur(4px)",
                      boxShadow: playlist.isPublic
                        ? "0 2px 6px rgba(217,119,6,0.35)"
                        : "0 2px 6px rgba(0,0,0,0.2)",
                    }}>
                      <Icon name={playlist.isPublic ? "globe" : "lock"} size={10} color="white" />
                      {playlist.isPublic ? "PUBLIC" : "PRIVATE"}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "12px 14px 14px" }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      color: THEME.textPrimary,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      paddingRight: 4,
                      lineHeight: 1.3,
                      letterSpacing: "-0.01em",
                    }}>
                      {playlist.name}
                    </h3>

                    <p style={{
                      color: THEME.textSecondary,
                      fontSize: 12,
                      margin: "5px 0 10px 0",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "34px",
                      fontWeight: 500,
                    }}>
                      {playlist.description || "No description added"}
                    </p>

                    {/* Meta */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 11,
                      color: THEME.textMuted,
                      fontWeight: 600,
                      marginBottom: 12,
                    }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Icon name="video" size={11} color={THEME.accent} />
                        {playlist.videos?.length || 0}
                      </span>
                      {playlist.createdAt && (
                        <>
                          <span style={{ color: "#d4d0c8" }}>•</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name="calendar" size={11} color={THEME.accent} />
                            {formatDate(playlist.createdAt)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                    }}>
                      <button
                        onClick={(e) => handlePlayAll(playlist, e)}
                        style={{
                          flex: 1,
                          padding: "9px 12px",
                          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          fontFamily: "inherit",
                          boxShadow: "0 3px 8px rgba(217,119,6,0.3)",
                          transition: "all 0.15s",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        <Icon name="play" size={12} color="white" />
                        Play All
                      </button>

                      <button
                        onClick={(e) => handleShare(playlist._id, e)}
                        className="action-icon-btn"
                        style={{
                          width: 36,
                          height: 36,
                          background: THEME.menuHover,
                          border: `1px solid ${THEME.cardBorder}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: THEME.textSecondary,
                          transition: "all 0.15s",
                          flexShrink: 0,
                        }}
                        title="Share"
                      >
                        <Icon name="share" size={14} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(playlist._id, playlist.name);
                        }}
                        className="action-icon-btn action-delete-btn"
                        style={{
                          width: 36,
                          height: 36,
                          background: THEME.menuHover,
                          border: `1px solid ${THEME.cardBorder}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: THEME.danger,
                          transition: "all 0.15s",
                          flexShrink: 0,
                        }}
                        title="Delete"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(28,28,30,0.5)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(6px)",
            padding: isMobile ? 0 : 16,
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowCreate(false)}
        >
          <div
            style={{
              background: THEME.cardBg,
              borderRadius: isMobile ? "20px 20px 0 0" : 16,
              width: "100%",
              maxWidth: 500,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(28,28,30,0.25)",
              animation: isMobile ? "slideUp 0.3s ease" : "modalPop 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 22px",
              borderBottom: `1px solid ${THEME.cardBorder}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${THEME.accentBgHover}`,
                }}>
                  <Icon name="list" size={18} color={THEME.accent} />
                </div>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 800,
                    color: THEME.textPrimary,
                    letterSpacing: "-0.02em",
                  }}>
                    Create Playlist
                  </h2>
                  <p style={{
                    margin: "2px 0 0",
                    fontSize: 12,
                    color: THEME.textSecondary,
                    fontWeight: 500,
                  }}>
                    Organize your favorite videos
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setName("");
                  setDescription("");
                }}
                className="modal-close-btn"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: THEME.menuHover,
                  border: `1px solid ${THEME.cardBorder}`,
                  cursor: "pointer",
                  color: THEME.textSecondary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 22 }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 700,
                  color: THEME.textPrimary,
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}>
                  Playlist Name <span style={{ color: THEME.danger }}>*</span>
                </label>
                <input
                  placeholder="My awesome playlist"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && name.trim()) handleCreate();
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: THEME.bg,
                    border: `1.5px solid ${THEME.cardBorder}`,
                    borderRadius: 10,
                    fontSize: 14,
                    outline: "none",
                    color: THEME.textPrimary,
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                    fontWeight: 500,
                  }}
                />
                <div style={{
                  fontSize: 11,
                  color: THEME.textMuted,
                  marginTop: 5,
                  textAlign: "right",
                  fontWeight: 600,
                }}>
                  {name.length}/100
                </div>
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 700,
                  color: THEME.textPrimary,
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}>
                  Description
                </label>
                <textarea
                  placeholder="What's this playlist about? (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: THEME.bg,
                    border: `1.5px solid ${THEME.cardBorder}`,
                    borderRadius: 10,
                    fontSize: 14,
                    outline: "none",
                    color: THEME.textPrimary,
                    boxSizing: "border-box",
                    minHeight: 92,
                    resize: "vertical",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                    fontWeight: 500,
                  }}
                />
                <div style={{
                  fontSize: 11,
                  color: THEME.textMuted,
                  marginTop: 5,
                  textAlign: "right",
                  fontWeight: 600,
                }}>
                  {description.length}/500
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: "flex",
              gap: 10,
              padding: "14px 22px 22px",
              borderTop: `1px solid ${THEME.cardBorder}`,
              background: THEME.bg,
              flexDirection: isMobile ? "column-reverse" : "row",
            }}>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setName("");
                  setDescription("");
                }}
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
                  transition: "all 0.15s",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || creating}
                style={{
                  flex: 1,
                  padding: 12,
                  background: !name.trim() || creating
                    ? "#cbd5e1"
                    : `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: !name.trim() || creating ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: !name.trim() || creating
                    ? "none"
                    : "0 4px 14px rgba(217,119,6,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.15s",
                  letterSpacing: "-0.01em",
                }}
              >
                {creating ? (
                  <>
                    <div style={{
                      width: 14,
                      height: 14,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Icon name="check" size={15} color="white" strokeWidth={2.5} />
                    Create Playlist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const arrowBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: THEME.cardBg,
  border: `1px solid ${THEME.cardBorder}`,
  color: THEME.textPrimary,
  cursor: "pointer",
  fontSize: 22,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  lineHeight: 1,
  boxShadow: "0 1px 3px rgba(28,28,30,0.06)",
  transition: "all 0.15s",
  fontFamily: "inherit",
};

const globalStyles = `
  * { -webkit-tap-highlight-color: transparent; }
  html, body { overflow-x: hidden; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes modalPop {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .horizontal-scroll {
    scrollbar-width: thin;
    scrollbar-color: #d4d0c8 transparent;
  }
  .horizontal-scroll::-webkit-scrollbar { height: 10px; }
  .horizontal-scroll::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }
  .horizontal-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #fbbf24, #d97706);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  .horizontal-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(90deg, #d97706, #b45309);
    background-clip: padding-box;
  }

  @media (max-width: 720px) {
    .horizontal-scroll::-webkit-scrollbar { height: 0; display: none; }
  }

  input:focus, textarea:focus, select:focus {
    border-color: #d97706 !important;
    box-shadow: 0 0 0 3px rgba(217,119,6,0.12);
  }

  @media (hover: hover) {
    .playlist-card:hover {
      transform: translateY(-4px);
      border-color: #fbbf24 !important;
      box-shadow: 0 12px 28px rgba(217,119,6,0.18) !important;
    }
    .playlist-card:hover .play-overlay {
      opacity: 1 !important;
    }
    .playlist-card:hover img {
      transform: scale(1.05);
    }
    .action-icon-btn:hover {
      background: #fef3c7 !important;
      border-color: #fbbf24 !important;
      color: #d97706 !important;
    }
    .action-delete-btn:hover {
      background: #fef2f2 !important;
      border-color: #ef4444 !important;
      color: #ef4444 !important;
    }
    .arrow-btn:hover {
      background: #fef3c7 !important;
      border-color: #fbbf24 !important;
      color: #d97706 !important;
      transform: scale(1.05);
      box-shadow: 0 3px 10px rgba(217,119,6,0.2) !important;
    }
    .btn-new-playlist:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(217,119,6,0.45) !important;
    }
    .modal-close-btn:hover {
      background: #fef2f2 !important;
      color: #ef4444 !important;
      border-color: #fecaca !important;
    }
  }
  button:active { transform: scale(0.98); }
`;

export default Playlists;