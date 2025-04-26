// API Route: /api/register  - Register a new user account
import { registerUser } from "@/services/userService";
import { NextResponse } from "next/server";

/**
 * POST handler: create user account
 */
export async function POST(req: Request) {
  const body = await req.json();

  const status = await registerUser(body)
    .then(() => true)
    .catch((err) => {
      console.error("Error registering user:", err);
      return false;
    });

  if (status) {
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 },
    );
  }

  return NextResponse.json(
    { message: "Failed to register user" },
    { status: 500 },
  );
}
