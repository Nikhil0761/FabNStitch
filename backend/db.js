import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "fabnstitch.db");

console.log(`📂 Using SQLite database at: ${dbPath}`);

const sqlite = new Database(dbPath); // Options can be added if needed

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

export const db = {
  query: (sql, params, callback) => {
    // Check if params is a callback (optional params)
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }

    // Convert MySQL '?' placeholders to SQLite '?' (better-sqlite3 supports ?, so this is usually fine)
    // However, ensure params are in an array
    if (!Array.isArray(params)) {
      params = [params];
    }

    try {
      const stmt = sqlite.prepare(sql);
      let result;

      // Detect query type to assume .run() or .all()
      // This is a naive heuristic but works for most CRUD
      const trimmedSql = sql.trim().toUpperCase();
      if (trimmedSql.startsWith('SELECT')) {
        result = stmt.all(...params);
        // MySQL returns rows directly
        if (callback) callback(null, result);
        return;
      } else {
        const info = stmt.run(...params);
        // Mimic MySQL result object
        const mysqlResult = {
          insertId: info.lastInsertRowid,
          affectedRows: info.changes,
          changedRows: info.changes
        };
        if (callback) callback(null, mysqlResult);
        return;
      }
    } catch (err) {
      console.error("❌ SQLite Error:", err.message, "SQL:", sql);
      if (callback) callback(err, null);
    }
  }
};
