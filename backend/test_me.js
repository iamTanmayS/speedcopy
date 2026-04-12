import 'dotenv/config';
import fetch from 'node-fetch';

async function testApi() {
  console.log("Getting Dev Token...");
  const loginRes = await fetch("http://localhost:4000/auth/dev-token-by-email", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: "test_update@example.com" })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.tokens.accessToken;

  console.log("Updating profile...");
  const updateRes = await fetch("http://localhost:4000/users/me", {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name: "Mr Update", phone: "9876543211", city: "Mumbai" })
  });
  
  const updateData = await updateRes.json();
  console.log("Update response:", updateData);
}

testApi();
