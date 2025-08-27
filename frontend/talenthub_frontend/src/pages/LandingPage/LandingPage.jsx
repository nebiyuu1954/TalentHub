import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LandingPage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function LandingPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setChecking(false);
      return;
    }

    axios.get(`${API_BASE}/auth/users/me/`, {
      headers: { Authorization: `Token ${token}` }
    })
      .then(res => {
        const role = res.data.role;
        if (role === 'admin') navigate('/admin-landing');
        else if (role === 'employer') navigate('/employer-landing');
        else if (role === 'applicant') navigate('/applicant-landing');
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [navigate]);

  if (checking) return <div className="loading">Loading...</div>;

  return (
    <div className="landing-container">
      {/* HEADER */}
      <header className="landing-header">
        <div className="logo">Talent<span>Hub</span></div>
        <nav className="header-links">
          <button className="header-link" onClick={() => navigate('/login')}>For Applicants</button>
          <button className="header-link" onClick={() => navigate('/login')}>For Employers</button>
          <button onClick={() => navigate('/login')} className="btn-primary">Login</button>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>Your Career, Elevated</h1>
          <p>Find the perfect opportunity or your next great hire — all in one place.</p>
          <div className="cta-buttons">
            <button onClick={() => navigate('/login')} className="btn-primary">Get Started</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/src/pages/LandingPage/a.jpg" alt="Career growth" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        {[
          { icon: '💼', title: 'For Employers', desc: 'Post jobs and connect with top talent quickly.' },
          { icon: '🧑‍💻', title: 'For Applicants', desc: 'Apply with ease and track your progress in real time.' },
          { icon: '🔒', title: 'Secure & Fair', desc: 'Role‑based access for a safe, transparent hiring process.' }
        ].map((f, i) => (
          <div className="feature-card" key={i}>
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} TalentHub — All rights reserved.</p>
      </footer>
    </div>
  );
}
