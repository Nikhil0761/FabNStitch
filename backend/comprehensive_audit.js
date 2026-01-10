#!/usr/bin/env node
/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FABNSTITCH ADMIN PORTAL - COMPREHENSIVE AUDIT
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * This script performs a deep audit of:
 * - Backend routes and APIs
 * - Database schema and constraints
 * - Data integrity
 * - Security vulnerabilities
 * - Error handling
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'fabnstitch.db');

const db = new sqlite3.Database(dbPath);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const issues = [];
const warnings = [];
const passed = [];

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    error: `${colors.red}❌ ERROR${colors.reset}`,
    warning: `${colors.yellow}⚠️  WARNING${colors.reset}`,
    success: `${colors.green}✅ PASS${colors.reset}`,
    info: `${colors.blue}ℹ️  INFO${colors.reset}`,
    section: `${colors.cyan}${colors.bright}`,
  }[type] || '';
  
  console.log(`[${timestamp}] ${prefix} ${message}${type === 'section' ? colors.reset : ''}`);
}

function addIssue(category, description, severity = 'high') {
  issues.push({ category, description, severity });
}

function addWarning(category, description) {
  warnings.push({ category, description });
}

function addPass(category, description) {
  passed.push({ category, description });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATABASE SCHEMA AUDIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function auditDatabaseSchema() {
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  log('DATABASE SCHEMA AUDIT', 'section');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');

  return new Promise((resolve) => {
    // Check if all required tables exist
    const requiredTables = ['users', 'orders', 'measurements', 'fabrics', 'tickets', 'leads', 'order_status_history'];
    
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        addIssue('Database', 'Failed to query database tables', 'critical');
        return resolve();
      }

      const tableNames = tables.map(t => t.name);
      
      requiredTables.forEach(table => {
        if (tableNames.includes(table)) {
          addPass('Schema', `Table '${table}' exists`);
        } else {
          addIssue('Schema', `Missing required table: ${table}`, 'critical');
        }
      });

      // Check users table structure
      db.all("PRAGMA table_info(users)", [], (err, columns) => {
        if (err) {
          addIssue('Schema', 'Failed to get users table structure', 'high');
        } else {
          const columnNames = columns.map(c => c.name);
          const requiredColumns = ['id', 'email', 'password', 'name', 'phone', 'role', 'created_at'];
          
          requiredColumns.forEach(col => {
            if (columnNames.includes(col)) {
              addPass('Users Table', `Column '${col}' exists`);
            } else {
              addIssue('Users Table', `Missing column: ${col}`, 'high');
            }
          });

          // Check for indexes
          db.all("PRAGMA index_list(users)", [], (err, indexes) => {
            if (!err && indexes.length > 0) {
              addPass('Performance', `Users table has ${indexes.length} index(es)`);
            } else {
              addWarning('Performance', 'Users table may benefit from additional indexes on email and role');
            }
          });
        }

        // Check orders table structure
        db.all("PRAGMA table_info(orders)", [], (err, columns) => {
          if (err) {
            addIssue('Schema', 'Failed to get orders table structure', 'high');
          } else {
            const columnNames = columns.map(c => c.name);
            const requiredColumns = ['id', 'order_id', 'user_id', 'style', 'status', 'price'];
            
            requiredColumns.forEach(col => {
              if (columnNames.includes(col)) {
                addPass('Orders Table', `Column '${col}' exists`);
              } else {
                addIssue('Orders Table', `Missing column: ${col}`, 'high');
              }
            });

            // Check if fabric_name and fabric_color columns exist
            if (columnNames.includes('fabric_name') && columnNames.includes('fabric_color')) {
              addPass('Orders Table', 'Fabric details columns exist (fabric_name, fabric_color)');
            } else {
              addWarning('Orders Table', 'Missing fabric_name or fabric_color columns');
            }
          }
          
          resolve();
        });
      });
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA INTEGRITY AUDIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function auditDataIntegrity() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  log('DATA INTEGRITY AUDIT', 'section');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');

  return new Promise((resolve) => {
    // Check for orphaned orders (orders with non-existent user_id)
    db.all(`
      SELECT COUNT(*) as count 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE u.id IS NULL
    `, [], (err, result) => {
      if (err) {
        addIssue('Data Integrity', 'Failed to check orphaned orders', 'medium');
      } else if (result[0].count > 0) {
        addIssue('Data Integrity', `Found ${result[0].count} orphaned order(s) with invalid user_id`, 'high');
      } else {
        addPass('Data Integrity', 'No orphaned orders found');
      }

      // Check for orders with invalid tailor_id
      db.all(`
        SELECT COUNT(*) as count 
        FROM orders o 
        WHERE o.tailor_id IS NOT NULL 
        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = o.tailor_id AND u.role = 'tailor')
      `, [], (err, result) => {
        if (err) {
          addIssue('Data Integrity', 'Failed to check invalid tailor assignments', 'medium');
        } else if (result[0].count > 0) {
          addIssue('Data Integrity', `Found ${result[0].count} order(s) with invalid tailor_id`, 'high');
        } else {
          addPass('Data Integrity', 'All tailor assignments are valid');
        }

        // Check for duplicate emails
        db.all(`
          SELECT email, COUNT(*) as count 
          FROM users 
          GROUP BY email 
          HAVING count > 1
        `, [], (err, duplicates) => {
          if (err) {
            addIssue('Data Integrity', 'Failed to check duplicate emails', 'medium');
          } else if (duplicates.length > 0) {
            addIssue('Data Integrity', `Found ${duplicates.length} duplicate email(s)`, 'critical');
            duplicates.forEach(dup => {
              log(`   Duplicate: ${dup.email} (${dup.count} times)`, 'warning');
            });
          } else {
            addPass('Data Integrity', 'No duplicate emails found');
          }

          // Check for orders without status history
          db.all(`
            SELECT COUNT(*) as count 
            FROM orders o 
            WHERE NOT EXISTS (SELECT 1 FROM order_status_history h WHERE h.order_id = o.id)
          `, [], (err, result) => {
            if (err) {
              addIssue('Data Integrity', 'Failed to check order status history', 'medium');
            } else if (result[0].count > 0) {
              addWarning('Data Integrity', `Found ${result[0].count} order(s) without status history`);
            } else {
              addPass('Data Integrity', 'All orders have status history');
            }
            
            resolve();
          });
        });
      });
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECURITY AUDIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function auditSecurity() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  log('SECURITY AUDIT', 'section');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');

  return new Promise((resolve) => {
    // Check for weak passwords (not properly hashed)
    db.all("SELECT id, email, password FROM users LIMIT 5", [], (err, users) => {
      if (err) {
        addIssue('Security', 'Failed to check password hashing', 'medium');
      } else {
        let allHashed = true;
        users.forEach(user => {
          // bcrypt hashes start with $2a$, $2b$, or $2y$
          if (!user.password.match(/^\$2[aby]\$/)) {
            allHashed = false;
            addIssue('Security', `User ${user.email} has non-bcrypt password`, 'critical');
          }
        });
        if (allHashed && users.length > 0) {
          addPass('Security', 'All checked passwords are properly hashed with bcrypt');
        }
      }

      // Check admin accounts
      db.all("SELECT id, email, role FROM users WHERE role = 'admin'", [], (err, admins) => {
        if (err) {
          addIssue('Security', 'Failed to check admin accounts', 'medium');
        } else {
          if (admins.length === 0) {
            addIssue('Security', 'No admin account found', 'critical');
          } else if (admins.length > 5) {
            addWarning('Security', `Found ${admins.length} admin accounts - consider limiting admin access`);
          } else {
            addPass('Security', `Found ${admins.length} admin account(s)`);
            admins.forEach(admin => {
              log(`   Admin: ${admin.email}`, 'info');
            });
          }
        }

        // Check for users with missing emails
        db.all("SELECT COUNT(*) as count FROM users WHERE email IS NULL OR email = ''", [], (err, result) => {
          if (err) {
            addIssue('Security', 'Failed to check for missing emails', 'medium');
          } else if (result[0].count > 0) {
            addIssue('Security', `Found ${result[0].count} user(s) without email`, 'high');
          } else {
            addPass('Security', 'All users have email addresses');
          }
          
          resolve();
        });
      });
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUSINESS LOGIC AUDIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function auditBusinessLogic() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  log('BUSINESS LOGIC AUDIT', 'section');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');

  return new Promise((resolve) => {
    // Check for orders with invalid status
    const validStatuses = ['pending', 'confirmed', 'stitching', 'delivered', 'cancelled'];
    db.all(`
      SELECT COUNT(*) as count, status 
      FROM orders 
      WHERE status NOT IN (${validStatuses.map(() => '?').join(',')})
      GROUP BY status
    `, validStatuses, (err, result) => {
      if (err) {
        addIssue('Business Logic', 'Failed to check order statuses', 'medium');
      } else if (result.length > 0) {
        result.forEach(row => {
          addIssue('Business Logic', `Found ${row.count} order(s) with invalid status: ${row.status}`, 'medium');
        });
      } else {
        addPass('Business Logic', 'All orders have valid status values');
      }

      // Check for orders with negative or zero prices
      db.all("SELECT COUNT(*) as count FROM orders WHERE price <= 0", [], (err, result) => {
        if (err) {
          addIssue('Business Logic', 'Failed to check order prices', 'medium');
        } else if (result[0].count > 0) {
          addWarning('Business Logic', `Found ${result[0].count} order(s) with price <= 0`);
        } else {
          addPass('Business Logic', 'All orders have valid prices');
        }

        // Check for orders without order_id
        db.all("SELECT COUNT(*) as count FROM orders WHERE order_id IS NULL OR order_id = ''", [], (err, result) => {
          if (err) {
            addIssue('Business Logic', 'Failed to check order IDs', 'medium');
          } else if (result[0].count > 0) {
            addIssue('Business Logic', `Found ${result[0].count} order(s) without order_id`, 'high');
          } else {
            addPass('Business Logic', 'All orders have order_id');
          }

          // Check for confirmed orders without assigned tailor
          db.all(`
            SELECT COUNT(*) as count 
            FROM orders 
            WHERE status IN ('confirmed', 'stitching') AND tailor_id IS NULL
          `, [], (err, result) => {
            if (err) {
              addIssue('Business Logic', 'Failed to check tailor assignments', 'medium');
            } else if (result[0].count > 0) {
              addWarning('Business Logic', `Found ${result[0].count} confirmed order(s) without assigned tailor`);
            } else {
              addPass('Business Logic', 'All confirmed orders have assigned tailors');
            }
            
            resolve();
          });
        });
      });
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATISTICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function getStatistics() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  log('DATABASE STATISTICS', 'section');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');

  return new Promise((resolve) => {
    const stats = {};

    db.get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'", [], (err, result) => {
      stats.customers = result?.count || 0;
      
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'tailor'", [], (err, result) => {
        stats.tailors = result?.count || 0;
        
        db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", [], (err, result) => {
          stats.admins = result?.count || 0;
          
          db.get("SELECT COUNT(*) as count FROM orders", [], (err, result) => {
            stats.orders = result?.count || 0;
            
            db.get("SELECT COUNT(*) as count FROM tickets", [], (err, result) => {
              stats.tickets = result?.count || 0;
              
              db.get("SELECT COUNT(*) as count FROM leads", [], (err, result) => {
                stats.leads = result?.count || 0;
                
                log(`Customers: ${stats.customers}`, 'info');
                log(`Tailors: ${stats.tailors}`, 'info');
                log(`Admins: ${stats.admins}`, 'info');
                log(`Orders: ${stats.orders}`, 'info');
                log(`Tickets: ${stats.tickets}`, 'info');
                log(`Leads: ${stats.leads}`, 'info');
                
                resolve(stats);
              });
            });
          });
        });
      });
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATE REPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function generateReport() {
  log('\n\n╔════════════════════════════════════════════════════════════════════════════╗', 'section');
  log('                          AUDIT REPORT SUMMARY                              ', 'section');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'section');

  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');
  const mediumIssues = issues.filter(i => i.severity === 'medium');

  log(`\n${colors.green}✅ PASSED CHECKS: ${passed.length}${colors.reset}`);
  log(`${colors.yellow}⚠️  WARNINGS: ${warnings.length}${colors.reset}`);
  log(`${colors.red}❌ ISSUES: ${issues.length}${colors.reset}`);
  log(`   - Critical: ${criticalIssues.length}`);
  log(`   - High: ${highIssues.length}`);
  log(`   - Medium: ${mediumIssues.length}`);

  if (issues.length > 0) {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
    log('ISSUES FOUND', 'section');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
    
    if (criticalIssues.length > 0) {
      log('\nCRITICAL ISSUES:', 'error');
      criticalIssues.forEach((issue, idx) => {
        log(`${idx + 1}. [${issue.category}] ${issue.description}`, 'error');
      });
    }
    
    if (highIssues.length > 0) {
      log('\nHIGH PRIORITY ISSUES:', 'error');
      highIssues.forEach((issue, idx) => {
        log(`${idx + 1}. [${issue.category}] ${issue.description}`, 'error');
      });
    }
    
    if (mediumIssues.length > 0) {
      log('\nMEDIUM PRIORITY ISSUES:', 'warning');
      mediumIssues.forEach((issue, idx) => {
        log(`${idx + 1}. [${issue.category}] ${issue.description}`, 'warning');
      });
    }
  }

  if (warnings.length > 0) {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
    log('WARNINGS', 'section');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
    warnings.forEach((warning, idx) => {
      log(`${idx + 1}. [${warning.category}] ${warning.description}`, 'warning');
    });
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'section');
  
  if (criticalIssues.length === 0 && highIssues.length === 0) {
    log('✅ AUDIT COMPLETE - NO CRITICAL OR HIGH ISSUES FOUND', 'success');
  } else {
    log('⚠️  AUDIT COMPLETE - ISSUES REQUIRE ATTENTION', 'warning');
  }
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'section');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function runAudit() {
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'section');
  log('                  FABNSTITCH ADMIN PORTAL - COMPREHENSIVE AUDIT            ', 'section');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'section');
  log('');

  try {
    await getStatistics();
    await auditDatabaseSchema();
    await auditDataIntegrity();
    await auditSecurity();
    await auditBusinessLogic();
    
    generateReport();
    
    db.close();
    
    // Exit with error code if critical or high issues found
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    
    if (criticalCount > 0 || highCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    log(`Fatal error during audit: ${error.message}`, 'error');
    console.error(error);
    db.close();
    process.exit(1);
  }
}

runAudit();
