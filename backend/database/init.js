import { db } from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ============================================
   Database Initialization
============================================ */
export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {

    // SQLite: Initialize Schema from SQL file
    const schemaPath = path.join(__dirname, "schema_sqlite.sql");
    try {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

      db.query("BEGIN TRANSACTION", [], (err) => {
        if (err) {
          console.error("Failed to start transaction", err);
          return reject(err);
        }

        // Using our wrapper's query (which is normally one stmt per call), but let's loop
        // Since db.js is sync for sqlite under the hood (mostly), we can do this.
        // But db.js wrapper takes a callback.

        // Actually, better-sqlite3 specifically supports exec for multiple statements.
        // But our wrapper hides 'sqlite' instance. 
        // Let's use db.query for each statement.

        let p = Promise.resolve();
        statements.forEach(stmt => {
          p = p.then(() => new Promise((res, rej) => {
            db.query(stmt, [], (err) => {
              if (err) rej(err);
              else res();
            });
          }));
        });

        p.then(() => {
          db.query("COMMIT", [], (err) => {
            if (err) reject(err);
            else {
              console.log("✅ SQLite Schema initialized successfully");
              resolve();
            }
          });
        }).catch(err => {
          db.query("ROLLBACK", [], () => reject(err));
        });
      });

    } catch (err) {
      console.error("Failed to read schema file", err);
      reject(err);
    }
  });
};
