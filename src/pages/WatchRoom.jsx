/*
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../App';

import ParticipantsPanel from '../components/ParticipantsPanel';
import WaitingRoomPanel from '../components/WaitingRoomPanel';
import RoomTimer from '../components/RoomTimer';
import VideoCall from '../components/VideoCall';
import InviteFriendsModal from '../components/InviteFriendsModal';
import WatchListPanel from '../components/WatchListPanel';
import { API, SOCKET_URL } from '../config';

function WatchRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
   // ✅ FIXED: Get user from context, token from localStorage
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  const [room, setRoom]                 = useState(null);
  const [participants, setParticipants] = useState([]);
  const [waitingList, setWaitingList]   = useState([]);
  const [myParticipantId, setMyParticipantId] = useState(null);
  const [endsAt, setEndsAt]             = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [loading, setLoading]           = useState(true);

  const [activeTab, setActiveTab]         = useState('people');
  const [showHostPanel, setShowHostPanel] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showInviteModal, setShowInviteModal]   = useState(false);
  const [showSidebar, setShowSidebar]           = useState(true);

  const roomSocketRef      = useRef(null);
  const isExplicitLeaveRef = useRef(false);
  const [roomSocketState, setRoomSocketState] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };
  const isHost  = room && (
    room.host?._id === user?._id || room.host === user?._id
  );

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @keyframes fadeInScale {
        from { opacity:0; transform:scale(0.92); }
        to   { opacity:1; transform:scale(1); }
      }
      @keyframes softPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      body { background: #fafafa; }
    `;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  useEffect(() => {
  if (!token) { navigate('/login'); return; }
  
  // Validate roomId format
  if (!roomId || !/^[0-9a-f]{24}$/i.test(roomId)) {
    console.error("Invalid room ID:", roomId);
    toast.error('Invalid room link');
    navigate('/dashboard');
    return;
  }
  
  const load = async () => {
    try {
      console.log("🔍 Loading room:", roomId);
      
      const res = await axios.get(
        `${API}/rooms/${roomId}`,
        { headers }
      );
      
      console.log("✅ Full response:", res.data);
      
      // ✅ FIXED: Use res.data (not joinRes.data)
      const roomData = res.data?.room || res.data;
      
      if (!roomData || !roomData._id) {
        console.error("❌ Invalid room data:", res.data);
        toast.error('Invalid room data from server');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }
      
      console.log("✅ Room data:", roomData);
      
      // Safe defaults
      const participants = roomData.participants || [];
      const endsAtValue = roomData.endsAt || null;
      const myPartId = participants.find(
        p => p?.user?._id === user?._id
      )?._id || null;
      
      setRoom(roomData);
      setParticipants(participants);
      setEndsAt(endsAtValue);
      setMyParticipantId(myPartId);
      
    } catch (err) {
      console.error("❌ Load error:", err);
      console.error("   Status:", err.response?.status);
      console.error("   Message:", err.response?.data?.message);
      console.error("   Full error:", err.response?.data);
      
      // If not a participant (403), try to join first
      if (err.response?.status === 403) {
        console.log("⚠️ Not a participant, attempting to join...");
        try {
          const joinRes = await axios.post(
            `${API}/rooms/join/${roomId}`,
            { micOn: false, cameraOn: false },
            { headers }
          );
          
          console.log("✅ Joined:", joinRes.data);
          
          // ✅ FIXED: Use joinRes.data (not res.data)
          const roomData = joinRes.data?.room || joinRes.data;
          
          if (!roomData || !roomData._id) {
            toast.error('Failed to join room');
            setTimeout(() => navigate('/dashboard'), 2000);
            return;
          }
          
          const participants = roomData.participants || [];
          setRoom(roomData);
          setParticipants(participants);
          setEndsAt(roomData.endsAt || null);
          setMyParticipantId(
            participants.find(p => p?.user?._id === user?._id)?._id || null
          );
        } catch (joinErr) {
          console.error("❌ Join error:", joinErr);
          toast.error(joinErr.response?.data?.message || 'Failed to join room');
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } else {
        toast.error(err.response?.data?.message || 'Failed to load room');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };
  
  load();
}, [roomId, token]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isExplicitLeaveRef.current && !sessionEnded && room) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave the meeting?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionEnded, room]);

  useEffect(() => {
    if (!endsAt || sessionEnded) return;
    const check = () => {
      if (new Date() > new Date(endsAt)) setSessionEnded(true);
    };
    check();
    const iv = setInterval(check, 1000);
    return () => clearInterval(iv);
  }, [endsAt, sessionEnded]);

  useEffect(() => {
    if (!room || sessionEnded) return;
    window.history.pushState({ inRoom: true }, '', window.location.href);
    window.history.pushState({ inRoom: true }, '', window.location.href);
    window.history.pushState({ inRoom: true }, '', window.location.href);

    const handlePopState = () => {
      if (isExplicitLeaveRef.current || sessionEnded) return;
      window.history.pushState({ inRoom: true }, '', window.location.href);
      setShowLeaveConfirm(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [room, sessionEnded]);

  useEffect(() => {
    if (!room || !token) return;

    const roomSocket = io(`${SOCKET_URL}/room`, {
      auth: { token }, reconnection: true,
    });

    roomSocket.on('connect', () => roomSocket.emit('joinRoom', { roomId }));

    roomSocket.on('roomState', (data) => {
      setEndsAt(data.endsAt);
      setMyParticipantId(data.myParticipantId);
    });

    roomSocket.on('participantsList', (data) => {
      setParticipants(data.participants || []);
    });

    roomSocket.on('participantJoined', (data) => {
      setParticipants(data.participants || []);
      if (data.message) toast.info(data.message);
    });

    roomSocket.on('participantLeft', (data) => {
      setParticipants(data.participants || []);
    });

    roomSocket.on('participantDisconnected', (data) => {
      setParticipants(data.participants || []);
    });

    roomSocket.on('participantRemoved', (data) => {
      setParticipants(data.participants || []);
      toast.info(`${data.removedUsername} was removed`);
    });

    roomSocket.on('participantMuteChanged', (data) => {
      setParticipants(prev => prev.map(p =>
        p._id === data.participantId ? { ...p, isMuted: data.isMuted } : p
      ));
      if (data.participantId === myParticipantId && data.byHost) {
        toast.info(data.isMuted ? '🔇 Host muted you' : '🔊 Host unmuted you');
      }
    });

    roomSocket.on('participantCameraChanged', (data) => {
      setParticipants(prev => prev.map(p =>
        p._id === data.participantId ? { ...p, isCameraOn: data.isCameraOn } : p
      ));
      if (data.participantId === myParticipantId && data.byHost) {
        toast.info(data.isCameraOn
          ? '📹 Host enabled your camera'
          : '📷 Host disabled your camera');
      }
    });

    roomSocket.on('newJoinRequest', (data) => {
      toast.info(data.message || 'Someone wants to join');
      setWaitingList(prev => [...prev, data.participant]);
    });

    roomSocket.on('waitingListUpdated', (data) => {
      setWaitingList(data.waiting || []);
    });

    roomSocket.on('participantNotification', (data) => {
      toast.info(data.message);
    });

    roomSocket.on('kicked', (data) => {
      toast.error(data.message);
      isExplicitLeaveRef.current = true;
      setTimeout(() => navigate('/dashboard'), 1500);
    });

    roomSocket.on('sessionEnded', (data) => {
      toast.warning(data.message);
      setSessionEnded(true);
    });

    roomSocket.on('sessionExpired', (data) => {
      toast.warning(data.message);
      setSessionEnded(true);
    });

    roomSocket.on('roomClosed', (data) => {
      toast.error(data.message);
      isExplicitLeaveRef.current = true;
      setTimeout(() => navigate('/dashboard'), 1500);
    });

    roomSocket.on('durationExtended', (data) => {
      setEndsAt(data.endsAt);
      setSessionEnded(false);
      toast.success(`⏰ Extended by ${data.extraMinutes} min`);
    });

    roomSocket.on('error', (data) => {
      toast.error(data.message);
    });

    roomSocketRef.current = roomSocket;
    setRoomSocketState(roomSocket);

    return () => {
      roomSocket.emit('leaveRoom', {
        roomId,
        isExplicitLeave: isExplicitLeaveRef.current,
      });
      roomSocket.disconnect();
    };
  }, [room, token, roomId]);

  const approveWaiting = (pid) =>
    roomSocketRef.current?.emit('approveParticipant', { roomId, participantId: pid });

  const rejectWaiting = (pid) =>
    roomSocketRef.current?.emit('rejectParticipant', { roomId, participantId: pid });

  const hostMute = (pid, mute) =>
    roomSocketRef.current?.emit('hostMuteParticipant', {
      roomId, participantId: pid, mute,
    });

  const hostToggleCam = (pid, enabled) =>
    roomSocketRef.current?.emit('hostToggleCamera', {
      roomId, participantId: pid, enabled,
    });

  const removeParticipant = (pid) => {
    if (!window.confirm('Remove this participant?')) return;
    roomSocketRef.current?.emit('removeParticipant', { roomId, participantId: pid });
  };

  const endSessionHost = () => {
    if (!window.confirm('End session for everyone?')) return;
    roomSocketRef.current?.emit('endSession', { roomId });
    isExplicitLeaveRef.current = true;
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  const closeRoomHost = () => {
    if (!window.confirm('Close room permanently?')) return;
    roomSocketRef.current?.emit('closeRoom', { roomId });
    isExplicitLeaveRef.current = true;
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  const extendDuration = (min) =>
    roomSocketRef.current?.emit('extendDuration', { roomId, extraMinutes: min });

  const leaveRoom    = () => setShowLeaveConfirm(true);
  const confirmLeave = () => {
    isExplicitLeaveRef.current = true;
    setShowLeaveConfirm(false);
    navigate('/dashboard');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    toast.success('Code copied!');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/join/${room.roomCode}`
    );
    toast.success('Link copied!');
  };

  const handleJitsiLeave = useCallback(() => {
    isExplicitLeaveRef.current = true;
    navigate('/dashboard');
  }, [navigate]);

  if (loading) return <div style={s.loading}>Loading meeting...</div>;
  if (!room)   return null;

  return (
    <div style={s.page}>

      {sessionEnded && (
        <SessionEndedOverlay
          isHost={isHost}
          onExtend={extendDuration}
          onDashboard={() => {
            isExplicitLeaveRef.current = true;
            navigate('/dashboard');
          }}
        />
      )}

      {showLeaveConfirm && (
        <LeaveConfirmModal
          isHost={isHost}
          onConfirm={confirmLeave}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}

      <header style={s.header}>
        <div style={s.headerLeft}>
          <h1 style={s.title}>{room.name}</h1>
          <div style={s.meta}>
            {isHost && <span style={s.hostBadge}>🔥 HOST</span>}
            <span style={s.pill}>
              <span style={s.pillIcon}>👥</span> {participants.length}
            </span>
            <span style={s.pill}>
              <span style={s.pillIcon}>🔑</span>
              <span style={s.code}>{room.roomCode}</span>
            </span>
            {endsAt && !sessionEnded && (
              <span style={s.timerPill}>
                <span style={s.pillIcon}>⏱</span>
                <RoomTimer endsAt={endsAt} />
              </span>
            )}
            {sessionEnded && <span style={s.endedBadge}>⏰ Session Ended</span>}
          </div>
        </div>

        <div style={s.headerActions}>
          {isHost && waitingList.length > 0 && (
            <button
              style={s.btnWarning}
              onClick={() => { setActiveTab('waiting'); setShowSidebar(true); }}
            >
              🔔 {waitingList.length} waiting
            </button>
          )}

          <button style={s.btnGhost} onClick={copyCode}>
            <span>📋</span> Code
          </button>
          <button style={s.btnGhost} onClick={copyLink}>
            <span>🔗</span> Link
          </button>

          {isHost && room?.isActive && (
            <button
              style={s.btnGhost}
              onClick={() => setShowInviteModal(true)}
            >
              <span>👥</span> Invite
            </button>
          )}

          {isHost && (
            <button style={s.btnGhost} onClick={() => setShowHostPanel(true)}>
              <span>⚙️</span> Host
            </button>
          )}

          <button
            style={s.btnIcon}
            onClick={() => setShowSidebar(v => !v)}
            title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            {showSidebar ? '▶' : '◀'}
          </button>

          <button style={s.btnLeave} onClick={leaveRoom}>
            <span>🚪</span> Leave
          </button>
        </div>
      </header>

      <div style={s.body}>

        <div style={s.content}>
          <div style={s.videoWrap}>
            <VideoCall
              roomId={roomId}
              user={user}
              isHost={isHost}
              onLeave={handleJitsiLeave}
            />
          </div>
        </div>

        {showSidebar && (
          <aside style={s.sidebar}>
            <div style={s.tabs}>
              <button
                style={{ ...s.tab, ...(activeTab === 'people' ? s.tabActive : {}) }}
                onClick={() => setActiveTab('people')}
              >
                <span>👥</span> People ({participants.length})
              </button>
              {isHost && (
                <button
                  style={{ ...s.tab, ...(activeTab === 'waiting' ? s.tabActive : {}) }}
                  onClick={() => setActiveTab('waiting')}
                >
                  <span>🚪</span> Waiting
                  {waitingList.length > 0 && ` (${waitingList.length})`}
                </button>
              )}
            </div>

            <div style={s.tabBody}>
              {activeTab === 'people' && (
                <div style={s.panelContent}>
                  <div style={s.panelHeader}>
                    Participants ({participants.length})
                  </div>
                  <ParticipantsPanel
                    participants={participants}
                    isHost={isHost}
                    myParticipantId={myParticipantId}
                    onMute={(pid) => hostMute(pid, true)}
                    onUnmute={(pid) => hostMute(pid, false)}
                    onCameraToggle={hostToggleCam}
                    onRemove={removeParticipant}
                  />
                </div>
              )}
              {activeTab === 'waiting' && isHost && (
                <div style={s.panelContent}>
                  <WaitingRoomPanel
                    waiting={waitingList}
                    onApprove={approveWaiting}
                    onReject={rejectWaiting}
                  />
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {showHostPanel && isHost && (
        <HostControlModal
          onExtend={extendDuration}
          onEndSession={endSessionHost}
          onCloseRoom={closeRoomHost}
          onClose={() => setShowHostPanel(false)}
        />
      )}

      {isHost && showInviteModal && (
        <InviteFriendsModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          roomId={room?._id}
          roomName={room?.name}
          roomCode={room?.roomCode}
        />
      )}
    </div>
  );
}

function LeaveConfirmModal({ isHost, onConfirm, onCancel }) {
  return (
    <div style={m.overlay} onClick={onCancel}>
      <div style={m.modal} onClick={e => e.stopPropagation()}>
        <div style={m.iconWrap}>
          <span style={m.icon}>🚪</span>
        </div>
        <h2 style={m.title}>Leave Meeting?</h2>
        <p style={m.msg}>
          {isHost
            ? 'You are the host. The meeting will continue for others if you leave.'
            : 'You can rejoin anytime using the meeting code.'}
        </p>
        <div style={m.actions}>
          <button style={m.btnStay} onClick={onCancel}>← Stay</button>
          <button style={m.btnLeave} onClick={onConfirm}>🚪 Leave</button>
        </div>
      </div>
    </div>
  );
}

function SessionEndedOverlay({ isHost, onExtend, onDashboard }) {
  const [min, setMin] = useState(30);
  return (
    <div style={s.overlay}>
      <div style={s.overlayCard}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>⏰</div>
        <h2 style={{ margin: '0 0 8px', color: '#1f2937' }}>Session Ended</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          The meeting time has expired.
        </p>
        {isHost ? (
          <div style={s.extendRow}>
            <input
              type="number" value={min} min={1}
              onChange={e => setMin(Number(e.target.value))}
              style={s.extendInput}
            />
            <button style={s.btnGreen} onClick={() => onExtend(min)}>
              ⏰ Extend {min} min
            </button>
          </div>
        ) : (
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
            Waiting for host to extend the session...
          </p>
        )}
        <button style={s.btnGhost} onClick={onDashboard}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

function HostControlModal({ onExtend, onEndSession, onCloseRoom, onClose }) {
  const [custom, setCustom] = useState(45);
  const presets = [15, 30, 60];

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.hcCard} onClick={e => e.stopPropagation()}>

        <div style={s.hcHeader}>
          <div style={s.hcHeadLeft}>
            <div style={s.hcHeadIcon}>⚙️</div>
            <div>
              <h2 style={s.hcTitle}>Host Controls</h2>
              <p style={s.hcSub}>Manage your meeting session</p>
            </div>
          </div>
          <button style={s.hcClose} onClick={onClose}>×</button>
        </div>

        <div style={s.hcBody}>

          <div style={s.hcSection}>
            <div style={s.hcSecHead}>
              <span style={s.hcSecIcon}>⏰</span>
              <span style={s.hcSecTitle}>Extend Meeting</span>
            </div>
            <p style={s.hcSecDesc}>Add extra time to the current session</p>

            <div style={s.hcPresetRow}>
              {presets.map(p => (
                <button
                  key={p}
                  style={s.hcPreset}
                  onClick={() => onExtend(p)}
                >
                  +{p}<span style={s.hcPresetUnit}>min</span>
                </button>
              ))}
            </div>

            <div style={s.hcCustomRow}>
              <div style={s.hcInputWrap}>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={custom}
                  onChange={e => setCustom(Number(e.target.value))}
                  style={s.hcInput}
                />
                <span style={s.hcUnit}>min</span>
              </div>
              <button style={s.hcBtnGreen} onClick={() => onExtend(custom)}>
                Extend Session
              </button>
            </div>
          </div>

          <div style={s.hcDanger}>
            <div style={s.hcSecHead}>
              <span style={s.hcSecIcon}>⚠️</span>
              <span style={{ ...s.hcSecTitle, color: '#b91c1c' }}>Danger Zone</span>
            </div>
            <p style={s.hcSecDesc}>These actions affect all participants</p>

            <div style={s.hcDangerItem}>
              <div style={s.hcDangerText}>
                <strong style={s.hcDangerLabel}>End Session</strong>
                <span style={s.hcDangerHint}>
                  Stops the meeting — room stays available to rejoin.
                </span>
              </div>
              <button style={s.hcBtnAmber} onClick={onEndSession}>
                ⏸ End
              </button>
            </div>

            <div style={s.hcDivider} />

            <div style={s.hcDangerItem}>
              <div style={s.hcDangerText}>
                <strong style={s.hcDangerLabel}>Close Room</strong>
                <span style={s.hcDangerHint}>
                  Permanently closes the room and blocks re-entry.
                </span>
              </div>
              <button style={s.hcBtnRed} onClick={onCloseRoom}>
                🔒 Close
              </button>
            </div>
          </div>
        </div>

        <div style={s.hcFooter}>
          <button style={s.btnGhost} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const m = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 10000, animation: 'fadeInScale 0.2s ease',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '20px', padding: '36px',
    maxWidth: '440px', width: '90%', textAlign: 'center',
    border: '1px solid #e5e7eb',
    boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
    animation: 'fadeInScale 0.25s ease',
  },
  iconWrap: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#fca5a5,#f87171)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '36px', margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(248,113,113,0.3)',
  },
  icon: { lineHeight: 1 },
  title: { margin: '0 0 12px', fontSize: '24px', fontWeight: '700', color: '#1f2937' },
  msg: { color: '#6b7280', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' },
  actions: { display: 'flex', gap: '12px' },
  btnStay: {
    flex: 1, padding: '14px',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '10px', color: '#374151',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
  },
  btnLeave: {
    flex: 1, padding: '14px',
    background: 'linear-gradient(135deg,#f87171,#ef4444)',
    border: 'none', borderRadius: '10px', color: '#fff',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
  },
};

const s = {
  page: {
    height: '100vh',
    background: '#fafafa',
    color: '#1f2937',
    display: 'flex', flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  loading: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#fafafa', color: '#6b7280', fontSize: '18px',
  },

  // Header - clean white
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 24px',
    background: '#ffffff',
    borderBottom: '1px solid #f0f0f0',
    flexWrap: 'wrap', gap: '12px', flexShrink: 0,
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '6px' },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.01em',
  },
  meta: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '4px 10px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#4b5563',
    fontWeight: '500',
  },
    timerPill: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '5px 12px',
    background: 'linear-gradient(135deg, #fee2e2, #fecaca)',    // ⬅️ soft gradient
    border: '1px solid #f87171',                                // ⬅️ stronger red border
    borderRadius: '20px',
    fontSize: '13px',                                           // ⬅️ slightly bigger
    color: '#b91c1c',                                           // ⬅️ deeper red for contrast
    fontWeight: '700',                                          // ⬅️ bolder
    fontVariantNumeric: 'tabular-nums',                         // ⬅️ aligned digits
    letterSpacing: '0.02em',
    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  pillIcon: { fontSize: '12px', lineHeight: 1 },   // ⬅️ was '11px'
  code: { fontFamily: 'ui-monospace, monospace', fontWeight: '600', color: '#6366f1' },
  hostBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    background: '#fff7ed',
    color: '#ea580c',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid #fed7aa',
    letterSpacing: '0.02em',
  },
  endedBadge: {
    color: '#ea580c', fontSize: '13px', fontWeight: '600',
    padding: '4px 10px', background: '#fff7ed', borderRadius: '20px',
    border: '1px solid #fed7aa',
  },
  headerActions: {
    display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap',
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    background: '#ffffff',
    color: '#1f2937',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.15s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',  // ⬅️ subtle shadow
  },
  btnIcon: {
    padding: '8px 12px',
    borderRadius: '10px',
    background: '#ffffff',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',

  },
  btnWarning: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    color: '#ffffff',
    border: '1px solid #fde68a',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
    animation: 'softPulse 2s infinite',
  },
  btnLeave: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 18px', borderRadius: '10px',
    background: 'linear-gradient(135deg,#f43f5e,#e11d48)',     // ⬅️ deeper red
    color: '#fff', border: 'none',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
    boxShadow: '0 3px 10px rgba(244,63,94,0.4), 0 1px 3px rgba(0,0,0,0.1)',
  },

  // Body
  body: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, gap: '0' },
  content: {
    flex: 1,
    padding: '16px',
    overflow: 'hidden', minHeight: 0,
    display: 'flex',
  },
  videoWrap: {
    flex: 1,
    background: '#f5f5f5',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #ececec',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },

    // Sidebar - slightly darker off-white
  sidebar: {
    width: '340px', flexShrink: 0,
    background: '#f3f4f6',              // ⬅️ was '#ffffff' (darker gray)
    borderLeft: '1px solid #e5e7eb',    // ⬅️ was '#f0f0f0' (stronger border)
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',  // ⬅️ stronger border
    flexShrink: 0,
    padding: '8px 8px 0',
    gap: '4px',
    background: '#f9fafb',              // ⬅️ ADDED - slightly lighter tab strip
  },
  tab: {
    flex: 1, padding: '10px 8px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    background: 'transparent',
    color: '#6b7280',                   // ⬅️ was '#9ca3af' (darker text)
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    borderBottom: '2px solid transparent',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
  tabBody: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgb(232, 234, 239)',              // ⬅️ ADDED - matches sidebar
  },
  panelContent: {
    padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  panelHeader: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4b5563',                   // ⬅️ was '#6b7280' (darker)
    padding: '4px 4px 8px',
  },

  // Modals
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15, 23, 42, 0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, backdropFilter: 'blur(8px)',
  },
  overlayCard: {
    background: '#ffffff',
    borderRadius: '20px', padding: '40px',
    textAlign: 'center', maxWidth: '440px', width: '90%',
    border: '1px solid #e5e7eb',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  extendRow: {
    display: 'flex', gap: '10px',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: '20px',
  },
  extendInput: {
    width: '80px', padding: '10px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px', color: '#1f2937',
    fontSize: '16px', textAlign: 'center',
    fontFamily: 'inherit',
  },
  modalOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15, 23, 42, 0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)',
  },
  modalCard: {
    background: '#ffffff',
    borderRadius: '16px', padding: '30px',
    maxWidth: '400px', width: '90%',
    border: '1px solid #e5e7eb',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalTitle: {
    margin: '0 0 20px', fontSize: '20px', fontWeight: '700', color: '#1f2937',
  },
  modalActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  btnGreen: {
    padding: '13px 20px', borderRadius: '10px',
    background: 'linear-gradient(135deg,#34d399,#10b981)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontWeight: '600', fontSize: '14px',
    boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
  },
  btnDanger: {
    padding: '13px 20px', borderRadius: '10px',
    background: 'linear-gradient(135deg,#fb7185,#f43f5e)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontWeight: '600', fontSize: '14px',
    boxShadow: '0 2px 8px rgba(244,63,94,0.25)',
  },
    // ══ Host Control Modal ══
  hcCard: {
    background: '#ffffff',
    borderRadius: '20px',
    width: '100%', maxWidth: '460px',
    maxHeight: '88vh',
    display: 'flex', flexDirection: 'column',
    border: '1px solid #e5e7eb',
    boxShadow: '0 25px 70px rgba(0,0,0,0.18)',
    overflow: 'hidden',
    animation: 'fadeInScale 0.22s ease',
  },
  hcHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '18px 22px',
    borderBottom: '1px solid #f0f0f0',
    flexShrink: 0,
  },
  hcHeadLeft: { display: 'flex', alignItems: 'center', gap: '13px' },
  hcHeadIcon: {
    width: '40px', height: '40px', borderRadius: '12px',
    background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
    border: '1px solid #fcd34d',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '19px',
  },
  hcTitle: { margin: 0, fontSize: '17px', fontWeight: '700', color: '#111827' },
  hcSub: { margin: '2px 0 0', fontSize: '12px', color: '#9ca3af', fontWeight: '500' },
  hcClose: {
    width: '32px', height: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f3f4f6', border: '1px solid #e5e7eb',
    borderRadius: '9px', fontSize: '20px', lineHeight: 1,
    color: '#6b7280', cursor: 'pointer', paddingBottom: '2px',
  },

  hcBody: {
    padding: '18px 22px',
    background: '#fafafa',
    overflowY: 'auto', flex: 1,
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  hcSection: {
    background: '#ffffff',
    border: '1px solid #e9eaec',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  hcSecHead: { display: 'flex', alignItems: 'center', gap: '8px' },
  hcSecIcon: { fontSize: '15px', lineHeight: 1 },
  hcSecTitle: { fontSize: '14px', fontWeight: '700', color: '#1f2937' },
  hcSecDesc: {
    margin: '6px 0 14px', fontSize: '12.5px',
    color: '#9ca3af', lineHeight: '1.5',
  },

  hcPresetRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  hcPreset: {
    flex: 1,
    padding: '11px 8px', borderRadius: '11px',
    background: '#f0fdf4',
    border: '1.5px solid #bbf7d0',
    color: '#15803d',
    fontSize: '14px', fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'baseline',
    justifyContent: 'center', gap: '3px',
  },
  hcPresetUnit: { fontSize: '10.5px', fontWeight: '600', opacity: 0.75 },

  hcCustomRow: { display: 'flex', gap: '9px', alignItems: 'center' },
  hcInputWrap: {
    display: 'flex', alignItems: 'center',
    background: '#f9fafb', border: '1px solid #e5e7eb',
    borderRadius: '10px', paddingRight: '11px',
  },
  hcInput: {
    width: '62px', padding: '10px 8px',
    background: 'transparent', border: 'none', outline: 'none',
    fontSize: '14px', fontWeight: '700', color: '#1f2937',
    textAlign: 'center', fontFamily: 'inherit',
  },
  hcUnit: { fontSize: '11.5px', color: '#9ca3af', fontWeight: '600' },
  hcBtnGreen: {
    flex: 1, padding: '11px 16px', borderRadius: '10px',
    background: 'linear-gradient(135deg,#34d399,#10b981)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontSize: '13.5px', fontWeight: '600',
    boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
  },

  hcDanger: {
    background: '#fffbfb',
    border: '1px solid #fecaca',
    borderRadius: '14px',
    padding: '16px',
  },
  hcDangerItem: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '14px',
  },
  hcDangerText: { display: 'flex', flexDirection: 'column', gap: '3px' },
  hcDangerLabel: { fontSize: '13px', fontWeight: '700', color: '#374151' },
  hcDangerHint: { fontSize: '11.5px', color: '#9ca3af', lineHeight: '1.45' },
  hcDivider: { height: '1px', background: '#fee2e2', margin: '14px 0' },

  hcBtnAmber: {
    padding: '9px 18px', borderRadius: '10px',
    background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
    boxShadow: '0 2px 6px rgba(245,158,11,0.3)',
  },
  hcBtnRed: {
    padding: '9px 18px', borderRadius: '10px',
    background: 'linear-gradient(135deg,#f43f5e,#e11d48)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
    boxShadow: '0 2px 6px rgba(244,63,94,0.3)',
  },

  hcFooter: {
    padding: '15px 22px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex', justifyContent: 'flex-end',
    background: '#ffffff', flexShrink: 0,
  },
};

export default WatchRoom;

*/

// src/pages/WatchRoom.jsx
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../App';

import ParticipantsPanel from '../components/ParticipantsPanel';
import WaitingRoomPanel from '../components/WaitingRoomPanel';
import RoomTimer from '../components/RoomTimer';
import VideoCall from '../components/VideoCall';
import InviteFriendsModal from '../components/InviteFriendsModal';
import WatchListPanel from '../components/WatchListPanel';

import { API, SOCKET_URL } from '../config';

function WatchRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [myParticipantId, setMyParticipantId] = useState(null);
  const [endsAt, setEndsAt] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('people');
  const [showHostPanel, setShowHostPanel] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const [currentVideo, setCurrentVideo] = useState(null);

  const roomSocketRef = useRef(null);
  const isExplicitLeaveRef = useRef(false);
  const [roomSocketState, setRoomSocketState] = useState(null);

  // ✅ Video sync refs
  const videoRef = useRef(null);
  const isSyncingRef = useRef(false);
  const seekDebounceRef = useRef(null);  // ✅ Debounce seek events

  const headers = { Authorization: `Bearer ${token}` };
  const isHost = room && (
    room.host?._id === user?._id || room.host === user?._id
  );

  // ═══════════════════════════════════════════════════════════
  //  VIDEO SYNC HANDLERS — attached to <video> element
  // ═══════════════════════════════════════════════════════════

  // ✅ Local play → broadcast to all others
  const handleVideoPlay = useCallback(() => {
    if (isSyncingRef.current) return;
    const video = videoRef.current;
    if (!video || !roomSocketRef.current) return;

    console.log('▶ Local play at', video.currentTime);
    roomSocketRef.current.emit('videoPlay', {
      roomId,
      currentTime: video.currentTime,
    });
  }, [roomId]);

  // ✅ Local pause → broadcast to all others
  const handleVideoPause = useCallback(() => {
    if (isSyncingRef.current) return;
    const video = videoRef.current;
    if (!video || !roomSocketRef.current) return;

    // Skip if video ended naturally
    if (video.ended) return;

    console.log('⏸ Local pause at', video.currentTime);
    roomSocketRef.current.emit('videoPause', {
      roomId,
      currentTime: video.currentTime,
    });
  }, [roomId]);

  // ✅ Local seek → broadcast (debounced to avoid spam)
  const handleVideoSeeked = useCallback(() => {
    if (isSyncingRef.current) return;
    const video = videoRef.current;
    if (!video || !roomSocketRef.current) return;

    // Debounce: wait 300ms after last seek before emitting
    if (seekDebounceRef.current) clearTimeout(seekDebounceRef.current);
    seekDebounceRef.current = setTimeout(() => {
      console.log('⏩ Local seek to', video.currentTime);
      roomSocketRef.current.emit('videoSeek', {
        roomId,
        currentTime: video.currentTime,
      });
    }, 300);
  }, [roomId]);

  // ═══════════════════════════════════════════════════════════
  //  STYLES INJECTION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes fadeInScale {
      from { opacity:0; transform:scale(0.92); }
      to   { opacity:1; transform:scale(1); }
    }
    @keyframes softPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    body { background: #f4f2ee; }
  `;
  document.head.appendChild(styleTag);
  return () => document.head.removeChild(styleTag);
}, []);

  // ═══════════════════════════════════════════════════════════
  //  LOAD ROOM
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    if (!roomId || !/^[0-9a-f]{24}$/i.test(roomId)) {
      toast.error('Invalid room link');
      navigate('/dashboard');
      return;
    }

    const load = async () => {
      try {
        const res = await axios.get(`${API}/rooms/${roomId}`, { headers });
        const roomData = res.data?.room || res.data;

        if (!roomData || !roomData._id) {
          toast.error('Invalid room data from server');
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

        const parts = roomData.participants || [];
        setRoom(roomData);
        setParticipants(parts);
        setEndsAt(roomData.endsAt || null);
        setMyParticipantId(
          parts.find(p => p?.user?._id === user?._id)?._id || null
        );

        if (roomData.videoUrl) {
          setCurrentVideo({ title: roomData.name, videoUrl: roomData.videoUrl });
        }
      } catch (err) {
        if (err.response?.status === 403) {
          try {
            const joinRes = await axios.post(
              `${API}/rooms/join/${roomId}`,
              { micOn: false, cameraOn: false },
              { headers }
            );
            const roomData = joinRes.data?.room || joinRes.data;

            if (!roomData || !roomData._id) {
              toast.error('Failed to join room');
              setTimeout(() => navigate('/dashboard'), 2000);
              return;
            }

            const parts = roomData.participants || [];
            setRoom(roomData);
            setParticipants(parts);
            setEndsAt(roomData.endsAt || null);
            setMyParticipantId(
              parts.find(p => p?.user?._id === user?._id)?._id || null
            );

            if (roomData.videoUrl) {
              setCurrentVideo({ title: roomData.name, videoUrl: roomData.videoUrl });
            }
          } catch (joinErr) {
            toast.error(joinErr.response?.data?.message || 'Failed to join room');
            setTimeout(() => navigate('/dashboard'), 2000);
          }
        } else {
          toast.error(err.response?.data?.message || 'Failed to load room');
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [roomId, token]);

  // ═══════════════════════════════════════════════════════════
  //  BROWSER CLOSE WARNING
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isExplicitLeaveRef.current && !sessionEnded && room) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave the meeting?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionEnded, room]);

  // ═══════════════════════════════════════════════════════════
  //  SESSION TIMER
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!endsAt || sessionEnded) return;
    const check = () => {
      if (new Date() > new Date(endsAt)) setSessionEnded(true);
    };
    check();
    const iv = setInterval(check, 1000);
    return () => clearInterval(iv);
  }, [endsAt, sessionEnded]);

  // ═══════════════════════════════════════════════════════════
  //  BACK BUTTON PROTECTION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!room || sessionEnded) return;
    window.history.pushState({ inRoom: true }, '', window.location.href);
    window.history.pushState({ inRoom: true }, '', window.location.href);
    window.history.pushState({ inRoom: true }, '', window.location.href);

    const handlePopState = () => {
      if (isExplicitLeaveRef.current || sessionEnded) return;
      window.history.pushState({ inRoom: true }, '', window.location.href);
      setShowLeaveConfirm(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [room, sessionEnded]);

  // ═══════════════════════════════════════════════════════════
  //  SOCKET CONNECTION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!room || !token) return;

    const roomSocket = io(`${SOCKET_URL}/room`, {
      auth: { token },
      reconnection: true,
    });

    roomSocket.on('connect', () => roomSocket.emit('joinRoom', { roomId }));

    roomSocket.on('roomState', (data) => {
      setEndsAt(data.endsAt);
      setMyParticipantId(data.myParticipantId);
    });

    roomSocket.on('participantsList', (data) => {
      setParticipants(data.participants || []);
    });

    roomSocket.on('participantJoined', (data) => {
      setParticipants(data.participants || []);
      if (data.message) toast.info(data.message);
    });

    roomSocket.on('participantLeft', (data) => {
      setParticipants(data.participants || []);
    });

    roomSocket.on('participantDisconnected', (data) => {
      setParticipants(data.participants || []);
    });

    roomSocket.on('participantRemoved', (data) => {
      setParticipants(data.participants || []);
      toast.info(`${data.removedUsername} was removed`);
    });

    roomSocket.on('participantMuteChanged', (data) => {
      setParticipants(prev => prev.map(p =>
        p._id === data.participantId ? { ...p, isMuted: data.isMuted } : p
      ));
      if (data.participantId === myParticipantId && data.byHost) {
        toast.info(data.isMuted ? '🔇 Host muted you' : '🔊 Host unmuted you');
      }
    });

    roomSocket.on('participantCameraChanged', (data) => {
      setParticipants(prev => prev.map(p =>
        p._id === data.participantId ? { ...p, isCameraOn: data.isCameraOn } : p
      ));
      if (data.participantId === myParticipantId && data.byHost) {
        toast.info(data.isCameraOn
          ? '📹 Host enabled your camera'
          : '📷 Host disabled your camera');
      }
    });

    roomSocket.on('newJoinRequest', (data) => {
      toast.info(data.message || 'Someone wants to join');
      setWaitingList(prev => [...prev, data.participant]);
    });

    roomSocket.on('waitingListUpdated', (data) => {
      setWaitingList(data.waiting || []);
    });

    roomSocket.on('participantNotification', (data) => {
      toast.info(data.message);
    });

    roomSocket.on('kicked', (data) => {
      toast.error(data.message);
      isExplicitLeaveRef.current = true;
      setTimeout(() => navigate('/dashboard'), 1500);
    });

    roomSocket.on('sessionEnded', (data) => {
      toast.warning(data.message);
      setSessionEnded(true);
    });

    roomSocket.on('sessionExpired', (data) => {
      toast.warning(data.message);
      setSessionEnded(true);
    });

    roomSocket.on('roomClosed', (data) => {
      toast.error(data.message);
      isExplicitLeaveRef.current = true;
      setTimeout(() => navigate('/dashboard'), 1500);
    });

    roomSocket.on('durationExtended', (data) => {
      setEndsAt(data.endsAt);
      setSessionEnded(false);
      toast.success(`⏰ Extended by ${data.extraMinutes} min`);
    });

    // ✅ FIXED: Remote play sync
    roomSocket.on('videoPlay', (data) => {
      const video = videoRef.current;
      if (!video) return;

      console.log('▶ Remote play at', data.currentTime, 'from', data.username);
      isSyncingRef.current = true;

      // Sync time only if drift > 2 seconds
      if (Math.abs(video.currentTime - data.currentTime) > 2) {
        video.currentTime = data.currentTime;
      }

      video.play().catch(err => console.warn('Play failed:', err));

      // ✅ Release sync lock after browser processes event
      setTimeout(() => { isSyncingRef.current = false; }, 300);
    });

    // ✅ FIXED: Remote pause sync
    roomSocket.on('videoPause', (data) => {
      const video = videoRef.current;
      if (!video) return;

      console.log('⏸ Remote pause at', data.currentTime, 'from', data.username);
      isSyncingRef.current = true;

      video.currentTime = data.currentTime;
      video.pause();

      setTimeout(() => { isSyncingRef.current = false; }, 300);
    });

    // ✅ FIXED: Remote seek sync
    roomSocket.on('videoSeek', (data) => {
      const video = videoRef.current;
      if (!video) return;

      console.log('⏩ Remote seek to', data.currentTime, 'from', data.username);
      isSyncingRef.current = true;

      video.currentTime = data.currentTime;

      setTimeout(() => { isSyncingRef.current = false; }, 300);
    });

    // ✅ FIXED: Video changed by host/another user
    roomSocket.on('videoChanged', (data) => {
      console.log('🎬 Video changed to:', data.videoTitle);
      toast.info(`🎬 ${data.changedBy} is playing: ${data.videoTitle}`);

      setCurrentVideo({
        title: data.videoTitle,
        videoUrl: data.videoUrl,
        _id: data.videoId,
      });

      setRoom(prev => ({ ...prev, videoUrl: data.videoUrl }));
    });

    roomSocket.on('error', (data) => {
      toast.error(data.message);
    });

    roomSocketRef.current = roomSocket;
    setRoomSocketState(roomSocket);

    return () => {
      roomSocket.emit('leaveRoom', {
        roomId,
        isExplicitLeave: isExplicitLeaveRef.current,
      });
      roomSocket.disconnect();
      // ✅ Cleanup debounce timer
      if (seekDebounceRef.current) clearTimeout(seekDebounceRef.current);
    };
  }, [room, token, roomId]);

  // ═══════════════════════════════════════════════════════════
  //  HANDLERS
  // ═══════════════════════════════════════════════════════════
  const approveWaiting = (pid) =>
    roomSocketRef.current?.emit('approveParticipant', { roomId, participantId: pid });

  const rejectWaiting = (pid) =>
    roomSocketRef.current?.emit('rejectParticipant', { roomId, participantId: pid });

  const hostMute = (pid, mute) =>
    roomSocketRef.current?.emit('hostMuteParticipant', { roomId, participantId: pid, mute });

  const hostToggleCam = (pid, enabled) =>
    roomSocketRef.current?.emit('hostToggleCamera', { roomId, participantId: pid, enabled });

  const removeParticipant = (pid) => {
    if (!window.confirm('Remove this participant?')) return;
    roomSocketRef.current?.emit('removeParticipant', { roomId, participantId: pid });
  };

  const endSessionHost = () => {
    if (!window.confirm('End session for everyone?')) return;
    roomSocketRef.current?.emit('endSession', { roomId });
    isExplicitLeaveRef.current = true;
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  const closeRoomHost = () => {
    if (!window.confirm('Close room permanently?')) return;
    roomSocketRef.current?.emit('closeRoom', { roomId });
    isExplicitLeaveRef.current = true;
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  const extendDuration = (min) =>
    roomSocketRef.current?.emit('extendDuration', { roomId, extraMinutes: min });

  const leaveRoom = () => setShowLeaveConfirm(true);
  const confirmLeave = () => {
    isExplicitLeaveRef.current = true;
    setShowLeaveConfirm(false);
    navigate('/dashboard');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    toast.success('Code copied!');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${room.roomCode}`);
    toast.success('Link copied!');
  };

  const handleJitsiLeave = useCallback(() => {
    isExplicitLeaveRef.current = true;
    navigate('/dashboard');
  }, [navigate]);

  // ✅ FIXED: Play video from watch list + notify all participants
  const handlePlayFromWatchList = useCallback((video, videoUrl) => {
    console.log('🎬 Playing from watch list:', video.title);

    // Resolve full URL
    const fullUrl = videoUrl || (() => {
      if (!video.videoUrl) return '';
      if (video.videoUrl.startsWith('http')) return video.videoUrl;
      const baseURL = typeof API === 'string'
        ? API.replace('/api', '')
        : 'http://localhost:5000';
      return `${baseURL}${video.videoUrl}`;
    })();

    if (!fullUrl) {
      toast.error('No video URL available');
      return;
    }

    // Update local state
    setCurrentVideo({ ...video, videoUrl: fullUrl });
    setRoom(prev => ({ ...prev, videoUrl: fullUrl }));

    // ✅ Notify ALL participants
    if (roomSocketRef.current) {
      roomSocketRef.current.emit('changeVideo', {
        roomId,
        videoUrl: fullUrl,
        videoTitle: video.title,
        videoId: video._id,
      });
    }

    toast.success(`🎬 Now playing: ${video.title}`);
  }, [roomId]);

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════
  if (loading) return <div style={s.loading}>Loading meeting...</div>;
  if (!room) return null;

  return (
    <div style={s.page}>

      {sessionEnded && (
        <SessionEndedOverlay
          isHost={isHost}
          onExtend={extendDuration}
          onDashboard={() => {
            isExplicitLeaveRef.current = true;
            navigate('/dashboard');
          }}
        />
      )}

      {showLeaveConfirm && (
        <LeaveConfirmModal
          isHost={isHost}
          onConfirm={confirmLeave}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}

      {/* ══ HEADER ══ */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <h1 style={s.title}>
            {room.name}
            {currentVideo && currentVideo.title !== room.name && (
              <span style={{
                fontSize: 13,
                color: '#d97706',
                marginLeft: 10,
                fontWeight: 500,
              }}>
                🎬 {currentVideo.title}
              </span>
            )}
          </h1>
          <div style={s.meta}>
            {isHost && <span style={s.hostBadge}>🔥 HOST</span>}
            <span style={s.pill}>
              <span style={s.pillIcon}>👥</span> {participants.length}
            </span>
            <span style={s.pill}>
              <span style={s.pillIcon}>🔑</span>
              <span style={s.code}>{room.roomCode}</span>
            </span>
            {endsAt && !sessionEnded && (
              <span style={s.timerPill}>
                <span style={s.pillIcon}>⏱</span>
                <RoomTimer endsAt={endsAt} />
              </span>
            )}
            {sessionEnded && (
              <span style={s.endedBadge}>⏰ Session Ended</span>
            )}
          </div>
        </div>

        <div style={s.headerActions}>
          {isHost && waitingList.length > 0 && (
            <button
              style={s.btnWarning}
              onClick={() => { setActiveTab('waiting'); setShowSidebar(true); }}
            >
              🔔 {waitingList.length} waiting
            </button>
          )}
          <button style={s.btnGhost} onClick={copyCode}>
            <span>📋</span> Code
          </button>
          <button style={s.btnGhost} onClick={copyLink}>
            <span>🔗</span> Link
          </button>
          {isHost && room?.isActive && (
            <button style={s.btnGhost} onClick={() => setShowInviteModal(true)}>
              <span>👥</span> Invite
            </button>
          )}
          {isHost && (
            <button style={s.btnGhost} onClick={() => setShowHostPanel(true)}>
              <span>⚙️</span> Host
            </button>
          )}
          <button
            style={s.btnIcon}
            onClick={() => setShowSidebar(v => !v)}
            title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            {showSidebar ? '▶' : '◀'}
          </button>
          <button style={s.btnLeave} onClick={leaveRoom}>
            <span>🚪</span> Leave
          </button>
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div style={s.body}>
        <div style={s.content}>

          {/* ✅ VIDEO PLAYER with sync handlers attached */}
          {currentVideo && currentVideo.videoUrl && (
            <div style={s.videoPlayerWrap}>

              {/* Now Playing Bar */}
              <div style={s.nowPlayingBar}>
                <div style={s.nowPlayingLeft}>
                  <span style={s.playingDot}>▶</span>
                  <span style={s.playingTitle}>
                    Now Playing: <strong>{currentVideo.title}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setCurrentVideo(null)}
                  title="Close video player"
                  style={s.closeVideoBtn}
                >
                  ✕
                </button>
              </div>

              {/* ✅ Video element — handlers attached here */}
              <div style={s.videoAspect}>
                <video
                  ref={videoRef}
                  key={currentVideo.videoUrl}   // ✅ Forces remount on URL change
                  src={currentVideo.videoUrl}
                  controls
                  autoPlay
                  style={s.videoEl}
                  onPlay={handleVideoPlay}       // ✅ FIXED: attached
                  onPause={handleVideoPause}     // ✅ FIXED: attached
                  onSeeked={handleVideoSeeked}   // ✅ FIXED: attached (not onSeek)
                  onError={() => {
                    console.error('Video playback error for:', currentVideo.videoUrl);
                    toast.error('Failed to play video. Check the file format.');
                  }}
                >
                  Your browser does not support video playback.
                </video>
              </div>
            </div>
          )}

          {/* ✅ JITSI — shrinks when video is playing */}
          <div style={{
            ...s.videoWrap,
            ...(currentVideo?.videoUrl ? s.videoWrapShrunk : {}),
          }}>
            <VideoCall
              roomId={roomId}
              user={user}
              isHost={isHost}
              onLeave={handleJitsiLeave}
            />
          </div>
        </div>

        {/* ══ SIDEBAR ══ */}
        {showSidebar && (
          <aside style={s.sidebar}>
            <div style={s.tabs}>
              <button
                style={{ ...s.tab, ...(activeTab === 'people' ? s.tabActive : {}) }}
                onClick={() => setActiveTab('people')}
              >
                <span>👥</span> People ({participants.length})
              </button>

              <button
                style={{ ...s.tab, ...(activeTab === 'watchlist' ? s.tabActive : {}) }}
                onClick={() => setActiveTab('watchlist')}
              >
                <span>📺</span> Watch
              </button>

              {isHost && (
                <button
                  style={{ ...s.tab, ...(activeTab === 'waiting' ? s.tabActive : {}) }}
                  onClick={() => setActiveTab('waiting')}
                >
                  <span>🚪</span> Wait
                  {waitingList.length > 0 && ` (${waitingList.length})`}
                </button>
              )}
            </div>

            <div style={s.tabBody}>
              {activeTab === 'people' && (
                <div style={s.panelContent}>
                  <div style={s.panelHeader}>
                    Participants ({participants.length})
                  </div>
                  <ParticipantsPanel
                    participants={participants}
                    isHost={isHost}
                    myParticipantId={myParticipantId}
                    onMute={(pid) => hostMute(pid, true)}
                    onUnmute={(pid) => hostMute(pid, false)}
                    onCameraToggle={hostToggleCam}
                    onRemove={removeParticipant}
                  />
                </div>
              )}

              {activeTab === 'watchlist' && (
                <WatchListPanel
                  onPlayVideo={handlePlayFromWatchList}
                  roomSocket={roomSocketRef.current}
                  roomId={roomId}
                />
              )}

              {activeTab === 'waiting' && isHost && (
                <div style={s.panelContent}>
                  <WaitingRoomPanel
                    waiting={waitingList}
                    onApprove={approveWaiting}
                    onReject={rejectWaiting}
                  />
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ══ MODALS ══ */}
      {showHostPanel && isHost && (
        <HostControlModal
          onExtend={extendDuration}
          onEndSession={endSessionHost}
          onCloseRoom={closeRoomHost}
          onClose={() => setShowHostPanel(false)}
        />
      )}

      {isHost && showInviteModal && (
        <InviteFriendsModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          roomId={room?._id}
          roomName={room?.name}
          roomCode={room?.roomCode}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

function LeaveConfirmModal({ isHost, onConfirm, onCancel }) {
  return (
    <div style={m.overlay} onClick={onCancel}>
      <div style={m.modal} onClick={e => e.stopPropagation()}>
        <div style={m.iconWrap}>
          <span style={m.icon}>🚪</span>
        </div>
        <h2 style={m.title}>Leave Meeting?</h2>
        <p style={m.msg}>
          {isHost
            ? 'You are the host. The meeting will continue for others if you leave.'
            : 'You can rejoin anytime using the meeting code.'}
        </p>
        <div style={m.actions}>
          <button style={m.btnStay} onClick={onCancel}>← Stay</button>
          <button style={m.btnLeave} onClick={onConfirm}>🚪 Leave</button>
        </div>
      </div>
    </div>
  );
}

function SessionEndedOverlay({ isHost, onExtend, onDashboard }) {
  const [min, setMin] = useState(30);
  return (
    <div style={s.overlay}>
      <div style={s.overlayCard}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>⏰</div>
        <h2 style={{ margin: '0 0 8px', color: '#1f2937' }}>Session Ended</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          The meeting time has expired.
        </p>
        {isHost ? (
          <div style={s.extendRow}>
            <input
              type="number" value={min} min={1}
              onChange={e => setMin(Number(e.target.value))}
              style={s.extendInput}
            />
            <button style={s.btnGreen} onClick={() => onExtend(min)}>
              ⏰ Extend {min} min
            </button>
          </div>
        ) : (
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
            Waiting for host to extend the session...
          </p>
        )}
        <button style={s.btnGhost} onClick={onDashboard}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

function HostControlModal({ onExtend, onEndSession, onCloseRoom, onClose }) {
  const [custom, setCustom] = useState(45);
  const presets = [15, 30, 60];

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.hcCard} onClick={e => e.stopPropagation()}>
        <div style={s.hcHeader}>
          <div style={s.hcHeadLeft}>
            <div style={s.hcHeadIcon}>⚙️</div>
            <div>
              <h2 style={s.hcTitle}>Host Controls</h2>
              <p style={s.hcSub}>Manage your meeting session</p>
            </div>
          </div>
          <button style={s.hcClose} onClick={onClose}>×</button>
        </div>

        <div style={s.hcBody}>
          <div style={s.hcSection}>
            <div style={s.hcSecHead}>
              <span style={s.hcSecIcon}>⏰</span>
              <span style={s.hcSecTitle}>Extend Meeting</span>
            </div>
            <p style={s.hcSecDesc}>Add extra time to the current session</p>
            <div style={s.hcPresetRow}>
              {presets.map(p => (
                <button key={p} style={s.hcPreset} onClick={() => onExtend(p)}>
                  +{p}<span style={s.hcPresetUnit}>min</span>
                </button>
              ))}
            </div>
            <div style={s.hcCustomRow}>
              <div style={s.hcInputWrap}>
                <input
                  type="number" min={1} max={300} value={custom}
                  onChange={e => setCustom(Number(e.target.value))}
                  style={s.hcInput}
                />
                <span style={s.hcUnit}>min</span>
              </div>
              <button style={s.hcBtnGreen} onClick={() => onExtend(custom)}>
                Extend Session
              </button>
            </div>
          </div>

          <div style={s.hcDanger}>
            <div style={s.hcSecHead}>
              <span style={s.hcSecIcon}>⚠️</span>
              <span style={{ ...s.hcSecTitle, color: '#b91c1c' }}>Danger Zone</span>
            </div>
            <p style={s.hcSecDesc}>These actions affect all participants</p>
            <div style={s.hcDangerItem}>
              <div style={s.hcDangerText}>
                <strong style={s.hcDangerLabel}>End Session</strong>
                <span style={s.hcDangerHint}>
                  Stops the meeting — room stays available.
                </span>
              </div>
              <button style={s.hcBtnAmber} onClick={onEndSession}>⏸ End</button>
            </div>
            <div style={s.hcDivider} />
            <div style={s.hcDangerItem}>
              <div style={s.hcDangerText}>
                <strong style={s.hcDangerLabel}>Close Room</strong>
                <span style={s.hcDangerHint}>
                  Permanently closes and blocks re-entry.
                </span>
              </div>
              <button style={s.hcBtnRed} onClick={onCloseRoom}>🔒 Close</button>
            </div>
          </div>
        </div>

        <div style={s.hcFooter}>
          <button style={s.btnGhost} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STYLES - Leave Confirm Modal
// ═══════════════════════════════════════════════════════════
const m = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(28,28,30,0.5)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 10000, animation: 'fadeInScale 0.2s ease',
  },
  modal: {
    background: '#ffffff', borderRadius: '20px', padding: '36px',
    maxWidth: '440px', width: '90%', textAlign: 'center',
    border: '1px solid #e8e5df',
    boxShadow: '0 25px 80px rgba(28,28,30,0.2)',
    animation: 'fadeInScale 0.25s ease',
  },
  iconWrap: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#fca5a5,#f87171)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '36px', margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(248,113,113,0.3)',
  },
  icon: { lineHeight: 1 },
  title: { margin: '0 0 12px', fontSize: '24px', fontWeight: '800', color: '#1c1c1e', letterSpacing: '-0.02em' },
  msg: { color: '#6e6e73', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px', fontWeight: 500 },
  actions: { display: 'flex', gap: '12px' },
  btnStay: {
    flex: 1, padding: '14px', background: '#faf7f0',
    border: '1px solid #e8e5df', borderRadius: '12px',
    color: '#1c1c1e', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  btnLeave: {
    flex: 1, padding: '14px',
    background: 'linear-gradient(135deg,#f87171,#ef4444)',
    border: 'none', borderRadius: '12px', color: '#fff',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
    fontFamily: 'inherit', transition: 'all 0.15s',
  },
};

// ═══════════════════════════════════════════════════════════
//  STYLES - Main Page
// ═══════════════════════════════════════════════════════════
const s = {
  page: {
    height: '100vh', background: '#f4f2ee', color: '#1c1c1e',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    overflow: 'hidden',
  },
  loading: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: 'linear-gradient(180deg, #f4f2ee 0%, #eeece7 100%)',
    color: '#6e6e73', fontSize: '18px', fontWeight: 600,
  },

  // ═══════════ HEADER ═══════════
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 24px', background: '#ffffff',
    borderBottom: '1px solid #e8e5df',
    flexWrap: 'wrap', gap: '12px', flexShrink: 0,
    boxShadow: '0 1px 3px rgba(28,28,30,0.04)',
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '6px' },
  title: {
    margin: 0, fontSize: '18px', fontWeight: '700',
    color: '#1c1c1e', letterSpacing: '-0.01em',
    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px',
  },
  meta: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '4px 10px', background: '#faf7f0',
    border: '1px solid #e8e5df', borderRadius: '20px',
    fontSize: '12px', color: '#6e6e73', fontWeight: '600',
  },
  timerPill: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '5px 12px',
    background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    border: '1px solid #f87171', borderRadius: '20px',
    fontSize: '13px', color: '#b91c1c', fontWeight: '700',
    fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em',
    boxShadow: '0 2px 6px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  pillIcon: { fontSize: '12px', lineHeight: 1 },
  code: { fontFamily: 'ui-monospace, monospace', fontWeight: '700', color: '#d97706' },
  hostBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    color: '#92400e', padding: '4px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '800',
    border: '1px solid #fbbf24', letterSpacing: '0.02em',
    boxShadow: '0 2px 6px rgba(217,119,6,0.15)',
  },
  endedBadge: {
    color: '#ea580c', fontSize: '13px', fontWeight: '700',
    padding: '4px 10px', background: '#fff7ed',
    borderRadius: '20px', border: '1px solid #fed7aa',
  },
  headerActions: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '10px',
    background: '#ffffff', color: '#1c1c1e',
    border: '1px solid #e8e5df', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', transition: 'all 0.15s',
    boxShadow: '0 1px 3px rgba(28,28,30,0.04)',
    fontFamily: 'inherit',
  },
  btnIcon: {
    padding: '8px 12px', borderRadius: '10px',
    background: '#ffffff', color: '#6e6e73',
    border: '1px solid #e8e5df', cursor: 'pointer',
    fontSize: '12px', fontWeight: '700',
    boxShadow: '0 1px 2px rgba(28,28,30,0.04)',
    fontFamily: 'inherit',
  },
  btnWarning: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #fbbf24, #d97706)',
    color: '#ffffff', border: 'none',
    cursor: 'pointer', fontSize: '13px', fontWeight: '700',
    animation: 'softPulse 2s infinite',
    boxShadow: '0 3px 10px rgba(217,119,6,0.35)',
    fontFamily: 'inherit',
  },
  btnLeave: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 18px', borderRadius: '10px',
    background: 'linear-gradient(135deg,#f43f5e,#e11d48)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '700',
    boxShadow: '0 3px 10px rgba(244,63,94,0.4)',
    fontFamily: 'inherit',
  },

  // ═══════════ BODY LAYOUT ═══════════
  body: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 },
  content: {
    flex: 1, padding: '16px', overflow: 'auto',
    minHeight: 0, display: 'flex', flexDirection: 'column', gap: '12px',
    background: 'linear-gradient(180deg, #f4f2ee 0%, #eeece7 100%)',
  },

  // ═══════════ VIDEO PLAYER ═══════════
  videoPlayerWrap: {
    flexShrink: 0, borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid #d97706',
    boxShadow: '0 6px 24px rgba(217,119,6,0.2)',
    background: '#000',
  },
  nowPlayingBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #92400e, #d97706)',
    color: 'white',
  },
  nowPlayingLeft: {
    display: 'flex', alignItems: 'center', gap: '10px',
    flex: 1, minWidth: 0,
  },
  playingDot: {
    fontSize: '14px', color: '#fef3c7',
    animation: 'softPulse 2s infinite', flexShrink: 0,
  },
  playingTitle: {
    fontSize: '13px', fontWeight: '600',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  closeVideoBtn: {
    width: '26px', height: '26px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)', border: 'none',
    color: 'white', cursor: 'pointer', fontSize: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all 0.15s',
    backdropFilter: 'blur(4px)',
  },
  videoAspect: {
    width: '100%', aspectRatio: '16/9',
    background: '#000', position: 'relative',
  },
  videoEl: {
    width: '100%', height: '100%',
    objectFit: 'contain', background: '#000', display: 'block',
  },

  // ═══════════ JITSI WRAPPER ═══════════
  videoWrap: {
    flex: 1, background: '#ffffff', borderRadius: '16px',
    overflow: 'hidden', border: '1px solid #e8e5df',
    boxShadow: '0 2px 8px rgba(28,28,30,0.04)',
    minHeight: '120px',
  },
  videoWrapShrunk: {
    flex: 'none', height: '160px', borderRadius: '12px',
  },

  // ═══════════ SIDEBAR ═══════════
  sidebar: {
    width: '340px', flexShrink: 0, background: '#faf7f0',
    borderLeft: '1px solid #e8e5df',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  tabs: {
    display: 'flex', borderBottom: '1px solid #e8e5df',
    flexShrink: 0, padding: '8px 8px 0', gap: '4px',
    background: '#ffffff',
  },
  tab: {
    flex: 1, padding: '10px 6px',
    display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', gap: '4px',
    background: 'transparent', color: '#8e8e93', border: 'none',
    cursor: 'pointer', fontSize: '12px', fontWeight: '600',
    borderBottom: '2px solid transparent', transition: 'all 0.15s',
    whiteSpace: 'nowrap', fontFamily: 'inherit',
  },
  tabActive: { color: '#d97706', borderBottomColor: '#d97706' },
  tabBody: {
    flex: 1, overflow: 'auto', display: 'flex',
    flexDirection: 'column', background: '#f4f2ee',
  },
  panelContent: {
    padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
  },
  panelHeader: {
    fontSize: '13px', fontWeight: '700', color: '#1c1c1e',
    padding: '4px 4px 8px', letterSpacing: '-0.01em',
  },

  // ═══════════ OVERLAYS ═══════════
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(28,28,30,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, backdropFilter: 'blur(8px)',
  },
  overlayCard: {
    background: '#ffffff', borderRadius: '20px', padding: '40px',
    textAlign: 'center', maxWidth: '440px', width: '90%',
    border: '1px solid #e8e5df',
    boxShadow: '0 20px 60px rgba(28,28,30,0.2)',
  },
  extendRow: {
    display: 'flex', gap: '10px',
    justifyContent: 'center', alignItems: 'center', marginBottom: '20px',
  },
  extendInput: {
    width: '80px', padding: '10px', background: '#faf7f0',
    border: '1px solid #e8e5df', borderRadius: '10px',
    color: '#1c1c1e', fontSize: '16px', textAlign: 'center',
    fontFamily: 'inherit', fontWeight: 700,
    outline: 'none',
  },
  modalOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(28,28,30,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(6px)',
  },
  btnGreen: {
    padding: '13px 20px', borderRadius: '12px',
    background: 'linear-gradient(135deg,#34d399,#10b981)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontWeight: '700', fontSize: '14px',
    boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
    fontFamily: 'inherit',
  },

  // ═══════════ HOST CONTROL MODAL ═══════════
  hcCard: {
    background: '#ffffff', borderRadius: '20px',
    width: '100%', maxWidth: '460px', maxHeight: '88vh',
    display: 'flex', flexDirection: 'column',
    border: '1px solid #e8e5df',
    boxShadow: '0 25px 70px rgba(28,28,30,0.2)',
    overflow: 'hidden', animation: 'fadeInScale 0.22s ease',
  },
  hcHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '18px 22px', borderBottom: '1px solid #e8e5df', flexShrink: 0,
    background: '#ffffff',
  },
  hcHeadLeft: { display: 'flex', alignItems: 'center', gap: '13px' },
  hcHeadIcon: {
    width: '40px', height: '40px', borderRadius: '12px',
    background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
    border: '1px solid #fbbf24',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '19px',
    boxShadow: '0 2px 6px rgba(217,119,6,0.12)',
  },
  hcTitle: { margin: 0, fontSize: '17px', fontWeight: '800', color: '#1c1c1e', letterSpacing: '-0.01em' },
  hcSub: { margin: '2px 0 0', fontSize: '12px', color: '#8e8e93', fontWeight: '500' },
  hcClose: {
    width: '32px', height: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#faf7f0', border: '1px solid #e8e5df',
    borderRadius: '9px', fontSize: '20px', lineHeight: 1,
    color: '#6e6e73', cursor: 'pointer', paddingBottom: '2px',
    transition: 'all 0.15s',
  },
  hcBody: {
    padding: '18px 22px', background: '#f4f2ee',
    overflowY: 'auto', flex: 1,
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  hcSection: {
    background: '#ffffff', border: '1px solid #e8e5df',
    borderRadius: '14px', padding: '16px',
    boxShadow: '0 1px 3px rgba(28,28,30,0.04)',
  },
  hcSecHead: { display: 'flex', alignItems: 'center', gap: '8px' },
  hcSecIcon: { fontSize: '15px', lineHeight: 1 },
  hcSecTitle: { fontSize: '14px', fontWeight: '700', color: '#1c1c1e' },
  hcSecDesc: { margin: '6px 0 14px', fontSize: '12.5px', color: '#8e8e93', lineHeight: '1.5' },
  hcPresetRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  hcPreset: {
    flex: 1, padding: '11px 8px', borderRadius: '11px',
    background: '#f0fdf4', border: '1.5px solid #bbf7d0',
    color: '#15803d', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'baseline',
    justifyContent: 'center', gap: '3px',
    fontFamily: 'inherit', transition: 'all 0.15s',
  },
  hcPresetUnit: { fontSize: '10.5px', fontWeight: '600', opacity: 0.75 },
  hcCustomRow: { display: 'flex', gap: '9px', alignItems: 'center' },
  hcInputWrap: {
    display: 'flex', alignItems: 'center',
    background: '#faf7f0', border: '1px solid #e8e5df',
    borderRadius: '10px', paddingRight: '11px',
  },
  hcInput: {
    width: '62px', padding: '10px 8px',
    background: 'transparent', border: 'none', outline: 'none',
    fontSize: '14px', fontWeight: '700', color: '#1c1c1e',
    textAlign: 'center', fontFamily: 'inherit',
  },
  hcUnit: { fontSize: '11.5px', color: '#8e8e93', fontWeight: '600' },
  hcBtnGreen: {
    flex: 1, padding: '11px 16px', borderRadius: '10px',
    background: 'linear-gradient(135deg,#34d399,#10b981)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontSize: '13.5px', fontWeight: '700',
    boxShadow: '0 3px 10px rgba(16,185,129,0.3)',
    fontFamily: 'inherit',
  },
  hcDanger: {
    background: '#fffbfb', border: '1px solid #fecaca',
    borderRadius: '14px', padding: '16px',
  },
  hcDangerItem: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '14px',
  },
  hcDangerText: { display: 'flex', flexDirection: 'column', gap: '3px' },
  hcDangerLabel: { fontSize: '13px', fontWeight: '700', color: '#1c1c1e' },
  hcDangerHint: { fontSize: '11.5px', color: '#8e8e93', lineHeight: '1.45' },
  hcDivider: { height: '1px', background: '#fee2e2', margin: '14px 0' },
  hcBtnAmber: {
    padding: '9px 18px', borderRadius: '10px',
    background: 'linear-gradient(135deg,#fbbf24,#d97706)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap',
    boxShadow: '0 3px 8px rgba(217,119,6,0.3)',
    fontFamily: 'inherit',
  },
  hcBtnRed: {
    padding: '9px 18px', borderRadius: '10px',
    background: 'linear-gradient(135deg,#f43f5e,#e11d48)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap',
    boxShadow: '0 3px 8px rgba(244,63,94,0.3)',
    fontFamily: 'inherit',
  },
  hcFooter: {
    padding: '15px 22px', borderTop: '1px solid #e8e5df',
    display: 'flex', justifyContent: 'flex-end',
    background: '#ffffff', flexShrink: 0,
  },
};

export default WatchRoom;