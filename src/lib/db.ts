import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export interface User {
  email: string;
  password: string;
}

// Make sure the data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Define the path to the database file, creating the database if it doesn't exist
const dbPath = path.join(dataDir, "marz.db");
const db = Database(dbPath);

// Initialize database tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS Users (
    email TEXT PRIMARY KEY,
    password TEXT NOT NULL
  )
`);

// Export the database instance so that other modules can use it
export default db;
