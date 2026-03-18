import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Suggestions from './components/Suggestions';
import Analysis from './components/Analysis';
import Navbar from './components/Navbar';

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
      <Routes>
        <Route path="/" element={!token ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!token ? <Signup onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/expenses" element={token ? <Expenses /> : <Navigate to="/" />} />
        <Route path="/suggestions" element={token ? <Suggestions /> : <Navigate to="/" />} />
        <Route path="/analysis" element={token ? <Analysis /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
