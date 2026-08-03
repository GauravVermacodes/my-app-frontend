import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import roomService from '../services/roomService';
import InviteFriendsModal from '../components/InviteFriendsModal';
import { toast } from 'react-toastify';

const THEME = {
  bg: "#f5f0e8",
  cardBg: "#ffffff",
  cardBorder: "#e8ddc9",
  textPrimary: "#1a1a1a",
  textSecondary: "#7a6a55",
  textMuted: "#a89680",
  accent: "#d97706",
  accentDark: "#b45309",
  accentLight: "#f59e0b",
  accentBg: "#fef3e2",
  accentBgSoft: "#fdf6ec",
  success: "#059669",
  successBg: "#ecfdf5",
  warning: "#d97706",
  warningBg: "#fef3c7",
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  menuHover: "#faf5ed",
  gradientStart: "#f59e0b",
  gradientEnd: "#b45309",
};

// SVG Icons
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    play: <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" />,
    back: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    guest: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    screen: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>,
    mic: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>,
    party: <><path d="M5.8 11.3L2 22l10.7-3.79" /><path d="M4 3h.01" /><path d="M22 8h.01" /><path d="M15 2h.01" /><path d="M22 20h.01" /><path d="M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" /><path d="M22 13l-1.99.11c-.86.05-1.51.78-1.44 1.63v0c.05.78-.65 1.51-1.44 1.51h-.32c-.94 0-1.7.76-1.7 1.7v0" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

function CreateRoom() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isSmallMobile = windowWidth < 400;

  const getDefaultTimes = () => {
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 2, 0, 0, 0);

    const toLocalDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const toLocalTime = (d) => {
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    };

    return {
      startDate: toLocalDate(startTime),
      startTime: toLocalTime(startTime),
      endDate: toLocalDate(endTime),
      endTime: toLocalTime(endTime),
    };
  };

  const defaults = getDefaultTimes();

  const [form, setForm] = useState({
    name: '',
    scheduleMode: 'duration',
    duration: 60,
    startDate: defaults.startDate,
    startTime: defaults.startTime,
    endDate: defaults.endDate,
    endTime: defaults.endTime,
    maxParticipants: 20,
    requireApproval: false,
    allowGuestJoin: true,
    participantCanShareScreen: false,
    participantCanUnmuteSelf: true,
    participantCanEnableCameraSelf: true,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Room name is required';

    if (form.scheduleMode === 'duration') {
      if (!form.duration || form.duration < 1) {
        e.duration = 'Duration must be at least 1 min';
      }
    } else {
      if (!form.startDate || !form.startTime) e.startTime = 'Start time required';
      if (!form.endDate || !form.endTime) e.endTime = 'End time required';

      if (form.startDate && form.startTime && form.endDate && form.endTime) {
        const start = new Date(`${form.startDate}T${form.startTime}`);
        const end = new Date(`${form.endDate}T${form.endTime}`);
        const now = new Date();

        if (end <= start) e.endTime = 'End time must be after start time';
        if (end < now) e.endTime = 'End time cannot be in the past';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const calculateDuration = () => {
    if (form.scheduleMode !== 'scheduled') return null;
    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) return null;

    const start = new Date(`${form.startDate}T${form.startTime}`);
    const end = new Date(`${form.endDate}T${form.endTime}`);
    if (end <= start) return null;

    const mins = Math.floor((end - start) / 60000);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (hours > 0) return `${hours}h ${remainingMins}m`;
    return `${mins}m`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        scheduleMode: form.scheduleMode,
        maxParticipants: Number(form.maxParticipants),
        requireApproval: form.requireApproval,
        allowGuestJoin: form.allowGuestJoin,
        participantCanShareScreen: form.participantCanShareScreen,
        participantCanUnmuteSelf: form.participantCanUnmuteSelf,
        participantCanEnableCameraSelf: form.participantCanEnableCameraSelf,
      };

      if (form.scheduleMode === 'duration') {
        payload.duration = Number(form.duration);
      } else {
        payload.scheduledStart = new Date(`${form.startDate}T${form.startTime}`).toISOString();
        payload.scheduledEnd = new Date(`${form.endDate}T${form.endTime}`).toISOString();
      }

      const data = await roomService.createRoom(payload);
      setCreatedRoom(data.room);
      toast.success('Room created successfully!');
      setTimeout(() => setShowInvite(true), 500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(createdRoom.roomCode);
    toast.success('Code copied!');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${createdRoom.roomCode}`);
    toast.success('Link copied!');
  };

  const enterRoom = () => navigate(`/room/${createdRoom._id}`);

  const handleInviteClose = (didSend) => {
    setShowInvite(false);
    if (didSend) setInviteSent(true);
  };

  const formatSchedule = () => {
    if (!createdRoom) return '';
    if (createdRoom.scheduleMode === 'scheduled') {
      const start = new Date(createdRoom.startedAt);
      const end = new Date(createdRoom.endsAt);
      const dateStr = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const startStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const endStr = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${dateStr}, ${startStr} → ${endStr}`;
    }
    return `${createdRoom.duration} minutes`;
  };

  // ══ SUCCESS STATE ══
  if (createdRoom) {
    return (
      <div style={styles(isMobile).page}>
        <style>{globalStyles}</style>

        <div style={styles(isMobile).successCard}>
          {/* Success Icon */}
          <div style={styles(isMobile).successIconWrap}>
            <div style={styles(isMobile).successIconInner}>
              <Icon name="check" size={36} color="#fff" strokeWidth={3} />
            </div>
          </div>

          <h1 style={styles(isMobile).successTitle}>Room Created!</h1>
          <p style={styles(isMobile).successSub}>Your watch party is ready to go</p>

          {/* Schedule Info */}
          <div style={styles(isMobile).scheduleBox}>
            <div style={styles(isMobile).scheduleIconBox}>
              <Icon name={createdRoom.scheduleMode === 'scheduled' ? 'calendar' : 'clock'} size={20} color={THEME.accent} />
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <p style={styles(isMobile).scheduleLabel}>
                {createdRoom.scheduleMode === 'scheduled' ? 'SCHEDULED TIME' : 'DURATION'}
              </p>
              <p style={styles(isMobile).scheduleValue}>{formatSchedule()}</p>
            </div>
          </div>

          {/* Room Name */}
          <div style={styles(isMobile).roomNameBox}>
            <span style={styles(isMobile).sectionLabel}>ROOM NAME</span>
            <p style={styles(isMobile).roomName}>{createdRoom.name}</p>
          </div>

          {/* Meeting Code */}
          <div style={styles(isMobile).codeDisplay}>
            <span style={styles(isMobile).codeLabel}>MEETING CODE</span>
            <div style={styles(isMobile).codeBig}>{createdRoom.roomCode}</div>
            <div style={styles(isMobile).codeActions}>
              <button style={styles(isMobile).codeActionBtn} onClick={copyCode}>
                <Icon name="copy" size={14} />
                Copy Code
              </button>
              <button style={styles(isMobile).codeActionBtn} onClick={copyLink}>
                <Icon name="link" size={14} />
                Copy Link
              </button>
            </div>
          </div>

          {/* Invite Friends Button */}
          <button
            style={{
              ...styles(isMobile).primaryBtn,
              ...(inviteSent ? { background: `linear-gradient(135deg, ${THEME.success}, #047857)` } : {}),
            }}
            onClick={() => setShowInvite(true)}
          >
            <Icon name="users" size={18} color="white" />
            {inviteSent ? 'Invited! Invite More?' : 'Invite Friends Now'}
          </button>

          {inviteSent && (
            <div style={styles(isMobile).sentMsg}>
              <Icon name="check" size={14} color={THEME.success} />
              Notifications sent! Friends will see them instantly.
            </div>
          )}

          <button style={styles(isMobile).secondaryBtn} onClick={enterRoom}>
            <Icon name="play" size={16} />
            Enter Meeting Room
          </button>

          <button style={styles(isMobile).linkBtn} onClick={() => navigate('/dashboard')}>
            <Icon name="back" size={14} />
            Back to Dashboard
          </button>
        </div>

        <InviteFriendsModal
          isOpen={showInvite}
          onClose={() => handleInviteClose(false)}
          onInviteSent={() => handleInviteClose(true)}
          roomId={createdRoom._id}
          roomName={createdRoom.name}
          roomCode={createdRoom.roomCode}
        />
      </div>
    );
  }

  // ══ CREATE FORM ══
  return (
    <div style={styles(isMobile).page}>
      <style>{globalStyles}</style>

      <div style={styles(isMobile).container}>
        {/* Header */}
        <div style={styles(isMobile).pageHeader}>
          <div style={styles(isMobile).headerIconBox}>
            <Icon name="video" size={24} color={THEME.accent} />
          </div>
          <div>
            <h1 style={styles(isMobile).pageTitle}>Create Watch Room</h1>
            <p style={styles(isMobile).pageSubtitle}>Set up your live watch party in seconds</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles(isMobile).form}>
          {/* Room Name */}
          <div style={styles(isMobile).field}>
            <label style={styles(isMobile).label}>
              Room Name <span style={styles(isMobile).required}>*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Movie Night with Friends"
              maxLength={50}
              style={{ ...styles(isMobile).input, ...(errors.name ? styles(isMobile).inputErr : {}) }}
            />
            {errors.name && <span style={styles(isMobile).errMsg}>{errors.name}</span>}
          </div>

          {/* Schedule Mode */}
          <div style={styles(isMobile).field}>
            <label style={styles(isMobile).label}>Timing Mode</label>
            <div style={styles(isMobile).modeSelector}>
              <ModeCard
                iconName="clock"
                title="Duration"
                desc="Start now for X minutes"
                isActive={form.scheduleMode === 'duration'}
                onClick={() => setForm(prev => ({ ...prev, scheduleMode: 'duration' }))}
              />
              <ModeCard
                iconName="calendar"
                title="Scheduled"
                desc="Set specific times"
                isActive={form.scheduleMode === 'scheduled'}
                onClick={() => setForm(prev => ({ ...prev, scheduleMode: 'scheduled' }))}
              />
            </div>
          </div>

          {/* Duration Mode */}
          {form.scheduleMode === 'duration' && (
            <div style={styles(isMobile).row2}>
              <div style={styles(isMobile).field}>
                <label style={styles(isMobile).label}>
                  Duration (min) <span style={styles(isMobile).required}>*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  min="1"
                  max="480"
                  style={{ ...styles(isMobile).input, ...(errors.duration ? styles(isMobile).inputErr : {}) }}
                />
                {errors.duration && <span style={styles(isMobile).errMsg}>{errors.duration}</span>}
                <span style={styles(isMobile).hint}>Starts immediately</span>
              </div>
              <div style={styles(isMobile).field}>
                <label style={styles(isMobile).label}>Max Participants</label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={form.maxParticipants}
                  onChange={handleChange}
                  min="2"
                  max="75"
                  style={styles(isMobile).input}
                />
                <span style={styles(isMobile).hint}>Recommended: 20</span>
              </div>
            </div>
          )}

          {/* Scheduled Mode */}
          {form.scheduleMode === 'scheduled' && (
            <>
              <div style={styles(isMobile).scheduledBox}>
                <div style={styles(isMobile).scheduledHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="calendar" size={16} color={THEME.accent} />
                    <span>Schedule Meeting</span>
                  </div>
                  {calculateDuration() && (
                    <span style={styles(isMobile).durationChip}>
                      {calculateDuration()}
                    </span>
                  )}
                </div>

                <div style={styles(isMobile).scheduleRow}>
                  <label style={styles(isMobile).scheduleRowLabel}>
                    <span style={styles(isMobile).dotGreen}></span>
                    Start
                  </label>
                  <div style={styles(isMobile).scheduleInputs}>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ ...styles(isMobile).input, ...(errors.startTime ? styles(isMobile).inputErr : {}) }}
                    />
                    <input
                      type="time"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleChange}
                      style={{ ...styles(isMobile).input, ...(errors.startTime ? styles(isMobile).inputErr : {}) }}
                    />
                  </div>
                </div>

                <div style={styles(isMobile).scheduleRow}>
                  <label style={styles(isMobile).scheduleRowLabel}>
                    <span style={styles(isMobile).dotRed}></span>
                    End
                  </label>
                  <div style={styles(isMobile).scheduleInputs}>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      min={form.startDate}
                      style={{ ...styles(isMobile).input, ...(errors.endTime ? styles(isMobile).inputErr : {}) }}
                    />
                    <input
                      type="time"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleChange}
                      style={{ ...styles(isMobile).input, ...(errors.endTime ? styles(isMobile).inputErr : {}) }}
                    />
                  </div>
                </div>

                {errors.startTime && <span style={styles(isMobile).errMsg}>{errors.startTime}</span>}
                {errors.endTime && <span style={styles(isMobile).errMsg}>{errors.endTime}</span>}

                <div style={styles(isMobile).scheduleInfo}>
                  <Icon name="clock" size={14} color="#92400e" />
                  Room will auto-close at end time
                </div>
              </div>

              <div style={styles(isMobile).field}>
                <label style={styles(isMobile).label}>Max Participants</label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={form.maxParticipants}
                  onChange={handleChange}
                  min="2"
                  max="75"
                  style={styles(isMobile).input}
                />
                <span style={styles(isMobile).hint}>Recommended: 20</span>
              </div>
            </>
          )}

          {/* Settings */}
          <div style={styles(isMobile).settingsBox}>
            <div style={styles(isMobile).settingsHeader}>
              <Icon name="settings" size={16} color={THEME.textPrimary} />
              <h3 style={styles(isMobile).settingsTitle}>Room Settings</h3>
            </div>
            <div style={styles(isMobile).checkGrid}>
              {[
                { name: 'requireApproval', iconName: 'lock', label: 'Require approval for non-friends' },
                { name: 'allowGuestJoin', iconName: 'guest', label: 'Allow guests to join' },
                { name: 'participantCanShareScreen', iconName: 'screen', label: 'Participants can share screen' },
                { name: 'participantCanUnmuteSelf', iconName: 'mic', label: 'Participants can unmute themselves' },
                { name: 'participantCanEnableCameraSelf', iconName: 'camera', label: 'Participants can enable camera' },
              ].map(({ name, iconName, label }) => (
                <SettingToggle
                  key={name}
                  name={name}
                  iconName={iconName}
                  label={label}
                  checked={form[name]}
                  onChange={handleChange}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{ ...styles(isMobile).submitBtn, ...(loading ? styles(isMobile).disabledBtn : {}) }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div style={styles(isMobile).spinnerSmall} />
                Creating Room...
              </>
            ) : (
              <>
                <Icon name="video" size={18} color="white" />
                Create Room & Invite Friends
              </>
            )}
          </button>

          <button
            type="button"
            style={styles(isMobile).cancelBtn}
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

// ============ MODE CARD ============
const ModeCard = ({ iconName, title, desc, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="mode-card"
    style={{
      padding: '16px 14px',
      borderRadius: 12,
      background: isActive ? THEME.accentBg : THEME.cardBg,
      border: `2px solid ${isActive ? THEME.accent : THEME.cardBorder}`,
      color: THEME.textPrimary,
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s',
      fontFamily: 'inherit',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxShadow: isActive ? '0 4px 12px rgba(217,119,6,0.2)' : 'none',
    }}
  >
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: isActive ? THEME.accent : THEME.menuHover,
        color: isActive ? 'white' : THEME.textSecondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
      }}
    >
      <Icon name={iconName} size={18} />
    </div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: THEME.textPrimary }}>
        {title}
      </div>
      <div style={{ fontSize: 11, color: THEME.textSecondary, fontWeight: 500 }}>
        {desc}
      </div>
    </div>
  </button>
);

// ============ SETTING TOGGLE ============
const SettingToggle = ({ name, iconName, label, checked, onChange }) => (
  <label
    className="setting-toggle"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      borderRadius: 8,
      cursor: 'pointer',
      background: checked ? THEME.accentBg : 'transparent',
      transition: 'background 0.15s',
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: checked ? THEME.accent : THEME.cardBg,
        color: checked ? 'white' : THEME.textSecondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${checked ? THEME.accent : THEME.cardBorder}`,
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <Icon name={iconName} size={15} />
    </div>
    <span style={{ flex: 1, fontSize: 13, color: THEME.textPrimary, fontWeight: 500 }}>
      {label}
    </span>
    {/* Toggle switch */}
    <div
      style={{
        position: 'relative',
        width: 36,
        height: 20,
        background: checked ? THEME.accent : '#d4c5ac',
        borderRadius: 20,
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          background: 'white',
          borderRadius: '50%',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}
      />
    </div>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      style={{ display: 'none' }}
    />
  </label>
);

// ============ STYLES ============
const styles = (isMobile) => ({
  page: {
    minHeight: 'calc(100vh - 60px)',
    background: THEME.bg,
    padding: isMobile ? '16px 12px' : '32px 20px',
    display: 'flex',
    justifyContent: 'center',
    color: THEME.textPrimary,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  container: { width: '100%', maxWidth: 640 },

  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: THEME.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: `1px solid ${THEME.cardBorder}`,
  },
  pageTitle: {
    margin: 0,
    fontSize: isMobile ? 22 : 26,
    fontWeight: 700,
    color: THEME.textPrimary,
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    margin: '4px 0 0',
    color: THEME.textSecondary,
    fontSize: isMobile ? 13 : 14,
  },

  form: {
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 16,
    padding: isMobile ? 20 : 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    boxShadow: '0 2px 8px rgba(180, 120, 40, 0.06)',
  },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  row2: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: 16,
  },
  label: {
    fontSize: 13,
    color: THEME.textPrimary,
    fontWeight: 600,
    display: 'flex',
    gap: 4,
    letterSpacing: '-0.01em',
  },
  required: { color: THEME.danger },
  hint: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 2,
  },
  input: {
    padding: '11px 14px',
    background: THEME.accentBgSoft,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 10,
    color: THEME.textPrimary,
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  inputErr: {
    borderColor: THEME.danger,
    background: THEME.dangerBg,
  },
  errMsg: {
    color: THEME.danger,
    fontSize: 12,
    fontWeight: 500,
  },

  modeSelector: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },

  scheduledBox: {
    background: THEME.accentBg,
    border: `1px solid #f5d5a0`,
    borderRadius: 14,
    padding: isMobile ? 14 : 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  scheduledHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 14,
    color: THEME.accentDark,
    fontWeight: 600,
    flexWrap: 'wrap',
    gap: 8,
  },
  durationChip: {
    padding: '4px 10px',
    background: THEME.successBg,
    color: THEME.success,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    border: '1px solid #a7f3d0',
  },
  scheduleRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  scheduleRowLabel: {
    fontSize: 12,
    color: THEME.textPrimary,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: THEME.success,
    display: 'inline-block',
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: THEME.danger,
    display: 'inline-block',
  },
  scheduleInputs: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr',
    gap: 8,
  },
  scheduleInfo: {
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: THEME.warningBg,
    border: '1px solid #fcd34d',
    borderRadius: 8,
    color: '#92400e',
    fontSize: 12,
    fontWeight: 500,
  },

  settingsBox: {
    background: THEME.accentBgSoft,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 14,
    padding: isMobile ? 14 : 18,
  },
  settingsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  settingsTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: THEME.textPrimary,
    letterSpacing: '-0.01em',
  },
  checkGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },

  submitBtn: {
    padding: '14px',
    background: `linear-gradient(135deg, ${THEME.accentLight}, ${THEME.accentDark})`,
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(217,119,6,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontFamily: 'inherit',
    transition: 'transform 0.15s',
  },
  disabledBtn: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  cancelBtn: {
    padding: 12,
    background: 'transparent',
    border: 'none',
    color: THEME.textMuted,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
  },
  spinnerSmall: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  // ═══ Success State ═══
  successCard: {
    width: '100%',
    maxWidth: 480,
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 20,
    padding: isMobile ? '32px 20px' : '40px 32px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(180, 120, 40, 0.1)',
  },
  successIconWrap: {
    width: 88,
    height: 88,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${THEME.success}22, ${THEME.accent}22)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    padding: 6,
  },
  successIconInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${THEME.success}, #047857)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(5,150,105,0.35)',
  },
  successTitle: {
    margin: '0 0 8px',
    fontSize: isMobile ? 24 : 28,
    fontWeight: 700,
    color: THEME.textPrimary,
    letterSpacing: '-0.02em',
  },
  successSub: {
    color: THEME.textSecondary,
    fontSize: 15,
    marginBottom: 24,
  },

  scheduleBox: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    padding: '14px 16px',
    background: THEME.accentBg,
    border: `1px solid #f5d5a0`,
    borderRadius: 12,
    marginBottom: 16,
  },
  scheduleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: `1px solid ${THEME.cardBorder}`,
  },
  scheduleLabel: {
    margin: 0,
    fontSize: 10,
    color: THEME.textSecondary,
    letterSpacing: 1,
    fontWeight: 700,
  },
  scheduleValue: {
    margin: '4px 0 0',
    fontSize: isMobile ? 13 : 15,
    fontWeight: 600,
    color: THEME.accentDark,
    wordBreak: 'break-word',
  },

  roomNameBox: {
    background: THEME.accentBgSoft,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    textAlign: 'left',
  },
  sectionLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    letterSpacing: 1,
    fontWeight: 700,
  },
  roomName: {
    margin: '4px 0 0',
    fontSize: 16,
    fontWeight: 600,
    color: THEME.textPrimary,
    wordBreak: 'break-word',
  },

  codeDisplay: {
    background: `linear-gradient(135deg, ${THEME.accentBg}, #fde9c9)`,
    border: '1px solid #f5d5a0',
    borderRadius: 14,
    padding: isMobile ? 18 : 22,
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 11,
    color: THEME.accentDark,
    display: 'block',
    marginBottom: 10,
    letterSpacing: 1,
    fontWeight: 700,
  },
  codeBig: {
    fontSize: isMobile ? 28 : 36,
    fontWeight: 800,
    fontFamily: "'SF Mono', 'Monaco', 'Courier New', monospace",
    letterSpacing: isMobile ? 4 : 6,
    color: THEME.textPrimary,
    marginBottom: 14,
    wordBreak: 'break-all',
  },
  codeActions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  codeActionBtn: {
    padding: '8px 14px',
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 8,
    color: THEME.textPrimary,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },

  primaryBtn: {
    width: '100%',
    padding: 14,
    background: `linear-gradient(135deg, ${THEME.accentLight}, ${THEME.accentDark})`,
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 12,
    boxShadow: '0 4px 14px rgba(217,119,6,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'inherit',
    transition: 'transform 0.15s',
  },
  sentMsg: {
    color: THEME.success,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 16,
    padding: '10px 14px',
    background: THEME.successBg,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: '1px solid #a7f3d0',
  },
  secondaryBtn: {
    width: '100%',
    padding: 14,
    background: THEME.accentBgSoft,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 12,
    color: THEME.textPrimary,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  linkBtn: {
    background: 'transparent',
    border: 'none',
    color: THEME.textMuted,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    margin: '0 auto',
    fontWeight: 500,
  },
});

const globalStyles = `
  * { -webkit-tap-highlight-color: transparent; }
  @keyframes spin { to { transform: rotate(360deg); } }

  input:focus, select:focus {
    border-color: ${THEME.accent} !important;
    box-shadow: 0 0 0 3px ${THEME.accentBg};
    background: #ffffff !important;
  }

  @media (hover: hover) {
    .mode-card:hover {
      border-color: ${THEME.accent} !important;
      transform: translateY(-1px);
    }
    .setting-toggle:hover {
      background: ${THEME.menuHover} !important;
    }
    button:hover {
      opacity: 0.95;
    }
  }
  button:active { transform: scale(0.98); }
`;

export default CreateRoom;