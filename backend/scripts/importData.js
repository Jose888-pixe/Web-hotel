const fs = require('fs');
const path = require('path');
const { sequelize, User, Room, Reservation, Payment, Contact } = require('../models');
require('dotenv').config();

const importData = async () => {
  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Read export file
    const exportPath = path.join(__dirname, 'data-export.json');
    
    if (!fs.existsSync(exportPath)) {
      throw new Error('Export file not found! Run exportData.js first.');
    }

    const fileContent = fs.readFileSync(exportPath, 'utf8');
    const data = JSON.parse(fileContent);

    console.log('\n📦 Import file loaded');
    console.log(`   Export date: ${data.exportDate}`);
    console.log(`   Users: ${data.users.length}`);
    console.log(`   Rooms: ${data.rooms.length}`);
    console.log(`   Reservations: ${data.reservations.length}`);
    console.log(`   Payments: ${data.payments.length}`);
    console.log(`   Contacts: ${data.contacts.length}`);

    // Sync database (create tables)
    console.log('\n🔄 Syncing database schema...');
    await sequelize.sync({ force: true }); // WARNING: This will drop all tables
    console.log('✅ Database schema synced');

    // Import data in order (respecting foreign keys)
    console.log('\n📥 Importing data...');

    // 1. Import Users (no dependencies)
    if (data.users.length > 0) {
      // Remove password hashes, they need to be re-hashed
      const usersToImport = data.users.map(user => {
        const { id, createdAt, updatedAt, ...userData } = user;
        // Keep the password hash as is (already hashed)
        return userData;
      });
      
      const createdUsers = await User.bulkCreate(usersToImport, { 
        individualHooks: false, // Don't re-hash passwords
        validate: false
      });
      console.log(`   ✓ Imported ${createdUsers.length} users`);
    }

    // 2. Import Rooms (no dependencies)
    if (data.rooms.length > 0) {
      const roomsToImport = data.rooms.map(room => {
        const { id, createdAt, updatedAt, ...roomData } = room;
        return roomData;
      });
      
      const createdRooms = await Room.bulkCreate(roomsToImport);
      console.log(`   ✓ Imported ${createdRooms.length} rooms`);
    }

    // Get the new IDs mapping
    const userIdMap = {};
    const oldUsers = data.users;
    const newUsers = await User.findAll({ order: [['createdAt', 'ASC']] });
    oldUsers.forEach((oldUser, index) => {
      if (newUsers[index]) {
        userIdMap[oldUser.id] = newUsers[index].id;
      }
    });

    const roomIdMap = {};
    const oldRooms = data.rooms;
    const newRooms = await Room.findAll({ order: [['createdAt', 'ASC']] });
    oldRooms.forEach((oldRoom, index) => {
      if (newRooms[index]) {
        roomIdMap[oldRoom.id] = newRooms[index].id;
      }
    });

    // 3. Import Reservations (depends on Users and Rooms)
    if (data.reservations.length > 0) {
      const reservationsToImport = data.reservations.map(reservation => {
        const { id, createdAt, updatedAt, ...reservationData } = reservation;
        return {
          ...reservationData,
          userId: userIdMap[reservation.userId] || null,
          roomId: roomIdMap[reservation.roomId] || null
        };
      }).filter(r => r.userId && r.roomId); // Only import if both IDs exist
      
      if (reservationsToImport.length > 0) {
        const createdReservations = await Reservation.bulkCreate(reservationsToImport);
        console.log(`   ✓ Imported ${createdReservations.length} reservations`);
      }
    }

    // Get reservation ID mapping
    const reservationIdMap = {};
    const oldReservations = data.reservations;
    const newReservations = await Reservation.findAll({ order: [['createdAt', 'ASC']] });
    oldReservations.forEach((oldRes, index) => {
      if (newReservations[index]) {
        reservationIdMap[oldRes.id] = newReservations[index].id;
      }
    });

    // 4. Import Payments (depends on Reservations)
    if (data.payments.length > 0) {
      const paymentsToImport = data.payments.map(payment => {
        const { id, createdAt, updatedAt, ...paymentData } = payment;
        return {
          ...paymentData,
          reservationId: reservationIdMap[payment.reservationId] || null
        };
      }).filter(p => p.reservationId); // Only import if reservation exists
      
      if (paymentsToImport.length > 0) {
        const createdPayments = await Payment.bulkCreate(paymentsToImport);
        console.log(`   ✓ Imported ${createdPayments.length} payments`);
      }
    }

    // 5. Import Contacts (no dependencies)
    if (data.contacts.length > 0) {
      const contactsToImport = data.contacts.map(contact => {
        const { id, createdAt, updatedAt, ...contactData } = contact;
        return contactData;
      });
      
      const createdContacts = await Contact.bulkCreate(contactsToImport);
      console.log(`   ✓ Imported ${createdContacts.length} contacts`);
    }

    console.log('\n✅ Data import completed successfully!');
    console.log('\n📊 Final Summary:');
    console.log(`   Users: ${await User.count()}`);
    console.log(`   Rooms: ${await Room.count()}`);
    console.log(`   Reservations: ${await Reservation.count()}`);
    console.log(`   Payments: ${await Payment.count()}`);
    console.log(`   Contacts: ${await Contact.count()}`);

  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n📡 Disconnected from database');
  }
};

// Run if called directly
if (require.main === module) {
  importData();
}

module.exports = importData;
