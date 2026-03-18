import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import './Expenses.css';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        await axios.put(`${API_URL}/api/expenses/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Expense updated successfully!');
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/api/expenses`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Expense added successfully!');
      }
      
      setFormData({ amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (error) {
      setMessage('Error saving expense');
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date.split('T')[0]
    });
    setEditingId(expense.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses();
      setMessage('Expense deleted');
    } catch (error) {
      setMessage('Error deleting expense');
    }
  };

  return (
    <div className="container">
      <h1>Manage Expenses</h1>
      
      <div className="card">
        <h2>{editingId ? 'Edit Expense' : 'Add New Expense'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Entertainment</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Healthcare</option>
                <option>Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What did you spend on?"
              required
            />
          </div>
          
          {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Add'} Expense
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => {
                setEditingId(null);
                setFormData({ amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] });
              }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>All Expenses</h2>
        {expenses.length === 0 ? (
          <p>No expenses yet. Add your first one above!</p>
        ) : (
          <div className="expenses-table">
            {expenses.map(expense => (
              <div key={expense.id} className="expense-row">
                <div className="expense-info">
                  <strong>{expense.description}</strong>
                  <span className="expense-meta">
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="expense-actions">
                  <span className="expense-amount">₹{expense.amount.toFixed(2)}</span>
                  <button onClick={() => handleEdit(expense)} className="btn btn-secondary btn-sm">Edit</button>
                  <button onClick={() => handleDelete(expense.id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Expenses;
