import { promoteProduct } from "@/services/productService";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { UserRole } from "@/db/models";

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
  body.seller_email = session.user.email;

  try {
    const result = await promoteProduct(body);
    return NextResponse.json(
      { 
        message: "Product promoted successfully",
        data: result
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error promoting product:", err);
    
    // Handle specific error messages
    if (err.message === "Insufficient balance for promotion") {
      return NextResponse.json(
        { message: err.message, errorType: "INSUFFICIENT_BALANCE" },
        { status: 400 }
      );
    } else if (err.message === "Product not found") {
      return NextResponse.json(
        { message: err.message, errorType: "PRODUCT_NOT_FOUND" },
        { status: 404 }
      );
    } else if (err.message === "Seller not found") {
      return NextResponse.json(
        { message: err.message, errorType: "SELLER_NOT_FOUND" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Failed to promote product", errorType: "UNKNOWN_ERROR" },
      { status: 500 }
    );
  }
}