"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    }); // Sign in with the credentials in the form using NextAuth

    if (result?.error) {
      setError(result.error); // If there is an error, display the error message
    } else {
      router.push("/"); // If successful, redirect to the home page --> TODO: May want to redirect to the previous page it was on or the User Dashboard (Buyer, Seller, Helpdesk)
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-md flex flex-row gap-4 mt-10"
          role="alert"
        >
          <strong className="font-bold">Login Error</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="w-md p-10 mt-10 bg-white shadow-md rounded flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Login</h1>
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
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          Log In
        </button>
      </div>
    </div>
  );
}
