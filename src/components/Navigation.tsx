'use client'

import React from 'react'
import { PenSquare, FolderHeart, BarChart3, Sparkles } from 'lucide-react'

interface NavigationProps {
  activeTab: 'workspace' | 'profile' | 'analytics'
  setActiveTab: (tab: 'workspace' | 'profile' | 'analytics') => void
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  return (
    <>
      {/* Desktop Navigation Top Bar (hidden on mobile) */}
      <header className="hidden md:block sticky top-0 z-50 glass-panel border-b border-zinc-200/80 px-6 py-4 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-zinc-900 flex items-center gap-2">
                ThreadCraft <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-semibold">Pocket AI</span>
              </h1>
              <p className="text-xs text-zinc-500 font-mono-custom">Automated Reference & Rewrite Loop</p>
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
              <FolderHeart className="w-4 h-4" />
              Pocket & Audience
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

      {/* Mobile Header (Top Title Only) */}
      <header className="block md:hidden glass-panel border-b border-zinc-200/80 px-4 py-3 mb-6 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-zinc-900">ThreadCraft Pocket</h1>
            <p className="text-[10px] text-zinc-500 font-mono-custom">Automated Search & Analysis Loop</p>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (sticky bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200 flex justify-around items-center py-2 px-4 shadow-lg shadow-black/5">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'workspace' ? 'text-purple-600' : 'text-zinc-500'
          }`}
        >
          <PenSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-purple-600' : 'text-zinc-500'
          }`}
        >
          <FolderHeart className="w-5 h-5" />
          <span className="text-[10px] font-medium">Pocket</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'analytics' ? 'text-purple-600' : 'text-zinc-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Analytics</span>
        </button>
      </nav>
    </>
  )
}
