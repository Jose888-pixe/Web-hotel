require('dotenv').config();
const { initializeTransporter, sendEmail, emailTemplates } = require('./services/emailService');

console.log('\n🧪 ================================');
console.log('   QUICK EMAIL TEST');
console.log('================================\n');

async function testEmail() {
  try {
    console.log('1️⃣ Checking environment variables...\n');
    
    const config = {
      'EMAIL_HOST': process.env.EMAIL_HOST,
      'EMAIL_PORT': process.env.EMAIL_PORT,
      'EMAIL_USER': process.env.EMAIL_USER,
      'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET',
      'EMAIL_SECURE': process.env.EMAIL_SECURE,
      'EMAIL_FROM': process.env.EMAIL_FROM
    };
    
    Object.entries(config).forEach(([key, value]) => {
      const status = value && value !== 'NOT SET' ? '✅' : '❌';
      console.log(`${status} ${key}: ${value || 'NOT SET'}`);
    });
    
    console.log('\n2️⃣ Initializing email transporter...\n');
    await initializeTransporter();
    
    console.log('\n3️⃣ Sending test email...\n');
    
    const testTemplate = {
      subject: 'Test Email - Azure Suites',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #667eea;">✅ Email Test Successful!</h2>
          <p>This is a test email from Azure Suites Hotel backend.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p>If you received this email, your email configuration is working correctly!</p>
        </body>
        </html>
      `
    };
    
    // Send to the configured email user (yourself)
    const result = await sendEmail(process.env.EMAIL_USER, testTemplate);
    
    console.log('\n4️⃣ Test Results:\n');
    
    if (result.success) {
      console.log('✅ SUCCESS! Email sent successfully');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`⏱️  Duration: ${result.duration}ms`);
      console.log(`\n📬 Check your inbox at: ${process.env.EMAIL_USER}`);
    } else {
      console.log('❌ FAILED! Email could not be sent');
      console.log(`Error: ${result.error}`);
      console.log(`Details: ${result.details}`);
      
      console.log('\n💡 Troubleshooting Tips:');
      console.log('   1. Verify your Gmail App Password is correct (16 characters)');
      console.log('   2. Make sure 2-Step Verification is enabled on your Google Account');
      console.log('   3. Check that EMAIL_SECURE=false for port 587');
      console.log('   4. Try generating a new App Password at:');
      console.log('      https://myaccount.google.com/apppasswords');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('\n================================\n');
  process.exit(0);
}

testEmail();
