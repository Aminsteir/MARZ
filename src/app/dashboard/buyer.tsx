"use client";
import { useRouter } from "next/navigation";

export default function BuyerDash() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">Buyer Dashboard</h1>
      <div className="flex flex-row w-full justify-center items-center content-baseline mt-4 gap-4">
        <button
          onClick={() => router.push("/shop")}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer w-full max-w-40"
        >
          Shop Products
        </button>
        <button
          onClick={() => router.push("/cart")}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer w-full max-w-40"
        >
          View Cart
        </button>
      </div>
      {/* Show all customer orders */}
    </div>
  );
}
