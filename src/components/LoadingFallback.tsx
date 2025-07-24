'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Loader2, RefreshCw } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export default function LoadingFallback({
  message = 'Cargando...',
  showRetry = false,
  onRetry,
}: LoadingFallbackProps) {
  const { refreshSession } = useAuth();

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      await refreshSession();
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] p-8'>
      <div className='flex flex-col items-center space-y-4'>
        <Loader2 className='h-8 w-8 animate-spin text-primary-600' />
        <p className='text-gray-600 text-center'>{message}</p>

        {showRetry && (
          <button
            onClick={handleRetry}
            className='flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-medical hover:bg-primary-700 transition-colors'
          >
            <RefreshCw className='h-4 w-4' />
            <span>Reintentar</span>
          </button>
        )}
      </div>
    </div>
  );
}
