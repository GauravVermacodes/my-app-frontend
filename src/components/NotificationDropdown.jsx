import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext, FriendContext } from '../App';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  friend_request: {
    icon: '👋',
    label: 'Friend Request',
    bgColor: '#eff6ff',
    iconColor: '#3b82f6',
    borderColor: '#dbeafe',
  },
  friend_request_accepted: {
    icon: '🎉',
    label: 'Request Accepted',
    bgColor: '#ecfdf5',
    iconColor: '#059669',
    borderColor: '#a7f3d0',
  },
  meeting_invite: {
    icon: '📹',
    label: 'Meeting Invite',
    bgColor: '#f5f3ff',
    iconColor: '#7c3aed',
    borderColor: '#ddd6fe',
  },
  default: {
    icon: '🔔',
    label: 'Notification',
    bgColor: '#f8fafc',
    iconColor: '#64748b',
    borderColor: '#e2e8f0',
  },
};

function NotificationDropdown({ onClose }) {
  const navigate = useNavigate();
  const {
    notifications, unreadCount,
    markNotificationAsRead, markAllNotificationsAsRead,
    deleteNotification,
  } = useContext(NotificationContext);
  const { acceptFriendRequest, declineFriendRequest } = useContext(FriendContext);

  const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.default;

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif._id);
    }
    if (notif.type === 'meeting_invite' && notif.roomCode) {
      onClose();
      navigate(`/join/${notif.roomCode}`);
    }
  };

  const handleAcceptFriend = async (e, notif) => {
    e.stopPropagation();
    if (notif.friendRequest) {
      await acceptFriendRequest(notif.friendRequest);
      await markNotificationAsRead(notif._id);
    }
  };

  const handleDeclineFriend = async (e, notif) => {
    e.stopPropagation();
    if (notif.friendRequest) {
      await declineFriendRequest(notif.friendRequest);
      await markNotificationAsRead(notif._id);
    }
  };

  const handleJoinRoom = (e, notif) => {
    e.stopPropagation();
    markNotificationAsRead(notif._id);
    onClose();
    navigate(`/join/${notif.roomCode}`);
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    await deleteNotification(notifId);
  };

  return (
    <>
      <style>{`
        @media (max-width: 480px) {
          .notif-dropdown {
            width: calc(100vw - 24px) !important;
            right: -12px !important;
            max-width: 380px;
          }
        }
        .notif-item:hover {
          background: #f8fafc !important;
        }
        .notif-item-unread:hover {
          background: #f5f3ff !important;
        }
        .notif-delete-btn:hover {
          background: #fef2f2 !important;
          color: #dc2626 !important;
          opacity: 1 !important;
        }
        .notif-list::-webkit-scrollbar {
          width: 6px;
        }
        .notif-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .notif-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .notif-list::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <div className="notif-dropdown" style={styles.dropdown}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <span style={styles.headerIcon}>🔔</span>
            <span style={styles.headerText}>Notifications</span>
            {unreadCount > 0 && (
              <span style={styles.headerBadge}>{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              style={styles.markAllBtn}
              onClick={markAllNotificationsAsRead}
              title="Mark all as read"
            >
              ✓ Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="notif-list" style={styles.list}>
          {notifications.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIconWrap}>
                <span style={styles.emptyIcon}>🔔</span>
              </div>
              <p style={styles.emptyTitle}>All caught up!</p>
              <p style={styles.emptyText}>No new notifications</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notif) => {
              const config = getConfig(notif.type);
              const time = formatDistanceToNow(new Date(notif.createdAt), {
                addSuffix: true,
              });

              return (
                <div
                  key={notif._id}
                  className={`notif-item ${!notif.isRead ? 'notif-item-unread' : ''}`}
                  style={{
                    ...styles.item,
                    ...(notif.isRead ? {} : styles.itemUnread),
                  }}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {/* Type icon */}
                  <div
                    style={{
                      ...styles.itemIcon,
                      background: config.bgColor,
                      color: config.iconColor,
                      borderColor: config.borderColor,
                    }}
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div style={styles.itemContent}>
                    {/* Sender info */}
                    {notif.sender && (
                      <div style={styles.itemSender}>
                        {notif.sender.avatar ? (
                          <img
                            src={notif.sender.avatar}
                            alt=""
                            style={styles.senderAvatar}
                          />
                        ) : (
                          <div style={styles.senderAvatarPlaceholder}>
                            {notif.sender.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                        <span style={styles.senderName}>
                          {notif.sender.username}
                        </span>
                        <span style={styles.typeLabel}>
                          · {config.label}
                        </span>
                      </div>
                    )}

                    {/* Message */}
                    <p style={styles.itemMessage}>{notif.message}</p>
                    <span style={styles.itemTime}>{time}</span>

                    {/* Meeting room info */}
                    {notif.type === 'meeting_invite' && notif.room && (
                      <div style={styles.roomChip}>
                        <span style={styles.roomChipIcon}>📹</span>
                        <span style={styles.roomChipName}>
                          {notif.room.name}
                        </span>
                        {notif.roomCode && (
                          <span style={styles.roomChipCode}>
                            {notif.roomCode}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    {notif.type === 'friend_request' && !notif.isRead && (
                      <div style={styles.itemActions}>
                        <button
                          style={styles.acceptBtn}
                          onClick={(e) => handleAcceptFriend(e, notif)}
                        >
                          ✓ Accept
                        </button>
                        <button
                          style={styles.declineBtn}
                          onClick={(e) => handleDeclineFriend(e, notif)}
                        >
                          ✕ Decline
                        </button>
                      </div>
                    )}

                    {notif.type === 'meeting_invite' && notif.roomCode && (
                      <button
                        style={styles.joinBtn}
                        onClick={(e) => handleJoinRoom(e, notif)}
                      >
                        <span>📹</span>
                        <span>Join Meeting</span>
                        <span style={styles.joinArrow}>→</span>
                      </button>
                    )}
                  </div>

                  {/* Right side: unread dot + delete */}
                  <div style={styles.itemRight}>
                    {!notif.isRead && <span style={styles.unreadDot} />}
                    <button
                      className="notif-delete-btn"
                      style={styles.deleteBtn}
                      onClick={(e) => handleDelete(e, notif._id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div style={styles.footer}>
            <button
              style={styles.viewAllBtn}
              onClick={() => {
                onClose();
                navigate('/notifications');
              }}
            >
              View All Notifications
              <span style={styles.viewAllArrow}>→</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    right: 0,
    width: '400px',
    maxHeight: '540px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    borderBottom: '1px solid #f1f5f9',
    background: 'linear-gradient(135deg, #fafbff 0%, #ffffff 100%)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerIcon: {
    fontSize: '20px',
  },
  headerText: {
    fontWeight: '700',
    fontSize: '16px',
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  headerBadge: {
    background: '#ef4444',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px',
    minWidth: '20px',
    textAlign: 'center',
  },
  markAllBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8b5cf6',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },

  // List
  list: {
    flex: 1,
    overflowY: 'auto',
    maxHeight: '400px',
  },

  // Empty state
  empty: {
    textAlign: 'center',
    padding: '48px 24px',
  },
  emptyIconWrap: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  emptyIcon: {
    fontSize: '32px',
  },
  emptyTitle: {
    margin: '0 0 4px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a',
  },
  emptyText: {
    margin: 0,
    fontSize: '13px',
    color: '#94a3b8',
  },

  // Item
  item: {
    display: 'flex',
    gap: '12px',
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  itemUnread: {
    background: '#faf5ff',
  },

  // Type icon
  itemIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
    border: '1px solid',
  },

  // Content
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemSender: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
    flexWrap: 'wrap',
  },
  senderAvatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid #e2e8f0',
  },
  senderAvatarPlaceholder: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '700',
    color: '#fff',
  },
  senderName: {
    fontSize: '13px',
    color: '#0f172a',
    fontWeight: '600',
  },
  typeLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  itemMessage: {
    margin: '2px 0 6px',
    fontSize: '13px',
    color: '#475569',
    lineHeight: '1.4',
  },
  itemTime: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500',
  },

  // Room chip (for meeting invites)
  roomChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
    padding: '5px 10px',
    background: '#f5f3ff',
    border: '1px solid #ddd6fe',
    borderRadius: '8px',
    maxWidth: '100%',
  },
  roomChipIcon: {
    fontSize: '12px',
  },
  roomChipName: {
    fontSize: '11px',
    color: '#6b21a8',
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '150px',
  },
  roomChipCode: {
    fontSize: '10px',
    color: '#7c3aed',
    fontFamily: 'monospace',
    fontWeight: '700',
    padding: '1px 6px',
    background: '#ffffff',
    borderRadius: '4px',
    border: '1px solid #ddd6fe',
  },

  // Action buttons
  itemActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  acceptBtn: {
    padding: '7px 14px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
    transition: 'all 0.2s',
  },
  declineBtn: {
    padding: '7px 14px',
    background: '#ffffff',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  joinBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '10px',
    padding: '8px 14px',
    background: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.2s',
  },
  joinArrow: {
    fontSize: '14px',
    transition: 'transform 0.2s',
  },

  // Right side
  itemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#8b5cf6',
    marginTop: '4px',
    boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.15)',
  },
  deleteBtn: {
    width: '24px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: '12px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    transition: 'all 0.2s',
    padding: 0,
  },

  // Footer
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid #f1f5f9',
    background: '#fafbff',
  },
  viewAllBtn: {
    width: '100%',
    padding: '10px',
    background: '#ffffff',
    color: '#8b5cf6',
    border: '1px solid #e9d5ff',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  viewAllArrow: {
    fontSize: '15px',
    transition: 'transform 0.2s',
  },
};

export default NotificationDropdown;