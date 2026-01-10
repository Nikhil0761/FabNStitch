
import fetch from 'node-fetch';

const API_URL = "http://localhost:5001/api";

async function testFlow() {
    const email = `testuser_${Date.now()}@example.com`;

    console.log("0. Testing Registration...");
    try {
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Test User",
                email: email,
                password: "password",
                phone: "1234567890",
                role: "customer"
            })
        });
        console.log("Register Status:", regRes.status);
        const regData = await regRes.json();
        if (!regRes.ok) {
            console.error("Register Failed:", regData);
        } else {
            console.log("Register Success!");
        }
    } catch (err) {
        console.error("Register Error:", err);
    }

    console.log("\n1. Testing Login...");
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: "password" })
        });

        // ... rest of logic
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            console.error("Login Failed:", loginData);
            return;
        }
        const token = loginData.token;
        console.log("Login Success! Token obtained.");

        console.log("\n2. Testing Customer Dashboard...");
        const dashRes = await fetch(`${API_URL}/customer/dashboard`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const dashText = await dashRes.text();
        console.log("Dashboard Status:", dashRes.status);
        try {
            const dashData = JSON.parse(dashText);
            console.log("Dashboard Data:", JSON.stringify(dashData, null, 2));
        } catch {
            console.log("Dashboard Raw Resp:", dashText);
        }

        console.log("\n3. Testing Customer Orders...");
        const ordersRes = await fetch(`${API_URL}/customer/orders`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        console.log("Orders Status:", ordersRes.status);
        console.log("Orders Count:", ordersData.orders ? ordersData.orders.length : "N/A");

    } catch (err) {
        console.error("Test Failed:", err);
    }
}

testFlow();
