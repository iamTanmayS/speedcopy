import 'dotenv/config';
import fetch from 'node-fetch';
import pkg from 'pg';
const { Client } = pkg;

const API_URL = 'http://localhost:4000/auth';
const TEST_EMAIL = 'test_otp_user@example.com';

async function testOTPFlow() {
  console.log("1. Sending OTP to", TEST_EMAIL);
  const loginRes = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL })
  });
  const loginData = await loginRes.json();
  console.log("Login Response:", loginData);

  if (!loginData.success) {
    console.error("Failed to send OTP!");
    return;
  }

  console.log("2. Checking DB for the generated OTP");
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  const res = await client.query("SELECT otp_code FROM users WHERE email = $1", [TEST_EMAIL]);
  await client.end();

  const otp = res.rows[0]?.otp_code;
  console.log("Database OTP is:", otp);

  if (!otp) {
    console.error("No OTP found in database.");
    return;
  }

  console.log("3. Verifying the OTP");
  const verifyRes = await fetch(`${API_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, otp })
  });
  
  const verifyData = await verifyRes.json();
  console.log("Verify Response:", verifyData);

  if (verifyData.success) {
    console.log("✅ OTP Flow verified perfectly in the backend!");
  } else {
    console.log("❌ OTP Verification failed");
  }
}

testOTPFlow();
