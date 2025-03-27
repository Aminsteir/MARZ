// Importing libraries and necessary definitions
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { data: session } = useSession(); // getting the logged-in user session data
  const router = useRouter(); // init. Next.js router for navigation

  /* If the user successfully logs in, the below will redirect them based on their role*/
  // useEffect(() => {
  //   if (session) {
  //     switch (session.user.role) {
  //       case "buyer": 
  //         router.push("/dashboard/buyer"); //redirect buyer to their dashboard
  //         break;
  //       case "seller":
  //         router.push("/dashboard/seller"); //redirect seller to their dashboard
  //         break;
  //       case "helpdesk":
  //         router.push("/dashboard/helpdesk"); //redirect HelpDesk staff to their dashboard
  //         break;
  //       default:
  //         router.push("/login"); // redirect to login if the role is undefined
  //     }
  //   }
  // }, [session, router]); // runs effect when session or the router changes

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold">Welcome to MARZ, a NittanyBusiness</h1>
      {session ? (
        // If the user is logged in, this shows a message indicating redirection
        <p className="text-green-500 mt-4">Redirecting to your dashboard...</p>
      ) : (
        // If the user is not logged in, this will prompt them to log in 
        <p className="text-gray-500 mt-4">You are not logged in</p>
      )}
    </div>
  );
}
