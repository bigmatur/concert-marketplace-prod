import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Concert Marketplace',
  description: 'Маркетплейс для организации концертов и событий',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}