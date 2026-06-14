import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'user';

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    password: '', confirm_password: '', role: defaultRole
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
    setApiError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const firstError = Object.values(data)[0];
        setApiError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setApiError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 20px', background: 'var(--bg)', minHeight: 'calc(100vh - 68px)' }}>
      <div className="form-card" style={{ maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <div className="form-title">Create Account</div>
          <p className="form-subtitle">Join HomeEase today — it's free!</p>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { val: 'user', icon: '🔍', label: 'Find Services', desc: 'I need home services' },
            { val: 'provider', icon: '🔧', label: 'Offer Services', desc: 'I provide services' },
          ].map(r => (
            <div
              key={r.val}
              onClick={() => setForm(f => ({ ...f, role: r.val }))}
              style={{
                border: `2px solid ${form.role === r.val ? 'var(--primary)' : 'var(--divider)'}`,
                borderRadius: 12, padding: 16, textAlign: 'center', cursor: 'pointer',
                background: form.role === r.val ? 'var(--primary-light)' : 'white',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: form.role === r.val ? 'var(--primary)' : 'var(--text)' }}>{r.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>{r.desc}</div>
            </div>
          ))}
        </div>

        {apiError && <div className="error-banner">⚠️ {apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input className={`form-control ${errors.name ? 'error' : ''}`} name="name" placeholder="Ali Hassan" value={form.name} onChange={handleChange} />
              {errors.name && <div className="error-text">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input className="form-control" name="phone" placeholder="03XX-XXXXXXX" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input className={`form-control ${errors.email ? 'error' : ''}`} type="email" name="email" placeholder="ali@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input className={`form-control ${errors.password ? 'error' : ''}`} type="password" name="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} autoComplete="new-password" />
              {errors.password && <div className="error-text">{errors.password}</div>}
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input className={`form-control ${errors.confirm_password ? 'error' : ''}`} type="password" name="confirm_password" placeholder="Repeat password" value={form.confirm_password} onChange={handleChange} autoComplete="new-password" />
              {errors.confirm_password && <div className="error-text">{errors.confirm_password}</div>}
            </div>
          </div>

          {/* Terms checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, background: 'var(--accent-light)', borderRadius: 10, padding: 12 }}>
            <input type="checkbox" id="terms" required style={{ marginTop: 2, accentColor: 'var(--accent)' }} />
            <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--text-sec)', cursor: 'pointer' }}>
              I agree to the <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms of Service</Link> and <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : `Create ${form.role === 'provider' ? 'Provider' : ''} Account →`}
          </button>
        </form>

        <div className="form-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
