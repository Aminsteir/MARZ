import db from "@/db/db";
import { Address, User, ZipcodeInfo, UserRole } from "@/db/models";
import bcrypt from "bcryptjs";
import { v4 } from "uuid";

/*
 * Get a user by email
 * @param email - the email of the user
 * @returns the user object if found, otherwise undefined
 */
export const getUserByEmail = (email: string): User | undefined => {
  return db.prepare("SELECT * FROM Users WHERE email = ?").get(email) as
    | User
    | undefined;
};

/*
 * Validate user credentials
 * @param email - the email of the user
 * @param password - the password of the user
 * @returns the user object if the credentials are valid, otherwise undefined
 */
export const validateUserCredentials = async (
  email: string,
  password: string,
): Promise<User | undefined> => {
  const user = getUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return null;
  }

  return user;
};

/*
 * Register a new user
 */
export const registerUser = async (userInfo: any): Promise<User | null> => {
  const { email, password, role, ...additionalInfo } = userInfo;

  const existingUser = getUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user: User = {
    email,
    password: hashedPassword,
  };

  // Insert the new user into the database
  db.prepare("INSERT INTO Users (email, password) VALUES (?, ?)").run(
    email,
    hashedPassword,
  );

  // Insert additional information based on the role
  if (role === "Buyer") {
    const zipInfo: ZipcodeInfo = {
      zipcode: additionalInfo.address.zipcode,
      city: additionalInfo.address.city,
      state: additionalInfo.address.state,
    };

    const address: Address = {
      address_id: v4(),
      zipcode: zipInfo.zipcode,
      street_num: additionalInfo.address.street_num,
      street_name: additionalInfo.address.street_name,
    };

    const retrievedZip = db
      .prepare("SELECT zipcode FROM Zipcode_Info WHERE zipcode = ?")
      .get(zipInfo.zipcode);
    if (!retrievedZip) {
      db.prepare(
        "INSERT INTO Zipcode_Info (zipcode, city, state) VALUES (?, ?, ?)",
      ).run(zipInfo.zipcode, zipInfo.city, zipInfo.state);
    }

    db.prepare(
      "INSERT INTO Address (address_id, zipcode, street_num, street_name) VALUES (?, ?, ?, ?)",
    ).run(
      address.address_id,
      address.zipcode,
      address.street_num,
      address.street_name,
    );

    db.prepare(
      "INSERT INTO Buyer (email, business_name, buyer_address_id) VALUES (?, ?, ?)",
    ).run(email, additionalInfo.business_name, address.address_id);
  } else if (role === "HelpDesk") {
    db.prepare("INSERT INTO Helpdesk (email, position) VALUES (?, ?)").run(
      email,
      additionalInfo.position,
    );
  } else if (role === "Seller") {
    const zipInfo: ZipcodeInfo = {
      zipcode: additionalInfo.business_address.zipcode,
      city: additionalInfo.business_address.city,
      state: additionalInfo.business_address.state,
    };

    const address: Address = {
      address_id: v4(),
      zipcode: zipInfo.zipcode,
      street_num: additionalInfo.business_address.street_num,
      street_name: additionalInfo.business_address.street_name,
    };

    const retrievedZip = db
      .prepare("SELECT zipcode FROM Zipcode_Info WHERE zipcode = ?")
      .get(zipInfo.zipcode);
    if (!retrievedZip) {
      db.prepare(
        "INSERT INTO Zipcode_Info (zipcode, city, state) VALUES (?, ?, ?)",
      ).run(zipInfo.zipcode, zipInfo.city, zipInfo.state);
    }

    db.prepare(
      "INSERT INTO Address (address_id, zipcode, street_num, street_name) VALUES (?, ?, ?, ?)",
    ).run(
      address.address_id,
      address.zipcode,
      address.street_num,
      address.street_name,
    );

    db.prepare(
      "INSERT INTO Sellers (email, business_name, business_address_id, bank_routing_number, bank_account_number, balance) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(
      email,
      additionalInfo.business_name,
      address.address_id,
      additionalInfo.bank_routing_number,
      additionalInfo.account_number,
      0,
    );
  }

  return user;
};

export const getUserRole = async (email: string): Promise<UserRole> => {
  const helpdesk = db
    .prepare("SELECT * FROM Helpdesk WHERE email = ?")
    .get(email);

  if (helpdesk) return "Helpdesk";

  const buyer = db.prepare("SELECT * FROM Buyer WHERE email = ?").get(email);

  if (buyer) return "Buyer";

  const seller = db.prepare("SELECT * FROM Sellers WHERE email = ?").get(email);

  if (seller) return "Seller";

  return null;
};

export const searchCategories = async(query: string): Promise<string[]> =>{
  const categories = db.prepare("SELECT category_name FROM Categories").all() as { category_name: string }[]

  const queryWords = query.toLowerCase().trim().split(/\s+/);

  const matches = categories
    .filter((category) =>
      queryWords.every((word) =>
        category.category_name.toLowerCase().includes(word)
      )
    )
    .map((category) => category.category_name);
    if (matches.length < 4) {
      const remaining = categories
        .filter((category) => !matches.includes(category.category_name))
        .map((category) => category.category_name)
        .slice(0, 4 - matches.length);
  
      return [...matches, ...remaining];
    }
    return matches.slice(0, 4);
  
  // Old code for searching by edit distance
  const calculateEditDistance = (a: string, b: string): number => {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] =
          a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1]
            : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[a.length][b.length] / (a.length + b.length);
  };

  const distances = categories.map((category) => ({
    name: category.category_name,
    distance: calculateEditDistance(query, category.category_name),
  }));
  

  return distances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4)
    .map((item) => item.name);
}

export const listProduct = async(listingInfo: any) =>{
  const listing_id = (db.prepare(
    "SELECT COALESCE(MAX(listing_id), 0) + 1 AS next_id FROM Product_Listings WHERE seller_email = ?"
  ).get(listingInfo.email) as {next_id: number}).next_id;

  try{
  db.prepare("INSERT INTO Product_Listings (seller_email, listing_id, category, product_title, product_name, product_description, quantity, product_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    listingInfo.email,
    listing_id,
    listingInfo.category,
    listingInfo.title,
    listingInfo.name,
    listingInfo.description,
    parseInt(listingInfo.quantity),
    parseInt(listingInfo.price),
    1
  )

}
  catch(err){
    console.log("Database Error:", err.message);
  }
}