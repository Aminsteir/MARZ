import db from "@/db/db";
import { User } from "@/db/models";
import bcrypt from "bcryptjs";

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
 * @param email - the email of the user
 * @param password - the password of the user
 * @param role - the role of the user (Buyer, Seller, HelpDesk)
 * @returns the newly created user object if successful, otherwise null
 */
export const registerUser = async (
  email: string,
  password: string,
  role: string
): Promise<User | null> => {
  // Check if user already exists
  if (getUserByEmail(email)) {
    return null; // User already exists
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the new user into the database
  const stmt = db.prepare(
    "INSERT INTO Users (email, password, role) VALUES (?, ?, ?)"
  );
  const result = stmt.run(email, hashedPassword, role);

  if (result.changes === 1) {
    return getUserByEmail(email); // Return the newly created user
  }

  return null;
};
