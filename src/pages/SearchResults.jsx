import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [allData, setAllData] = useState({ videos: [], series: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortRef = useRef(null);

  // ✅ NEW (Dynamic - uses your production backend)
const BACKEND = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") 
  : "http://localhost:5000";

const getUrl = (u) =>
  !u
    ? "https://picsum.photos/480/270"
    : u.startsWith("http")
    ? u
    : `${BACKEND}${u}`;
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [videosRes, seriesRes] = await Promise.all([
          API.get("/videos?limit=100").catch(() => ({ data: { videos: [] } })),
          API.get("/series").catch(() => ({ data: { series: [] } })),
        ]);
        setAllData({
          videos: videosRes.data.videos || [],
          series: seriesRes.data.series || [],
        });
      } catch (e) {
        toast.error("Search failed");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const searchQuery = query.toLowerCase().trim();

  const filteredVideos = allData.videos.filter((v) => {
    if (!searchQuery) return true;
    const title = (v.title || "").toLowerCase();
    const desc = (v.description || "").toLowerCase();
    const tags = (v.tags || []).join(" ").toLowerCase();
    const uploader = (v.uploader?.name || "").toLowerCase();
    return (
      title.includes(searchQuery) ||
      desc.includes(searchQuery) ||
      tags.includes(searchQuery) ||
      uploader.includes(searchQuery)
    );
  });

  const filteredSeries = allData.series.filter((s) => {
    if (!searchQuery) return true;
    const title = (s.title || "").toLowerCase();
    const desc = (s.description || "").toLowerCase();
    return title.includes(searchQuery) || desc.includes(searchQuery);
  });

  const channelsMap = new Map();
  filteredVideos.forEach((v) => {
    if (
      v.uploader?.name?.toLowerCase().includes(searchQuery) ||
      !searchQuery
    ) {
      if (v.uploader?._id) {
        channelsMap.set(v.uploader._id, {
          ...v.uploader,
          videoCount: (channelsMap.get(v.uploader._id)?.videoCount || 0) + 1,
        });
      }
    }
  });
  const filteredChannels = Array.from(channelsMap.values()).filter(Boolean);

  const sortVideos = (videos) => {
    const sorted = [...videos];
    if (sortBy === "views") {
      sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === "recent") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return sorted;
  };

  const sortedVideos = sortVideos(filteredVideos);
  const totalResults =
    filteredVideos.length + filteredSeries.length + filteredChannels.length;

  const formatViews = (v) => {
    if (!v) return "0";
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  const formatDuration = (s) => {
    if (!s) return "";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const timeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  const highlightMatch = (text, q) => {
    if (!q || !text) return text;
    try {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const parts = text.split(new RegExp(`(${escaped})`, "gi"));
      return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <span key={i} style={{ color: "#3ea6ff", fontWeight: 500 }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    } catch {
      return text;
    }
  };

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "recent", label: "Upload date (newest)" },
    { value: "oldest", label: "Upload date (oldest)" },
    { value: "views", label: "View count" },
  ];

  const filterOptions = [
    { id: "all", label: "All" },
    { id: "videos", label: "Videos" },
    { id: "series", label: "Series" },
    { id: "channels", label: "Channels" },
  ];

  const VideoSkeleton = () => (
    <div className="yt-video-card-skeleton">
      <div className="yt-thumb-skeleton">
        <div className="shimmer" />
      </div>
      <div className="yt-info-skeleton">
        <div className="skel-line" style={{ width: "80%", height: 16 }}>
          <div className="shimmer" />
        </div>
        <div className="skel-line" style={{ width: "40%", height: 12, marginTop: 8 }}>
          <div className="shimmer" />
        </div>
        <div
          className="skel-line"
          style={{ width: "35%", height: 12, marginTop: 16, borderRadius: 999 }}
        >
          <div className="shimmer" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="search-container">
      <style>{`
        * {
          box-sizing: border-box;
        }
        .search-container {
          padding: 16px 20px 40px;
          max-width: 1280px;
          margin: 0 auto;
          color: #fff;
          font-family: 'Roboto', Arial, sans-serif;
          min-height: 100vh;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: shimmer 1.5s infinite;
        }

        /* ============ FILTER BAR ============ */
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 16px;
          flex-wrap: wrap;
          position: sticky;
          top: 0;
          background: rgba(15,15,15,0.85);
          backdrop-filter: blur(12px);
          z-index: 10;
        }
        .filter-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          flex: 1;
        }
        .chip {
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          background: transparent;
          color: #f1f1f1;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
          white-space: nowrap;
          font-family: inherit;
        }
        .chip:hover {
          background: rgba(255,255,255,0.1);
        }
        .chip.active {
          background: #f1f1f1;
          color: #0f0f0f;
          border-color: transparent;
        }
        .chip-count {
          margin-left: 4px;
          opacity: 0.7;
          font-size: 11px;
        }

        .sort-wrapper {
          position: relative;
        }
        .sort-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          background: transparent;
          color: #f1f1f1;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .sort-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .sort-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: #282828;
          border-radius: 12px;
          padding: 8px 0;
          min-width: 220px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.6);
          z-index: 100;
          animation: fadeIn 0.15s ease;
        }
        .sort-option {
          padding: 10px 16px;
          cursor: pointer;
          font-size: 13px;
          transition: background 0.1s ease;
          color: #e5e5e5;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sort-option:hover {
          background: rgba(255,255,255,0.1);
        }
        .sort-option.active {
          color: #3ea6ff;
        }

        .results-count {
          padding: 0 0 12px 0;
          color: #aaa;
          font-size: 13px;
        }

        /* ============ VIDEO CARD (YouTube style) ============ */
        .video-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .yt-video-card {
          display: flex;
          gap: 16px;
          text-decoration: none;
          color: inherit;
          padding: 8px;
          border-radius: 12px;
          transition: background 0.15s ease;
          animation: fadeIn 0.3s ease;
        }
        .yt-video-card:hover {
          background: rgba(255,255,255,0.04);
        }
        .yt-video-card:hover .yt-thumb-img {
          transform: scale(1.03);
        }

        .yt-thumb-container {
          position: relative;
          width: 360px;
          min-width: 360px;
          aspect-ratio: 16/9;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          flex-shrink: 0;
        }
        .yt-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
          display: block;
        }
        .duration-badge {
          position: absolute;
          bottom: 6px;
          right: 6px;
          background: rgba(0,0,0,0.85);
          color: #fff;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Roboto', Arial, sans-serif;
        }

        .yt-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .yt-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }
        .yt-title {
          margin: 0;
          font-size: 18px;
          font-weight: 400;
          color: #f1f1f1;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-family: 'Roboto', Arial, sans-serif;
          letter-spacing: 0;
        }
        .menu-btn {
          background: transparent;
          border: none;
          color: #aaa;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          transition: background 0.15s ease;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .menu-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .yt-meta {
          margin: 4px 0 0;
          font-size: 12px;
          color: #aaa;
          line-height: 1.4;
        }

        .yt-channel {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
        }
        .channel-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a4a4a, #6a6a6a);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
        }
        .channel-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        .channel-name {
          font-size: 12px;
          color: #aaa;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .verified-icon {
          color: #aaa;
        }

        .yt-desc {
          margin: 8px 0 0;
          font-size: 12px;
          color: #aaa;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ============ CHANNEL CARD ============ */
        .channel-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 8px;
          border-radius: 12px;
          transition: background 0.15s ease;
          animation: fadeIn 0.3s ease;
          cursor: pointer;
        }
        .channel-card:hover {
          background: rgba(255,255,255,0.04);
        }
        .channel-avatar-lg {
          width: 136px;
          height: 136px;
          min-width: 136px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a4a4a, #6a6a6a);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          font-size: 48px;
          font-weight: 500;
          color: #fff;
        }
        .channel-avatar-lg img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        .channel-info {
          flex: 1;
          min-width: 0;
        }
        .channel-name-lg {
          margin: 0;
          font-size: 16px;
          font-weight: 400;
          color: #f1f1f1;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .channel-meta {
          margin: 4px 0 0;
          font-size: 12px;
          color: #aaa;
        }
        .view-channel-btn {
          padding: 8px 16px;
          background: rgba(255,255,255,0.1);
          color: #3ea6ff;
          border: none;
          border-radius: 18px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          transition: background 0.15s ease;
        }
        .view-channel-btn:hover {
          background: rgba(255,255,255,0.15);
        }

        /* ============ SERIES CARD ============ */
        .series-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        .series-card {
          text-decoration: none;
          color: inherit;
          border-radius: 12px;
          overflow: hidden;
          animation: fadeIn 0.3s ease;
          transition: transform 0.2s ease;
        }
        .series-card:hover {
          transform: translateY(-2px);
        }
        .series-thumb {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
          background: #000;
          border-radius: 12px;
        }
        .series-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .series-card:hover .series-thumb img {
          transform: scale(1.05);
        }
        .series-badge {
          position: absolute;
          bottom: 6px;
          right: 6px;
          background: rgba(0,0,0,0.85);
          color: #fff;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .series-title {
          margin: 8px 4px 2px;
          font-size: 14px;
          font-weight: 500;
          color: #f1f1f1;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .series-creator {
          margin: 0 4px 8px;
          font-size: 12px;
          color: #aaa;
        }

        /* ============ SECTIONS ============ */
        .section-title {
          font-size: 16px;
          font-weight: 500;
          color: #f1f1f1;
          margin: 8px 0 12px;
          padding: 0 8px;
        }
        .section-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.1);
          margin: 20px 0;
        }

        /* ============ EMPTY STATE ============ */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
        }

        /* ============ SKELETON ============ */
        .yt-video-card-skeleton {
          display: flex;
          gap: 16px;
          padding: 8px;
        }
        .yt-thumb-skeleton {
          width: 360px;
          min-width: 360px;
          aspect-ratio: 16/9;
          border-radius: 12px;
          background: #1e1e1e;
          overflow: hidden;
          position: relative;
        }
        .yt-info-skeleton {
          flex: 1;
        }
        .skel-line {
          background: #1e1e1e;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        /* ============ MOBILE RESPONSIVE ============ */
        @media (max-width: 768px) {
          .search-container {
            padding: 12px 12px 40px;
          }
          .yt-video-card {
            flex-direction: column;
            gap: 10px;
            padding: 0 0 12px 0;
          }
          .yt-video-card:hover {
            background: transparent;
          }
          .yt-thumb-container,
          .yt-thumb-skeleton {
            width: 100%;
            min-width: 100%;
            border-radius: 0;
            margin: 0 -12px;
            width: calc(100% + 24px);
          }
          .yt-video-card-skeleton {
            flex-direction: column;
            gap: 10px;
            padding: 0 0 12px 0;
          }
          .yt-info {
            padding: 0 4px;
          }
          .yt-title {
            font-size: 15px;
            font-weight: 500;
            -webkit-line-clamp: 2;
          }
          .yt-channel {
            order: -1;
            margin-top: 8px;
            margin-bottom: 4px;
          }
          .yt-meta {
            font-size: 12px;
          }
          .yt-desc {
            display: none;
          }
          .channel-avatar-lg {
            width: 80px;
            height: 80px;
            min-width: 80px;
            font-size: 32px;
          }
          .channel-card {
            gap: 12px;
            padding: 12px 4px;
          }
          .view-channel-btn {
            display: none;
          }
          .series-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 8px;
          }
          .section-title {
            padding: 0 4px;
          }
          .filter-bar {
            padding: 8px 0 12px;
            margin-bottom: 8px;
          }
          .chip {
            padding: 6px 12px;
            font-size: 12px;
          }
          .sort-btn {
            padding: 6px 12px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .search-container {
            padding: 8px 0 40px;
          }
          .filter-bar {
            padding: 8px 12px 12px;
          }
          .results-count {
            padding: 0 12px 12px;
          }
          .yt-thumb-container,
          .yt-thumb-skeleton {
            border-radius: 0;
            margin: 0;
            width: 100%;
            min-width: 100%;
          }
          .yt-info {
            padding: 0 12px;
          }
          .yt-video-card {
            padding-bottom: 16px;
          }
          .channel-card {
            padding: 12px;
          }
          .series-grid {
            padding: 0 12px;
          }
          .section-title {
            padding: 0 12px;
          }
        }
      `}</style>

      {/* ============ FILTER BAR ============ */}
      <div className="filter-bar">
        <div className="filter-chips">
          {filterOptions.map((f) => {
            const count =
              f.id === "all"
                ? totalResults
                : f.id === "videos"
                ? filteredVideos.length
                : f.id === "series"
                ? filteredSeries.length
                : filteredChannels.length;
            return (
              <button
                key={f.id}
                className={`chip ${filter === f.id ? "active" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                {!loading && <span className="chip-count">{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="sort-wrapper" ref={sortRef}>
          <button
            className="sort-btn"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
            </svg>
            Sort
          </button>

          {showSortDropdown && (
            <div className="sort-dropdown">
              {sortOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`sort-option ${sortBy === opt.value ? "active" : ""}`}
                  onClick={() => {
                    setSortBy(opt.value);
                    setShowSortDropdown(false);
                  }}
                >
                  {sortBy === opt.value ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#3ea6ff">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : (
                    <span style={{ width: 16 }} />
                  )}
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============ RESULTS COUNT ============ */}
      {!loading && totalResults > 0 && query && (
        <div className="results-count">
          About {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
        </div>
      )}

      {/* ============ LOADING ============ */}
      {loading ? (
        <div className="video-list">
          {[...Array(6)].map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : totalResults === 0 ? (
        <div className="empty-state">
          <svg
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h2
            style={{
              color: "#f1f1f1",
              fontWeight: 400,
              margin: "20px 0 8px",
              fontSize: 20,
            }}
          >
            No results found
          </h2>
          <p style={{ color: "#717171", fontSize: 14, maxWidth: 380 }}>
            Try different keywords or remove search filters.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: 20,
              padding: "10px 22px",
              background: "rgba(255,255,255,0.1)",
              color: "#3ea6ff",
              border: "none",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Go to Home
          </button>
        </div>
      ) : (
        <>
          {/* ============ CHANNELS ============ */}
          {(filter === "all" || filter === "channels") &&
            filteredChannels.length > 0 && (
              <div>
                {(filter === "all"
                  ? filteredChannels.slice(0, 2)
                  : filteredChannels
                ).map((c) => (
                  <div key={c._id} className="channel-card">
                    <div className="channel-avatar-lg">
                      {c.profileImage ? (
                        <img src={getUrl(c.profileImage)} alt={c.name} />
                      ) : (
                        c.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="channel-info">
                      <h3 className="channel-name-lg">
                        {highlightMatch(c.name, query)}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="#aaa"
                        >
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </h3>
                      <p className="channel-meta">
                        {c.videoCount || 0} video
                        {(c.videoCount || 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button className="view-channel-btn">View</button>
                  </div>
                ))}
                {filter === "all" && <hr className="section-divider" />}
              </div>
            )}

          {/* ============ SERIES ============ */}
          {(filter === "all" || filter === "series") &&
            filteredSeries.length > 0 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h2 className="section-title">Series</h2>
                  {filter === "all" && filteredSeries.length > 4 && (
                    <button
                      onClick={() => setFilter("series")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#3ea6ff",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                        padding: "6px 12px",
                      }}
                    >
                      View all
                    </button>
                  )}
                </div>
                <div className="series-grid">
                  {(filter === "all"
                    ? filteredSeries.slice(0, 4)
                    : filteredSeries
                  ).map((s) => (
                    <Link
                      key={s._id}
                      to={
                        s.episodes?.[0]?.video?._id
                          ? `/video/${s.episodes[0].video._id}`
                          : "#"
                      }
                      className="series-card"
                    >
                      <div className="series-thumb">
                        <img
                          src={getUrl(
                            s.thumbnail || s.episodes?.[0]?.video?.thumbnailUrl
                          )}
                          alt={s.title}
                        />
                        <div className="series-badge">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                          </svg>
                          {s.episodes?.length || 0} EP
                        </div>
                      </div>
                      <h3 className="series-title">
                        {highlightMatch(s.title, query)}
                      </h3>
                      <p className="series-creator">
                        {s.creator?.name || "Unknown"}
                      </p>
                    </Link>
                  ))}
                </div>
                {filter === "all" && <hr className="section-divider" />}
              </div>
            )}

          {/* ============ VIDEOS ============ */}
          {(filter === "all" || filter === "videos") &&
            sortedVideos.length > 0 && (
              <div>
                {filter !== "all" && <h2 className="section-title">Videos</h2>}
                <div className="video-list">
                  {sortedVideos.map((v) => (
                    <Link
                      key={v._id}
                      to={`/video/${v._id}`}
                      className="yt-video-card"
                    >
                      <div className="yt-thumb-container">
                        <img
                          src={getUrl(v.thumbnailUrl)}
                          alt={v.title}
                          className="yt-thumb-img"
                        />
                        {v.duration > 0 && (
                          <div className="duration-badge">
                            {formatDuration(v.duration)}
                          </div>
                        )}
                      </div>

                      <div className="yt-info">
                        <div className="yt-title-row">
                          <h3 className="yt-title">
                            {highlightMatch(v.title, query)}
                          </h3>
                          <button
                            className="menu-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            aria-label="More options"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>
                        </div>

                        <p className="yt-meta">
                          {formatViews(v.views)} views • {timeAgo(v.createdAt)}
                        </p>

                        <div className="yt-channel">
                          <div className="channel-avatar">
                            {v.uploader?.profileImage ? (
                              <img
                                src={getUrl(v.uploader.profileImage)}
                                alt={v.uploader.name}
                              />
                            ) : (
                              v.uploader?.name?.charAt(0).toUpperCase() || "?"
                            )}
                          </div>
                          <span className="channel-name">
                            {v.uploader?.name || "Unknown"}
                            <svg
                              className="verified-icon"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          </span>
                        </div>

                        {v.description && (
                          <p className="yt-desc">
                            {highlightMatch(
                              v.description.substring(0, 140) +
                                (v.description.length > 140 ? "..." : ""),
                              query
                            )}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default SearchResults;