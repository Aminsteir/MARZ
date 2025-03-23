"use client";
import Link from "next/link";
// import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  // const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-baseline">
      <h1 className="text-xl font-bold">
        <Link href="/">MARZ</Link>
      </h1>
      <div className="space-x-4">
        <Link href="/">Home</Link>
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
