import type { Metadata } from 'next';
import { AppProvider, Shell } from '@/suites/core';
import './globals.css';

export const metadata: Metadata = {
  title: 'Auth-Spine Platform',
  description: 'Universal business automation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
