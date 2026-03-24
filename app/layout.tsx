import type {Metadata} from 'next';
import { Inter, Space_Grotesk, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'CLm - Gamified Habit Tracker',
  description: 'A gamified habit tracker that lets you earn points, build streaks, and level up while building good habits.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-inter" suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
