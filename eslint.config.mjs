import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

/**
 * Configuración ESLint en formato flat para Next.js 15 y ESLint 9
 * - Incluye reglas de Next.js, TypeScript y personalizadas
 * - Compatible con el nuevo sistema de configuración
 */
export default [
  // Reglas base de Next.js y TypeScript
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Reglas personalizadas y ajustes de lenguaje
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      '@next/next/no-server-import-in-page': 'off',
    },
  },
];
