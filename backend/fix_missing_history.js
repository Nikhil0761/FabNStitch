#!/usr/bin/env node
/**
 * Fix Missing Order Status History
 * This script adds status history entries for orders that don't have any
 */

import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'fabnstitch.db');

const db = new sqlite3.Database(dbPath);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 Fixing Missing Order Status History');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Find orders without status history
db.all(`
  SELECT o.id, o.order_id, o.status, o.created_at, o.user_id
  FROM orders o
  WHERE NOT EXISTS (
    SELECT 1 FROM order_status_history h WHERE h.order_id = o.id
  )
`, [], (err, orders) => {
  if (err) {
    console.error('❌ Error finding orders:', err);
    db.close();
    process.exit(1);
  }

  if (orders.length === 0) {
    console.log('✅ All orders already have status history');
    db.close();
    return;
  }

  console.log(`Found ${orders.length} order(s) without status history:\n`);

  let fixed = 0;
  let errors = 0;

  orders.forEach((order, index) => {
    console.log(`${index + 1}. Order ${order.order_id} (ID: ${order.id}) - Status: ${order.status}`);

    // Get admin user ID for the updated_by field
    db.get('SELECT id FROM users WHERE role = "admin" LIMIT 1', [], (err, admin) => {
      const updatedBy = admin ? admin.id : order.user_id;

      // Insert status history entry
      db.run(`
        INSERT INTO order_status_history (order_id, status, notes, updated_by, created_at)
        VALUES (?, ?, ?, ?, ?)
      `, [order.id, order.status, `Initial status (migrated)`, updatedBy, order.created_at], (err) => {
        if (err) {
          console.error(`   ❌ Failed to add history for order ${order.order_id}:`, err.message);
          errors++;
        } else {
          console.log(`   ✅ Added status history for order ${order.order_id}`);
          fixed++;
        }

        // Check if we've processed all orders
        if (fixed + errors === orders.length) {
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📊 SUMMARY');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`✅ Fixed: ${fixed}`);
          console.log(`❌ Errors: ${errors}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

          if (errors === 0) {
            console.log('🎉 All missing status history entries have been added!\n');
          } else {
            console.log('⚠️  Some entries could not be added. Please review errors above.\n');
          }

          db.close();
          process.exit(errors > 0 ? 1 : 0);
        }
      });
    });
  });
});
