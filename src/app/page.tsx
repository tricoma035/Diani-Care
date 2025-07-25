'use client';

import Dashboard from '@/components/Dashboard';
import LanguageSelector from '@/components/LanguageSelector';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import { I18nProvider } from '@/lib/i18n';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, appUser, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mostrar loading mientras se verifica la autenticación o durante la hidratación
  if (loading || !isClient) {
    return (
      <I18nProvider>
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Cargando...</p>
            <p className='mt-2 text-sm text-gray-500'>
              {loading
                ? 'Verificando autenticación...'
                : 'Inicializando aplicación...'}
            </p>
          </div>
        </div>
      </I18nProvider>
    );
  }

  // Si no hay usuario autenticado, mostrar página de login con selector de idioma
  if (!user || !appUser) {
    return (
      <I18nProvider>
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
          {/* Header con selector de idioma */}
          <div className='absolute top-4 right-4 z-10'>
            <LanguageSelector />
          </div>
          <LoginPage />
        </div>
      </I18nProvider>
    );
  }

  // Si el usuario está autenticado, mostrar dashboard
  return (
    <I18nProvider>
      <Dashboard />
    </I18nProvider>
  );
}
