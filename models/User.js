const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 255]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  walletBalance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  lockedBalance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
