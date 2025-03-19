import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import stripBom from "strip-bom-stream";
import bcrypt from "bcryptjs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "marz.db");
const db = Database(dbPath);

// Read CSV
async function readCSV(filePath: string) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(stripBom())
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

async function createTables() {
  try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL
    )
  `);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    const users = await readCSV(path.join(dataDir, "seeding", "Users.csv"));

    const salt = await bcrypt.genSalt(10);
    console.log("Salt (for all users):", salt);

    console.log("Inserting Users...");
    const insertUser = db.prepare(
      "INSERT INTO users (email, password) VALUES (?, ?)",
    );

    const insertMany = db.transaction((users) => {
      for (const user of users) {
        insertUser.run(user.email, bcrypt.hashSync(user.password, salt));
      }
    });

    insertMany(users);
    console.log("Database successfully seeded.");
  } catch (error) {
    console.error("Error:", error);
  }
}

createTables(); // Create tables
seedDatabase(); // Run seeding function
