const { sequelize } = require('./config/database');
const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    await sequelize.sync();
    
    console.log('Testing users in database...\n');
    
    const users = await User.findAll({
      attributes: ['id', 'email', 'password', 'role', 'firstName', 'lastName']
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role}) - ${u.firstName} ${u.lastName}`);
    });
    
    console.log('\nTesting password verification...\n');
    
    // Test admin login
    const admin = await User.findOne({ where: { email: 'admin@hotelelegance.com' } });
    if (admin) {
      const isValid = await bcrypt.compare('admin123', admin.password);
      console.log(`Admin password valid: ${isValid}`);
      console.log(`Admin password hash: ${admin.password.substring(0, 20)}...`);
    } else {
      console.log('Admin user not found!');
    }
    
    // Test operator login
    const operator = await User.findOne({ where: { email: 'operator@hotelelegance.com' } });
    if (operator) {
      const isValid = await bcrypt.compare('operator123', operator.password);
      console.log(`Operator password valid: ${isValid}`);
    } else {
      console.log('Operator user not found!');
    }
    
    // Test visitor login
    const visitor = await User.findOne({ where: { email: 'juan@example.com' } });
    if (visitor) {
      const isValid = await bcrypt.compare('visitor123', visitor.password);
      console.log(`Visitor password valid: ${isValid}`);
    } else {
      console.log('Visitor user not found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();
