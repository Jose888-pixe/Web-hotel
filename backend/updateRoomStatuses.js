const { sequelize } = require('./config/database');
const { Reservation, Room } = require('./models');
const { Op } = require('sequelize');

async function updateRoomStatuses() {
  try {
    await sequelize.sync();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Updating room statuses for today:', today.toISOString());
    
    const rooms = await Room.findAll();
    let updatedCount = 0;
    
    for (const room of rooms) {
      // Skip rooms in maintenance
      if (room.status === 'maintenance') {
        console.log(`Room ${room.number}: Skipping (maintenance)`);
        continue;
      }
      
      const activeReservation = await Reservation.findOne({
        where: {
          roomId: room.id,
          checkIn: { [Op.lte]: today },
          checkOut: { [Op.gt]: today },
          status: { [Op.in]: ['confirmed', 'checked-in'] }
        }
      });
      
      if (activeReservation) {
        console.log(`Room ${room.number}: Found active reservation ${activeReservation.reservationNumber}`);
        if (room.status !== 'occupied') {
          room.status = 'occupied';
          await room.save();
          updatedCount++;
          console.log(`  ✅ Updated to OCCUPIED`);
        } else {
          console.log(`  Already occupied`);
        }
      } else {
        console.log(`Room ${room.number}: No active reservation`);
        if (room.status === 'occupied') {
          room.status = 'available';
          await room.save();
          updatedCount++;
          console.log(`  ✅ Updated to AVAILABLE`);
        }
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} rooms`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateRoomStatuses();
