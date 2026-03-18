import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <h2 className="nav-logo">💰 Finance Tracker</h2>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/expenses">Expenses</Link>
          <Link to="/suggestions">AI Suggestions</Link>
          <Link to="/analysis">Analysis</Link>
        </div>
        <div className="nav-user">
          <span>Hello, {user?.name}</span>
          <button onClick={onLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
