const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Transaction = sequelize.define('Transaction', {
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
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['deposit', 'withdrawal', 'win', 'loss', 'bet']]
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'completed',
    validate: {
      isIn: [['pending', 'completed', 'failed']]
    }
  },
  unlockDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

// Define associations
Transaction.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Transaction, { foreignKey: 'userId' });

module.exports = Transaction;
