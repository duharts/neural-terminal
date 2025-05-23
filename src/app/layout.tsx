import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Neural Terminal',
  description: 'AI-powered voice terminal with cyberpunk interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
