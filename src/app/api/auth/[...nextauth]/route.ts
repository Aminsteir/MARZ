import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateUserCredentials } from "@/services/userService";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await validateUserCredentials(
          credentials.email,
          credentials.password,
        );

        if (!user) {
          throw new Error("Invalid Email or Password");
        }

        return { id: user.email, email: user.email };
      },
    }),
    // sign-in verification with email and password
    // TODO: May want to provide the user-type (helpdesk, seller, buyer) as well for more granular access control
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email; // Set user email to the JWT token
      }
      return token;
    },
    async session({ session, token }) {
      if (token.email) {
        session.user.email = token.email as string; // Set user email to be available on the client session
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
