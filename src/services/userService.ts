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
 */
export const registerUser = async (): Promise<User | null> => {
  // TODO: Implement registering the user
  return null;
};
