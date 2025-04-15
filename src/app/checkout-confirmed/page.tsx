"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function CheckoutConfirmed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIds = searchParams.get("orders")?.split(",") || [];

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8">
      <div className="text-center max-w-md">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Checkout Confirmed!</h1>
        <p className="text-gray-700 mb-4">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 mb-6">
          <p className="font-medium">Order Number{orderIds.length > 1 ? "s" : ""}:</p>
          <ul className="mt-1">
            {orderIds.map((id) => (
              <li key={id}>#{id}</li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleGoToDashboard}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-6 py-3 rounded-lg shadow"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
