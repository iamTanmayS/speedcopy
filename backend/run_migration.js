import pkg from 'pg';
const { Client } = pkg;

async function run() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_jvZw7Mstb1mV@ep-empty-fire-a4m93qrp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  });
  await client.connect();
  console.log("Connected");
  try {
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6);");
    console.log("Added otp_code to users");
  } catch(e) {
    console.log("Error otp_code:", e.message);
  }
  try {
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMPTZ;");
    console.log("Added otp_expiry to users");
  } catch(e) {
    console.log("Error otp_expiry:", e.message);
  }
  await client.end();
}

run();
