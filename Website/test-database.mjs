// Test Database and Models
require('dotenv').config({ path: '.env.local' });

async function testDatabase() {
  console.log('🔍 Testing Database Connection...\n');

  // Dynamic import for ES modules
  const { default: connectDB } = await import('./src/lib/db/connection.js');
  const { default: User } = await import('./src/lib/models/User.js');
  const { default: Transaction } = await import('./src/lib/models/Transaction.js');
  const { default: Customer } = await import('./src/lib/models/Customer.js');

  try {
    console.log('1. Connecting to MongoDB...');
    await connectDB();
    console.log('   ✓ Connected successfully\n');

    console.log('2. Testing User model...');
    const userCount = await User.countDocuments();
    console.log(`   ✓ Found ${userCount} users\n`);

    console.log('3. Testing Transaction model...');
    const transactionCount = await Transaction.countDocuments();
    console.log(`   ✓ Found ${transactionCount} transactions\n`);

    console.log('4. Testing Customer model...');
    const customerCount = await Customer.countDocuments();
    console.log(`   ✓ Found ${customerCount} customers\n`);

    console.log('✅ All database tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testDatabase();
