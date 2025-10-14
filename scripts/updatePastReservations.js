const { sequelize } = require('../config/database');
const { Reservation } = require('../models');
const { Op } = require('sequelize');

async function updatePastReservations() {
  try {
    await sequelize.sync();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Checking for past reservations...');
    console.log('Today:', today.toISOString());

    // Find all reservations that have passed
    const pastReservations = await Reservation.findAll({
      where: {
        checkOut: { [Op.lt]: today }
      },
      attributes: ['id', 'reservationNumber', 'checkOut', 'status', 'paymentStatus']
    });

    console.log(`\nFound ${pastReservations.length} past reservations:`);
    pastReservations.forEach(r => {
      console.log(`- ID: ${r.id}, CheckOut: ${r.checkOut}, Status: ${r.status}, Payment: ${r.paymentStatus}`);
    });

    // Delete paid reservations
    const deletedPaid = await Reservation.destroy({
      where: {
        checkOut: { [Op.lt]: today },
        paymentStatus: 'paid',
        status: { [Op.in]: ['confirmed', 'checked-in', 'checked-out'] }
      }
    });

    console.log(`\n✅ Deleted ${deletedPaid} paid reservations`);

    // Update unpaid reservations to pending status
    const [updatedUnpaid] = await Reservation.update(
      { 
        status: 'pending',
        paymentStatus: 'pending'
      },
      {
        where: {
          checkOut: { [Op.lt]: today },
          paymentStatus: { [Op.ne]: 'paid' },
          status: { [Op.in]: ['confirmed', 'checked-in', 'checked-out'] }
        }
      }
    );

    console.log(`✅ Updated ${updatedUnpaid} unpaid reservations to pending status`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePastReservations();
