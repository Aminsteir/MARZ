// API Route: /api/search-products  - Search product listings by text query
import { ProductWithStats } from "@/db/models";
import { searchProducts } from "@/services/productService";
import { NextResponse } from "next/server";

/**
 * GET handler: product search based on query parameter
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { message: "Missing query parameter", data: [] },
      { status: 400 },
    );
  }

  const results: ProductWithStats[] = await searchProducts(query).catch(
    (err) => {
      console.error("Error searching products", err);
      return [];
    },
  );

  return NextResponse.json(
    { message: "Searched products", data: results },
    { status: 200 },
  );
}
