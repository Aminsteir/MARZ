// API Route: /api/add-card  - Add a credit card for authenticated buyers
import { addCreditCard } from "@/services/userService";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Credit_Card, UserRole } from "@/db/models";

/**
 * POST handler: add credit card for authenticated buyer (Buyer role required)
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // check if the user is a Buyer
  if (
    !session ||
    !session.user ||
    (session.user.role as UserRole) !== "Buyer"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // get Buyer's email
  const email = session.user.email;
  const body = await req.json();

  // get the inputted credit card information
  const card: Credit_Card = {
    credit_card_num: body.credit_card_num,
    expire_month: body.expire_month,
    expire_year: body.expire_year,
    security_code: body.security_code,
    card_type: body.card_type,
    owner_email: email,
  };

  // add the credit card to the user's account
  const status = await addCreditCard(card)
    .then(() => true)
    .catch((err) => {
      console.error("Error adding card:", err);
      return false;
    });

  // added card successfully
  if (status) {
    return NextResponse.json(
      { message: "Card added successfully", data: card },
      { status: 201 },
    );
  }
  
  // failed to add card
  return NextResponse.json({ message: "Failed to add card" }, { status: 500 });
}
