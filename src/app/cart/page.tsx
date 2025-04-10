"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/db/models";
import { useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function ShoppingCart() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  useEffect(() => {
    if (session && (session.user.role as UserRole) !== "Buyer") {
      router.push("/");
    }
  }, [session, router]);

  if (!session) {
    return <LoadingScreen />;
  }

  return <></>;
}
