import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ProviderDetail() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get(`/providers/${id}/`),
      api.get(`/providers/${id}/reviews/`)
    ]).then(([pRes, rRes]) => {
      setProvider(pRes.data);
      setReviews(rRes.data);
    }).catch(() => navigate('/services'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;
  if (!provider) return null;

  const name = provider.user?.name || 'Provider';
  const skills = provider.skills || [];
  const avatarColor = `hsl(${name.charCodeAt(0) * 10}, 65%, 45%)`;

  return (
    <>
      {/* Header */}
      <div className="provider-detail-header">
        <div className="container">
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', marginBottom: 20 }} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="provider-detail-header-inner">
            <div className="provider-avatar lg" style={{ background: avatarColor }}>
              {provider.user?.avatar_url
                ? <img src={provider.user.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} />
                : name[0]}
            </div>
            <div className="provider-detail-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div className="provider-detail-name">{name}</div>
                {provider.is_verified && <span className="badge-verified" style={{ fontSize: 12 }}>✓ Verified</span>}
                {provider.is_available && <span className="badge-available badge-verified" style={{ fontSize: 12 }}>● Available</span>}
              </div>
              <div className="stars" style={{ fontSize: 20 }}>
                {'★'.repeat(Math.floor(provider.rating || 0))}
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginLeft: 8 }}>
                  {Number(provider.rating || 0).toFixed(1)} ({provider.review_count || 0} reviews)
                </span>
              </div>
              <div className="provider-detail-meta">
                <div className="meta-item">📍 {provider.city || 'Lahore'}</div>
                {provider.experience_years > 0 && <div className="meta-item">🏆 {provider.experience_years} years exp</div>}
                {provider.gender && <div className="meta-item">👤 {provider.gender}</div>}
                <div className="meta-item">💰 Rs. {provider.hourly_rate}/hr</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="provider-detail-body">
        <div className="container">
          <div className="provider-detail-grid">
            <div>
              {/* About */}
              <div className="detail-card">
                <h3>About {name}</h3>
                <p style={{ color: 'var(--text-sec)', lineHeight: 1.8 }}>
                  {provider.bio || 'Experienced professional dedicated to delivering quality home services.'}
                </p>
              </div>

              {/* Services */}
              <div className="detail-card">
                <h3>Services Offered</h3>
                <div className="skills-wrap">
                  {skills.map(s => (
                    <span key={s.id} className="skill-tag" style={{ fontSize: 13, padding: '5px 12px' }}>
                      {s.icon} {s.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="detail-card">
                <h3>Provider Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {[
                    { label: 'Rating', val: `${Number(provider.rating || 0).toFixed(1)}★` },
                    { label: 'Reviews', val: provider.review_count || 0 },
                    { label: 'Experience', val: `${provider.experience_years || 0} yrs` },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', background: 'var(--bg)', borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{s.val}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="detail-card">
                <h3>Customer Reviews ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <div className="empty-state" style={{ padding: 32 }}>
                    <div className="empty-state-icon">⭐</div>
                    <p>No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="review-item">
                      <div className="review-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                            {r.user?.name?.[0] || '?'}
                          </div>
                          <div>
                            <div className="review-author">{r.user?.name}</div>
                            <div className="stars" style={{ fontSize: 12 }}>{'★'.repeat(r.rating)}</div>
                          </div>
                        </div>
                        <div className="review-date">
                          {new Date(r.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      {r.comment && <p className="review-text">{r.comment}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Booking sidebar */}
            <div>
              <div className="book-card">
                <div className="book-card-price">
                  Rs. {provider.hourly_rate}<span>/hour</span>
                </div>
                <div style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 20 }}>
                  {provider.is_available ? '✅ Available for booking' : '❌ Currently unavailable'}
                </div>
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={() => user ? navigate(`/book/${id}`) : navigate('/login')}
                  disabled={!provider.is_available}
                  style={{ marginBottom: 12 }}
                >
                  {user ? '📅 Book Now' : '🔐 Login to Book'}
                </button>
                <button className="btn btn-outline btn-full" onClick={() => user ? null : navigate('/login')}>
                  💬 Chat with Provider
                </button>

                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--divider)' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Provider Details</h4>
                  {[
                    { icon: '📍', label: 'City', val: provider.city || 'Lahore' },
                    { icon: '🏆', label: 'Experience', val: `${provider.experience_years || 0} years` },
                    { icon: '👤', label: 'Gender', val: provider.gender || 'N/A' },
                    { icon: '✅', label: 'Status', val: provider.is_verified ? 'Verified' : 'Pending' },
                  ].map(d => (
                    <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                      <span style={{ color: 'var(--text-sec)' }}>{d.icon} {d.label}</span>
                      <span style={{ fontWeight: 600 }}>{d.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
