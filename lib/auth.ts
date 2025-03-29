// lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Пронађи корисника
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email }
        });

        if (!user) return null;

        // 2. Провери лозинку
        const pepperedPassword = credentials!.password + (process.env.BCRYPT_PEPPER || '');
        const isValid = await new Promise(resolve => {
          bcrypt.compare(pepperedPassword, user.password || '', (err, result) => {
            setTimeout(() => resolve(result), 500);
          });
        });

        // 3. Врати објекат који ће бити сачуван у токену
        return isValid ? {
          id: user.id,
          email: user.email,
          role: user.role // Додајте ово ако користите роле
        } : null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "user";
        token.sub = user.id;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дана
  },
  pages: {
    signIn: "/login", // Пут до вашег login page-а
  },
  debug: process.env.NODE_ENV === "development" // Омогући дебаг
};

export default NextAuth(authOptions);
