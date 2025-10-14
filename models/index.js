const { sequelize } = require('../config/database');
const User = require('./User');
const Room = require('./Room');
const Reservation = require('./Reservation');
const Payment = require('./Payment');
const Contact = require('./Contact');

// Define associations
User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Room.hasMany(Reservation, { foreignKey: 'roomId', as: 'reservations' });
Reservation.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Reservation.hasMany(Payment, { foreignKey: 'reservationId', as: 'payments' });
Payment.belongsTo(Reservation, { foreignKey: 'reservationId', as: 'reservation' });

module.exports = {
  sequelize,
  User,
  Room,
  Reservation,
  Payment,
  Contact
};
