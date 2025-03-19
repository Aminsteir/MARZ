import db, { User } from "@/lib/db";
import bcrypt from "bcryptjs";

export const getUserByEmail = (email: string): User | undefined => {
  return db.prepare("SELECT * FROM Users WHERE email = ?").get(email) as
    | User
    | undefined;
};

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
