import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { confirmCheckout } from "@/services/checkoutService";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buyerEmail = session.user.email;

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
