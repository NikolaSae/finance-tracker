"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function HomePage() {
  const router = useRouter();

  // Fetch session on the server
  const session = await getServerSession(authOptions);

  useEffect(() => {
    // If session exists, redirect to dashboard
    if (session) {
      router.push('/dashboard');
    } else {
      // If no session, redirect to login page
      router.push('/auth/login');
    }
  }, [session, router]);

  // You can add a loading state or message here while the redirect is being handled
  return <div>Loading...</div>;
}
