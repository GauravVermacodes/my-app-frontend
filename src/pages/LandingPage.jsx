import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../App';

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [meetingCode, setMeetingCode] = useState('');

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    const code = meetingCode.trim();
    if (!code) {
      toast.error('Please enter a meeting code');
      return;
    }
    navigate(`/join/${code}`);
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>🎬 WatchParty</div>
        <div style={s.headerActions}>
          {user ? (
            <button style={s.btnPrimary} onClick={() => navigate('/dashboard')}>
              My Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" style={s.linkBtn}>Sign In</Link>
              <Link to="/register" style={s.btnPrimary}>Sign Up Free</Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <main style={s.main}>
        <div style={s.hero}>
          <h1 style={s.title}>Watch Together. Anywhere.</h1>
          <p style={s.subtitle}>
            Host video watch parties with friends, family, or students. 
            Live chat, video calls, screen sharing, and more.
          </p>

          {/* Join Meeting Card */}
          <div style={s.joinCard}>
            <h2 style={s.cardTitle}>Join a Meeting</h2>
            <p style={s.cardSubtitle}>Enter the meeting code shared by the host</p>
            <form onSubmit={handleJoinMeeting} style={s.form}>
              <input
                type="text"
                placeholder="Enter Meeting Code (e.g. ABC12345)"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                style={s.input}
                maxLength={24}
                autoFocus
                autoCapitalize="characters"     // ✅ Mobile keyboard auto-caps
                autoCorrect="off"                // ✅ Prevent autocorrect
                spellCheck="false"
              />
              <button type="submit" style={s.btnJoin}>
                Join Meeting →
              </button>
            </form>
            <p style={s.helper}>
              No account needed to join. Just enter the code.
            </p>
          </div>

          {/* Host CTA */}
          <div style={s.hostSection}>
            <p style={s.hostText}>Want to host your own watch party?</p>
            {user ? (
              <button style={s.btnHost} onClick={() => navigate('/dashboard')}>
                🎬 Start Hosting
              </button>
            ) : (
              <div style={s.hostActions}>
                <Link to="/register" style={s.btnHost}>Create Free Account</Link>
                <Link to="/login" style={s.btnHostSecondary}>Already have account?</Link>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div style={s.features}>
          <FeatureCard icon="🎥" title="HD Video Calls" desc="Face-to-face with your friends" />
          <FeatureCard icon="💬" title="Live Chat" desc="Group + Private messaging" />
          <FeatureCard icon="🖥️" title="Screen Share" desc="Share your screen anytime" />
          <FeatureCard icon="🎬" title="Sync Playback" desc="Everyone watches together" />
        </div>
      </main>

      <footer style={s.footer}>
        <p>© 2025 WatchParty. Made for watching together.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={s.feature}>
      <div style={s.featureIcon}>{icon}</div>
      <h3 style={s.featureTitle}>{title}</h3>
      <p style={s.featureDesc}>{desc}</p>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logo: { fontSize: '24px', fontWeight: 'bold' },
  headerActions: { display: 'flex', gap: '12px', alignItems: 'center' },
  linkBtn: {
    color: '#fff', textDecoration: 'none', padding: '10px 20px',
    borderRadius: '8px',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', padding: '10px 20px', borderRadius: '8px',
    border: 'none', cursor: 'pointer', fontWeight: '600',
    textDecoration: 'none', display: 'inline-block',
  },
  main: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' },
  hero: { textAlign: 'center', marginBottom: '60px' },
  title: {
    fontSize: '52px', fontWeight: 'bold', margin: '0 0 16px',
    background: 'linear-gradient(135deg, #a5b4fc, #f0abfc)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '20px', color: '#94a3b8', maxWidth: '600px',
    margin: '0 auto 40px', lineHeight: '1.6',
  },
  joinCard: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', padding: '40px', maxWidth: '500px',
    margin: '0 auto 30px', backdropFilter: 'blur(10px)',
  },
  cardTitle: { fontSize: '28px', margin: '0 0 8px' },
  cardSubtitle: { color: '#94a3b8', marginBottom: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: {
    padding: '16px 20px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)', color: '#fff',
    fontSize: '18px', outline: 'none', textAlign: 'center', letterSpacing: '2px',
  },
  btnJoin: {
    padding: '16px 24px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '18px', fontWeight: '600',
    border: 'none', cursor: 'pointer',
  },
  helper: { fontSize: '13px', color: '#64748b', marginTop: '16px', margin: '16px 0 0' },
  hostSection: {
    padding: '20px', maxWidth: '500px', margin: '0 auto',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  hostText: { color: '#94a3b8', marginBottom: '16px' },
  hostActions: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  btnHost: {
    display: 'inline-block',
    padding: '14px 28px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff', fontSize: '16px', fontWeight: '600',
    border: 'none', cursor: 'pointer', textDecoration: 'none',
  },
  btnHostSecondary: {
    display: 'inline-block',
    padding: '14px 28px', borderRadius: '12px',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff', fontSize: '16px', textDecoration: 'none',
  },
  features: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px', marginTop: '40px',
  },
  feature: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '30px', textAlign: 'center',
  },
  featureIcon: { fontSize: '48px', marginBottom: '12px' },
  featureTitle: { fontSize: '18px', margin: '0 0 8px' },
  featureDesc: { color: '#94a3b8', fontSize: '14px', margin: 0 },
  footer: {
    padding: '30px', textAlign: 'center', color: '#64748b',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
};

export default LandingPage;