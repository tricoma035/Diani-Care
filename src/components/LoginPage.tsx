'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Building2, User, Lock, Mail, UserPlus, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados para registro
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerIdentityNumber, setRegisterIdentityNumber] = useState('');
  const [registerHospital, setRegisterHospital] = useState<
    | 'Diani Beach Hospital (Ukunda)'
    | 'Palm Beach Hospital (Ukunda)'
    | 'Diani Health Center (Ukunda)'
    | 'Pendo Duruma Medical Centre (Kwale County)'
    | 'Ukunda Medical Clinic (Ukunda)'
    | 'Sunshine Medical Clinic (Kwale County)'
  >('Diani Beach Hospital (Ukunda)');
  const [registerJobPosition, setRegisterJobPosition] = useState<
    'Director' | 'Médico' | 'Asistente'
  >('Médico');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await signIn(loginEmail, loginPassword);

      if (error) {
        // Manejar errores específicos de Supabase
        if (error instanceof Error) {
          if (error.message.includes('Invalid login credentials')) {
            setError(t('auth.invalidCredentials'));
          } else if (error.message.includes('Email not confirmed')) {
            setError(t('auth.emailNotConfirmed'));
          } else if (error.message.includes('Too many requests')) {
            setError(t('auth.tooManyRequests'));
          } else {
            setError(error.message);
          }
        } else {
          setError(t('errors.general'));
        }
      } else {
        setSuccess(t('auth.loginSuccess'));
      }
    } catch (error) {
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await signUp(
        registerEmail,
        registerPassword,
        registerFullName,
        registerIdentityNumber,
        registerHospital,
        registerJobPosition
      );

      if (error) {
        // Manejar errores específicos de Supabase
        if (error instanceof Error) {
          if (error.message.includes('User already registered')) {
            setError(t('auth.userAlreadyExists'));
          } else if (error.message.includes('Password should be at least')) {
            setError(t('validation.minLength', { min: 6 }));
          } else if (error.message.includes('Invalid email')) {
            setError(t('validation.email'));
          } else {
            setError(error.message);
          }
        } else {
          setError(t('errors.general'));
        }
      } else {
        setSuccess(t('auth.registerSuccess'));
        // Limpiar formulario
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterFullName('');
        setRegisterIdentityNumber('');
        setRegisterHospital('Diani Beach Hospital (Ukunda)');
        setRegisterJobPosition('Médico');
      }
    } catch (error) {
      setError('Error inesperado al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4'>
            <Building2 className='h-8 w-8 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Sistema Hospitalario
          </h1>
          <p className='text-gray-600'>
            Gestión de pacientes y profesionales médicos
          </p>
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-lg shadow-xl overflow-hidden'>
          <div className='flex'>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className='flex items-center justify-center space-x-2'>
                <LogIn className='h-4 w-4' />
                <span>{t('auth.login')}</span>
              </div>
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className='flex items-center justify-center space-x-2'>
                <UserPlus className='h-4 w-4' />
                <span>{t('auth.register')}</span>
              </div>
            </button>
          </div>

          <div className='p-6'>
            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLogin} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Email
                  </label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='email'
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='usuario@hospital.com'
                      required
                      autoComplete='email'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Contraseña
                  </label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='password'
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='••••••••'
                      required
                      autoComplete='current-password'
                    />
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Email
                  </label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='email'
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='usuario@hospital.com'
                      required
                      autoComplete='email'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Nombre Completo
                  </label>
                  <div className='relative'>
                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='text'
                      value={registerFullName}
                      onChange={e => setRegisterFullName(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Juan Pérez'
                      required
                      autoComplete='name'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Número de Identidad
                  </label>
                  <div className='relative'>
                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='text'
                      value={registerIdentityNumber}
                      onChange={e => setRegisterIdentityNumber(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='123456789'
                      required
                      autoComplete='off'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Hospital
                  </label>
                  <select
                    value={registerHospital}
                    onChange={e =>
                      setRegisterHospital(
                        e.target.value as
                          | 'Diani Beach Hospital (Ukunda)'
                          | 'Palm Beach Hospital (Ukunda)'
                          | 'Diani Health Center (Ukunda)'
                          | 'Pendo Duruma Medical Centre (Kwale County)'
                          | 'Ukunda Medical Clinic (Ukunda)'
                          | 'Sunshine Medical Clinic (Kwale County)'
                      )
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    required
                  >
                    <option value='Diani Beach Hospital (Ukunda)'>
                      Diani Beach Hospital (Ukunda)
                    </option>
                    <option value='Palm Beach Hospital (Ukunda)'>
                      Palm Beach Hospital (Ukunda)
                    </option>
                    <option value='Diani Health Center (Ukunda)'>
                      Diani Health Center (Ukunda)
                    </option>
                    <option value='Pendo Duruma Medical Centre (Kwale County)'>
                      Pendo Duruma Medical Centre (Kwale County)
                    </option>
                    <option value='Ukunda Medical Clinic (Ukunda)'>
                      Ukunda Medical Clinic (Ukunda)
                    </option>
                    <option value='Sunshine Medical Clinic (Kwale County)'>
                      Sunshine Medical Clinic (Kwale County)
                    </option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Puesto de Trabajo
                  </label>
                  <select
                    value={registerJobPosition}
                    onChange={e =>
                      setRegisterJobPosition(
                        e.target.value as 'Director' | 'Médico' | 'Asistente'
                      )
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    required
                  >
                    <option value='Director'>Director</option>
                    <option value='Médico'>Médico</option>
                    <option value='Asistente'>Asistente</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Contraseña
                  </label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='password'
                      value={registerPassword}
                      onChange={e => setRegisterPassword(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='••••••••'
                      required
                      minLength={6}
                      autoComplete='new-password'
                    />
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className='w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
              </form>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-md'>
                <p className='text-red-800 text-sm'>{error}</p>
              </div>
            )}

            {success && (
              <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-md'>
                <p className='text-green-800 text-sm'>{success}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='text-center mt-6'>
          <p className='text-sm text-gray-600'>
            Sistema de gestión hospitalaria para profesionales médicos
          </p>
        </div>
      </div>
    </div>
  );
}
