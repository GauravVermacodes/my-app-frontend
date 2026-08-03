import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';

const GENDER_LABELS = {
  male: 'Male', female: 'Female',
  other: 'Other', prefer_not_to_say: 'Prefer not to say',
};

const GENDER_OPTIONS = [
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

function Profile() {
  
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || '',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    gender: user?.gender || 'prefer_not_to_say',
    mobileNumber: user?.mobileNumber || '',
    address: user?.address || '',
    country: user?.country || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.username.trim()) e.username = 'Username is required';
    else if (formData.username.length < 3) e.username = 'Min 3 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formattedBirthDate = user?.birthDate
    ? new Date(user.birthDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null;

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .pf-layout { grid-template-columns: 1fr !important; }
          .pf-sidebar { position: static !important; }
        }
        @media (max-width: 640px) {
          .pf-page { padding: 16px 12px !important; }
          .pf-card { padding: 20px !important; border-radius: 16px !important; }
          .pf-info-grid { grid-template-columns: 1fr !important; }
          .pf-hero-name { font-size: 20px !important; }
          .pf-avatar-img, .pf-avatar-ph { width: 100px !important; height: 100px !important; font-size: 40px !important; }
        }
        .pf-input:focus {
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1) !important;
          background: #ffffff !important;
        }
        .pf-info-row:hover {
          border-color: #ddd6fe !important;
        }
      `}</style>

      <div className="pf-page" style={s.page}>
        <div style={s.container}>
          <div className="pf-layout" style={s.layout}>
            {/* ══ LEFT: Profile hero card ══ */}
            <div className="pf-sidebar" style={s.sidebar}>
              <div className="pf-card" style={s.heroCard}>
                <div style={s.avatarWrap}>
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="pf-avatar-img"
                      style={s.avatarImg}
                    />
                  ) : (
                    <div className="pf-avatar-ph" style={s.avatarPlaceholder}>
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{
                    ...s.onlineDot,
                    background: user?.isOnline ? '#10b981' : '#94a3b8',
                  }} />
                </div>
                <h1 className="pf-hero-name" style={s.displayName}>{user?.username}</h1>
                <p style={s.displayEmail}>{user?.email}</p>
                {user?.age && (
                  <p style={s.displayAge}>{user.age} years old</p>
                )}
              </div>

              {/* Account Actions card */}
              <div className="pf-card" style={s.actionsCard}>
                <h3 style={s.actionsTitle}>Account Actions</h3>
                
                <button style={s.logoutBtn} onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </div>
            </div>

            {/* ══ RIGHT: Profile info / edit form ══ */}
            <div className="pf-card" style={s.mainCard}>
              <div style={s.cardHeader}>
                <h2 style={s.cardTitle}>
                  {editing ? 'Edit Profile' : 'Profile Information'}
                </h2>
                {editing ? (
                  <button
                    style={s.cancelBtn}
                    onClick={() => { setEditing(false); setErrors({}); }}
                  >
                    ✕ Cancel
                  </button>
                ) : (
                  <button style={s.editBtn} onClick={() => setEditing(true)}>
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {!editing ? (
                /* ── VIEW MODE ── */
                <div className="pf-info-grid" style={s.infoGrid}>
                  <InfoField icon="👤" label="Username" value={user?.username} />
                  <InfoField icon="📧" label="Email" value={user?.email} />
                  <InfoField icon="📱" label="Mobile" value={user?.mobileNumber} />
                  <InfoField icon="🎂" label="Birth Date" value={formattedBirthDate} />
                  <InfoField icon="⚧" label="Gender" value={GENDER_LABELS[user?.gender]} />
                  <InfoField icon="🌍" label="Country" value={user?.country} />
                  <InfoField icon="📍" label="Address" value={user?.address} fullWidth />
                </div>
              ) : (
                /* ── EDIT MODE ── */
                <div className="pf-info-grid" style={s.infoGrid}>
                  <EditField label="Username *" error={errors.username}>
                    <input
                      name="username"
                      className="pf-input"
                      value={formData.username}
                      onChange={handleChange}
                      maxLength={30}
                      style={{ ...s.input, ...(errors.username ? s.inputErr : {}) }}
                    />
                  </EditField>

                  <EditField label="Avatar URL">
                    <input
                      type="url"
                      name="avatar"
                      className="pf-input"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://..."
                      style={s.input}
                    />
                  </EditField>

                  <EditField label="Mobile Number">
                    <input
                      type="tel"
                      name="mobileNumber"
                      className="pf-input"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      style={s.input}
                    />
                  </EditField>

                  <EditField label="Birth Date">
                    <input
                      type="date"
                      name="birthDate"
                      className="pf-input"
                      value={formData.birthDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      style={s.input}
                    />
                  </EditField>

                  <EditField label="Gender">
                    <select
                      name="gender"
                      className="pf-input"
                      value={formData.gender}
                      onChange={handleChange}
                      style={s.input}
                    >
                      {GENDER_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </EditField>

                  <EditField label="Country">
                    <input
                      type="text"
                      name="country"
                      className="pf-input"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="United States"
                      style={s.input}
                    />
                  </EditField>

                  <EditField label="Address" fullWidth>
                    <input
                      type="text"
                      name="address"
                      className="pf-input"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main Street"
                      style={s.input}
                    />
                  </EditField>
                </div>
              )}

              {editing && (
                <div style={s.formFooter}>
                  <button
                    style={s.cancelBtn2}
                    onClick={() => { setEditing(false); setErrors({}); }}
                  >
                    Cancel
                  </button>
                  <button
                    style={{ ...s.saveBtn, ...(loading ? s.disabledBtn : {}) }}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? '⏳ Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoField({ icon, label, value, fullWidth }) {
  return (
    <div
      className="pf-info-row"
      style={{
        ...inf.field,
        ...(fullWidth ? { gridColumn: '1 / -1' } : {}),
      }}
    >
      <div style={inf.iconBox}>{icon}</div>
      <div style={inf.content}>
        <span style={inf.label}>{label}</span>
        <span style={{
          ...inf.value,
          color: value ? '#0f172a' : '#94a3b8',
          fontStyle: value ? 'normal' : 'italic',
        }}>
          {value || 'Not set'}
        </span>
      </div>
    </div>
  );
}

function EditField({ label, error, children, fullWidth }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      ...(fullWidth ? { gridColumn: '1 / -1' } : {}),
    }}>
      <label style={s.label}>{label}</label>
      {children}
      {error && <span style={s.errMsg}>{error}</span>}
    </div>
  );
}

const inf = {
  field: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    transition: 'all 0.2s',
    minWidth: 0,
  },
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: 1,
  },
  label: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: '14px',
    fontWeight: '500',
    wordBreak: 'break-word',
  },
};

const s = {
  page: {
    minHeight: 'calc(100vh - 70px)',
    background: '#f8fafc',
    padding: '32px 20px',
    color: '#0f172a',
  },
  container: { maxWidth: '1100px', margin: '0 auto' },
  layout: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'sticky',
    top: '20px',
  },
  heroCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '28px 24px',
    textAlign: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  avatarWrap: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '16px',
  },
  avatarImg: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #f5f3ff',
    boxShadow: '0 4px 16px rgba(139,92,246,0.15)',
  },
  avatarPlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: '700',
    color: '#fff',
    border: '4px solid #f5f3ff',
    boxShadow: '0 4px 16px rgba(139,92,246,0.25)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '3px solid #ffffff',
  },
  displayName: {
    margin: '8px 0 4px',
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    wordBreak: 'break-word',
  },
  displayEmail: {
    margin: '4px 0 0',
    color: '#64748b',
    fontSize: '14px',
    wordBreak: 'break-word',
  },
  displayAge: {
    margin: '8px 0 0',
    color: '#94a3b8',
    fontSize: '13px',
  },

  actionsCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  actionsTitle: {
    margin: '0 0 6px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#334155',
  },
  primaryActionBtn: {
    padding: '11px 16px',
    background: '#8b5cf6',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(139,92,246,0.25)',
  },
  logoutBtn: {
    padding: '11px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    color: '#dc2626',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },

  mainCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '22px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  editBtn: {
    padding: '9px 16px',
    background: '#8b5cf6',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 2px 6px rgba(139,92,246,0.25)',
  },
  cancelBtn: {
    padding: '9px 16px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },

  formFooter: {
    display: 'flex',
    gap: '10px',
    marginTop: '22px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
    justifyContent: 'flex-end',
  },
  cancelBtn2: {
    padding: '11px 20px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  saveBtn: {
    padding: '11px 24px',
    background: '#8b5cf6',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(139,92,246,0.25)',
  },
  disabledBtn: { opacity: 0.6, cursor: 'not-allowed' },

  label: {
    fontSize: '13px',
    color: '#475569',
    fontWeight: '600',
  },
  input: {
    padding: '12px 14px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#0f172a',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  inputErr: {
    borderColor: '#ef4444',
    background: '#fef2f2',
  },
  errMsg: {
    color: '#dc2626',
    fontSize: '12px',
  },
};

export default Profile;