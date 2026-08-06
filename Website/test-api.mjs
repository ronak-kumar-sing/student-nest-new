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
  console.log(`\n🧪 Starting Student Nest Full API & Verification Test Suite against ${BASE_URL}\n`);

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

  // Test 2: Student Demo Account Login
  console.log('\nTest 2: Student Login with Demo Account');
  let studentToken = '';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'priya.sharma@iitdelhi.ac.in', password: 'Demo@123', role: 'student' })
    });
    const json = await res.json();
    assert(res.status === 200, `Student login returned 200 OK (got ${res.status})`);
    assert(json.success === true, 'Student login success is true');
    assert(json.data?.user?.role === 'Student', 'Logged in user role is Student');
    assert(!!json.data?.accessToken, 'Access token issued to student');
    studentToken = json.data?.accessToken || '';
  } catch (e) {
    assert(false, `Student login error: ${e.message}`);
  }

  // Test 3: Owner Demo Account Login
  console.log('\nTest 3: Owner Login with Demo Account');
  let ownerToken = '';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'rajesh.mehta@gmail.com', password: 'Demo@123', role: 'owner' })
    });
    const json = await res.json();
    assert(res.status === 200, `Owner login returned 200 OK (got ${res.status})`);
    assert(json.success === true, 'Owner login success is true');
    assert(json.data?.user?.role === 'Owner', 'Logged in user role is Owner');
    assert(!!json.data?.accessToken, 'Access token issued to owner');
    ownerToken = json.data?.accessToken || '';
  } catch (e) {
    assert(false, `Owner login error: ${e.message}`);
  }

  // Test 4: Verification API Endpoint with Student Token
  console.log('\nTest 4: Verification Status Endpoint (Authenticated)');
  try {
    const res = await fetch(`${BASE_URL}/api/verification`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const json = await res.json();
    assert(res.status === 200, `Verification endpoint returned 200 OK (got ${res.status})`);
    assert(json.success === true, 'Verification status success is true');
    assert(json.data?.status === 'verified', 'Demo student verification status is verified');
    assert(json.data?.completionPercentage === 100, 'Verification completion percentage is 100%');
  } catch (e) {
    assert(false, `Verification test error: ${e.message}`);
  }

  // Test 5: POST /api/admin/fix-validation - Unauthenticated check (401)
  console.log('\nTest 5: Admin Endpoint Protection (401 without token)');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/fix-validation`, { method: 'POST' });
    assert(res.status === 401, `Unauthenticated request returned 401 (got ${res.status})`);
  } catch (e) {
    assert(false, `Admin endpoint error: ${e.message}`);
  }

  // Test 6: POST /api/admin/fix-validation - Role check with non-admin token (403)
  console.log('\nTest 6: Admin Endpoint Protection (403 with student token)');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/fix-validation`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(res.status === 403, `Non-admin request blocked with 403 Forbidden (got ${res.status})`);
  } catch (e) {
    assert(false, `Admin role test error: ${e.message}`);
  }

  // Test 7: CORS Headers Verification
  console.log('\nTest 7: Middleware Security & CORS Headers');
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

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
