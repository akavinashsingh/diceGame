const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    res.json({
      success: true,
      balance: user.walletBalance,
      lockedBalance: user.lockedBalance,
      availableBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch balance' 
    });
  }
});

// Note: Deposit and Withdrawal are not available in this version
// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        description: tx.description,
        unlockDate: tx.unlockDate,
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch transactions' 
    });
  }
});

// Check locked balance
router.get('/locked-balance', auth, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentWinnings = await Transaction.findAll({
      where: {
        userId: req.userId,
        type: 'win',
        createdAt: { [Op.gt]: twentyFourHoursAgo },
        unlockDate: { [Op.gt]: new Date() }
      }
    });

    const lockedAmount = recentWinnings.reduce((sum, tx) => sum + tx.amount, 0);
    const user = await User.findByPk(req.userId);

    res.json({
      success: true,
      lockedBalance: lockedAmount,
      availableBalance: user.walletBalance - lockedAmount,
      totalBalance: user.walletBalance,
      lockedTransactions: recentWinnings.map(tx => ({
        amount: tx.amount,
        unlockDate: tx.unlockDate,
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch locked balance' 
    });
  }
});

module.exports = router;
