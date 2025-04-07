import db from "@/db/db";
import { Category } from "@/db/models";

export const searchCategories = async (query: string): Promise<string[]> => {
  const queryString = `%${query}%`;
  const categories = db
    .prepare("SELECT * FROM Categories WHERE category_name LIKE ?")
    .all(queryString) as Category[];

  return categories.map((cat) => cat.category_name).slice(0, 4);
};
