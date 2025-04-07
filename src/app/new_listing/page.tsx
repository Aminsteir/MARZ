"use client";
import { useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function NewListing() {
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleListProduct = async () => {
    if (title == "") {
      setErrorMessage("Product listing must include a title");
      return;
    }
    if (name == "") {
      setErrorMessage("Product listing must include a name");
      return;
    }
    if (description == "") {
      setErrorMessage("Product listing must include a description");
      return;
    }
    if (category == "") {
      setErrorMessage("Product listing must include a category");
      return;
    }
    if (price == "") {
      setErrorMessage("Product listing must include a price");
      return;
    }
    if (quantity == "") {
      setErrorMessage("Product listing must inclue a quantity");
      return;
    }

    setErrorMessage("");
    try {
      const session = await getSession();
      const body = {
        email: session.user.email,
        title: title,
        name: name,
        description: description,
        category: category,
        price: price,
        quantity: quantity,
      };

      const response = await fetch("/api/list_product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Product listing failed");

      alert("Product listed successfully");
      router.push("/dashboard");
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleCategorySearch = async (query: string) => {
    setCategory(query);
    if (query == "") {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `/api/category_search?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch category suggestions");
      }
      const results = await response.json();
      setSuggestions(results.data || []);
    } catch (err) {
      console.error("Error fetching category suggestions:", err);
      setSuggestions([]);
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">List Product Page</h1>
      <form className="w-md p-10 mt-10 bg-white shadow-md rounded flex flex-col gap-4">
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
        <input
          className="w-full p-2 border rounded mb-2"
          value={category}
          onChange={(e) => handleCategorySearch(e.target.value)}
          placeholder="Select a category..."
        />

        {suggestions.length > 0 && (
          <ul className="w-full border rounded bg-white mt-2">
            {suggestions.map((category, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setCategory(category);
                  setSuggestions([]);
                }}
              >
                {category}
              </li>
            ))}
          </ul>
        )}

        {/* Price */}
        <h2 className="text-1xl font-bold">Price</h2>
        <div className="flex items-center w-full border rounded mb-2">
          <span className="px-2">$</span>
          <input
            className="w-full p-2 border-l rounded-r"
            type="number"
            min="0"
            placeholder="Enter price"
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Quantity */}
        <h2 className="text-1xl font-bold">Quantity</h2>
        <input
          className="w-full p-2 border rounded mb-2"
          type="number"
          min="0"
          step="1"
          onChange={(e) => setQuantity(e.target.value)}
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
    </div>
  );
}
