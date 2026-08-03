import React, { useState, useEffect } from 'react';

function RoomTimer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (!endsAt) return;

    const update = () => {
      const now = new Date();
      const end = new Date(endsAt);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        setIsWarning(true);
        setIsCritical(true);
        return;
      }

      const totalMins = Math.floor(diff / 60000);
      const hrs  = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      const secs = Math.floor((diff % 60000) / 1000);

      // Show hours only if the meeting is longer than 1 hour
      if (hrs > 0) {
        setTimeLeft(
          `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      } else {
        setTimeLeft(
          `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      }

      setIsWarning(totalMins < 5);
      setIsCritical(totalMins < 1);
    };

    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [endsAt]);

  // Colour themes — light UI friendly
  const theme = isCritical
    ? { bg: '#fee2e2', border: '#f87171', text: '#b91c1c', glow: 'rgba(239,68,68,0.30)' }
    : isWarning
    ? { bg: '#fff7ed', border: '#fdba74', text: '#c2410c', glow: 'rgba(249,115,22,0.25)' }
    : { bg: '#ecfdf5', border: '#6ee7b7', text: '#047857', glow: 'rgba(16,185,129,0.20)' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 13px',
        borderRadius: '20px',
        background: theme.bg,
        border: `1.5px solid ${theme.border}`,
        color: theme.text,
        fontSize: '13px',
        fontWeight: '700',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.03em',
        boxShadow: `0 1px 4px ${theme.glow}`,
        whiteSpace: 'nowrap',
        transition: 'all 0.3s ease',
        animation: isCritical ? 'timerBlink 1s ease-in-out infinite' : 'none',
      }}
    >
      <span style={{ fontSize: '12px', lineHeight: 1 }}>⏱</span>
      {timeLeft}
    </span>
  );
}

export default RoomTimer;