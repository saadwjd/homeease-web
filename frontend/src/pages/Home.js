import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SERVICES = [
  { name: 'Plumbing', icon: '🔧' },
  { name: 'Electrical', icon: '⚡' },
  { name: 'Cleaning', icon: '🧹' },
  { name: 'Painting', icon: '🎨' },
  { name: 'Carpentry', icon: '🪵' },
  { name: 'AC Repair', icon: '❄️' },
  { name: 'Gardening', icon: '🌿' },
  { name: 'Security', icon: '🛡️' },
];

const TESTIMONIALS = [
  { name: 'Ayesha Malik', city: 'DHA, Lahore', rating: 5, text: 'Found a plumber within 10 minutes at 11pm when our pipe burst. Professional and fair pricing.', initial: 'A', color: 'var(--primary)' },
  { name: 'Usman Raza', city: 'Gulberg, Lahore', rating: 5, text: 'Used HomeEase for AC service — technician was on time, explained everything and cleaned up after.', initial: 'U', color: 'var(--accent)' },
  { name: 'Fatima Hussain', city: 'Model Town, Lahore', rating: 5, text: 'Entire house painted in 3 days. Excellent quality, reasonable rates, very respectful team.', initial: 'F', color: '#9C27B0' },
];

export default function Home() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/providers/?ordering=-rating&page_size=3')
      .then(res => setProviders(res.data.results?.slice(0, 3) || []))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">✦ Pakistan's Trusted Home Services Platform</div>
              <h1>Your Home,<br /><span>Perfectly</span><br />Maintained.</h1>
              <p className="hero-desc">
                Connect with verified, background-checked service professionals in Lahore and beyond.
                Plumbers, electricians, cleaners — booked in minutes.
              </p>
              <div className="hero-actions">
                <Link to="/services" className="btn btn-primary btn-lg">Browse Services →</Link>
                <Link to="/register" className="btn btn-outline btn-lg">Join as Provider</Link>
              </div>
              <div className="hero-stats">
                <div><div className="stat-num">500+</div><div className="stat-label">Verified Providers</div></div>
                <div><div className="stat-num">10K+</div><div className="stat-label">Jobs Completed</div></div>
                <div><div className="stat-num">4.8★</div><div className="stat-label">Average Rating</div></div>
              </div>
            </div>
            <div className="hero-visual" style={{ position: 'relative' }}>
              <div className="hero-float top">
                <span style={{ fontSize: 20 }}>✅</span>
                <div><div style={{ fontWeight: 700, fontSize: 13 }}>Booking Confirmed</div><div style={{ fontSize: 11, color: 'var(--text-hint)' }}>Ahmad's Plumbing · Today 2PM</div></div>
              </div>
              <div className="hero-card">
                <div className="hero-card-header">
                  <div className="provider-avatar">M</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Muhammad Ahmad</div>
                    <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>Verified Plumber · Lahore</div>
                  </div>
                </div>
                <div className="stars">★★★★★<span style={{ color: 'var(--text-hint)', fontSize: 12, marginLeft: 4 }}>4.9 (127 reviews)</span></div>
                <p style={{ fontSize: 13, color: 'var(--text-sec)', margin: '10px 0', fontStyle: 'italic' }}>"Fixed our water leak in under an hour. Extremely professional and honest with pricing!"</p>
                <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>💰</span>
                  <div><div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>Rs. 800 / hour</div><div style={{ fontSize: 11, color: 'var(--text-hint)' }}>Available Today</div></div>
                </div>
              </div>
              <div className="hero-float bottom">
                <span style={{ fontSize: 20 }}>🛡️</span>
                <div><div style={{ fontWeight: 700, fontSize: 13 }}>Fully Verified</div><div style={{ fontSize: 11, color: 'var(--text-hint)' }}>ID + Background Check</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: 'var(--text)', padding: '16px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 48, animation: 'marquee 20s linear infinite', width: 'max-content' }}>
          {[...SERVICES, ...SERVICES].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', fontSize: 14 }}>
              <span>{s.icon}</span>{s.name}
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </div>

      {/* ── SERVICES ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">What We Offer</div>
            <h2 className="section-title">Every Home Service<br />You'll Ever Need</h2>
            <p className="section-desc">From emergency repairs to routine maintenance, our verified providers have you covered.</p>
          </div>
          <div className="services-grid">
            {SERVICES.map(s => (
              <div key={s.name} className="service-card" onClick={() => navigate(`/services?category=${s.name}`)}>
                <span className="service-icon">{s.icon}</span>
                <div className="service-name">{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section section-bg">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Simple Process</div>
            <h2 className="section-title">Booked in Minutes,<br />Done Right Every Time</h2>
          </div>
          <div className="steps-grid">
            {[
              { n: '1', title: 'Browse & Choose', desc: 'Browse verified providers by category, read real reviews, and compare rates.' },
              { n: '2', title: 'Book Instantly', desc: 'Select your preferred date and time. Pay via JazzCash or cash on service.' },
              { n: '3', title: 'Job Done ✓', desc: 'Your provider arrives on time, completes the work, and you rate their service.' },
            ].map(s => (
              <div key={s.n} className="step">
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROVIDERS ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Top Rated</div>
            <h2 className="section-title">Meet Our Best Providers</h2>
            <p className="section-desc">Verified, background-checked professionals with proven track records.</p>
          </div>
          {loading ? (
            <div className="page-loading"><div className="spinner"></div></div>
          ) : providers.length > 0 ? (
            <div className="providers-grid">
              {providers.map(p => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔧</div>
              <h3>Providers Coming Soon</h3>
              <p>We're onboarding verified providers in your area.</p>
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to="/services" className="btn btn-primary btn-lg">View All Providers →</Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section section-bg">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Customer Stories</div>
            <h2 className="section-title">Loved by Homeowners<br />Across Pakistan</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="stars">{'★'.repeat(t.rating)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: t.color }}>{t.initial}</div>
                  <div><div className="testimonial-name">{t.name}</div><div className="testimonial-loc">{t.city}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-banner">
        <div className="container">
          <h2>Are You a Skilled Professional?</h2>
          <p>Join hundreds of providers earning more by connecting with homeowners who need your skills.</p>
          <div className="cta-benefits">
            {['Set your own rates', 'Work flexible hours', 'Get paid instantly', 'Build your reputation', 'Free to join'].map(b => (
              <div key={b} className="cta-benefit" style={{ color: 'rgba(255,255,255,0.9)' }}>{b}</div>
            ))}
          </div>
          <Link to="/register?role=provider" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)' }}>
            Apply as Provider →
          </Link>
        </div>
      </section>
    </>
  );
}

function ProviderCard({ provider }) {
  const navigate = useNavigate();
  const name = provider.user?.name || 'Provider';
  const skills = provider.skills || [];
  return (
    <div className="provider-card">
      <div className="provider-card-header">
        <div className="provider-avatar" style={{ background: `hsl(${name.charCodeAt(0) * 10}, 65%, 45%)` }}>
          {name[0]}
        </div>
        <div>
          <div className="provider-name">{name} {provider.is_verified && <span className="badge-verified">✓ Verified</span>}</div>
          <div className="provider-role">{skills[0]?.name || 'Service Provider'} · {provider.city}</div>
          <div className="provider-stars">
            <span className="stars">{'★'.repeat(Math.floor(provider.rating || 0))}</span>
            <span style={{ fontSize: 12, color: 'var(--text-hint)', marginLeft: 4 }}>{provider.rating} ({provider.review_count})</span>
          </div>
        </div>
      </div>
      <p className="provider-bio">{provider.bio?.slice(0, 100) || 'Experienced professional ready to help.'}{provider.bio?.length > 100 ? '...' : ''}</p>
      <div className="skills-wrap">
        {skills.slice(0, 3).map(s => <span key={s.id} className="skill-tag">{s.icon} {s.name}</span>)}
      </div>
      <div className="provider-footer">
        <div className="provider-rate">Rs. {provider.hourly_rate}<span>/hr</span></div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/providers/${provider.id}`)}>View Profile</button>
      </div>
    </div>
  );
}
