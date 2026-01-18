const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  betAmount: {
    type: Number,
    required: true
  },
  prediction: {
    type: String,
    enum: ['odd', 'even'],
    required: true
  },
  diceRoll: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  result: {
    type: String,
    enum: ['odd', 'even'],
    required: true
  },
  won: {
    type: Boolean,
    required: true
  },
  winAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameHistory', gameHistorySchema);
