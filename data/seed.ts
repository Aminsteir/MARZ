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

/* Creates necessary db tables if they don't exist yet */
async function createTables() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS Users (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Helpdesk (
        email TEXT PRIMARY KEY,
        position TEXT NOT NULL,
        FOREIGN KEY (email) REFERENCES Users(email)
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Buyer (
        email TEXT PRIMARY KEY,
        business_name TEXT NOT NULL,
        buyer_address_id INTEGER,
        FOREIGN KEY (email) REFERENCES Users(email),
        FOREIGN KEY (buyer_address_id) REFERENCES Address(address_ID)
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Sellers (
        email TEXT PRIMARY KEY,
        business_name TEXT NOT NULL,
        business_address_id INTEGER,
        bank_routing_number TEXT NOT NULL,
        bank_account_number TEXT NOT NULL,
        balance REAL NOT NULL,
        FOREIGN KEY (email) REFERENCES Users(email),
        FOREIGN KEY (business_address_id) REFERENCES Address(address_ID)
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Address (
        address_ID INTEGER PRIMARY KEY,
        zipcode TEXT NOT NULL,
        street_num TEXT NOT NULL,
        street_name TEXT NOT NULL,
        FOREIGN KEY (zipcode) REFERENCES Zipcode_Info(zipcode)
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Zipcode_Info (
        zipcode TEXT PRIMARY KEY,
        city TEXT NOT NULL,
        state TEXT NOT NULL
      );
    `);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function seedUserTable() {
  const users = await readCSV(path.join(dataDir, "seeding", "Users.csv"));
  const salt = await bcrypt.genSalt(10);

  console.log("Inserting Users...");

  const insertUser = db.prepare(
    "INSERT INTO users (email, password) VALUES (?, ?)",
  );

  const insertMany = db.transaction((users) => {
    for (const user of users) {
      // Hash user password using generated salt and inserting it into the db
      insertUser.run(user.email, bcrypt.hashSync(user.password, salt));
    }
  }); // Using transaction to insert multiple users at one go

  insertMany(users); // Executing transcation to insert all users
}

async function seedHelpdeskTable() {
  const helpdeskData = await readCSV(
    path.join(dataDir, "seeding", "Helpdesk.csv"),
  );

  console.log("Inserting Helpdesk Records...");

  const insertHelpdesk = db.prepare(
    "INSERT INTO Helpdesk (email, position) VALUES (?, ?)",
  );

  const insertMany = db.transaction((helpdeskUsers) => {
    for (const helpdeskUser of helpdeskUsers) {
      insertHelpdesk.run(helpdeskUser.email, helpdeskUser.position);
    }
  });

  insertMany(helpdeskData);
}

async function seedBuyerTable() {
  const buyersData = await readCSV(path.join(dataDir, "seeding", "Buyers.csv"));

  console.log("Inserting Buyer Records...");

  const insertBuyers = db.prepare(
    "INSERT INTO Buyer (email, business_name, buyer_address_id) VALUES (?, ?, ?)",
  );

  const insertMany = db.transaction((buyers) => {
    for (const buyer of buyers) {
      insertBuyers.run(
        buyer.email,
        buyer.business_name,
        buyer.buyer_address_id,
      );
    }
  });

  insertMany(buyersData);
}

async function seedSellersTable() {
  const sellersData = await readCSV(
    path.join(dataDir, "seeding", "Sellers.csv"),
  );

  console.log("Inserting Sellers Records...");

  const insertSellers = db.prepare(
    "INSERT INTO Sellers (email, business_name, business_address_id, bank_routing_number, bank_account_number, balance) VALUES (?, ?, ?, ?, ?, ?)",
  );

  const insertMany = db.transaction((sellers) => {
    for (const seller of sellers) {
      insertSellers.run(
        seller.email,
        seller.business_name,
        seller.business_address_id,
        seller.bank_routing_number,
        seller.bank_account_number,
        seller.balance,
      );
    }
  });

  insertMany(sellersData);
}

async function seedAddressTable() {
  const addressData = await readCSV(
    path.join(dataDir, "seeding", "Address.csv"),
  );

  console.log("Inserting Address Records...");

  const insertAddress = db.prepare(
    "INSERT INTO Address (address_ID, zipcode, street_num, street_name) VALUES (?, ?, ?, ?)",
  );

  const insertMany = db.transaction((addresses) => {
    for (const address of addresses) {
      insertAddress.run(
        address.address_ID,
        address.zipcode,
        address.street_num,
        address.street_name,
      );
    }
  });

  insertMany(addressData);
}

async function seedZipcodeTable() {
  const zipcodeData = await readCSV(
    path.join(dataDir, "seeding", "Zipcode_Info.csv"),
  );

  console.log("Inserting Zipcode_Info Records...");

  const insertZipcode = db.prepare(
    "INSERT INTO Zipcode_Info (zipcode, city, state) VALUES (?, ?, ?)",
  );

  const insertMany = db.transaction((zipcodes) => {
    for (const zipcode of zipcodes) {
      insertZipcode.run(zipcode.zipcode, zipcode.city, zipcode.state);
    }
  });

  insertMany(zipcodeData);
}

/* Seeds database w/ initial usr data from csv file */
async function seedDatabase() {
  try {
    console.log("Seeding database...");

    await seedUserTable();
    await seedHelpdeskTable();
    await seedBuyerTable();
    await seedSellersTable();
    await seedAddressTable();
    await seedZipcodeTable();

    console.log("Database successfully seeded.");
  } catch (error) {
    console.error("Error:", error);
  }
}

createTables(); // Create tables
seedDatabase(); // Run seeding function
