import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function BookingForm() {
  const { providerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [form, setForm] = useState({
    provider: providerId,
    service: '',
    scheduled_date: '',
    scheduled_time: '',
    address: user?.address || '',
    payment_method: 'cash',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get(`/providers/${providerId}/`)
      .then(res => setProvider(res.data))
      .catch(() => navigate('/services'))
      .finally(() => setFetchLoading(false));
  }, [providerId, navigate]);

  const validate = () => {
    const e = {};
    if (!form.scheduled_date) e.scheduled_date = 'Please select a date';
    else if (new Date(form.scheduled_date) < new Date()) e.scheduled_date = 'Date must be in the future';
    if (!form.scheduled_time) e.scheduled_time = 'Please select a time';
    if (!form.address.trim()) e.address = 'Please enter your address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Calculate total amount (2 hours minimum)
      const total = provider.hourly_rate * 2;
      await api.post('/bookings/', { ...form, total_amount: total });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msg = Object.values(data)[0];
        setErrors({ api: Array.isArray(msg) ? msg[0] : msg });
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="page-loading"><div className="spinner"></div></div>;
  if (!provider) return null;

  const name = provider.user?.name || 'Provider';
  const skills = provider.skills || [];

  // Get min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (success) return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
      <h2 style={{ fontFamily: 'Playfair Display', fontSize: 32, marginBottom: 12 }}>Booking Confirmed!</h2>
      <p style={{ color: 'var(--text-sec)', fontSize: 17, marginBottom: 28 }}>
        Your booking with {name} has been placed successfully. Redirecting to dashboard...
      </p>
      <div className="spinner" style={{ margin: '0 auto' }}></div>
    </div>
  );

  return (
    <div className="booking-page">
      <div className="container">
        <button className="btn btn-outline btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>← Back</button>

        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, marginBottom: 8 }}>Book a Service</h1>
        <p style={{ color: 'var(--text-sec)', marginBottom: 32 }}>Fill in the details to book {name}</p>

        <div className="booking-grid">
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 28, boxShadow: 'var(--shadow)' }}>
              {errors.api && <div className="error-banner">⚠️ {errors.api}</div>}

              {/* Service selection */}
              {skills.length > 0 && (
                <div className="form-group">
                  <label>Service Type</label>
                  <select className="form-control" name="service" value={form.service} onChange={handleChange}>
                    <option value="">Select a service</option>
                    {skills.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                  </select>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input className={`form-control ${errors.scheduled_date ? 'error' : ''}`} type="date" name="scheduled_date" min={minDate} value={form.scheduled_date} onChange={handleChange} />
                  {errors.scheduled_date && <div className="error-text">{errors.scheduled_date}</div>}
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <select className={`form-control ${errors.scheduled_time ? 'error' : ''}`} name="scheduled_time" value={form.scheduled_time} onChange={handleChange}>
                    <option value="">Select time</option>
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(t => (
                      <option key={t} value={t}>{t.replace(':', ':').slice(0, 5)} {parseInt(t) < 12 ? 'AM' : 'PM'}</option>
                    ))}
                  </select>
                  {errors.scheduled_time && <div className="error-text">{errors.scheduled_time}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Your Address *</label>
                <textarea className={`form-control ${errors.address ? 'error' : ''}`} name="address" rows={3} placeholder="House No., Street, Area, City" value={form.address} onChange={handleChange} />
                {errors.address && <div className="error-text">{errors.address}</div>}
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[{ val: 'cash', label: '💵 Cash on Service' }, { val: 'jazzcash', label: '💳 JazzCash' }].map(p => (
                    <div
                      key={p.val}
                      onClick={() => setForm(f => ({ ...f, payment_method: p.val }))}
                      style={{
                        border: `2px solid ${form.payment_method === p.val ? 'var(--primary)' : 'var(--divider)'}`,
                        background: form.payment_method === p.val ? 'var(--primary-light)' : 'white',
                        color: form.payment_method === p.val ? 'var(--primary)' : 'var(--text-sec)',
                        borderRadius: 10, padding: '12px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                        transition: 'all 0.2s', textAlign: 'center'
                      }}
                    >
                      {p.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea className="form-control" name="notes" rows={3} placeholder="Describe the issue or any special instructions..." value={form.notes} onChange={handleChange} />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Confirming...' : '✅ Confirm Booking'}
              </button>
            </div>
          </form>

          {/* Booking Summary */}
          <div className="booking-summary">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Booking Summary</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--divider)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 700 }}>
                {name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-hint)' }}>{skills[0]?.name || 'Service Provider'}</div>
                <div className="stars" style={{ fontSize: 13 }}>{'★'.repeat(Math.floor(provider.rating || 0))}<span style={{ color: 'var(--text-hint)', marginLeft: 4, fontSize: 11 }}>{Number(provider.rating || 0).toFixed(1)}</span></div>
              </div>
            </div>
            {[
              { label: 'Hourly Rate', val: `Rs. ${provider.hourly_rate}` },
              { label: 'Min. Duration', val: '2 hours' },
              { label: 'Est. Total', val: `Rs. ${provider.hourly_rate * 2}+` },
              { label: 'Payment', val: form.payment_method === 'cash' ? 'Cash on Service' : 'JazzCash' },
            ].map(d => (
              <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: 'var(--text-sec)' }}>{d.label}</span>
                <span style={{ fontWeight: 700 }}>{d.val}</span>
              </div>
            ))}
            <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: 14, marginTop: 16, fontSize: 13, color: 'var(--primary)' }}>
              ℹ️ Final price depends on actual time spent and materials required.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
