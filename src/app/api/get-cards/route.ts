import { Credit_Card, UserRole } from "@/db/models";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getCreditCards } from "@/services/userService";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role as UserRole) !== "Buyer"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const buyer_email = session.user.email;

  const cards: Credit_Card[] | null = await getCreditCards(buyer_email).catch(
    (err: any) => {
      console.error("Error fetching cards:", err);
      return null;
    },
  );

  if (!cards) {
    return NextResponse.json(
      { message: "Error fetching cards." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { message: "Fetched successfully", data: cards },
    { status: 200 },
  );
}
