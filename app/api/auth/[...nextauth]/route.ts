// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Недостају обавезна поља');
          }

          return await prisma.$transaction(async (tx) => {
            const user = await tx.users.findUnique({
              where: { email: credentials.email.toLowerCase() },
              select: {
                id: true,
                password: true,
                loginAttempts: true,
                lockedUntil: true,
                active: true,
                role: true,
                name: true
              }
            });

            // Провера закључаног налога
            if (user?.lockedUntil && new Date(user.lockedUntil) > new Date()) {
              throw new Error('Налог је закључан');
            }

            if (!user || !user.password || !user.active) {
              throw new Error('Невалидни креденцијали');
            }

            const isValid = await bcryptjs.compare(
              credentials.password,
              user.password
            );

            if (!isValid) {
              const updatedAttempts = user.loginAttempts + 1;
              await tx.users.update({
                where: { id: user.id },
                data: {
                  loginAttempts: updatedAttempts,
                  lockedUntil: updatedAttempts >= 3 
                    ? new Date(Date.now() + 900000) // 15 минута
                    : null
                }
              });
              throw new Error('Невалидна лозинка');
            }

            // Ресетуј бројач на успешну пријаву
            await tx.users.update({
              where: { id: user.id },
              data: {
                loginAttempts: 0,
                lockedUntil: null,
                lastLogin: new Date()
              }
            });

            return {
              id: user.id.toString(),
              email: credentials.email,
              name: user.name,
              role: user.role
            };
          });

        } catch (error) {
          console.error('Грешка при пријави:', {
            message: error.message,
            stack: error.stack,
            email: credentials?.email
          });
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 дана
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          role: token.role,
          name: token.name,
          email: token.email
        };
        session.expires = new Date(token.exp * 1000).toISOString();
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 дана
    updateAge: 60 * 60 // Освежи сесију сваких сат времена
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };