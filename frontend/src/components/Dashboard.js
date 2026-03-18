import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import './Dashboard.css';

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, categories: {} });
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [editingIncome, setEditingIncome] = useState(false);
  const [newIncome, setNewIncome] = useState('');
  const [incomeMsg, setIncomeMsg] = useState('');

  useEffect(() => {
    fetchExpenses();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonthlyIncome(res.data.monthlyIncome || 0);
      setNewIncome(res.data.monthlyIncome || '');

      // Also update localStorage user
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, monthlyIncome: res.data.monthlyIncome }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const calculateStats = (expenseData) => {
    const total = expenseData.reduce((sum, e) => sum + e.amount, 0);
    const categories = expenseData.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    setStats({ total, count: expenseData.length, categories });
  };

  const handleUpdateIncome = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/api/auth/income`,
        { monthlyIncome: newIncome },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMonthlyIncome(res.data.monthlyIncome);
      setEditingIncome(false);
      setIncomeMsg('Income updated!');
      setTimeout(() => setIncomeMsg(''), 3000);
    } catch (error) {
      setIncomeMsg('Failed to update income');
    }
  };

  const remaining = monthlyIncome - stats.total;
  const spentPercent = monthlyIncome > 0 ? Math.min((stats.total / monthlyIncome) * 100, 100) : 0;
  const progressColor = spentPercent > 90 ? '#f5576c' : spentPercent > 70 ? '#ed8936' : '#48bb78';

  return (
    <div className="container">
      <h1>Dashboard</h1>

      {/* Income Card */}
      <div className="card income-card">
        <div className="income-header">
          <div>
            <h2>Monthly Income</h2>
            <p className="income-value">₹{monthlyIncome.toFixed(2)}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setEditingIncome(!editingIncome)}>
            {editingIncome ? 'Cancel' : '✏️ Edit Income'}
          </button>
        </div>

        {editingIncome && (
          <form onSubmit={handleUpdateIncome} className="income-form">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter monthly income"
              value={newIncome}
              onChange={(e) => setNewIncome(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
        )}
        {incomeMsg && <div className="success">{incomeMsg}</div>}

        {/* Progress Bar */}
        {monthlyIncome > 0 && (
          <div className="progress-section">
            <div className="progress-labels">
              <span>Spent: ₹{stats.total.toFixed(2)}</span>
              <span style={{ color: remaining >= 0 ? '#48bb78' : '#f5576c' }}>
                {remaining >= 0 ? `Remaining: ₹${remaining.toFixed(2)}` : `Over budget: ₹${Math.abs(remaining).toFixed(2)}`}
              </span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${spentPercent}%`, background: progressColor }}
              />
            </div>
            <p className="progress-label">{spentPercent.toFixed(1)}% of monthly income spent</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Monthly Income</h3>
          <p className="stat-value">₹{monthlyIncome.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Spent</h3>
          <p className="stat-value">₹{stats.total.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Remaining</h3>
          <p className="stat-value" style={{ color: remaining >= 0 ? undefined : '#f5576c' }}>
            ₹{Math.abs(remaining).toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Transactions</h3>
          <p className="stat-value">{stats.count}</p>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <h2>Recent Expenses</h2>
        {expenses.length === 0 ? (
          <p>No expenses yet. Add your first expense!</p>
        ) : (
          <div className="expense-list">
            {expenses.slice(0, 5).map(expense => (
              <div key={expense.id} className="expense-item">
                <div>
                  <strong>{expense.description}</strong>
                  <span className="expense-category">{expense.category}</span>
                </div>
                <span className="expense-amount">₹{expense.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
