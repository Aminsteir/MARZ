// API Route: /api/seller-promoted-products  - Retrieve promoted listings for seller
import { getPromotedProductsBySeller } from "@/services/productService";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { UserRole } from "@/db/models";

/**
 * GET handler: fetch promoted products for authenticated seller (Seller role required)
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role as UserRole) !== "Seller"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const sellerEmail = session.user.email as string;

  try {
    const promotedProducts = await getPromotedProductsBySeller(sellerEmail);
    return NextResponse.json(
      { 
        message: "Promoted products retrieved successfully", 
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