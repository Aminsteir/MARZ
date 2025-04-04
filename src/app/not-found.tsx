"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center p-4 h-[calc(100vh-80px)]">
      <h1 className="text-xl font-bold text-center">Page Not Found</h1>
      <button
        onClick={() => router.push("/")}
        className="bg-transparent outline-1 border-black text-black px-4 py-2 rounded cursor-pointer mt-8 w-full max-w-60"
      >
        Return Home
      </button>
    </div>
  );
}
