const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../../incidents.db"));

db.pragma("journal_mode = WAL"); // improves read performance for concurrent access
db.pragma("foreign_keys = ON"); // SQLite disables foreign key enforcement by default

db.exec(`
  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    impact TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'investigating',
    started_at TEXT NOT NULL,
    resolved_at TEXT,
    affected_service_ids TEXT NOT NULL DEFAULT '[]' -- stored as JSON array string, e.g. "[1, 3, 5]"
  );

  CREATE TABLE IF NOT EXISTS incident_updates (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL REFERENCES incidents(id),
    status TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS internal_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id TEXT NOT NULL REFERENCES incidents(id),
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

module.exports = db;
