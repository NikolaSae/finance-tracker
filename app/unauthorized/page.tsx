import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div>
      <h1>Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
      <Link href="/">Go back to home</Link>
    </div>
  );
}