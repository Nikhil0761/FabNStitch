import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'fabnstitch.db');

async function resetAdminPassword() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Hash the password
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  try {
    // Update the admin user
    await db.run(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@fabnstitch.com']
    );
    
    console.log('✅ Admin password has been reset successfully!');
    console.log('Email: admin@fabnstitch.com');
    console.log('Password: admin123');
    
    // Verify the user exists
    const user = await db.get('SELECT id, email, role FROM users WHERE email = ?', ['admin@fabnstitch.com']);
    console.log('Admin user verified:', user);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  await db.close();
}

resetAdminPassword();
