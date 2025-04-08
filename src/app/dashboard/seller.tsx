"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Product_Listing } from "@/db/models";

export default function SellerDash() {
  const router = useRouter();
  const [listings, setListings] = useState<Product_Listing[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      const res = await fetch("/api/seller-products");

      if (!res.ok) {
        setListings([]);
        return;
      }

      const products = (await res.json()).data as Product_Listing[];
      setListings(products);
    };
    fetchListings();
  }, []);

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">Seller Dashboard</h1>
      <button
        onClick={() => router.push("/new-listing")}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
      >
        List New Product
      </button>
      <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {listings.map((product) => (
          <div key={product.listing_id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{product.product_title}</h2>
            <p>{product.product_description}</p>
            <p className="text-sm text-gray-500">
              Price: ${product.product_price}
            </p>
            <p className="text-sm text-gray-500">
              Quantity: {product.quantity}
            </p>
            <button
              className="mt-2 px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded"
              onClick={() =>
                router.push(
                  `/edit-listing?seller_email=${encodeURIComponent(product.seller_email)}&listing_id=${encodeURIComponent(product.listing_id)}`,
                )
              }
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
