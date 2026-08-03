import React, { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
];

const REPORT_REASONS = [
  { id: "spam", label: "Spam or misleading" },
  { id: "harassment", label: "Harassment or bullying" },
  { id: "hate_speech", label: "Hate speech" },
  { id: "inappropriate", label: "Inappropriate content" },
  { id: "misinformation", label: "False information" },
  { id: "other", label: "Other" },
];

const CommentItem = ({ comment, currentUserId, onUpdate, onDelete }) => {
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reporting, setReporting] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [liked, setLiked] = useState(
    comment.likes?.some((id) => id === currentUserId || id?._id === currentUserId)
  );
  const [disliked, setDisliked] = useState(
    comment.dislikes?.some((id) => id === currentUserId || id?._id === currentUserId)
  );
  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);
  const [dislikesCount, setDislikesCount] = useState(comment.dislikes?.length || 0);
  const [reported, setReported] = useState(false);

  const displayText = translation || comment.text;
  const isLongText = displayText.length > 200;

  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}y ago`;
    if (months > 0) return `${months}mo ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "Just now";
  };

  const handleTranslate = async (targetLang) => {
    setShowTranslateMenu(false);
    setTranslating(true);
    try {
      const { data } = await API.post(`/comments/${comment._id}/translate`, {
        targetLang,
      });
      setTranslation(data.translated);
      toast.success(`Translated to ${targetLang.toUpperCase()}`);
    } catch (e) {
      toast.error("Translation failed");
    } finally {
      setTranslating(false);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await API.put(`/comments/${comment._id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
      setDislikesCount(data.dislikesCount);
      if (data.liked && disliked) setDisliked(false);
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleDislike = async () => {
    try {
      const { data } = await API.put(`/comments/${comment._id}/dislike`);
      setDisliked(data.disliked);
      setLikesCount(data.likesCount);
      setDislikesCount(data.dislikesCount);
      if (data.disliked && liked) setLiked(false);
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleReport = async () => {
    if (!selectedReason) {
      toast.error("Select a reason");
      return;
    }

    setReporting(true);
    try {
      const { data } = await API.post(`/comments/${comment._id}/report`, {
        reason: selectedReason,
        description: reportDescription,
      });

      toast.success(data.message);
      setReported(true);
      setShowReportModal(false);
      setSelectedReason("");
      setReportDescription("");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to report");
    } finally {
      setReporting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await API.delete(`/comments/${comment._id}`);
      onDelete(comment._id);
      toast.success("Deleted");
    } catch (e) {
      toast.error("Failed");
    }
  };

  const resetTranslation = () => {
    setTranslation(null);
    toast.success("Showing original");
  };

  const isOwner = currentUserId === comment.user?._id;

  return (
    <div style={commentStyle}>
      {/* Avatar */}
      <div style={avatarStyle}>
        {comment.user?.name?.charAt(0).toUpperCase() || "?"}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={headerStyle}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            @{comment.user?.name || "User"}
          </span>
          <span style={metaStyle}>{formatTime(comment.createdAt)}</span>
          {comment.isEdited && (
            <span style={{ ...metaStyle, fontStyle: "italic" }}>(edited)</span>
          )}
          {/* ✅ Optional location (only country, no city!) */}
          {comment.showLocation && comment.location?.country && (
            <span style={locationBadge}>
              🌍 {comment.location.country}
            </span>
          )}
          {/* Language badge */}
          {comment.language && comment.language !== "en" && (
            <span style={languageBadge}>
              {LANGUAGES.find((l) => l.code === comment.language)?.flag || "🌐"}{" "}
              {comment.language.toUpperCase()}
            </span>
          )}
          {/* Flag badge */}
          {comment.isFlagged && (
            <span style={flagBadge}>⚠️ Under review</span>
          )}
        </div>

        {/* Text */}
        <div style={textStyle}>
          {isLongText && !showFullText
            ? `${displayText.slice(0, 200)}...`
            : displayText}
          {isLongText && (
            <button onClick={() => setShowFullText(!showFullText)} style={readMoreBtn}>
              {showFullText ? "Show less" : "Read more"}
            </button>
          )}
          {translation && (
            <button onClick={resetTranslation} style={readMoreBtn}>
              Show original
            </button>
          )}
        </div>

        {/* Translation indicator */}
        {translating && (
          <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 4 }}>
            🌐 Translating...
          </div>
        )}

        {/* Actions */}
        <div style={actionsStyle}>
          {/* Like */}
          <button
            onClick={handleLike}
            style={{
              ...actionBtn,
              color: liked ? "#065fd4" : "inherit",
            }}
          >
            {liked ? "👍" : "👍"} {likesCount || ""}
          </button>

          {/* Dislike */}
          <button
            onClick={handleDislike}
            style={{
              ...actionBtn,
              color: disliked ? "#f44336" : "inherit",
            }}
          >
            {disliked ? "👎" : "👎"} {dislikesCount || ""}
          </button>

          {/* Translate */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowTranslateMenu(!showTranslateMenu)}
              style={actionBtn}
            >
              🌐 Translate
            </button>
            {showTranslateMenu && (
              <div style={translateMenu}>
                <div style={translateHeader}>Translate to:</div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleTranslate(lang.code)}
                    style={translateOption}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#2a2a30")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span style={{ fontSize: 16 }}>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Report */}
          {!isOwner && !reported && (
            <button
              onClick={() => setShowReportModal(true)}
              style={actionBtn}
              title="Report this comment"
            >
              🚩 Report
            </button>
          )}

          {reported && (
            <span style={{ fontSize: 11, color: "#f44336" }}>
              ✓ Reported
            </span>
          )}

          {/* Delete (own comments only) */}
          {isOwner && (
            <button
              onClick={handleDelete}
              style={{ ...actionBtn, color: "#f44336" }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

      {/* REPORT MODAL */}
      {showReportModal && (
        <div style={modalOverlay} onClick={() => setShowReportModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>🚩 Report Comment</h3>
            <p style={{ color: "#a1a1aa", fontSize: 13 }}>
              Why are you reporting this comment?
            </p>

            <div style={{ marginTop: 16 }}>
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 10,
                    background:
                      selectedReason === r.id
                        ? "rgba(6,95,212,0.2)"
                        : "transparent",
                    borderRadius: 6,
                    cursor: "pointer",
                    marginBottom: 4,
                  }}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  <span style={{ fontSize: 14 }}>{r.label}</span>
                </label>
              ))}
            </div>

            <textarea
              placeholder="Additional details (optional)"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              style={{
                width: "100%",
                marginTop: 12,
                padding: 10,
                background: "#0f0f14",
                border: "1px solid #2a2a30",
                color: "white",
                borderRadius: 6,
                minHeight: 60,
                fontFamily: "inherit",
                fontSize: 13,
              }}
              maxLength={500}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setShowReportModal(false)}
                style={{ ...cancelBtn, flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!selectedReason || reporting}
                style={{
                  ...reportBtn,
                  flex: 1,
                  opacity: !selectedReason || reporting ? 0.5 : 1,
                }}
              >
                {reporting ? "Reporting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// STYLES
const commentStyle = {
  display: "flex",
  gap: 12,
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
  transition: "background 0.15s",
};

const avatarStyle = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #065fd4, #4a90e2)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  flexShrink: 0,
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 4,
};

const metaStyle = {
  fontSize: 11,
  color: "#a1a1aa",
};

const locationBadge = {
  fontSize: 10,
  padding: "1px 6px",
  background: "rgba(6,95,212,0.2)",
  color: "#065fd4",
  borderRadius: 10,
};

const languageBadge = {
  fontSize: 10,
  padding: "1px 6px",
  background: "rgba(16,185,129,0.2)",
  color: "#10b981",
  borderRadius: 10,
};

const flagBadge = {
  fontSize: 10,
  padding: "1px 6px",
  background: "rgba(255,152,0,0.2)",
  color: "#ff9800",
  borderRadius: 10,
};

const textStyle = {
  fontSize: 14,
  lineHeight: 1.5,
  marginBottom: 8,
  wordBreak: "break-word",
};

const readMoreBtn = {
  background: "transparent",
  border: "none",
  color: "#065fd4",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  marginLeft: 8,
  padding: 0,
};

const actionsStyle = {
  display: "flex",
  gap: 4,
  flexWrap: "wrap",
};

const actionBtn = {
  background: "transparent",
  border: "none",
  color: "#a1a1aa",
  padding: "6px 12px",
  borderRadius: 20,
  cursor: "pointer",
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  gap: 4,
  transition: "background 0.15s",
};

const translateMenu = {
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: 4,
  background: "#1a1a20",
  border: "1px solid #2a2a30",
  borderRadius: 8,
  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
  minWidth: 180,
  maxHeight: 300,
  overflowY: "auto",
  zIndex: 100,
};

const translateHeader = {
  padding: "8px 12px",
  fontSize: 11,
  color: "#a1a1aa",
  fontWeight: 700,
  borderBottom: "1px solid #2a2a30",
};

const translateOption = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  padding: "8px 12px",
  background: "transparent",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontSize: 13,
  textAlign: "left",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalBox = {
  background: "#1a1a20",
  padding: 24,
  borderRadius: 12,
  width: "90%",
  maxWidth: 450,
  color: "white",
  border: "1px solid #2a2a30",
};

const cancelBtn = {
  padding: "10px 16px",
  background: "transparent",
  color: "white",
  border: "1px solid #333",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const reportBtn = {
  padding: "10px 16px",
  background: "linear-gradient(135deg, #f44336, #d32f2f)",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

export default CommentItem;