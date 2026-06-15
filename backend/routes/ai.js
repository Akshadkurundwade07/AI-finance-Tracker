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

    // Separate credits and debits
    const debits = userExpenses.filter(e => e.type === 'debit');
    const credits = userExpenses.filter(e => e.type === 'credit');

    const totalSpent = debits.reduce((sum, e) => sum + e.amount, 0);
    const totalEarned = credits.reduce((sum, e) => sum + e.amount, 0);
    
    const categoryBreakdown = debits.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    
    const balance = totalEarned - totalSpent;
    const savingsRate = totalEarned > 0 ? (((totalEarned - totalSpent) / totalEarned) * 100).toFixed(1) : 'N/A';
    
    const prompt = `As a financial advisor, analyze this spending data and provide 3-5 actionable suggestions:

Monthly Income: ₹${monthlyIncome.toFixed(2)}
Total Earned: ₹${totalEarned.toFixed(2)}
Total Spent: ₹${totalSpent.toFixed(2)}
Current Balance: ₹${balance.toFixed(2)}
Savings Rate: ${savingsRate}%
Expense Breakdown by Category: ${JSON.stringify(categoryBreakdown, null, 2)}
Number of Transactions: ${userExpenses.length} (${credits.length} income, ${debits.length} expenses)

Provide practical, specific advice in Indian Rupees (₹) context to help improve their financial habits. Consider their income vs spending ratio.`;

    console.log('Generating AI suggestions using Groq API for user:', req.userId);
    
    // Try multiple Groq models in order of preference
    const models = [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile', 
      'mixtral-8x7b-32768',
      'llama3-70b-8192'
    ];
    
    let lastError = null;
    
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROK_API_KEY}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are a helpful financial advisor providing practical money management advice to Indian users. Keep suggestions clear, actionable, and culturally relevant.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Model ${model} failed:`, errorText);
          lastError = errorText;
          continue; // Try next model
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('Invalid response structure:', data);
          lastError = 'Invalid response structure';
          continue; // Try next model
        }
        
        const suggestions = data.choices[0].message.content;

        console.log(`✓ AI suggestions generated successfully using ${model}`);
        return res.json({ suggestions });
        
      } catch (modelError) {
        console.error(`Error with model ${model}:`, modelError.message);
        lastError = modelError.message;
        continue; // Try next model
      }
    }
    
    // If all models failed
    throw new Error(`All Groq models failed. Last error: ${lastError}`);
    
  } catch (error) {
    console.error('AI Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error generating suggestions', 
      error: error.message,
      hint: 'Make sure your GROK_API_KEY (Groq API key) is configured correctly in the .env file. Get your free API key from https://console.groq.com/'
    });
  }
});

module.exports = router;
