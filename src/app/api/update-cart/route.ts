import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { updateCart } from "@/services/cartService";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  console.log(body, typeof body);

  if (
    !("seller_email" in body) ||
    !("listing_id" in body) ||
    !("quantity" in body)
  ) {
    return NextResponse.json(
      { message: "Need to pass product listing and quantity." },
      { status: 500 },
    );
  }

  const buyer_email = session.user.email;
  const seller_email = body?.seller_email;
  const listing_id = Math.floor(+body?.listing_id);

  // update-cart either deletes the product from the cart or updates the quantity (depending on quantity === 0)
  const newQuantity = Math.floor(+body?.quantity);

  const status: boolean = await updateCart(
    buyer_email,
    seller_email,
    listing_id,
    newQuantity,
  )
    .then(() => true)
    .catch((err: any) => {
      console.error("Unable to update product quantity.", err);
      return false;
    });

  if (!status) {
    return NextResponse.json(
      { message: "Unable to update product quantity." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { message: "Updated product quantity." },
    { status: 200 },
  );
}
