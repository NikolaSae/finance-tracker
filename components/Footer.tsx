"use client";
import { useSession } from 'next-auth/react';

export default function Footer() {
  const { data: session } = useSession();

  return (
    <footer>
      <p>© 2023 Finance Tracker</p>
      {session && <p>Logged in as: {session.user.email}</p>}
    </footer>
  );
}