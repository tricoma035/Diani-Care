import ClientAuthProvider from '@/components/ClientAuthProvider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Gestión Hospitalaria - Kenia',
  description: 'Sistema de gestión de pacientes para hospitales en Kenia',
  keywords:
    'hospital, gestión, pacientes, Kenia, sistema médico, Diani Beach Hospital',
  authors: [{ name: 'Sistema Hospitalario Kenia' }],
  creator: 'Sistema Hospitalario Kenia',
  publisher: 'Sistema Hospitalario Kenia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://diani-care.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Sistema de Gestión Hospitalaria - Kenia',
    description: 'Sistema de gestión de pacientes para hospitales en Kenia',
    url: 'https://diani-care.vercel.app',
    siteName: 'Sistema Hospitalario Kenia',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        alt: 'Sistema de Gestión Hospitalaria - Kenia',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistema de Gestión Hospitalaria - Kenia',
    description: 'Sistema de gestión de pacientes para hospitales en Kenia',
    images: ['/favicon.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es'>
      <head>
        <link rel='icon' href='/favicon.png' type='image/png' />
        <link rel='icon' href='/favicon.ico' type='image/x-icon' />
        <link rel='apple-touch-icon' href='/favicon.png' />
        <meta name='theme-color' content='#2563eb' />
        <meta name='msapplication-TileColor' content='#2563eb' />
      </head>
      <body className={inter.className}>
        <ClientAuthProvider>{children}</ClientAuthProvider>
      </body>
    </html>
  );
}
