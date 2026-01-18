const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const GameHistory = sequelize.define('GameHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  betAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  prediction: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['odd', 'even']]
    }
  },
  diceRoll: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 6
    }
  },
  result: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['odd', 'even']]
    }
  },
  won: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  winAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'game_histories',
  timestamps: true
});

// Define associations
GameHistory.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(GameHistory, { foreignKey: 'userId' });

module.exports = GameHistory;
