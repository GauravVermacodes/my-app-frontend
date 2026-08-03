import React, { useRef, useEffect, useState } from 'react';

function VideoPlayer({ videoUrl, roomId, roomSocket, isHost }) {
  const videoRef = useRef(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!roomSocket) return;

    roomSocket.on('videoPlay', (data) => {
      if (videoRef.current) {
        setIsSyncing(true);
        videoRef.current.currentTime = data.currentTime;
        videoRef.current.play().catch(() => {});
        setTimeout(() => setIsSyncing(false), 200);
      }
    });

    roomSocket.on('videoPause', (data) => {
      if (videoRef.current) {
        setIsSyncing(true);
        videoRef.current.currentTime = data.currentTime;
        videoRef.current.pause();
        setTimeout(() => setIsSyncing(false), 200);
      }
    });

    roomSocket.on('videoSeek', (data) => {
      if (videoRef.current) {
        setIsSyncing(true);
        videoRef.current.currentTime = data.currentTime;
        setTimeout(() => setIsSyncing(false), 200);
      }
    });

    return () => {
      roomSocket.off('videoPlay');
      roomSocket.off('videoPause');
      roomSocket.off('videoSeek');
    };
  }, [roomSocket]);

  const handlePlay = () => {
    if (isSyncing || !isHost) return;
    roomSocket?.emit('videoPlay', { roomId, currentTime: videoRef.current.currentTime });
  };

  const handlePause = () => {
    if (isSyncing || !isHost) return;
    roomSocket?.emit('videoPause', { roomId, currentTime: videoRef.current.currentTime });
  };

  const handleSeeked = () => {
    if (isSyncing || !isHost) return;
    roomSocket?.emit('videoSeek', { roomId, currentTime: videoRef.current.currentTime });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <video
        ref={videoRef}
        src={videoUrl}
        controls={isHost}
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
      />
      {!isHost && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'rgba(0,0,0,0.7)', padding: '4px 10px',
          borderRadius: '4px', color: '#fff', fontSize: '11px',
        }}>
          🔒 Only host can control playback
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;