require('dotenv').config();

console.log('\n📧 ================================');
console.log('   EMAIL CONFIGURATION CHECK');
console.log('================================\n');

const checks = {
  'EMAIL_HOST': process.env.EMAIL_HOST,
  'EMAIL_PORT': process.env.EMAIL_PORT,
  'EMAIL_USER': process.env.EMAIL_USER,
  'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD ? '***CONFIGURED***' : undefined,
  'EMAIL_SECURE': process.env.EMAIL_SECURE,
  'EMAIL_FROM': process.env.EMAIL_FROM,
  'COMPANY_EMAIL': process.env.COMPANY_EMAIL || process.env.EMAIL_USER,
  'FRONTEND_URL': process.env.FRONTEND_URL
};

let allConfigured = true;
let configuredCount = 0;

console.log('Environment Variables:\n');

Object.entries(checks).forEach(([key, value]) => {
  const isConfigured = value !== undefined && value !== '';
  const status = isConfigured ? '✅' : '❌';
  const displayValue = value || 'NOT SET';
  
  console.log(`${status} ${key.padEnd(20)} = ${displayValue}`);
  
  if (isConfigured) {
    configuredCount++;
  } else {
    allConfigured = false;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`\nConfigured: ${configuredCount}/${Object.keys(checks).length}\n`);

if (allConfigured) {
  console.log('✅ ALL EMAIL VARIABLES CONFIGURED!');
  console.log('   Emails should work in production.\n');
} else {
  console.log('⚠️  SOME VARIABLES ARE MISSING!');
  console.log('   Emails will use Ethereal (test mode).\n');
  
  console.log('📝 To fix in Render Dashboard:');
  console.log('   1. Go to your backend service');
  console.log('   2. Click "Environment"');
  console.log('   3. Add the missing variables');
  console.log('   4. Mark EMAIL_USER and EMAIL_PASSWORD as Secret\n');
}

// Additional validation
console.log('🔍 Additional Checks:\n');

if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
  console.log('✅ Using Gmail SMTP');
  
  if (process.env.EMAIL_PORT === '587') {
    console.log('✅ Port 587 (TLS) - Correct');
  } else {
    console.log('⚠️  Port should be 587 for Gmail');
  }
  
  if (process.env.EMAIL_SECURE === 'false') {
    console.log('✅ EMAIL_SECURE=false - Correct for port 587');
  } else {
    console.log('⚠️  EMAIL_SECURE should be "false" for port 587');
  }
  
  if (process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.length === 16) {
    console.log('✅ Password length looks like App Password (16 chars)');
  } else if (process.env.EMAIL_PASSWORD) {
    console.log('⚠️  Gmail App Passwords are usually 16 characters');
    console.log('   Make sure you\'re using an App Password, not your Gmail password');
  }
}

if (process.env.FRONTEND_URL) {
  if (process.env.FRONTEND_URL.includes('localhost')) {
    console.log('⚠️  FRONTEND_URL points to localhost');
    console.log('   This is OK for development, but should be changed in production');
  } else if (process.env.FRONTEND_URL.includes('onrender.com')) {
    console.log('✅ FRONTEND_URL points to Render domain');
  }
}

console.log('\n' + '='.repeat(50) + '\n');

// Show what emails will be sent
if (allConfigured || (process.env.EMAIL_HOST && process.env.EMAIL_USER)) {
  console.log('📨 Emails that will be sent:\n');
  console.log('   • Welcome email when user registers');
  console.log('   • New reservation to operators (with rotation)');
  console.log('   • Reservation confirmed to users');
  console.log('   • Reservation cancelled to users');
  console.log('   • Check-in reminder (1 day before, at 9 AM)');
  console.log('   • Contact form messages to operators\n');
} else {
  console.log('📨 Email Mode: ETHEREAL (Test)\n');
  console.log('   Emails will be sent to Ethereal test inbox.');
  console.log('   Preview URLs will be shown in server logs.\n');
}
