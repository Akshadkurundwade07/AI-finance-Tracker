import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analysis.css';

const COLORS = ['#667eea', '#764ba2', '#f56565', '#48bb78', '#ed8936', '#38b2ac', '#9f7aea'];

function Analysis() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/expenses/analysis?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const pieData = analysis ? Object.entries(analysis.categoryBreakdown).map(([name, value]) => ({
    name,
    value
  })) : [];

  const barData = analysis ? Object.entries(analysis.categoryBreakdown).map(([name, value]) => ({
    category: name,
    amount: value
  })) : [];

  return (
    <div className="container">
      <h1>Expense Analysis</h1>
      
      <div className="card">
        <h2>Select Date Range</h2>
        <div className="date-range">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>
          <button onClick={fetchAnalysis} className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
      </div>

      {analysis && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Spent</h3>
              <p className="stat-value">₹{analysis.totalSpent.toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <h3>Transactions</h3>
              <p className="stat-value">{analysis.expenseCount}</p>
            </div>
            <div className="stat-card">
              <h3>Avg Per Day</h3>
              <p className="stat-value">₹{analysis.avgPerDay.toFixed(2)}</p>
            </div>
          </div>

          {pieData.length > 0 && (
            <div className="card">
              <h2>Category Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {barData.length > 0 && (
            <div className="card">
              <h2>Spending by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Analysis;
