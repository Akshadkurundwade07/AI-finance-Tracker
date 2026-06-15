import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import './Loans.css';

function Loans() {
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState({});
  const [formData, setFormData] = useState({
    type: 'borrowed',
    personName: '',
    amount: '',
    description: '',
    borrowedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    contactInfo: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [filter, setFilter] = useState('all'); // all, borrowed, lent

  useEffect(() => {
    fetchLoans();
    fetchSummary();
  }, []);

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/loans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/loans/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        await axios.put(`${API_URL}/api/loans/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Loan updated successfully!');
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/api/loans`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Loan added successfully!');
      }
      
      resetForm();
      fetchLoans();
      fetchSummary();
    } catch (error) {
      setMessage('Error saving loan');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'borrowed',
      personName: '',
      amount: '',
      description: '',
      borrowedDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      contactInfo: ''
    });
  };

  const handleEdit = (loan) => {
    setFormData({
      type: loan.type,
      personName: loan.personName,
      amount: loan.amount,
      description: loan.description || '',
      borrowedDate: loan.borrowedDate.split('T')[0],
      dueDate: loan.dueDate ? loan.dueDate.split('T')[0] : '',
      contactInfo: loan.contactInfo || ''
    });
    setEditingId(loan.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this loan record?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/loans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLoans();
      fetchSummary();
      setMessage('Loan deleted');
    } catch (error) {
      setMessage('Error deleting loan');
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/loans/${paymentModal.id}/payment`, 
        { paymentAmount: parseFloat(paymentAmount) },
        { headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Payment recorded successfully!');
      setPaymentModal(null);
      setPaymentAmount('');
      fetchLoans();
      fetchSummary();
    } catch (error) {
      setMessage('Error recording payment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', color: '#ed8936' },
      partial: { text: 'Partial', color: '#4299e1' },
      completed: { text: 'Completed', color: '#48bb78' }
    };
    const badge = badges[status] || badges.pending;
    return <span className="status-badge" style={{ background: badge.color }}>{badge.text}</span>;
  };

  const filteredLoans = loans.filter(loan => {
    if (filter === 'all') return true;
    return loan.type === filter;
  });

  const isOverdue = (loan) => {
    if (!loan.dueDate || loan.status === 'completed') return false;
    return new Date(loan.dueDate) < new Date();
  };

  return (
    <div className="container">
      <h1>Loans & Debts Tracker</h1>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card borrowed-card">
          <div className="summary-icon">📤</div>
          <div>
            <h3>I Owe (Borrowed)</h3>
            <p className="summary-amount">₹{summary.totalBorrowed?.toFixed(2) || '0.00'}</p>
            <span className="summary-count">{summary.borrowedPending || 0} pending</span>
          </div>
        </div>
        
        <div className="summary-card lent-card">
          <div className="summary-icon">📥</div>
          <div>
            <h3>They Owe Me (Lent)</h3>
            <p className="summary-amount">₹{summary.totalLent?.toFixed(2) || '0.00'}</p>
            <span className="summary-count">{summary.lentPending || 0} pending</span>
          </div>
        </div>
        
        <div className={`summary-card net-card ${summary.netPosition >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-icon">{summary.netPosition >= 0 ? '📈' : '📉'}</div>
          <div>
            <h3>Net Position</h3>
            <p className="summary-amount">
              {summary.netPosition >= 0 ? '+' : ''}₹{summary.netPosition?.toFixed(2) || '0.00'}
            </p>
            <span className="summary-count">
              {summary.netPosition >= 0 ? 'In your favor' : 'Need to pay back'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Form */}
      <div className="card">
        <h2>{editingId ? 'Edit Loan' : 'Add New Loan'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="borrowed">I Borrowed (I owe them)</option>
                <option value="lent">I Lent (They owe me)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Person Name *</label>
              <input
                type="text"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                placeholder="Enter person's name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Date {formData.type === 'borrowed' ? 'Borrowed' : 'Lent'} *</label>
              <input
                type="date"
                value={formData.borrowedDate}
                onChange={(e) => setFormData({ ...formData, borrowedDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Due Date (Optional)</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Contact Info (Optional)</label>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                placeholder="Phone or email"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description / Notes (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any notes or details..."
              rows="3"
            />
          </div>
          
          {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Add'} Loan
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => {
                setEditingId(null);
                resetForm();
              }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All ({loans.length})
        </button>
        <button 
          className={filter === 'borrowed' ? 'active' : ''} 
          onClick={() => setFilter('borrowed')}
        >
          I Owe ({loans.filter(l => l.type === 'borrowed').length})
        </button>
        <button 
          className={filter === 'lent' ? 'active' : ''} 
          onClick={() => setFilter('lent')}
        >
          They Owe Me ({loans.filter(l => l.type === 'lent').length})
        </button>
      </div>

      {/* Loans List */}
      <div className="card">
        <h2>All Loans</h2>
        {filteredLoans.length === 0 ? (
          <p>No loans yet. Add your first one above!</p>
        ) : (
          <div className="loans-table">
            {filteredLoans.map(loan => (
              <div key={loan.id} className={`loan-row ${loan.type}-row ${isOverdue(loan) ? 'overdue' : ''}`}>
                <div className="loan-header">
                  <div className="loan-person">
                    <strong>{loan.type === 'borrowed' ? '📤' : '📥'} {loan.personName}</strong>
                    {loan.contactInfo && <span className="contact-info">({loan.contactInfo})</span>}
                  </div>
                  <div className="loan-badges">
                    {getStatusBadge(loan.status)}
                    {isOverdue(loan) && <span className="status-badge overdue-badge">Overdue!</span>}
                  </div>
                </div>
                
                <div className="loan-details">
                  <div className="detail-item">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value">₹{loan.amount.toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Paid:</span>
                    <span className="detail-value">₹{loan.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Remaining:</span>
                    <span className="detail-value remaining">₹{loan.remainingAmount.toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{new Date(loan.borrowedDate).toLocaleDateString()}</span>
                  </div>
                  {loan.dueDate && (
                    <div className="detail-item">
                      <span className="detail-label">Due:</span>
                      <span className={`detail-value ${isOverdue(loan) ? 'overdue-text' : ''}`}>
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                {loan.description && (
                  <div className="loan-description">
                    <span className="detail-label">Note:</span> {loan.description}
                  </div>
                )}
                
                <div className="loan-actions">
                  {loan.status !== 'completed' && (
                    <button 
                      onClick={() => setPaymentModal(loan)} 
                      className="btn btn-success btn-sm"
                    >
                      💵 Record Payment
                    </button>
                  )}
                  <button onClick={() => handleEdit(loan)} className="btn btn-secondary btn-sm">Edit</button>
                  <button onClick={() => handleDelete(loan.id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="modal-overlay" onClick={() => setPaymentModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Record Payment</h3>
            <p>Recording payment for: <strong>{paymentModal.personName}</strong></p>
            <p>Remaining amount: <strong>₹{paymentModal.remainingAmount.toFixed(2)}</strong></p>
            
            <div className="form-group">
              <label>Payment Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount paid"
                max={paymentModal.remainingAmount}
                autoFocus
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={handlePayment} className="btn btn-primary">Record Payment</button>
              <button onClick={() => { setPaymentModal(null); setPaymentAmount(''); }} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Loans;
