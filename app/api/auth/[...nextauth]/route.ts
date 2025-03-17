import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.users.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) return null;

        const isValidPassword = await bcryptjs.compare(
          credentials.password, 
          user.password
        );

        if (!isValidPassword) return null;

        return { 
          id: user.id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.image = user.image;
        
        await prisma.users.update({
          where: { id: parseInt(user.id) },
          data: { lastlogin: new Date() }
        });
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        role: token.role,
        name: token.name,
        image: token.image
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };