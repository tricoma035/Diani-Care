'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'es', name: t('language.spanish'), flag: '🇪🇸' },
    { code: 'en', name: t('language.english'), flag: '🇺🇸' },
    { code: 'sw', name: t('language.swahili'), flag: '🇹🇿' },
  ];

  const currentLanguage =
    languages.find(lang => lang.code === language) || languages[1];

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode as 'es' | 'en' | 'sw');
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
        aria-label={t('language.changeLanguage')}
      >
        <Globe className='w-4 h-4' />
        <span className='text-lg'>{currentLanguage.flag}</span>
        <span className='hidden sm:inline'>{currentLanguage.name}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50'>
          <div className='py-1'>
            {languages.map(language => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  language === language.code
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700'
                }`}
              >
                <span className='text-lg'>{language.flag}</span>
                <span>{language.name}</span>
                {language === language.code && (
                  <div className='ml-auto w-2 h-2 bg-blue-600 rounded-full'></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay para cerrar el dropdown */}
      {isOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default LanguageSelector;
