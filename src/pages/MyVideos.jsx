import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../App";
import toast from "react-hot-toast";

const MyVideos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const BACKEND = "http://localhost:5000";
  const getUrl = (u) => {
    if (!u) return "https://picsum.photos/320/180";
    return u.startsWith("http") ? u : `${BACKEND}${u}`;
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/videos/my-videos");
      console.log("🎬 My videos:", data);
      setVideos(data.videos || []);
    } catch (e) {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    try {
      await API.delete(`/videos/${videoId}`);
      setVideos(videos.filter((v) => v._id !== videoId));
      setDeleteConfirm(null);
      toast.success("🗑️ Video deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const handleShare = (video) => {
    const url = `${window.location.origin}/video/${video._id}`;
    navigator.clipboard.writeText(url);
    toast.success("🔗 Link copied!");
  };

  // Helpers
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filter & Sort
  const filtered = videos
    .filter((v) => {
      const isShort = v.duration > 0 && v.duration <= 60;
      if (filter === "videos" && isShort) return false;
      if (filter === "shorts" && !isShort) return false;
      if (filter === "premium" && !v.isPremium) return false;

      if (searchTerm) {
        return v.title?.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "views") return (b.views || 0) - (a.views || 0);
      if (sortBy === "likes") return (b.likes?.length || 0) - (a.likes?.length || 0);
      if (sortBy === "name") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

  // Stats
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes?.length || 0), 0);
  const shortsCount = videos.filter((v) => v.duration > 0 && v.duration <= 60).length;
  const premiumCount = videos.filter((v) => v.isPremium).length;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
        <h2 style={{ color: "#6b7280" }}>Loading your videos...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🎬 My Videos</h1>
          <p style={styles.subtitle}>
            Manage all your uploaded content
          </p>
        </div>
        <button
          onClick={() => navigate("/upload")}
          style={styles.uploadBtn}
        >
          + Upload New Video
        </button>
      </div>

      {/* Stats Row */}
      {videos.length > 0 && (
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{videos.length}</div>
            <div style={styles.statLabel}>Total Videos</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{formatViews(totalViews)}</div>
            <div style={styles.statLabel}>Total Views</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{totalLikes}</div>
            <div style={styles.statLabel}>Total Likes</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{shortsCount}</div>
            <div style={styles.statLabel}>Shorts</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{premiumCount}</div>
            <div style={styles.statLabel}>Premium</div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      {videos.length > 0 && (
        <div style={styles.controls}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your videos..."
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} style={styles.clearBtn}>
                ✕
              </button>
            )}
          </div>

          <div style={styles.filterTabs}>
            {[
              { id: "all", label: `All (${videos.length})` },
              { id: "videos", label: `🎬 Videos (${videos.length - shortsCount})` },
              { id: "shorts", label: `⚡ Shorts (${shortsCount})` },
              { id: "premium", label: `👑 Premium (${premiumCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  ...styles.filterTab,
                  ...(filter === f.id ? styles.filterTabActive : {}),
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.sortSelect}
          >
            <option value="recent">🕐 Newest</option>
            <option value="oldest">📅 Oldest</option>
            <option value="views">👁 Most Views</option>
            <option value="likes">❤️ Most Likes</option>
            <option value="name">🔤 A-Z</option>
          </select>
        </div>
      )}

      {/* Empty State */}
      {videos.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🎬</div>
          <h2>No videos uploaded yet</h2>
          <p style={{ color: "#6b7280", marginBottom: 30 }}>
            Share your content with the world!
          </p>
          <button onClick={() => navigate("/upload")} style={styles.uploadBtn}>
            🎬 Upload Your First Video
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 60, marginBottom: 15 }}>🔍</div>
          <h3>No results found</h3>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
            }}
            style={styles.clearFiltersBtn}
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Videos List */
        <div style={styles.videosList}>
          {filtered.map((video) => {
            const isShort = video.duration > 0 && video.duration <= 60;

            return (
              <div key={video._id} style={styles.videoCard}>
                {/* Thumbnail */}
                <Link
                  to={`/video/${video._id}`}
                  style={styles.thumbLink}
                >
                  <div style={styles.thumbWrap}>
                    <img
                      src={getUrl(video.thumbnailUrl)}
                      alt={video.title}
                      style={styles.thumbImg}
                      onError={(e) => {
                        e.target.src = "https://picsum.photos/240/135";
                      }}
                    />
                    {video.duration > 0 && (
                      <span style={styles.durationBadge}>
                        {formatDuration(video.duration)}
                      </span>
                    )}
                    {isShort && <span style={styles.shortBadge}>⚡ SHORT</span>}
                    {video.isPremium && (
                      <span style={styles.premiumBadge}>👑 PREMIUM</span>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div style={styles.videoInfo}>
                  <Link
                    to={`/video/${video._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <h3 style={styles.videoTitle}>{video.title}</h3>
                  </Link>

                  {video.description && (
                    <p style={styles.videoDesc}>
                      {video.description.slice(0, 120)}
                      {video.description.length > 120 ? "..." : ""}
                    </p>
                  )}

                  <div style={styles.videoStats}>
                    <span>👁 {formatViews(video.views)} views</span>
                    <span>❤️ {video.likes?.length || 0} likes</span>
                    <span>📅 {formatDate(video.createdAt)}</span>
                    {video.fileSize > 0 && (
                      <span>💾 {formatBytes(video.fileSize)}</span>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div style={styles.badgeRow}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        background:
                          video.moderationStatus === "approved"
                            ? "#dcfce7"
                            : video.moderationStatus === "flagged"
                            ? "#fef3c7"
                            : "#fee2e2",
                        color:
                          video.moderationStatus === "approved"
                            ? "#166534"
                            : video.moderationStatus === "flagged"
                            ? "#854d0e"
                            : "#991b1b",
                      }}
                    >
                      {video.moderationStatus === "approved"
                        ? "✅ Published"
                        : video.moderationStatus === "flagged"
                        ? "⚠️ Flagged"
                        : "❌ Rejected"}
                    </span>

                    <span style={styles.categoryBadge}>
                      {video.category || "General"}
                    </span>

                    {video.allowedPlans && (
                      <span style={styles.planBadge}>
                        {video.allowedPlans.join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                  <button
                    onClick={() => navigate(`/video/${video._id}`)}
                    style={styles.actionBtn}
                    title="Watch"
                  >
                    ▶️
                  </button>
                  <button
                    onClick={() => handleShare(video)}
                    style={styles.actionBtn}
                    title="Share"
                  >
                    🔗
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(video._id)}
                    style={{ ...styles.actionBtn, color: "#ef4444" }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === video._id && (
                  <div style={styles.deleteOverlay}>
                    <div style={styles.deleteBox}>
                      <p style={{ margin: "0 0 12px 0", fontWeight: 600 }}>
                        Delete "{video.title}"?
                      </p>
                      <p style={{ margin: "0 0 16px 0", fontSize: 12, color: "#6b7280" }}>
                        This cannot be undone.
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={styles.cancelDeleteBtn}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(video._id)}
                          style={styles.confirmDeleteBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============ STYLES ============
const styles = {
  container: { padding: 24, maxWidth: 1400, margin: "0 auto" },
  loadingContainer: { padding: 60, textAlign: "center" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 24, flexWrap: "wrap", gap: 16,
  },
  title: { fontSize: 28, fontWeight: 700, color: "#1a1a20", margin: 0 },
  subtitle: { color: "#6b7280", marginTop: 4, fontSize: 14 },
  uploadBtn: {
    padding: "10px 24px", background: "#0f0f0f", color: "white",
    border: "none", borderRadius: 24, cursor: "pointer", fontWeight: 600, fontSize: 14,
  },

  // Stats
  statsRow: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12, marginBottom: 24,
  },
  statCard: {
    background: "white", padding: 16, borderRadius: 12,
    border: "1px solid #e5e7eb", textAlign: "center",
  },
  statNumber: { fontSize: 24, fontWeight: 800, color: "#1a1a20" },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4, fontWeight: 500 },

  // Controls
  controls: { marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 },
  searchWrap: { position: "relative", maxWidth: 400 },
  searchIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" },
  searchInput: {
    width: "100%", padding: "10px 14px 10px 40px", background: "white",
    border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none",
  },
  clearBtn: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    background: "transparent", border: "none", cursor: "pointer", color: "#6b7280",
  },
  filterTabs: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterTab: {
    padding: "8px 16px", background: "white", border: "1px solid #e5e7eb",
    borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#6b7280",
  },
  filterTabActive: {
    background: "#0f0f0f", color: "white", borderColor: "#0f0f0f", fontWeight: 700,
  },
  sortSelect: {
    padding: "8px 14px", background: "white", border: "1px solid #e5e7eb",
    borderRadius: 8, cursor: "pointer", fontSize: 13, alignSelf: "flex-start",
  },

  // Empty
  emptyState: {
    textAlign: "center", padding: 80, background: "white",
    borderRadius: 16, border: "1px solid #e5e7eb",
  },
  clearFiltersBtn: {
    padding: "10px 20px", background: "#0f0f0f", color: "white",
    border: "none", borderRadius: 20, cursor: "pointer", marginTop: 16,
  },

  // Videos List
  videosList: { display: "flex", flexDirection: "column", gap: 12 },
  videoCard: {
    display: "flex", gap: 16, background: "white", padding: 16,
    borderRadius: 12, border: "1px solid #e5e7eb", position: "relative",
    transition: "all 0.2s",
  },
  thumbLink: { textDecoration: "none", flexShrink: 0 },
  thumbWrap: {
    position: "relative", width: 240, height: 135, borderRadius: 10,
    overflow: "hidden", background: "#000",
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  durationBadge: {
    position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.85)",
    color: "white", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 600,
  },
  shortBadge: {
    position: "absolute", top: 6, left: 6,
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    color: "white", padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 800,
  },
  premiumBadge: {
    position: "absolute", top: 6, right: 6,
    background: "linear-gradient(135deg, #ffd700, #ff8c00)",
    color: "#000", padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 800,
  },

  // Info
  videoInfo: { flex: 1, minWidth: 0 },
  videoTitle: {
    margin: 0, fontSize: 16, fontWeight: 600, color: "#1a1a20",
    lineHeight: 1.3, marginBottom: 4,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  videoDesc: { color: "#6b7280", fontSize: 13, margin: "4px 0 8px", lineHeight: 1.4 },
  videoStats: {
    display: "flex", gap: 16, fontSize: 12, color: "#9ca3af",
    marginBottom: 8, flexWrap: "wrap",
  },
  badgeRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  statusBadge: {
    padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
  },
  categoryBadge: {
    padding: "3px 10px", background: "#f3f4f6", borderRadius: 12,
    fontSize: 11, fontWeight: 500, color: "#374151",
  },
  planBadge: {
    padding: "3px 10px", background: "#e0e7ff", borderRadius: 12,
    fontSize: 10, fontWeight: 600, color: "#3730a3",
  },

  // Actions
  actions: { display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 8, background: "#f3f4f6",
    border: "none", cursor: "pointer", fontSize: 16, transition: "all 0.15s",
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  // Delete confirmation
  deleteOverlay: {
    position: "absolute", inset: 0, background: "rgba(255,255,255,0.95)",
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 12, zIndex: 5,
  },
  deleteBox: { textAlign: "center", padding: 20 },
  cancelDeleteBtn: {
    padding: "8px 20px", background: "transparent", color: "#1a1a20",
    border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontWeight: 600,
  },
  confirmDeleteBtn: {
    padding: "8px 20px", background: "#ef4444", color: "white",
    border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600,
  },
};

export default MyVideos;