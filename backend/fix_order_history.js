import { db } from './db.js';

console.log('\n🔧 FIXING EXISTING ORDERS - ADDING MISSING STATUS HISTORY\n');

async function fixExistingOrders() {
  try {
    // Get all orders without status history
    const ordersWithoutHistory = await new Promise((resolve, reject) => {
      db.query(`
        SELECT o.id, o.order_id, o.status, o.created_at, o.user_id
        FROM orders o
        LEFT JOIN order_status_history h ON o.id = h.order_id
        WHERE h.id IS NULL
      `, [], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (ordersWithoutHistory.length === 0) {
      console.log('✓ All orders already have status history');
      process.exit(0);
    }

    console.log(`Found ${ordersWithoutHistory.length} orders without status history`);
    console.log('Adding initial status history entries...\n');

    for (const order of ordersWithoutHistory) {
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO order_status_history (order_id, status, notes, created_at) VALUES (?, ?, ?, ?)',
          [order.id, order.status, `Order status: ${order.status}`, order.created_at],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      console.log(`   ✓ Added history for order ${order.order_id}`);
    }

    console.log(`\n✅ Successfully added status history for ${ordersWithoutHistory.length} orders\n`);
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

fixExistingOrders();
