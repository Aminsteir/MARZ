"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Buyer");

  const [error, setError] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [streetNum, setStreetNum] = useState("");
  const [streetName, setStreetName] = useState("");
  const [bankRouting, setBankRouting] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const router = useRouter();

  const handleRegister = async () => {
    const address = {
      zipcode: zipcode.trim(),
      city: city.trim(),
      state: stateVal.trim(),
      street_num: streetNum.trim(),
      street_name: streetName.trim(),
    };

    const body = {
      email: email.trim(),
      password: password.trim(),
      role: role.trim(),
      ...(role === "Buyer" && {
        business_name: businessName.trim(),
        address,
      }),
      ...(role === "Seller" && {
        business_name: businessName.trim(),
        business_address: address,
        bank_routing_number: bankRouting.trim(),
        account_number: accountNumber.trim(),
      }),
    };

    const response: Response | null = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch((err) => {
      setError(err.message);
      setStep(1);
      return null;
    });

    if (!response) return;

    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Registration failed");
      setStep(1);
      return;
    }

    router.push("/login");
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isStep1Valid =
    email.trim().length > 0 &&
    emailRegex.test(email.trim()) &&
    password.trim().length > 0 &&
    role.trim().length > 0;

  const isStep2Valid = () => {
    if (role === "Buyer") {
      return (
        businessName.trim() &&
        zipcode.trim() &&
        city.trim() &&
        stateVal.trim() &&
        streetNum.trim() &&
        streetName.trim()
      );
    }
    if (role === "Seller") {
      return (
        businessName.trim() &&
        zipcode.trim() &&
        city.trim() &&
        stateVal.trim() &&
        streetNum.trim() &&
        streetName.trim() &&
        bankRouting.trim() &&
        accountNumber.trim()
      );
    }
    return true;
  };

  return (
    <div className="flex flex-col w-full justify-center items-center">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-md flex flex-row gap-4 mt-10"
          role="alert"
        >
          <strong className="font-bold">Registration Error</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="w-md p-10 mt-10 bg-white shadow-md rounded flex flex-col gap-4">
        <h1 className="text-2xl font-bold">
          {step === 1 ? "Register" : "Additional Info"}
        </h1>

        {step === 1 && (
          <>
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
            {password && password.length < 8 && (
              <p className="text-sm text-gray-700 mb-2">
                We recommend passwords with at least 8 characters
              </p>
            )}
            <select
              className="w-full p-2 border rounded mb-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
            <button
              onClick={() => setStep(2)}
              disabled={!isStep1Valid}
              className={`px-4 py-2 rounded ${
                isStep1Valid
                  ? "bg-blue-500 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {(role === "Buyer" || role === "Seller") && (
              <>
                <input
                  type="text"
                  placeholder="Business Name"
                  className="w-full p-2 border rounded mb-2"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Zipcode"
                  className="w-full p-2 border rounded mb-2"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="City"
                  className="w-full p-2 border rounded mb-2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="State"
                  className="w-full p-2 border rounded mb-2"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Street Number"
                  className="w-full p-2 border rounded mb-2"
                  value={streetNum}
                  onChange={(e) => setStreetNum(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Street Name"
                  className="w-full p-2 border rounded mb-2"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                />
              </>
            )}

            {role === "Seller" && (
              <>
                <input
                  type="text"
                  placeholder="Bank Routing Number"
                  className="w-full p-2 border rounded mb-2"
                  value={bankRouting}
                  onChange={(e) => setBankRouting(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  className="w-full p-2 border rounded mb-2"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </>
            )}

            <div className="flex gap-4 justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-400 text-white px-4 py-2 rounded cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleRegister}
                disabled={!isStep2Valid()}
                className={`px-4 py-2 rounded ${
                  isStep2Valid()
                    ? "bg-green-600 text-white cursor-pointer"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                Sign Up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
