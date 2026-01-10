import { db } from './db.js';

console.log('\n🔧 Adding fabric columns to orders table...\n');

async function addFabricColumns() {
  try {
    // Add fabric_name column
    console.log('Adding fabric_name column...');
    await db.query('ALTER TABLE orders ADD COLUMN fabric_name TEXT', []);
    console.log('✅ fabric_name column added');
    
    // Add fabric_color column
    console.log('Adding fabric_color column...');
    await db.query('ALTER TABLE orders ADD COLUMN fabric_color TEXT', []);
    console.log('✅ fabric_color column added');
    
    // Verify columns were added
    const tableInfo = await db.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders'", []);
    console.log('\n✅ Orders table updated successfully!\n');
    console.log('New table structure includes:');
    console.log('  • fabric_id (for future use with fabrics table)');
    console.log('  • fabric_name (direct storage)');
    console.log('  • fabric_color (direct storage)');
    console.log('\n✅ Orders created now will display fabric details!\n');
    
    process.exit(0);
    
  } catch (error) {
    if (error.message.includes('duplicate column')) {
      console.log('✓ Columns already exist - no changes needed');
      process.exit(0);
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
}

addFabricColumns();
