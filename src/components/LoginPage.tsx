'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Building2, Lock, LogIn, Mail, User, UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { t } = useI18n();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
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
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        if (error instanceof Error) {
          if (error.message.includes('Invalid login credentials')) {
            // setError(t('auth.invalidCredentials')); // Original code had this line commented out
          } else if (error.message.includes('Email not confirmed')) {
            // setError(t('auth.emailNotConfirmed')); // Original code had this line commented out
          } else if (error.message.includes('Too many requests')) {
            // setError(t('auth.tooManyRequests')); // Original code had this line commented out
          } else {
            // setError(error.message); // Original code had this line commented out
          }
        } else {
          // setError(t('errors.general')); // Original code had this line commented out
        }
      } else {
        setSuccess(t('auth.loginSuccess'));
      }
    } catch {
      // setError('Error inesperado al iniciar sesión'); // Original code had this line commented out
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        if (error instanceof Error) {
          if (error.message.includes('User already registered')) {
            // setError(t('auth.userAlreadyExists')); // Original code had this line commented out
          } else if (error.message.includes('Password should be at least')) {
            // setError(t('validation.minLength', { min: 6 })); // Original code had this line commented out
          } else if (error.message.includes('Invalid email')) {
            // setError(t('validation.email')); // Original code had this line commented out
          } else {
            // setError(error.message); // Original code had this line commented out
          }
        } else {
          // setError(t('errors.general')); // Original code had this line commented out
        }
      } else {
        setSuccess(t('auth.registerSuccess'));
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterFullName('');
        setRegisterIdentityNumber('');
        setRegisterHospital('Diani Beach Hospital (Ukunda)');
        setRegisterJobPosition('Médico');
      }
    } catch {
      // setError('Error inesperado al registrar usuario'); // Original code had this line commented out
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
            {t('auth.title')}
          </h1>
          <p className='text-gray-600'>{t('auth.subtitle')}</p>
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
                    {t('auth.email')}
                  </label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='email'
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder={t('auth.emailPlaceholder', {
                        defaultValue: 'usuario@hospital.com',
                      })}
                      required
                      autoComplete='email'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t('auth.password')}
                  </label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='password'
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder={t('auth.passwordPlaceholder', {
                        defaultValue: '••••••••',
                      })}
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
                  {loading
                    ? t('auth.loggingIn', {
                        defaultValue: 'Iniciando sesión...',
                      })
                    : t('auth.login')}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t('auth.email')}
                  </label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='email'
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder={t('auth.emailPlaceholder', {
                        defaultValue: 'usuario@hospital.com',
                      })}
                      required
                      autoComplete='email'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t('auth.fullName')}
                  </label>
                  <div className='relative'>
                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='text'
                      value={registerFullName}
                      onChange={e => setRegisterFullName(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder={t('auth.fullNamePlaceholder', {
                        defaultValue: 'Juan Pérez',
                      })}
                      required
                      autoComplete='name'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t('auth.identityNumber')}
                  </label>
                  <div className='relative'>
                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='text'
                      value={registerIdentityNumber}
                      onChange={e => setRegisterIdentityNumber(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder={t('auth.identityNumberPlaceholder', {
                        defaultValue: '123456789',
                      })}
                      required
                      autoComplete='off'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t('auth.hospital')}
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
                      {t('hospitals.dianiBeach')}
                    </option>
                    <option value='Palm Beach Hospital (Ukunda)'>
                      {t('hospitals.palmBeach')}
                    </option>
                    <option value='Diani Health Center (Ukunda)'>
                      {t('hospitals.dianiHealth')}
                    </option>
                    <option value='Pendo Duruma Medical Centre (Kwale County)'>
                      {t('hospitals.pendoDuruma')}
                    </option>
                    <option value='Ukunda Medical Clinic (Ukunda)'>
                      {t('hospitals.ukundaMedical')}
                    </option>
                    <option value='Sunshine Medical Clinic (Kwale County)'>
                      {t('hospitals.sunshineMedical')}
                    </option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t('auth.jobPosition')}
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
                    <option value='Director'>
                      {t('jobPositions.director')}
                    </option>
                    <option value='Médico'>{t('jobPositions.doctor')}</option>
                    <option value='Asistente'>
                      {t('jobPositions.assistant')}
                    </option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t('auth.password')}
                  </label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='password'
                      value={registerPassword}
                      onChange={e => setRegisterPassword(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder={t('auth.passwordPlaceholder', {
                        defaultValue: '••••••••',
                      })}
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
                  {loading
                    ? t('auth.registering', { defaultValue: 'Registrando...' })
                    : t('auth.register')}
                </button>
              </form>
            )}
            {/* Error/Success Messages */}
            {/* Error/Success Messages */}
            {success && (
              <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-md'>
                <p className='text-green-800 text-sm'>{success}</p>
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className='text-center mt-6'>
          <p className='text-sm text-gray-600'>{t('auth.footer')}</p>
        </div>
      </div>
    </div>
  );
}
