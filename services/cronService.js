const cron = require('node-cron');
const { Reservation, Room, User } = require('../models');
const { sendEmail, emailTemplates } = require('./emailService');
const { Op } = require('sequelize');

/**
 * Check for reservations with check-in tomorrow and send reminders
 */
const sendCheckInReminders = async () => {
  try {
    console.log('🔔 Running check-in reminder task...');
    
    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find all reservations with check-in tomorrow
    const reservations = await Reservation.findAll({
      where: {
        checkIn: {
          [Op.gte]: tomorrow,
          [Op.lt]: dayAfterTomorrow
        },
        status: {
          [Op.in]: ['confirmed', 'pending']
        }
      },
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'number', 'name', 'type']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    console.log(`📋 Found ${reservations.length} reservations with check-in tomorrow`);

    // Send reminder emails
    for (const reservation of reservations) {
      if (reservation.user && reservation.user.email && reservation.room) {
        const template = emailTemplates.checkInReminder(
          reservation,
          reservation.room,
          reservation.user
        );

        await sendEmail(reservation.user.email, template);
        console.log(`✅ Reminder sent to ${reservation.user.email} for reservation ${reservation.reservationNumber}`);
      }
    }

    console.log('✅ Check-in reminder task completed');
  } catch (error) {
    console.error('❌ Error in check-in reminder task:', error);
  }
};

/**
 * Initialize all cron jobs
 */
const initializeCronJobs = () => {
  // Run check-in reminders daily at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    console.log('🕐 9:00 AM - Running scheduled check-in reminders');
    sendCheckInReminders();
  });

  console.log('⏰ Cron jobs initialized');
  console.log('  - Check-in reminders: Daily at 9:00 AM');
  
  // For testing: Run immediately on startup (comment out in production)
  // sendCheckInReminders();
};

/**
 * Manual trigger for testing
 */
const triggerCheckInReminders = async () => {
  console.log('🔧 Manually triggering check-in reminders...');
  await sendCheckInReminders();
};

module.exports = {
  initializeCronJobs,
  sendCheckInReminders,
  triggerCheckInReminders
};
