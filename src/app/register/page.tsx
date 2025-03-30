"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Function to register an account (adding user to database)
export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Buyer");
  const [error, setError] = useState("");
  const router = useRouter();

  // Process to handle if register button was clicked
  const handleRegister = async () => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      router.push("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-md flex flex-row gap-4 mt-10" role="alert">
          <strong className="font-bold">Registration Error</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="w-md p-10 mt-10 bg-white shadow-md rounded flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Register</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="w-full p-2 border rounded mb-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Buyer">Buyer</option>
          <option value="Seller">Seller</option>
          <option value="HelpDesk">HelpDesk</option>
        </select>
        <button onClick={handleRegister} className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
          Sign Up
        </button>
      </div>
    </div>
  );
}
