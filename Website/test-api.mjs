const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log(`\n🧪 Starting Student Nest API Test Suite against ${BASE_URL}\n`);

  // Test 1: GET /api/rooms - Public listing & PII stripping
  console.log('Test 1: Public Rooms Listing PII Stripping');
  try {
    const res = await fetch(`${BASE_URL}/api/rooms?limit=2`);
    const json = await res.json();
    assert(res.status === 200, `HTTP status is 200 (got ${res.status})`);
    assert(json.success === true, 'Response success is true');
    if (json.data && json.data.length > 0) {
      const owner = json.data[0].owner;
      assert(owner.email === undefined, 'Owner email is stripped from public listing');
      assert(owner.phone === undefined, 'Owner phone is stripped from public listing');
    }
  } catch (e) {
    assert(false, `Rooms endpoint error: ${e.message}`);
  }

  // Test 2: POST /api/admin/fix-validation - Unauthenticated check (401)
  console.log('\nTest 2: Admin Endpoint Protection (401 without token)');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/fix-validation`, { method: 'POST' });
    assert(res.status === 401, `Unauthenticated request returned 401 (got ${res.status})`);
  } catch (e) {
    assert(false, `Admin endpoint error: ${e.message}`);
  }

  // Test 3: POST /api/admin/fix-validation - Role check (401/403 with invalid token)
  console.log('\nTest 3: Admin Endpoint Protection (401/403 with non-admin token)');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/fix-validation`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer invalid_or_student_token' }
    });
    assert(res.status === 401 || res.status === 403, `Non-admin request blocked with 401/403 (got ${res.status})`);
  } catch (e) {
    assert(false, `Admin role test error: ${e.message}`);
  }

  // Test 4: POST /api/auth/login - Invalid credentials handling (401)
  console.log('\nTest 4: Login Endpoint Credential Validation (401)');
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'nonexistent.test.user@example.com', password: 'WrongPassword123!' })
    });
    const json = await res.json();
    assert(res.status === 401, `Invalid credentials return 401 (got ${res.status})`);
    assert(json.error === 'Invalid credentials' || json.message?.includes('Invalid'), 'Error message correctly states invalid credentials');
  } catch (e) {
    assert(false, `Login test error: ${e.message}`);
  }

  // Test 5: CORS Headers Verification
  console.log('\nTest 5: Middleware Security & CORS Headers');
  try {
    const res = await fetch(`${BASE_URL}/api/rooms`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'https://malicious-attacker-domain.com' }
    });
    const corsOrigin = res.headers.get('access-control-allow-origin');
    assert(corsOrigin !== '*', 'Wildcard origin (*) is NOT returned for untrusted origins');
  } catch (e) {
    assert(false, `CORS test error: ${e.message}`);
  }

  // Test 6: Saved Rooms Single Room Query Endpoint
  console.log('\nTest 6: Saved Rooms Single Room Check Endpoint (401 without auth)');
  try {
    const res = await fetch(`${BASE_URL}/api/saved-rooms?roomId=60d5ecb8b3170b0015f8e001`);
    assert(res.status === 401, `Unauthenticated request returned 401 (got ${res.status})`);
  } catch (e) {
    assert(false, `Saved rooms endpoint error: ${e.message}`);
  }

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
