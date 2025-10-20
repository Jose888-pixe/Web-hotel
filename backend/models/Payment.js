const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transactionId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true,
    defaultValue: null
  },
  reservationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reservations',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'EUR',
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  receiptUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  refundDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  processorResponse: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'Payments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['transactionId']
    },
    {
      fields: ['reservationId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['paymentDate']
    }
  ],
  hooks: {
    beforeValidate: (payment) => {
      if (!payment.transactionId) {
        payment.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      }
    }
  }
});

module.exports = Payment;
