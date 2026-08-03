import React from 'react';

function WaitingRoomPanel({ waiting, onApprove, onReject }) {
  if (waiting.length === 0) {
    return (
      <div style={s.empty}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
        <p>No one waiting</p>
        <p style={{ fontSize: '12px', color: '#64748b' }}>
          People who join will appear here for approval.
        </p>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span>Waiting ({waiting.length})</span>
        {waiting.length > 1 && (
          <button
            style={s.btnApproveAll}
            onClick={() => waiting.forEach(p => onApprove(p._id))}
          >
            Approve All
          </button>
        )}
      </div>
      <div style={s.list}>
        {waiting.map(p => {
          const name = p.isGuest ? p.guestName : p.user?.username;
          const avatar = name?.charAt(0)?.toUpperCase() || '?';

          return (
            <div key={p._id} style={s.item}>
              <div style={s.info}>
                <div style={s.avatar}>{avatar}</div>
                <div>
                  <div style={s.name}>{name}</div>
                  <div style={s.type}>
                    {p.isGuest ? '👤 Guest' : '✓ Registered user'}
                  </div>
                </div>
              </div>
              <div style={s.actions}>
                <button style={s.btnApprove} onClick={() => onApprove(p._id)}>
                  ✓ Admit
                </button>
                <button style={s.btnReject} onClick={() => onReject(p._id)}>
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  container: { height: '100%', display: 'flex', flexDirection: 'column' },
  header: {
    padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontWeight: '600',
  },
  list: { flex: 1, overflowY: 'auto', padding: '8px' },
  item: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px', borderRadius: '8px', marginBottom: '6px',
    background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
  },
  info: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold',
  },
  name: { fontSize: '14px', fontWeight: '500' },
  type: { fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  actions: { display: 'flex', gap: '4px' },
  btnApprove: {
    padding: '6px 12px', borderRadius: '6px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
  },
  btnReject: {
    padding: '6px 10px', borderRadius: '6px',
    background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontSize: '12px',
  },
  btnApproveAll: {
    padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
    background: 'rgba(16,185,129,0.15)', color: '#6ee7b7',
    border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer',
  },
  empty: { textAlign: 'center', color: '#94a3b8', padding: '40px 20px' },
};

export default WaitingRoomPanel;