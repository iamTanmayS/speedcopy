import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

async function testUpdate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const userId = "d470650e-ef65-4164-ac74-6c012f0276a0"; // sample uuid
    const name = "Test Name";
    const phone = "1234567890";
    const city = "Test City";
    const email = null;
    console.log("Running query...");
    const result = await client.query(
      `UPDATE users SET name=COALESCE($1,name), phone_number=COALESCE($2,phone_number), city=COALESCE($3,city), email=COALESCE($4,email), updated_at=NOW() WHERE id=$5 RETURNING id`,
      [name ?? null, phone ?? null, city ?? null, email ?? null, userId]
    );
    console.log("Success! Rows updated:", result.rowCount);
  } catch(e) {
    console.error("DB ERROR:", e.message);
  }
  await client.end();
}
testUpdate();
