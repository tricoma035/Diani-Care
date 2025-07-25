import ClientAuthProvider from '@/components/ClientAuthProvider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Gestión Hospitalaria - Kenia',
  description: 'Sistema de gestión de pacientes para hospitales en Kenia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es'>
      <body className={inter.className}>
        <ClientAuthProvider>{children}</ClientAuthProvider>
      </body>
    </html>
  );
}
