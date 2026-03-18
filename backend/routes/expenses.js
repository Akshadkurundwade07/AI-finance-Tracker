const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// Get all expenses for logged-in user
router.get('/', async (req, res) => {
  try {
    console.log('=== Fetching Expenses ===');
    console.log('User ID:', req.userId);
    console.log('User ID Type:', typeof req.userId);
    
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    
    console.log(`Found ${expenses.length} expenses in MongoDB`);
    if (expenses.length > 0) {
      console.log('Sample expense:', expenses[0]);
    }
    
    // Format response to match frontend expectations
    const formattedExpenses = expenses.map(expense => ({
      id: expense._id,
      userId: expense.userId,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      createdAt: expense.createdAt
    }));
    
    console.log(`Returning ${formattedExpenses.length} expenses to frontend`);
    res.json(formattedExpenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
});

// Create new expense
router.post('/', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    
    console.log('=== Creating Expense ===');
    console.log('User ID:', req.userId);
    console.log('Request Body:', req.body);
    
    const expense = new Expense({
      userId: req.userId,
      amount: parseFloat(amount),
      category,
      description,
      date: date || new Date()
    });
    
    console.log('Expense object before save:', expense);
    
    const savedExpense = await expense.save();
    console.log('✓ Expense saved successfully to MongoDB!');
    console.log('Saved Expense ID:', savedExpense._id);
    console.log('Saved Expense Data:', savedExpense);
    
    // Format response to match frontend expectations
    const formattedExpense = {
      id: savedExpense._id,
      userId: savedExpense.userId,
      amount: savedExpense.amount,
      category: savedExpense.category,
      description: savedExpense.description,
      date: savedExpense.date,
      createdAt: savedExpense.createdAt
    };
    
    res.status(201).json(formattedExpense);
  } catch (error) {
    console.error('✗ Error creating expense:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    res.status(500).json({ message: 'Error creating expense', error: error.message });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;
    
    const expense = await Expense.findOne({ _id: id, userId: req.userId });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    expense.amount = parseFloat(amount);
    expense.category = category;
    expense.description = description;
    expense.date = date;
    
    await expense.save();
    console.log('Expense updated:', expense._id);
    
    // Format response to match frontend expectations
    const formattedExpense = {
      id: expense._id,
      userId: expense.userId,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      createdAt: expense.createdAt
    };
    
    res.json(formattedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Error updating expense', error: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.userId });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    console.log('Expense deleted:', id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
});

// Get expense analysis with date range
router.get('/analysis', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { userId: req.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const expenses = await Expense.find(query);
    
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryBreakdown = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    
    const daysDiff = startDate && endDate 
      ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
      : 1;
    const avgPerDay = expenses.length > 0 ? totalSpent / daysDiff : 0;
    
    // Format expenses to match frontend expectations
    const formattedExpenses = expenses.map(expense => ({
      id: expense._id,
      userId: expense.userId,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      createdAt: expense.createdAt
    }));
    
    console.log(`Analysis: ${expenses.length} expenses, total: $${totalSpent.toFixed(2)}`);
    
    res.json({
      totalSpent,
      categoryBreakdown,
      expenseCount: expenses.length,
      avgPerDay,
      expenses: formattedExpenses
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ message: 'Error fetching analysis', error: error.message });
  }
});

module.exports = router;
