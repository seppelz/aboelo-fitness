import dotenv from 'dotenv';
import { sendPasswordResetEmail } from '../services/emailService';

// Load environment variables
dotenv.config();

const testEmail = async () => {
  console.log('=== EMAIL CONFIGURATION TEST ===\n');
  
  console.log('Environment Variables Status:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST ? '✓ SET' : '✗ NOT SET');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT ? '✓ SET' : '✗ NOT SET');
  console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE ? '✓ SET' : '✗ NOT SET');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✓ SET' : '✗ NOT SET');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ SET' : '✗ NOT SET');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? '✓ SET' : '✗ NOT SET');
  console.log('FRONTEND_BASE_URL:', process.env.FRONTEND_BASE_URL ? '✓ SET' : '✗ NOT SET');
  console.log('\n');

  const testRecipient = process.env.TEST_EMAIL_RECIPIENT || process.env.EMAIL_USER;
  
  if (!testRecipient) {
    console.error('❌ No test recipient specified. Set TEST_EMAIL_RECIPIENT or EMAIL_USER environment variable.');
    process.exit(1);
  }

  console.log(`Sending test email to: ${testRecipient}\n`);

  try {
    await sendPasswordResetEmail(testRecipient, 'TEST_TOKEN_123456');
    console.log('\n✅ Email sent successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Email sending failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    process.exit(1);
  }
};

testEmail();
