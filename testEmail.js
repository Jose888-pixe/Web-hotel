require('dotenv').config();
const { initializeTransporter, sendEmail, emailTemplates } = require('./services/emailService');

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '❌ Not set');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '❌ Not set');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ Not set');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set (hidden)' : '❌ Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Not set');
  console.log('');

  try {
    // Initialize transporter
    console.log('🔧 Initializing email transporter...');
    await initializeTransporter();
    console.log('✅ Transporter initialized\n');

    // Test email data
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: process.env.EMAIL_USER || 'test@example.com' // Send to yourself for testing
    };

    // Create test template
    console.log('📧 Sending test email...');
    const template = emailTemplates.welcome(testUser);
    console.log('Subject:', template.subject);
    console.log('To:', testUser.email);
    console.log('');

    // Send email
    const result = await sendEmail(testUser.email, template);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('');
      console.log('✨ Check your inbox:', testUser.email);
    } else {
      console.log('❌ Email failed to send');
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error('\nFull error:', error);
    
    // Provide specific help based on error
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Tip: Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('   Go to: https://myaccount.google.com/apppasswords');
    }
    if (error.message.includes('EAUTH')) {
      console.log('\n💡 Tip: Check your EMAIL_USER and EMAIL_PASSWORD in .env');
    }
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Tip: Check your EMAIL_HOST in .env');
    }
  }
}

testEmail();
