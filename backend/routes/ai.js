const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.post('/suggestions', async (req, res) => {
  try {
    // Fetch user expenses from MongoDB
    const userExpenses = await Expense.find({ userId: req.userId });
    
    if (userExpenses.length === 0) {
      return res.json({ suggestions: 'Add some expenses first to get personalized suggestions!' });
    }

    const user = await require('../models/User').findById(req.userId).select('monthlyIncome name');
    const monthlyIncome = user?.monthlyIncome || 0;

    const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryBreakdown = userExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    const remaining = monthlyIncome - totalSpent;
    const savingsRate = monthlyIncome > 0 ? (((monthlyIncome - totalSpent) / monthlyIncome) * 100).toFixed(1) : 'N/A';
    
    const prompt = `As a financial advisor, analyze this spending data and provide 3-5 actionable suggestions:

Monthly Income: ₹${monthlyIncome.toFixed(2)}
Total Spent: ₹${totalSpent.toFixed(2)}
Remaining Balance: ₹${remaining.toFixed(2)}
Savings Rate: ${savingsRate}%
Category Breakdown: ${JSON.stringify(categoryBreakdown, null, 2)}
Number of Transactions: ${userExpenses.length}

Provide practical, specific advice in Indian Rupees (₹) context to help improve their financial habits. Consider their income vs spending ratio.`;

    console.log('Generating AI suggestions using Groq (openai/gpt-oss-120b) for user:', req.userId);
    
    // Call Groq API with openai/gpt-oss-120b model
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 1,
        max_completion_tokens: 8192,
        top_p: 1,
        reasoning_effort: 'medium',
        stream: false,
        stop: null
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error response:', errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response:', data);
      throw new Error('Invalid response from Groq API');
    }
    
    const suggestions = data.choices[0].message.content;

    console.log('✓ AI suggestions generated successfully using openai/gpt-oss-120b');
    res.json({ suggestions });
  } catch (error) {
    console.error('AI Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error generating suggestions', 
      error: error.message,
      hint: 'Make sure your GROK_API_KEY (Groq API key) is configured correctly in the .env file'
    });
  }
});

module.exports = router;
