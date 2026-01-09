import { db } from './db.js';

console.log('🔧 Fixing measurements table schema...\n');

async function fixMeasurementsTable() {
  try {
    // Check existing columns
    const tableInfo = await db.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='measurements'", []);
    
    if (tableInfo.length > 0) {
      console.log('Current table definition:');
      console.log(tableInfo[0].sql);
      console.log('\n');
    }

    // Drop and recreate the table with correct schema
    console.log('Dropping old measurements table...');
    await db.query('DROP TABLE IF EXISTS measurements', []);
    
    console.log('Creating measurements table with correct schema...');
    await db.query(`
      CREATE TABLE measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        chest REAL,
        waist REAL,
        shoulders REAL,
        arm_length REAL,
        jacket_length REAL,
        neck REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, []);
    
    console.log('✅ Measurements table recreated successfully!\n');
    
    // Verify
    const newTableInfo = await db.query("PRAGMA table_info(measurements)", []);
    console.log('New columns:');
    newTableInfo.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
    console.log('\n✅ Database schema fixed!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixMeasurementsTable();
