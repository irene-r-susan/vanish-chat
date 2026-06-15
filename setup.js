import pool from './db.js';

async function initializeDatabase() {
  try {
    console.log('🔧 Setting up database tables...');

    // Create rooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expired_at TIMESTAMP,
        is_expired BOOLEAN DEFAULT FALSE,
        peak_user_count INT DEFAULT 0,
        total_messages INT DEFAULT 0
      );
    `);
    console.log('✅ Rooms table initialized');

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(100) NOT NULL,
        username VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Messages table initialized');

    console.log('✅ Database setup complete');
  } catch (err) {
    console.error('❌ Error setting up database:', err);
    process.exit(1);
  }
}

export default initializeDatabase;