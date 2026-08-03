import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSelector } from 'react-redux';
import { selectWatchListCount } from '../store/slices/watchListSlice';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  const watchListCount = useSelector(selectWatchListCount);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const [mobileOpen, setMobileOpen] = useState(false);
  const isCollapsedDesktop = !isMobile && collapsed;
  const showMini = isCollapsedDesktop || isTablet;

  const [expandedSections, setExpandedSections] = useState({
    meetings: false,
    library: true,
    more: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (isMobile && mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, mobileOpen]);

  const lastPathRef = useRef(location.pathname);
  useEffect(() => {
    if (lastPathRef.current !== location.pathname) {
      if (isMobile) setMobileOpen(false);
      lastPathRef.current = location.pathname;
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape" && mobileOpen) setMobileOpen(false); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [mobileOpen]);

  const handleToggle = () => {
    if (isMobile) setMobileOpen(prev => !prev);
    else onToggle && onToggle();
  };

  const mainItems = [
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 12l9-9 9 9M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>),
      label: "Explore",
      path: "/",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>),
      label: "Shorts",
      path: "/shorts",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v13m0-13l-4 4m4-4l4 4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>),
      label: "Upload",
      path: "/upload",
    },
  ];

  const meetingItems = [
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
      </svg>),
      label: "Meetings",
      path: "/dashboard",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>),
      label: "New Meeting",
      path: "/create-room",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      </svg>),
      label: "Join Meeting",
      path: "/join",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>),
      label: "Friends",
      path: "/friends",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>),
      label: "Notifications",
      path: "/notifications",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>),
      label: `Watch List${watchListCount > 0 ? ` (${watchListCount})` : ''}`,
      path: "/watch-list",
      badge: watchListCount,
    },
  ];

  const libraryItems = [
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>),
      label: "Library",
      path: "/playlists",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>),
      label: "Your Profile",
      path: "/profile",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>),
      label: "History",
      path: "/history",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>),
      label: "Downloads",
      path: "/downloads",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 3l6 6-6 6M15 3l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>),
      label: "My Clips",
      path: "/my-clips",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>),
      label: "My Series",
      path: "/my-series",
    },
  ];

  const settingsItems = [
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1 3-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>),
      label: "Plans & Billing",
      path: "/subscription",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>),
      label: "Security",
      path: "/security",
    },
    {
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2"/>
      </svg>),
      label: "Safe Search",
      path: "/content-filter",
    },
  ];

  const settingsBottomItem = {
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2"/>
    </svg>),
    label: "Settings",
    path: "/settings",
  };

  const isMeetingPathActive = () => {
    const meetingPaths = ["/dashboard", "/create-room", "/join", "/friends", "/notifications", "/room"];
    return meetingPaths.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"));
  };

  useEffect(() => {
    if (isMeetingPathActive() && !expandedSections.meetings) {
      setExpandedSections((prev) => ({ ...prev, meetings: true }));
    }
  }, [location.pathname]);

  const renderItem = (item, isSubItem = false, forceExpanded = false) => {
    let isActive = location.pathname === item.path;
    if (item.path === "/dashboard" && (location.pathname === "/room" || location.pathname.startsWith("/room/"))) {
      isActive = true;
    }
    if (item.path === "/join" && location.pathname.startsWith("/join")) isActive = true;

    const showLabel = forceExpanded || (!showMini);

    return (
      <Link
        key={item.path + item.label}
        to={item.path}
        className={`wn-sb-item ${isActive ? "active" : ""} ${!showLabel ? "collapsed" : ""} ${isSubItem && showLabel ? "sub-item" : ""}`}
        title={!showLabel ? item.label : ""}
      >
        <span className="wn-sb-icon">{item.icon}</span>
        {showLabel && <span className="wn-sb-label">{item.label}</span>}
      </Link>
    );
  };

  const renderSectionHeader = (section, label, icon) => {
    const isExpanded = expandedSections[section];
    const isActive = section === "meetings" && isMeetingPathActive();

    return (
      <button
        onClick={() => toggleSection(section)}
        className={`wn-sb-section-header ${isActive ? "has-active" : ""}`}
      >
        <span className="wn-sb-section-header-left">
          {icon && <span className="wn-sb-icon">{icon}</span>}
          <span className="wn-sb-section-label">{label}</span>
        </span>
        <span className={`wn-sb-arrow ${isExpanded ? "expanded" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
    );
  };

  const sidebarClass = isMobile
    ? `wn-sidebar mobile ${mobileOpen ? "mobile-open" : "mobile-closed"}`
    : isTablet
    ? "wn-sidebar tablet"
    : `wn-sidebar desktop ${collapsed ? "collapsed" : ""}`;

  return (
    <>
      {isMobile && mobileOpen && (
        <div className="wn-sb-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="wn-sb-floating-hamburger"
          aria-label="Open menu" title="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      <aside className={sidebarClass}>
        {!isTablet && (
          <div className="wn-sb-toggle-wrap">
            <button
              onClick={handleToggle}
              className="wn-sb-toggle"
              title={isMobile ? "Close menu" : showMini ? "Expand" : "Collapse"}
              aria-label={isMobile ? "Close menu" : showMini ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isMobile ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : showMini ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        )}

        <div className="wn-sb-content">
          <div className="wn-sb-section">
            {mainItems.map((item) => renderItem(item))}
          </div>

          <div className="wn-sb-divider" />

          {!showMini ? (
            <>
              {renderSectionHeader("meetings", "MEETINGS",
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
              <div className={`wn-sb-collapsible ${expandedSections.meetings ? "expanded" : ""}`}>
                <div className="wn-sb-section">
                  {meetingItems.map((item) => renderItem(item, true))}
                </div>
              </div>
            </>
          ) : (
            <div className="wn-sb-section">
              {meetingItems.map((item) => renderItem(item))}
            </div>
          )}

          <div className="wn-sb-divider" />

          {!showMini ? (
            <>
              {renderSectionHeader("library", "LIBRARY",
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              <div className={`wn-sb-collapsible ${expandedSections.library ? "expanded" : ""}`}>
                <div className="wn-sb-section">
                  {libraryItems.map((item) => renderItem(item, true))}
                </div>
              </div>
            </>
          ) : (
            <div className="wn-sb-section">
              {libraryItems.map((item) => renderItem(item))}
            </div>
          )}

          <div className="wn-sb-divider" />

          {!showMini ? (
            <>
              {renderSectionHeader("more", "MORE",
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              <div className={`wn-sb-collapsible ${expandedSections.more ? "expanded" : ""}`}>
                <div className="wn-sb-section">
                  {settingsItems.map((item) => renderItem(item, true))}
                </div>
              </div>
            </>
          ) : (
            <div className="wn-sb-section">
              {settingsItems.map((item) => renderItem(item))}
            </div>
          )}

          {user?.plan && user.plan !== "free" && !showMini && (
            <div className={`wn-sb-plan wn-plan-${user.plan}`}>
              {user.plan === "bronze" && "🥉"}
              {user.plan === "silver" && "🥈"}
              {user.plan === "gold" && "🥇"} {user.plan.toUpperCase()} MEMBER
            </div>
          )}
          {user?.plan && user.plan !== "free" && showMini && (
            <div className={`wn-sb-plan-mini wn-plan-${user.plan}`}
              title={`${user.plan.toUpperCase()} MEMBER`}>
              {user.plan === "bronze" && "🥉"}
              {user.plan === "silver" && "🥈"}
              {user.plan === "gold" && "🥇"}
            </div>
          )}
        </div>

        <div className="wn-sb-footer">
          <div className="wn-sb-divider" style={{ margin: 0 }} />
          <div style={{ padding: "8px 0" }}>
            {renderItem(settingsBottomItem)}
          </div>
        </div>
      </aside>

      <style>{sidebarStyles}</style>
    </>
  );
};

const sidebarStyles = `
  /* ============ DARK NAVY SIDEBAR ============ */
  .wn-sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    height: calc(100vh - 60px);
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    border-right: 1px solid #334155;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    z-index: 100;
    overflow: hidden;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 4px 0 20px rgba(15, 23, 42, 0.15);
  }

  .wn-sidebar.desktop { width: 240px; }
  .wn-sidebar.desktop.collapsed { width: 72px; }
  .wn-sidebar.tablet { width: 72px; }

  .wn-sidebar.mobile {
    width: 280px;
    max-width: 85vw;
    z-index: 1000;
    box-shadow: 4px 0 32px rgba(0,0,0,0.4);
  }
  .wn-sidebar.mobile.mobile-closed { transform: translateX(-100%); }
  .wn-sidebar.mobile.mobile-open { transform: translateX(0); }

  /* ✅ FLOATING HAMBURGER */
  .wn-sb-floating-hamburger {
    position: fixed;
    top: 68px;
    left: 12px;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #1e293b, #0f172a);
    border: 1px solid #334155;
    color: #fbbf24;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.3);
    z-index: 998;
    transition: all 0.2s;
    -webkit-tap-highlight-color: transparent;
  }
  .wn-sb-floating-hamburger:hover {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    border-color: #f59e0b;
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  }
  .wn-sb-floating-hamburger:active { transform: scale(0.95); }

  .wn-sb-backdrop {
    position: fixed;
    inset: 0;
    top: 60px;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 999;
    animation: fadeInBackdrop 0.25s ease;
  }
  @keyframes fadeInBackdrop { from { opacity: 0; } to { opacity: 1; } }

  /* ============ TOGGLE ============ */
  .wn-sb-toggle-wrap {
    display: flex;
    justify-content: flex-end;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(51, 65, 85, 0.5);
    flex-shrink: 0;
  }
  .wn-sidebar.desktop.collapsed .wn-sb-toggle-wrap,
  .wn-sidebar.tablet .wn-sb-toggle-wrap {
    justify-content: center;
  }

  .wn-sb-toggle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(51, 65, 85, 0.5);
    border: 1px solid #334155;
    color: #cbd5e1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .wn-sb-toggle:hover {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    border-color: #f59e0b;
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  }
  .wn-sb-toggle:active { transform: scale(0.95); }

  /* ============ CONTENT ============ */
  .wn-sb-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px 0;
    scrollbar-width: thin;
    scrollbar-color: #475569 transparent;
    -webkit-overflow-scrolling: touch;
  }
  .wn-sb-content::-webkit-scrollbar { width: 6px; }
  .wn-sb-content::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 3px;
  }
  .wn-sb-content::-webkit-scrollbar-thumb:hover { background: #64748b; }
  .wn-sb-content::-webkit-scrollbar-track { background: transparent; }

  .wn-sb-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 8px;
  }

  /* ============ SECTION HEADER - Gold accent ============ */
  .wn-sb-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: calc(100% - 16px);
    margin: 10px 8px 6px;
    padding: 8px 14px;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    font-family: inherit;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .wn-sb-section-header:hover {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
  }
  .wn-sb-section-header.has-active { color: #fbbf24; }

  .wn-sb-section-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .wn-sb-section-header .wn-sb-icon {
    width: 16px;
    height: 16px;
    color: currentColor;
  }
  .wn-sb-section-label { font-size: 11px; letter-spacing: 1.2px; }

  .wn-sb-arrow {
    display: flex;
    align-items: center;
    color: #64748b;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .wn-sb-arrow.expanded {
    transform: rotate(180deg);
    color: #fbbf24;
  }

  .wn-sb-collapsible {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .wn-sb-collapsible.expanded {
    max-height: 500px;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ============ ITEMS - Dark with gold hover ============ */
  .wn-sb-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 14px;
    color: #cbd5e1;
    text-decoration: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.15s;
    position: relative;
    -webkit-tap-highlight-color: transparent;
  }
  .wn-sb-item.sub-item { padding-left: 18px; }

  .wn-sb-item:hover {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
  }
  .wn-sb-item:hover .wn-sb-icon { color: #fbbf24; }

  /* ✅ ACTIVE STATE - Gold background */
  .wn-sb-item.active {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(217, 119, 6, 0.15));
    color: #fbbf24;
    font-weight: 600;
    box-shadow: inset 0 1px 0 rgba(251, 191, 36, 0.2);
  }
  .wn-sb-item.active .wn-sb-icon { color: #fbbf24; }
  .wn-sb-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 3px;
    background: linear-gradient(180deg, #fbbf24, #d97706);
    border-radius: 0 3px 3px 0;
    box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
  }

  .wn-sb-item.collapsed {
    justify-content: center;
    padding: 12px;
    gap: 0;
  }
  .wn-sb-item.collapsed.active::before { display: none; }

  .wn-sb-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    flex-shrink: 0;
    transition: color 0.15s;
  }

  .wn-sb-label {
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ============ DIVIDER ============ */
  .wn-sb-divider {
    margin: 10px 16px;
    height: 1px;
    background: rgba(51, 65, 85, 0.6);
  }
  .wn-sidebar.desktop.collapsed .wn-sb-divider,
  .wn-sidebar.tablet .wn-sb-divider {
    margin: 8px 16px;
  }

  /* ============ PLAN BADGE - Gold accent ============ */
  .wn-sb-plan {
    margin: 16px 12px 8px;
    padding: 10px 12px;
    border-radius: 10px;
    text-align: center;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.5px;
    color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  .wn-sb-plan-mini {
    margin: 12px 12px 8px;
    padding: 8px;
    border-radius: 8px;
    text-align: center;
    font-size: 20px;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
  }
  .wn-plan-gold { background: linear-gradient(135deg, #fbbf24, #d97706); }
  .wn-plan-silver { background: linear-gradient(135deg, #cbd5e1, #94a3b8); color: #1a1a1a; }
  .wn-plan-bronze { background: linear-gradient(135deg, #b45309, #7c2d12); }

  /* ============ FOOTER ============ */
  .wn-sb-footer {
    flex-shrink: 0;
    background: linear-gradient(180deg, transparent, #0f172a 30%);
    padding: 0 8px 12px;
  }

  @media (max-width: 767px) {
    .wn-sb-item {
      padding: 12px 14px;
      font-size: 14px;
    }
    .wn-sb-item.sub-item { padding-left: 20px; }
    .wn-sb-section-header { padding: 10px 14px; }
    .wn-sb-toggle { width: 34px; height: 34px; }
    .wn-sb-toggle-wrap { padding: 12px 14px; }
    .wn-sb-content { padding: 8px 0 20px; }
  }
`;

export default Sidebar;