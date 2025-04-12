"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole, CartItem } from "@/db/models";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { Minus, Plus, Trash, Star } from "lucide-react";

export default function ShoppingCart() {
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

  const handleQuantityChange = async (index: number, newQty: number) => {
    const item = cart[index];
    const maxQty = item.product.quantity;
    const finalQty = Math.max(1, Math.min(newQty, maxQty));

    async function updateQuantity() {
      const response = await fetch("/api/update-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seller_email: item.product.seller_email,
          listing_id: item.product.listing_id,
          quantity: finalQty,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update cart");
        return false;
      }

      return true;
    }

    const status = await updateQuantity();

    if (status) {
      const updatedCart = [...cart];
      updatedCart[index].quantity = finalQty;
      setCart(updatedCart);
    }
  };

  const handleRemove = async (index: number) => {
    const item = cart[index];

    async function removeFromCart() {
      const response = await fetch("/api/update-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seller_email: item.product.seller_email,
          listing_id: item.product.listing_id,
          quantity: 0,
        }),
      });

      if (!response.ok) {
        console.error("Failed to remove product from cart");
        return false;
      }

      return true;
    }

    const status = await removeFromCart();
    if (status) {
      const newCart = [...cart];
      newCart.splice(index, 1);
      setCart(newCart);
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  // TODO: retrieve seller average rating -- whenever the review task is completed
  const getRating = (email: string): number => {
    return +(4).toFixed(1);
  };

  if (!session || loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

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
                    {/* Quantity control */}
                    <div className="flex items-center border rounded px-2 py-1">
                      <button
                        onClick={() =>
                          handleQuantityChange(index, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="p-1 disabled:opacity-40 cursor-pointer"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 select-none">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(index, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.quantity}
                        className="p-1 disabled:opacity-40 cursor-pointer"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(index)}
                      className="flex items-center gap-1 text-red-600 cursor-pointer hover:underline"
                    >
                      <Trash size={16} />
                      Remove
                    </button>

                    {/* Max quantity */}
                    <div className="text-xs text-gray-400">
                      Max: {item.product.quantity}
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
              <p className="text-xl font-semibold">
                Subtotal ({cart.length} item{cart.length > 1 ? "s" : ""}):{" "}
                <span className="ml-1">${totalCost}</span>
              </p>
              <button
                onClick={handleCheckout}
                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-6 py-2 rounded cursor-pointer"
              >                
                Proceed to Checkout
              </button>
              
            </div>
          </div>
        </>
      )}
    </div>
  );
}
