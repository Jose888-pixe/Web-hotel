const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  number: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('single', 'double', 'suite', 'deluxe', 'presidential'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  size: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: true,
    defaultValue: 25,
    comment: 'Size in square meters'
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'cleaning'),
    defaultValue: 'available',
    allowNull: false
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  lastCleaned: {
    type: DataTypes.DATE,
    allowNull: true
  },
  maintenanceUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date until which the room is in maintenance'
  },
  maintenanceNotes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'Rooms',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['number']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['price']
    }
  ]
});

// Instance methods
Room.prototype.getDisplayName = function() {
  return `${this.number} - ${this.name}`;
};

module.exports = Room;
