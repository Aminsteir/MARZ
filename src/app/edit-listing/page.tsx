"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import CategoryModal from "@/components/CategoryModal";
import { UserRole, Product_Listing } from "@/db/models";

export default function EditListing() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [status, setStatus] = useState(1);

  const titleRef = useRef(null);
  const nameRef = useRef(null);
  const descriptionRef = useRef(null);
  const priceRef = useRef(null);
  const quantityRef = useRef(null);

  useEffect(() => {
    if (session && (session.user.role as UserRole) === "Buyer") {
      router.push("/");
    }

    const sellerEmail = searchParams.get("seller_email");
    const listingId = searchParams.get("listing_id");

    // If sellerEmail or listingId is not provided, redirect to home
    if (!sellerEmail || !listingId) {
      router.push("/");
      return;
    }

    // If the user is not the owner of the listing or not a Helpdesk staff, redirect to home
    if (
      session &&
      sellerEmail.trim() !== session.user.email &&
      (session.user.role as UserRole) !== "Helpdesk"
    ) {
      router.push("/");
      return;
    }

    // Fetch the product listing details via GET request
    const fetchProductListing = async () => {
      const response = await fetch(
        `/api/get-product?listingId=${encodeURIComponent(listingId)}&sellerEmail=${encodeURIComponent(sellerEmail)}`,
      );

      if (!response.ok) {
        router.push("/");
        return;
      }

      const data = await response.json();
      const product: Product_Listing = data.data;

      setTitle(product.product_title);
      setName(product.product_name);
      setDescription(product.product_description);
      setCategory(product.category);
      setPrice(product.product_price);
      setQuantity(product.quantity);
      setStatus(product.status);

      if (titleRef.current) {
        titleRef.current.value = product.product_title;
      }
      if (nameRef.current) {
        nameRef.current.value = product.product_name;
      }
      if (descriptionRef.current) {
        descriptionRef.current.value = product.product_description;
      }
      if (priceRef.current) {
        priceRef.current.value = product.product_price;
      }
      if (quantityRef.current) {
        quantityRef.current.value = product.quantity;
      }
    };
    fetchProductListing();
  }, [session, router, searchParams]);

  useEffect(() => {
    if (quantity <= 0) {
      setStatus(2); // Force "Out of stock/Sold"
    } else if (status === 2) {
      setStatus(1); // Reset status to active if quantity > 0
    }
  }, [quantity, status]);

  const editProductListing = async () => {
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
      setErrorMessage("Product listing must include a valid price");
      return;
    } else if (quantity <= 0) {
      setErrorMessage("Product listing must include a valid quantity");
      return;
    }

    const body: Product_Listing = {
      seller_email: session.user.email.trim(),
      listing_id: parseInt(searchParams.get("listing_id")),
      category: category.trim(),
      product_title: title.trim(),
      product_name: name.trim(),
      product_description: description.trim(),
      quantity: quantity,
      product_price: price,
      status: status,
    };

    const response = await fetch("/api/edit-product", {
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
      setErrorMessage(data.message || "Failed to edit product listing");
      return;
    }

    alert("Product listing updated successfully");
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">Update Product</h1>
      <form className="w-md p-10 mt-10 bg-white shadow-lg rounded-2xl flex flex-col gap-4">
        {/* Title */}
        <h2 className="text-1xl font-bold">Title</h2>
        <input
          ref={titleRef}
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setTitle(e.target.value)}
          defaultValue={title}
        ></input>

        {/* Name */}
        <h2 className="text-1xl font-bold">Name</h2>
        <input
          ref={nameRef}
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setName(e.target.value)}
          defaultValue={name}
        ></input>

        {/* Description */}
        <h2 className="text-1xl font-bold">Description</h2>
        <input
          ref={descriptionRef}
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setDescription(e.target.value)}
          defaultValue={description}
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
            defaultValue={price}
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
          defaultValue={quantity}
          onChange={(e) => setQuantity(Math.floor(+e.target.value))}
          onBlur={() => {
            if (quantityRef.current) {
              quantityRef.current.value = quantity;
            }
          }}
        ></input>

        {/* Status */}
        <h2 className="text-1xl font-bold">Status</h2>
        <select
          value={status}
          onChange={(e) => {
            if (quantity > 0) {
              setStatus(+e.target.value);
            }
          }}
          disabled={quantity <= 0}
          className="border rounded p-2"
        >
          {quantity > 0 ? (
            <>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </>
          ) : (
            <option value={2}>Out of Stock / Sold</option>
          )}
        </select>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <button
          onClick={(e) => {
            e.preventDefault();
            editProductListing();
          }}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          Update Product
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
