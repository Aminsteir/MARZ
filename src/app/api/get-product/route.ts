import { Product_Listing } from "@/db/models";
import { getProduct } from "@/services/productService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const seller_email = searchParams.get("sellerEmail");
  const listing_id = searchParams.get("listingId");

  if (!seller_email || !listing_id) {
    return NextResponse.json(
      { message: "Missing seller email or listing ID" },
      { status: 400 },
    );
  }

  const product: Product_Listing | null = await getProduct(
    seller_email,
    +listing_id,
  ).catch((err: any) => {
    console.error("Error fetching product:", err);
    return null;
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(
    { message: "Product fetched successfully", data: product },
    { status: 200 },
  );
}
