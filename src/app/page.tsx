// Importing libraries and necessary definitions
"use client";
import { useSession } from "next-auth/react";
//import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image"; 

export default function Home() {
  const { data: session } = useSession(); // getting the logged-in user session data
  //const router = useRouter(); // init. Next.js router for navigation

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

 /* Home Page contents */
 return (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    {/* Image Container: Centers the image proportionally on the screen */}
    <div className="relative w-full max-w-2xl flex justify-center">
      <Image
        src="/marz-logo.jpg" 
        alt="MARZ Logo"
        width={400} // Adjust width to fit layout
        height={200} // Adjust height to fit layout
        className="rounded-lg shadow-lg object-contain" // Responsive styling
        priority // Ensures the image loads fast
      />
    </div>

    {/* Welcome Message */}
    <h1 className="text-3xl font-bold mt-6 text-center">
      Welcome to MARZ, a NittanyBusiness
    </h1>

    {/* Status Message: Shows login state */}
    {session ? (
      <p className="text-green-500 mt-4">Redirecting to your dashboard...</p>
    ) : (
      <p className="text-gray-500 mt-4">You are not logged in</p>
    )}
  </div>
);
}