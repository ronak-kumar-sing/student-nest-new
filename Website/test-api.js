// Complete API Test - Simulates payment flow
require('dotenv').config({ path: '.env.local' });

async function testPaymentAPI() {
  console.log('🔍 Testing Payment API Flow...\n');

  // You need to replace this with an actual valid token from your browser
  const token = 'YOUR_TOKEN_HERE'; // Get from localStorage in browser DevTools

  console.log('Instructions:');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Type: localStorage.getItem("accessToken")');
  console.log('4. Copy the token (without quotes)');
  console.log('5. Replace YOUR_TOKEN_HERE in this file\n');

  if (token === 'YOUR_TOKEN_HERE') {
    console.log('⚠️  Please update the token in this file first!');
    console.log('\nAlternatively, test directly in browser console:');
    console.log(`
fetch('/api/payments/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  },
  body: JSON.stringify({
    amount: 100,
    currency: 'INR',
    description: 'Test payment'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
    `);
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: 100,
        currency: 'INR',
        description: 'Test payment'
      })
    });

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n✅ API test passed!');
    } else {
      console.log('\n❌ API test failed!');
      console.log('Error:', data.error || data.message);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testPaymentAPI();
