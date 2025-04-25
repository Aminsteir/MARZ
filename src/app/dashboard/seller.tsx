"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Product_Listing } from "@/db/models";

interface PromotedProduct {
  seller_email: string;
  listing_id: number;
  promotion_date: string;
  product_title: string;
  product_price: number;
  product_description: string;
  category: string;
  quantity: number;
  status: number;
}

export default function SellerDash() {
  const router = useRouter();
  const [listings, setListings] = useState<Product_Listing[]>([]); // Store product listings
  const [promotedProducts, setPromotedProducts] = useState<PromotedProduct[]>(
    [],
  );
  const [showPromotePopup, setShowPromotePopup] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<Product_Listing | null>(null);
  const [promotionError, setPromotionError] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);

  // Get Product Listings, promoted products, and seller profile info on component mount
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchListings(), fetchPromotedProducts()]);
    };

    fetchData();
  }, []);

  const fetchListings = async () => {
    const res = await fetch("/api/seller-products");

    if (!res.ok) {
      setListings([]);
      return;
    }

    const products = (await res.json()).data as Product_Listing[];
    setListings(products);
  };

  const fetchPromotedProducts = async () => {
    const response = await fetch("/api/seller-promoted-products");
    if (response.ok) {
      const data = await response.json();
      setPromotedProducts(data.data);
    } else {
      console.error("Failed to fetch promoted products");
      setPromotedProducts([]);
    }
  };

  const isProductPromoted = (product: Product_Listing) => {
    return promotedProducts.some(
      (promo) =>
        promo.listing_id === product.listing_id &&
        promo.seller_email === product.seller_email,
    );
  };

  const handlePromote = (product: Product_Listing) => {
    setSelectedProduct(product);
    setShowPromotePopup(true);
  };

  const handlePromoteConfirm = async () => {
    if (!selectedProduct) return;

    setIsPromoting(true);
    setPromotionError("");

    try {
      const response = await fetch("/api/promote-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: selectedProduct.listing_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errorType === "INSUFFICIENT_BALANCE") {
          setPromotionError(
            "You don't have enough balance for this promotion. Please add funds to your account.",
          );
        } else {
          setPromotionError(data.message || "Failed to promote product.");
        }
        return;
      }

      // Success! Close the popup
      setShowPromotePopup(false);
      setSelectedProduct(null);

      // Refresh both listings and promoted products
      await Promise.all([fetchListings(), fetchPromotedProducts()]);
      alert("Product promoted successfully");
    } catch (error) {
      setPromotionError("An error occurred. Please try again.");
      console.error("Promotion error:", error);
    } finally {
      setIsPromoting(false);
    }
  };

  const handlePromoteCancel = () => {
    setShowPromotePopup(false);
    setSelectedProduct(null);
    setPromotionError("");
  };

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">Seller Dashboard</h1>

      {/* Navigation buttons */}
      <div className="flex flex-row w-full justify-center items-center mt-4 gap-4">
        <button
          onClick={() => router.push("/new-listing")}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer w-xs"
        >
          List New Product
        </button>
        <button
          onClick={() => router.push("/update-profile")}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full max-w-40 cursor-pointer"
        >
          Update Profile
        </button>
      </div>

      {/* Product Listings Display */}
      <h1 className="text-xl font-bold mt-6 w-full text-left border-b border-black pb-2">
        Product Listings
      </h1>
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
            <div className="flex space-x-2 mt-2">
              <button
                className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
                onClick={() =>
                  router.push(
                    `/edit-listing?seller_email=${encodeURIComponent(product.seller_email)}&listing_id=${encodeURIComponent(product.listing_id)}`,
                  )
                }
              >
                Edit
              </button>

              {isProductPromoted(product) ? (
                <span className="px-4 py-1 bg-green-500 text-white rounded opacity-90 cursor-default">
                  Promoted
                </span>
              ) : (
                <button
                  className="px-4 py-1 bg-yellow-500 text-white hover:bg-yellow-600 rounded cursor-pointer"
                  onClick={() => handlePromote(product)}
                >
                  Promote
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Promotion Popup */}
      {showPromotePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Promote your product?</h2>
            <p className="mb-4">
              Promote "{selectedProduct?.product_title}" for better visibility
              and increased sales.
            </p>
            <p className="font-semibold mb-2">
              Promotion fee: $
              {(selectedProduct?.product_price * 0.05).toFixed(2)}
            </p>

            {promotionError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {promotionError}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={handlePromoteCancel}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                disabled={isPromoting}
              >
                Cancel
              </button>
              <button
                onClick={handlePromoteConfirm}
                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded disabled:bg-blue-300"
                disabled={isPromoting}
              >
                {isPromoting ? "Processing..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
