import './globals.css';
import { Inter } from 'next/font/google';
import LayoutClient from '../components/LayoutClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ProjectStruct',
  description: 'Plateforme d’incubation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}