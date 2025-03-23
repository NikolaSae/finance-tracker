'use client';
import { useEffect, useState } from 'react';

export default function EmailProcessingStatus() {
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const fetchLastCheck = async () => {
      const res = await fetch('/api/email-webhook/last-check');
      const data = await res.json();
      setLastCheck(new Date(data.lastCheck));
    };

    fetchLastCheck();
    const interval = setInterval(fetchLastCheck, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <p className="text-sm text-gray-600">
        Последња провера мејлова: {lastCheck ? lastCheck.toLocaleTimeString() : '...'}
      </p>
    </div>
  );
}