"use client";
import React, { useState, useEffect } from "react";
import { Product_Listing } from "@/db/models";
import Breadcrumb from "@/components/Breadcrumb";
import { Store, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryResponse {
  data: string[];
}
interface ProductsResponse {
  data: Product_Listing[];
}

interface ProductModalProps {
  isOpen: boolean;
  product: Product_Listing | null;
  onClose: () => void;
  onAddToCart: () => Promise<void>;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-1">{product.product_title}</h2>
        <p className="mb-3">{product.product_description}</p>
        <p className="font-semibold mb-2">
          Price: ${product.product_price.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          Seller: {product.seller_email}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Quantity available: {product.quantity}
        </p>

        <button
          onClick={onAddToCart}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default function ShopPage() {
  const router = useRouter();

  const [breadcrumb, setBreadcrumb] = useState<string[]>(["Root"]);
  const parent = breadcrumb[breadcrumb.length - 1];

  const [subcats, setSubcats] = useState<string[]>([]);
  const [products, setProducts] = useState<Product_Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selected, setSelected] = useState<Product_Listing | null>(null);
  const [cartMessage, setCartMessage] = useState<{
    status?: boolean;
    message: string;
  }>({ message: "" });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/traverse-category?parent=${encodeURIComponent(parent)}`)
        .then((res) => res.json() as Promise<CategoryResponse>)
        .then((json) => setSubcats(json.data || []))
        .catch((err) => {
          console.error(err);
          setSubcats([]);
        }),
      fetch(`/api/products-by-category?category=${encodeURIComponent(parent)}`)
        .then((res) => res.json() as Promise<ProductsResponse>)
        .then((json) => setProducts(json.data || []))
        .catch((err) => {
          console.error(err);
          setProducts([]);
        }),
    ]).finally(() => setLoading(false));
  }, [parent]);

  const goDeeper = (cat: string) => setBreadcrumb((b) => [...b, cat]);

  const goUp = (idx: number) => setBreadcrumb((b) => b.slice(0, idx + 1));

  const handleAddToCart = async () => {
    if (!selected) return;
    setCartMessage({ message: "Adding..." });
    const res = await fetch("/api/add-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seller_email: selected.seller_email,
        listing_id: selected.listing_id,
      }),
    });
    if (res.ok) {
      setCartMessage({ status: true, message: "Added to cart!" });
    } else {
      const err = (await res.json()).message;
      setCartMessage({
        status: false,
        message: err,
      });
    }
    setSelected(null);
    setTimeout(() => setCartMessage({ status: undefined, message: "" }), 3000);
  };

  return (
    <div className="p-6">
      <div className="w-full flex flex-row gap-4 mb-6">
        <Breadcrumb
          path={breadcrumb}
          onNavigate={goUp}
          icon={<Store />}
          className="flex-1"
        />
        <button
          onClick={() => router.push("/cart")}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          View Cart
        </button>
      </div>
      {cartMessage.status !== undefined && cartMessage.message && (
        <div
          className={`border px-4 py-3 rounded mb-6 flex items-center ${
            cartMessage.status
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
          role="alert"
        >
          <span className="flex-1">{cartMessage.message}</span>
        </div>
      )}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="flex gap-6">
          {/* Subcategories */}
          <aside className="w-1/4">
            <h2 className="font-bold mb-2">Subcategories</h2>
            {subcats.length > 0 ? (
              <ul className="space-y-1">
                {subcats.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => goDeeper(cat)}
                      className="text-blue-500 hover:underline cursor-pointer"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No further subcategories.</p>
            )}
          </aside>

          {/* Products */}
          <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.length > 0 ? (
              products.map((p) => (
                <div
                  key={`${p.seller_email}-${p.listing_id}`}
                  className="border p-4 rounded cursor-pointer hover:shadow"
                  onClick={() => setSelected(p)}
                >
                  <h3 className="font-semibold">{p.product_title}</h3>
                  <p className="text-sm truncate">{p.product_description}</p>
                  <p className="mt-2 font-bold">
                    ${p.product_price.toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full">
                No products in “{parent}”
              </p>
            )}
          </section>

          {/* Product Detail Modal */}
          <ProductModal
            isOpen={!!selected}
            product={selected}
            onClose={() => setSelected(null)}
            onAddToCart={handleAddToCart}
          />
        </div>
      )}
    </div>
  );
}
