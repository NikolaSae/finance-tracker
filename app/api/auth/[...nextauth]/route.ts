import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

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

          const user = await prisma.users.findUnique({
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

          // Check if account is locked
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
            await prisma.users.update({
              where: { id: user.id },
              data: {
                loginAttempts: updatedAttempts,
                lockedUntil: updatedAttempts >= 3 
                  ? new Date(Date.now() + 900000) // 15 minutes lock
                  : null
              }
            });
            throw new Error('Невалидна лозинка');
          }

          // Reset login attempts on successful login
          await prisma.users.update({
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
  session: {
    strategy: "jwt",
    maxAge: 86400 * 7, // 7 dana
    updateAge: 86400, // Osveži token svaki dan
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }

      if (user) {
        const expiresIn = 60 * 60 * 24 * 7; // 7 dana u sekundama
        token.jti = crypto.randomBytes(16).toString('hex');
        const expirationDate = new Date(Date.now() + expiresIn * 1000); // Convert to milliseconds
        expirationDate.setHours(23, 59, 59, 999); // Set to end of the day (23:59:59.999)

        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;

        token.exp = Math.floor(expirationDate.getTime() / 1000); // Set expiration in seconds

        // Store expiration time to calculate the countdown
        token.countdown = expirationDate.getTime();
        console.log('JWT expires value:', token.exp); // Log for debugging
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

        const currentTime = Date.now();
        const timeLeft = token.countdown - currentTime; // Time remaining in milliseconds

        if (timeLeft > 0) {
          // Calculate days, hours, minutes, and seconds
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

          // Format the countdown as d hh:mm:ss
          session.countdownFormatted = `${days} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
          session.countdownFormatted = "Expired";
        }
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 4 hours
    updateAge: 60 * 60 // Refresh session every hour
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
