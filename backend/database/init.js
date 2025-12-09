/* ============================================
   Database Initialization
   ============================================
   
   📚 LEARNING: SQLite with better-sqlite3
   
   SQLite is a file-based database - perfect for:
   - Development and learning
   - Small to medium applications
   - No separate database server needed
   
   We can migrate to PostgreSQL later for production.
   
   ============================================ */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

// Create database file path
const dbPath = path.join(__dirname, 'fabnstitch.db');

// Create database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    try {
      // ============================================
      // USERS TABLE
      // ============================================
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          phone TEXT,
          role TEXT DEFAULT 'customer' CHECK(role IN ('admin', 'tailor', 'customer')),
          address TEXT,
          city TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // ============================================
      // MEASUREMENTS TABLE
      // ============================================
      db.exec(`
        CREATE TABLE IF NOT EXISTS measurements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          chest REAL,
          waist REAL,
          shoulders REAL,
          arm_length REAL,
          jacket_length REAL,
          neck REAL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // ============================================
      // FABRICS TABLE
      // ============================================
      db.exec(`
        CREATE TABLE IF NOT EXISTS fabrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          material TEXT,
          color TEXT,
          price REAL,
          stock INTEGER DEFAULT 0,
          image_url TEXT,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // ============================================
      // ORDERS TABLE
      // ============================================
      db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id TEXT UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          tailor_id INTEGER,
          fabric_id INTEGER,
          style TEXT,
          status TEXT DEFAULT 'pending' CHECK(status IN (
            'pending', 'confirmed', 'stitching', 'finishing', 
            'quality_check', 'ready', 'shipped', 'delivered', 'cancelled'
          )),
          price REAL,
          delivery_address TEXT,
          estimated_delivery DATE,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (tailor_id) REFERENCES users(id),
          FOREIGN KEY (fabric_id) REFERENCES fabrics(id)
        )
      `);

      // ============================================
      // ORDER STATUS HISTORY TABLE
      // ============================================
      db.exec(`
        CREATE TABLE IF NOT EXISTS order_status_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          status TEXT NOT NULL,
          notes TEXT,
          updated_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          FOREIGN KEY (updated_by) REFERENCES users(id)
        )
      `);

      // ============================================
      // SUPPORT TICKETS TABLE
      // ============================================
      db.exec(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
          priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // ============================================
      // LEADS TABLE (from Get Started form)
      // ============================================
      db.exec(`
        CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT NOT NULL,
          company TEXT,
          need TEXT,
          status TEXT DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'converted', 'dropped')),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // ============================================
      // SEED DATA - Demo Users
      // ============================================
      const checkUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@fabnstitch.com');
      
      if (!checkUser) {
        console.log('📝 Creating demo users...');
        
        // Create admin user
        const adminPassword = bcrypt.hashSync('admin123', 10);
        db.prepare(`
          INSERT INTO users (email, password, name, phone, role, city) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run('admin@fabnstitch.com', adminPassword, 'Admin User', '9920077539', 'admin', 'Mumbai');

        // Create demo customer
        const customerPassword = bcrypt.hashSync('customer123', 10);
        const customerResult = db.prepare(`
          INSERT INTO users (email, password, name, phone, role, address, city) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run('rahul@example.com', customerPassword, 'Rahul Sharma', '9876543210', 'customer', '123 Main Street', 'Mumbai');

        // Create measurements for demo customer
        db.prepare(`
          INSERT INTO measurements (user_id, chest, waist, shoulders, arm_length, jacket_length, neck)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(customerResult.lastInsertRowid, 42, 36, 18, 25, 30, 16);

        // Create demo tailor
        const tailorPassword = bcrypt.hashSync('tailor123', 10);
        db.prepare(`
          INSERT INTO users (email, password, name, phone, role, city) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run('tailor@fabnstitch.com', tailorPassword, 'Keshav Roy', '9988776655', 'tailor', 'Mumbai');

        // Create demo fabrics
        const fabrics = [
          ['Premium Italian Wool', 'Wool', 'Navy Blue', 8500, 50, 'Finest Italian wool, perfect for formal blazers'],
          ['English Tweed', 'Tweed', 'Brown', 7500, 35, 'Classic English tweed for a sophisticated look'],
          ['Linen Blend', 'Linen', 'Beige', 5500, 60, 'Light and breathable for summer wear'],
          ['Cashmere Blend', 'Cashmere', 'Charcoal', 12000, 20, 'Luxurious cashmere blend for premium comfort']
        ];

        const insertFabric = db.prepare(`
          INSERT INTO fabrics (name, material, color, price, stock, description)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        fabrics.forEach(fabric => insertFabric.run(...fabric));

        // Create demo order
        const orderId = 'ORD' + Date.now().toString().slice(-8);
        db.prepare(`
          INSERT INTO orders (order_id, user_id, tailor_id, fabric_id, style, status, price, delivery_address, estimated_delivery)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(orderId, 2, 3, 1, 'Double-Breasted Blazer', 'stitching', 12500, '123 Main Street, Mumbai', '2025-01-15');

        // Add order status history
        db.prepare(`
          INSERT INTO order_status_history (order_id, status, notes, updated_by)
          VALUES (?, ?, ?, ?)
        `).run(1, 'pending', 'Order placed successfully', 2);

        db.prepare(`
          INSERT INTO order_status_history (order_id, status, notes, updated_by)
          VALUES (?, ?, ?, ?)
        `).run(1, 'confirmed', 'Order confirmed by tailor', 3);

        db.prepare(`
          INSERT INTO order_status_history (order_id, status, notes, updated_by)
          VALUES (?, ?, ?, ?)
        `).run(1, 'stitching', 'Stitching in progress', 3);

        console.log('✅ Demo data created successfully!');
      }

      console.log('✅ Database initialized successfully!');
      resolve(db);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { db, initializeDatabase };

