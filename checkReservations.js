const { sequelize } = require('./config/database');
const { Reservation, Room } = require('./models');

async function checkReservations() {
  try {
    await sequelize.sync();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Today:', today.toISOString());
    console.log('\nAll reservations:');
    
    const reservations = await Reservation.findAll({
      attributes: ['id', 'reservationNumber', 'roomId', 'checkIn', 'checkOut', 'status', 'paymentStatus']
    });
    
    reservations.forEach(r => {
      const checkIn = new Date(r.checkIn);
      const checkOut = new Date(r.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      const isActive = checkIn <= today && checkOut > today && ['confirmed', 'checked-in'].includes(r.status);
      
      console.log(`\n${r.reservationNumber}:`);
      console.log(`  Room: ${r.roomId}`);
      console.log(`  Check-in: ${checkIn.toLocaleDateString()}`);
      console.log(`  Check-out: ${checkOut.toLocaleDateString()}`);
      console.log(`  Status: ${r.status}`);
      console.log(`  Payment: ${r.paymentStatus}`);
      console.log(`  Active today? ${isActive ? 'YES' : 'NO'}`);
    });
    
    console.log('\n\nRoom statuses:');
    const rooms = await Room.findAll({
      attributes: ['id', 'number', 'status']
    });
    
    rooms.forEach(r => {
      console.log(`Room ${r.number}: ${r.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkReservations();
