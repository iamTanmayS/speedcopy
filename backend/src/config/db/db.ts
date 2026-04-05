import pg from "pg";
import { env } from "../config.js";

const { Pool } = pg;

const pool = new Pool({
    connectionString: env.database_url,
});

console.log(env.database_url)
export default pool;