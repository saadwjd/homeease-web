import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
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
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.non_field_errors) setApiError(data.non_field_errors[0]);
      else setApiError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div style={{ padding: '60px 20px', background: 'var(--bg)', minHeight: 'calc(100vh - 68px)' }}>
      <div className="form-card">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
          <div className="form-title">Welcome Back!</div>
          <p className="form-subtitle">Sign in to continue to HomeEase</p>
        </div>

        {apiError && <div className="error-banner">⚠️ {apiError}</div>}

        {/* Demo accounts */}
        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-hint)', marginBottom: 8 }}>DEMO ACCOUNTS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-sm" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }} onClick={() => fillDemo('ali@example.com', 'password123')}>Customer</button>
            <button className="btn btn-sm" style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: 'none' }} onClick={() => fillDemo('ahmad@provider.com', 'password123')}>Provider</button>
            <button className="btn btn-sm" style={{ background: 'rgba(217,48,37,0.1)', color: 'var(--error)', border: 'none' }} onClick={() => fillDemo('admin@homeease.pk', 'admin123')}>Admin</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email Address</label>
            <input
              className={`form-control ${errors.email ? 'error' : ''}`}
              type="email" name="email"
              placeholder="your@email.com"
              value={form.email} onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className={`form-control ${errors.password ? 'error' : ''}`}
              type="password" name="password"
              placeholder="Enter your password"
              value={form.password} onChange={handleChange}
              autoComplete="current-password"
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="form-link">
          Don't have an account? <Link to="/register">Create one free</Link>
        </div>
      </div>
    </div>
  );
}
