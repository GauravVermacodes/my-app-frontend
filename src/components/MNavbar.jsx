import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext, NotificationContext, FriendContext } from '../App';
import NotificationDropdown from './NotificationDropdown';

import logo from '../assets/logo.png';          // ✅ ADDED

function Navbar() {
  const { user, token, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const { pendingRequests } = useContext(FriendContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [logoError, setLogoError] = useState(false);      // ✅ ADDED

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (location.pathname.startsWith('/room/')) {
    return null;
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nb-desktop-links { display: none !important; }
          .nb-username { display: none !important; }
          .nb-chevron { display: none !important; }
          .nb-user-btn { padding: 4px !important; }
          .nb-mobile-toggle { display: flex !important; }
          .nb-logo-text { font-size: 17px !important; }
          .nb-logo-img { width: 32px !important; height: 32px !important; }
          .nb-nav { padding: 0 14px !important; height: 60px !important; }
        }
        @media (min-width: 769px) {
          .nb-mobile-toggle { display: none !important; }
          .nb-mobile-menu { display: none !important; }
        }
        .nb-nav-link:hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }
        .nb-menu-item:hover {
          background: #f5f3ff !important;
          color: #6d28d9 !important;
        }
        .nb-logout-item:hover {
          background: #fef2f2 !important;
        }
        .nb-notif-btn:hover, .nb-user-btn:hover {
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
        }
        .nb-register-btn:hover {
          box-shadow: 0 4px 14px rgba(139,92,246,0.35) !important;
          transform: translateY(-1px);
        }

        /* ✅ ADDED — logo hover animation */
        .nb-logo:hover .nb-logo-img {
          transform: scale(1.06) rotate(-3deg);
        }
        .nb-logo-img {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <nav className="nb-nav" style={styles.nav}>

        {/* ══ LOGO ══ */}
        <Link to="/" className="nb-logo" style={styles.logo}>
          {!logoError ? (
            <img
              src={logo}
              alt="WatchParty"
              className="nb-logo-img"
              style={styles.logoImg}
              onError={() => setLogoError(true)}
            />
          ) : (
            <span style={styles.logoFallback}>🎬</span>
          )}
          <span className="nb-logo-text" style={styles.logoText}>
            WatchParty
          </span>
        </Link>

        <div style={styles.right}>
          {token && user ? (
            <>
              <div className="nb-desktop-links" style={styles.desktopLinks}>
                <Link
                  to="/dashboard"
                  className="nb-nav-link"
                  style={{
                    ...styles.navLink,
                    ...(isActive('/dashboard') ? styles.navLinkActive : {}),
                  }}
                >
                  Dashboard
                </Link>

                <Link
                  to="/friends"
                  className="nb-nav-link"
                  style={{
                    ...styles.navLink,
                    ...(isActive('/friends') ? styles.navLinkActive : {}),
                    position: 'relative',
                  }}
                >
                  👥 Friends
                  {pendingRequests.length > 0 && (
                    <span style={styles.badge}>{pendingRequests.length}</span>
                  )}
                </Link>
              </div>

              <div ref={notifRef} style={styles.notifContainer}>
                <button
                  className="nb-notif-btn"
                  style={styles.notifBtn}
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={styles.notifBadge}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                )}
              </div>

              <div ref={userMenuRef} style={styles.userMenuContainer}>
                <button
                  className="nb-user-btn"
                  style={styles.userBtn}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div style={styles.avatar}>
                    {user.avatar ? (
                      <img src={user.avatar} alt="" style={styles.avatarImg} />
                    ) : (
                      user.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="nb-username" style={styles.username}>{user.username}</span>
                  <span className="nb-chevron" style={styles.chevron}>▼</span>
                </button>

                {showUserMenu && (
                  <div style={styles.userMenu}>
                    <Link to="/profile" className="nb-menu-item" style={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                      👤 Profile
                    </Link>
                    <Link to="/dashboard" className="nb-menu-item" style={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                      📊 Dashboard
                    </Link>
                    <Link to="/friends" className="nb-menu-item" style={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                      👥 Friends
                    </Link>
                    <Link to="/notifications" className="nb-menu-item" style={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                      🔔 All Notifications
                    </Link>
                    <div style={styles.menuDivider}></div>
                    <button className="nb-logout-item" style={styles.logoutItem} onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nb-nav-link" style={styles.navLink}>Login</Link>
              <Link to="/register" className="nb-register-btn" style={styles.registerBtn}>Register</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '68px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
  },

  // ✅ UPDATED logo styles
  logo: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoImg: {
    width: '38px',
    height: '38px',
    objectFit: 'contain',
    borderRadius: '10px',
    flexShrink: 0,
    display: 'block',
    filter: 'drop-shadow(0 1px 3px rgba(88,60,130,0.22))',
  },
  logoFallback: {
    fontSize: '24px',
    lineHeight: 1,
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },

  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  desktopLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginRight: '6px',
  },
  navLink: {
    color: '#475569',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '9px 14px',
    borderRadius: '10px',
    transition: 'all 0.2s',
    position: 'relative',
  },
  navLinkActive: {
    color: '#0f172a',
    background: '#f1f5f9',
    fontWeight: '600',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '10px',
    minWidth: '16px',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  notifContainer: { position: 'relative' },
  notifBtn: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '16px',
    position: 'relative',
    transition: 'all 0.2s',
    color: '#475569',
  },
  notifBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center',
    boxShadow: '0 0 0 2px #ffffff',
  },
  userMenuContainer: { position: 'relative' },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '999px',
    padding: '4px 12px 4px 4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    color: '#fff',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  username: {
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '600',
    maxWidth: '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevron: { color: '#94a3b8', fontSize: '9px' },
  userMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '8px',
    minWidth: '220px',
    boxShadow: '0 10px 40px rgba(15,23,42,0.12)',
    zIndex: 1000,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    color: '#334155',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  menuDivider: { height: '1px', background: '#e2e8f0', margin: '6px 4px' },
  logoutItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    background: 'transparent',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  registerBtn: {
    background: '#8b5cf6',
    color: '#fff',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 2px 6px rgba(139,92,246,0.25)',
    transition: 'all 0.2s',
  },
};

export default Navbar;