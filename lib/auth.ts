import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import type { Adapter } from "next-auth/adapters";

export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // Dodajte vaše provajdere
  ],
  callbacks: {
    async session({ session, token }) { // Uklonjen 'user' parametar
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Dodajemo role pri prvom loginu
      if (user) {
        token.role = user.role || "user"; // Fallback na default role
        token.sub = user.id;
      }
      
      // Ažuriranje role nakon promene kroz API
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-auth-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  }
};

export default NextAuth(authOptions);