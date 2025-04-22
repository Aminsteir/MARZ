import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { confirmCheckout } from "@/services/checkoutService";

// Method POST: if successful, allow checkout page the checkout button is clicked from the shopping cart; else, show an error message
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // check if the user exists (should be a Buyer)
    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // get Buyer email
    const buyerEmail = session.user.email;

    // retrieve status of the confirmCheckout() method and return message accordingly
    try {
        const orderIds = await confirmCheckout(buyerEmail);
        return NextResponse.json({ message: "Checkout successful", orderIds });
    } catch (error) {
        console.error("Checkout failed:", error);
        return NextResponse.json(
        { error: (error as Error).message || "Unknown error" },
        { status: 500 },
        );
    }
}
