"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession(); // getting the logged-in user session data
  const router = useRouter();

  /* If the user successfully logs in, the below will redirect them to their dashboard*/
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]); // runs effect when session or the router changes

  /* Home Page contents */
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl flex justify-center mt-4">
        <Image
          src="/marz-logo.jpg"
          alt="MARZ Logo"
          width={400} // Adjust width to fit layout
          height={200} // Adjust height to fit layout
          className="rounded-lg shadow-2xl object-contain" // Responsive styling
          priority // Ensures the image loads fast
        />
      </div>

      <h1 className="text-3xl font-bold mt-6 text-center">
        Welcome to MARZ, a NittanyBusiness
      </h1>

      {!session ? (
        <button
          onClick={() => router.push("/login")}
          className="bg-transparent outline-1 border-black text-black px-4 py-2 rounded cursor-pointer mt-6 w-full max-w-60"
        >
          Log In
        </button>
      ) : (
        <></>
      )}
    </div>
  );
}
