import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Voice Terminal Web',
  description: 'AI-powered voice terminal with ChatGPT, GPT-4, and Perplexity integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-terminal-bg text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
