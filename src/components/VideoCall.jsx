import React, { useEffect, useRef, useState } from 'react';

// ✅ Change server here
const JITSI_DOMAIN = 'jitsi.riot.im';

function VideoCall({ roomId, user, onLeave }) {
  const containerRef = useRef(null);
  const apiRef       = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let mounted = true;

    const initJitsi = () => {
      if (!mounted || !containerRef.current) return;

      if (!window.JitsiMeetExternalAPI) {
        setStatus('error');
        return;
      }

      // Cleanup previous
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch (e) {}
        apiRef.current = null;
      }

      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      const roomName = `watchparty-${roomId}`;

      const options = {
        roomName,
        parentNode: containerRef.current,
        width:  '100%',
        height: '100%',

        // ✅ ALL possible config to skip pre-join page
        configOverwrite: {
          // Skip pre-join screen
          prejoinPageEnabled:        false,
          prejoinConfig:             { enabled: false },
          'prejoinConfig.enabled':   false,
          enableInsecureRoomNameWarning: false,

          // Auto-join settings
          startWithAudioMuted:       true,
          startWithVideoMuted:       true,
          disableDeepLinking:        true,
          disableInviteFunctions:    true,
          enableEmailInStats:        false,
          requireDisplayName:        false,
          enableWelcomePage:         false,
          enableClosePage:           false,

          // Hide unnecessary UI
          hideConferenceSubject:     true,
          hideConferenceTimer:       false,
          disableProfile:            true,
          disableTileEnlargement:    false,

          // Lobby bypass
          enableLobbyChat:           false,
          hideLobbyButton:           true,
          autoKnockLobby:            true,

          // Connection settings
          enableForcedReload:        false,
          disableModeratorIndicator: false,

          // Toolbar
          toolbarButtons: [
            'microphone', 'camera', 'desktop',
            'fullscreen', 'hangup', 'chat',
            'raisehand', 'tileview', 'participants-pane',
            'videoquality', 'filmstrip', 'settings',
            'shortcuts', 'select-background',
            'mute-everyone', 'security',
          ],
        },

        interfaceConfigOverwrite: {
          MOBILE_APP_PROMO:                 false,
          SHOW_JITSI_WATERMARK:             false,
          SHOW_WATERMARK_FOR_GUESTS:        false,
          SHOW_BRAND_WATERMARK:             false,
          SHOW_POWERED_BY:                  false,
          DISPLAY_WELCOME_FOOTER:           false,
          HIDE_INVITE_MORE_HEADER:          true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          TOOLBAR_ALWAYS_VISIBLE:           false,
          DEFAULT_BACKGROUND:               '#000000',
          DEFAULT_LOCAL_DISPLAY_NAME:       user?.username || 'Guest',
          ENABLE_DIAL_OUT:                  false,
          GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
        },

        userInfo: {
          displayName: user?.username || 'Guest',
          email:       user?.email    || '',
        },
      };

      try {
        apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, options);

        // ✅ Auto-click "Join" if pre-join page still shows
        const autoJoinInterval = setInterval(() => {
          if (!mounted || !apiRef.current) {
            clearInterval(autoJoinInterval);
            return;
          }

          try {
            // Try to get iframe and click join button inside it
            const iframe = containerRef.current?.querySelector('iframe');
            if (iframe && iframe.contentDocument) {
              const joinBtn = iframe.contentDocument.querySelector(
                '[data-testid="prejoin.joinMeeting"], ' +
                'button[aria-label="Join meeting"], ' +
                '.prejoin-preview-dropdown-btn, ' +
                '.action-btn--primary'
              );
              if (joinBtn) {
                joinBtn.click();
                clearInterval(autoJoinInterval);
              }
            }
          } catch (e) {
            // Cross-origin — can't access iframe contents
            // This is expected, the config should handle it
          }
        }, 1000);

        // Clear interval after 10 seconds (safety)
        setTimeout(() => clearInterval(autoJoinInterval), 10000);

        apiRef.current.addEventListener('videoConferenceJoined', () => {
          console.log(`✅ Joined Jitsi via ${JITSI_DOMAIN}`);
          clearInterval(autoJoinInterval);
          if (mounted) setStatus('ready');
        });

        apiRef.current.addEventListener('videoConferenceLeft', () => {
          console.log('👋 Left Jitsi conference');
          if (mounted && onLeave) onLeave();
        });

        apiRef.current.addEventListener('participantJoined', (e) => {
          console.log('➕ Participant joined:', e.displayName);
        });

        apiRef.current.addEventListener('participantLeft', (e) => {
          console.log('➖ Participant left:', e.id);
        });

        apiRef.current.addEventListener('readyToClose', () => {
          console.log('Jitsi ready to close');
          if (mounted && onLeave) onLeave();
        });

        // ✅ Hide loading overlay once iframe loads
        // (even if pre-join shows, user can see and click join)
        setTimeout(() => {
          if (mounted && status === 'loading') {
            setStatus('ready');
          }
        }, 5000);

      } catch (err) {
        console.error('❌ Jitsi init error:', err);
        setStatus('error');
      }
    };

    // Load Jitsi script
    const loadScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }

      const existingScript = document.querySelector(
        `script[src*="external_api.js"]`
      );

      if (existingScript) {
        if (existingScript.getAttribute('data-loaded') === 'true') {
          initJitsi();
        } else {
          existingScript.addEventListener('load', () => {
            existingScript.setAttribute('data-loaded', 'true');
            initJitsi();
          });
          existingScript.addEventListener('error', () => setStatus('error'));
        }
        return;
      }

      const script = document.createElement('script');
      script.src   = `https://${JITSI_DOMAIN}/external_api.js`;
      script.async = true;
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        initJitsi();
      };
      script.onerror = () => {
        console.error(`❌ Failed to load Jitsi from ${JITSI_DOMAIN}`);
        setStatus('error');
      };
      document.head.appendChild(script);
    };

    loadScript();

    return () => {
      mounted = false;
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch (err) {}
        apiRef.current = null;
      }
    };
  }, [roomId, user, onLeave]);

  return (
    <div style={styles.wrapper}>
      {/* Loading state */}
      {status === 'loading' && (
        <div style={styles.overlay}>
          <div style={styles.spinner} />
          <p style={styles.overlayText}>Connecting to meeting...</p>
          <p style={styles.overlaySub}>Server: {JITSI_DOMAIN}</p>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div style={styles.overlay}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.overlayText}>Failed to connect</p>
          <p style={styles.overlaySub}>Server: {JITSI_DOMAIN}</p>
          <button
            style={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            🔄 Reload
          </button>
        </div>
      )}

      {/* Jitsi container */}
      <div ref={containerRef} style={styles.container} />
    </div>
  );
}

const styles = {
  wrapper: {
    width:         '100%',
    height:        '100%',
    minHeight:     '400px',
    borderRadius:  '12px',
    overflow:      'hidden',
    background:    '#000',
    display:       'flex',
    flexDirection: 'column',
    position:      'relative',
  },
  container: {
    width:     '100%',
    height:    '100%',
    flex:      1,
    minHeight: '400px',
  },
  overlay: {
    position:       'absolute',
    inset:          0,
    background:     'rgba(0, 0, 0, 0.95)',
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:         10,
    gap:            '12px',
  },
  spinner: {
    width:        '48px',
    height:       '48px',
    border:       '4px solid rgba(99, 102, 241, 0.2)',
    borderTop:    '4px solid #6366f1',
    borderRadius: '50%',
    animation:    'spin 1s linear infinite',
  },
  errorIcon: {
    fontSize: '48px',
  },
  overlayText: {
    color:      '#e2e8f0',
    fontSize:   '15px',
    fontWeight: '600',
    margin:     0,
  },
  overlaySub: {
    color:      '#64748b',
    fontSize:   '13px',
    fontFamily: 'monospace',
    margin:     0,
  },
  retryBtn: {
    marginTop:    '12px',
    padding:      '10px 24px',
    background:   'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color:        '#fff',
    border:       'none',
    borderRadius: '8px',
    cursor:       'pointer',
    fontSize:     '14px',
    fontWeight:   '600',
  },
};

// Add spinner animation
if (!document.head.querySelector('style[data-jitsi-styles]')) {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('data-jitsi-styles', 'true');
  styleSheet.textContent = `
    @keyframes spin {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default VideoCall;