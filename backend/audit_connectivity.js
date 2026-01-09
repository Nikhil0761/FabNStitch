import { db } from './db.js';

console.log('='.repeat(60));
console.log('FABNSTITCH BACKEND CONNECTIVITY AUDIT');
console.log('='.repeat(60));

async function runAudit() {
  try {
    // 1. Check if tables exist and have data
    console.log('\n📊 DATABASE TABLES AUDIT:\n');
    
    const tables = ['users', 'orders', 'measurements', 'fabrics', 'tickets', 'order_status_history'];
    
    for (const table of tables) {
      const count = await new Promise((resolve, reject) => {
        db.query(`SELECT COUNT(*) as count FROM ${table}`, [], (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count);
        });
      });
      console.log(`✓ ${table.padEnd(25)} : ${count} records`);
    }
    
    // 2. Check user roles distribution
    console.log('\n👥 USER ROLES DISTRIBUTION:\n');
    const roles = await new Promise((resolve, reject) => {
      db.query(`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
      `, [], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    roles.forEach(r => console.log(`   ${r.role.padEnd(15)} : ${r.count} users`));
    
    // 3. Check order connectivity
    console.log('\n📦 ORDER CONNECTIVITY CHECK:\n');
    
    const orderStats = await new Promise((resolve, reject) => {
      db.query(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END) as missing_customer,
          SUM(CASE WHEN tailor_id IS NULL THEN 1 ELSE 0 END) as no_tailor_assigned,
          SUM(CASE WHEN fabric_id IS NULL THEN 1 ELSE 0 END) as no_fabric
        FROM orders
      `, [], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
    
    console.log(`   Total Orders         : ${orderStats.total_orders}`);
    console.log(`   Missing Customer     : ${orderStats.missing_customer} ${orderStats.missing_customer > 0 ? '❌' : '✓'}`);
    console.log(`   No Tailor Assigned   : ${orderStats.no_tailor_assigned} ${orderStats.no_tailor_assigned > 0 ? '⚠️' : '✓'}`);
    console.log(`   No Fabric Info       : ${orderStats.no_fabric} ${orderStats.no_fabric > 0 ? '⚠️' : '✓'}`);
    
    // 4. Check order status history
    console.log('\n📋 ORDER STATUS HISTORY:\n');
    const historyStats = await new Promise((resolve, reject) => {
      db.query(`
        SELECT COUNT(DISTINCT order_id) as orders_with_history
        FROM order_status_history
      `, [], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
    console.log(`   Orders with History  : ${historyStats.orders_with_history}/${orderStats.total_orders}`);
    
    // 5. Test cross-portal visibility
    console.log('\n🔗 CROSS-PORTAL DATA VISIBILITY TEST:\n');
    
    // Get a sample customer with orders
    const customers = await new Promise((resolve, reject) => {
      db.query(`
        SELECT u.id, u.name, u.email, COUNT(o.id) as order_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.role = 'customer'
        GROUP BY u.id
        HAVING order_count > 0
        LIMIT 1
      `, [], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    if (customers.length > 0) {
      const customer = customers[0];
      console.log(`   ✓ Testing with customer: ${customer.name} (${customer.email})`);
      console.log(`     - Orders visible to customer: ${customer.order_count}`);
      
      // Check if orders are visible in admin
      const adminVisible = await new Promise((resolve, reject) => {
        db.query(`
          SELECT COUNT(*) as count
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          WHERE o.user_id = ?
        `, [customer.id], (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count);
        });
      });
      console.log(`     - Orders visible to admin: ${adminVisible} ${adminVisible === customer.order_count ? '✓' : '❌'}`);
      
      // Check if assigned to tailor
      const tailorOrders = await new Promise((resolve, reject) => {
        db.query(`
          SELECT COUNT(*) as count, tailor_id
          FROM orders
          WHERE user_id = ? AND tailor_id IS NOT NULL
          GROUP BY tailor_id
        `, [customer.id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      if (tailorOrders.length > 0) {
        tailorOrders.forEach(t => {
          console.log(`     - Orders visible to tailor ${t.tailor_id}: ${t.count} ✓`);
        });
      } else {
        console.log(`     - No orders assigned to tailors yet ⚠️`);
      }
    } else {
      console.log(`   ⚠️  No customers with orders found`);
    }
    
    // 6. Check for orphaned records
    console.log('\n🔍 ORPHANED RECORDS CHECK:\n');
    
    const orphanedMeasurements = await new Promise((resolve, reject) => {
      db.query(`
        SELECT COUNT(*) as count
        FROM measurements m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE u.id IS NULL
      `, [], (err, result) => {
        if (err) reject(err);
        else resolve(result[0].count);
      });
    });
    console.log(`   Orphaned Measurements: ${orphanedMeasurements} ${orphanedMeasurements === 0 ? '✓' : '❌'}`);
    
    const orphanedTickets = await new Promise((resolve, reject) => {
      db.query(`
        SELECT COUNT(*) as count
        FROM tickets t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE u.id IS NULL
      `, [], (err, result) => {
        if (err) reject(err);
        else resolve(result[0].count);
      });
    });
    console.log(`   Orphaned Tickets     : ${orphanedTickets} ${orphanedTickets === 0 ? '✓' : '❌'}`);
    
    // 7. Check table name consistency
    console.log('\n📝 TABLE NAME CONSISTENCY:\n');
    
    // Check if support_tickets table exists (wrong name in customer.js)
    try {
      await new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) as count FROM support_tickets', [], (err, result) => {
          if (err) {
            if (err.message.includes('no such table')) {
              resolve('not_exists');
            } else {
              reject(err);
            }
          } else {
            resolve('exists');
          }
        });
      });
      console.log('   ❌ ISSUE FOUND: support_tickets table exists (should be tickets)');
    } catch (err) {
      if (err === 'not_exists') {
        console.log('   ✓ Using correct table name: tickets');
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('AUDIT COMPLETE');
    console.log('='.repeat(60));
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ AUDIT ERROR:', error.message);
    process.exit(1);
  }
}

runAudit();
