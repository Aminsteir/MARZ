"use client";
import { useRouter } from "next/navigation";

export default function HelpdeskDash() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">Helpdesk Dashboard</h1>

      {/* Navigation buttons */}
      <div className="flex flex-row w-full justify-center items-center mt-4 gap-4">
        <button
          onClick={() => router.push("/update-profile")}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full max-w-40 cursor-pointer"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
}
