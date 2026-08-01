'use client'

import React, { useState } from 'react'
import { BarChart3, RefreshCw, Sparkles, ThumbsUp, MessageCircle, Eye, Repeat, CheckCircle, Lightbulb } from 'lucide-react'

export interface PostItem {
  id: string
  topic: string
  coreMessage: string
  generatedContent: string
  status: string
  publishedAt: string
  analyticsSynced: boolean
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
      'Fetched engagement metrics for 3 recent posts via Threads API.',
      'Post "Why 90% of creators fail" achieved +142% engagement vs. baseline.',
      'AI Feedback Loop: Extracted numbered list hook pattern into Golden References.',
      'Updated User Profile style rules with high-performing phrasing guidelines.',
    ])
    setSyncing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header & Sync Controller */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-zinc-900">Analytics & AI Feedback Loop</h2>
          </div>
          <p className="text-xs text-zinc-500 font-mono-custom">
            Monitor post performance and trigger 24h post-publishing AI feedback refinement.
          </p>
        </div>

        <button
          onClick={handleRunSync}
          disabled={syncing}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/30 transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing 24h Metrics...' : 'Run 24h Sync & AI Feedback'}
        </button>
      </div>

      {/* Synced AI Insights Banner */}
      {syncedLogs.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-purple-200 bg-purple-50/60 space-y-2 animate-fade-in">
          <h3 className="text-xs font-bold text-purple-800 flex items-center gap-2 uppercase tracking-wider font-mono-custom">
            <Sparkles className="w-4 h-4 text-purple-600" /> AI Feedback Loop Insights
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
        <h3 className="text-sm font-bold text-zinc-700">Published Posts ({posts.length})</h3>

        {posts.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-zinc-200 text-center space-y-2">
            <Lightbulb className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-xs text-zinc-500">No published posts yet. Generate and publish a post in the Workspace first!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="glass-panel p-5 rounded-2xl border border-zinc-200 hover:border-purple-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono-custom text-purple-600 font-bold uppercase tracking-wider">
                    {post.topic || 'General Topic'}
                  </span>
                  <p className="text-xs text-zinc-800 mt-1 whitespace-pre-wrap font-sans-custom leading-relaxed">
                    {post.generatedContent}
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono-custom font-semibold">
                  {post.status}
                </span>
              </div>

              {/* Metrics row */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs font-mono-custom">
                <div className="flex items-center gap-5 text-zinc-600">
                  <span className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5 text-purple-600" />
                    {post.metrics?.likes || 0}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                    {post.metrics?.replies || 0}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors">
                    <Eye className="w-3.5 h-3.5 text-cyan-600" />
                    {post.metrics?.views || 0}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors">
                    <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                    {post.metrics?.reposts || 0}
                  </span>
                </div>

                <span className="text-[11px] text-zinc-400">
                  Published: {post.publishedAt}
                </span>
              </div>

              {post.aiInsight && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-mono-custom flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
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
