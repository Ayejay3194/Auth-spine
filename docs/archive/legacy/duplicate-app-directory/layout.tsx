import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Business Spine - Service Business Assistant',
  description: 'Deterministic assistant for service businesses - booking, CRM, payments, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {children}
      </body>
    </html>
  )
}
