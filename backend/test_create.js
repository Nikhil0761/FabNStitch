import fetch from 'node-fetch';

async function testCreateTailor() {
  try {
    // Login as admin
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@fabnstitch.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login:', loginData.message);
    
    // Create tailor
    const createRes = await fetch('http://localhost:5001/api/admin/create-tailor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        email: 'tailor3@example.com',
        password: 'test123',
        name: 'Test Tailor 3',
        phone: '9876543210',
        city: 'Mumbai',
        address: '123 Test Street'
      })
    });
    
    const createData = await createRes.json();
    console.log('Create Tailor Response:', createData);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testCreateTailor();
