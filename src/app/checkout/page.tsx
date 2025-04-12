"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { UserRole, CartItem, Shopping_Cart } from "@/db/models";
import { Minus, Plus, Trash, Star } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

export default function Checkout() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalCost, setTotalCost] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && (session.user.role as UserRole) !== "Buyer") {
      router.push("/");
      return;
    }
    if (!session) return;

    async function loadCart() {
      const response = await fetch("/api/get-cart");
      if (!response.ok) {
        console.error("Failed to fetch cart");
        setLoading(false);
        return;
      }

      const data: CartItem[] = (await response.json()).data;
      setCart(data);
      setLoading(false);
    }

    loadCart();
  }, [session, router]);

  useEffect(() => {
    if (!cart) return;
    const total = cart
      .reduce(
        (acc, item) => acc + item.product.product_price * item.quantity,
        0,
      )
      .toFixed(2);
    setTotalCost(total);
  }, [cart]);

  const handleQuantityChange = (index: number, newQty: number) => {
    const item = cart[index];
    const maxQty = item.product.quantity;

    const finalQty = Math.max(1, Math.min(newQty, maxQty));
    const updatedCart = [...cart];
    updatedCart[index].quantity = finalQty;
    setCart(updatedCart);

    // TODO: update cart in database
  };

  const handleRemove = async (listing_id: number) => {
    // TODO: Add removal logic
  };

  const handleConfirmation = () => {
    router.push("/dashboard");
  };

  // TODO: retrieve seller average rating
  const getRating = (email: string): number => {
    return +(4).toFixed(1);
  };

  if (!session || loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-6">
            {cart.map((item, index) => (
              <div
                key={item.product.listing_id}
                className="p-4 border rounded-lg shadow-sm flex flex-col gap-2"
              >
                {/* Title */}
                <div className="text-lg font-semibold">
                  {item.product.product_title}
                </div>

                {/* Seller + Rating */}
                <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                  <span>
                    Sold by:{" "}
                    <span className="font-medium">
                      {item.product.seller_email}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={
                          i + 1 <= getRating(item.product.seller_email)
                            ? "currentColor"
                            : "none"
                        }
                        stroke="currentColor"
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      ({getRating(item.product.seller_email).toFixed(1)})
                    </span>
                  </span>
                </div>

                {/* Category */}
                <div className="text-sm text-gray-500">
                  {item.product.category}
                </div>

                {/* Price + Quantity + Remove row */}
                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                  {/* Quantity + Remove + Max info */}
                  <div className="flex items-center gap-3">
                    {/* Quantity */}
                    <div className="flex items-center px-2 py-1">
                      <span className="px-4 select-none font-bold">{item.quantity}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-md font-semibold">
                    Price: $
                    {(item.product.product_price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

        {/* Checkout Summary */}
        <div className="flex justify-end mt-8">
        <div className="text-right">
            {(() => {
            const subtotal = parseFloat(totalCost);
            const tariff = subtotal * 0.15;
            const serviceFee = 10.0;
            const deliveryFee = subtotal > 2000 ? 0.0 : 5.0;
            const finalTotal = subtotal + tariff + serviceFee + deliveryFee;

            return (
                <>
                <p className="text-xl font-semibold">
                    Subtotal ({cart.length} item{cart.length > 1 ? "s" : ""}):{" "}
                    <span className="ml-1">${subtotal.toFixed(2)}</span>
                </p>
                <p className="text-lg mt-2">
                    Tariff Charge (15%):{" "}
                    <span className="ml-1">${tariff.toFixed(2)}</span>
                </p>
                <p className="text-lg">
                    Service Fee: <span className="ml-1">${serviceFee.toFixed(2)}</span>
                </p>
                <p className="text-lg">
                    Delivery Fee:{" "}
                    <span className="ml-1">
                    {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
                    </span>
                </p>
                <p className="text-xl font-bold mt-2">
                    Final Total: <span className="ml-1">${finalTotal.toFixed(2)}</span>
                </p>
                <button
                    onClick={handleConfirmation}
                    className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-6 py-2 rounded cursor-pointer"
                >
                    Confirm checkout
                </button>
                </>
            );
            })()}
        </div>
        </div>


        </>
      )}
    </div>
  );
}
