import { getPromotedProducts } from "@/services/productService"; 
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const promotedProducts = await getPromotedProducts();
    return NextResponse.json(
      { 
        message: "All promoted products retrieved successfully", 
        data: promotedProducts 
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error retrieving promoted products:", err);
    return NextResponse.json(
      { message: "Failed to retrieve promoted products" },
      { status: 500 }
    );
  }
}
