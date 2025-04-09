"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Orbit } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const homePage = session ? "/dashboard" : "/";

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-baseline">
      <div className="flex flex-row gap-4 items-center justify-start">
        <Link href={homePage}>
          <Orbit />
        </Link>
        <Link href={homePage}>
          <h1 className="text-xl font-bold">MARZ</h1>
        </Link>
      </div>
      <div className="space-x-4">
        <Link href={homePage}>Home</Link>
        {session ? (
          <button className="cursor-pointer" onClick={() => signOut()}>
            Logout
          </button>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
