// API Route: /api/get-cart  - Retrieve shopping cart for authenticated buyer
import { CartItem, UserRole } from "@/db/models";
import { getCart } from "@/services/cartService";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * GET handler: fetch shopping cart items (Buyer role required)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role as UserRole) === "Seller"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const seller_email = session.user.email;

  const cart: CartItem[] | null = await getCart(seller_email).catch(
    (err: any) => {
      console.error("Error fetching cart:", err);
      return null;
    },
  );

  if (!cart) {
    return NextResponse.json(
      { message: "Error fetching cart." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { message: "Fetched successfully", data: cart },
    { status: 200 },
  );
}
