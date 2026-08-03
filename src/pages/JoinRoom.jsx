import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import roomService from '../services/roomService';
import { toast } from 'react-toastify';

function JoinRoom() {
  const navigate = useNavigate();
  const { roomCode: urlCode } = useParams();
  const { user } = useContext(AuthContext);

  const [code, setCode]         = useState(urlCode || '');
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [joining, setJoining]   = useState(false);
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState(false);

  useEffect(() => {
    if (urlCode) {
      setCode(urlCode.toUpperCase());
      checkRoom(urlCode);
    }
    // eslint-disable-next-line
  }, [urlCode]);

  // Accepts raw code OR a full meeting link
  const extractCode = (raw) => {
    const v = (raw || '').trim();
    const match = v.match(/\/join\/([A-Za-z0-9]{4,12})/);
    return (match ? match[1] : v).toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const checkRoom = async (checkCode) => {
    const c = extractCode(checkCode || code);
    if (!c) { setError('Please enter a room code'); return; }
    setLoading(true);
    setError('');
    setRoomInfo(null);
    try {
      const data = await roomService.getRoomInfo(c);
      setRoomInfo(data.room);
    } catch (err) {
      setError(err.response?.data?.message || 'Room not found. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const data = await roomService.joinRoom(extractCode(code));
      if (data.status === 'waiting') {
        toast.info('Waiting for host approval...');
      } else {
        toast.success(data.joinedAsFriend ? '✓ Joined as friend!' : 'Joined room!');
      }
      navigate(`/room/${data.room._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const c = extractCode(text);
      if (c) { setCode(c); setRoomInfo(null); setError(''); checkRoom(c); }
      else toast.error('No valid code found in clipboard');
    } catch {
      toast.error('Clipboard access denied');
    }
  };

  const hostInitial = roomInfo?.host?.username?.[0]?.toUpperCase() || '?';

  return (
    <div style={s.page}>
      <div style={s.shell}>

        {/* ══ LEFT — Info panel ══ */}
        <aside style={s.sideCard} className="jr-side">
          <div style={s.brandRow}>
            <span style={s.brandIcon}>🎬</span>
            <span style={s.brandName}>WatchParty</span>
          </div>

          <h2 style={s.sideTitle}>Join a room</h2>
          <p style={s.sideText}>
            Enter the 8-character code your friend shared, or paste the full
            invite link — we'll figure out the rest.
          </p>

          <div style={s.featureList}>
            {[
              { i: '🔑', t: 'Room Code', d: 'Ask the host for their code' },
              { i: '🤝', t: 'Friends Skip Queue', d: 'Instant entry if you\'re friends' },
              { i: '🔐', t: 'Approval Rooms', d: 'Host approves you before entry' },
            ].map(f => (
              <div key={f.t} style={s.feature}>
                <span style={s.featureIcon}>{f.i}</span>
                <div>
                  <div style={s.featureTitle}>{f.t}</div>
                  <div style={s.featureDesc}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={s.sideFooter}>
            Want your own room?{' '}
            <span style={s.sideLink} onClick={() => navigate('/dashboard')}>
              Create one →
            </span>
          </div>
        </aside>

        {/* ══ RIGHT — Join card ══ */}
        <main style={s.card}>
          <div style={s.cardHead}>
            <div>
              <h1 style={s.title}>🚪 Join a Room</h1>
              <p style={s.sub}>Enter a room code or paste a meeting link</p>
            </div>
            {user && (
              <div style={s.userChip}>
                <span style={s.userAvatar}>
                  {user.username?.[0]?.toUpperCase()}
                </span>
                <span style={s.userName}>{user.username}</span>
              </div>
            )}
          </div>

          {/* Code entry */}
          <div style={s.sectionLabel}>Room Code</div>

          <div style={{ ...s.codeBox, ...(focused ? s.codeBoxFocus : {}), ...(error ? s.codeBoxErr : {}) }}>
            <span style={s.codeIcon}>🔑</span>
            <input
              value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase());
                setRoomInfo(null);
                setError('');
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="AB12CD34"
              maxLength={12}
              style={s.codeInput}
              onKeyDown={e => e.key === 'Enter' && checkRoom()}
            />
            <button type="button" style={s.pasteBtn} onClick={handlePaste} title="Paste from clipboard">
              📋
            </button>
          </div>

          {error && <div style={s.errorBox}>⚠ {error}</div>}

          <button
            style={{ ...s.checkBtn, ...(loading ? s.disabledBtn : {}) }}
            onClick={() => checkRoom()}
            disabled={loading}
          >
            {loading ? '⏳ Searching...' : '🔍 Find Room'}
          </button>

          {/* Empty state */}
          {!roomInfo && !error && !loading && (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>🎟️</div>
              <div style={s.emptyTitle}>No room loaded yet</div>
              <div style={s.emptyDesc}>
                Enter a code above and hit <strong>Find Room</strong> to preview
                the meeting before joining.
              </div>
            </div>
          )}

          {/* Room preview */}
          {roomInfo && (
            <div style={s.roomCard}>
              <div style={s.roomHead}>
                <div style={s.roomHeadLeft}>
                  <div style={s.roomAvatar}>{hostInitial}</div>
                  <div>
                    <h2 style={s.roomName}>{roomInfo.name}</h2>
                    <span style={s.roomHost}>
                      Hosted by <strong>{roomInfo.host?.username}</strong>
                    </span>
                  </div>
                </div>
                <span style={{
                  ...s.liveChip,
                  ...(roomInfo.isSessionLive ? s.liveChipOn : s.liveChipOff),
                }}>
                  <span style={{
                    ...s.dot,
                    background: roomInfo.isSessionLive ? '#10b981' : '#9ca3af',
                  }} />
                  {roomInfo.isSessionLive ? 'Live' : 'Ended'}
                </span>
              </div>

              <div style={s.metaGrid}>
                <div style={s.metaItem}>
                  <span style={s.metaLabel}>Room Code</span>
                  <span style={s.metaValue}>{roomInfo.roomCode}</span>
                </div>
                <div style={s.metaItem}>
                  <span style={s.metaLabel}>Entry</span>
                  <span style={s.metaValue}>
                    {roomInfo.requireApproval ? 'Approval needed' : 'Open to all'}
                  </span>
                </div>
              </div>

              {roomInfo.requireApproval && (
                <div style={s.noteWarn}>
                  🔐 This room requires host approval. You'll wait in the lobby
                  until the host lets you in.
                </div>
              )}

              <div style={s.noteOk}>
                ✅ As a registered member, you can join directly if you're
                friends with the host.
              </div>

              <button
                style={{
                  ...s.joinBtn,
                  ...(joining || !roomInfo.isSessionLive ? s.disabledBtn : {}),
                }}
                onClick={handleJoin}
                disabled={joining || !roomInfo.isSessionLive}
              >
                {joining
                  ? '⏳ Joining...'
                  : !roomInfo.isSessionLive
                  ? '⚫ Session Ended'
                  : '▶  Join Room'}
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
  @keyframes jrFade {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes jrPulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.4; }
  }
  input::placeholder { color: #b5a89a; letter-spacing: 4px; }
  input:focus { outline: none; }
  @media (max-width: 880px) {
    .jr-side { display: none !important; }
  }
`}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f4f2ee 0%, #eeece7 100%)',
    padding: '40px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  shell: {
    display: 'flex', gap: '20px',
    width: '100%', maxWidth: '900px', alignItems: 'stretch',
  },

  /* Left panel */
  sideCard: {
    width: '310px', flexShrink: 0,
    background: '#ffffff',
    borderRadius: '18px',
    border: '1px solid #e8e5df',
    boxShadow: '0 2px 8px rgba(28,28,30,0.05)',
    padding: '30px 26px',
    display: 'flex', flexDirection: 'column',
    animation: 'jrFade 0.35s ease',
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '26px' },
  brandIcon: { fontSize: '20px' },
  brandName: { fontSize: '17px', fontWeight: '800', color: '#1c1c1e', letterSpacing: '-0.01em' },
  sideTitle: {
    margin: '0 0 10px', fontSize: '22px', fontWeight: '800',
    color: '#1c1c1e', letterSpacing: '-0.02em',
  },
  sideText: {
    margin: '0 0 26px', fontSize: '13.5px', color: '#8e8e93', lineHeight: '1.6', fontWeight: 500,
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  feature: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  featureIcon: {
    width: '36px', height: '36px', flexShrink: 0,
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    border: '1px solid #fbbf24',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
    boxShadow: '0 2px 6px rgba(217,119,6,0.1)',
  },
  featureTitle: { fontSize: '13.5px', fontWeight: '700', color: '#1c1c1e' },
  featureDesc: { fontSize: '12px', color: '#8e8e93', marginTop: '1px', fontWeight: 500 },
  sideFooter: {
    marginTop: 'auto', paddingTop: '24px',
    borderTop: '1px solid #e8e5df', fontSize: '13px', color: '#8e8e93', fontWeight: 500,
  },
  sideLink: { color: '#d97706', fontWeight: '700', cursor: 'pointer' },

  /* Right card */
  card: {
    flex: 1,
    background: '#ffffff',
    borderRadius: '18px',
    border: '1px solid #e8e5df',
    boxShadow: '0 2px 8px rgba(28,28,30,0.05)',
    padding: '30px 32px',
    animation: 'jrFade 0.35s ease',
  },
  cardHead: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: '14px', marginBottom: '24px',
  },
  title: {
    margin: 0, fontSize: '21px', fontWeight: '800',
    color: '#1c1c1e', letterSpacing: '-0.02em',
  },
  sub: { margin: '5px 0 0', color: '#8e8e93', fontSize: '13.5px', fontWeight: 500 },
  userChip: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '5px 12px 5px 5px', borderRadius: '20px',
    background: '#faf7f0', border: '1px solid #e8e5df', whiteSpace: 'nowrap',
  },
  userAvatar: {
    width: '24px', height: '24px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #fbbf24, #d97706)',
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '700',
    boxShadow: '0 2px 4px rgba(217,119,6,0.25)',
  },
  userName: { fontSize: '12.5px', fontWeight: '700', color: '#1c1c1e' },

  sectionLabel: {
    fontSize: '12px', fontWeight: '800', color: '#8e8e93',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px',
  },

  /* Code input */
  codeBox: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: '#faf7f0',
    border: '1.5px solid #e8e5df',
    borderRadius: '12px',
    padding: '4px 8px 4px 16px',
    transition: 'all 0.18s',
  },
  codeBoxFocus: {
    background: '#ffffff', borderColor: '#d97706',
    boxShadow: '0 0 0 3px rgba(217,119,6,0.12)',
  },
  codeBoxErr: { background: '#fef2f2', borderColor: '#fecaca' },
  codeIcon: { fontSize: '16px', opacity: 0.5 },
  codeInput: {
    flex: 1, padding: '13px 0',
    background: 'transparent', border: 'none',
    fontSize: '19px', fontWeight: '700',
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
    letterSpacing: '4px', color: '#1c1c1e',
    textTransform: 'uppercase', outline: 'none', minWidth: 0,
  },
  pasteBtn: {
    background: '#ffffff', border: '1px solid #e8e5df',
    borderRadius: '9px', padding: '8px 11px',
    cursor: 'pointer', fontSize: '14px', lineHeight: 1, flexShrink: 0,
    transition: 'all 0.15s',
  },

  errorBox: {
    marginTop: '10px', padding: '11px 14px',
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: '10px', color: '#dc2626',
    fontSize: '12.5px', fontWeight: '600',
  },

  checkBtn: {
    width: '100%', marginTop: '12px',
    padding: '13px 20px',
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    border: 'none', borderRadius: '12px',
    color: '#fff', fontSize: '14.5px', fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(217,119,6,0.35)',
    fontFamily: 'inherit', letterSpacing: '-0.01em',
    transition: 'all 0.2s',
  },
  disabledBtn: { opacity: 0.55, cursor: 'not-allowed', boxShadow: 'none' },

  /* Empty state */
  emptyState: {
    marginTop: '22px', padding: '32px 20px',
    background: '#faf7f0', border: '1px dashed #e8e5df',
    borderRadius: '14px', textAlign: 'center',
  },
  emptyIcon: { fontSize: '34px', marginBottom: '10px', opacity: 0.7 },
  emptyTitle: { fontSize: '14px', fontWeight: '700', color: '#1c1c1e' },
  emptyDesc: {
    fontSize: '12.5px', color: '#8e8e93',
    marginTop: '5px', lineHeight: '1.6', maxWidth: '300px',
    marginLeft: 'auto', marginRight: 'auto', fontWeight: 500,
  },

  /* Room preview */
  roomCard: {
    marginTop: '22px',
    background: '#faf7f0',
    border: '1px solid #e8e5df',
    borderRadius: '16px', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '14px',
    animation: 'jrFade 0.3s ease',
  },
  roomHead: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: '12px',
  },
  roomHeadLeft: { display: 'flex', gap: '13px', alignItems: 'center' },
  roomAvatar: {
    width: '44px', height: '44px', borderRadius: '13px',
    background: 'linear-gradient(135deg, #fbbf24, #d97706)',
    color: '#fff', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: '700', flexShrink: 0,
    boxShadow: '0 4px 10px rgba(217,119,6,0.25)',
  },
  roomName: {
    margin: 0, fontSize: '17px', fontWeight: '800',
    color: '#1c1c1e', letterSpacing: '-0.01em',
  },
  roomHost: { fontSize: '12.5px', color: '#8e8e93', fontWeight: 500 },
  liveChip: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '5px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap',
  },
  liveChipOn: { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' },
  liveChipOff: { background: '#faf7f0', color: '#8e8e93', border: '1px solid #e8e5df' },
  dot: {
    width: '7px', height: '7px', borderRadius: '50%',
    animation: 'jrPulse 1.8s ease-in-out infinite',
  },

  metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  metaItem: {
    background: '#ffffff', border: '1px solid #e8e5df',
    borderRadius: '11px', padding: '10px 13px',
    display: 'flex', flexDirection: 'column', gap: '2px',
  },
  metaLabel: {
    fontSize: '10.5px', fontWeight: '700', color: '#8e8e93',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  metaValue: {
    fontSize: '13.5px', fontWeight: '700', color: '#d97706',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace", letterSpacing: '0.5px',
  },

  noteWarn: {
    padding: '11px 14px',
    background: '#fef3c7', border: '1px solid #fbbf24',
    borderRadius: '10px', fontSize: '12.5px',
    color: '#92400e', lineHeight: '1.55', fontWeight: 600,
  },
  noteOk: {
    padding: '11px 14px',
    background: '#ecfdf5', border: '1px solid #a7f3d0',
    borderRadius: '10px', fontSize: '12.5px',
    color: '#059669', lineHeight: '1.55', fontWeight: 600,
  },

  joinBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    border: 'none', borderRadius: '12px',
    color: '#fff', fontSize: '15px', fontWeight: '700',
    cursor: 'pointer', letterSpacing: '-0.01em',
    boxShadow: '0 4px 14px rgba(217,119,6,0.35)',
    fontFamily: 'inherit', transition: 'all 0.2s',
  },
};

export default JoinRoom;