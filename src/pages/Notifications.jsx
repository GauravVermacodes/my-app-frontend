import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext, FriendContext } from '../App';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

const TYPE_CONFIG = {
  friend_request:          { icon: '👋', label: 'Friend Request',  color: '#d97706', bg: '#fef3c7' },
  friend_request_accepted: { icon: '🎉', label: 'Request Accepted', color: '#059669', bg: '#ecfdf5' },
  meeting_invite:          { icon: '📹', label: 'Meeting Invite',   color: '#92400e', bg: '#fef3c7' },
};

function Notifications() {
  const navigate = useNavigate();
  const {
    notifications, notifLoading,
    fetchNotifications, markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification, deleteAllNotifications,
    unreadCount,
  } = useContext(NotificationContext);
  const { acceptFriendRequest, declineFriendRequest } = useContext(FriendContext);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAccept = async (e, notif) => {
    e.stopPropagation();
    if (!notif.friendRequest) return;
    try {
      await acceptFriendRequest(notif.friendRequest);
      await markNotificationAsRead(notif._id);
      toast.success('Friend request accepted!');
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleDecline = async (e, notif) => {
    e.stopPropagation();
    if (!notif.friendRequest) return;
    try {
      await declineFriendRequest(notif.friendRequest);
      await markNotificationAsRead(notif._id);
      toast.info('Request declined');
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleJoinRoom = (e, notif) => {
    e.stopPropagation();
    markNotificationAsRead(notif._id);
    navigate(`/join/${notif.roomCode}`);
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) await markNotificationAsRead(notif._id);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  return (
    <>
      <style>{`
  @media (max-width: 640px) {
    .nt-page { padding: 16px 12px !important; }
    .nt-title { font-size: 20px !important; }
    .nt-item { padding: 14px !important; gap: 10px !important; }
    .nt-type-icon { font-size: 24px !important; }
    .nt-message { font-size: 13px !important; }
    .nt-action-btn { padding: 8px 12px !important; font-size: 12px !important; }
    .nt-header-actions { width: 100% !important; }
    .nt-header-actions button { flex: 1 !important; }
    .nt-room-info { flex-wrap: wrap !important; gap: 6px !important; }
  }
  .nt-item:hover {
    border-color: #fbbf24 !important;
    box-shadow: 0 6px 20px rgba(217,119,6,0.1) !important;
  }
  .nt-action-btn:hover {
    background: #fef3c7 !important;
    border-color: #fbbf24 !important;
    color: #92400e !important;
  }
  .nt-delete-btn:hover {
    background: #fef2f2 !important;
    color: #dc2626 !important;
    opacity: 1 !important;
  }
`}</style>

      <div className="nt-page" style={s.page}>
        <div style={s.container}>
          {/* Header */}
          <div style={s.header}>
            <div>
              <h1 className="nt-title" style={s.title}>🔔 Notifications</h1>
              {unreadCount > 0 && (
                <p style={s.sub}>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
            <div className="nt-header-actions" style={s.headerActions}>
              {unreadCount > 0 && (
                <button className="nt-action-btn" style={s.actionBtn} onClick={markAllNotificationsAsRead}>
                  ✓ Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="nt-action-btn"
                  style={{ ...s.actionBtn, ...s.dangerBtn }}
                  onClick={() => {
                    if (window.confirm('Delete all notifications?')) deleteAllNotifications();
                  }}
                >
                  🗑 Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          {notifLoading ? (
            <div style={s.center}>⏳ Loading...</div>
          ) : notifications.length === 0 ? (
            <div style={s.empty}>
              <span style={s.emptyIcon}>🔔</span>
              <p style={s.emptyTitle}>No notifications</p>
              <p style={s.emptySub}>You're all caught up!</p>
            </div>
          ) : (
            <div style={s.list}>
              {notifications.map(notif => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.friend_request;
                const time = formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true });

                return (
                  <div
                    key={notif._id}
                    className="nt-item"
                    style={{
                      ...s.item,
                      ...(notif.isRead ? {} : s.itemUnread),
                    }}
                    onClick={() => handleClick(notif)}
                  >
                    {/* Left icon */}
                    <div
                      className="nt-type-icon"
                      style={{
                        ...s.typeIcon,
                        background: cfg.bg,
                        color: cfg.color,
                      }}
                    >
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div style={s.itemContent}>
                      {/* Sender */}
                      {notif.sender && (
                        <div style={s.senderRow}>
                          <div style={s.senderAvatar}>
                            {notif.sender.avatar ? (
                              <img src={notif.sender.avatar} alt="" style={s.senderAvatarImg} />
                            ) : (
                              notif.sender.username?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span style={s.senderName}>{notif.sender.username}</span>
                          <span style={{
                            ...s.typeBadge,
                            color: cfg.color,
                            background: cfg.bg,
                          }}>{cfg.label}</span>
                        </div>
                      )}

                      <p className="nt-message" style={s.message}>{notif.message}</p>
                      <span style={s.time}>{time}</span>

                      {/* Meeting invite room info */}
                      {notif.type === 'meeting_invite' && notif.room && (
                        <div className="nt-room-info" style={s.roomInfo}>
                          <span>📹 {notif.room.name}</span>
                          {notif.roomCode && (
                            <span style={s.roomCode}>Code: {notif.roomCode}</span>
                          )}
                          <span style={{
                            color: notif.room.isActive && notif.room.isSessionLive
                              ? '#059669' : '#94a3b8',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}>
                            {notif.room.isActive && notif.room.isSessionLive ? '🟢 Live' : '⚫ Ended'}
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={s.itemActions}>
                        {notif.type === 'friend_request' && !notif.isRead && (
                          <>
                            <button style={s.acceptBtn} onClick={e => handleAccept(e, notif)}>
                              ✓ Accept
                            </button>
                            <button style={s.declineBtn} onClick={e => handleDecline(e, notif)}>
                              ✕ Decline
                            </button>
                          </>
                        )}
                        {notif.type === 'meeting_invite' && notif.roomCode && (
                          <button style={s.joinBtn} onClick={e => handleJoinRoom(e, notif)}>
                            📹 Join Meeting
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right side */}
                    <div style={s.itemRight}>
                      {!notif.isRead && <span style={s.unreadDot} />}
                      <button
                        className="nt-delete-btn"
                        style={s.deleteBtn}
                        onClick={e => handleDelete(e, notif._id)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const s = {
  page: {
    minHeight: 'calc(100vh - 70px)',
    background: 'linear-gradient(180deg, #f4f2ee 0%, #eeece7 100%)',
    padding: '32px 20px',
    color: '#1c1c1e',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  container: { maxWidth: '760px', margin: '0 auto' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    color: '#1c1c1e',
    letterSpacing: '-0.02em',
  },
  sub: {
    margin: '4px 0 0',
    color: '#6e6e73',
    fontSize: '14px',
    fontWeight: 500,
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    padding: '9px 16px',
    background: '#ffffff',
    border: '1px solid #e8e5df',
    borderRadius: '10px',
    color: '#6e6e73',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  dangerBtn: {
    color: '#dc2626',
    borderColor: '#fecaca',
    background: '#fef2f2',
  },
  center: {
    textAlign: 'center',
    color: '#6e6e73',
    padding: '40px',
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e8e5df',
    fontWeight: 500,
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6e6e73',
    background: '#ffffff',
    borderRadius: '20px',
    border: '1px dashed #e8e5df',
    boxShadow: '0 2px 8px rgba(28,28,30,0.04)',
  },
  emptyIcon: {
    fontSize: '56px',
    display: 'block',
    marginBottom: '16px',
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1c1c1e',
  },
  emptySub: {
    margin: 0,
    fontSize: '14px',
    color: '#8e8e93',
    fontWeight: 500,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  item: {
    display: 'flex',
    gap: '14px',
    padding: '18px',
    background: '#ffffff',
    border: '1px solid #e8e5df',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    boxShadow: '0 2px 6px rgba(28,28,30,0.04)',
  },
  itemUnread: {
    background: '#fffbf0',
    borderColor: '#fbbf24',
    borderLeft: '4px solid #d97706',
  },
  typeIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
    marginTop: '2px',
    border: '1px solid transparent',
  },
  itemContent: { flex: 1, minWidth: 0 },
  senderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
    flexWrap: 'wrap',
  },
  senderAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#fbbf24,#d97706)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '0 2px 4px rgba(217,119,6,0.25)',
  },
  senderAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  senderName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1c1c1e',
  },
  typeBadge: {
    fontSize: '11px',
    fontWeight: '700',
    marginLeft: 'auto',
    padding: '3px 8px',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
    border: '1px solid transparent',
  },
  message: {
    margin: '0 0 6px',
    fontSize: '14px',
    color: '#1c1c1e',
    lineHeight: '1.5',
    wordBreak: 'break-word',
    fontWeight: 500,
  },
  time: {
    fontSize: '12px',
    color: '#8e8e93',
    fontWeight: 500,
  },
  roomInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
    padding: '10px 12px',
    background: '#faf7f0',
    border: '1px solid #e8e5df',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#6e6e73',
    fontWeight: '600',
  },
  roomCode: {
    fontFamily: 'monospace',
    color: '#d97706',
    fontSize: '12px',
    background: '#fef3c7',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 700,
    border: '1px solid #fde68a',
  },
  itemActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
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
  joinBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
    boxShadow: '0 3px 8px rgba(217,119,6,0.3)',
    fontFamily: 'inherit',
  },
  itemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    flexShrink: 0,
  },
  unreadDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #fbbf24, #d97706)',
    display: 'block',
    boxShadow: '0 0 0 3px rgba(217,119,6,0.15)',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8e8e93',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '6px 8px',
    borderRadius: '6px',
    opacity: 0.6,
    transition: 'all 0.2s',
  },
};

export default Notifications;