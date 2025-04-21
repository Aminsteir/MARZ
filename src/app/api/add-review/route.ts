import { addReview } from "@/services/reviewService";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Review, UserRole } from "@/db/models";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role as UserRole) !== "Buyer"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const buyer_email = session.user.email;
  const body = await req.json();

  const review: Review = {
    order_id: body.order_id,
    rating: body.rating,
    review_desc: body.review_desc,
  };

  let message = "Review added successfully";

  const status = await addReview(buyer_email, review)
    .then(() => true)
    .catch((err) => {
      console.log("Error adding review:", err);
      message = err.message || "Failed to add review";
      return false;
    });

  if (status) {
    return NextResponse.json({ message }, { status: 201 });
  }

  return NextResponse.json({ message }, { status: 500 });
}
