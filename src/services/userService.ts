import db from "@/db/db";
import { Address, User, ZipcodeInfo, UserRole, Credit_Card } from "@/db/models";
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

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
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

  const hashedPassword = await hashPassword(password);

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

export const updateUserPassword = async (
  email: string,
  newPassword: string,
): Promise<void> => {
  const hashedPassword = await hashPassword(newPassword);
  db.prepare("UPDATE Users SET password = ? WHERE email = ?").run(
    hashedPassword,
    email,
  );
};

export const getCreditCards = async (email: string): Promise<Credit_Card[]> => {
  const cards = db
    .prepare("SELECT * FROM Credit_Cards WHERE owner_email = ?")
    .all(email) as Credit_Card[];

  return cards;
};

export const addCreditCard = async (card: Credit_Card): Promise<void> => {
  const existingCard = db
    .prepare("SELECT * FROM Credit_Cards WHERE credit_card_num = ?")
    .get(card.credit_card_num) as Credit_Card;

  if (existingCard) {
    throw new Error("Card already exists");
  }

  db.prepare(
    "INSERT INTO Credit_Cards (credit_card_num, card_type, expire_month, expire_year, security_code, owner_email) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(
    card.credit_card_num,
    card.card_type,
    card.expire_month,
    card.expire_year,
    card.security_code,
    card.owner_email,
  );
};
