import { addProductToCart } from "@/services/cartService";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { UserRole } from "@/db/models";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role as UserRole) !== "Buyer"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const buyer_email = session.user.email;
  const body = await req.json();

  const seller_email = body.seller_email;
  const listing_id = body.listing_id;
  const quantity = 1;

  const result = await addProductToCart(
    buyer_email,
    seller_email,
    listing_id,
    quantity,
  )
    .then(() => {
      return { msg: "Cart updated successfully", status: true };
    })
    .catch((err) => {
      console.error("Error adding product to cart:", err);
      return { msg: err.message, status: false };
    });
  if (result.status) {
    return NextResponse.json({ message: result.msg }, { status: 201 });
  }

  return NextResponse.json({ message: result.msg }, { status: 500 });
}
