import React, { useContext, useEffect, useState, useCallback } from 'react';
import { FriendContext, AuthContext } from '../App';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const TABS = ['Friends', 'Requests', 'Sent', 'Find People'];

function Friends() {
  const {
    friends, pendingRequests, sentRequests,
    fetchFriends, fetchPendingRequests, fetchSentRequests,
    acceptFriendRequest, declineFriendRequest,
    sendFriendRequest, removeFriend,
  } = useContext(FriendContext);

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
    fetchSentRequests();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await authService.searchUsers(searchQuery.trim());
        setSearchResults(data.users || []);
      } catch (err) {
        toast.error('Search failed');
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const setLoading = (id, val) =>
    setActionLoading(prev => ({ ...prev, [id]: val }));

  const handleSendRequest = async (userId) => {
    setLoading(userId, true);
    try {
      await sendFriendRequest(userId);
      toast.success('Friend request sent!');
      setSearchResults(prev =>
        prev.map(u => u._id === userId ? { ...u, requestSent: true } : u)
      );
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
    } finally {
      setLoading(userId, false);
    }
  };

  const handleAccept = async (reqId) => {
    setLoading(reqId, true);
    try {
      await acceptFriendRequest(reqId);
      toast.success('Friend request accepted!');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoading(reqId, false);
    }
  };

  const handleDecline = async (reqId) => {
    setLoading(reqId, true);
    try {
      await declineFriendRequest(reqId);
      toast.info('Request declined');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoading(reqId, false);
    }
  };

  const handleRemove = async (friendId, username) => {
    if (!window.confirm(`Remove ${username} from friends?`)) return;
    setLoading(friendId, true);
    try {
      await removeFriend(friendId);
      toast.info('Friend removed');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoading(friendId, false);
    }
  };

  return (
    <>
      <style>{`
  @media (max-width: 640px) {
    .fr-page { padding: 16px 12px !important; }
    .fr-title { font-size: 20px !important; }
    .fr-content { padding: 16px !important; border-radius: 16px !important; }
    .fr-tabs { padding: 3px !important; gap: 2px !important; }
    .fr-tab { padding: 8px 10px !important; font-size: 12px !important; flex: 1 1 auto !important; }
    .fr-person-card { padding: 12px !important; gap: 10px !important; flex-wrap: wrap !important; }
    .fr-person-name { font-size: 14px !important; }
    .fr-person-sub { font-size: 12px !important; }
    .fr-btn-group { width: 100% !important; margin-top: 4px !important; }
    .fr-danger-btn, .fr-accept-btn, .fr-add-btn { font-size: 12px !important; padding: 7px 12px !important; }
  }
  @media (max-width: 420px) {
    .fr-tabs { display: grid !important; grid-template-columns: 1fr 1fr !important; }
    .fr-tab { flex: unset !important; }
  }
  .fr-person-card:hover {
    border-color: #fbbf24 !important;
    box-shadow: 0 6px 20px rgba(217,119,6,0.1) !important;
  }
  .fr-search-input:focus {
    border-color: #d97706 !important;
    box-shadow: 0 0 0 3px rgba(217,119,6,0.12) !important;
    background: #ffffff !important;
  }
`}</style>

      <div className="fr-page" style={s.page}>
        <div style={s.container}>
          <h1 className="fr-title" style={s.pageTitle}>👥 Friends</h1>

          {/* Tabs */}
          <div className="fr-tabs" style={s.tabs}>
            {TABS.map((tab, i) => (
              <button
                key={tab}
                className="fr-tab"
                style={{ ...s.tab, ...(activeTab === i ? s.tabActive : {}) }}
                onClick={() => setActiveTab(i)}
              >
                {tab}
                {i === 1 && pendingRequests.length > 0 && (
                  <span style={s.tabBadge}>{pendingRequests.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="fr-content" style={s.content}>
            {/* ── FRIENDS ── */}
            {activeTab === 0 && (
              <div>
                {friends.length === 0 ? (
                  <EmptyState
                    icon="👥"
                    title="No friends yet"
                    sub='Use the "Find People" tab to add friends'
                  />
                ) : (
                  <div style={s.list}>
                    {friends.map(f => (
                      <div key={f._id} className="fr-person-card" style={s.personCard}>
                        <Avatar user={f} />
                        <div style={s.personInfo}>
                          <span className="fr-person-name" style={s.personName}>{f.username}</span>
                          <span className="fr-person-sub" style={s.personSub}>{f.email}</span>
                          <span style={{
                            ...s.onlineDot,
                            color: f.isOnline ? '#059669' : '#94a3b8',
                          }}>
                            {f.isOnline ? '🟢 Online' : '⚫ Offline'}
                          </span>
                        </div>
                        <button
                          className="fr-danger-btn"
                          style={s.dangerBtn}
                          onClick={() => handleRemove(f._id, f.username)}
                          disabled={actionLoading[f._id]}
                        >
                          {actionLoading[f._id] ? '⏳' : '✕ Remove'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── REQUESTS ── */}
            {activeTab === 1 && (
              <div>
                {pendingRequests.length === 0 ? (
                  <EmptyState icon="📭" title="No pending requests" sub="You're all caught up!" />
                ) : (
                  <div style={s.list}>
                    {pendingRequests.map(req => (
                      <div key={req._id} className="fr-person-card" style={s.personCard}>
                        <Avatar user={req.sender} />
                        <div style={s.personInfo}>
                          <span className="fr-person-name" style={s.personName}>{req.sender?.username}</span>
                          <span className="fr-person-sub" style={s.personSub}>{req.sender?.email}</span>
                          <span style={s.timeAgo}>Sent a friend request</span>
                        </div>
                        <div className="fr-btn-group" style={s.reqActions}>
                          <button
                            className="fr-accept-btn"
                            style={s.acceptBtn}
                            onClick={() => handleAccept(req._id)}
                            disabled={actionLoading[req._id]}
                          >
                            {actionLoading[req._id] ? '⏳' : '✓ Accept'}
                          </button>
                          <button
                            style={s.declineBtn}
                            onClick={() => handleDecline(req._id)}
                            disabled={actionLoading[req._id]}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SENT ── */}
            {activeTab === 2 && (
              <div>
                {sentRequests.length === 0 ? (
                  <EmptyState icon="📤" title="No sent requests" sub="Find friends using the search tab" />
                ) : (
                  <div style={s.list}>
                    {sentRequests.map(req => (
                      <div key={req._id} className="fr-person-card" style={s.personCard}>
                        <Avatar user={req.recipient} />
                        <div style={s.personInfo}>
                          <span className="fr-person-name" style={s.personName}>{req.recipient?.username}</span>
                          <span className="fr-person-sub" style={s.personSub}>{req.recipient?.email}</span>
                        </div>
                        <span style={s.pendingBadge}>⏳ Pending</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── FIND PEOPLE ── */}
            {activeTab === 3 && (
              <div>
                <div style={s.searchBox}>
                  <input
                    type="text"
                    className="fr-search-input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by username or email..."
                    style={s.searchInput}
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      style={s.clearBtn}
                      onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {searchLoading && (
                  <div style={s.center}>⏳ Searching...</div>
                )}

                {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <EmptyState icon="🔍" title={`No results for "${searchQuery}"`} sub="Try a different name or email" />
                )}

                {searchResults.length > 0 && (
                  <div style={s.list}>
                    {searchResults.map(u => (
                      <div key={u._id} className="fr-person-card" style={s.personCard}>
                        <Avatar user={u} />
                        <div style={s.personInfo}>
                          <span className="fr-person-name" style={s.personName}>{u.username}</span>
                          <span className="fr-person-sub" style={s.personSub}>{u.email}</span>
                          <span style={{
                            ...s.onlineDot,
                            color: u.isOnline ? '#059669' : '#94a3b8',
                          }}>
                            {u.isOnline ? '🟢 Online' : '⚫ Offline'}
                          </span>
                        </div>
                        {u.isFriend ? (
                          <span style={s.friendBadge}>✓ Friends</span>
                        ) : u.requestSent ? (
                          <span style={s.pendingBadge}>⏳ Sent</span>
                        ) : (
                          <button
                            className="fr-add-btn"
                            style={s.addBtn}
                            onClick={() => handleSendRequest(u._id)}
                            disabled={actionLoading[u._id]}
                          >
                            {actionLoading[u._id] ? '⏳' : '+ Add'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
                  <p style={s.hint}>Type at least 2 characters to search</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Avatar({ user }) {
  return (
    <div style={av.wrap}>
      {user?.avatar ? (
        <img src={user.avatar} alt="" style={av.img} />
      ) : (
        <div style={av.placeholder}>
          {(user?.username || '?').charAt(0).toUpperCase()}
        </div>
      )}
      <span style={{
        ...av.dot,
        background: user?.isOnline ? '#10b981' : '#cbd5e1',
      }} />
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={s.emptyState}>
      <span style={s.emptyIcon}>{icon}</span>
      <p style={s.emptyTitle}>{title}</p>
      {sub && <p style={s.emptySub}>{sub}</p>}
    </div>
  );
}

const av = {
  wrap: { position: 'relative', flexShrink: 0 },
  img: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #fef3c7',
  },
  placeholder: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#fbbf24,#d97706)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
    color: '#fff',
    boxShadow: '0 2px 6px rgba(217,119,6,0.25)',
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid #ffffff',
  },
};

const s = {
  page: {
    minHeight: 'calc(100vh - 70px)',
    background: 'linear-gradient(180deg, #f4f2ee 0%, #eeece7 100%)',
    padding: '32px 20px',
    color: '#1c1c1e',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  container: { maxWidth: '760px', margin: '0 auto' },
  pageTitle: {
    margin: '0 0 24px',
    fontSize: '24px',
    fontWeight: '800',
    color: '#1c1c1e',
    letterSpacing: '-0.02em',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    background: '#ffffff',
    border: '1px solid #e8e5df',
    borderRadius: '14px',
    padding: '5px',
    marginBottom: '20px',
    boxShadow: '0 2px 6px rgba(28,28,30,0.04)',
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: '#8e8e93',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    position: 'relative',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    color: '#ffffff',
    fontWeight: '700',
    boxShadow: '0 3px 10px rgba(217,119,6,0.3)',
  },
  tabBadge: {
    marginLeft: '6px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '10px',
  },
  content: {
    background: '#ffffff',
    border: '1px solid #e8e5df',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(28,28,30,0.04)',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  personCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    borderRadius: '14px',
    background: '#faf7f0',
    border: '1px solid #e8e5df',
    transition: 'all 0.2s ease',
  },
  personInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  personName: {
    fontWeight: '700',
    fontSize: '15px',
    color: '#1c1c1e',
    wordBreak: 'break-word',
  },
  personSub: {
    color: '#8e8e93',
    fontSize: '13px',
    wordBreak: 'break-word',
    fontWeight: 500,
  },
  onlineDot: { fontSize: '12px', marginTop: '2px', fontWeight: 600 },
  timeAgo: { color: '#8e8e93', fontSize: '12px', fontWeight: 500 },
  reqActions: { display: 'flex', gap: '8px' },
  acceptBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
    boxShadow: '0 3px 8px rgba(16,185,129,0.3)',
    fontFamily: 'inherit',
  },
  declineBtn: {
    padding: '8px 14px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
  },
  dangerBtn: {
    padding: '8px 14px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    fontWeight: '600',
    fontFamily: 'inherit',
  },
  addBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
    boxShadow: '0 3px 8px rgba(217,119,6,0.3)',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  },
  friendBadge: {
    padding: '6px 12px',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    color: '#059669',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  pendingBadge: {
    padding: '6px 12px',
    background: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
    color: '#92400e',
    fontSize: '13px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  searchBox: {
    position: 'relative',
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '14px 44px 14px 16px',
    background: '#faf7f0',
    border: '1.5px solid #e8e5df',
    borderRadius: '14px',
    color: '#1c1c1e',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    fontWeight: 500,
  },
  clearBtn: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: '#8e8e93',
    cursor: 'pointer',
    fontSize: '16px',
  },
  center: {
    textAlign: 'center',
    color: '#6e6e73',
    padding: '20px',
    fontWeight: 500,
  },
  hint: {
    textAlign: 'center',
    color: '#8e8e93',
    fontSize: '13px',
    marginTop: '12px',
    fontWeight: 500,
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 20px',
    color: '#6e6e73',
  },
  emptyIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '12px',
  },
  emptyTitle: {
    margin: '0 0 6px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1c1c1e',
  },
  emptySub: {
    margin: 0,
    fontSize: '13px',
    color: '#8e8e93',
    fontWeight: 500,
  },
};

export default Friends;