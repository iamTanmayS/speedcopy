import 'dotenv/config';
import fetch from 'node-fetch';

async function testConflict() {
  console.log("Creating user 1...");
  const t1 = (await (await fetch('http://localhost:4000/auth/dev-token-by-email', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'u1@test.com' })
  })).json()).data.tokens.accessToken;

  console.log("Setting phone for U1...");
  const res1 = await fetch('http://localhost:4000/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t1 },
    body: JSON.stringify({ name: 'User 1', phone: '9999999999', city: 'City' })
  });
  console.log("U1 Update result:", await res1.json());

  console.log("Creating user 2...");
  const t2 = (await (await fetch('http://localhost:4000/auth/dev-token-by-email', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'u2@test.com' })
  })).json()).data.tokens.accessToken;

  console.log("Setting identical phone for U2...");
  const res2 = await fetch('http://localhost:4000/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t2 },
    body: JSON.stringify({ name: 'User 2', phone: '9999999999', city: 'City' })
  });
  console.log("U2 Update result:", await res2.json());
}
testConflict();
