import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Eager load critical components
import Landing from './components/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import Navbar from './components/Navbar';

// Lazy load non-critical components for faster initial load
const Dashboard = lazy(() => import('./components/Dashboard'));
const Expenses = lazy(() => import('./components/Expenses'));
const Loans = lazy(() => import('./components/Loans'));
const Suggestions = lazy(() => import('./components/Suggestions'));
const Analysis = lazy(() => import('./components/Analysis'));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)',
    color: '#fff'
  }}>
    <div style={{
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: '600'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(102, 126, 234, 0.3)',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      Loading...
    </div>
  </div>
);

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      {token && <Navbar user={user} onLogout={handleLogout} />}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={!token ? <Landing /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!token ? <Signup onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/expenses" element={token ? <Expenses /> : <Navigate to="/" />} />
          <Route path="/loans" element={token ? <Loans /> : <Navigate to="/" />} />
          <Route path="/suggestions" element={token ? <Suggestions /> : <Navigate to="/" />} />
          <Route path="/analysis" element={token ? <Analysis /> : <Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
