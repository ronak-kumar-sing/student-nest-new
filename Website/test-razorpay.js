// Test Razorpay Connection
require('dotenv').config({ path: '.env.local' });
const Razorpay = require('razorpay');

console.log('🔍 Testing Razorpay Configuration...\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log('   RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✓ SET' : '✗ MISSING');
console.log('   RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✓ SET' : '✗ MISSING');
console.log('   Key ID Preview:', process.env.RAZORPAY_KEY_ID?.substring(0, 15) + '...\n');

// Initialize Razorpay
console.log('2. Initializing Razorpay instance...');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
console.log('   ✓ Instance created\n');

// Test order creation
console.log('3. Creating test order...');
razorpay.orders.create({
  amount: 100, // 1 rupee in paise
  currency: 'INR',
  receipt: 'test_receipt_' + Date.now(),
  notes: {
    test: 'true'
  }
})
.then(order => {
  console.log('   ✓ SUCCESS! Order created:');
  console.log('   Order ID:', order.id);
  console.log('   Amount:', order.amount, 'paise');
  console.log('   Currency:', order.currency);
  console.log('   Status:', order.status);
  console.log('\n✅ Razorpay is working correctly!');
  process.exit(0);
})
.catch(error => {
  console.error('   ✗ FAILED! Error details:');
  console.error('   Message:', error.message);
  console.error('   Error:', error.error);
  if (error.error && error.error.description) {
    console.error('   Description:', error.error.description);
  }
  console.log('\n❌ Razorpay test failed. Check your credentials!');
  console.log('\nPossible issues:');
  console.log('- Invalid API keys');
  console.log('- API keys from wrong mode (test vs live)');
  console.log('- Network connectivity issues');
  console.log('- Razorpay account not activated');
  process.exit(1);
});
