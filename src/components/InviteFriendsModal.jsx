import React, { useContext, useState, useEffect } from 'react';
import { FriendContext } from '../App';
import roomService from '../services/roomService';
import { toast } from 'react-toastify';

const TABS = [
  { id: 'all',      label: '📢 All Friends',    icon: '👥' },
  { id: 'select',   label: '✅ Select Friends', icon: '🎯' },
];

function InviteFriendsModal({ isOpen, onClose, roomId, roomName, roomCode }) {
  const { friends, fetchFriends } = useContext(FriendContext);
  const [activeTab, setActiveTab]         = useState('all');
  const [selectedIds, setSelectedIds]     = useState(new Set());
  const [filter, setFilter]               = useState('');
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      setSelectedIds(new Set());
      setFilter('');
      setResult(null);
      setActiveTab('all');
    }
  }, [isOpen]);

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(filter.toLowerCase()) ||
    f.email.toLowerCase().includes(filter.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredFriends.map(f => f._id)));
  };

  const clearAll = () => {
    setSelectedIds(new Set());
  };

  // ✅ Send to all friends
  const handleInviteAll = async () => {
    if (friends.length === 0) {
      toast.warning('You have no friends to invite');
      return;
    }

    if (!window.confirm(`Send invitation to all ${friends.length} friend(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      const data = await roomService.inviteFriends(roomId, {
        inviteAll: true,
      });
      toast.success(`✉️ Invited ${data.invited} friend(s)!`);
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invites');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Send to selected friends
  const handleInviteSelected = async () => {
    if (selectedIds.size === 0) {
      toast.warning('Select at least one friend');
      return;
    }

    setLoading(true);
    try {
      const data = await roomService.inviteFriends(roomId, {
        friendIds: [...selectedIds],
        inviteAll: false,
      });
      toast.success(`✉️ Invited ${data.invited} friend(s)!`);
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invites');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${roomCode}`);
    toast.success('Link copied!');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('Code copied!');
  };

  if (!isOpen) return null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Invite Friends</h2>
            <p style={s.subtitle}>to "{roomName}"</p>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Quick share */}
        <div style={s.quickShare}>
          <div style={s.codeBox}>
            <span style={s.codeLabel}>Meeting Code:</span>
            <span style={s.code}>{roomCode}</span>
          </div>
          <div style={s.quickBtns}>
            <button style={s.quickBtn} onClick={copyCode}>📋 Code</button>
            <button style={s.quickBtn} onClick={copyLink}>🔗 Link</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Success result */}
        {result && (
          <div style={s.successBox}>
            <span style={s.successIcon}>✅</span>
            <div>
              <p style={s.successText}>
                Invited {result.invited} friend{result.invited !== 1 ? 's' : ''}!
              </p>
              {result.invitedTo && result.invitedTo.length > 0 && (
                <p style={s.successSub}>
                  {result.invitedTo.slice(0, 3).join(', ')}
                  {result.invitedTo.length > 3 && ` and ${result.invitedTo.length - 3} more`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ══ ALL FRIENDS TAB ══ */}
        {activeTab === 'all' && !result && (
          <div style={s.tabContent}>
            <div style={s.allInfo}>
              <div style={s.allIcon}>👥</div>
              <h3 style={s.allTitle}>Broadcast to All Friends</h3>
              <p style={s.allDesc}>
                Send invitation to <strong>{friends.length} friend{friends.length !== 1 ? 's' : ''}</strong>
                {' '}via notification
              </p>
            </div>

            {friends.length > 0 && (
              <div style={s.friendsPreview}>
                <p style={s.previewLabel}>Will send to:</p>
                <div style={s.avatarStack}>
                  {friends.slice(0, 8).map(f => (
                    <div key={f._id} style={s.stackAvatar} title={f.username}>
                      {f.avatar ? (
                        <img src={f.avatar} alt="" style={s.stackImg} />
                      ) : (
                        f.username.charAt(0).toUpperCase()
                      )}
                    </div>
                  ))}
                  {friends.length > 8 && (
                    <div style={{ ...s.stackAvatar, ...s.stackMore }}>
                      +{friends.length - 8}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              style={{
                ...s.primaryBtn,
                ...(friends.length === 0 || loading ? s.btnDisabled : {}),
              }}
              onClick={handleInviteAll}
              disabled={friends.length === 0 || loading}
            >
              {loading
                ? '⏳ Sending...'
                : `📢 Send to All ${friends.length} Friend${friends.length !== 1 ? 's' : ''}`
              }
            </button>

            {friends.length === 0 && (
              <p style={s.emptyMsg}>
                You have no friends to invite yet. Add friends from the Friends tab!
              </p>
            )}
          </div>
        )}

        {/* ══ SELECT FRIENDS TAB ══ */}
        {activeTab === 'select' && !result && (
          <div style={s.tabContent}>
            {friends.length === 0 ? (
              <div style={s.empty}>
                <span style={s.emptyIcon}>👥</span>
                <p>No friends to invite</p>
                <p style={s.emptySub}>Add friends from the Friends page first</p>
              </div>
            ) : (
              <>
                {/* Search */}
                <input
                  type="text"
                  placeholder="🔍 Search friends..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={s.searchInput}
                />

                {/* Select controls */}
                <div style={s.selectControls}>
                  <span style={s.selectedCount}>
                    ✅ {selectedIds.size} selected
                  </span>
                  <div style={s.selectBtns}>
                    <button style={s.miniBtn} onClick={selectAll}>
                      Select All
                    </button>
                    {selectedIds.size > 0 && (
                      <button style={s.miniBtn} onClick={clearAll}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Friend list with checkboxes */}
                <div style={s.friendList}>
                  {filteredFriends.length === 0 ? (
                    <p style={s.noResults}>No matching friends</p>
                  ) : (
                    filteredFriends.map(friend => {
                      const selected = selectedIds.has(friend._id);
                      return (
                        <div
                          key={friend._id}
                          style={{
                            ...s.friendItem,
                            ...(selected ? s.friendItemSelected : {}),
                          }}
                          onClick={() => toggleSelect(friend._id)}
                        >
                          {/* Checkbox */}
                          <div style={{
                            ...s.checkbox,
                            ...(selected ? s.checkboxOn : {}),
                          }}>
                            {selected && '✓'}
                          </div>

                          {/* Avatar */}
                          <div style={s.avatar}>
                            {friend.avatar ? (
                              <img src={friend.avatar} alt="" style={s.avatarImg} />
                            ) : (
                              friend.username.charAt(0).toUpperCase()
                            )}
                            <span style={{
                              ...s.onlineDot,
                              background: friend.isOnline ? '#10b981' : '#64748b',
                            }} />
                          </div>

                          {/* Info */}
                          <div style={s.friendInfo}>
                            <p style={s.friendName}>{friend.username}</p>
                            <p style={s.friendStatus}>
                              {friend.isOnline ? '🟢 Online' : '⚫ Offline'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send button */}
                <button
                  style={{
                    ...s.primaryBtn,
                    ...(selectedIds.size === 0 || loading ? s.btnDisabled : {}),
                  }}
                  onClick={handleInviteSelected}
                  disabled={selectedIds.size === 0 || loading}
                >
                  {loading
                    ? '⏳ Sending...'
                    : `📨 Send to ${selectedIds.size} Selected Friend${selectedIds.size !== 1 ? 's' : ''}`
                  }
                </button>
              </>
            )}
          </div>
        )}

        {/* Done button after success */}
        {result && (
          <button style={s.doneBtn} onClick={onClose}>
            ✓ Done
          </button>
        )}
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 10000, padding: '20px',
  },
  modal: {
    background: 'linear-gradient(180deg,#1a1a2e,#16162a)',
    borderRadius: '20px',
    width: '100%', maxWidth: '520px',
    maxHeight: '90vh',
    display: 'flex', flexDirection: 'column',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  title: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#fff' },
  subtitle: { margin: '4px 0 0', color: '#94a3b8', fontSize: '14px' },
  closeBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: 'none', color: '#94a3b8',
    width: '32px', height: '32px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '16px',
  },
  quickShare: {
    display: 'flex', gap: '10px',
    padding: '14px 24px',
    background: 'rgba(99,102,241,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    flexShrink: 0,
  },
  codeBox: {
    flex: 1,
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(0,0,0,0.3)',
    padding: '8px 14px', borderRadius: '10px',
  },
  codeLabel: { color: '#64748b', fontSize: '12px' },
  code: {
    color: '#a5b4fc', fontWeight: '700',
    fontFamily: 'monospace', fontSize: '14px',
  },
  quickBtns: { display: 'flex', gap: '6px' },
  quickBtn: {
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '12px', fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  tabs: {
    display: 'flex', gap: '4px',
    padding: '12px 24px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    flexShrink: 0,
  },
  tab: {
    flex: 1, padding: '12px 8px',
    background: 'transparent', color: '#94a3b8',
    border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '500',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#a5b4fc',
    borderBottomColor: '#6366f1',
  },
  tabContent: {
    padding: '24px',
    flex: 1, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '16px',
  },

  // All Friends Tab
  allInfo: { textAlign: 'center', padding: '10px 0' },
  allIcon: { fontSize: '48px', marginBottom: '12px' },
  allTitle: { margin: '0 0 8px', fontSize: '18px', fontWeight: '700' },
  allDesc: { margin: 0, color: '#94a3b8', fontSize: '14px' },
  friendsPreview: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px', padding: '16px',
  },
  previewLabel: { margin: '0 0 12px', fontSize: '12px', color: '#64748b' },
  avatarStack: {
    display: 'flex', flexWrap: 'wrap', gap: '4px',
  },
  stackAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '13px', color: '#fff',
    border: '2px solid #1a1a2e',
    overflow: 'hidden',
  },
  stackImg: { width: '100%', height: '100%', objectFit: 'cover' },
  stackMore: {
    background: 'rgba(255,255,255,0.1)',
    fontSize: '11px',
  },

  // Select Friends Tab
  searchInput: {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#fff',
    fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  selectControls: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCount: { color: '#a5b4fc', fontSize: '13px', fontWeight: '500' },
  selectBtns: { display: 'flex', gap: '12px' },
  miniBtn: {
    background: 'transparent', border: 'none',
    color: '#818cf8', fontSize: '12px',
    cursor: 'pointer', fontWeight: '500',
  },
  friendList: {
    display: 'flex', flexDirection: 'column', gap: '6px',
    maxHeight: '280px', overflowY: 'auto',
    padding: '4px 0',
  },
  noResults: { textAlign: 'center', color: '#64748b', padding: '30px' },
  friendItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '2px solid transparent',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  friendItemSelected: {
    background: 'rgba(99,102,241,0.15)',
    borderColor: 'rgba(99,102,241,0.4)',
  },
  checkbox: {
    width: '22px', height: '22px', borderRadius: '6px',
    border: '2px solid rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: 'bold', color: '#fff',
    transition: 'all 0.2s', flexShrink: 0,
  },
  checkboxOn: {
    background: '#6366f1',
    borderColor: '#6366f1',
  },
  avatar: {
    position: 'relative',
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '15px', color: '#fff',
    overflow: 'hidden', flexShrink: 0,
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  onlineDot: {
    position: 'absolute', bottom: '0', right: '0',
    width: '10px', height: '10px', borderRadius: '50%',
    border: '2px solid #1a1a2e',
  },
  friendInfo: { flex: 1, minWidth: 0 },
  friendName: { margin: 0, fontWeight: '600', fontSize: '14px' },
  friendStatus: { margin: '2px 0 0', fontSize: '12px', color: '#64748b' },

  // Buttons
  primaryBtn: {
    padding: '14px', marginTop: '8px',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    border: 'none', borderRadius: '12px',
    color: '#fff', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  doneBtn: {
    margin: '24px', padding: '14px',
    background: 'linear-gradient(135deg,#10b981,#059669)',
    border: 'none', borderRadius: '12px',
    color: '#fff', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer',
  },

  // Success
  successBox: {
    margin: '16px 24px',
    padding: '16px',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '12px',
    display: 'flex', gap: '12px', alignItems: 'flex-start',
  },
  successIcon: { fontSize: '24px' },
  successText: { margin: 0, color: '#6ee7b7', fontWeight: '600', fontSize: '14px' },
  successSub: { margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' },

  // Empty states
  empty: { textAlign: 'center', padding: '40px 20px', color: '#64748b' },
  emptyIcon: { fontSize: '48px', display: 'block', marginBottom: '12px' },
  emptySub: { fontSize: '13px', color: '#475569', marginTop: '6px' },
  emptyMsg: {
    textAlign: 'center', padding: '16px',
    background: 'rgba(251,191,36,0.05)',
    border: '1px solid rgba(251,191,36,0.2)',
    borderRadius: '10px', color: '#fbbf24',
    fontSize: '13px',
  },
};

export default InviteFriendsModal;