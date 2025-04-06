import { listProduct } from "@/services/userService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    await listProduct(body);

    return NextResponse.json(
      { message: "Product listed successfully" },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Product listing failed" },
      { status: 500 },
    );
  }
}