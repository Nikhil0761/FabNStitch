#!/usr/bin/env node
/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FABNSTITCH ADMIN PORTAL - API ENDPOINT TESTING
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Comprehensive testing of all admin API endpoints
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const API_URL = process.env.API_URL || 'http://localhost:5001/api';
const ADMIN_EMAIL = 'admin@fabnstitch.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = null;
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, type = 'info') {
  const prefix = {
    error: `${colors.red}❌ FAIL${colors.reset}`,
    success: `${colors.green}✅ PASS${colors.reset}`,
    warning: `${colors.yellow}⚠️  WARN${colors.reset}`,
    info: `${colors.blue}ℹ️${colors.reset}`,
    section: `${colors.cyan}${colors.bright}`,
  }[type] || '';
  
  console.log(`${prefix} ${message}${type === 'section' ? colors.reset : ''}`);
}

async function test(name, fn) {
  testResults.total++;
  process.stdout.write(`  Testing: ${name} ... `);
  
  try {
    await fn();
    console.log(`${colors.green}✅ PASS${colors.reset}`);
    testResults.passed++;
  } catch (error) {
    console.log(`${colors.red}❌ FAIL${colors.reset}`);
    console.log(`    Error: ${error.message}`);
    testResults.failed++;
  }
}

async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  
  return { response, data };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTHENTICATION TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testAuthentication() {
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  log('AUTHENTICATION TESTS', 'section');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');

  await test('Admin login with valid credentials', async () => {
    const { response, data } = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!response.ok) throw new Error('Login failed');
    if (!data.token) throw new Error('No token received');
    if (!data.user || !data.user.role) throw new Error('User data missing');
    if (data.user.role !== 'admin') throw new Error('User is not admin');

    authToken = data.token;
  });

  await test('Reject login with invalid credentials', async () => {
    const { response } = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: 'wrongpassword',
      }),
    });

    if (response.ok) throw new Error('Login should have failed');
  });

  await test('Reject access without token', async () => {
    const { response } = await apiCall('/admin/dashboard');

    if (response.ok) throw new Error('Should require authentication');
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN DASHBOARD TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testDashboard() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  log('DASHBOARD TESTS', 'section');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');

  await test('Fetch dashboard statistics', async () => {
    const { response, data } = await apiCall('/admin/dashboard', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) throw new Error('Failed to fetch dashboard');
    if (typeof data.customers !== 'number') throw new Error('Missing customers count');
    if (typeof data.tailors !== 'number') throw new Error('Missing tailors count');
    if (typeof data.orders !== 'number') throw new Error('Missing orders count');
    if (!data.orderStats) throw new Error('Missing order stats');
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMER MANAGEMENT TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testCustomerManagement() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  log('CUSTOMER MANAGEMENT TESTS', 'section');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');

  await test('Fetch all customers', async () => {
    const { response, data } = await apiCall('/admin/customers', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) throw new Error('Failed to fetch customers');
    if (!Array.isArray(data.customers)) throw new Error('Customers should be an array');
  });

  await test('Create new customer', async () => {
    const testEmail = `test_${Date.now()}@test.com`;
    const { response, data } = await apiCall('/admin/create-customer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        email: testEmail,
        password: 'test123',
        name: 'Test Customer',
        phone: '1234567890',
        address: '123 Test St',
        city: 'Test City',
      }),
    });

    if (!response.ok) throw new Error(data.error || 'Failed to create customer');
    if (data.customer.email !== testEmail) throw new Error('Email mismatch');
  });

  await test('Reject duplicate customer email', async () => {
    const { response } = await apiCall('/admin/create-customer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        email: ADMIN_EMAIL, // Use existing admin email
        password: 'test123',
        name: 'Duplicate Test',
        phone: '1234567890',
      }),
    });

    if (response.ok) throw new Error('Should reject duplicate email');
  });

  await test('Reject weak password', async () => {
    const { response } = await apiCall('/admin/create-customer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        email: `test_${Date.now()}@test.com`,
        password: '12345', // Too short
        name: 'Test User',
        phone: '1234567890',
      }),
    });

    if (response.ok) throw new Error('Should reject weak password');
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAILOR MANAGEMENT TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testTailorManagement() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  log('TAILOR MANAGEMENT TESTS', 'section');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');

  await test('Fetch all tailors', async () => {
    const { response, data } = await apiCall('/admin/tailors', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) throw new Error('Failed to fetch tailors');
    if (!Array.isArray(data.tailors)) throw new Error('Tailors should be an array');
  });

  await test('Create new tailor', async () => {
    const testEmail = `tailor_${Date.now()}@test.com`;
    const { response, data } = await apiCall('/admin/create-tailor', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        email: testEmail,
        password: 'test123',
        name: 'Test Tailor',
        phone: '1234567890',
        address: '123 Test St',
        city: 'Test City',
      }),
    });

    if (!response.ok) throw new Error(data.error || 'Failed to create tailor');
    if (data.tailor.email !== testEmail) throw new Error('Email mismatch');
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORDER MANAGEMENT TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testOrderManagement() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  log('ORDER MANAGEMENT TESTS', 'section');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');

  await test('Fetch all orders', async () => {
    const { response, data } = await apiCall('/admin/orders', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) throw new Error('Failed to fetch orders');
    if (!Array.isArray(data.orders)) throw new Error('Orders should be an array');
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPPORT & LEADS TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testSupportAndLeads() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  log('SUPPORT & LEADS TESTS', 'section');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');

  await test('Fetch support tickets', async () => {
    const { response, data } = await apiCall('/admin/tickets', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) throw new Error('Failed to fetch tickets');
    if (!Array.isArray(data.tickets)) throw new Error('Tickets should be an array');
  });

  await test('Fetch website leads', async () => {
    const { response, data } = await apiCall('/admin/leads', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) throw new Error('Failed to fetch leads');
    if (!Array.isArray(data.leads)) throw new Error('Leads should be an array');
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN TEST RUNNER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function runAllTests() {
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'section');
  log('                FABNSTITCH ADMIN API - COMPREHENSIVE TEST SUITE            ', 'section');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'section');
  log('');

  try {
    await testAuthentication();
    await testDashboard();
    await testCustomerManagement();
    await testTailorManagement();
    await testOrderManagement();
    await testSupportAndLeads();

    // Final Report
    log('\n╔════════════════════════════════════════════════════════════════════════════╗', 'section');
    log('                              TEST RESULTS SUMMARY                          ', 'section');
    log('╚════════════════════════════════════════════════════════════════════════════╝', 'section');
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    
    log('');
    log(`Total Tests: ${testResults.total}`, 'info');
    log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`, 'info');
    log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`, 'info');
    log(`Success Rate: ${successRate}%`, 'info');
    log('');

    if (testResults.failed === 0) {
      log('🎉 ALL TESTS PASSED! The admin portal is functioning perfectly.', 'success');
    } else {
      log(`⚠️  ${testResults.failed} test(s) failed. Please review the errors above.`, 'warning');
    }

    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
    
    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

runAllTests();
