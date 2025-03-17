import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return <p>Access denied. Please log in as admin.</p>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user.email}</p>
    </div>
  );
}