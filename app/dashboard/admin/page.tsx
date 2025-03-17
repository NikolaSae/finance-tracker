"use client";
import { useState, useEffect } from 'react';
import { useSession, update } from 'next-auth/react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      setImage(session.user.image || '');
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await fetch('/api/users/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.accessToken}`
      },
      body: JSON.stringify({ name, email }),
      credentials: 'include'
    });

    if (res.status === 401) {
      signOut({ callbackUrl: '/login?error=session_expired' });
      return;
    }

    // Obrada uspešnog odgovora...
  } catch (error) {
    console.error("💥 Greška pri ažuriranju:", error);
  } finally {
    setIsLoading(false);
  }
};

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          {image && (
            <div className="mt-2">
              <img 
                src={image} 
                alt="Profile preview" 
                className="w-24 h-24 object-cover rounded-full"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}