import { addReview } from "@/services/reviewService";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Review, UserRole } from "@/db/models";

// Method POST: if successful, add a review from a Buyer; else, show an error message
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

  // get Buyer email
  const buyer_email = session.user.email;
  const body = await req.json();

  // get the inputted review submission
  const review: Review = {
    order_id: body.order_id,
    rating: body.rating,
    review_desc: body.review_desc,
  };

  // success message
  let message = "Review added successfully";

  // attempt to add review
  const status = await addReview(buyer_email, review)
    .then(() => true)
    .catch((err) => {
      console.log("Error adding review:", err);
      message = err.message || "Failed to add review";
      return false;
    });

  // return status of adding the review via the message (success or failure) assigned above
  if (status) {
    return NextResponse.json({ message }, { status: 201 });
  }

  return NextResponse.json({ message }, { status: 500 });
}
