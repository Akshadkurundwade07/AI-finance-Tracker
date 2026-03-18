import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const features = [
  { icon: '📊', title: 'Smart Analytics', desc: 'Visualize your spending with beautiful charts and date-range filters.' },
  { icon: '🤖', title: 'AI Suggestions', desc: 'Get personalized financial advice powered by Groq AI based on your habits.' },
  { icon: '💰', title: 'Income Tracking', desc: 'Set your monthly income and track exactly how much you have left.' },
  { icon: '🗂️', title: 'Expense Categories', desc: 'Organize expenses by Food, Transport, Bills, Shopping and more.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Your data is protected with JWT authentication and encrypted passwords.' },
  { icon: '📱', title: 'Fully Responsive', desc: 'Works beautifully on desktop, tablet, and mobile devices.' },
];

const stats = [
  { value: '100%', label: 'Free to Use' },
  { value: 'AI', label: 'Powered Insights' },
  { value: '∞', label: 'Expense Tracking' },
  { value: '24/7', label: 'Always Available' },
];

function Landing() {
  const [visible, setVisible] = useState([]);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    features.forEach((_, i) => {
      setTimeout(() => setVisible(prev => [...prev, i]), 400 + i * 150);
    });
  }, []);

  return (
    <div className="landing">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <span className="landing-logo">💰 FinanceAI</span>
          <div className="landing-nav-links">
            <Link to="/login" className="nav-link-ghost">Login</Link>
            <Link to="/signup" className="nav-link-solid">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={`hero ${heroVisible ? 'hero-visible' : ''}`}>
        <div className="hero-badge">✨ AI-Powered Finance Tracker</div>
        <h1 className="hero-title">
          Take Control of<br />
          <span className="hero-gradient">Your Finances</span>
        </h1>
        <p className="hero-subtitle">
          Track expenses, analyze spending patterns, and get personalized AI suggestions
          to help you save more and spend smarter — all in one place.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn-hero-primary">
            Start Tracking Free →
          </Link>
          <Link to="/login" className="btn-hero-secondary">
            I have an account
          </Link>
        </div>

        {/* Floating stats */}
        <div className="hero-stats">
          {stats.map((s, i) => (
            <div className="hero-stat" key={i}>
              <span className="hero-stat-value">{s.value}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-label">FEATURES</div>
        <h2 className="section-title">Everything you need to manage money</h2>
        <p className="section-subtitle">
          A complete toolkit to understand, track, and improve your financial health.
        </p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className={`feature-card ${visible.includes(i) ? 'feature-visible' : ''}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="steps-section">
        <div className="section-label">HOW IT WORKS</div>
        <h2 className="section-title">Up and running in 3 steps</h2>
        <div className="steps-grid">
          {[
            { num: '01', title: 'Create Account', desc: 'Sign up with your name, email, and monthly income in seconds.' },
            { num: '02', title: 'Log Expenses', desc: 'Add your daily expenses with category, amount, and date.' },
            { num: '03', title: 'Get AI Insights', desc: 'Let AI analyze your data and give you actionable money tips.' },
          ].map((step, i) => (
            <div className="step-card" key={i}>
              <div className="step-num">{step.num}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Ready to take control?</h2>
          <p className="cta-subtitle">Join thousands of users managing their finances smarter with AI.</p>
          <div className="cta-actions">
            <Link to="/signup" className="btn-hero-primary">Create Free Account</Link>
            <Link to="/login" className="btn-hero-secondary btn-hero-secondary-dark">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>💰 FinanceAI — Built with React, Node.js & Groq AI</span>
      </footer>
    </div>
  );
}

export default Landing;
