import dotenv from 'dotenv';
dotenv.config();  // ← MUST be first before anything else

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createRoomsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expired_at TIMESTAMP,
        peak_user_count INT DEFAULT 0,
        total_messages INT DEFAULT 0,
        is_expired BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('✅ Rooms analytics table created!');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await pool.end();
  }
}

createRoomsTable();