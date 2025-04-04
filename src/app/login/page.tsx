"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tries, setTries] = useState(0); // Track the number of login attempts
  const router = useRouter();

  // Process to handle if login button was clicked
  const handleLogin = async (event: Event) => {
    event.preventDefault();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    }); // Sign in with the credentials in the form using NextAuth

    if (result?.error) {
      setError(result.error); // If there is an error, display the error message
      setTries((prev) => prev + 1); // Increment the number of tries
    } else {
      router.push("/dashboard");
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid =
    email.trim().length > 0 &&
    emailRegex.test(email.trim()) &&
    password.trim().length > 0;

  // Main page
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
      <form
        className="w-md p-10 mt-10 bg-white shadow-md rounded flex flex-col gap-4"
        onSubmit={handleLogin}
      >
        <h1 className="text-2xl font-bold">Login</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {email && !emailRegex.test(email.trim()) && (
          <p className="text-sm text-red-500 mb-2">Invalid email format</p>
        )}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex flex-row w-full gap-6">
          <button
            type="submit"
            disabled={!isValid}
            className={`px-4 py-2 rounded flex-1 ${
              isValid
                ? "cursor-pointer bg-blue-500 text-white"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => router.push("/register")}
            className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer flex-1"
          >
            Create Account
          </button>
        </div>
        {tries > 0 && (
          <button
            onClick={() => router.push("/forgot-password")}
            className="bg-red-400 text-white font-bold px-4 py-2 rounded cursor-pointer mt-2"
          >
            Forgot Password?
          </button>
        )}
      </form>
    </div>
  );
}
