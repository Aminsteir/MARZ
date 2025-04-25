"use client";

import React, { useState, useEffect } from "react";
import { ProductWithStats } from "@/db/models";
import Breadcrumb from "@/components/Breadcrumb";
import { Store, X, Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import ReviewBar from "@/components/ReviewBar";

interface CategoryResponse {
  data: string[];
}

interface ProductsResponse {
  data: ProductWithStats[];
}

interface ModalProps {
  isOpen: boolean;
  product: ProductWithStats | null;
  onClose: () => void;
  onAddToCart: () => Promise<void>;
}

const ProductModal = ({
  isOpen,
  product,
  onClose,
  onAddToCart,
}: ModalProps) => {
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

        <h2 className="text-2xl font-bold mb-1">
          {product.info.product_title}
        </h2>
        <p className="mb-2">Description: {product.info.product_description}</p>
        <p className="mb-2">Category: {product.info.category}</p>
        <p className="text-sm font-semibold mb-2">
          Price: ${product.info.product_price.toFixed(2)}
        </p>
        <div className="flex flex-row gap-1 w-full mb-2 items-center">
          <p className="text-sm text-gray-600">
            Seller: {product.info.seller_email}
          </p>
          <ReviewBar
            rating={product.seller_stats.avg_rating}
            count={product.seller_stats.review_count}
          />
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Quantity available: {product.info.quantity}
        </p>

        {product.info.status > 1 ? (
          <p className="text-red-400 font-semibold text-sm">Out of Stock</p>
        ) : (
          <button
            onClick={onAddToCart}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default function ShopPage() {
  const router = useRouter();

  // search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductWithStats[]>([]);
  const [searching, setSearching] = useState(false);

  // category state
  const [breadcrumb, setBreadcrumb] = useState<string[]>(["Root"]);
  const parent = breadcrumb[breadcrumb.length - 1];
  const [subcats, setSubcats] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductWithStats[]>([]);
  const [loading, setLoading] = useState(false);

  // modal & cart state
  const [selected, setSelected] = useState<ProductWithStats | null>(null);
  const [cartMessage, setCartMessage] = useState<{
    status?: boolean;
    message: string;
  }>({ message: "" });

  // fetch categories & products when not searching
  useEffect(() => {
    if (searchTerm.trim()) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/traverse-category?parent=${encodeURIComponent(parent)}`)
        .then((r) => r.json() as Promise<CategoryResponse>)
        .then((j) => setSubcats(j.data || []))
        .catch(() => setSubcats([])),
      fetch(`/api/products-by-category?category=${encodeURIComponent(parent)}`)
        .then((r) => r.json() as Promise<ProductsResponse>)
        // .then((j) => setProducts(j.data || []))
        .then((j) => {
          const products = j.data || [];
          products.sort(
            (a, b) =>
              b.seller_stats.avg_rating -
              a.seller_stats.avg_rating +
              0.2 * (b.seller_stats.review_count - a.seller_stats.review_count),
          );
          setProducts(products);
        })
        .catch(() => setProducts([])),
    ]).finally(() => setLoading(false));
  }, [parent, searchTerm]);

  // debounce search-as-you-type
  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timeout = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search-products?query=${encodeURIComponent(term)}`,
        );
        const json = (await res.json()) as { data: ProductWithStats[] };
        setSearchResults(json.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  const goDeeper = (cat: string) => setBreadcrumb((b) => [...b, cat]);
  const goUp = (idx: number) => setBreadcrumb((b) => b.slice(0, idx + 1));

  const handleAddToCart = async () => {
    if (!selected) return;
    setCartMessage({ message: "Adding..." });
    const res = await fetch("/api/add-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seller_email: selected.info.seller_email,
        listing_id: selected.info.listing_id,
      }),
    });
    if (res.ok) {
      setCartMessage({ status: true, message: "Added to cart!" });
    } else {
      const err = (await res.json()).message;
      setCartMessage({ status: false, message: err });
    }
    setSelected(null);
    setTimeout(() => setCartMessage({ status: undefined, message: "" }), 3000);
  };

  // decide render mode
  const isSearching = !!searchTerm.trim();
  const listToRender = isSearching ? searchResults : products;
  const loadingList = isSearching ? searching : loading;

  return (
    <div className="p-6">
      {/* Top bar: search + breadcrumb + cart */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        {/* Breadcrumb only when not searching */}
        {!isSearching && (
          <Breadcrumb
            path={breadcrumb}
            onNavigate={goUp}
            icon={<Store />}
            className="flex-1 w-full"
          />
        )}

        {/* search-as-you-type input */}
        <div className="relative flex-1 w-full">
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded focus:outline-none"
          />
        </div>

        {/* View Cart */}
        <button
          onClick={() => router.push("/cart")}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          View Cart
        </button>
      </div>

      {/* Cart message */}
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

      {/* Main content */}
      {loadingList ? (
        <p>Loading…</p>
      ) : (
        <div className="flex gap-6">
          {/* Sidebar */}
          {!isSearching && (
            <aside className="w-1/4">
              <h2 className="font-bold mb-2">Subcategories</h2>
              {subcats.length > 0 ? (
                <ul className="space-y-1">
                  {subcats.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => goDeeper(cat)}
                        className="text-blue-500 hover:underline cursor-pointer text-start"
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
          )}
          <div className="flex-1 flex flex-col gap-2">
            {listToRender.length > 0 && parent === "Root" && (
              <h2 className="font-bold mb-2">Promoted Products</h2>
            )}
            {/* Products grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-min">
              {listToRender.length > 0 ? (
                listToRender.map((p) => (
                  <div
                    key={`${p.info.seller_email}-${p.info.listing_id}`}
                    className={`border p-4 rounded cursor-pointer hover:shadow-md ${
                      p.info.status > 1 ? "bg-red-100" : "bg-white"
                    }`}
                    onClick={() => setSelected(p)}
                  >
                    <h3 className="font-semibold">{p.info.product_title}</h3>
                    <p className="text-sm truncate">
                      {p.info.product_description}
                    </p>
                    <div className="flex flex-row gap-1 w-full items-center flex-wrap">
                      <p className="text-sm text-gray-600">
                        Seller: {p.info.seller_email}
                      </p>
                      <ReviewBar
                        rating={p.seller_stats.avg_rating}
                        count={p.seller_stats.review_count}
                      />
                    </div>
                    <p className="mt-2 font-bold">
                      ${p.info.product_price.toFixed(2)}
                      {p.info.status > 1 ? " (Out of Stock)" : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full">
                  {isSearching
                    ? `No results for “${searchTerm}”`
                    : `No products in “${parent}”`}
                </p>
              )}
            </section>
          </div>
        </div>
      )}

      {/* Modal */}
      <ProductModal
        isOpen={!!selected}
        product={selected}
        onClose={() => setSelected(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
