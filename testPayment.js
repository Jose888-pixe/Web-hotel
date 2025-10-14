const { sequelize } = require('./config/database');
const { Payment, Reservation, User } = require('./models');

async function testPayment() {
  try {
    await sequelize.sync();
    
    console.log('Testing payment creation...\n');
    
    // Get a reservation
    const reservation = await Reservation.findOne();
    if (!reservation) {
      console.log('No reservations found!');
      process.exit(1);
    }
    
    console.log('Found reservation:', reservation.reservationNumber);
    console.log('User ID:', reservation.userId);
    console.log('Amount:', reservation.totalAmount);
    
    // Try to create a payment
    const payment = await Payment.create({
      reservationId: reservation.id,
      userId: reservation.userId,
      amount: reservation.totalAmount,
      method: 'credit_card',
      status: 'completed',
      description: `Test payment for ${reservation.reservationNumber}`
    });
    
    console.log('\n✅ Payment created successfully!');
    console.log('Transaction ID:', payment.transactionId);
    console.log('Amount:', payment.amount);
    
    // Clean up
    await payment.destroy();
    console.log('\n🧹 Test payment deleted');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testPayment();
