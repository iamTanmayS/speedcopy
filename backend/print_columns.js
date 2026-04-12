import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

async function printCols() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
  console.log('ACTUAL COLUMNS: ' + res.rows.map(x => x.column_name).join(', '));
  await client.end();
}
printCols();
