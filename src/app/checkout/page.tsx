"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { UserRole, CartItem, Credit_Card } from "@/db/models";
import LoadingScreen from "@/components/LoadingScreen";
import ReviewBar from "@/components/ReviewBar";

export default function Checkout() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cards, setCards] = useState<Credit_Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>("");
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [newCard, setNewCard] = useState<Credit_Card>({
    credit_card_num: "",
    card_type: "",
    expire_month: "",
    expire_year: "",
    security_code: "",
    owner_email: "",
  });
  const [addingCard, setAddingCard] = useState(false);
  const [totalCost, setTotalCost] = useState("");
  const [loading, setLoading] = useState(true);

  // mask all digits except last 4
  const maskNumber = (num: string) => num.slice(-4);

  // load cart and cards
  useEffect(() => {
    if (session && (session.user.role as UserRole) !== "Buyer") {
      router.push("/");
      return;
    }
    if (!session) return;

    async function loadCartAndCards() {
      try {
        const [cartRes, cardsRes] = await Promise.all([
          fetch("/api/get-cart"),
          fetch("/api/get-cards"),
        ]);

        if (!cartRes.ok || !cardsRes.ok) {
          console.error("Failed to fetch cart or cards");
          router.push("/cart");
          return;
        }

        const cartData: CartItem[] = (await cartRes.json()).data;
        const cardsData: Credit_Card[] = (await cardsRes.json()).data;

        setCart(cartData);
        setCards(cardsData);

        if (cardsData.length <= 0) {
          setShowNewCardForm(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCartAndCards();
  }, [session, router]);

  useEffect(() => {
    const total = cart
      .reduce(
        (acc, item) => acc + item.product.info.product_price * item.quantity,
        0,
      )
      .toFixed(2);
    setTotalCost(total);
  }, [cart]);

  // add a new card
  const handleAddCard = async (e: FormEvent) => {
    e.preventDefault();
    setAddingCard(true);

    try {
      const res = await fetch("/api/add-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCard),
      });
      if (!res.ok) throw new Error("Failed to add card");

      const created: Credit_Card = (await res.json()).data;
      setCards((prev) => [...prev, created]);
      setSelectedCard(created.credit_card_num);
      setShowNewCardForm(false);
      setNewCard({
        credit_card_num: "",
        card_type: "",
        expire_month: "",
        expire_year: "",
        security_code: "",
        owner_email: "",
      });
    } catch (err) {
      console.error(err);
      alert("Could not save card. Please check your details.");
    } finally {
      setAddingCard(false);
    }
  };

  // confirm checkout
  const handleConfirmation = async () => {
    if (!selectedCard) {
      alert("Please select or add a credit card before checkout.");
      return;
    }

    const res = await fetch("/api/confirm-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card: selectedCard }),
    });

    if (res.ok) {
      const { orderIds } = await res.json();
      router.push(`/checkout-confirmed?orders=${orderIds.join(",")}`);
    } else {
      alert("Checkout failed. Please try again.");
    }
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
          {/* Cart Items */}
          <div className="space-y-6">
            {cart.map((item) => (
              <div
                key={item.product.info.listing_id}
                className="p-4 border rounded-lg shadow-sm flex flex-col gap-2"
              >
                <div className="text-lg font-semibold">
                  {item.product.info.product_title}
                </div>

                <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                  <span>
                    Sold by:{" "}
                    <span className="font-medium">
                      {item.product.info.seller_email}
                    </span>
                  </span>
                  <ReviewBar
                    rating={item.product.seller_stats.avg_rating}
                    count={item.product.seller_stats.review_count}
                  />
                </div>

                <div className="text-sm text-gray-500">
                  {item.product.info.category}
                </div>

                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center px-2 py-1">
                      <span className="px-4 select-none font-bold">
                        {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-md font-semibold">
                    Price: $
                    {(item.product.info.product_price * item.quantity).toFixed(
                      2,
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>

            {cards.length > 0 && !showNewCardForm && (
              <select
                className="border p-2 rounded w-full max-w-xs"
                value={selectedCard}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  if (e.target.value === "new") {
                    setShowNewCardForm(true);
                    setSelectedCard("");
                  } else {
                    setSelectedCard(e.target.value);
                  }
                }}
              >
                <option value="">Select a card</option>
                {cards.map((c, i) => (
                  <option key={i} value={c.credit_card_num}>
                    {c.card_type.toUpperCase()} - x
                    {maskNumber(c.credit_card_num)}
                  </option>
                ))}
                <option value="new">Add new card</option>
              </select>
            )}

            {showNewCardForm && (
              <form className="space-y-4 max-w-md" onSubmit={handleAddCard}>
                <div>
                  <label className="block mb-1">Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="1234-5678-9012-3456"
                    className="border p-2 w-full rounded"
                    value={newCard.credit_card_num}
                    onChange={(e) =>
                      setNewCard((nc) => ({
                        ...nc,
                        credit_card_num: e.target.value.replaceAll(" ", "-"),
                      }))
                    }
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="block mb-1">Card Type</label>
                    <input
                      type="text"
                      minLength={1}
                      maxLength={10}
                      placeholder="e.g., VISA"
                      className="border p-2 w-30 rounded"
                      value={newCard.card_type}
                      onChange={(e) => {
                        setNewCard((nc) => ({
                          ...nc,
                          card_type: e.target.value.toUpperCase(),
                        }));
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Exp. Month</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      placeholder="MM"
                      className="border p-2 w-20 rounded"
                      value={newCard.expire_month}
                      onChange={(e) => {
                        setNewCard((nc) => ({
                          ...nc,
                          expire_month: e.target.value,
                        }));
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Exp. Year</label>
                    <input
                      type="number"
                      min={new Date().getFullYear()}
                      placeholder="YYYY"
                      className="border p-2 w-24 rounded"
                      value={newCard.expire_year}
                      onChange={(e) =>
                        setNewCard((nc) => ({
                          ...nc,
                          expire_year: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">CVC</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="123"
                      className="border p-2 w-20 rounded"
                      value={newCard.security_code}
                      onChange={(e) =>
                        setNewCard((nc) => ({
                          ...nc,
                          security_code: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex flex-row gap-4">
                  <button
                    type="submit"
                    disabled={addingCard}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
                  >
                    {addingCard ? "Saving…" : "Save Card"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCardForm(false);
                      setAddingCard(false);
                    }}
                    className="bg-red-400 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
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
                      Subtotal ({cart.length} item
                      {cart.length > 1 ? "s" : ""}):{" "}
                      <span className="ml-1">${subtotal.toFixed(2)}</span>
                    </p>
                    <p className="text-lg mt-2">
                      Tariff Charge (15%):{" "}
                      <span className="ml-1">${tariff.toFixed(2)}</span>
                    </p>
                    <p className="text-lg">
                      Service Fee:{" "}
                      <span className="ml-1">${serviceFee.toFixed(2)}</span>
                    </p>
                    <p className="text-lg">
                      Delivery Fee:{" "}
                      <span className="ml-1">
                        {deliveryFee === 0
                          ? "Free"
                          : `$${deliveryFee.toFixed(2)}`}
                      </span>
                    </p>
                    <p className="text-xl font-bold mt-2">
                      Final Total:{" "}
                      <span className="ml-1">${finalTotal.toFixed(2)}</span>
                    </p>
                    <button
                      onClick={handleConfirmation}
                      disabled={!selectedCard}
                      className={`mt-4 font-medium px-6 py-2 rounded ${
                        selectedCard
                          ? "bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
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
