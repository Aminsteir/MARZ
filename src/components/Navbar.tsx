"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between">
      <h1 className="text-xl font-bold">
        <Link href="/">MARZ</Link>
      </h1>
      <div className="space-x-4">
        <Link className={pathname === "/" ? "text-blue-600" : ""} href="/">
          Home
        </Link>
        {session ? (
          <button onClick={() => signOut()}>Logout</button>
        ) : (
          <Link
            className={pathname === "/login" ? "text-blue-600" : ""}
            href="/login"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
