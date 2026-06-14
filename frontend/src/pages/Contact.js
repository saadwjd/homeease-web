import React, { useState } from 'react';
import api from '../utils/api';

const FAQS = [
  { q: 'How do I book a service?', a: 'Browse providers, click "Book Now", select date/time and confirm. You\'ll get a confirmation immediately.' },
  { q: 'Are providers verified?', a: 'Yes! Every provider goes through CNIC verification and background check before joining HomeEase.' },
  { q: 'What payment methods are accepted?', a: 'We accept JazzCash and Cash on Service. More payment options coming soon.' },
  { q: 'How do I become a provider?', a: 'Register with "Offer Services" role, complete your profile, and our team will verify you within 48 hours.' },
  { q: 'Which cities do you serve?', a: 'We currently operate in Lahore. Karachi and Islamabad coming soon!' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.length < 20) e.message = 'Message must be at least 20 characters';
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
      await api.post('/contact/', form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setApiError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, var(--primary-light), var(--accent-light))', padding: '60px 0', textAlign: 'center', marginBottom: 60 }}>
        <div className="container">
          <div className="section-label">Get In Touch</div>
          <h1 className="section-title">We're Here to Help</h1>
          <p style={{ color: 'var(--text-sec)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
            Have a question, feedback, or want to join as a provider? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="contact-grid">
          {/* Contact Info */}
          <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 28, marginBottom: 12 }}>Contact Information</h2>
            <p style={{ color: 'var(--text-sec)', marginBottom: 28, lineHeight: 1.7 }}>
              Reach out through any of these channels. Our support team is available Sun–Thu, 9 AM – 6 PM PKT.
            </p>

            {[
              { icon: '📧', title: 'Email Support', val: 'saadwajid65@gmail.com', href: 'mailto:saadwajid65@gmail.com' },
              { icon: '📱', title: 'WhatsApp', val: '+92 316 7635243', href: 'https://wa.me/923167635243' },
              { icon: '📍', title: 'Office', val: 'Lahore, Punjab, Pakistan', href: null },
              { icon: '🕐', title: 'Support Hours', val: 'Sun–Thu, 9 AM – 6 PM PKT', href: null },
            ].map(item => (
              <div key={item.title} className="contact-item">
                <div className="contact-item-icon">{item.icon}</div>
                <div>
                  <div className="contact-item-title">{item.title}</div>
                  {item.href
                    ? <a href={item.href} className="contact-item-val" style={{ color: 'var(--primary)' }}>{item.val}</a>
                    : <div className="contact-item-val">{item.val}</div>
                  }
                </div>
              </div>
            ))}

            {/* Provider CTA */}
            <div style={{ background: 'var(--primary-light)', borderRadius: 12, padding: 20, marginTop: 28 }}>
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>🚀 Want to join as a provider?</div>
              <div style={{ fontSize: 14, color: 'var(--text-sec)' }}>
                Select "Become a Provider" as your subject below. We'll review your application within 48 hours.
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 36, boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Send Us a Message</h3>

            {success && (
              <div className="success-banner">
                ✅ Message sent successfully! We'll get back to you within 24 hours.
              </div>
            )}
            {apiError && <div className="error-banner">⚠️ {apiError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input className={`form-control ${errors.name ? 'error' : ''}`} name="name" placeholder="Ali Hassan" value={form.name} onChange={handleChange} />
                  {errors.name && <div className="error-text">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input className={`form-control ${errors.email ? 'error' : ''}`} type="email" name="email" placeholder="ali@example.com" value={form.email} onChange={handleChange} />
                  {errors.email && <div className="error-text">{errors.email}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <select className={`form-control ${errors.subject ? 'error' : ''}`} name="subject" value={form.subject} onChange={handleChange}>
                  <option value="">Select a subject</option>
                  <option>General Inquiry</option>
                  <option>Become a Provider</option>
                  <option>Booking Support</option>
                  <option>Technical Issue</option>
                  <option>Partnership</option>
                  <option>Other</option>
                </select>
                {errors.subject && <div className="error-text">{errors.subject}</div>}
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  className={`form-control ${errors.message ? 'error' : ''}`}
                  name="message" rows={5}
                  placeholder="How can we help you? Please describe your issue or question in detail..."
                  value={form.message} onChange={handleChange}
                />
                {errors.message && <div className="error-text">{errors.message}</div>}
                <div style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 4 }}>
                  {form.message.length}/500 characters
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message →'}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 80 }}>
          <div className="section-header">
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{ background: 'white', borderRadius: 12, marginBottom: 10, overflow: 'hidden', boxShadow: 'var(--shadow)' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '18px 20px', border: 'none', background: 'transparent',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit'
                  }}
                >
                  {faq.q}
                  <span style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 400, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 18px', fontSize: 14, color: 'var(--text-sec)', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
