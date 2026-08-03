import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CustomVideoPlayer = ({
  src,
  poster,
  title,
  nextVideoId,
  nextVideoTitle,
  autoPlay = false,
  onEnded,
}) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const lastTapRef = useRef({ time: 0, side: null });

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [quality, setQuality] = useState("Auto");
  const [showNextCard, setShowNextCard] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [seekAnimation, setSeekAnimation] = useState(null);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isProgressHovered, setIsProgressHovered] = useState(false); // ✅ NEW

  // ============ EVENT HANDLERS ============

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, []);

  const skip = useCallback((seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds)
    );
    setSeekAnimation(seconds > 0 ? "forward" : "backward");
    setTimeout(() => setSeekAnimation(null), 600);
  }, []);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * videoRef.current.duration;
  };

  const handleProgressHover = (e) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(percent * duration);
    setHoverPosition(e.clientX - rect.left);
  };

  const handlePlaybackRate = (rate) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  // ============ DOUBLE-TAP GESTURES ============

  const handleVideoTap = (e) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current.time;
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX || e.touches?.[0]?.clientX;
    const side = tapX - rect.left < rect.width / 2 ? "left" : "right";

    if (timeSinceLastTap < 300 && lastTapRef.current.side === side) {
      if (side === "right") skip(10);
      else skip(-10);
      lastTapRef.current = { time: 0, side: null };
    } else {
      lastTapRef.current = { time: now, side };
      setTimeout(() => {
        if (Date.now() - lastTapRef.current.time > 250) {
          togglePlay();
        }
      }, 300);
    }
  };

  // ============ KEYBOARD SHORTCUTS ============

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowright":
        case "l":
          e.preventDefault();
          skip(10);
          break;
        case "arrowleft":
        case "j":
          e.preventDefault();
          skip(-10);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((v) => {
            const newVol = Math.min(1, v + 0.1);
            if (videoRef.current) videoRef.current.volume = newVol;
            return newVol;
          });
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((v) => {
            const newVol = Math.max(0, v - 0.1);
            if (videoRef.current) videoRef.current.volume = newVol;
            return newVol;
          });
          break;
        case "0":
        case "home":
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime = 0;
          break;
        default:
          if (e.key >= "1" && e.key <= "9") {
            const percent = parseInt(e.key) * 10;
            if (videoRef.current) {
              videoRef.current.currentTime =
                (videoRef.current.duration * percent) / 100;
            }
          }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skip]);

  // ============ VIDEO EVENTS ============

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (
        nextVideoId &&
        video.duration - video.currentTime <= 10 &&
        video.duration - video.currentTime > 0
      ) {
        setShowNextCard(true);
      } else {
        setShowNextCard(false);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
      if (nextVideoId && autoPlayNext) {
        setTimeout(() => navigate(`/video/${nextVideoId}`), 2000);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [nextVideoId, autoPlayNext, navigate, onEnded]);

  // ============ AUTO-HIDE CONTROLS ============

  const resetControlsTimeout = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [isPlaying]);

  // ============ HELPERS ============

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  // ============ ICON COMPONENTS ============

  const PlayIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  const PauseIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  );

  const SkipBackIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
      <text x="12" y="16" fontSize="7" fontWeight="700" textAnchor="middle" fill="currentColor">10</text>
    </svg>
  );

  const SkipForwardIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
      <text x="12" y="16" fontSize="7" fontWeight="700" textAnchor="middle" fill="currentColor">10</text>
    </svg>
  );

  const VolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
      );
    }
    if (volume < 0.5) {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
        </svg>
      );
    }
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      </svg>
    );
  };

  const SettingsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );

  const FullscreenIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      {isFullscreen ? (
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
      ) : (
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
      )}
    </svg>
  );

  const CloseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 11 12l-6 5.59L6.41 19 12 13.41 17.59 19 19 17.59 13 12z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );

  // ============ RENDER ============

  return (
    <div
      ref={containerRef}
      className="custom-player"
      style={styles.container}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* VIDEO */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        style={styles.video}
        onClick={handleVideoTap}
        onDoubleClick={(e) => e.preventDefault()}
        onError={() => toast.error("Failed to load video")}
      />

      {/* LOADING SPINNER */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner}></div>
        </div>
      )}

      {/* CENTER PLAY BUTTON */}
      {!isPlaying && !isLoading && (
        <div style={styles.centerPlayWrapper} onClick={togglePlay}>
          <div style={styles.centerPlayBtn}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* SEEK ANIMATIONS */}
      {seekAnimation && (
        <div
          style={{
            ...styles.seekAnimation,
            [seekAnimation === "forward" ? "right" : "left"]: "15%",
          }}
        >
          <div style={styles.seekIcon}>
            <div style={{ fontSize: 32, marginBottom: 4, letterSpacing: -2 }}>
              {seekAnimation === "forward" ? "»»" : "««"}
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>
              10 seconds
            </div>
          </div>
        </div>
      )}

      {/* NEXT VIDEO CARD */}
      {showNextCard && nextVideoId && (
        <div style={styles.nextVideoCard}>
          <button
            onClick={() => setShowNextCard(false)}
            style={styles.closeCard}
          >
            <CloseIcon />
          </button>
          <div style={styles.nextVideoLabel}>UP NEXT</div>
          <div style={styles.nextVideoTitle}>
            {nextVideoTitle || "Next Video"}
          </div>
          <div style={styles.nextVideoProgress}>
            <div
              style={{
                ...styles.nextVideoProgressBar,
                width: `${((10 - (duration - currentTime)) / 10) * 100}%`,
              }}
            />
          </div>
          <div style={styles.nextVideoFooter}>
            <span style={styles.nextVideoTime}>
              Playing in {Math.ceil(duration - currentTime)}s
            </span>
            <button
              onClick={() => navigate(`/video/${nextVideoId}`)}
              style={styles.nextVideoBtn}
            >
              Play Now
            </button>
          </div>
        </div>
      )}

      {/* TITLE OVERLAY (top) */}
      {title && (showControls || !isPlaying) && (
        <div style={styles.titleOverlay}>
          <div style={styles.titleText}>{title}</div>
        </div>
      )}

      {/* CONTROLS BAR */}
      <div
        style={{
          ...styles.controls,
          opacity: showControls || !isPlaying ? 1 : 0,
          pointerEvents: showControls || !isPlaying ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* PROGRESS BAR with hover tooltip */}
        <div
          ref={progressBarRef}
          style={styles.progressWrapper}
          onClick={handleProgressClick}
          onMouseMove={handleProgressHover}
          onMouseEnter={() => setIsProgressHovered(true)}
          onMouseLeave={() => {
            setHoverTime(null);
            setIsProgressHovered(false);
          }}
        >
          {/* Hover tooltip */}
          {hoverTime !== null && (
            <div
              style={{
                ...styles.hoverTooltip,
                left: `${hoverPosition}px`,
              }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          <div
            style={{
              ...styles.progressTrack,
              height: isProgressHovered ? 6 : 4,
            }}
          >
            <div
              style={{ ...styles.progressBuffered, width: `${bufferedPercent}%` }}
            />
            <div
              style={{ ...styles.progressFilled, width: `${progressPercent}%` }}
            />
            <div
              style={{
                ...styles.progressThumb,
                left: `${progressPercent}%`,
                opacity: isProgressHovered ? 1 : 0,
                transform: `translate(-50%, -50%) scale(${
                  isProgressHovered ? 1 : 0.5
                })`,
              }}
            />
          </div>
        </div>

        {/* CONTROL BUTTONS */}
        <div style={styles.buttonRow}>
          <div style={styles.leftControls}>
            <IconBtn onClick={togglePlay} title="Play/Pause (K)">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconBtn>

            <IconBtn onClick={() => skip(-10)} title="Rewind 10s (J)">
              <SkipBackIcon />
            </IconBtn>

            <IconBtn onClick={() => skip(10)} title="Forward 10s (L)">
              <SkipForwardIcon />
            </IconBtn>

            {/* Volume */}
            <div style={styles.volumeGroup} className="volume-group">
              <IconBtn onClick={toggleMute} title="Mute (M)">
                <VolumeIcon />
              </IconBtn>
              <div style={styles.volumeSliderWrapper} className="volume-slider-wrap">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  style={{
                    ...styles.volumeSlider,
                    background: `linear-gradient(to right, white 0%, white ${
                      (isMuted ? 0 : volume) * 100
                    }%, rgba(255,255,255,0.3) ${
                      (isMuted ? 0 : volume) * 100
                    }%, rgba(255,255,255,0.3) 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Time Display */}
            <div style={styles.timeDisplay}>
              <span style={styles.timeCurrent}>{formatTime(currentTime)}</span>
              <span style={styles.timeDivider}>/</span>
              <span style={styles.timeTotal}>{formatTime(duration)}</span>
            </div>
          </div>

          <div style={styles.rightControls}>
            {/* Playback Speed */}
            <div style={styles.menuWrapper}>
              <button
                style={{
                  ...styles.speedBtn,
                  color: playbackRate !== 1 ? "#60a5fa" : "white",
                }}
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                }}
                title="Playback speed"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>Playback Speed</div>
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <button
                      key={rate}
                      style={{
                        ...styles.dropdownOption,
                        background:
                          playbackRate === rate
                            ? "rgba(255,255,255,0.1)"
                            : "transparent",
                      }}
                      onClick={() => handlePlaybackRate(rate)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.15)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          playbackRate === rate
                            ? "rgba(255,255,255,0.1)"
                            : "transparent")
                      }
                    >
                      <span
                        style={{
                          width: 16,
                          display: "inline-flex",
                          alignItems: "center",
                          color: "#60a5fa",
                        }}
                      >
                        {playbackRate === rate && <CheckIcon />}
                      </span>
                      <span style={{ marginLeft: 8 }}>
                        {rate === 1 ? "Normal" : `${rate}x`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality */}
            <div style={styles.menuWrapper}>
              <IconBtn
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSpeedMenu(false);
                }}
                title="Settings"
              >
                <SettingsIcon />
              </IconBtn>
              {showQualityMenu && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>Quality</div>
                  {["Auto", "1080p", "720p", "480p", "360p"].map((q) => (
                    <button
                      key={q}
                      style={{
                        ...styles.dropdownOption,
                        background:
                          quality === q
                            ? "rgba(255,255,255,0.1)"
                            : "transparent",
                      }}
                      onClick={() => {
                        setQuality(q);
                        setShowQualityMenu(false);
                        toast.success(`Quality: ${q}`);
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.15)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          quality === q
                            ? "rgba(255,255,255,0.1)"
                            : "transparent")
                      }
                    >
                      <span
                        style={{
                          width: 16,
                          display: "inline-flex",
                          alignItems: "center",
                          color: "#60a5fa",
                        }}
                      >
                        {quality === q && <CheckIcon />}
                      </span>
                      <span style={{ marginLeft: 8 }}>{q}</span>
                      {q === "1080p" && (
                        <span style={styles.hdBadge}>HD</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <IconBtn onClick={toggleFullscreen} title="Fullscreen (F)">
              <FullscreenIcon />
            </IconBtn>
          </div>
        </div>
      </div>

      {/* Inline CSS animations & slider styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-50%) scale(0.8); }
          20% { opacity: 1; transform: translateY(-50%) scale(1); }
          80% { opacity: 1; transform: translateY(-50%) scale(1); }
          100% { opacity: 0; transform: translateY(-50%) scale(1.1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .custom-player input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .custom-player input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }

        /* ✅ Expand volume slider on hover */
        .custom-player .volume-group:hover .volume-slider-wrap {
          width: 90px !important;
        }
      `}</style>
    </div>
  );
};

// ✅ Reusable Icon Button
const IconBtn = ({ children, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      background: "transparent",
      border: "none",
      color: "white",
      cursor: "pointer",
      padding: 10,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 0.2s, transform 0.15s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(255,255,255,0.15)";
      e.currentTarget.style.transform = "scale(1.08)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.transform = "scale(1)";
    }}
  >
    {children}
  </button>
);

// ============ STYLES ============

const styles = {
  // ✅ BIGGER container with min-height for better viewing
  container: {
    position: "relative",
    width: "100%",
    background: "#000",
    borderRadius: 14,
    overflow: "hidden",
    aspectRatio: "16 / 9",
    minHeight: 480, // ✅ Ensure minimum viewing size
    cursor: "pointer",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
  },
  video: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "contain",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.4)",
    zIndex: 5,
    backdropFilter: "blur(2px)",
  },
  spinner: {
    width: 52,
    height: 52,
    border: "3px solid rgba(255,255,255,0.15)",
    borderTop: "3px solid white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  centerPlayWrapper: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    cursor: "pointer",
    background: "rgba(0,0,0,0.2)",
  },
  centerPlayBtn: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.95)",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 8,
    transition: "transform 0.2s, background 0.2s",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    backdropFilter: "blur(10px)",
    animation: "fadeInUp 0.3s ease-out",
  },
  seekAnimation: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    pointerEvents: "none",
    animation: "fadeInOut 0.6s ease-out",
  },
  seekIcon: {
    background: "rgba(0,0,0,0.75)",
    color: "white",
    padding: "22px 32px",
    borderRadius: 14,
    textAlign: "center",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  nextVideoCard: {
    position: "absolute",
    bottom: 100,
    right: 24,
    background: "rgba(20,20,20,0.95)",
    color: "white",
    padding: 18,
    borderRadius: 14,
    zIndex: 10,
    width: 320,
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    animation: "slideInRight 0.3s ease-out",
  },
  closeCard: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "white",
    width: 26,
    height: 26,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  nextVideoLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: "#60a5fa",
    marginBottom: 6,
  },
  nextVideoTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 14,
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    paddingRight: 20,
  },
  nextVideoProgress: {
    width: "100%",
    height: 3,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 14,
  },
  nextVideoProgressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
    borderRadius: 2,
    transition: "width 0.3s linear",
  },
  nextVideoFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextVideoTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    fontWeight: 500,
  },
  nextVideoBtn: {
    background: "white",
    color: "#000",
    border: "none",
    padding: "7px 16px",
    borderRadius: 7,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    transition: "opacity 0.2s, transform 0.2s",
  },
  titleOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: "18px 24px 48px 24px",
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
    pointerEvents: "none",
    transition: "opacity 0.3s",
    zIndex: 6,
  },
  titleText: {
    color: "white",
    fontSize: 18,
    fontWeight: 600,
    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
    lineHeight: 1.4,
    letterSpacing: -0.2,
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "0 16px 10px 16px",
    background:
      "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
    transition: "opacity 0.3s",
    zIndex: 6,
  },
  progressWrapper: {
    position: "relative",
    padding: "14px 4px",
    cursor: "pointer",
  },
  hoverTooltip: {
    position: "absolute",
    bottom: 26,
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.9)",
    color: "white",
    padding: "5px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "-apple-system, monospace",
    fontWeight: 600,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    backdropFilter: "blur(4px)",
    fontVariantNumeric: "tabular-nums",
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
  },
  progressTrack: {
    position: "relative",
    width: "100%",
    background: "rgba(255,255,255,0.25)",
    borderRadius: 3,
    transition: "height 0.2s",
  },
  progressBuffered: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    background: "rgba(255,255,255,0.5)",
    borderRadius: 3,
  },
  progressFilled: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    background: "white",
    borderRadius: 3,
  },
  progressThumb: {
    position: "absolute",
    top: "50%",
    width: 14,
    height: 14,
    background: "white",
    borderRadius: "50%",
    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
    transition: "opacity 0.2s, transform 0.2s",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    marginTop: -6,
  },
  leftControls: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  rightControls: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  volumeGroup: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  volumeSliderWrapper: {
    width: 0,
    overflow: "hidden",
    transition: "width 0.3s ease",
    display: "flex",
    alignItems: "center",
  },
  volumeSlider: {
    width: 80,
    height: 3,
    cursor: "pointer",
    appearance: "none",
    borderRadius: 2,
    outline: "none",
    marginLeft: 4,
  },
  timeDisplay: {
    color: "white",
    fontSize: 14,
    marginLeft: 14,
    fontFamily: "-apple-system, monospace",
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 500,
  },
  timeCurrent: {
    color: "white",
    fontWeight: 600,
  },
  timeDivider: {
    color: "rgba(255,255,255,0.5)",
    margin: "0 2px",
  },
  timeTotal: {
    color: "rgba(255,255,255,0.7)",
  },
  speedBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    transition: "background 0.2s, color 0.2s",
    minWidth: 48,
  },
  menuWrapper: {
    position: "relative",
  },
  dropdown: {
    position: "absolute",
    bottom: "calc(100% + 10px)",
    right: 0,
    background: "rgba(28,28,30,0.98)",
    borderRadius: 12,
    padding: 6,
    minWidth: 200,
    backdropFilter: "blur(20px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,255,255,0.1)",
    animation: "fadeInUp 0.15s ease-out",
    overflow: "hidden",
  },
  dropdownHeader: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.2,
    padding: "8px 12px 6px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: 4,
  },
  dropdownOption: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "9px 12px",
    background: "transparent",
    border: "none",
    color: "white",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 6,
    transition: "background 0.15s",
  },
  hdBadge: {
    marginLeft: "auto",
    background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    color: "white",
    fontSize: 9,
    fontWeight: 800,
    padding: "2px 6px",
    borderRadius: 4,
    letterSpacing: 0.5,
  },
};

export default CustomVideoPlayer;