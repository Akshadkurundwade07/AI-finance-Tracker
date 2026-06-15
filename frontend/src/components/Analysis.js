import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../api';
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import './Analysis.css';

const COLORS = ['#667eea', '#f093fb', '#f5576c', '#48bb78', '#ed8936', '#38b2ac', '#9f7aea', '#4facfe'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">₹{payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const PieCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{payload[0].name}</p>
        <p className="tooltip-value">₹{payload[0].value.toFixed(2)}</p>
        <p className="tooltip-pct">{(payload[0].payload.percent * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

function Analysis() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/expenses/analysis?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysis(response.data);
    } catch (err) {
      setError('Failed to load analysis. Please try again.');
      console.error('Error fetching analysis:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleDateChange = (e) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const pieData = analysis
    ? Object.entries(analysis.categoryBreakdown).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
        percent: value / analysis.totalSpent
      }))
    : [];

  const barData = analysis
    ? Object.entries(analysis.categoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => ({ category, amount: parseFloat(amount.toFixed(2)) }))
    : [];

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="container">
      <h1>Expense Analysis</h1>

      {/* Date Range Picker */}
      <div className="card date-card">
        <div className="date-range">
          <div className="form-group">
            <label>From</label>
            <input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} />
          </div>
          <div className="date-arrow">→</div>
          <div className="form-group">
            <label>To</label>
            <input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} />
          </div>
          <button onClick={fetchAnalysis} className="btn btn-primary analyze-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : '🔍 Analyze'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Crunching your numbers...</p>
        </div>
      )}

      {!loading && analysis && (
        <>
          {analysis.expenseCount === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon">📭</div>
              <h2>No expenses in this range</h2>
              <p>Try selecting a different date range.</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">💸</div>
                  <h3>Total Spent</h3>
                  <p className="stat-value">₹{analysis.totalSpent.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🧾</div>
                  <h3>Transactions</h3>
                  <p className="stat-value">{analysis.expenseCount}</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <h3>Avg Per Day</h3>
                  <p className="stat-value">₹{analysis.avgPerDay.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <h3>Top Category</h3>
                  <p className="stat-value stat-value-sm">{analysis.highestCategory}</p>
                </div>
              </div>

              {/* Charts Row 1 — Pie + Bar */}
              <div className="charts-row">
                {/* Donut Pie */}
                <div className="card chart-card">
                  <h2>Where did your money go?</h2>
                  <p className="chart-subtitle">Spending breakdown by category</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomLabel}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <PieTooltip content={<PieCustomTooltip />} />
                      <PieLegend
                        formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Horizontal Bar */}
                <div className="card chart-card">
                  <h2>Category Comparison</h2>
                  <p className="chart-subtitle">Ranked from highest to lowest</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData} layout="vertical" margin={{ left: 16, right: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="category" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 13 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(102,126,234,0.08)' }} />
                      <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Daily Trend Area Chart */}
              {analysis.dailyTrend && analysis.dailyTrend.length > 1 && (
                <div className="card chart-card-full">
                  <h2>Daily Spending Trend</h2>
                  <p className="chart-subtitle">How your spending changed day by day</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={analysis.dailyTrend} margin={{ left: 8, right: 8 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="amount" stroke="#667eea" strokeWidth={3} fill="url(#areaGrad)" dot={{ fill: '#667eea', r: 4 }} activeDot={{ r: 6, fill: '#f093fb' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Transaction List */}
              <div className="card">
                <h2>Transactions in Range</h2>
                <p className="chart-subtitle">{analysis.expenseCount} transactions from {dateRange.startDate} to {dateRange.endDate}</p>
                <div className="transaction-list">
                  {analysis.expenses.map((expense, i) => (
                    <div key={expense.id || i} className="transaction-row">
                      <div className="transaction-left">
                        <span className="transaction-dot" style={{ background: COLORS[['Food','Transport','Entertainment','Shopping','Bills','Healthcare','Other'].indexOf(expense.category) % COLORS.length] || COLORS[0] }} />
                        <div>
                          <p className="transaction-desc">{expense.description}</p>
                          <p className="transaction-meta">
                            {expense.category} · {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className="transaction-amount">₹{expense.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Analysis;
