import { updateProduct } from "@/services/productService";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { UserRole } from "@/db/models";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role as UserRole) === "Buyer"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const sellerEmail = body.seller_email;

  // check if the user is the owner of the listing
  if (session.user.email !== sellerEmail && session.user.role !== "Helpdesk") {
    return NextResponse.json(
      { message: "You are not authorized to edit this listing" },
      { status: 403 },
    );
  }

  const status = await updateProduct(body)
    .then(() => true)
    .catch((err: any) => {
      console.error("Error editing product:", err);
      return false;
    });

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
