import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "fabnstitch.db");

console.log(`📂 Using SQLite database at: ${dbPath}`);

// Open SQLite database (async, safe)
const sqlite = await open({
  filename: dbPath,
  driver: sqlite3.Database,
});

// Enable foreign keys
await sqlite.exec("PRAGMA foreign_keys = ON");

export const db = {
  query: async (sql, params, callback) => {
    // Handle optional params
    if (typeof params === "function") {
      callback = params;
      params = [];
    }

    if (!Array.isArray(params)) {
      params = [params];
    }

    try {
      const trimmedSql = sql.trim().toUpperCase();

      if (trimmedSql.startsWith("SELECT")) {
        const rows = await sqlite.all(sql, params);
        if (callback) callback(null, rows);
        return rows;
      } else {
        const result = await sqlite.run(sql, params);

        // Mimic MySQL-style result
        const mysqlResult = {
          insertId: result.lastID,
          affectedRows: result.changes,
          changedRows: result.changes,
        };

        if (callback) callback(null, mysqlResult);
        return mysqlResult;
      }
    } catch (err) {
      console.error("❌ SQLite Error:", err.message, "SQL:", sql);
      if (callback) callback(err, null);
      throw err;
    }
  },
};
