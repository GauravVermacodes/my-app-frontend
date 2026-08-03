// src/pages/WatchList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  selectWatchList,
  removeFromWatchList,
  clearWatchList,
} from '../store/slices/watchListSlice';
import API from '../api/axios';
import toast from 'react-hot-toast';

// ═══════════ LIGHT THEME WITH ROYAL BLUE ACCENTS ═══════════
const THEME = {
  bg: '#f4f2ee',
  bgGradient: 'linear-gradient(180deg, #f4f2ee 0%, #eeece7 100%)',
  cardBg: '#ffffff',
  cardBgSubtle: '#faf7f0',
  cardBorder: '#e8e5df',
  cardBorderHover: '#fbbf24',
  textPrimary: '#1c1c1e',
  textSecondary: '#6e6e73',
  textMuted: '#8e8e93',
  textDim: '#94a3b8',
  accent: '#d97706',
  accentDark: '#b45309',
  accentDarker: '#92400e',
  accentLight: '#fbbf24',
  accentBg: '#fef3c7',
  accentBgHover: '#fde68a',
  royal1: '#92400e',
  royal2: '#b45309',
  royal3: '#d97706',
  danger: '#ef4444',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  success: '#10b981',
  warning: '#f59e0b',
  gold: '#f59e0b',
  menuHover: '#faf7f0',
};

// ═══════════ SVG ICONS ═══════════
const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 2 }) => {
  const icons = {
    tv: <><rect x="2" y="7" width="20" height="15" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></>,
    play: <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    sparkle: <><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" fill="currentColor" stroke="none" /><path d="M18 15l.75 2.25L21 18l-2.25.75L18 21l-.75-2.25L15 18l2.25-.75z" fill="currentColor" stroke="none" /></>,
    party: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    lightbulb: <><path d="M9 21h6" /><path d="M12 3a6 6 0 0 0-3.35 11.03c.42.31.78.71 1.03 1.17.24.44.32.94.32 1.44V17h4v-.36c0-.5.08-1 .32-1.44.25-.46.61-.86 1.03-1.17A6 6 0 0 0 12 3z" /></>,
    moreVertical: <><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="5" r="1.5" fill="currentColor" /><circle cx="12" cy="19" r="1.5" fill="currentColor" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    report: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
    crown: <><path d="M2 20h20l-2-10-5 4-3-8-3 8-5-4z" fill="currentColor" stroke="none" opacity="0.3" /><path d="M2 20h20l-2-10-5 4-3-8-3 8-5-4z" /><line x1="2" y1="20" x2="22" y2="20" /></>,
    chevronLeft: <polyline points="15 18 9 12 15 6" />,
    chevronRight: <polyline points="9 18 15 12 9 6" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ═══════════ VIDEO CARD MENU (PORTAL) ═══════════
const VideoCardMenu = ({ video, isOpen, onToggle, onClose, onDelete, onReport, onShare, onCopyLink }) => {
  const triggerRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 200;
      const padding = 12;

      let top = rect.bottom + 6;
      let left = rect.right - menuWidth;

      if (top + menuHeight > window.innerHeight - padding) {
        top = rect.top - menuHeight - 6;
      }
      if (left < padding) left = padding;
      if (left + menuWidth > window.innerWidth - padding) {
        left = window.innerWidth - menuWidth - padding;
      }
      if (top < padding) top = padding;

      setMenuPos({ top, left });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => onClose();
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const items = [
    { id: 'share', icon: 'share', label: 'Share', action: () => onShare(video) },
    { id: 'copy', icon: 'copy', label: 'Copy link', action: () => onCopyLink(video) },
    { id: 'report', icon: 'report', label: 'Report', action: () => onReport(video) },
    { id: 'delete', icon: 'trash', label: 'Remove', action: () => onDelete(video), danger: true },
  ];

  const menuPortal = isOpen && typeof document !== 'undefined'
    ? createPortal(
        <>
          <div
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{ position: 'fixed', inset: 0, zIndex: 999998, background: 'transparent' }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              background: THEME.cardBg,
              borderRadius: 12,
              boxShadow: '0 20px 50px rgba(15,23,42,0.15), 0 6px 14px rgba(15,23,42,0.08)',
              border: `1px solid ${THEME.cardBorder}`,
              width: 200,
              padding: '6px 0',
              zIndex: 999999,
              animation: 'menuFadeIn 0.15s ease',
              overflow: 'hidden',
            }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                  onClose();
                }}
                className="wl-menu-item"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  color: item.danger ? THEME.danger : THEME.textPrimary,
                  textAlign: 'left',
                  transition: 'background 0.12s',
                  fontFamily: 'inherit',
                }}
              >
                <Icon name={item.icon} size={15} color={item.danger ? THEME.danger : THEME.textSecondary} />
                {item.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="wl-menu-trigger"
        style={{
          background: isOpen ? THEME.menuHover : 'rgba(255,255,255,0.95)',
          border: `1px solid ${THEME.cardBorder}`,
          width: 32,
          height: 32,
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(15,23,42,0.08)',
        }}
        aria-label="More options"
      >
        <Icon name="moreVertical" size={16} color={THEME.textPrimary} />
      </button>
      {menuPortal}
    </>
  );
};

// ═══════════ MAIN COMPONENT ═══════════
function WatchList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const watchList = useSelector(selectWatchList);
  const scrollRef = useRef(null);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [openMenuId, setOpenMenuId] = useState(null);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingVideo, setReportingVideo] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;

  const getThumbUrl = (url) => {
    if (!url) return 'https://picsum.photos/320/180';
    if (url.startsWith('http')) return url;
    const baseURL = API.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseURL}${url}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views || 0;
  };

  const totalDuration = watchList.reduce((sum, v) => sum + (v.duration || 0), 0);
  const formatTotalTime = (secs) => {
    if (!secs) return '0 min';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} min`;
  };

  // ═══════════ HANDLERS ═══════════
  const handleDelete = (video) => {
    dispatch(removeFromWatchList(video._id));
    toast.success('Removed from watch list');
  };

  const handleShare = async (video) => {
    const url = `${window.location.origin}/video/${video._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, url });
        toast.success('Shared successfully!');
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success('🔗 Link copied to clipboard!');
    }
  };

  const handleCopyLink = (video) => {
    const url = `${window.location.origin}/video/${video._id}`;
    navigator.clipboard.writeText(url);
    toast.success('🔗 Link copied!');
  };

  const handleReport = (video) => {
    setReportingVideo(video);
    setShowReportModal(true);
    setReportReason('');
    setReportDescription('');
  };

  const handleSubmitReport = async () => {
    if (!reportReason) {
      toast.error('Please select a reason');
      return;
    }
    try {
      await API.post(`/videos/${reportingVideo._id}/report`, {
        reason: reportReason,
        description: reportDescription,
      });
      toast.success('🚩 Report submitted!');
      setShowReportModal(false);
      setReportingVideo(null);
      setReportReason('');
      setReportDescription('');
    } catch (err) {
      toast.error('Failed to submit report');
    }
  };

  const scrollByAmount = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const cardWidth = isMobile ? 260 : 320;

  return (
    <div style={styles(isMobile).page}>
      <style>{globalStyles}</style>

      <div style={styles(isMobile).inner}>
        {/* ═══════════════════════════════════════════════════ */}
        {/*  HERO HEADER                                        */}
        {/* ═══════════════════════════════════════════════════ */}
        <div style={styles(isMobile).heroCard} className="wl-hero-card">
          <div style={styles(isMobile).heroGradient} />
          <div style={styles(isMobile).heroPattern} />
          <div style={styles(isMobile).heroGlow1} />
          <div style={styles(isMobile).heroGlow2} />

          <div style={styles(isMobile).heroContent}>
            <div style={styles(isMobile).heroLeft}>
              <div style={styles(isMobile).heroIconWrap}>
                <Icon name="crown" size={isMobile ? 28 : 34} color="#fbbf24" />
              </div>
              <div>
                <h1 style={styles(isMobile).heroTitle}>Watch List</h1>
                <p style={styles(isMobile).heroSubtitle}>
                  {watchList.length > 0
                    ? `${watchList.length} video${watchList.length > 1 ? 's' : ''} in your royal queue`
                    : 'Curate videos for your next watch party'}
                </p>
              </div>
            </div>

            {watchList.length > 0 && (
              <div style={styles(isMobile).heroStats}>
                <div style={styles(isMobile).heroStat}>
                  <div style={styles(isMobile).heroStatValue}>{watchList.length}</div>
                  <div style={styles(isMobile).heroStatLabel}>Videos</div>
                </div>
                <div style={styles(isMobile).heroStatDivider} />
                <div style={styles(isMobile).heroStat}>
                </div>
              </div>
            )}
          </div>

          {watchList.length > 0 && (
            <div style={styles(isMobile).heroActions}>
              <button
                className="wl-btn-primary"
                style={styles(isMobile).btnPrimary}
                onClick={() => navigate('/dashboard')}
              >
                <Icon name="party" size={16} color={THEME.accentDark} />
                Start Watch Party
              </button>
              <button
                className="wl-btn-danger"
                style={styles(isMobile).btnDanger}
                onClick={() => {
                  if (window.confirm('Clear entire watch list?')) {
                    dispatch(clearWatchList());
                    toast.success('Watch list cleared');
                  }
                }}
              >
                <Icon name="trash" size={14} />
                {!isSmallMobile && 'Clear All'}
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/*  HOW IT WORKS                                       */}
        {/* ═══════════════════════════════════════════════════ */}
        <div style={styles(isMobile).infoBanner} className="wl-info-banner">
          <div style={styles(isMobile).infoIconWrap}>
            <Icon name="lightbulb" size={20} color={THEME.accent} />
          </div>
          <div style={styles(isMobile).infoContent}>
            <div style={styles(isMobile).infoHeader}>
              <strong style={styles(isMobile).infoTitle}>How to watch together</strong>
              <span style={styles(isMobile).infoBadge}>4 easy steps</span>
            </div>
            <div style={styles(isMobile).steps}>
              {[
                'Add videos using "Watch Together" from any video',
                'Create or join a meeting room from Dashboard',
                'Click the "Watch List" tab in meeting sidebar',
                'Pick any video — it plays synced for everyone!',
              ].map((text, i) => (
                <div key={i} style={styles(isMobile).step} className="wl-step-item">
                  <span style={styles(isMobile).stepNum}>{i + 1}</span>
                  <span style={styles(isMobile).stepText}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/*  VIDEO LIST — HORIZONTAL SCROLL                     */}
        {/* ═══════════════════════════════════════════════════ */}
        {watchList.length === 0 ? (
          <div style={styles(isMobile).empty} className="wl-empty-state">
            <div style={styles(isMobile).emptyIconWrap}>
              <Icon name="tv" size={44} color={THEME.accent} />
              <div style={styles(isMobile).emptySparkle}>
                <Icon name="sparkle" size={20} color={THEME.gold} />
              </div>
            </div>
            <h2 style={styles(isMobile).emptyTitle}>Your watch list is empty</h2>
            <p style={styles(isMobile).emptyDesc}>
              Browse videos on the Home page and click "Watch Together" to add
              them here for shared viewing.
            </p>
            <button
              className="wl-btn-primary-lg"
              style={styles(isMobile).btnPrimaryLg}
              onClick={() => navigate('/')}
            >
              <Icon name="home" size={16} color="white" />
              Browse Videos
              <Icon name="arrowRight" size={16} color="white" />
            </button>
          </div>
        ) : (
          <>
            <div style={styles(isMobile).listHeader}>
              <div style={styles(isMobile).listHeaderLeft}>
                <span style={styles(isMobile).listHeaderTitle}>Your Queue</span>
                <span style={styles(isMobile).listHeaderCount}>
                  {watchList.length}
                </span>
              </div>
              <div style={styles(isMobile).listHeaderRight}>
                {!isMobile && (
                  <div style={styles(isMobile).scrollControls}>
                    <button
                      className="wl-scroll-btn"
                      style={styles(isMobile).scrollBtn}
                      onClick={() => scrollByAmount(-(cardWidth + 16) * 2)}
                      aria-label="Scroll left"
                    >
                      <Icon name="chevronLeft" size={16} />
                    </button>
                    <button
                      className="wl-scroll-btn"
                      style={styles(isMobile).scrollBtn}
                      onClick={() => scrollByAmount((cardWidth + 16) * 2)}
                      aria-label="Scroll right"
                    >
                      <Icon name="chevronRight" size={16} />
                    </button>
                  </div>
                )}
                <div style={styles(isMobile).timeChip}>
                  <Icon name="clock" size={12} color={THEME.textMuted} />
                  <span>{formatTotalTime(totalDuration)}</span>
                </div>
              </div>
            </div>

            {/* HORIZONTAL SCROLLING CONTAINER */}
            <div style={styles(isMobile).scrollWrapper}>
              <div
                ref={scrollRef}
                style={styles(isMobile).horizontalScroll}
                className="wl-horizontal-scroll"
              >
                {watchList.map((video, index) => (
                  <div
                    key={video._id}
                    style={{ ...styles(isMobile).card, width: cardWidth }}
                    className="wl-video-card"
                  >
                    {/* Number Badge */}
                    <div style={styles(isMobile).indexBadge}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    {/* 3-dot menu (top-right) */}
                    <div style={styles(isMobile).menuWrap}>
                      <VideoCardMenu
                        video={video}
                        isOpen={openMenuId === video._id}
                        onToggle={() =>
                          setOpenMenuId(openMenuId === video._id ? null : video._id)
                        }
                        onClose={() => setOpenMenuId(null)}
                        onDelete={handleDelete}
                        onReport={handleReport}
                        onShare={handleShare}
                        onCopyLink={handleCopyLink}
                      />
                    </div>

                    {/* Thumbnail */}
                    <Link
                      to={`/video/${video._id}`}
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <div style={styles(isMobile).thumbWrap} className="wl-thumb-wrap">
                        <img
                          src={getThumbUrl(video.thumbnailUrl)}
                          alt={video.title}
                          style={styles(isMobile).thumb}
                          onError={(e) => {
                            e.target.src = 'https://picsum.photos/320/180';
                          }}
                        />
                        <div style={styles(isMobile).playOverlay} className="wl-play-overlay">
                          <div style={styles(isMobile).playBtn}>
                            <Icon name="play" size={20} color={THEME.accentDark} />
                          </div>
                        </div>
                        {video.duration > 0 && (
                          <span style={styles(isMobile).duration}>
                            {formatDuration(video.duration)}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div style={styles(isMobile).info}>
                      <Link
                        to={`/video/${video._id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <h3 style={styles(isMobile).videoTitle} className="wl-video-title">
                          {video.title}
                        </h3>
                      </Link>
                      <div style={styles(isMobile).videoMeta}>
                        <div style={styles(isMobile).uploader}>
                          <div style={styles(isMobile).uploaderAvatar}>
                            {video.uploader?.name?.charAt(0).toUpperCase() || 'W'}
                          </div>
                          <span style={styles(isMobile).uploaderName}>
                            {video.uploader?.name || 'WatchNest'}
                          </span>
                        </div>
                        {video.views > 0 && (
                          <div style={styles(isMobile).metaItem}>
                            <Icon name="eye" size={11} color={THEME.textMuted} />
                            <span>{formatViews(video.views)}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick action buttons */}
                      <div style={styles(isMobile).quickActions}>
                        <button
                          className="wl-quick-btn wl-quick-share"
                          style={styles(isMobile).quickBtn}
                          onClick={(e) => {
                            e.preventDefault();
                            handleShare(video);
                          }}
                          title="Share"
                        >
                          <Icon name="share" size={13} />
                          Share
                        </button>
                        <button
                          className="wl-quick-btn wl-quick-remove"
                          style={styles(isMobile).quickBtnDanger}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(video);
                          }}
                          title="Remove"
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div style={styles(isMobile).bottomCta} className="wl-bottom-cta">
              <div style={styles(isMobile).ctaGlow} />
              <div style={styles(isMobile).ctaContent}>
                <div style={styles(isMobile).ctaLeft}>
                  <div style={styles(isMobile).ctaIconWrap}>
                    <Icon name="party" size={26} color="#fbbf24" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={styles(isMobile).ctaTitle}>
                      Ready to watch with friends?
                    </p>
                    <p style={styles(isMobile).ctaDesc}>
                      {watchList.length} video{watchList.length > 1 ? 's' : ''} •{' '}
                      {formatTotalTime(totalDuration)} of content
                    </p>
                  </div>
                </div>
                <button
                  className="wl-btn-cta"
                  style={styles(isMobile).btnCta}
                  onClick={() => navigate('/dashboard')}
                >
                  <Icon name="party" size={16} color={THEME.accentDark} />
                  Create Watch Party
                  <Icon name="arrowRight" size={16} color={THEME.accentDark} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══════════ REPORT MODAL ═══════════ */}
      {showReportModal && reportingVideo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(6px)',
            padding: 16,
          }}
          onClick={() => setShowReportModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: THEME.cardBg,
              border: `1px solid ${THEME.cardBorder}`,
              borderRadius: 16,
              padding: isMobile ? 22 : 28,
              width: '100%',
              maxWidth: 500,
              color: THEME.textPrimary,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(15,23,42,0.25)',
            }}
          >
            <h2
              style={{
                margin: '0 0 8px 0',
                color: THEME.danger,
                fontSize: isMobile ? 18 : 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon name="report" size={20} color={THEME.danger} />
              Report Video
            </h2>
            <p
              style={{
                color: THEME.textMuted,
                fontSize: 13,
                marginBottom: 20,
                wordBreak: 'break-word',
              }}
            >
              Reporting: <b style={{ color: THEME.textPrimary }}>{reportingVideo.title}</b>
            </p>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  color: THEME.textSecondary,
                  fontSize: 13,
                  marginBottom: 10,
                  fontWeight: 600,
                }}
              >
                Why are you reporting this video?
              </label>
              {[
                { id: 'inappropriate', label: '🔞 Inappropriate content' },
                { id: 'violent', label: '⚠️ Violent or harmful' },
                { id: 'spam', label: '📢 Spam or misleading' },
                { id: 'harassment', label: '💢 Harassment or bullying' },
                { id: 'hate_speech', label: '🚫 Hate speech' },
                { id: 'copyright', label: '©️ Copyright violation' },
                { id: 'other', label: '📝 Other' },
              ].map((r) => (
                <label
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: 10,
                    background:
                      reportReason === r.id ? THEME.dangerBg : 'transparent',
                    borderRadius: 8,
                    cursor: 'pointer',
                    marginBottom: 4,
                    border:
                      reportReason === r.id
                        ? `1px solid ${THEME.danger}`
                        : `1px solid ${THEME.cardBorder}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={r.id}
                    checked={reportReason === r.id}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{ accentColor: THEME.danger }}
                  />
                  <span style={{ fontSize: 14, color: THEME.textPrimary }}>{r.label}</span>
                </label>
              ))}
            </div>
            <textarea
              placeholder="Additional details (optional)"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              maxLength={500}
              style={{
                width: '100%',
                padding: 12,
                background: THEME.bg,
                border: `1px solid ${THEME.cardBorder}`,
                color: THEME.textPrimary,
                borderRadius: 10,
                minHeight: 80,
                fontFamily: 'inherit',
                fontSize: 14,
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 20,
                flexDirection: isMobile ? 'column-reverse' : 'row',
              }}
            >
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: 'transparent',
                  color: THEME.textPrimary,
                  border: `1px solid ${THEME.cardBorder}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportReason}
                style={{
                  flex: 1,
                  padding: 12,
                  background: !reportReason
                    ? THEME.cardBorder
                    : 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  cursor: !reportReason ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  opacity: !reportReason ? 0.6 : 1,
                  fontFamily: 'inherit',
                }}
              >
                🚩 Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STYLES — LIGHT THEME
// ═══════════════════════════════════════════════════════════
const styles = (isMobile) => ({
  page: {
    minHeight: 'calc(100vh - 68px)',
    background: THEME.bgGradient,
    padding: isMobile ? '16px 12px 32px' : '24px 20px 40px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  inner: { maxWidth: 1200, margin: '0 auto' },

  // ═══════════ HERO ═══════════
  heroCard: {
    position: 'relative',
    background: THEME.cardBg,
    borderRadius: 20,
    padding: isMobile ? '24px 20px' : '32px 36px',
    marginBottom: 20,
    overflow: 'hidden',
    border: `1px solid ${THEME.cardBorder}`,
    boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
  },
  heroGradient: {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(135deg, ${THEME.royal1} 0%, ${THEME.royal2} 50%, ${THEME.royal3} 100%)`,
  },
  heroPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(96,165,250,0.15) 0%, transparent 50%)`,
    opacity: 0.9,
  },
  heroGlow1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(96,165,250,0.4) 0%, transparent 70%)',
    filter: 'blur(40px)',
  },
  heroGlow2: {
    position: 'absolute',
    bottom: -80,
    left: '20%',
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)',
    filter: 'blur(50px)',
  },
  heroContent: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    gap: 16,
    flexDirection: isMobile ? 'column' : 'row',
    zIndex: 2,
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 14 : 18,
  },
  heroIconWrap: {
    width: isMobile ? 56 : 70,
    height: isMobile ? 56 : 70,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(251,191,36,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
  },
  heroTitle: {
    margin: 0,
    fontSize: isMobile ? 26 : 34,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    textShadow: '0 2px 12px rgba(0,0,0,0.2)',
  },
  heroSubtitle: {
    margin: '6px 0 0',
    fontSize: isMobile ? 13 : 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 500,
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 16 : 20,
    padding: '10px 20px',
    background: 'rgba(0,0,0,0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 14,
  },
  heroStat: { textAlign: 'center' },
  heroStatValue: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 800,
    color: '#fbbf24',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  heroStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  heroStatDivider: {
    width: 1,
    height: 28,
    background: 'rgba(255,255,255,0.2)',
  },
  heroActions: {
    position: 'relative',
    display: 'flex',
    gap: 10,
    marginTop: 20,
    flexWrap: 'wrap',
    zIndex: 2,
  },
  btnPrimary: {
    padding: '12px 24px',
    background: '#fff',
    color: THEME.accentDark,
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
  },
  btnDanger: {
    padding: '12px 18px',
    background: 'rgba(239,68,68,0.15)',
    color: '#fecaca',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backdropFilter: 'blur(10px)',
    fontFamily: 'inherit',
  },

  // ═══════════ INFO BANNER ═══════════
  infoBanner: {
    display: 'flex',
    gap: 16,
    padding: isMobile ? '18px' : '22px 26px',
    background: THEME.accentBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(59,130,246,0.05)',
  },
  infoIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: `1px solid ${THEME.accentBgHover}`,
    boxShadow: '0 2px 6px rgba(59,130,246,0.1)',
  },
  infoContent: { flex: 1, minWidth: 0 },
  infoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: THEME.textPrimary,
    letterSpacing: '-0.01em',
  },
  infoBadge: {
    padding: '3px 10px',
    background: THEME.accent,
    color: '#fff',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  steps: { display: 'flex', flexDirection: 'column', gap: 10 },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
    lineHeight: 1.5,
    transition: 'all 0.2s',
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 8,
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
  },
  stepText: { fontWeight: 500, color: THEME.textSecondary },

  // ═══════════ EMPTY STATE ═══════════
  empty: {
    textAlign: 'center',
    padding: isMobile ? '48px 20px' : '72px 24px',
    background: THEME.cardBg,
    borderRadius: 20,
    border: `1px dashed ${THEME.cardBorder}`,
    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
  },
  emptyIconWrap: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${THEME.accentBg}, ${THEME.accentBgHover})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 8px 24px rgba(59,130,246,0.15)',
    border: `1px solid ${THEME.accentBgHover}`,
  },
  emptySparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
    background: '#fff',
    borderRadius: '50%',
    padding: 6,
    boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
    border: `1px solid ${THEME.cardBorder}`,
    animation: 'sparkle 2s ease-in-out infinite',
  },
  emptyTitle: {
    margin: '0 0 10px',
    fontSize: isMobile ? 20 : 24,
    fontWeight: 800,
    color: THEME.textPrimary,
    letterSpacing: '-0.02em',
  },
  emptyDesc: {
    margin: '0 auto 28px',
    fontSize: 14,
    color: THEME.textMuted,
    maxWidth: 420,
    lineHeight: 1.6,
    fontWeight: 500,
  },
  btnPrimaryLg: {
    padding: '14px 28px',
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDarker})`,
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
  },

  // ═══════════ LIST HEADER ═══════════
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: '0 4px',
    flexWrap: 'wrap',
    gap: 10,
  },
  listHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  listHeaderTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: THEME.textPrimary,
    letterSpacing: '-0.01em',
  },
  listHeaderCount: {
    padding: '3px 10px',
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
    color: '#fff',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 800,
    boxShadow: '0 2px 6px rgba(59,130,246,0.25)',
  },
  listHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  scrollControls: { display: 'flex', gap: 6 },
  scrollBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    color: THEME.textSecondary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
    boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
  },
  timeChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 20,
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
  },

  // ═══════════ HORIZONTAL SCROLL ═══════════
  scrollWrapper: {
    position: 'relative',
    marginLeft: isMobile ? -12 : 0,
    marginRight: isMobile ? -12 : 0,
  },
  horizontalScroll: {
    display: 'flex',
    gap: 16,
    overflowX: 'auto',
    overflowY: 'hidden',
    padding: isMobile ? '4px 12px 20px' : '4px 4px 20px',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'thin',
    scrollbarColor: `${THEME.accent} ${THEME.cardBorder}`,
  },
  // 🎨 SUBTLE DARKER CARDS (slate-100 background for subtle contrast)
  card: {
    background: THEME.cardBgSubtle,   // <-- slightly darker (#f1f5f9)
    borderRadius: 16,
    border: `1px solid ${THEME.cardBorder}`,
    boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  indexBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'rgba(15,23,42,0.9)',
    backdropFilter: 'blur(10px)',
    color: '#fbbf24',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 800,
    zIndex: 3,
    letterSpacing: '-0.02em',
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
    border: '1px solid rgba(251,191,36,0.4)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  menuWrap: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 3,
  },
  thumbWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    overflow: 'hidden',
    background: THEME.cardBorder,
  },
  thumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.4s',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.25s',
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    background: 'rgba(15,23,42,0.9)',
    backdropFilter: 'blur(4px)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 7px',
    borderRadius: 5,
    letterSpacing: 0.3,
  },
  info: {
    padding: 14,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#fff', // white content area for contrast with darker card
  },
  videoTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: THEME.textPrimary,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
    minHeight: 39,
    transition: 'color 0.15s',
  },
  videoMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  uploader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  uploaderAvatar: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.royal2})`,
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(59,130,246,0.25)',
  },
  uploaderName: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: 600,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: 500,
  },
  quickActions: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTop: `1px solid ${THEME.cardBorder}`,
  },
  quickBtn: {
    flex: 1,
    padding: '8px 12px',
    background: THEME.accentBg,
    color: THEME.accentDark,
    border: `1px solid ${THEME.accentBgHover}`,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  quickBtnDanger: {
    padding: '8px 12px',
    background: '#fff',
    color: THEME.textMuted,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
    minWidth: 36,
  },

  // ═══════════ BOTTOM CTA ═══════════
  bottomCta: {
    marginTop: 28,
    padding: isMobile ? '22px' : '30px 32px',
    background: `linear-gradient(135deg, ${THEME.royal1} 0%, ${THEME.royal2} 50%, ${THEME.royal3} 100%)`,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(30,58,138,0.3)',
  },
  ctaGlow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)',
    filter: 'blur(50px)',
  },
  ctaContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    zIndex: 2,
  },
  ctaLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    minWidth: 0,
  },
  ctaIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: 'rgba(0,0,0,0.25)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(251,191,36,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
  },
  ctaTitle: {
    margin: 0,
    fontSize: isMobile ? 15 : 18,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  ctaDesc: {
    margin: '5px 0 0',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 500,
  },
  btnCta: {
    padding: '13px 24px',
    background: '#fff',
    color: THEME.accentDark,
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
});

const globalStyles = `
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  html, body { overflow-x: hidden; }

  @keyframes sparkle {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
    50% { transform: scale(1.2) rotate(15deg); opacity: 0.8; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes menuFadeIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .wl-hero-card, .wl-info-banner, .wl-empty-state, .wl-video-card, .wl-bottom-cta {
    animation: fadeInUp 0.4s ease both;
  }
  .wl-video-card:nth-child(1) { animation-delay: 0.05s; }
  .wl-video-card:nth-child(2) { animation-delay: 0.1s; }
  .wl-video-card:nth-child(3) { animation-delay: 0.15s; }
  .wl-video-card:nth-child(4) { animation-delay: 0.2s; }
  .wl-video-card:nth-child(5) { animation-delay: 0.25s; }
  .wl-video-card:nth-child(6) { animation-delay: 0.3s; }

  .wl-horizontal-scroll {
    scrollbar-width: thin;
    scrollbar-color: #d97706 #e8e5df;
  }
  .wl-horizontal-scroll::-webkit-scrollbar { height: 10px; }
  .wl-horizontal-scroll::-webkit-scrollbar-track {
    background: #e8e5df;
    border-radius: 10px;
  }
  .wl-horizontal-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #fbbf24, #d97706);
    border-radius: 10px;
    border: 2px solid #e8e5df;
    background-clip: padding-box;
  }
  .wl-horizontal-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(90deg, #d97706, #b45309);
    background-clip: padding-box;
  }

  @media (hover: hover) {
    .wl-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(28,28,30,0.25) !important;
    }
    .wl-btn-danger:hover {
      background: rgba(239,68,68,0.25) !important;
      border-color: #ef4444 !important;
      color: #fff !important;
    }
    .wl-btn-primary-lg:hover, .wl-btn-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(217,119,6,0.45) !important;
    }
    .wl-video-card:hover {
      border-color: #fbbf24 !important;
      box-shadow: 0 12px 32px rgba(217,119,6,0.18) !important;
      transform: translateY(-4px);
    }
    .wl-video-card:hover .wl-thumb-wrap img {
      transform: scale(1.08);
    }
    .wl-video-card:hover .wl-play-overlay {
      opacity: 1 !important;
    }
    .wl-video-card:hover .wl-video-title {
      color: #b45309;
    }
    .wl-menu-trigger:hover {
      background: #ffffff !important;
      transform: scale(1.08);
      box-shadow: 0 4px 12px rgba(28,28,30,0.15) !important;
    }
    .wl-menu-item:hover {
      background: #faf7f0;
    }
    .wl-step-item:hover {
      transform: translateX(4px);
    }
    .wl-scroll-btn:hover {
      background: #d97706 !important;
      color: #fff !important;
      border-color: #d97706 !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(217,119,6,0.3) !important;
    }
    .wl-quick-share:hover {
      background: #d97706 !important;
      color: #fff !important;
      border-color: #d97706 !important;
    }
    .wl-quick-remove:hover {
      background: #fef2f2 !important;
      color: #ef4444 !important;
      border-color: #fecaca !important;
    }
  }

  button:active { transform: scale(0.97); }
`;

export default WatchList;