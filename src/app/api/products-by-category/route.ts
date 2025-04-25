import { ProductWithStats } from "@/db/models";
import {
  getPromotedProducts,
  getProductsByCategory,
} from "@/services/productService";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  let results: ProductWithStats[];
  if (category.trim() === "Root") {
    results = await getPromotedProducts().catch((err: any) => {
      return [];
    });
  } else {
    results = await getProductsByCategory(category).catch((err: any) => {
      return [];
    });
  }

  return NextResponse.json(
    { message: "Product listings fetched", data: results },
    { status: 200 },
  );
}
