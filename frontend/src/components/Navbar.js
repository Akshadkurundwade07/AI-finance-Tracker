import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h2 className="nav-logo">💰 Finance Tracker</h2>
        
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
          <Link to="/expenses" onClick={closeMenu}>Transactions</Link>
          <Link to="/loans" onClick={closeMenu}>Loans & Debts</Link>
          <Link to="/suggestions" onClick={closeMenu}>AI Suggestions</Link>
          <Link to="/analysis" onClick={closeMenu}>Analysis</Link>
        </div>
        <div className={`nav-user ${menuOpen ? 'active' : ''}`}>
          <span>Hello, {user?.name}</span>
          <button onClick={() => { onLogout(); closeMenu(); }} className="btn btn-secondary">Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
