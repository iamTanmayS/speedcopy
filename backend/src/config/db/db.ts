import pg from "pg";
import { env } from "../config.js";

const { Pool } = pg;

const pool = new Pool({
    connectionString: env.database_url,
    ssl: env.database_url.includes('localhost') || env.database_url.includes('127.0.0.1') 
        ? false 
        : { rejectUnauthorized: false }
});

export default pool;