// API Route: /api/update-password  - Change authenticated user's password
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import {
  validateUserCredentials,
  updateUserPassword,
} from "@/services/userService";

/**
 * POST handler: validate old password and set new password (Authenticated users)
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!("previous_password" in body && "new_password" in body)) {
    return NextResponse.json(
      { message: "Need to provide previous password and new password." },
      { status: 500 },
    );
  }

  const email = session.user.email;
  const currentPassword = body.current_password;
  const newPassword = body.new_password;

  const user = await validateUserCredentials(email, currentPassword);
  if (!user) {
    return NextResponse.json({ message: "Invalid password." }, { status: 401 });
  }

  const status = await updateUserPassword(email, newPassword)
    .then(() => true)
    .catch((err: any) => {
      console.error("Unable to update user password.", err);
      return false;
    });

  if (!status) {
    return NextResponse.json(
      { message: "Unable to update user password." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Updated user password." },
    { status: 200 },
  );
}
