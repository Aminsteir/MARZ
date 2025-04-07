"use client";
import { useRouter } from "next/navigation";

export default function SellerDash() {
  const router = useRouter();

  const handleNewListing = () => {
    router.push("/new_listing");
  };

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">Seller Dashboard</h1>
      <button
        onClick={handleNewListing}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
      >
        List New Product
      </button>
    </div>
  );
}
