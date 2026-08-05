import React from 'react'
import { Navigation } from '@/components/Navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans-custom">
      <main className="flex-1 px-4 md:px-6 pt-6 pb-28 md:pb-32">
        {children}
      </main>
      <Navigation />
    </div>
  )
}
