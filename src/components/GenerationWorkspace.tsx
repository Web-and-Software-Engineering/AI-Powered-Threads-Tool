'use client'

import React, { useState } from 'react'
import { Sparkles, MessageSquare, Lightbulb, Link2 } from 'lucide-react'
import { ProfileData } from './ProfileWorkspace'
import { PostEditor } from './PostEditor'
import { generateThreadsPost } from '@/app/actions/generate'

interface GenerationWorkspaceProps {
  profile: ProfileData
  onPostCreated: (post: {
    topic: string
    coreMessage: string
    referencePosts: string
    generatedContent: string
    status: string
  }) => void
}

export function GenerationWorkspace({ profile, onPostCreated }: GenerationWorkspaceProps) {
  const [topic, setTopic] = useState('')
  const [coreMessage, setCoreMessage] = useState('')
  const [referencePosts, setReferencePosts] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setGenerating(true)
    setGeneratedDraft(null)

    try {
      const draft = await generateThreadsPost({
        topic,
        coreMessage,
        referencePosts,
        authorPersona: profile.authorPersona,
        targetAudience: profile.targetAudience,
        preferredTone: profile.preferredTone,
        writingStyleRules: profile.writingStyleRules,
      })
      setGeneratedDraft(draft)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const handlePublish = (finalContent: string) => {
    onPostCreated({
      topic,
      coreMessage,
      referencePosts,
      generatedContent: finalContent,
      status: 'published',
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Input Form */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-200 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Create New Threads Post</h2>
            <p className="text-xs text-zinc-500 font-mono-custom">
              AI Generator applying your Author Persona & Target Audience rules.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-700 flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5" />
                Core Topic / Idea
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Why 90% of creators fail on Threads"
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Core Message / Value Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-700 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Key Message / Value Delivered
              </label>
              <input
                type="text"
                value={coreMessage}
                onChange={(e) => setCoreMessage(e.target.value)}
                placeholder="e.g., Consistency + strong hooks beat random high-frequency posting."
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          {/* Reference Posts */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5" />
              Reference Posts / Viral Examples (Optional)
            </label>
            <textarea
              rows={3}
              value={referencePosts}
              onChange={(e) => setReferencePosts(e.target.value)}
              placeholder="Paste viral posts or structural inspiration here..."
              className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono-custom"
            />
          </div>

          {/* Active Profile Info Badge */}
          <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-between text-xs font-mono-custom text-zinc-600">
            <span>
              Active Persona: <strong className="text-purple-700">{profile.authorPersona ? profile.authorPersona.slice(0, 30) + '...' : 'Default Creator'}</strong>
            </span>
            <span>
              Audience: <strong className="text-purple-700">{profile.targetAudience ? profile.targetAudience.slice(0, 25) + '...' : 'General'}</strong>
            </span>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating || !topic.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/25 transition-all active:scale-95"
            >
              {generating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Synthesizing with OpenAI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Draft with OpenAI
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Editor & Preview once generated */}
      {generatedDraft && (
        <PostEditor
          initialContent={generatedDraft}
          topic={topic}
          coreMessage={coreMessage}
          onPublish={handlePublish}
          onRegenerate={() => handleGenerate({ preventDefault: () => {} } as any)}
        />
      )}
    </div>
  )
}
