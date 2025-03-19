import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export interface User {
  email: string;
  password: string;
}

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "marz.db");
const db = Database(dbPath);

// Initialize database tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS Users (
    email TEXT PRIMARY KEY,
    password TEXT NOT NULL
  )
`);

export default db;
