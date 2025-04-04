"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">Dashboard</h1>
      <div className="w-md p-10 mt-10 bg-white shadow-md rounded flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Welcome to your Dashboard!</h2>
        <p>Here you can manage your account and settings.</p>
      </div>
    </div>
  );
}
