import { registerUser } from "@/services/userService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await registerUser(body); // Register the user

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Registration failed" },
      { status: 500 },
    );
  }
}
