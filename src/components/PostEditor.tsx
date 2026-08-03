'use client'

import React, { useState } from 'react'
import { Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

interface PostEditorProps {
  initialContent: string
  topic: string
  coreMessage: string
  onPublish: (content: string) => void
  onRegenerate?: () => void
}

export function PostEditor({
  initialContent,
  topic,
  coreMessage,
  onPublish,
  onRegenerate,
}: PostEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  const charCount = content.length
  const maxChars = 500
  const isOverLimit = charCount > maxChars

  const handlePublish = async () => {
    if (isOverLimit || !content.trim()) return
    setPublishing(true)

    // Simulate Threads API publishing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    onPublish(content)
    setPublishing(false)
    setPublished(true)
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-zinc-200 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            Generated Single-Text Draft
          </h3>
          <p className="text-xs text-zinc-500 font-mono-custom">
            Review and refine your post before publishing directly to Threads.
          </p>
        </div>

        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs font-mono-custom transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-roll
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Column */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-700 block">Editable Content</label>
          <div className="relative">
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl p-4 text-sm text-zinc-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-sans-custom leading-relaxed shadow-sm"
            />

            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[11px] text-zinc-500 font-mono-custom">
                Target: {topic ? `"${topic}"` : 'Single post'}
              </span>

              <div className="flex items-center gap-2 font-mono-custom text-xs">
                <span className={isOverLimit ? 'text-rose-600 font-bold' : 'text-zinc-500'}>
                  {charCount}/{maxChars}
                </span>
                <div className="w-16 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isOverLimit ? 'bg-rose-500' : 'bg-purple-600'
                    }`}
                    style={{ width: `${Math.min((charCount / maxChars) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {isOverLimit && (
            <p className="text-xs text-rose-600 flex items-center gap-1.5 font-mono-custom font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> Exceeds Threads 500-character limit.
            </p>
          )}
        </div>

        {/* Live Preview Column */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-700 block">Threads Live Preview</label>
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-800">
                You
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">@creator_brand</span>
                  <span className="text-[11px] text-zinc-400 font-mono-custom">Now</span>
                </div>
                <div className="mt-2 text-xs text-zinc-800 whitespace-pre-wrap break-words leading-relaxed font-sans-custom">
                  {content || <span className="text-zinc-400 italic">Draft is empty...</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        <div className="text-xs text-zinc-500 font-mono-custom">
          {published ? (
            <span className="text-emerald-600 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Published to Threads successfully!
            </span>
          ) : (
            'Mock Threads OAuth API active'
          )}
        </div>

        <button
          onClick={handlePublish}
          disabled={publishing || isOverLimit || !content.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md"
        >
          {publishing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Publishing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Publish to Threads
            </>
          )}
        </button>
      </div>
    </div>
  )
}
