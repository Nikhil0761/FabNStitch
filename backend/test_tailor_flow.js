import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001/api';
let token = '';
let tailorId = '';

const uniqueId = Date.now();
const email = `tailor${uniqueId}@example.com`;
const password = 'password123';

async function runTest() {
    console.log('--- STARTING TAILOR FLOW TEST ---');

    // 1. Register Tailor
    try {
        console.log(`\n1. Registering Tailor (${email})...`);
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Tailor',
                email: email,
                password: password,
                phone: '9876543210',
                role: 'tailor'
            })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        if (res.status === 201) {
            console.log('Registration Successful');
        } else {
            console.error('Registration Failed:', data);
            return;
        }
    } catch (e) {
        console.error('Registration Error:', e.message);
        return;
    }

    // 2. Login Tailor
    try {
        console.log('\n2. Logging in Tailor...');
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        if (res.status === 200) {
            token = data.token;
            console.log('Login Successful, Token received');
        } else {
            console.error('Login Failed:', data);
            return;
        }
    } catch (e) {
        console.error('Login Error:', e.message);
        return;
    }

    // 3. Get Dashboard
    try {
        console.log('\n3. Fetching Tailor Dashboard...');
        const res = await fetch(`${API_URL}/tailor/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Status:', res.status);
        if (res.status === 200 && data.user && data.user.role === 'tailor') {
            console.log('Dashboard Verified. User:', data.user.name);
            tailorId = data.user.id;
        } else {
            console.error('Dashboard Failed:', data);
        }
    } catch (e) {
        console.error('Dashboard Error:', e.message);
    }

    // 4. Get Orders
    try {
        console.log('\n4. Fetching Tailor Orders...');
        const res = await fetch(`${API_URL}/tailor/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Status:', res.status);
        if (res.status === 200 && Array.isArray(data.orders)) {
            console.log('Orders Verified. Count:', data.orders.length);
        } else {
            console.error('Orders Failed:', data);
        }
    } catch (e) {
        console.error('Orders Error:', e.message);
    }

    // 5. Get Profile
    try {
        console.log('\n5. Fetching Tailor Profile...');
        const res = await fetch(`${API_URL}/tailor/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Status:', res.status);
        if (res.status === 200 && data.user) {
            console.log('Profile Verified. Email:', data.user.email);
        } else {
            console.error('Profile Failed:', data);
        }
    } catch (e) {
        console.error('Profile Error:', e.message);
    }

    console.log('\n--- TEST COMPLETE ---');
}

runTest();
