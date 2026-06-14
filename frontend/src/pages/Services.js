import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = [
  { name: 'All', icon: '🏠' },
  { name: 'Plumbing', icon: '🔧' },
  { name: 'Electrical', icon: '⚡' },
  { name: 'Cleaning', icon: '🧹' },
  { name: 'Painting', icon: '🎨' },
  { name: 'Carpentry', icon: '🪵' },
  { name: 'AC Repair', icon: '❄️' },
  { name: 'Gardening', icon: '🌿' },
  { name: 'Security', icon: '🛡️' },
];

export default function Services() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-rating');
  const [maxRate, setMaxRate] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const navigate = useNavigate();

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (ordering) params.append('ordering', ordering);
      if (maxRate) params.append('max_rate', maxRate);
      if (activeCategory !== 'All') params.append('skill', activeCategory);

      const res = await api.get(`/providers/?${params.toString()}`);
      setProviders(res.data.results || res.data || []);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [search, ordering, maxRate, activeCategory]);

  useEffect(() => {
    const timer = setTimeout(fetchProviders, 300);
    return () => clearTimeout(timer);
  }, [fetchProviders]);

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    if (cat !== 'All') setSearchParams({ category: cat });
    else setSearchParams({});
  };

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-label">Find Services</div>
          <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 8 }}>
            Verified Professionals<br />Near You
          </h1>
          <p style={{ color: 'var(--text-sec)', fontSize: 16 }}>
            Browse {providers.length}+ verified service providers in Lahore
          </p>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.name}
              onClick={() => handleCategory(c.name)}
              className={`service-card ${activeCategory === c.name ? 'active' : ''}`}
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '2px solid', borderColor: activeCategory === c.name ? 'var(--primary)' : 'var(--divider)', borderRadius: 20, background: activeCategory === c.name ? 'var(--primary-light)' : 'white', color: activeCategory === c.name ? 'var(--primary)' : 'var(--text-sec)', transition: 'all 0.2s' }}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Filters bar */}
        <div className="filters-bar">
          <div className="search-input-wrap" style={{ flex: 1, minWidth: 220 }}>
            <span className="search-icon">🔍</span>
            <input
              className="form-control"
              placeholder="Search providers, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
          <select className="filter-select" value={ordering} onChange={e => setOrdering(e.target.value)}>
            <option value="-rating">Highest Rated</option>
            <option value="hourly_rate">Lowest Price</option>
            <option value="-hourly_rate">Highest Price</option>
            <option value="-review_count">Most Reviews</option>
            <option value="-created_at">Newest</option>
          </select>
          <input
            className="filter-select"
            type="number"
            placeholder="Max rate (Rs.)"
            value={maxRate}
            onChange={e => setMaxRate(e.target.value)}
            style={{ width: 160 }}
          />
          {(search || maxRate) && (
            <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setMaxRate(''); }}>
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="page-loading"><div className="spinner"></div></div>
        ) : providers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No providers found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setSearch(''); setMaxRate(''); setActiveCategory('All'); }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-hint)', fontSize: 14, marginBottom: 20 }}>
              {providers.length} provider{providers.length !== 1 ? 's' : ''} found
            </p>
            <div className="providers-grid">
              {providers.map(p => (
                <ProviderCard key={p.id} provider={p} onView={() => navigate(`/providers/${p.id}`)} onBook={() => navigate(`/book/${p.id}`)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProviderCard({ provider, onView, onBook }) {
  const name = provider.user?.name || 'Provider';
  const skills = provider.skills || [];
  const avatarColor = `hsl(${name.charCodeAt(0) * 10}, 65%, 45%)`;

  return (
    <div className="provider-card">
      <div className="provider-card-header">
        <div className="provider-avatar" style={{ background: avatarColor }}>
          {provider.user?.avatar_url
            ? <img src={provider.user.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
            : name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div className="provider-name">
            {name}
            {provider.is_verified && <span className="badge-verified" style={{ marginLeft: 6, fontSize: 10 }}>✓ Verified</span>}
          </div>
          <div className="provider-role">{skills[0]?.name || 'Service Provider'} · {provider.city || 'Lahore'}</div>
          <div className="provider-stars">
            <span className="stars">{'★'.repeat(Math.floor(provider.rating || 0))}</span>
            <span style={{ fontSize: 12, color: 'var(--text-hint)', marginLeft: 4 }}>
              {Number(provider.rating || 0).toFixed(1)} ({provider.review_count || 0} reviews)
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>Rs. {provider.hourly_rate}</div>
          <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>/hour</div>
          <div style={{ fontSize: 11, color: provider.is_available ? 'var(--accent)' : 'var(--text-hint)', marginTop: 3 }}>
            {provider.is_available ? '● Available' : '○ Unavailable'}
          </div>
        </div>
      </div>

      <p className="provider-bio">
        {provider.bio?.slice(0, 100) || 'Experienced professional ready to help with all your home service needs.'}
        {provider.bio?.length > 100 ? '...' : ''}
      </p>

      <div className="skills-wrap">
        {skills.slice(0, 3).map(s => (
          <span key={s.id} className="skill-tag">{s.icon} {s.name}</span>
        ))}
        {skills.length > 3 && <span className="skill-tag">+{skills.length - 3} more</span>}
      </div>

      {provider.experience_years > 0 && (
        <div style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 14 }}>
          🏆 {provider.experience_years} years experience
        </div>
      )}

      <div className="provider-footer">
        <button className="btn btn-outline btn-sm" onClick={onView}>View Profile</button>
        <button className="btn btn-primary btn-sm" onClick={onBook} disabled={!provider.is_available}>
          {provider.is_available ? 'Book Now' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}
