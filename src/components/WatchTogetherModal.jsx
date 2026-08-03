// src/components/WatchTogetherModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

function WatchTogetherModal({ isOpen, onClose, video }) {
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState(
    `Watch: ${video?.title?.substring(0, 30) || 'Video'}...`
  );
  const [duration, setDuration] = useState(120);
  const [requireApproval, setRequireApproval] = useState(false);
  const [allowGuests, setAllowGuests] = useState(true);
  const [creating, setCreating] = useState(false);

  if (!isOpen || !video) return null;

  const getVideoUrl = () => {
    if (!video?.videoUrl) return '';
    if (video.videoUrl.startsWith('http')) return video.videoUrl;
    const baseURL =
      API.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseURL}${video.videoUrl}`;
  };

  const handleCreate = async () => {
    if (!roomName.trim()) {
      toast.error('Room name is required');
      return;
    }

    setCreating(true);
    try {
      const { data } = await API.post('/rooms/create', {
        name: roomName.trim(),
        videoUrl: getVideoUrl(),
        duration: Number(duration),
        requireApproval,
        allowGuestJoin: allowGuests,
        scheduleMode: 'duration',
        participantCanUnmuteSelf: true,
        participantCanEnableCameraSelf: true,
      });

      const room = data.room;
      toast.success('🎬 Watch party created!');

      // Copy link to clipboard
      const inviteLink = `${window.location.origin}/join/${room.roomCode}`;
      navigator.clipboard.writeText(inviteLink).catch(() => {});

      toast(`📋 Invite link copied! Share with friends`, {
        duration: 5000,
        icon: '🔗',
      });

      onClose();

      // Navigate to WatchRoom
      navigate(`/room/${room._id}`);
    } catch (err) {
      console.error('Create watch party error:', err);
      toast.error(
        err.response?.data?.message || 'Failed to create watch party'
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>🎬 Watch Together</h2>
            <p style={s.subtitle}>Create a watch party for this video</p>
          </div>
          <button style={s.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Video Preview */}
        <div style={s.videoPreview}>
          <img
            src={
              video.thumbnailUrl?.startsWith('http')
                ? video.thumbnailUrl
                : `${API.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000'}${video.thumbnailUrl}`
            }
            alt={video.title}
            style={s.thumbnail}
            onError={(e) => {
              e.target.src = 'https://picsum.photos/320/180';
            }}
          />
          <div style={s.videoInfo}>
            <h3 style={s.videoTitle}>{video.title}</h3>
            <p style={s.videoMeta}>
              {video.uploader?.name || 'WatchNest'} •{' '}
              {video.duration
                ? `${Math.floor(video.duration / 60)}:${String(
                    Math.floor(video.duration % 60)
                  ).padStart(2, '0')}`
                : ''}
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={s.body}>
          {/* Room Name */}
          <div style={s.field}>
            <label style={s.label}>Party Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Movie Night with Friends"
              style={s.input}
              maxLength={50}
            />
          </div>

          {/* Duration */}
          <div style={s.field}>
            <label style={s.label}>Duration</label>
            <div style={s.presetRow}>
              {[60, 120, 180, 240].map((min) => (
                <button
                  key={min}
                  style={{
                    ...s.preset,
                    ...(duration === min ? s.presetActive : {}),
                  }}
                  onClick={() => setDuration(min)}
                >
                  {min < 60 ? `${min}m` : `${min / 60}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div style={s.optionsGrid}>
            <label style={s.toggle}>
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                style={s.checkbox}
              />
              <div>
                <span style={s.toggleLabel}>🔐 Require Approval</span>
                <span style={s.toggleDesc}>
                  Approve each person before they join
                </span>
              </div>
            </label>

            <label style={s.toggle}>
              <input
                type="checkbox"
                checked={allowGuests}
                onChange={(e) => setAllowGuests(e.target.checked)}
                style={s.checkbox}
              />
              <div>
                <span style={s.toggleLabel}>👤 Allow Guests</span>
                <span style={s.toggleDesc}>
                  People without accounts can join
                </span>
              </div>
            </label>
          </div>

          {/* Info box */}
          <div style={s.infoBox}>
            <span style={{ fontSize: 16 }}>💡</span>
            <div>
              <strong>How it works:</strong>
              <ul style={s.infoList}>
                <li>A room is created with this video loaded</li>
                <li>Invite link is auto-copied to your clipboard</li>
                <li>Share the link — friends join and watch in sync</li>
                <li>Video playback is synchronized for everyone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{
              ...s.createBtn,
              ...(creating ? s.disabledBtn : {}),
            }}
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? '⏳ Creating...' : '🎬 Create Watch Party'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════
const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e5e7eb',
    boxShadow: '0 25px 70px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    animation: 'fadeInScale 0.25s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px 14px',
    borderBottom: '1px solid #f1f5f9',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: '#f1f5f9',
    borderRadius: '8px',
    fontSize: '22px',
    lineHeight: 1,
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreview: {
    display: 'flex',
    gap: '14px',
    padding: '16px 24px',
    background: '#f8fafc',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center',
  },
  thumbnail: {
    width: '120px',
    height: '68px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  videoInfo: {
    flex: 1,
    minWidth: 0,
  },
  videoTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  videoMeta: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#64748b',
  },
  body: {
    padding: '20px 24px',
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
  },
  input: {
    padding: '11px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    background: '#f8fafc',
    color: '#0f172a',
    boxSizing: 'border-box',
  },
  presetRow: {
    display: 'flex',
    gap: '8px',
  },
  preset: {
    flex: 1,
    padding: '10px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    transition: 'all 0.15s',
  },
  presetActive: {
    background: '#ede9fe',
    borderColor: '#c4b5fd',
    color: '#7c3aed',
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  toggle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 14px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginTop: '2px',
    cursor: 'pointer',
    accentColor: '#8b5cf6',
  },
  toggleLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
  },
  toggleDesc: {
    display: 'block',
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px',
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    padding: '14px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#166534',
    lineHeight: '1.5',
  },
  infoList: {
    margin: '6px 0 0',
    paddingLeft: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  footer: {
    display: 'flex',
    gap: '10px',
    padding: '16px 24px',
    borderTop: '1px solid #f1f5f9',
    background: '#f8fafc',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px 20px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  createBtn: {
    flex: 2,
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(139,92,246,0.3)',
    transition: 'all 0.2s',
  },
  disabledBtn: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
};

export default WatchTogetherModal;