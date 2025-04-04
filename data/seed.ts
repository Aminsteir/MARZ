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
  console.log("Deleting current existing database for complete reset...");
  fs.unlinkSync(dbPath);
}

// Init a new SQLite3 Database instance
const db = Database(dbPath);

// For seeding, foreign key constraints are not enforced (child may be inserted before parent)
db.pragma("foreign_keys = OFF");

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
      CREATE TABLE IF NOT EXISTS Address (
        address_id TEXT PRIMARY KEY,
        zipcode TEXT NOT NULL,
        street_num TEXT NOT NULL,
        street_name TEXT NOT NULL,
        FOREIGN KEY (zipcode) REFERENCES Zipcode_Info(zipcode) ON DELETE NO ACTION ON UPDATE NO ACTION
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Zipcode_Info (
        zipcode TEXT PRIMARY KEY,
        city TEXT NOT NULL,
        state TEXT NOT NULL
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Helpdesk (
        email TEXT PRIMARY KEY,
        position TEXT NOT NULL,
        FOREIGN KEY (email) REFERENCES Users(email) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Buyer (
        email TEXT PRIMARY KEY,
        business_name TEXT NOT NULL,
        buyer_address_id TEXT NOT NULL,
        FOREIGN KEY (email) REFERENCES Users(email) ON DELETE CASCADE,
        FOREIGN KEY (buyer_address_id) REFERENCES Address(address_id) ON DELETE NO ACTION ON UPDATE NO ACTION
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Sellers (
        email TEXT PRIMARY KEY,
        business_name TEXT NOT NULL,
        business_address_id TEXT NOT NULL,
        bank_routing_number TEXT NOT NULL,
        bank_account_number TEXT NOT NULL,
        balance REAL NOT NULL,
        FOREIGN KEY (email) REFERENCES Users(email) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (business_address_id) REFERENCES Address(address_id) ON DELETE NO ACTION ON UPDATE NO ACTION
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Requests (
        request_id INTEGER PRIMARY KEY,
        sender_email TEXT NOT NULL,
        helpdesk_staff_email TEXT NOT NULL DEFAULT "helpdeskteam@nittybiz.com",
        request_type TEXT NOT NULL,
        request_desc TEXT NOT NULL,
        request_status INTEGER NOT NULL,
        FOREIGN KEY (sender_email) REFERENCES Users(email) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (helpdesk_staff_email) REFERENCES Helpdesk(email) ON DELETE SET DEFAULT ON UPDATE CASCADE
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Credit_Cards (
        credit_card_num TEXT PRIMARY KEY,
        card_type TEXT NOT NULL,
        expire_month INTEGER NOT NULL,
        expire_year INTEGER NOT NULL,
        security_code INTEGER NOT NULL,
        owner_email TEXT NOT NULL,
        FOREIGN KEY (owner_email) REFERENCES Buyer(email) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Categories (
        category_name TEXT PRIMARY KEY,
        parent_category TEXT,
        FOREIGN KEY (parent_category) REFERENCES Categories(category_name) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Product_Listings (
        seller_email TEXT NOT NULL,
        listing_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        product_title TEXT NOT NULL,
        product_name TEXT NOT NULL,
        product_description TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        product_price REAL NOT NULL,
        status INTEGER NOT NULL,
        PRIMARY KEY (seller_email, listing_id),
        FOREIGN KEY (seller_email) REFERENCES Sellers(email) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (category) REFERENCES Categories(category_name) ON DELETE NO ACTION ON UPDATE CASCADE
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Orders (
        order_id INTEGER PRIMARY KEY,
        seller_email TEXT NOT NULL,
        listing_id INTEGER NOT NULL,
        buyer_email TEXT NOT NULL,
        date TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        payment REAL NOT NULL,
        FOREIGN KEY (seller_email, listing_id) REFERENCES Product_Listings(seller_email, listing_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (buyer_email) REFERENCES Buyer(email) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS Reviews (
        order_id INTEGER PRIMARY KEY,
        review_desc TEXT NOT NULL,
        rating INTEGER NOT NULL,
        FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    console.log("Tables created successfully.");
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
        address.address_id,
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

async function seedRequestsTable() {
  const requestsData = await readCSV(
    path.join(dataDir, "seeding", "Requests.csv"),
  );

  console.log("Inserting Request Records...");

  const insertRequest = db.prepare(
    "INSERT INTO Requests (request_id, sender_email, helpdesk_staff_email, request_type, request_desc, request_status) VALUES (?, ?, ?, ?, ?, ?)",
  );

  const insertMany = db.transaction((requests) => {
    for (const request of requests) {
      insertRequest.run(
        request.request_id,
        request.sender_email,
        request.helpdesk_staff_email,
        request.request_type,
        request.request_desc,
        request.request_status,
      );
    }
  });

  insertMany(requestsData);
}

async function seedCreditCardsTable() {
  const creditCardsData = await readCSV(
    path.join(dataDir, "seeding", "Credit_Cards.csv"),
  );

  console.log("Inserting Credit Card Records...");

  const insertCreditCard = db.prepare(
    "INSERT INTO Credit_Cards (credit_card_num, card_type, expire_month, expire_year, security_code, owner_email) VALUES (?, ?, ?, ?, ?, ?)",
  );

  const insertMany = db.transaction((creditCards) => {
    for (const creditCard of creditCards) {
      insertCreditCard.run(
        creditCard.credit_card_num,
        creditCard.card_type,
        creditCard.expire_month,
        creditCard.expire_year,
        creditCard.security_code,
        creditCard.owner_email,
      );
    }
  });

  insertMany(creditCardsData);
}

async function seedCategoriesTable() {
  const categoriesData = await readCSV(
    path.join(dataDir, "seeding", "Categories.csv"),
  );

  console.log("Inserting Category Records...");

  const insertCategory = db.prepare(
    "INSERT INTO Categories (category_name, parent_category) VALUES (?, ?)",
  );

  const insertMany = db.transaction((categories) => {
    for (const category of categories) {
      insertCategory.run(category.category_name, category.parent_category);
    }
  });

  insertMany(categoriesData);
}

async function seedProductListingsTable() {
  const productListingData = await readCSV(
    path.join(dataDir, "seeding", "Product_Listings.csv"),
  );

  console.log("Inserting Product Listing Records...");

  const insertProductListing = db.prepare(
    "INSERT INTO Product_Listings (seller_email, listing_id, category, product_title, product_name, product_description, quantity, product_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );

  const insertMany = db.transaction((productListings) => {
    for (const productListing of productListings) {
      insertProductListing.run(
        productListing.seller_email,
        productListing.listing_id,
        productListing.category,
        productListing.product_title,
        productListing.product_name,
        productListing.product_description,
        productListing.quantity,
        productListing.product_price,
        productListing.status,
      );
    }
  });

  insertMany(productListingData);
}

async function seedOrdersTable() {
  const ordersData = await readCSV(path.join(dataDir, "seeding", "Orders.csv"));

  console.log("Inserting Orders Records...");

  const insertOrder = db.prepare(
    "INSERT INTO Orders (order_id, seller_email, listing_id, buyer_email, date, quantity, payment) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );

  const insertMany = db.transaction((orders) => {
    for (const order of orders) {
      insertOrder.run(
        order.order_id,
        order.seller_email,
        order.listing_id,
        order.buyer_email,
        order.date,
        order.quantity,
        order.payment,
      );
    }
  });

  insertMany(ordersData);
}

async function seedReviewsTable() {
  const reviewsData = await readCSV(
    path.join(dataDir, "seeding", "Reviews.csv"),
  );

  console.log("Inserting Reviews Records...");

  const insertReview = db.prepare(
    "INSERT INTO Reviews (order_id, review_desc, rating) VALUES (?, ?, ?)",
  );

  const insertMany = db.transaction((reviews) => {
    for (const review of reviews) {
      insertReview.run(review.order_id, review.review_desc, review.rating);
    }
  });

  insertMany(reviewsData);
}

/* Seeds database data from the provided csv files */
async function seedDatabase() {
  try {
    console.log("Seeding database...");

    await seedUserTable(); // takes the most time due to hashing for each user

    await seedZipcodeTable();
    await seedAddressTable();

    await seedHelpdeskTable();
    await seedBuyerTable();
    await seedSellersTable();

    await seedRequestsTable();
    await seedCreditCardsTable();
    await seedCategoriesTable();
    await seedProductListingsTable();
    await seedOrdersTable();
    await seedReviewsTable();

    console.log("Database successfully seeded.");
  } catch (error) {
    console.error("Error:", error);
  }
}

(async () => {
  await createTables(); // Create db tables
  await seedDatabase(); // Seed db with initial data
})();
