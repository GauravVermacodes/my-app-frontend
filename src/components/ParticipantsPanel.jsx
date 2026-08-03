import React from 'react';

function ParticipantsPanel({
  participants, isHost, myParticipantId,
  onMute, onUnmute, onCameraToggle, onRemove,
}) {
  return (
    <div style={s.container}>
      <div style={s.header}>
        <span>Participants ({participants.length})</span>
      </div>
      <div style={s.list}>
        {participants.map(p => {
          const name = p.isGuest ? p.guestName : p.user?.username;
          const avatar = name?.charAt(0)?.toUpperCase() || '?';
          const isMe = p._id === myParticipantId;
          const isRoomHost = p.role === 'host';

          return (
            <div key={p._id} style={s.item}>
              <div style={s.info}>
                <div style={s.avatar}>{avatar}</div>
                <div style={s.details}>
                  <div style={s.nameRow}>
                    <span style={s.name}>{name}</span>
                    {isMe && <span style={s.badgeMe}>You</span>}
                    {isRoomHost && <span style={s.badgeHost}>👑 Host</span>}
                    {p.isGuest && <span style={s.badgeGuest}>Guest</span>}
                  </div>
                  <div style={s.status}>
                    <span title={p.isMuted ? 'Muted' : 'Unmuted'}>
                      {p.isMuted ? '🔇' : '🎤'}
                    </span>
                    <span title={p.isCameraOn ? 'Camera On' : 'Camera Off'}>
                      {p.isCameraOn ? '📹' : '📷'}
                    </span>
                    {p.isScreenSharing && <span title="Sharing screen">🖥️</span>}
                  </div>
                </div>
              </div>

              {isHost && !isMe && !isRoomHost && (
                <div style={s.actions}>
                  <button
                    style={s.actionBtn}
                    onClick={() => p.isMuted ? onUnmute?.(p._id) : onMute?.(p._id)}
                    title={p.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {p.isMuted ? '🔊' : '🔇'}
                  </button>
                  <button
                    style={s.actionBtn}
                    onClick={() => onCameraToggle?.(p._id, !p.isCameraOn)}
                    title={p.isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                  >
                    {p.isCameraOn ? '📷' : '📹'}
                  </button>
                  <button
                    style={{ ...s.actionBtn, ...s.actionDanger }}
                    onClick={() => onRemove?.(p._id)}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {participants.length === 0 && (
          <div style={s.empty}>No participants</div>
        )}
      </div>
    </div>
  );
}

const s = {
  container: { height: '100%', display: 'flex', flexDirection: 'column' },
  header: { padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: '600' },
  list: { flex: 1, overflowY: 'auto', padding: '8px' },
  item: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px', borderRadius: '8px', marginBottom: '4px',
    background: 'rgba(255,255,255,0.03)',
  },
  info: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', flexShrink: 0,
  },
  details: { flex: 1, minWidth: 0 },
  nameRow: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' },
  name: { fontSize: '14px', fontWeight: '500' },
  badgeMe: {
    fontSize: '10px', padding: '1px 5px', borderRadius: '3px',
    background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
  },
  badgeHost: { fontSize: '11px' },
  badgeGuest: {
    fontSize: '10px', padding: '1px 5px', borderRadius: '3px',
    background: 'rgba(16,185,129,0.2)', color: '#6ee7b7',
  },
  status: { display: 'flex', gap: '6px', fontSize: '13px', marginTop: '2px' },
  actions: { display: 'flex', gap: '4px' },
  actionBtn: {
    padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)',
    border: 'none', cursor: 'pointer', fontSize: '14px', color: '#fff',
  },
  actionDanger: { background: 'rgba(239,68,68,0.15)', color: '#fca5a5' },
  empty: { textAlign: 'center', color: '#64748b', padding: '30px', fontSize: '13px' },
};

export default ParticipantsPanel;