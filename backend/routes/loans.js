const express = require('express');
const Loan = require('../models/Loan');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// Get all loans for logged-in user
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    
    // Build query
    const query = { userId: req.userId };
    if (status) query.status = status;
    if (type) query.type = type;
    
    // Use lean() for faster queries
    const loans = await Loan.find(query)
      .sort({ borrowedDate: -1 })
      .select('-__v')
      .lean()
      .exec();
    
    const formattedLoans = loans.map(loan => ({
      id: loan._id,
      userId: loan.userId,
      type: loan.type,
      personName: loan.personName,
      amount: loan.amount,
      amountPaid: loan.amountPaid,
      remainingAmount: loan.amount - loan.amountPaid,
      description: loan.description,
      borrowedDate: loan.borrowedDate,
      dueDate: loan.dueDate,
      status: loan.status,
      contactInfo: loan.contactInfo,
      createdAt: loan.createdAt
    }));
    
    res.json(formattedLoans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ message: 'Error fetching loans', error: error.message });
  }
});

// Create new loan
router.post('/', async (req, res) => {
  try {
    const { type, personName, amount, description, borrowedDate, dueDate, contactInfo } = req.body;
    
    const loan = new Loan({
      userId: req.userId,
      type,
      personName,
      amount: parseFloat(amount),
      description: description || '',
      borrowedDate: borrowedDate || new Date(),
      dueDate: dueDate || null,
      contactInfo: contactInfo || '',
      status: 'pending',
      amountPaid: 0
    });
    
    const savedLoan = await loan.save();
    
    const formattedLoan = {
      id: savedLoan._id,
      userId: savedLoan.userId,
      type: savedLoan.type,
      personName: savedLoan.personName,
      amount: savedLoan.amount,
      amountPaid: savedLoan.amountPaid,
      remainingAmount: savedLoan.remainingAmount,
      description: savedLoan.description,
      borrowedDate: savedLoan.borrowedDate,
      dueDate: savedLoan.dueDate,
      status: savedLoan.status,
      contactInfo: savedLoan.contactInfo,
      createdAt: savedLoan.createdAt
    };
    
    res.status(201).json(formattedLoan);
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ message: 'Error creating loan', error: error.message });
  }
});

// Update loan
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, personName, amount, description, borrowedDate, dueDate, contactInfo, amountPaid, status } = req.body;
    
    const loan = await Loan.findOne({ _id: id, userId: req.userId });
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    loan.type = type || loan.type;
    loan.personName = personName || loan.personName;
    loan.amount = amount !== undefined ? parseFloat(amount) : loan.amount;
    loan.description = description !== undefined ? description : loan.description;
    loan.borrowedDate = borrowedDate || loan.borrowedDate;
    loan.dueDate = dueDate !== undefined ? dueDate : loan.dueDate;
    loan.contactInfo = contactInfo !== undefined ? contactInfo : loan.contactInfo;
    loan.amountPaid = amountPaid !== undefined ? parseFloat(amountPaid) : loan.amountPaid;
    
    // Auto-update status based on payment
    if (loan.amountPaid >= loan.amount) {
      loan.status = 'completed';
    } else if (loan.amountPaid > 0) {
      loan.status = 'partial';
    } else {
      loan.status = 'pending';
    }
    
    if (status) {
      loan.status = status;
    }
    
    await loan.save();
    
    const formattedLoan = {
      id: loan._id,
      userId: loan.userId,
      type: loan.type,
      personName: loan.personName,
      amount: loan.amount,
      amountPaid: loan.amountPaid,
      remainingAmount: loan.remainingAmount,
      description: loan.description,
      borrowedDate: loan.borrowedDate,
      dueDate: loan.dueDate,
      status: loan.status,
      contactInfo: loan.contactInfo,
      createdAt: loan.createdAt
    };
    
    res.json(formattedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(500).json({ message: 'Error updating loan', error: error.message });
  }
});

// Record payment for a loan
router.post('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentAmount } = req.body;
    
    const loan = await Loan.findOne({ _id: id, userId: req.userId });
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    loan.amountPaid += parseFloat(paymentAmount);
    
    // Update status
    if (loan.amountPaid >= loan.amount) {
      loan.status = 'completed';
      loan.amountPaid = loan.amount; // Cap at total amount
    } else if (loan.amountPaid > 0) {
      loan.status = 'partial';
    }
    
    await loan.save();
    
    const formattedLoan = {
      id: loan._id,
      userId: loan.userId,
      type: loan.type,
      personName: loan.personName,
      amount: loan.amount,
      amountPaid: loan.amountPaid,
      remainingAmount: loan.remainingAmount,
      description: loan.description,
      borrowedDate: loan.borrowedDate,
      dueDate: loan.dueDate,
      status: loan.status,
      contactInfo: loan.contactInfo,
      createdAt: loan.createdAt
    };
    
    res.json(formattedLoan);
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Error recording payment', error: error.message });
  }
});

// Delete loan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const loan = await Loan.findOneAndDelete({ _id: id, userId: req.userId });
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    res.json({ message: 'Loan deleted' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    res.status(500).json({ message: 'Error deleting loan', error: error.message });
  }
});

// Get loan summary (optimized with aggregation)
router.get('/summary', async (req, res) => {
  try {
    // Use MongoDB aggregation for faster calculations
    const summary = await Loan.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          totalPaid: { $sum: '$amountPaid' },
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $ne: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const borrowed = summary.find(s => s._id === 'borrowed') || { totalAmount: 0, totalPaid: 0, count: 0, pending: 0 };
    const lent = summary.find(s => s._id === 'lent') || { totalAmount: 0, totalPaid: 0, count: 0, pending: 0 };
    
    const totalBorrowed = borrowed.totalAmount - borrowed.totalPaid;
    const totalLent = lent.totalAmount - lent.totalPaid;
    
    res.json({
      totalBorrowed,
      totalLent,
      borrowedCount: borrowed.count,
      lentCount: lent.count,
      borrowedPending: borrowed.pending,
      lentPending: lent.pending,
      netPosition: totalLent - totalBorrowed
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
});

module.exports = router;
