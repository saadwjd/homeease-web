import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <div className="navbar-logo-icon">🏠</div>
              <span style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, color: 'white' }}>HomeEase</span>
            </div>
            <p className="footer-desc">Pakistan's most trusted home services platform. Connecting homeowners with verified professionals since 2024.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['📘', '📸', '💬', '📧'].map((icon, i) => (
                <div key={i} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{icon}</div>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>For Customers</h4>
            <ul>
              <li><Link to="/services">Browse Providers</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/dashboard">My Bookings</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/">Privacy Policy</Link></li>
              <li><Link to="/">Terms of Service</Link></li>
              <li><Link to="/">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 HomeEase Technologies (Pvt.) Ltd. · Lahore, Pakistan</span>
          <span>Made with ❤️ in Pakistan</span>
        </div>
      </div>
    </footer>
  );
}
