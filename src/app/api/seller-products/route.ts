import { Product_Listing, UserRole } from "@/db/models";
import { getProductsBySeller } from "@/services/productService";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role as UserRole) === "Buyer"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const seller_email = session.user.email;

  const products: Product_Listing[] | null = await getProductsBySeller(
    seller_email,
  ).catch((err: any) => {
    console.error("Error fetching products:", err);
    return null;
  });

  if (!products) {
    return NextResponse.json(
      { message: "Error fetching products." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { message: "Fetched successfully", data: products },
    { status: 200 },
  );
}
