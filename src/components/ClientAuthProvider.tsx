'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar hidratación incorrecta
  if (!mounted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Inicializando...</p>
        </div>
      </div>
    );
  }

  return <AuthProvider>{children}</AuthProvider>;
}
