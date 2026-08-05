
// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// ═══════════════════════════════════════════════════════════
//  ✅ REDUX imports (replaces Context API)
// ═══════════════════════════════════════════════════════════
import {
  fetchMyRooms,
  deleteRoom,
  createRoom,
  selectHostedRooms,
  selectJoinedRooms,
  selectRoomsLoading,
} from '../store/slices/roomsSlice';
import { selectUser } from '../store/slices/authSlice';
import { selectPendingRequests } from '../store/slices/friendsSlice';
import { selectUnreadCount } from '../store/slices/notificationsSlice';

// Keep roomService for actions not yet in Redux (leave, reschedule)
import roomService from '../services/roomService';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ═══════════════════════════════════════════════════════════
  //  ✅ REDUX STATE (replaces all useContext calls)
  // ═══════════════════════════════════════════════════════════
  const user = useSelector(selectUser);
  const hostedRooms = useSelector(selectHostedRooms);
  const joinedRooms = useSelector(selectJoinedRooms);
  const loading = useSelector(selectRoomsLoading);
  const pendingRequests = useSelector(selectPendingRequests);
  const unreadCount = useSelector(selectUnreadCount);

  // ═══════════════════════════════════════════════════════════
  //  LIFECYCLE
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    // ✅ Fetch rooms via Redux (cached, deduplicated)
    dispatch(fetchMyRooms());
  }, [dispatch]);

  // ═══════════════════════════════════════════════════════════
  //  HANDLERS
  // ═══════════════════════════════════════════════════════════
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Room code copied!');
  };

  const copyLink = (code) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    toast.success('Link copied!');
  };

  // ✅ Delete room via Redux (auto-updates UI)
  const handleDelete = async (roomId) => {
    try {
      await dispatch(deleteRoom(roomId)).unwrap();
      toast.success('🗑️ Room deleted');
      // No need to reload — Redux updates automatically!
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err || 'Failed to delete room');
    }
  };

  // ✅ Reschedule/restart room
  const handleReschedule = async (roomId, schedule) => {
    try {
      await roomService.restartSession(roomId, schedule);
      toast.success(
        schedule.scheduleMode === 'scheduled'
          ? '📅 Room scheduled!'
          : '⚡ Session restarted!'
      );
      // Refresh rooms from Redux
      dispatch(fetchMyRooms());
    } catch (err) {
      console.error('Reschedule error:', err);
      toast.error(err.response?.data?.message || 'Failed to reschedule');
    }
  };

  // ✅ Leave room (for participants)
  const handleLeave = async (roomId) => {
    try {
      await roomService.leaveRoom(roomId, true);
      toast.success('Left room');
      dispatch(fetchMyRooms());
    } catch (err) {
      console.error('Leave error:', err);
      toast.error(err.response?.data?.message || 'Failed to leave');
    }
  };

  return (
    <>
      <style>{`
  @media (min-width: 1024px) {
    .dash-content {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 24px;
      align-items: start;
    }
    .dash-left-column {
      position: sticky;
      top: 20px;
    }
  }
  
  @media (max-width: 1023px) {
    .dash-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }

  @media (max-width: 640px) {
    .dash-page { padding: 16px 12px !important; }
    .dash-banner { padding: 20px !important; border-radius: 16px !important; }
    .dash-banner-title { font-size: 20px !important; }
    .dash-section-title { font-size: 16px !important; }
    .dash-action-card { padding: 14px !important; }
    .dash-action-icon { font-size: 22px !important; margin-bottom: 6px !important; }
    .dash-action-label { font-size: 13px !important; }
    .dash-action-desc { font-size: 11px !important; }
  }

  .dash-action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .dash-room-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }
  
  @media (min-width: 1400px) {
    .dash-room-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .dash-action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(217,119,6,0.15) !important;
    border-color: #fbbf24 !important;
  }
  .dash-room-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(217,119,6,0.12) !important;
    border-color: #fbbf24 !important;
  }
  .dash-room-card { font-family: inherit; }
`}</style>

      <div className="dash-page" style={s.page}>
        <div style={s.inner}>
          {/* Welcome banner */}
          <div className="dash-banner" style={s.banner}>
            <div>
              <h1 className="dash-banner-title" style={s.bannerTitle}>
                Welcome, {user?.username || user?.name || 'friend'}! 👋
              </h1>
              <p style={s.bannerSub}>
                Watch together with your friends in sync.
              </p>
            </div>
            <div style={s.bannerStats}>
              {pendingRequests.length > 0 && (
                <div
                  style={s.statChip}
                  onClick={() => navigate('/friends')}
                >
                  👋 {pendingRequests.length} friend request{pendingRequests.length > 1 ? 's' : ''}
                </div>
              )}
              {unreadCount > 0 && (
                <div
                  style={{ ...s.statChip, background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}
                  onClick={() => navigate('/notifications')}
                >
                  🔔 {unreadCount} notification{unreadCount > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          <div className="dash-content">
            {/* ═══ LEFT COLUMN: Quick Actions ═══ */}
            <div className="dash-left-column">
              <div style={s.section}>
                <h2 className="dash-section-title" style={s.sectionTitle}>
                  Quick Actions
                </h2>
                <div className="dash-action-grid">
                  <button
                    className="dash-action-card"
                    style={{ ...s.actionCard, ...s.actionCardPrimary }}
                    onClick={() => navigate('/create-room')}
                  >
                    <span className="dash-action-icon" style={s.actionIcon}>🎬</span>
                    <span className="dash-action-label" style={s.actionLabel}>Create Room</span>
                    <span className="dash-action-desc" style={s.actionDesc}>Start a new watch party</span>
                  </button>

                  <button
                    className="dash-action-card"
                    style={s.actionCard}
                    onClick={() => navigate('/join')}
                  >
                    <span className="dash-action-icon" style={s.actionIcon}>🚪</span>
                    <span className="dash-action-label" style={s.actionLabel}>Join Room</span>
                    <span className="dash-action-desc" style={s.actionDesc}>Enter with code or link</span>
                  </button>

                  <button
                    className="dash-action-card"
                    style={s.actionCard}
                    onClick={() => navigate('/friends')}
                  >
                    <span className="dash-action-icon" style={s.actionIcon}>👥</span>
                    <span className="dash-action-label" style={s.actionLabel}>Friends</span>
                    <span className="dash-action-desc" style={s.actionDesc}>Manage friend circle</span>
                    {pendingRequests.length > 0 && (
                      <span style={s.actionBadge}>{pendingRequests.length}</span>
                    )}
                  </button>

                  <button
                    className="dash-action-card"
                    style={s.actionCard}
                    onClick={() => navigate('/notifications')}
                  >
                    <span className="dash-action-icon" style={s.actionIcon}>🔔</span>
                    <span className="dash-action-label" style={s.actionLabel}>Notifications</span>
                    <span className="dash-action-desc" style={s.actionDesc}>Invites & updates</span>
                    {unreadCount > 0 && (
                      <span style={{ ...s.actionBadge, background: '#ef4444' }}>{unreadCount}</span>
                    )}
                  </button>
                </div>

                {/* Stats card */}
                <div style={s.statsCard}>
                  <div style={s.statsTitle}>📊 Your Activity</div>
                  <div style={s.statsGrid}>
                    <div style={s.statBox}>
                      <div style={s.statNumber}>{hostedRooms.length}</div>
                      <div style={s.statLabel}>Hosted</div>
                    </div>
                    <div style={s.statDivider}></div>
                    <div style={s.statBox}>
                      <div style={s.statNumber}>{joinedRooms.length}</div>
                      <div style={s.statLabel}>Joined</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ RIGHT COLUMN: Rooms ═══ */}
            <div style={s.rightColumn}>
              {/* My Hosted Rooms */}
              <div style={s.section}>
                <div style={s.sectionHeader}>
                  <h2 className="dash-section-title" style={s.sectionTitle}>
                    My Rooms ({hostedRooms.length})
                  </h2>
                  {hostedRooms.length > 0 && (
                    <button
                      style={s.newRoomBtn}
                      onClick={() => navigate('/create-room')}
                    >
                      + New Room
                    </button>
                  )}
                </div>

                {loading ? (
                  <div style={s.loading}>
                    <div style={s.spinner}></div>
                    <p>Loading rooms...</p>
                  </div>
                ) : hostedRooms.length === 0 ? (
                  <div style={s.empty}>
                    <span style={s.emptyIcon}>🎬</span>
                    <p style={s.emptyTitle}>No rooms yet</p>
                    <p style={s.emptyText}>Create your first watch party!</p>
                    <button
                      style={s.emptyBtn}
                      onClick={() => navigate('/create-room')}
                    >
                      🎬 Create Room
                    </button>
                  </div>
                ) : (
                  <div className="dash-room-grid">
                    {hostedRooms.map(room => (
                      <RoomCard
                        key={room._id}
                        room={room}
                        isHost={true}
                        onJoin={() => navigate(`/room/${room._id}`)}
                        onCopyCode={() => copyCode(room.roomCode)}
                        onCopyLink={() => copyLink(room.roomCode)}
                        onDelete={handleDelete}
                        onReschedule={handleReschedule}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Joined Rooms */}
              {joinedRooms.length > 0 && (
                <div style={s.section}>
                  <h2 className="dash-section-title" style={s.sectionTitle}>
                    🚪 Joined Rooms ({joinedRooms.length})
                  </h2>
                  <div className="dash-room-grid">
                    {joinedRooms.map(room => (
                      <RoomCard
                        key={room._id}
                        room={room}
                        isHost={false}
                        onJoin={() => navigate(`/room/${room._id}`)}
                        onCopyCode={() => copyCode(room.roomCode)}
                        onCopyLink={() => copyLink(room.roomCode)}
                        onLeave={handleLeave}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  ROOM CARD COMPONENT
// ═══════════════════════════════════════════════════════════
function RoomCard({ room, isHost, onJoin, onCopyCode, onCopyLink, onDelete, onReschedule, onLeave }) {
  const isLive = room.isActive && room.isSessionLive;
  const isScheduled = room.scheduleMode === 'scheduled';
  const now = new Date();
  const startTime = new Date(room.startedAt);
  const endTime = new Date(room.endsAt);
  const notStartedYet = isScheduled && now < startTime;
  const timeLeft = Math.max(0, Math.floor((endTime - now) / 60000));

  const [showMenu, setShowMenu] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="dash-room-card" style={rc.card}>
        <div style={rc.top}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={rc.nameRow}>
              <h3 style={rc.name}>{room.name}</h3>
              <span style={{
                ...rc.badge,
                ...(notStartedYet ? rc.badgeScheduled :
                  isLive ? rc.badgeLive : rc.badgeEnded)
              }}>
                {notStartedYet ? '📅 Scheduled' :
                  isLive ? '🟢 Live' : '⚫ Ended'}
              </span>
            </div>
            <p style={rc.code}>Code: {room.roomCode}</p>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            {isHost && <span style={rc.hostBadge}>👑 Host</span>}

            {/* 3-dot menu — Host only */}
            {isHost && (
              <div style={{ position: 'relative' }}>
                <button
                  style={rc.moreBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  title="More options"
                >
                  ⋮
                </button>

                {showMenu && (
                  <>
                    <div
                      onClick={() => setShowMenu(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                    />
                    <div style={rc.dropdown}>
                      <button
                        style={rc.menuItem}
                        onClick={() => {
                          setShowMenu(false);
                          setShowRescheduleModal(true);
                        }}
                      >
                        <span>📅</span> Reschedule
                      </button>

                      <button
                        style={rc.menuItem}
                        onClick={() => {
                          setShowMenu(false);
                          onCopyLink();
                        }}
                      >
                        <span>🔗</span> Copy Link
                      </button>

                      <button
                        style={rc.menuItem}
                        onClick={() => {
                          setShowMenu(false);
                          onCopyCode();
                        }}
                      >
                        <span>📋</span> Copy Code
                      </button>

                      <div style={rc.menuDivider} />

                      <button
                        style={{ ...rc.menuItem, ...rc.menuItemDanger }}
                        onClick={() => {
                          setShowMenu(false);
                          if (window.confirm(`Delete "${room.name}" permanently?`)) {
                            onDelete(room._id);
                          }
                        }}
                      >
                        <span>🗑️</span> Delete Room
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {isScheduled ? (
          <div style={rc.scheduleInfo}>
            <div style={rc.scheduleRow}>
              <span style={rc.scheduleDate}>📅 {formatDate(startTime)}</span>
              <span style={rc.scheduleTime}>
                {formatTime(startTime)} → {formatTime(endTime)}
              </span>
            </div>
            {notStartedYet && (
              <div style={rc.startsIn}>
                Starts in {Math.floor((startTime - now) / 60000)} min
              </div>
            )}
          </div>
        ) : (
          <div style={rc.meta}>
            <span>👥 {room.participants?.length || 0} participants</span>
            {isLive && timeLeft > 0 && (
              <span style={rc.timer}>⏱ {timeLeft} min left</span>
            )}
          </div>
        )}

        <div style={rc.actions}>
          {notStartedYet ? (
            <button style={{ ...rc.joinBtn, ...rc.joinBtnScheduled }} disabled>
              📅 Not Started
            </button>
          ) : isLive ? (
            <button style={rc.joinBtn} onClick={onJoin}>
              ▶ Join
            </button>
          ) : room.isActive ? (
            <button
              style={{ ...rc.joinBtn, background: '#f59e0b' }}
              onClick={onJoin}
            >
              🔄 Rejoin
            </button>
          ) : (
            <button style={{ ...rc.joinBtn, ...rc.joinBtnScheduled }} disabled>
              🔒 Closed
            </button>
          )}

          <button style={rc.iconBtn} onClick={onCopyCode} title="Copy code">
            📋
          </button>
          <button style={rc.iconBtn} onClick={onCopyLink} title="Copy link">
            🔗
          </button>

          {/* Leave button for participants */}
          {!isHost && onLeave && (
            <button
              style={{ ...rc.iconBtn, color: '#ef4444' }}
              onClick={() => {
                if (window.confirm('Leave this room?')) {
                  onLeave(room._id);
                }
              }}
              title="Leave room"
            >
              🚪
            </button>
          )}
        </div>
      </div>

      {showRescheduleModal && (
        <RescheduleModal
          room={room}
          onClose={() => setShowRescheduleModal(false)}
          onConfirm={(newSchedule) => {
            onReschedule(room._id, newSchedule);
            setShowRescheduleModal(false);
          }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  RESCHEDULE MODAL
// ═══════════════════════════════════════════════════════════
function RescheduleModal({ room, onClose, onConfirm }) {
  const [scheduleMode, setScheduleMode] = useState('duration');
  const [duration, setDuration] = useState(60);
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const endTime = new Date(tomorrow);
    endTime.setHours(11, 0, 0, 0);

    const formatDateTimeLocal = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setScheduledStart(formatDateTimeLocal(tomorrow));
    setScheduledEnd(formatDateTimeLocal(endTime));
  }, []);

  const handleSubmit = () => {
    if (scheduleMode === 'duration') {
      if (!duration || duration < 1) {
        alert('Please enter valid duration');
        return;
      }
      onConfirm({
        scheduleMode: 'duration',
        duration: Number(duration),
      });
    } else {
      if (!scheduledStart || !scheduledEnd) {
        alert('Please select start and end times');
        return;
      }
      const start = new Date(scheduledStart);
      const end = new Date(scheduledEnd);
      if (end <= start) {
        alert('End time must be after start time');
        return;
      }
      onConfirm({
        scheduleMode: 'scheduled',
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
      });
    }
  };

  return (
    <div style={rm.overlay} onClick={onClose}>
      <div style={rm.modal} onClick={(e) => e.stopPropagation()}>
        <div style={rm.header}>
          <div>
            <h2 style={rm.title}>📅 Reschedule Room</h2>
            <p style={rm.subtitle}>{room.name}</p>
          </div>
          <button style={rm.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={rm.body}>
          <div style={rm.modeRow}>
            <button
              style={{
                ...rm.modeBtn,
                ...(scheduleMode === 'duration' ? rm.modeBtnActive : {}),
              }}
              onClick={() => setScheduleMode('duration')}
            >
              ⚡ Start Now
            </button>
            <button
              style={{
                ...rm.modeBtn,
                ...(scheduleMode === 'scheduled' ? rm.modeBtnActive : {}),
              }}
              onClick={() => setScheduleMode('scheduled')}
            >
              📅 Schedule
            </button>
          </div>

          {scheduleMode === 'duration' && (
            <div style={rm.section}>
              <label style={rm.label}>Duration (minutes)</label>
              <div style={rm.presetRow}>
                {[30, 60, 120, 180].map((min) => (
                  <button
                    key={min}
                    style={{
                      ...rm.preset,
                      ...(duration === min ? rm.presetActive : {}),
                    }}
                    onClick={() => setDuration(min)}
                  >
                    {min < 60 ? `${min}m` : `${min / 60}h`}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="480"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={rm.input}
                placeholder="Custom minutes"
              />
              <p style={rm.hint}>
                Meeting will start immediately and last {duration} minutes
              </p>
            </div>
          )}

          {scheduleMode === 'scheduled' && (
            <div style={rm.section}>
              <label style={rm.label}>Start Time</label>
              <input
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                style={rm.input}
              />

              <label style={{ ...rm.label, marginTop: '14px' }}>End Time</label>
              <input
                type="datetime-local"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                style={rm.input}
              />

              <div style={rm.quickTimes}>
                <p style={rm.hint}>Quick presets:</p>
                <div style={rm.presetRow}>
                  {[
                    { label: 'Tomorrow 10 AM', hours: 10, days: 1 },
                    { label: 'Tomorrow 2 PM', hours: 14, days: 1 },
                    { label: 'Next Week 10 AM', hours: 10, days: 7 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      style={rm.quickBtn}
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + preset.days);
                        d.setHours(preset.hours, 0, 0, 0);
                        const end = new Date(d);
                        end.setHours(preset.hours + 1, 0, 0, 0);

                        const pad = (n) => String(n).padStart(2, '0');
                        const fmt = (dt) =>
                          `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

                        setScheduledStart(fmt(d));
                        setScheduledEnd(fmt(end));
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={rm.footer}>
          <button style={rm.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button style={rm.confirmBtn} onClick={handleSubmit}>
            {scheduleMode === 'duration' ? '⚡ Start Now' : '📅 Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STYLES (unchanged)
// ═══════════════════════════════════════════════════════════
const s = {
  page: {
    minHeight: 'calc(100vh - 68px)',
    background: 'linear-gradient(180deg, #f4f2ee 0%, #eeece7 100%)',
    width: '100%',
    padding: '24px 20px',
    color: '#1c1c1e',
    boxSizing: 'border-box',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  inner: { maxWidth: '1400px', margin: '0 auto' },
  banner: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 50%, #fff7ed 100%)',
    border: '1px solid #fbbf24',
    borderRadius: '20px',
    padding: '28px 32px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    boxShadow: '0 4px 16px rgba(217,119,6,0.08)',
  },
  bannerTitle: {
    margin: 0,
    fontSize: '26px',
    fontWeight: '800',
    color: '#1c1c1e',
    letterSpacing: '-0.02em',
  },
  bannerSub: { margin: '6px 0 0', color: '#6e6e73', fontSize: '14px', fontWeight: 500 },
  bannerStats: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  statChip: {
    padding: '8px 16px',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#059669',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.15s',
  },
  rightColumn: { minWidth: 0 },
  section: { marginBottom: '24px' },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '12px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#1c1c1e',
    letterSpacing: '-0.01em',
  },
  newRoomBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    border: '1px solid #fbbf24',
    borderRadius: '10px',
    color: '#92400e',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  actionCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '18px',
    background: '#ffffff',
    border: '1px solid #e8e5df',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    color: '#1c1c1e',
    boxShadow: '0 2px 6px rgba(28,28,30,0.04)',
    minHeight: '110px',
    fontFamily: 'inherit',
  },
  actionCardPrimary: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '1px solid #fbbf24',
  },
  actionIcon: { fontSize: '26px', marginBottom: '8px' },
  actionLabel: { fontSize: '14px', fontWeight: '700', marginBottom: '4px', color: '#1c1c1e' },
  actionDesc: { fontSize: '11px', color: '#8e8e93', lineHeight: '1.3', fontWeight: 500 },
  actionBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(217,119,6,0.3)',
  },
  statsCard: {
    marginTop: '16px',
    padding: '18px',
    background: '#ffffff',
    border: '1px solid #e8e5df',
    borderRadius: '14px',
    boxShadow: '0 2px 6px rgba(28,28,30,0.04)',
  },
  statsTitle: { fontSize: '13px', fontWeight: '700', color: '#6e6e73', marginBottom: '14px' },
  statsGrid: { display: 'flex', alignItems: 'center', gap: '12px' },
  statBox: { flex: 1, textAlign: 'center' },
  statNumber: { fontSize: '28px', fontWeight: '800', color: '#d97706', lineHeight: 1, letterSpacing: '-0.02em' },
  statLabel: { fontSize: '12px', color: '#8e8e93', marginTop: '4px', fontWeight: '600' },
  statDivider: { width: '1px', height: '32px', background: '#e8e5df' },
  loading: {
    color: '#8e8e93',
    padding: '32px 20px',
    textAlign: 'center',
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e8e5df',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #fef3c7',
    borderTop: '3px solid #d97706',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 24px',
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px dashed #e8e5df',
    color: '#6e6e73',
  },
  emptyIcon: { fontSize: '44px', display: 'block', marginBottom: '12px' },
  emptyTitle: { margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#1c1c1e' },
  emptyText: { margin: 0, fontSize: '13px', color: '#8e8e93', fontWeight: 500 },
  emptyBtn: {
    marginTop: '16px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 4px 14px rgba(217,119,6,0.35)',
    fontFamily: 'inherit',
  },
};

const rc = {
  card: {
    background: '#ffffff',
    border: '1px solid #e8e5df',
    borderRadius: '14px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 2px 6px rgba(28,28,30,0.04)',
    transition: 'all 0.2s ease',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
  },
  nameRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  name: { margin: 0, fontSize: '15px', fontWeight: '700', color: '#1c1c1e', wordBreak: 'break-word' },
  badge: { fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' },
  badgeLive: { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' },
  badgeEnded: { background: '#faf7f0', color: '#8e8e93', border: '1px solid #e8e5df' },
  badgeScheduled: { background: '#fef3c7', color: '#92400e', border: '1px solid #fbbf24' },
  code: { margin: '4px 0 0', fontSize: '11px', color: '#d97706', fontFamily: 'monospace', fontWeight: 700 },
  hostBadge: {
    fontSize: '11px',
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    color: '#92400e',
    padding: '4px 10px',
    borderRadius: '8px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    border: '1px solid #fbbf24',
  },
  meta: { display: 'flex', gap: '12px', fontSize: '12px', color: '#6e6e73', flexWrap: 'wrap', fontWeight: 500 },
  timer: { color: '#ea580c', fontWeight: 700 },
  scheduleInfo: {
    padding: '10px 12px',
    background: '#fef3c7',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    border: '1px solid #fbbf24',
  },
  scheduleRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#92400e', flexWrap: 'wrap', gap: '6px', fontWeight: 600 },
  scheduleDate: { fontWeight: '700' },
  scheduleTime: { fontFamily: 'monospace' },
  startsIn: { fontSize: '11px', color: '#92400e', textAlign: 'center', padding: '4px', background: '#fef3c7', borderRadius: '6px', fontWeight: 700 },
  actions: { display: 'flex', gap: '6px' },
  joinBtn: {
    flex: 1,
    padding: '10px',
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
    boxShadow: '0 3px 10px rgba(217,119,6,0.3)',
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
  },
  joinBtnScheduled: { background: '#faf7f0', color: '#8e8e93', cursor: 'not-allowed', boxShadow: 'none', border: '1px solid #e8e5df' },
  iconBtn: {
    padding: '9px 12px',
    background: '#faf7f0',
    border: '1px solid #e8e5df',
    borderRadius: '9px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6e6e73',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  moreBtn: {
    background: '#faf7f0',
    border: '1px solid #e8e5df',
    borderRadius: '8px',
    width: '28px',
    height: '28px',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6e6e73',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
    transition: 'all 0.15s',
  },
  dropdown: {
    position: 'absolute',
    top: '32px',
    right: '0',
    background: '#ffffff',
    border: '1px solid #e8e5df',
    borderRadius: '12px',
    boxShadow: '0 12px 32px rgba(28,28,30,0.15)',
    padding: '4px',
    minWidth: '180px',
    zIndex: 200,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#1c1c1e',
    fontWeight: '600',
    textAlign: 'left',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
  menuItemDanger: { color: '#dc2626' },
  menuDivider: { height: '1px', background: '#e8e5df', margin: '4px 0' },
};

const rm = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(28,28,30,0.5)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e8e5df',
    boxShadow: '0 25px 70px rgba(28,28,30,0.2)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #e8e5df',
  },
  title: { margin: 0, fontSize: '20px', fontWeight: '800', color: '#1c1c1e', letterSpacing: '-0.02em' },
  subtitle: { margin: '4px 0 0', fontSize: '13px', color: '#6e6e73', fontWeight: 500 },
  closeBtn: {
    width: '32px',
    height: '32px',
    background: '#faf7f0',
    borderRadius: '8px',
    fontSize: '24px',
    lineHeight: 1,
    cursor: 'pointer',
    color: '#6e6e73',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    paddingBottom: '2px',
    border: '1px solid #e8e5df',
    transition: 'all 0.15s',
  },
  body: { padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#f4f2ee' },
  modeRow: {
    display: 'flex', gap: '8px', marginBottom: '20px',
    background: '#faf7f0', padding: '4px', borderRadius: '10px',
    border: '1px solid #e8e5df',
  },
  modeBtn: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    color: '#8e8e93',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  modeBtnActive: {
    background: '#ffffff',
    color: '#d97706',
    boxShadow: '0 2px 6px rgba(28,28,30,0.08)',
    border: '1px solid #fbbf24',
  },
  section: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#1c1c1e' },
  input: {
    padding: '12px 14px',
    border: '1.5px solid #e8e5df',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    background: '#ffffff',
    color: '#1c1c1e',
    fontWeight: 500,
  },
  presetRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  preset: {
    padding: '8px 14px',
    background: '#ffffff',
    border: '1px solid #e8e5df',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    color: '#6e6e73',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  presetActive: {
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    borderColor: '#fbbf24',
    color: '#92400e',
  },
  quickBtn: {
    padding: '8px 12px',
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    color: '#92400e',
    fontFamily: 'inherit',
  },
  hint: { margin: '8px 0 0', fontSize: '12px', color: '#8e8e93', lineHeight: '1.5', fontWeight: 500 },
  quickTimes: {
    marginTop: '14px',
    padding: '12px',
    background: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e8e5df',
  },
  footer: {
    display: 'flex',
    gap: '10px',
    padding: '16px 24px',
    borderTop: '1px solid #e8e5df',
    background: '#faf7f0',
  },
  cancelBtn: {
    flex: 1,
    padding: '11px 20px',
    background: '#ffffff',
    border: '1px solid #e8e5df',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#6e6e73',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  confirmBtn: {
    flex: 2,
    padding: '11px 20px',
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(217,119,6,0.35)',
    fontFamily: 'inherit',
  },
};

// Add spinner animation
if (!document.head.querySelector('style[data-dashboard-spinner]')) {
  const style = document.createElement('style');
  style.setAttribute('data-dashboard-spinner', 'true');
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

export default Dashboard;