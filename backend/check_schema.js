import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

async function checkSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
  console.log("USERS COLUMNS:", res.rows);
  await client.end();
}

checkSchema();
