"use client";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  // Very simple homepage displaying the user's email if they are logged in

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold">Welcome to MARZ, a NittanyBusiness</h1>
      {session ? (
        <p className="text-green-500 mt-4">
          You are logged in as {session.user?.email}
        </p>
      ) : (
        <p className="text-gray-500 mt-4">You are not logged in</p>
      )}
    </div>
  );
}
