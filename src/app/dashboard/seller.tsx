"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Product_Listing } from "@/db/models";

export default function SellerDash() {
  const router = useRouter();
  // Store product listings
  const [listings, setListings] = useState<Product_Listing[]>([]);
  // Store Seller profile info.
  const [profile, setProfile] = useState({
    email: "",
    business_name: "",
    zipcode: "",
    city: "",
    state: "",
    street_number: "",
    street_name: "",
    routing_number: "",
    account_number: ""
  });

  // Get Product Lstings and seller profile info. on component mount
  useEffect(() => {
    // Fetch Product Listings
    const fetchListings = async () => {
      const res = await fetch("/api/seller-products");

      if (!res.ok) {
        setListings([]);
        return;
      }

      const products = (await res.json()).data as Product_Listing[];
      setListings(products);
    };

    // Fetch Seller profile info.
    const fetchProfile = async () => {
      const res = await fetch("/api/seller-profile");
      const data = await res.json();
      setProfile(data);
    };

    fetchListings();
    fetchProfile();
  }, []);

  // Handling input changes in the profile form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handling submissions to form for updating Seller profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // preventing default behavbiors
    const updateProfile = { ...profile };
    
    // NOTE: ADD PW CHANGE?? 

    // Updating backend information
    const res = await fetch("/api/seller/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

     // Showing output messages
    if (res.ok) {
      alert("Your profile updated successfully! :)");
    } else {
      alert("Your profile failed to update :( Please try again later");
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">Seller Dashboard</h1>

      {/* Button to add new product listing */}
      <button
        onClick={() => router.push("/new-listing")}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer w-xs"
      >
        List New Product
      </button>

      {/* Product Listings Display */}
      <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {listings.map((product) => (
          <div key={product.listing_id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{product.product_title}</h2>
            <p>{product.product_description}</p>
            <p className="text-sm text-gray-500">Price: ${product.product_price}</p>
            <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
            <button
              className="mt-2 px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded"
              onClick={() =>
                router.push(
                  `/edit-listing?seller_email=${encodeURIComponent(product.seller_email)}&listing_id=${encodeURIComponent(product.listing_id)}`
                )
              }
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Seller Profile Update Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md mt-12 space-y-4 border-t pt-6">
        <h2 className="text-xl font-bold mb-2">Update Profile</h2>

        <div>
          <label>Email (uneditable)</label>
          <input type="email" value={profile.email} disabled className="w-full px-3 py-2 border rounded bg-gray-100" />
        </div>

        <div>
          <label>Business Name</label>
          <input name="business_name" value={profile.business_name} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label>Street Number</label>
          <input name="street_number" value={profile.street_number} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label>Street Name</label>
          <input name="street_name" value={profile.street_name} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label>City</label>
          <input name="city" value={profile.city} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label>State</label>
          <input name="state" value={profile.state} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label>Zipcode</label>
          <input name="zipcode" value={profile.zipcode} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label>Bank Routing Number</label>
          <input name="routing_number" value={profile.routing_number} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label>Bank Account Number</label>
          <input name="account_number" value={profile.account_number} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Update Profile
        </button>
      </form>
    </div>
  );
}