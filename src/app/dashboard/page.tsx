"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BuyerDash from "./buyer";
import HelpdeskDash from "./helpdesk";
import SellerDash from "./seller";
import { UserRole } from "@/db/models";
import LoadingScreen from "@/components/LoadingScreen";

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  if (!session) {
    return <LoadingScreen />;
  }

  const userRole: UserRole = session.user.role;

  // Check the user's role and render the dashboard
  let DashboardComponent: React.FC;

  if (userRole === "Buyer") {
    DashboardComponent = BuyerDash;
  } else if (userRole === "Seller") {
    DashboardComponent = SellerDash;
  } else if (userRole === "Helpdesk") {
    DashboardComponent = HelpdeskDash;
  } else {
    return <></>;
  }

  return <DashboardComponent />; // Render the appropriate dashboard component
}
