const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reservationNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Rooms',
      key: 'id'
    }
  },
  guestFirstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  guestLastName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  guestEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  guestPhone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  guestIdNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  guestNationality: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  checkIn: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  checkOut: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  adults: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  children: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  source: {
    type: DataTypes.ENUM('website', 'phone', 'email', 'walk-in'),
    defaultValue: 'website',
    allowNull: false
  }
}, {
  tableName: 'Reservations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['reservationNumber']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['roomId']
    },
    {
      fields: ['checkIn', 'checkOut']
    },
    {
      fields: ['status']
    },
    {
      fields: ['paymentStatus']
    }
  ],
  hooks: {
    beforeCreate: async (reservation) => {
      if (!reservation.reservationNumber) {
        const count = await Reservation.count();
        reservation.reservationNumber = `RES${String(count + 1).padStart(6, '0')}`;
      }
    }
  }
});

// Instance methods
Reservation.prototype.getNights = function() {
  const checkIn = new Date(this.checkIn);
  const checkOut = new Date(this.checkOut);
  const diffTime = Math.abs(checkOut - checkIn);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

Reservation.prototype.getTotalGuests = function() {
  return this.adults + this.children;
};

module.exports = Reservation;
