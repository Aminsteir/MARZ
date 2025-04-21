import { ProductWithStats } from "@/db/models";
import { getProductsByCategory } from "@/services/productService";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  if (category.trim() === "Root")
    return NextResponse.json(
      { message: "Product listings fetched", data: [] },
      { status: 200 },
    );

  const results: ProductWithStats[] = await getProductsByCategory(
    category,
  ).catch((err: any) => {
    console.error("Error fetching category products", err);
    return [];
  });

  return NextResponse.json(
    { message: "Product listings fetched", data: results },
    { status: 200 },
  );
}
