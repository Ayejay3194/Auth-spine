import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StyleSeat Full Platform',
  description: 'Enterprise-grade business management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
