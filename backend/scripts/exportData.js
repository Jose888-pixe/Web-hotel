const fs = require('fs');
const path = require('path');
const { sequelize, User, Room, Reservation, Payment, Contact } = require('../models');
require('dotenv').config();

const exportData = async () => {
  try {
    console.log('🔄 Connecting to SQLite database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Export all data
    console.log('\n📦 Exporting data...');
    
    const users = await User.findAll({ raw: true });
    console.log(`   Users: ${users.length}`);
    
    const rooms = await Room.findAll({ raw: true });
    console.log(`   Rooms: ${rooms.length}`);
    
    const reservations = await Reservation.findAll({ raw: true });
    console.log(`   Reservations: ${reservations.length}`);
    
    const payments = await Payment.findAll({ raw: true });
    console.log(`   Payments: ${payments.length}`);
    
    const contacts = await Contact.findAll({ raw: true });
    console.log(`   Contacts: ${contacts.length}`);

    // Create export object
    const exportData = {
      exportDate: new Date().toISOString(),
      users,
      rooms,
      reservations,
      payments,
      contacts
    };

    // Save to JSON file
    const exportPath = path.join(__dirname, 'data-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log('\n✅ Data exported successfully!');
    console.log(`📁 File saved to: ${exportPath}`);
    console.log('\n📊 Summary:');
    console.log(`   Total users: ${users.length}`);
    console.log(`   Total rooms: ${rooms.length}`);
    console.log(`   Total reservations: ${reservations.length}`);
    console.log(`   Total payments: ${payments.length}`);
    console.log(`   Total contacts: ${contacts.length}`);

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n📡 Disconnected from database');
  }
};

// Run if called directly
if (require.main === module) {
  exportData();
}

module.exports = exportData;
