import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import stripBom from "strip-bom-stream";
import bcrypt from "bcryptjs";

// Define directory where the database and seed data are stored
const dataDir = path.join(process.cwd(), "data");
// Ensure that the data directory exists, create if necessary
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Define database filepath
const dbPath = path.join(dataDir, "marz.db");

// Delete existing database file to reset everything
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Init a new SQLite3 Database instance
const db = Database(dbPath);

/* Read CSV */
async function readCSV(filePath: string) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(stripBom()) // remove byte order mark if it exists
      .pipe(csvParser()) // parse the csv
      .on("data", (data) => results.push(data)) // collect parsed rows
      .on("end", () => resolve(results)) // resolve w/ collected data
      .on("error", (error) => reject(error)); // reject on error
  });
}

/* Crates necessary db tables if they don't exist yet */
async function createTables() {
  try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL
    )
  `);
  } catch (error) {
    console.error("Error:", error);
  }
}

/* Seeds database w/ initial usr data from csv file */
async function seedDatabase() {
  try {
    console.log("Seeding database...");
    // Read usr data from Users.csv
    const users = await readCSV(path.join(dataDir, "seeding", "Users.csv"));
    // Generate salt for hasing pws
    const salt = await bcrypt.genSalt(10);
    console.log("Salt (for all users):", salt);
    // Inserting usrs
    console.log("Inserting Users...");
    const insertUser = db.prepare(
      "INSERT INTO users (email, password) VALUES (?, ?)",
    );
    // Using transaction to insert multiple users at one go
    const insertMany = db.transaction((users) => {
      for (const user of users) {
        // Hashing usr pw using generated salt and inserting it into the db
        insertUser.run(user.email, bcrypt.hashSync(user.password, salt));
      }
    });

    // Executing transcation to insert all usrs
    insertMany(users);
    console.log("Database successfully seeded.");
  } catch (error) {
    console.error("Error:", error);
  }
}

createTables(); // Create tables
seedDatabase(); // Run seeding function
