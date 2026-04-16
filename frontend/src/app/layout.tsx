import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import PWAProvider from '@/components/pwa/PWAProvider'
import ChatBot from '@/components/chat/ChatBot'
import InstallPrompt from '@/components/pwa/InstallPrompt'
import MailingListSlider from '@/components/MailingListSlider'

export const metadata: Metadata = {
  title: 'EcoTrack - Smart Waste Management',
  description: 'Connecting households & businesses with reliable waste collectors using technology.',
}

export const viewport: Viewport = {
  themeColor: '#22c55e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <PWAProvider>
          {children}
          <ChatBot />
          <InstallPrompt />
          <MailingListSlider />
        </PWAProvider>
      </body>
    </html>
  )
}
