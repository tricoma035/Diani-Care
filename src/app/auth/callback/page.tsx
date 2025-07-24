'use client';

import { supabase } from '@/lib/supabase';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('Verificando tu cuenta...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setMessage('Error al verificar la cuenta');
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage('¡Cuenta verificada exitosamente! Redirigiendo...');

          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('No se pudo verificar la cuenta');
        }
      } catch {
        setStatus('error');
        setMessage('Error inesperado');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center'>
        {status === 'loading' && (
          <>
            <Loader2 className='h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Verificando cuenta
            </h2>
            <p className='text-gray-600'>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className='h-12 w-12 text-green-600 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              ¡Verificación exitosa!
            </h2>
            <p className='text-gray-600'>{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className='h-12 w-12 text-red-600 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Error de verificación
            </h2>
            <p className='text-gray-600 mb-4'>{message}</p>
            <button
              onClick={() => router.push('/')}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
}
