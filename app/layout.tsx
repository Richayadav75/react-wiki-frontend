import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'React Wiki — Learn React Concepts',
  description:
    'A curated reference portal for exploring React hooks, patterns, and fundamentals with clear examples and pitfall warnings.',
  keywords: ['React', 'hooks', 'useState', 'useEffect', 'learning', 'reference'],
  openGraph: {
    title: 'React Wiki',
    description: 'Your personal React learning reference portal.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Navbar />
        <main style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
