// API Route: /api/list-product  - Create new product listing
import { listProduct } from "@/services/productService";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { UserRole } from "@/db/models";

/**
 * POST handler: add a new product listing (Seller role required)
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role as UserRole) !== "Seller"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const status = await listProduct(body)
    .then(() => true)
    .catch((err) => {
      console.error("Error listing product:", err);
      return false;
    });

  if (status) {
    return NextResponse.json(
      { message: "Product listed successfully" },
      { status: 201 },
    );
  }

  return NextResponse.json(
    { message: "Failed to list product" },
    { status: 500 },
  );
}
