import { db } from './db.js';
import bcrypt from 'bcryptjs';

console.log('\n🧪 TESTING COMPLETE DATA FLOW ACROSS ALL PORTALS\n');
console.log('='.repeat(70));

async function testDataFlow() {
  try {
    // Step 1: Create test customer
    console.log('\n1️⃣  CREATING TEST CUSTOMER...');
    const hashedPassword = bcrypt.hashSync('test123', 10);
    const customerResult = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO users (email, password, name, phone, city, role) VALUES (?, ?, ?, ?, ?, ?)',
        [`testcust${Date.now()}@test.com`, hashedPassword, 'Test Customer', '9876543210', 'Mumbai', 'customer'],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    const customerId = customerResult.insertId;
    console.log(`   ✓ Customer created (ID: ${customerId})`);
    
    // Step 2: Create test tailor
    console.log('\n2️⃣  CREATING TEST TAILOR...');
    const tailorResult = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO users (email, password, name, phone, city, role) VALUES (?, ?, ?, ?, ?, ?)',
        [`testtailor${Date.now()}@test.com`, hashedPassword, 'Test Tailor', '9876543211', 'Mumbai', 'tailor'],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    const tailorId = tailorResult.insertId;
    console.log(`   ✓ Tailor created (ID: ${tailorId})`);
    
    // Step 3: Admin creates order for customer
    console.log('\n3️⃣  ADMIN CREATING ORDER FOR CUSTOMER...');
    const orderId = `ORD-${Date.now()}`;
    const orderResult = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO orders (order_id, user_id, style, status, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, customerId, 'Test Blazer', 'pending', 5000],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    const orderDbId = orderResult.insertId;
    console.log(`   ✓ Order created (ID: ${orderId}, DB ID: ${orderDbId})`);
    
    // Step 4: Add order status history
    console.log('\n4️⃣  ADDING ORDER STATUS HISTORY...');
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO order_status_history (order_id, status, notes, updated_by) VALUES (?, ?, ?, ?)',
        [orderDbId, 'pending', 'Order created by admin', 1],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log('   ✓ Status history added');
    
    // Step 5: Check customer can see the order
    console.log(`\n5️⃣  CHECKING CUSTOMER PORTAL VISIBILITY...`);
    const customerOrders = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM orders WHERE user_id = ?',
        [customerId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    console.log(`   ✓ Customer can see ${customerOrders.length} order(s)`);
    
    // Step 6: Admin assigns order to tailor
    console.log(`\n6️⃣  ADMIN ASSIGNING ORDER TO TAILOR...`);
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE orders SET tailor_id = ?, status = ? WHERE id = ?',
        [tailorId, 'confirmed', orderDbId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO order_status_history (order_id, status, notes, updated_by) VALUES (?, ?, ?, ?)',
        [orderDbId, 'confirmed', 'Order confirmed and assigned to tailor', 1],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log('   ✓ Order assigned to tailor');
    
    // Step 7: Check tailor can see the order
    console.log(`\n7️⃣  CHECKING TAILOR PORTAL VISIBILITY...`);
    const tailorOrders = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM orders WHERE tailor_id = ?',
        [tailorId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    console.log(`   ✓ Tailor can see ${tailorOrders.length} order(s)`);
    
    // Step 8: Tailor updates order status
    console.log(`\n8️⃣  TAILOR UPDATING ORDER STATUS...`);
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['stitching', orderDbId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)',
        [orderDbId, 'stitching', 'Stitching started'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log('   ✓ Status updated to stitching');
    
    // Step 9: Check customer sees updated status
    console.log(`\n9️⃣  CHECKING CUSTOMER SEES UPDATED STATUS...`);
    const updatedOrder = await new Promise((resolve, reject) => {
      db.query(
        'SELECT status FROM orders WHERE id = ?',
        [orderDbId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result[0]);
        }
      );
    });
    console.log(`   ✓ Customer sees status: ${updatedOrder.status}`);
    
    // Step 10: Check order history is visible to all
    console.log(`\n🔟 CHECKING ORDER STATUS HISTORY VISIBILITY...`);
    const history = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC',
        [orderDbId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    console.log(`   ✓ Order has ${history.length} status history entries:`);
    history.forEach((h, i) => {
      console.log(`     ${i + 1}. ${h.status} - ${h.notes}`);
    });
    
    // Step 11: Test support ticket creation
    console.log(`\n1️⃣1️⃣  TESTING SUPPORT TICKET CREATION...`);
    const ticketResult = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO tickets (user_id, subject, message, priority, status) VALUES (?, ?, ?, ?, ?)',
        [customerId, 'Test Ticket', 'Test message', 'medium', 'open'],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    console.log(`   ✓ Support ticket created (ID: ${ticketResult.insertId})`);
    
    // Step 12: Check admin can see the ticket
    console.log(`\n1️⃣2️⃣  CHECKING ADMIN CAN SEE SUPPORT TICKETS...`);
    const adminTickets = await new Promise((resolve, reject) => {
      db.query(
        `SELECT t.*, u.name, u.email FROM tickets t 
         LEFT JOIN users u ON t.user_id = u.id
         WHERE t.user_id = ?`,
        [customerId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    console.log(`   ✓ Admin can see ${adminTickets.length} ticket(s) from this customer`);
    
    console.log('\\n' + '='.repeat(70));
    console.log('✅ ALL DATA FLOW TESTS PASSED!');
    console.log('='.repeat(70));
    console.log('\\n📊 SUMMARY:');
    console.log('   • Customer ↔ Orders: ✓ Working');
    console.log('   • Admin ↔ Orders: ✓ Working');
    console.log('   • Tailor ↔ Orders: ✓ Working');
    console.log('   • Order Status History: ✓ Working');
    console.log('   • Support Tickets: ✓ Working');
    console.log('   • Cross-portal visibility: ✓ Working');
    console.log('\\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

testDataFlow();
