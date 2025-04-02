import { registerUser } from "@/services/userService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate according to role
    // TODO: Process parsedData based on the role
    switch (body.role) {
      default:
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    await registerUser(); // TODO: Implement registering the user

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
