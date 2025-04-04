// Importing libraries and necessary definitions
"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession(); // getting the logged-in user session data
  //const router = useRouter(); // init. Next.js router for navigation

  useEffect(() => {
    console.log(session?.user);
  }, [session]);

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
  return session ? (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
      <div role="status">
        <svg
          aria-hidden="true"
          className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading Dashboard</span>
      </div>
      <p className="mt-2">Loading Dashboard</p>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center p-4">
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

      <p className="text-gray-500 mt-4">You are not logged in</p>
    </div>
  );
}
