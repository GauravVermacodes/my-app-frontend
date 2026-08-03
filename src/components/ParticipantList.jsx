import React, { useMemo } from 'react';

function ParticipantList({ 
  participants, 
  hostId, 
  currentUserId, 
  isHost, 
  onRemoveParticipant, 
  onMuteParticipant, 
  onUnmuteParticipant,
  sessionEnded = false 
}) {
  // Memoize processed participants to avoid unnecessary re-renders
  const processedParticipants = useMemo(() => {
    return participants.map((participant) => {
      const pid = participant.user?._id || participant.user?.id;
      const username = participant.user?.username || participant.user?.name || 'Unknown User';
      const avatar = username.charAt(0).toUpperCase();
      const isParticipantHost = pid === hostId;
      const isMe = pid === currentUserId;
      
      return {
        ...participant,
        pid,
        username,
        avatar,
        isParticipantHost,
        isMe,
      };
    });
  }, [participants, hostId, currentUserId]);

  // After session ends, only host can see participants (like Zoom)
  if (sessionEnded && !isHost) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h4 style={styles.title}>Participants ({processedParticipants.length})</h4>
        </div>
        <div style={styles.sessionEndedMessage}>
          <div style={styles.sessionEndedIcon}>🔒</div>
          <p>Participants are hidden after session ends.</p>
          <p style={styles.sessionEndedSubtext}>Only the host can view participants.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Participants ({processedParticipants.length})</h4>
      </div>
      <div style={styles.list}>
        {processedParticipants.map((participant) => (
          <div 
            key={participant.pid || participant._id} 
            style={styles.participant}
          >
            <div style={styles.left}>
              <div style={styles.avatar}>
                {participant.avatar}
              </div>
              <div style={styles.userInfo}>
                <div style={styles.nameRow}>
                  <span style={styles.name}>
                    {participant.username}
                  </span>
                  {participant.isMe && (
                    <span style={styles.youTag}>You</span>
                  )}
                  {participant.isParticipantHost && (
                    <span style={styles.hostTag}>👑 Host</span>
                  )}
                </div>
                <div style={styles.role}>
                  {participant.isParticipantHost ? 'Host' : 'Viewer'}
                </div>
              </div>
            </div>
            <div style={styles.status}>
              <span style={styles.icon} title={participant.isMuted ? "Muted" : "Unmuted"}>
                {participant.isMuted ? '🔇' : '🔊'}
              </span>
              <span style={styles.icon} title={participant.isCameraOn ? "Camera On" : "Camera Off"}>
                {participant.isCameraOn ? '📹' : '📷'}
              </span>

              {/* Host controls - only show for non-host participants */}
              {isHost && !participant.isMe && !participant.isParticipantHost && (
                <>
                  <button
                    style={{ 
                      ...styles.actionBtn, 
                      color: participant.isMuted ? '#10b981' : '#f59e0b',
                      background: participant.isMuted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                    }}
                    onClick={() => participant.isMuted ? onUnmuteParticipant?.(participant.pid) : onMuteParticipant?.(participant.pid)}
                    title={participant.isMuted ? 'Unmute User' : 'Mute User'}
                  >
                    {participant.isMuted ? '🔊' : '🔇'}
                  </button>
                  <button
                    style={{ ...styles.actionBtn, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
                    onClick={() => onRemoveParticipant?.(participant.pid)}
                    title="Remove from room"
                  >
                    🚫
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {processedParticipants.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>👥</div>
            <p>No participants yet.</p>
            <p style={styles.emptySubtext}>Invite friends to join!</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    background: 'var(--bg-secondary, #16162a)',
  },
  header: { 
    padding: '16px', 
    borderBottom: '1px solid var(--border-color, #2d2d50)',
    background: 'var(--bg-primary, #1a1a2e)',
  },
  title: { 
    margin: 0, 
    fontSize: '16px', 
    fontWeight: '600',
    color: 'var(--text-primary, #fff)',
  },
  list: { 
    flex: 1, 
    overflowY: 'auto', 
    padding: '8px',
  },
  participant: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '12px', 
    borderRadius: '10px', 
    marginBottom: '6px', 
    background: 'var(--bg-card, rgba(255,255,255,0.05))',
    border: '1px solid var(--border-color, transparent)',
    transition: 'all 0.2s ease',
  },
  left: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px',
    minWidth: 0,
    flex: 1,
  },
  avatar: { 
    width: '40px', 
    height: '40px', 
    borderRadius: '50%', 
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: '700', 
    fontSize: '16px', 
    color: 'white',
    flexShrink: 0,
  },
  userInfo: {
    minWidth: 0,
    flex: 1,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  name: { 
    fontWeight: '600', 
    fontSize: '14px',
    color: 'var(--text-primary, #fff)',
  },
  youTag: { 
    color: '#818cf8', 
    fontSize: '11px',
    fontWeight: '600',
    background: 'rgba(129, 140, 248, 0.15)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  hostTag: {
    fontSize: '11px',
  },
  role: { 
    fontSize: '12px', 
    color: 'var(--text-muted, #94a3b8)',
    marginTop: '2px',
  },
  status: { 
    display: 'flex', 
    gap: '8px', 
    alignItems: 'center',
    flexShrink: 0,
  },
  icon: { 
    fontSize: '18px',
    cursor: 'default',
  },
  actionBtn: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    fontSize: '18px', 
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  empty: {
    textAlign: 'center',
    color: 'var(--text-muted, #64748b)',
    marginTop: '60px',
    padding: '20px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: 0.5,
  },
  emptySubtext: {
    fontSize: '12px',
    marginTop: '4px',
  },
  sessionEndedMessage: {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'var(--text-muted, #64748b)',
  },
  sessionEndedIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  sessionEndedSubtext: {
    fontSize: '12px',
    marginTop: '8px',
    opacity: 0.7,
  },
};

export default ParticipantList;
