const { sequelize } = require('./config/database');
const { Room } = require('./models');

async function testServer() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('\nTesting Room model...');
    const rooms = await Room.findAll();
    console.log(`✅ Found ${rooms.length} rooms`);
    
    if (rooms.length > 0) {
      console.log('\nFirst room:');
      console.log(JSON.stringify(rooms[0].toJSON(), null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testServer();
