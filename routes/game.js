const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const GameHistory = require('../models/GameHistory');
const auth = require('../middleware/auth');

const router = express.Router();

// Play game - requires logged in user
router.post('/play', [
  auth,
  body('betAmount').isFloat({ min: 1 }).withMessage('Bet amount must be at least $1'),
  body('prediction').isIn(['odd', 'even']).withMessage('Prediction must be odd or even')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    const { betAmount, prediction } = req.body;
    const user = await User.findByPk(req.userId);

    // Check if user has sufficient balance
    if (user.walletBalance < betAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }

    // Deduct bet amount
    user.walletBalance -= parseFloat(betAmount);
    await user.save();

    // Record bet transaction
    await Transaction.create({
      userId: user.id,
      type: 'bet',
      amount: parseFloat(betAmount),
      status: 'completed',
      description: `Bet on ${prediction}`
    });

    // Roll the dice
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    const result = diceRoll % 2 === 0 ? 'even' : 'odd';
    const won = result === prediction;
    const winAmount = won ? parseFloat(betAmount) * 2 : 0;

    // If won, add winnings to wallet with 24-hour lock
    if (won) {
      user.walletBalance += winAmount;
      await user.save();

      // Record win transaction with unlock date
      const unlockDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      await Transaction.create({
        userId: user.id,
        type: 'win',
        amount: winAmount,
        status: 'completed',
        unlockDate,
        description: `Won on ${prediction} (dice: ${diceRoll})`
      });
    }

    // Save game history
    await GameHistory.create({
      userId: user.id,
      betAmount: parseFloat(betAmount),
      prediction,
      diceRoll,
      result,
      won,
      winAmount
    });

    res.json({
      success: true,
      diceRoll,
      result,
      won,
      winAmount,
      newBalance: user.walletBalance,
      message: won 
        ? `Congratulations! You won $${winAmount}! (Unlocks in 24 hours)`
        : `Sorry, you lost. The dice showed ${diceRoll} (${result})`
    });
  } catch (error) {
    console.error('Game play error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Game play failed' 
    });
  }
});

// Watch mode (free, no betting)
router.post('/watch', async (req, res) => {
  try {
    // Roll the dice
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    const result = diceRoll % 2 === 0 ? 'even' : 'odd';

    res.json({
      success: true,
      diceRoll,
      result,
      mode: 'watch',
      message: `Dice rolled ${diceRoll} (${result}). Login and deposit to play for real!`
    });
  } catch (error) {
    console.error('Watch mode error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Watch mode failed' 
    });
  }
});

// Get game history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await GameHistory.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      history: history.map(game => ({
        id: game.id,
        betAmount: game.betAmount,
        prediction: game.prediction,
        diceRoll: game.diceRoll,
        result: game.result,
        won: game.won,
        winAmount: game.winAmount,
        createdAt: game.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch game history' 
    });
  }
});

// Get game statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const allGames = await GameHistory.findAll({ 
      where: { userId: req.userId } 
    });
    
    const totalGames = allGames.length;
    const gamesWon = allGames.filter(g => g.won).length;
    const gamesLost = totalGames - gamesWon;
    const totalBet = allGames.reduce((sum, g) => sum + g.betAmount, 0);
    const totalWon = allGames.reduce((sum, g) => sum + g.winAmount, 0);
    const netProfit = totalWon - totalBet;

    res.json({
      success: true,
      stats: {
        totalGames,
        gamesWon,
        gamesLost,
        winRate: totalGames > 0 ? ((gamesWon / totalGames) * 100).toFixed(2) : 0,
        totalBet: totalBet.toFixed(2),
        totalWon: totalWon.toFixed(2),
        netProfit: netProfit.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch statistics' 
    });
  }
});

module.exports = router;
