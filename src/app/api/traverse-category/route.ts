import { Category } from "@/db/models";
import { getChildrenCategories } from "@/services/categoryService";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parent = searchParams.get("parent");

  const results: string[] = await getChildrenCategories(parent)
    .then((cats) => cats.map((c: Category) => c.category_name))
    .catch((err) => {
      console.error("Error fetching child categories:", err);
      return [];
    });

  return NextResponse.json(
    { message: "Child categories fetched", data: results },
    { status: 200 },
  );
}
