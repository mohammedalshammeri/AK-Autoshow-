'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/en');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="text-2xl font-bold mb-4">CarShow<span className="text-red-500">X</span></div>
        <p className="text-gray-400">Redirecting to English version...</p>
      </div>
    </div>
  );
}
