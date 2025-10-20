const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('visitor', 'operator', 'admin'),
    defaultValue: 'visitor',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  language: {
    type: DataTypes.STRING(5),
    defaultValue: 'es',
    allowNull: false
  },
  street: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  zipCode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'España',
    allowNull: false
  }
}, {
  tableName: 'Users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['isActive']
    }
  ],
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
