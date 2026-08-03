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
    series: <><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></>,
    play: <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    moreVertical: <><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="5" r="1.5" fill="currentColor" /><circle cx="12" cy="19" r="1.5" fill="currentColor" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
    chevronLeft: <polyline points="15 18 9 12 15 6" />,
    chevronRight: <polyline points="9 18 15 12 9 6" />,
    check: <polyline points="20 6 9 17 4 12" />,
    plusCircle: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const MySeries = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSeries, setDeletingSeries] = useState(null);
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
  const getUrl = (u) =>
    !u
      ? "https://picsum.photos/320/180"
      : u.startsWith("http")
      ? u
      : `${BACKEND}${u}`;

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const { data } = await API.get("/series/my");
      setSeries(data.series || []);
    } catch (e) {
      toast.error("Failed to load series");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSeries) return;
    try {
      await API.delete(`/series/${deletingSeries._id}`);
      toast.success("Series deleted");
      setShowDeleteModal(false);
      setDeletingSeries(null);
      fetchSeries();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const openDeleteModal = (s) => {
    setDeletingSeries(s);
    setShowDeleteModal(true);
  };

  const handleWatch = (s) => {
    if (s.episodes?.length > 0) {
      navigate(`/video/${s.episodes[0].video._id}`);
    } else {
      toast("No episodes yet in this series", { icon: "ℹ️" });
    }
  };

  const handleEdit = (s) => {
    navigate(`/edit-series/${s._id}`);
  };

  const handleShare = async (s) => {
    const url = `${window.location.origin}/series/${s._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: s.title, url });
        toast.success("Shared!");
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("🔗 Link copied!");
    }
  };

  const handleCopyLink = (s) => {
    const url = `${window.location.origin}/series/${s._id}`;
    navigator.clipboard.writeText(url);
    toast.success("🔗 Link copied!");
  };

  const formatDate = (date) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatViews = (views) => {
    if (!views) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  const filteredSeries = series
    .filter((s) => {
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      return (
        (s.title || "").toLowerCase().includes(query) ||
        (s.description || "").toLowerCase().includes(query) ||
        (s.category || "").toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "episodes") return (b.episodes?.length || 0) - (a.episodes?.length || 0);
      if (sortBy === "views") return (b.totalViews || 0) - (a.totalViews || 0);
      return 0;
    });

  const cardWidth = isXSmall ? 240 : isMobile ? 270 : isTablet ? 290 : 310;

  const scrollHorizontal = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -600 : 600;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const wrapperPadding = isXSmall ? 12 : isMobile ? 14 : 20;

  // Total episodes count
  const totalEpisodes = series.reduce((sum, s) => sum + (s.episodes?.length || 0), 0);

  if (loading) {
    return (
      <div
        ref={wrapperRef}
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: THEME.bgGradient,
        }}
      >
        <div style={{ textAlign: "center", color: THEME.textSecondary }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: `3px solid ${THEME.cardBorder}`,
              borderTopColor: THEME.accent,
              borderRightColor: THEME.accent,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ fontWeight: 600 }}>Loading your series...</p>
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

      {/* ✅ HEADER */}
      <div style={{ padding: `0 ${wrapperPadding}px`, marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            flexDirection: isMobile ? "column" : "row",
            gap: 14,
            marginBottom: 16,
          }}
        >
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
              <Icon name="series" size={24} color={THEME.accent} />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: isMobile ? 22 : 26,
                  fontWeight: 800,
                  color: THEME.textPrimary,
                  letterSpacing: "-0.02em",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                My Series
                {series.length > 0 && (
                  <span
                    style={{
                      background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                      color: "white",
                      fontSize: 13,
                      padding: "3px 11px",
                      borderRadius: 20,
                      fontWeight: 800,
                      boxShadow: "0 2px 6px rgba(217,119,6,0.3)",
                    }}
                  >
                    {series.length}
                  </span>
                )}
              </h1>
              <p
                style={{
                  margin: "4px 0 0 0",
                  color: THEME.textSecondary,
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 500,
                }}
              >
                Group your videos into episodes and seasons
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/create-series")}
            className="btn-create-series"
            style={{
              padding: isMobile ? "11px 20px" : "12px 24px",
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
              transition: "all 0.2s",
              fontFamily: "inherit",
              width: isMobile ? "100%" : "auto",
              letterSpacing: "-0.01em",
            }}
          >
            <Icon name="plus" size={16} color="white" strokeWidth={2.5} />
            Create Series
          </button>
        </div>

        {/* Stats Row */}
        {series.length > 0 && (
          <div style={{
            display: "flex",
            gap: 10,
            marginBottom: 14,
            flexWrap: "wrap",
          }}>
            <div style={statPillStyle}>
              <Icon name="series" size={13} color={THEME.accent} />
              <span><strong>{series.length}</strong> {series.length === 1 ? 'Series' : 'Series'}</span>
            </div>
            <div style={statPillStyle}>
              <Icon name="video" size={13} color={THEME.accent} />
              <span><strong>{totalEpisodes}</strong> Total Episodes</span>
            </div>
            <div style={statPillStyle}>
              <Icon name="eye" size={13} color={THEME.accent} />
              <span><strong>{formatViews(series.reduce((sum, s) => sum + (s.totalViews || 0), 0))}</strong> Total Views</span>
            </div>
          </div>
        )}

        {/* Search & Sort Controls */}
        {series.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
              <div style={{
                position: "absolute",
                left: 14,
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
                placeholder="Search your series..."
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 40px",
                  background: THEME.cardBg,
                  border: `1px solid ${THEME.cardBorder}`,
                  borderRadius: 10,
                  fontSize: 14,
                  outline: "none",
                  color: THEME.textPrimary,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  fontWeight: 500,
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="clear-search-btn"
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: THEME.menuHover,
                    border: "none",
                    cursor: "pointer",
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    color: THEME.textSecondary,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    lineHeight: 1,
                    transition: "all 0.15s",
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
              <option value="episodes">Most episodes</option>
              <option value="views">Most views</option>
            </select>
          </div>
        )}
      </div>

      {/* ✅ EMPTY STATE */}
      {series.length === 0 ? (
        <div style={{ padding: `0 ${wrapperPadding}px` }}>
          <div
            style={{
              background: THEME.cardBg,
              borderRadius: 16,
              padding: isMobile ? "48px 24px" : "72px 40px",
              textAlign: "center",
              border: `1px dashed ${THEME.cardBorder}`,
              boxShadow: "0 2px 8px rgba(28,28,30,0.04)",
            }}
          >
            <div
              style={{
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
              }}
            >
              <Icon name="series" size={38} color={THEME.accent} />
            </div>
            <h2
              style={{
                margin: "0 0 8px 0",
                color: THEME.textPrimary,
                fontSize: isMobile ? 20 : 24,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              No series yet
            </h2>
            <p
              style={{
                color: THEME.textSecondary,
                fontSize: 14,
                margin: "0 auto 26px",
                maxWidth: 400,
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              Create your first series to group episodes together and build a cohesive viewing experience
            </p>
            <button
              onClick={() => navigate("/create-series")}
              className="btn-create-series"
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
                letterSpacing: "-0.01em",
                transition: "all 0.2s",
              }}
            >
              <Icon name="plus" size={16} color="white" strokeWidth={2.5} />
              Create First Series
            </button>
          </div>
        </div>
      ) : filteredSeries.length === 0 ? (
        <div style={{ padding: `0 ${wrapperPadding}px` }}>
          <div
            style={{
              background: THEME.cardBg,
              borderRadius: 16,
              padding: "48px 24px",
              textAlign: "center",
              border: `1px solid ${THEME.cardBorder}`,
            }}
          >
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
          {/* ✅ SECTION HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `0 ${wrapperPadding}px`,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2
                style={{
                  color: THEME.textPrimary,
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                All Series
              </h2>
              <span style={{ fontSize: 12, color: THEME.textSecondary, fontWeight: 600 }}>
                ({filteredSeries.length})
              </span>
            </div>

            {isDesktop && filteredSeries.length > 3 && (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="arrow-btn"
                  onClick={() => scrollHorizontal("left")}
                  style={arrowBtnStyle}
                  aria-label="Scroll left"
                >
                  <Icon name="chevronLeft" size={16} />
                </button>
                <button
                  className="arrow-btn"
                  onClick={() => scrollHorizontal("right")}
                  style={arrowBtnStyle}
                  aria-label="Scroll right"
                >
                  <Icon name="chevronRight" size={16} />
                </button>
              </div>
            )}
          </div>

          {/* ✅ HORIZONTAL SCROLL CONTAINER */}
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
            {filteredSeries.map((s) => (
              <SeriesCard
                key={s._id}
                series={s}
                getUrl={getUrl}
                cardWidth={cardWidth}
                isMobile={isMobile}
                isMenuOpen={openMenuId === s._id}
                onToggleMenu={() => setOpenMenuId(openMenuId === s._id ? null : s._id)}
                onCloseMenu={() => setOpenMenuId(null)}
                onWatch={() => handleWatch(s)}
                onEdit={() => handleEdit(s)}
                onShare={() => handleShare(s)}
                onCopyLink={() => handleCopyLink(s)}
                onDelete={() => openDeleteModal(s)}
                formatDate={formatDate}
                formatViews={formatViews}
              />
            ))}
          </div>
        </>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && deletingSeries && (
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
              maxWidth: 440,
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
              Delete Series?
            </h2>
            <p
              style={{
                color: THEME.textSecondary,
                fontSize: 14,
                margin: "0 0 12px 0",
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              Are you sure you want to delete{" "}
              <b style={{ color: THEME.textPrimary }}>"{deletingSeries.title}"</b>?
            </p>
            <p
              style={{
                color: THEME.textMuted,
                fontSize: 12,
                margin: "0 0 24px 0",
                background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${THEME.accentBgHover}`,
                fontWeight: 600,
              }}
            >
              💡 This won't delete the actual videos, just the series grouping.
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
                  transition: "all 0.15s",
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
                  transition: "all 0.15s",
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

/* ================== SERIES CARD ================== */
const SeriesCard = ({
  series,
  getUrl,
  cardWidth,
  isMobile,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onWatch,
  onEdit,
  onShare,
  onCopyLink,
  onDelete,
  formatDate,
  formatViews,
}) => {
  return (
    <div
      style={{
        position: "relative",
        flexShrink: 0,
        width: cardWidth,
        scrollSnapAlign: "start",
      }}
    >
      <div
        className="series-card"
        onClick={onWatch}
        style={{
          background: THEME.cardBg,
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${THEME.cardBorder}`,
          cursor: "pointer",
          transition: "all 0.25s ease",
          boxShadow: "0 2px 6px rgba(28,28,30,0.05)",
        }}
      >
        {/* Thumbnail */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            background: "#000",
            overflow: "hidden",
          }}
        >
          {series.episodes?.[0]?.video?.thumbnailUrl ? (
            <img
              src={getUrl(series.episodes[0].video.thumbnailUrl)}
              alt={series.title}
              loading="lazy"
              className="thumb-img"
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
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${THEME.gradientStart}, ${THEME.gradientEnd})`,
                color: "white",
              }}
            >
              <Icon name="series" size={48} color="white" strokeWidth={1.5} />
            </div>
          )}

          {/* Right side stack overlay */}
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "38%",
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
            <Icon name="video" size={20} color="#fbbf24" />
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: "#fbbf24" }}>
              {series.episodes?.length || 0}
            </div>
            <div style={{ fontSize: 10, opacity: 0.9, letterSpacing: 0.5, fontWeight: 700 }}>
              {(series.episodes?.length || 0) === 1 ? "EPISODE" : "EPISODES"}
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
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(217,119,6,0.5)",
                paddingLeft: 4,
              }}
            >
              <Icon name="play" size={22} color="white" />
            </div>
            <span style={{ color: "white", fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em" }}>
              Watch Series
            </span>
          </div>

          {/* Category badge */}
          {series.category && (
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                color: "white",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                boxShadow: "0 2px 6px rgba(217,119,6,0.4)",
                backdropFilter: "blur(4px)",
                zIndex: 3,
              }}
            >
              {series.category}
            </div>
          )}

          {/* 3-dot menu button */}
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 5,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CardMenu
              isOpen={isMenuOpen}
              onToggle={onToggleMenu}
              onClose={onCloseMenu}
              onWatch={onWatch}
              onEdit={onEdit}
              onShare={onShare}
              onCopyLink={onCopyLink}
              onDelete={onDelete}
              hasEpisodes={series.episodes?.length > 0}
            />
          </div>
        </div>

        {/* Info section */}
        <div style={{ padding: "12px 14px 14px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: THEME.textPrimary,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            {series.title}
          </h2>

          <p
            style={{
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
            }}
          >
            {series.description || "No description available"}
          </p>

          {/* Meta info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 11,
              color: THEME.textMuted,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="eye" size={11} color={THEME.accent} />
              {formatViews(series.totalViews || 0)}
            </span>
            <span style={{ color: "#d4d0c8" }}>•</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="calendar" size={11} color={THEME.accent} />
              {formatDate(series.createdAt)}
            </span>
          </div>

          {/* Quick action buttons */}
          <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onWatch}
              disabled={!series.episodes?.length}
              className="quick-btn-primary"
              style={{
                flex: 1,
                padding: "9px 12px",
                background: series.episodes?.length
                  ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`
                  : THEME.menuHover,
                color: series.episodes?.length ? "white" : THEME.textMuted,
                border: "none",
                borderRadius: 8,
                cursor: series.episodes?.length ? "pointer" : "not-allowed",
                fontWeight: 700,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontFamily: "inherit",
                boxShadow: series.episodes?.length ? "0 3px 8px rgba(217,119,6,0.3)" : "none",
                transition: "all 0.15s",
                letterSpacing: "-0.01em",
              }}
            >
              <Icon name="play" size={12} color={series.episodes?.length ? "white" : THEME.textMuted} />
              Watch
            </button>

            <button
              onClick={onEdit}
              className="quick-btn-icon"
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
              title="Edit"
            >
              <Icon name="edit" size={14} />
            </button>

            <button
              onClick={onDelete}
              className="quick-btn-icon quick-btn-danger"
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
  );
};

/* ================== CARD MENU (PORTAL) ================== */
const CardMenu = ({ isOpen, onToggle, onClose, onWatch, onEdit, onShare, onCopyLink, onDelete, hasEpisodes }) => {
  const triggerRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 240;
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
    { id: "watch", icon: "play", label: "Watch Series", action: onWatch, disabled: !hasEpisodes },
    { id: "edit", icon: "edit", label: "Edit Series", action: onEdit },
    { id: "share", icon: "share", label: "Share", action: onShare },
    { id: "copy", icon: "copy", label: "Copy link", action: onCopyLink },
    { id: "delete", icon: "trash", label: "Delete Series", action: onDelete, danger: true, divider: true },
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
                    if (item.disabled) return;
                    item.action();
                    onClose();
                  }}
                  disabled={item.disabled}
                  className="menu-item"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    background: "transparent",
                    border: "none",
                    cursor: item.disabled ? "not-allowed" : "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    color: item.disabled ? THEME.textMuted : item.danger ? THEME.danger : THEME.textPrimary,
                    textAlign: "left",
                    transition: "background 0.12s",
                    fontFamily: "inherit",
                    opacity: item.disabled ? 0.5 : 1,
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={15}
                    color={item.disabled ? THEME.textMuted : item.danger ? THEME.danger : THEME.textSecondary}
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

/* ================== STYLES ================== */
const statPillStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  background: THEME.cardBg,
  border: `1px solid ${THEME.cardBorder}`,
  borderRadius: 20,
  fontSize: 12,
  color: THEME.textSecondary,
  fontWeight: 600,
  boxShadow: "0 1px 3px rgba(28,28,30,0.04)",
};

const arrowBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: THEME.cardBg,
  border: `1px solid ${THEME.cardBorder}`,
  color: THEME.textSecondary,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  boxShadow: "0 1px 3px rgba(28,28,30,0.06)",
  transition: "all 0.15s",
  fontFamily: "inherit",
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

  .horizontal-scroll {
    scrollbar-width: thin;
    scrollbar-color: #d4d0c8 transparent;
  }
  .horizontal-scroll::-webkit-scrollbar { height: 10px; }
  .horizontal-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
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

  input:focus, select:focus {
    border-color: #d97706 !important;
    box-shadow: 0 0 0 3px rgba(217,119,6,0.12) !important;
  }

  @media (hover: hover) {
    .series-card:hover {
      transform: translateY(-4px);
      border-color: #fbbf24 !important;
      box-shadow: 0 12px 28px rgba(217,119,6,0.18) !important;
    }
    .series-card:hover .play-overlay {
      opacity: 1 !important;
    }
    .series-card:hover .thumb-img {
      transform: scale(1.05);
    }
    .menu-item:hover {
      background: #faf7f0 !important;
    }
    .arrow-btn:hover {
      background: #fef3c7 !important;
      border-color: #fbbf24 !important;
      color: #d97706 !important;
      transform: scale(1.05);
      box-shadow: 0 3px 10px rgba(217,119,6,0.2) !important;
    }
    .btn-create-series:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(217,119,6,0.45) !important;
    }
    .clear-search-btn:hover {
      background: #fef3c7 !important;
      color: #d97706 !important;
    }
    .menu-trigger:hover {
      background: white !important;
      transform: scale(1.05);
    }
    .quick-btn-icon:hover {
      background: #fef3c7 !important;
      border-color: #fbbf24 !important;
      color: #d97706 !important;
    }
    .quick-btn-danger:hover {
      background: #fef2f2 !important;
      border-color: #fecaca !important;
      color: #ef4444 !important;
    }
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
  button:active { transform: scale(0.98); }
`;

export default MySeries;