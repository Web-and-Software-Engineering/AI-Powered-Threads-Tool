'use client'

import React, { useState } from 'react'
import { BarChart3, RefreshCw, Sparkles, ThumbsUp, MessageCircle, Eye, Repeat, CheckCircle, Lightbulb, RefreshCw as RestartIcon, Copy } from 'lucide-react'

export interface PostItem {
  id: string
  topic: string
  coreMessage: string
  generatedContent: string
  status: string
  publishedAt: string
  analyticsSynced: boolean
  structureCloned?: boolean
  markedForRestart?: boolean
  metrics?: {
    likes: number
    replies: number
    views: number
    reposts: number
  }
  aiInsight?: string
}

interface AnalyticsDashboardProps {
  posts: PostItem[]
  onSyncAnalytics: () => void
}

export function AnalyticsDashboard({ posts, onSyncAnalytics }: AnalyticsDashboardProps) {
  const [syncing, setSyncing] = useState(false)
  const [syncedLogs, setSyncedLogs] = useState<string[]>([])

  const handleRunSync = async () => {
    setSyncing(true)
    setSyncedLogs([])

    // Simulate 24-hour sync cron job execution
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onSyncAnalytics()

    setSyncedLogs([
      'Fetched engagement metrics for posts published >= 24h ago.',
      'Analyzing performance vs baseline standards...',
      'Completed loop logic: High-engagement structures cloned, low-engagement queued for fresh scrapes.',
    ])
    setSyncing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in px-2 md:px-0">
      {/* Header & Sync Controller */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-zinc-900">Analysis & Restart Loop</h2>
          </div>
          <p className="text-xs text-zinc-500 font-mono-custom">
            Monitor post engagement and trigger automated structure clone/restart routines.
          </p>
        </div>

        <button
          onClick={handleRunSync}
          disabled={syncing}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Analyzing Loop...' : 'Sync Loop Metrics'}
        </button>
      </div>

      {/* Synced AI Insights Banner */}
      {syncedLogs.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-purple-200 bg-purple-50/60 space-y-2 animate-fade-in">
          <h3 className="text-xs font-bold text-purple-800 flex items-center gap-2 uppercase tracking-wider font-mono-custom">
            <Sparkles className="w-4 h-4 text-purple-600" /> Loop Actions Log
          </h3>
          <ul className="space-y-1.5 text-xs text-zinc-700 font-mono-custom">
            {syncedLogs.map((log, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {log}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-700">Loop Tracking Posts ({posts.length})</h3>

        {posts.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-zinc-200 text-center space-y-2">
            <Lightbulb className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-xs text-zinc-500">No posts in tracking loop. Publish a draft to start.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className={`glass-panel p-5 rounded-2xl border transition-all space-y-4 ${
                post.structureCloned 
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : post.markedForRestart 
                    ? 'border-rose-200 bg-rose-50/10'
                    : 'border-zinc-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-mono-custom text-purple-600 font-bold uppercase tracking-wider">
                    {post.topic || 'General Topic'}
                  </span>
                  <p className="text-xs text-zinc-800 mt-1 whitespace-pre-wrap font-sans-custom leading-relaxed">
                    {post.generatedContent}
                  </p>
                </div>
                
                {/* Visual loop state badges */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 font-mono-custom font-semibold">
                    {post.status}
                  </span>

                  {post.structureCloned && (
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono-custom font-bold flex items-center gap-1 animate-fade-in">
                      <Copy className="w-2.5 h-2.5" /> Cloned Structure
                    </span>
                  )}

                  {post.markedForRestart && (
                    <span className="text-[9px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-mono-custom font-bold flex items-center gap-1 animate-fade-in">
                      <RestartIcon className="w-2.5 h-2.5 animate-spin-slow" /> Marked for Restart
                    </span>
                  )}
                </div>
              </div>

              {/* Metrics row */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs font-mono-custom">
                <div className="flex items-center gap-4 md:gap-6 text-zinc-500">
                  <span className="flex items-center gap-1 hover:text-zinc-900 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5 text-purple-600" />
                    {post.metrics?.likes || 0}
                  </span>
                  <span className="flex items-center gap-1 hover:text-zinc-900 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                    {post.metrics?.replies || 0}
                  </span>
                  <span className="flex items-center gap-1 hover:text-zinc-900 transition-colors">
                    <Eye className="w-3.5 h-3.5 text-cyan-600" />
                    {post.metrics?.views || 0}
                  </span>
                  <span className="flex items-center gap-1 hover:text-zinc-900 transition-colors">
                    <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                    {post.metrics?.reposts || 0}
                  </span>
                </div>

                <span className="text-[10px] text-zinc-400">
                  Pub: {post.publishedAt}
                </span>
              </div>

              {post.aiInsight && (
                <div className={`p-3 rounded-xl border text-xs font-mono-custom flex items-center gap-2 ${
                  post.structureCloned 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : post.markedForRestart 
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-purple-50 border-purple-200 text-purple-900'
                }`}>
                  <Sparkles className={`w-3.5 h-3.5 shrink-0 ${
                    post.structureCloned 
                      ? 'text-emerald-600'
                      : post.markedForRestart 
                        ? 'text-rose-600'
                        : 'text-purple-600'
                  }`} />
                  {post.aiInsight}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
