import React, { useState } from 'react';
import axios from 'axios';
import './Suggestions.css';

function Suggestions() {
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getSuggestions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/ai/suggestions', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get suggestions. Make sure your OpenAI API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AI Financial Suggestions</h1>
      
      <div className="card">
        <p className="suggestions-intro">
          Get personalized financial advice based on your spending patterns and income using Groq AI (Llama).
        </p>
        
        <button 
          onClick={getSuggestions} 
          className="btn btn-primary"
          disabled={loading}
          style={{ minWidth: '200px' }}
        >
          {loading ? '🤖 Analyzing your data...' : '✨ Get AI Suggestions'}
        </button>
        
        {error && <div className="error" style={{ marginTop: '16px' }}>{error}</div>}
        
        {suggestions && (
          <div className="suggestions-box">
            <h3>💡 Your Personalized Suggestions</h3>
            <div className="suggestions-content">{suggestions}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Suggestions;
