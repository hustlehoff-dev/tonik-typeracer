import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import './globals.css';

export const metadata: Metadata = {
  title: 'TypeRacer — Real-Time Typing Competition',
  description:
    'Compete against others in a live typing race. Track your WPM and accuracy in real time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
