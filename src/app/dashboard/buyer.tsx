"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function BuyerDash() {
  const router = useRouter();

  // Store Buyer's profile info.
  const [profile, setProfile] = useState({
    email: "",
    business_name: "",
    password: "",
    zipcode: "",
    city: "",
    state: "",
    street_number: "",
    street_name: "",
  });

  // Get the current Buyer info. on page load
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/buyer-profile");
      const data = await res.json();
      setProfile((prev) => ({
        ...prev,
        ...data,
      }));
    };
    fetchProfile();
  }, []);

  // Hnadling input changes for profile fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handing submissions to form for updating the profile info.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // preventing default behavbiors
    const updateProfile = { ...profile };

    // If the pw is empty, don't send it to the backend
    if ((updateProfile.password = "")) {
      delete updateProfile.password;
    }

    // Updating backend information
    const res = await fetch("/api/buyer/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateProfile),
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
      </div>

      {/* Profile Update Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md mt-8 space-y-4">
        {/* Email - shown but not editable */}
        <div>
          <label className="flex flex-row">
            <span className="flex-1">Email (uneditable)</span>
            <Link
              href={"/submit-request"}
              className="hover:underline text-blue-400"
            >
              Change Email?
            </Link>
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-200"
          />
        </div>

        {/* Editable fields */}
        <div>
          <label>Business Name</label>
          <input
            name="business_name"
            value={profile.business_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label>New Password (optional)</label>
          <input
            name="password"
            type="password"
            value={profile.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label>Street Number</label>
          <input
            name="street_number"
            value={profile.street_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label>Street Name</label>
          <input
            name="street_name"
            value={profile.street_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label>City</label>
          <input
            name="city"
            value={profile.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label>State</label>
          <input
            name="state"
            value={profile.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label>Zipcode</label>
          <input
            name="zipcode"
            value={profile.zipcode}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}
