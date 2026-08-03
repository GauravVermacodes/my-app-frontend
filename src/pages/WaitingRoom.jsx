import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { AuthContext } from '../App';
import { SOCKET_URL } from '../config';

function WaitingRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [status, setStatus] = useState('Waiting for host to approve you...');
  const socketRef = useRef(null);

  useEffect(() => {
    const guestSession = sessionStorage.getItem('guest_session');
    const pendingJoin = sessionStorage.getItem('pending_join');
    
    let auth = {};
    let roomId = null;
    let isGuest = false;

    if (guestSession) {
      const g = JSON.parse(guestSession);
      auth = { guestToken: g.guestToken };
      roomId = g.roomId;
      isGuest = true;
    } else if (pendingJoin && token) {
      const p = JSON.parse(pendingJoin);
      auth = { token };
      roomId = p.roomId;
    } else {
      toast.error('Session expired. Please rejoin.');
      navigate(`/join/${roomCode}`);
      return;
    }

    const socket = io(`${SOCKET_URL}/room`, { auth });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRoom', { roomId });
    });

    socket.on('waitingForApproval', (data) => {
      setStatus(data.message || 'Waiting for host to approve...');
    });

    socket.on('approvedByHost', () => {
      toast.success('Approved! Joining meeting...');
      setTimeout(() => {
        if (isGuest) {
          navigate(`/guest-room/${roomId}`);
        } else {
          navigate(`/room/${roomId}`);
        }
      }, 500);
    });

    socket.on('rejected', (data) => {
      toast.error(data.message || 'Your join request was rejected');
      sessionStorage.removeItem('guest_session');
      sessionStorage.removeItem('pending_join');
      setTimeout(() => navigate('/'), 2000);
    });

    socket.on('roomClosed', () => {
      toast.error('Room has been closed');
      navigate('/');
    });

    socket.on('error', (data) => {
      toast.error(data.message || 'Error');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomCode, token, navigate]);

  const handleCancel = () => {
    if (socketRef.current) socketRef.current.disconnect();
    sessionStorage.removeItem('guest_session');
    sessionStorage.removeItem('pending_join');
    navigate('/');
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.spinner}></div>
        <h2>Please Wait</h2>
        <p style={s.status}>{status}</p>
        <p style={s.subtext}>The host will let you in shortly.</p>
        <button style={s.btn} onClick={handleCancel}>Cancel</button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', background: '#0f0f1e', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'system-ui',
  },
  card: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', padding: '48px', textAlign: 'center', maxWidth: '450px',
  },
  spinner: {
    width: '60px', height: '60px', margin: '0 auto 24px',
    border: '4px solid rgba(99,102,241,0.2)',
    borderTopColor: '#6366f1', borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  status: { color: '#a5b4fc', margin: '16px 0 8px', fontSize: '16px' },
  subtext: { color: '#64748b', fontSize: '14px', marginBottom: '24px' },
  btn: {
    padding: '12px 24px', borderRadius: '10px',
    background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer',
  },
};

export default WaitingRoom;