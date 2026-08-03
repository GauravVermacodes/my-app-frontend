import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const EditSeries = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [myVideos, setMyVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
  });

  const BACKEND = "http://localhost:5000";
  const getUrl = (u) =>
    !u ? "https://picsum.photos/160/90" : u.startsWith("http") ? u : `${BACKEND}${u}`;

  useEffect(() => {
    fetchSeries();
    fetchMyVideos();
  }, [id]);

  const fetchSeries = async () => {
    try {
      const { data } = await API.get(`/series/${id}`);
      setSeries(data);
      setForm({
        title: data.title,
        description: data.description || "",
        category: data.category || "General",
      });
    } catch (e) {
      toast.error("Failed to load series");
      navigate("/my-series");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVideos = async () => {
    try {
      const { data } = await API.get("/videos/my-videos");
      setMyVideos(data.videos || []);
    } catch (e) {}
  };

  const handleUpdateInfo = async () => {
    try {
      await API.put(`/series/${id}`, form);
      toast.success("Series updated!");
      fetchSeries();
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const handleAddEpisode = async (videoId) => {
    try {
      const { data } = await API.post(`/series/${id}/add-episode`, { videoId });
      setSeries(data.series);
      toast.success("Episode added!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const handleRemoveEpisode = async (videoId, epNum) => {
    if (!window.confirm(`Remove Episode ${epNum}?`)) return;
    try {
      const { data } = await API.delete(`/series/${id}/episode/${videoId}`);
      setSeries(data.series);
      toast.success("Episode removed");
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleMove = async (videoId, direction) => {
    try {
      const { data } = await API.post(
        `/series/${id}/episode/${videoId}/move`,
        { direction }
      );
      setSeries(data.series);
      toast.success(`Moved ${direction}`);
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete series "${series.title}"?`)) return;
    try {
      await API.delete(`/series/${id}`);
      toast.success("Series deleted");
      navigate("/my-series");
    } catch (e) {
      toast.error("Failed");
    }
  };

  if (loading) return <div style={{ padding: 40, color: "white" }}>Loading...</div>;
  if (!series) return null;

  const availableVideos = myVideos.filter(
    (v) => !series.episodes.some((e) => (e.video._id || e.video) === v._id)
  );

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto", color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>✏️ Edit Series</h1>
        <button onClick={() => navigate("/my-series")} style={backBtn}>
          ← Back to Series
        </button>
      </div>

      {/* Series Info */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>📝 Series Info</h2>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...inputStyle, minHeight: 100 }}
            />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={inputStyle}
            >
              <option>General</option>
              <option>Thrillers</option>
              <option>Comedy Shows</option>
              <option>Movies</option>
              <option>Animation</option>
              <option>Sci-Fi</option>
              <option>Sports</option>
              <option>Music Mixes</option>
            </select>
          </div>
          <button onClick={handleUpdateInfo} style={saveBtn}>
            💾 Save Changes
          </button>
        </div>
      </div>

      {/* Episodes Management */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>
            📺 Episodes ({series.episodes.length})
          </h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{ ...saveBtn, background: showAdd ? "#666" : "#10b981" }}
          >
            {showAdd ? "✕ Close" : "+ Add Episode"}
          </button>
        </div>

        {/* Add Episode Modal */}
        {showAdd && (
          <div style={{ marginBottom: 20, padding: 16, background: "#0f0f14", borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>Add from your videos:</h3>
            {availableVideos.length === 0 ? (
              <p style={{ color: "#a1a1aa" }}>
                All your videos are already added. Upload more videos first!
              </p>
            ) : (
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {availableVideos.map((v) => (
                  <div key={v._id} style={availableVideoStyle}>
                    <img
                      src={getUrl(v.thumbnailUrl)}
                      alt={v.title}
                      style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 4 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{v.title}</div>
                    </div>
                    <button
                      onClick={() => handleAddEpisode(v._id)}
                      style={{ ...saveBtn, padding: "6px 12px", fontSize: 12 }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Episodes List */}
        {series.episodes.length === 0 ? (
          <p style={{ color: "#a1a1aa", textAlign: "center", padding: 40 }}>
            No episodes yet. Click "+ Add Episode" above to add videos.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {series.episodes.map((ep, idx) => (
              <div key={ep._id} style={episodeItemStyle}>
                <div style={epNumStyle}>{ep.episodeNumber}</div>
                
                <img
                  src={getUrl(ep.video?.thumbnailUrl)}
                  alt={ep.title}
                  style={{ width: 100, height: 56, objectFit: "cover", borderRadius: 4 }}
                />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ep.title || ep.video?.title}</div>
                  <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 2 }}>
                    Episode {ep.episodeNumber}
                  </div>
                </div>

                {/* Reorder buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button
                    onClick={() => handleMove(ep.video._id, "up")}
                    disabled={idx === 0}
                    style={{ ...miniBtn, opacity: idx === 0 ? 0.3 : 1 }}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMove(ep.video._id, "down")}
                    disabled={idx === series.episodes.length - 1}
                    style={{ ...miniBtn, opacity: idx === series.episodes.length - 1 ? 0.3 : 1 }}
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemoveEpisode(ep.video._id, ep.episodeNumber)}
                  style={{ ...miniBtn, background: "#f44336", padding: "8px 12px" }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div style={{ ...cardStyle, border: "1px solid #f44336" }}>
        <h2 style={{ marginTop: 0, color: "#f44336" }}>⚠️ Danger Zone</h2>
        <p style={{ color: "#a1a1aa" }}>
          Deleting this series will not delete your videos, but will remove all episode data.
        </p>
        <button onClick={handleDelete} style={{ ...saveBtn, background: "#f44336" }}>
          🗑️ Delete Entire Series
        </button>
      </div>
    </div>
  );
};

const cardStyle = {
  background: "#1a1a20",
  padding: 24,
  borderRadius: 12,
  marginBottom: 20,
  border: "1px solid #2a2a30",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  color: "#a1a1aa",
  fontSize: 13,
  fontWeight: 500,
};

const inputStyle = {
  width: "100%",
  padding: 12,
  background: "#0f0f14",
  border: "1px solid #2a2a30",
  color: "white",
  borderRadius: 8,
  fontSize: 14,
};

const saveBtn = {
  padding: "10px 20px",
  background: "#065fd4",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const backBtn = {
  padding: "8px 16px",
  background: "transparent",
  color: "white",
  border: "1px solid #333",
  borderRadius: 8,
  cursor: "pointer",
};

const episodeItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 12,
  background: "#0f0f14",
  borderRadius: 8,
  border: "1px solid #2a2a30",
};

const epNumStyle = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "#ff0000",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  flexShrink: 0,
};

const availableVideoStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 10,
  background: "#1a1a20",
  borderRadius: 6,
  marginBottom: 6,
};

const miniBtn = {
  width: 32,
  height: 32,
  padding: 0,
  background: "#333",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default EditSeries;