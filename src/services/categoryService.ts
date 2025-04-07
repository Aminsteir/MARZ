import db from "@/db/db";
import { Category } from "@/db/models";

export const searchCategories = async (query: string): Promise<Category[]> => {
  const queryString = `%${query}%`;
  const categories = db
    .prepare("SELECT * FROM Categories WHERE category_name LIKE ?")
    .all(queryString) as Category[];

  return categories.slice(0, 4);
};

export const getChildrenCategories = async (
  parent: string,
): Promise<Category[]> => {
  const categories = db
    .prepare("SELECT * FROM Categories WHERE parent_category = ?")
    .all(parent) as Category[];

  return categories;
};
