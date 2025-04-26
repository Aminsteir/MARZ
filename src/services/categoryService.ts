// Service functions for retrieving category data

import db from "@/db/db";
import { Category } from "@/db/models";

/**
 * Search for categories matching the query (returns top 4 results)
 */
export const searchCategories = async (query: string): Promise<Category[]> => {
  const queryString = `%${query}%`;
  const categories = db
    .prepare("SELECT * FROM Categories WHERE category_name LIKE ?")
    .all(queryString) as Category[];

  return categories.slice(0, 4);
};

/**
 * Get subcategories under a specified parent category
 */
export const getChildrenCategories = async (
  parent: string,
): Promise<Category[]> => {
  const categories = db
    .prepare("SELECT * FROM Categories WHERE parent_category = ?")
    .all(parent) as Category[];

  return categories;
};
