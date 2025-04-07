import { searchCategories } from "@/services/categoryService";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("query");

    const results = await searchCategories(category);

    return NextResponse.json(
      { message: "Categories Fetched", data: results },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Category Search failed" },
      { status: 500 },
    );
  }
}
