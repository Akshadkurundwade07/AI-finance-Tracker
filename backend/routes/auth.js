const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, monthlyIncome } = req.body;
    
    console.log('Signup attempt for:', email);
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      monthlyIncome: parseFloat(monthlyIncome) || 0
    });
    
    await user.save();
    console.log('User created successfully:', user._id);
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        monthlyIncome: user.monthlyIncome
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for:', email);
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        monthlyIncome: user.monthlyIncome
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

// Update monthly income
const authMiddleware = require('../middleware/auth');

router.put('/income', authMiddleware, async (req, res) => {
  try {
    const { monthlyIncome } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { monthlyIncome: parseFloat(monthlyIncome) },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log(`Updated monthly income for user ${req.userId}: $${monthlyIncome}`);
    res.json({ monthlyIncome: user.monthlyIncome });
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email, monthlyIncome: user.monthlyIncome });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
