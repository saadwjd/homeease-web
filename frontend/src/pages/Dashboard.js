import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats/').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const tabs = user?.role === 'admin'
    ? [
        { id: 'overview', icon: '📊', label: 'Overview' },
        { id: 'bookings', icon: '📅', label: 'All Bookings' },
        { id: 'profile', icon: '👤', label: 'Profile' },
      ]
    : user?.role === 'provider'
    ? [
        { id: 'overview', icon: '📊', label: 'Overview' },
        { id: 'requests', icon: '📥', label: 'Requests' },
        { id: 'bookings', icon: '📅', label: 'My Bookings' },
        { id: 'providerProfile', icon: '🔧', label: 'Provider Profile' },
        { id: 'profile', icon: '👤', label: 'Account' },
      ]
    : [
        { id: 'overview', icon: '📊', label: 'Overview' },
        { id: 'bookings', icon: '📅', label: 'My Bookings' },
        { id: 'profile', icon: '👤', label: 'Profile' },
      ];

  const name = user?.name || 'User';

  return (
    <div style={{ background: 'var(--bg)', padding: '0 0 40px' }}>
      <div className="container">
        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-user">
              <div className="sidebar-avatar">{name[0]}</div>
              <div className="sidebar-name">{name}</div>
              <div className="sidebar-role">{user?.role}</div>
            </div>
            <ul className="sidebar-nav">
              {tabs.map(t => (
                <li key={t.id}>
                  <button className={activeTab === t.id ? 'active' : ''} onClick={() => setActiveTab(t.id)}>
                    <span className="icon">{t.icon}</span> {t.label}
                  </button>
                </li>
              ))}
              <li style={{ marginTop: 16 }}>
                <button onClick={async () => { await logout(); navigate('/'); }} style={{ color: 'var(--error)' }}>
                  <span className="icon">🚪</span> Sign Out
                </button>
              </li>
            </ul>
          </aside>

          {/* Main content */}
          <div className="dashboard-content">
            {activeTab === 'overview' && <OverviewTab stats={stats} role={user?.role} onNavigate={setActiveTab} />}
            {activeTab === 'bookings' && <BookingsTab role={user?.role} />}
            {activeTab === 'requests' && <RequestsTab />}
            {activeTab === 'profile' && <ProfileTab user={user} updateProfile={updateProfile} />}
            {activeTab === 'providerProfile' && <ProviderProfileTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Overview Tab ── */
function OverviewTab({ stats, role, onNavigate }) {
  const statCards = role === 'admin'
    ? [
        { label: 'Total Users', val: stats.total_users || 0, color: 'var(--primary)' },
        { label: 'Total Providers', val: stats.total_providers || 0, color: 'var(--accent)', cls: 'green' },
        { label: 'Total Bookings', val: stats.total_bookings || 0, color: '#9C27B0' },
        { label: 'Pending', val: stats.pending_bookings || 0, color: 'var(--warning)', cls: 'yellow' },
        { label: 'Completed', val: stats.completed_bookings || 0, color: 'var(--accent)', cls: 'green' },
        { label: 'Reviews', val: stats.total_reviews || 0, color: 'var(--warning)', cls: 'yellow' },
      ]
    : role === 'provider'
    ? [
        { label: 'Total Bookings', val: stats.total_bookings || 0, color: 'var(--primary)' },
        { label: 'Pending', val: stats.pending || 0, color: 'var(--warning)', cls: 'yellow' },
        { label: 'Confirmed', val: stats.confirmed || 0, color: 'var(--primary)' },
        { label: 'Completed', val: stats.completed || 0, color: 'var(--accent)', cls: 'green' },
        { label: 'Rating', val: `${stats.rating || '0.0'}★`, color: 'var(--warning)', cls: 'yellow' },
        { label: 'Reviews', val: stats.review_count || 0, color: 'var(--text)' },
      ]
    : [
        { label: 'Total Bookings', val: stats.total_bookings || 0, color: 'var(--primary)' },
        { label: 'Pending', val: stats.pending || 0, color: 'var(--warning)', cls: 'yellow' },
        { label: 'Completed', val: stats.completed || 0, color: 'var(--accent)', cls: 'green' },
        { label: 'Cancelled', val: stats.cancelled || 0, color: 'var(--error)', cls: 'red' },
      ];

  return (
    <div>
      <h2 className="section-heading">Dashboard Overview</h2>
      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className={`stat-card ${s.cls || ''}`} style={{ borderColor: s.color }}>
            <div className="stat-card-val" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 28, boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('bookings')}>View Bookings</button>
          <button className="btn btn-outline" onClick={() => window.location.href = '/services'}>Browse Providers</button>
          {role === 'provider' && <button className="btn btn-accent" onClick={() => onNavigate('requests')}>View Requests</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Bookings Tab ── */
function BookingsTab({ role }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewModal, setReviewModal] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = () => {
    setLoading(true);
    const params = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/bookings/${params}`)
      .then(r => setBookings(r.data.results || r.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await api.post(`/bookings/${id}/cancel/`);
    fetchBookings();
  };

  const handleStatusUpdate = async (id, status) => {
    await api.patch(`/bookings/${id}/update_status/`, { status });
    fetchBookings();
  };

  const STATUS_COLORS = { pending: 'status-pending', confirmed: 'status-confirmed', completed: 'status-completed', cancelled: 'status-cancelled', in_progress: 'status-in_progress' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="section-heading" style={{ marginBottom: 0 }}>
          {role === 'provider' ? 'My Bookings' : role === 'admin' ? 'All Bookings' : 'My Bookings'}
        </h2>
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner"></div></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No bookings found</h3>
          <p>Your bookings will appear here</p>
          {role === 'user' && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/services')}>Book a Service</button>}
        </div>
      ) : (
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{role === 'provider' ? 'Customer' : 'Provider'}</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--text-hint)', fontSize: 12 }}>#{b.id}</td>
                    <td style={{ fontWeight: 600 }}>
                      {role === 'provider' ? b.user?.name : b.provider_detail?.user?.name || '—'}
                    </td>
                    <td>{b.service_detail?.name || 'General'}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>{b.scheduled_date}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>{b.scheduled_time}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>Rs. {b.total_amount}</td>
                    <td><span className={`status-badge ${STATUS_COLORS[b.status] || ''}`}>{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {role === 'provider' && b.status === 'pending' && (
                          <>
                            <button className="btn btn-sm btn-accent" onClick={() => handleStatusUpdate(b.id, 'confirmed')}>Accept</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleStatusUpdate(b.id, 'cancelled')}>Decline</button>
                          </>
                        )}
                        {role === 'provider' && b.status === 'confirmed' && (
                          <button className="btn btn-sm btn-primary" onClick={() => handleStatusUpdate(b.id, 'completed')}>Mark Done</button>
                        )}
                        {role === 'user' && ['pending', 'confirmed'].includes(b.status) && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleCancel(b.id)}>Cancel</button>
                        )}
                        {role === 'user' && b.status === 'completed' && !b.is_reviewed && (
                          <button className="btn btn-sm btn-outline" onClick={() => setReviewModal(b)}>⭐ Review</button>
                        )}
                        {b.is_reviewed && <span style={{ fontSize: 11, color: 'var(--accent)' }}>✓ Reviewed</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reviewModal && (
        <ReviewModal booking={reviewModal} onClose={() => { setReviewModal(null); fetchBookings(); }} />
      )}
    </div>
  );
}

/* ── Requests Tab (Provider) ── */
function RequestsTab() {
  return <BookingsTab role="provider" />;
}

/* ── Review Modal ── */
function ReviewModal({ booking, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(0);

  const TAGS = ['Professional', 'On time', 'Good value', 'Friendly', 'Quality work'];

  const handleSubmit = async () => {
    if (!rating) return alert('Please select a star rating');
    setLoading(true);
    try {
      await api.post('/reviews/', {
        booking: booking.id,
        provider: booking.provider,
        rating,
        comment,
      });
      onClose();
    } catch (e) {
      alert('Failed to submit review. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Rate Your Experience</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{booking.provider_detail?.user?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-hint)' }}>{booking.service_detail?.name || 'Service'}</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div className="star-rating" style={{ justifyContent: 'center', marginBottom: 6 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className="star-btn"
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
              >
                <span className={n <= (hovered || rating) ? 'star-filled' : 'star-empty'}>★</span>
              </button>
            ))}
          </div>
          <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14, height: 20 }}>
            {LABELS[hovered || rating]}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '14px 0' }}>
          {TAGS.map(tag => (
            <button
              key={tag}
              className="skill-tag"
              style={{ cursor: 'pointer', border: '1px solid var(--primary)', fontSize: 12 }}
              onClick={() => setComment(c => c ? `${c}, ${tag}` : tag)}
            >
              + {tag}
            </button>
          ))}
        </div>

        <textarea
          className="form-control"
          rows={3}
          placeholder="Write your review (optional)..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-full" onClick={onClose}>Skip</button>
          <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading || !rating}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Profile Tab ── */
function ProfileTab({ user, updateProfile }) {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateProfile({ ...form, ...(avatar ? { avatar } : {}) });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to update profile. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="section-heading">My Profile</h2>
      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 32, boxShadow: 'var(--shadow)' }}>
        {success && <div className="success-banner">✅ Profile updated successfully!</div>}
        {error && <div className="error-banner">⚠️ {error}</div>}

        <div className="profile-grid">
          <div className="avatar-upload">
            <div className="avatar-preview" onClick={() => fileRef.current.click()} style={{ cursor: 'pointer' }}>
              {avatar
                ? <img src={URL.createObjectURL(avatar)} alt="avatar" />
                : user?.avatar_url
                  ? <img src={user.avatar_url} alt="avatar" />
                  : (user?.name?.[0] || '?')}
            </div>
            <input type="file" ref={fileRef} hidden accept="image/*" onChange={e => setAvatar(e.target.files[0])} />
            <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()}>
              📷 Change Photo
            </button>
            <div style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 6 }}>JPG, PNG up to 5MB</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input className="form-control" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              <div style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 4 }}>Email cannot be changed</div>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="03XX-XXXXXXX" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea className="form-control" name="address" rows={3} value={form.address} onChange={handleChange} placeholder="Your home address" />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <div style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
                {user?.role === 'provider' ? '🔧 Service Provider' : user?.role === 'admin' ? '⚙️ Admin' : '🏠 Customer'}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Provider Profile Tab ── */
function ProviderProfileTab({ user }) {
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ bio: '', hourly_rate: '', experience_years: '', city: '', address: '', gender: '', is_available: true, skill_ids: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/providers/me/'), api.get('/services/')]).then(([pRes, sRes]) => {
      setProfile(pRes.data);
      setServices(sRes.data);
      const p = pRes.data;
      setForm({
        bio: p.bio || '',
        hourly_rate: p.hourly_rate || '',
        experience_years: p.experience_years || '',
        city: p.city || '',
        address: p.address || '',
        gender: p.gender || '',
        is_available: p.is_available,
        skill_ids: p.skills?.map(s => s.id) || [],
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleSkill = (id) => {
    setForm(f => ({
      ...f,
      skill_ids: f.skill_ids.includes(id) ? f.skill_ids.filter(s => s !== id) : [...f.skill_ids, id]
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch('/providers/me/', form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to update provider profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div>
      <h2 className="section-heading">Provider Profile</h2>
      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 32, boxShadow: 'var(--shadow)' }}>
        {success && <div className="success-banner">✅ Provider profile updated!</div>}
        {error && <div className="error-banner">⚠️ {error}</div>}

        {profile && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 28, padding: 20, background: 'var(--bg)', borderRadius: 12 }}>
            <div className="provider-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>{user?.name?.[0]}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name}</div>
              <div className="stars" style={{ fontSize: 14 }}>{'★'.repeat(Math.floor(profile.rating || 0))}<span style={{ color: 'var(--text-hint)', fontSize: 12, marginLeft: 4 }}>{Number(profile.rating || 0).toFixed(1)} ({profile.review_count} reviews)</span></div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: profile.is_verified ? 'var(--accent)' : 'var(--warning)', fontWeight: 600 }}>
                {profile.is_verified ? '✓ Verified' : '⏳ Pending Verification'}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Availability</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ val: true, label: '✅ Available', color: 'var(--accent)' }, { val: false, label: '❌ Unavailable', color: 'var(--error)' }].map(o => (
                <div
                  key={String(o.val)}
                  onClick={() => setForm(f => ({ ...f, is_available: o.val }))}
                  style={{ border: `2px solid ${form.is_available === o.val ? o.color : 'var(--divider)'}`, background: form.is_available === o.val ? `${o.color}15` : 'white', color: form.is_available === o.val ? o.color : 'var(--text-sec)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }}
                >
                  {o.label}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Bio / About You</label>
            <textarea className="form-control" name="bio" rows={4} placeholder="Describe your experience and what makes you stand out..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hourly Rate (Rs.)</label>
              <input className="form-control" type="number" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} placeholder="e.g. 800" />
            </div>
            <div className="form-group">
              <label>Years of Experience</label>
              <input className="form-control" type="number" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))} placeholder="e.g. 5" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input className="form-control" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Lahore" />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-control" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Service Area</label>
            <input className="form-control" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="e.g. DHA, Gulberg, Model Town, Lahore" />
          </div>

          <div className="form-group">
            <label>Services Offered (select all that apply)</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {services.map(s => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSkill(s.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: `2px solid ${form.skill_ids.includes(s.id) ? 'var(--primary)' : 'var(--divider)'}`,
                    background: form.skill_ids.includes(s.id) ? 'var(--primary-light)' : 'white',
                    color: form.skill_ids.includes(s.id) ? 'var(--primary)' : 'var(--text-sec)',
                    fontWeight: form.skill_ids.includes(s.id) ? 600 : 400,
                    fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {s.icon} {s.name} {form.skill_ids.includes(s.id) && '✓'}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving...' : 'Save Provider Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
