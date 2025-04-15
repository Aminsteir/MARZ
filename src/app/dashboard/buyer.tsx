"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Order, ProductOrder } from "@/db/models";

export default function BuyerDash() {
  const router = useRouter();

  const [orders, setOrders] = useState<ProductOrder[]>([]); // Store orders

  useEffect(() => {
      // Fetch Order History
      const fetchOrders = async () => {
        const res = await fetch("/api/order-history");
  
        if (!res.ok) {
          setOrders([]);
          return;
        }
  
        const orders = (await res.json()).data as ProductOrder[];
        orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(orders);
      };
  
      fetchOrders();
    }, []);

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">Buyer Dashboard</h1>

      {/* Navigation buttons */}
      <div className="flex flex-row w-full justify-center items-center mt-4 gap-4">
        <button
          onClick={() => router.push("/shop")}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full max-w-40 cursor-pointer"
        >
          Shop Products
        </button>
        <button
          onClick={() => router.push("/cart")}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full max-w-40 cursor-pointer"
        >
          View Cart
        </button>
        <button
          onClick={() => router.push("/update-profile")}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full max-w-40 cursor-pointer"
        >
          Update Profile
        </button>
      </div>
      {/* Past Orders Display */}
      <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div key={order.order_id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{order.product_title}</h2>
            <p>{order.product_description}</p>
            <p className="text-sm text-gray-500">
              Price: ${order.payment}
            </p>
            <p className="text-sm text-gray-500">
              Quantity: {order.quantity}
            </p>
            <p className="text-sm text-gray-500">
              {order.date}
            </p>
            <button
              className="mt-2 px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded"
              // onClick={() =>
              //   router.push(
              //     `/edit-listing?seller_email=${encodeURIComponent(product.seller_email)}&listing_id=${encodeURIComponent(product.listing_id)}`,
              //   )
              // }
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
