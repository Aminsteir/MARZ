import { listProduct } from "@/services/productService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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
