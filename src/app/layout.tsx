
import './globals.css';
import { Inter } from 'next/font/google';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HRMS - Modern Workplace',
  description: 'Human Resource Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <AppProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
