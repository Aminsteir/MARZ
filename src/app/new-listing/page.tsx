"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CategoryModal from "@/components/CategoryModal";

export default function NewListing() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0.0);
  const [quantity, setQuantity] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const priceRef = useRef(null);
  const quantityRef = useRef(null);

  const handleListProduct = async () => {
    if (title.trim().length == 0) {
      setErrorMessage("Product listing must include a title");
      return;
    } else if (name.trim().length == 0) {
      setErrorMessage("Product listing must include a name");
      return;
    } else if (description.trim().length == 0) {
      setErrorMessage("Product listing must include a description");
      return;
    } else if (category.trim().length == 0) {
      setErrorMessage("Product listing must include a category");
      return;
    } else if (price <= 0) {
      setErrorMessage("Product listing must include a price");
      return;
    } else if (quantity <= 0) {
      setErrorMessage("Product listing must include a valid quantity");
      return;
    }

    const body = {
      email: session.user.email,
      title: title.trim(),
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: price,
      quantity: quantity,
    };

    const response = await fetch("/api/list-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch((err) => {
      setErrorMessage(err.message);
      return null;
    });

    if (!response) return;

    const data = await response.json();
    if (!response.ok) {
      setErrorMessage(data.message || "Product listing failed");
      return;
    }

    alert("Product listed successfully");
    router.push("/dashboard");
  };

  // const handleCategorySearch = async (query: string) => {
  //   setCategory(query);
  //   if (query == "") {
  //     setSuggestions([]);
  //     return;
  //   }
  //   try {
  //     const response = await fetch(
  //       `/api/traverse-category?parent=${encodeURIComponent(query)}`,
  //       {
  //         method: "GET",
  //         headers: { "Content-Type": "application/json" },
  //       },
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch category suggestions");
  //     }
  //     const results = await response.json();
  //     setSuggestions(results.data || []);
  //   } catch (err) {
  //     console.error("Error fetching category suggestions:", err);
  //     setSuggestions([]);
  //   }
  // };

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">New Product</h1>
      <form className="w-md p-10 mt-10 bg-white shadow-lg rounded-2xl flex flex-col gap-4">
        {/* Title */}
        <h2 className="text-1xl font-bold">Title</h2>
        <input
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setTitle(e.target.value)}
        ></input>

        {/* Name */}
        <h2 className="text-1xl font-bold">Name</h2>
        <input
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setName(e.target.value)}
        ></input>

        {/* Description */}
        <h2 className="text-1xl font-bold">Description</h2>
        <input
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setDescription(e.target.value)}
        ></input>

        {/* Category */}
        <h2 className="text-1xl font-bold">Category</h2>
        <div className="flex items-center">
          <input
            className="w-full p-2 border rounded mr-2"
            type="text"
            readOnly
            value={category}
            placeholder="Select a category..."
          />
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            Choose
          </button>
        </div>

        {/* Price */}
        <h2 className="text-1xl font-bold">Price</h2>
        <div className="flex items-center w-full border rounded mb-2">
          <span className="px-2">$</span>
          <input
            ref={priceRef}
            className="w-full p-2 border-l rounded-r"
            type="number"
            min="0"
            placeholder="Enter price"
            onChange={(e) =>
              setPrice(
                Math.round((+e.target.value + Number.EPSILON) * 100) / 100,
              )
            }
            onBlur={() => {
              if (priceRef.current) {
                priceRef.current.value = price;
              }
            }}
          />
        </div>

        {/* Quantity */}
        <h2 className="text-1xl font-bold">Quantity</h2>
        <input
          ref={quantityRef}
          className="w-full p-2 border rounded mb-2"
          type="number"
          min="0"
          step="1"
          onChange={(e) => setQuantity(Math.floor(+e.target.value))}
          onBlur={() => {
            if (quantityRef.current) {
              quantityRef.current.value = quantity;
            }
          }}
        ></input>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <button
          onClick={(e) => {
            e.preventDefault();
            handleListProduct();
          }}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          List Product
        </button>
      </form>
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelectCategory={(selectedCategory: string) => {
          setCategory(selectedCategory);
        }}
      />
    </div>
  );
}
