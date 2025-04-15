import { ProductOrder } from "@/services/orderService"; // Import the new type
import { getOrdersByBuyer } from "@/services/orderService";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const buyer_email = session.user.email;

  const productOrders: ProductOrder[] | null = await getOrdersByBuyer(buyer_email).catch((err: any) => {
    console.error("Error fetching orders:", err);
    return null;
  });

  if (!productOrders) {
    return NextResponse.json(
      { message: "Error fetching orders." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Fetched successfully", data: productOrders },
    { status: 200 },
  );
}
