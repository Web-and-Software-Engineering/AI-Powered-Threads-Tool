'use client'

import React from 'react'
import { PenSquare, UserCheck, BarChart3, Sparkles } from 'lucide-react'

interface NavigationProps {
  activeTab: 'workspace' | 'profile' | 'analytics'
  setActiveTab: (tab: 'workspace' | 'profile' | 'analytics') => void
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-zinc-200/80 px-6 py-4 mb-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-zinc-900 flex items-center gap-2">
              ThreadCraft <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-semibold">AI MVP</span>
            </h1>
            <p className="text-xs text-zinc-500 font-mono-custom">Threads AI Content Engine</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'workspace'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <PenSquare className="w-4 h-4" />
            Generator
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Voice & Persona
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics & Loop
          </button>
        </nav>
      </div>
    </header>
  )
}
