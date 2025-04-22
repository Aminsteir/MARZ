import { updateProduct } from "@/services/productService";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { UserRole } from "@/db/models";

// Method POST: if successful, the Seller editted a Product listing; else, show an error message
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // check if the user is Seller; if not, throw unauthoritzed error message since only Sellers can edit products
  if (
    !session ||
    !session.user ||
    (session.user.role as UserRole) === "Buyer"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // get Seller email
  const sellerEmail = body.seller_email;

  // check if the user is the owner of the listing
  if (session.user.email !== sellerEmail && session.user.role !== "Helpdesk") {
    return NextResponse.json(
      { message: "You are not authorized to edit this listing" },
      { status: 403 },
    );
  }

  // getting information and status of the updateProduct() method
  const status = await updateProduct(body)
    .then(() => true)
    .catch((err: any) => {
      console.error("Error editing product:", err);
      return false;
    });

  // get status and message of the action
  if (status) {
    return NextResponse.json(
      { message: "Product listed edited successfully" },
      { status: 201 },
    );
  }

  return NextResponse.json(
    { message: "Failed to edit product listing" },
    { status: 500 },
  );
}
