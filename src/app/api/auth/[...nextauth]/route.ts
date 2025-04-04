import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateUserCredentials, getUserRole } from "@/services/userService";

// Defining authentication options for NextAuth
export const authOptions: AuthOptions = {
  session: { strategy: "jwt" }, // Using JWT for session management
  secret: process.env.NEXTAUTH_SECRET, // String used to hash tokens and sign cookies.
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate email and pw are inputted
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        // Authenticate user against the database
        const user = await validateUserCredentials(
          credentials.email,
          credentials.password,
        );

        if (!user) {
          throw new Error("Invalid Email or Password");
        }

        // Get user role (Seller, Helpdesk, Buyer)
        const userRole = await getUserRole(user.email);

        // Return user data if the authetication is successful
        return { id: user.email, email: user.email, role: userRole };
      },
    }),
    // sign-in verification with email and password
    // TODO: May want to provide the user-type (helpdesk, seller, buyer) as well for more granular access control
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Attach user email and role to JWT token
      if (user) {
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.email) {
        // Attach user email and role to session
        session.user.email = token.email as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom login page
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
