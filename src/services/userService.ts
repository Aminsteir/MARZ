import db from "@/db/db";
import { Address, User, ZipcodeInfo } from "@/db/models";
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
  const { email, password, role, additionalInfo } = userInfo;

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
    const { business_name, addressRaw } = additionalInfo;
    const { zipcode, city, state, street_num, street_name } = addressRaw;

    const zipInfo: ZipcodeInfo = {
      zipcode,
      city,
      state,
    };

    const address: Address = {
      address_id: v4(),
      zipcode,
      street_num,
      street_name,
    };

    db.prepare(
      "INSERT INTO Zipcode_Info (zipcode, city, state) VALUES (?, ?, ?)",
    ).run(zipInfo.zipcode, zipInfo.city, zipInfo.state);

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
    ).run(email, business_name, address.address_id);
  } else if (role === "HelpDesk") {
    const { position } = additionalInfo;

    db.prepare("INSERT INTO Helpdesk (email, position) VALUES (?, ?)").run(
      email,
      position,
    );
  } else if (role === "Seller") {
    const {
      business_name,
      business_address,
      bank_routing_number,
      account_number,
      balance,
    } = additionalInfo;
    const { zipcode, city, state, street_num, street_name } = business_address;

    const zipInfo: ZipcodeInfo = {
      zipcode,
      city,
      state,
    };

    const address: Address = {
      address_id: v4(),
      zipcode,
      street_num,
      street_name,
    };

    db.prepare(
      "INSERT INTO Zipcode_Info (zipcode, city, state) VALUES (?, ?, ?)",
    ).run(zipInfo.zipcode, zipInfo.city, zipInfo.state);

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
      business_name,
      address.address_id,
      bank_routing_number,
      account_number,
      balance,
    );
  }

  return user;
};

export const getUserRole = async (email: string): Promise<string | null> => {
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
