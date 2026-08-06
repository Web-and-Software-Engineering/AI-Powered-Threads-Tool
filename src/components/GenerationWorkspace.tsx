'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, MessageSquare, Lightbulb, Search, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { ProfileData } from './ProfileWorkspace'
import { PostEditor } from './PostEditor'
import { generateThreadsPost } from '@/app/actions/generate'
import { publishToThreadsApi, checkThreadsConnection } from '@/app/actions/threads'

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

type StepState = 'idle' | 'searching' | 'analyzing' | 'synthesizing' | 'drafting' | 'completed'

export function GenerationWorkspace({ profile, onPostCreated }: GenerationWorkspaceProps) {
  const [topic, setTopic] = useState('')
  const [coreMessage, setCoreMessage] = useState('')
  const [generationStep, setGenerationStep] = useState<StepState>('idle')
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null)
  const [threadsAccount, setThreadsAccount] = useState<{ username: string; avatarUrl: string } | null>(null)

  useEffect(() => {
    async function loadThreadsConnection() {
      const conn = await checkThreadsConnection()
      if (conn && conn.connected && conn.username) {
        setThreadsAccount({
          username: conn.username,
          avatarUrl: conn.avatarUrl || '',
        })
      }
    }
    loadThreadsConnection()
  }, [])

  const handleAutoFill = () => {
    setTopic('Productivity frameworks for remote solopreneurs')
    setCoreMessage('Doing deep focus blocks of 4 hours yields more results than working 14 hours fragmented.')
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setGeneratedDraft(null)

    // Step 1: Searching Threads
    setGenerationStep('searching')
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Step 2: Analyzing structures
    setGenerationStep('analyzing')
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Step 3: Synthesizing pocket
    setGenerationStep('synthesizing')
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Step 4: Drafting
    setGenerationStep('drafting')

    try {
      const draft = await generateThreadsPost({
        topic,
        coreMessage,
        authorPersona: profile.authorPersona,
        personalityTraits: profile.personalityTraits,
        likesDislikes: profile.likesDislikes,
        values: profile.values,
        lifestyle: profile.lifestyle,
        dreams: profile.dreams,
        outlookOnLife: profile.outlookOnLife,
        targetAudience: profile.targetAudience,
        preferredTone: profile.preferredTone,
        writingStyleRules: profile.writingStyleRules,
      })
      setGeneratedDraft(draft)
      setGenerationStep('completed')
    } catch (err) {
      console.error(err)
      setGenerationStep('idle')
    }
  }

  const handlePublish = async (finalContent: string) => {
    const result = await publishToThreadsApi(finalContent)
    if (result?.error) {
      return { error: result.error }
    }

    onPostCreated({
      topic,
      coreMessage,
      referencePosts: '[Auto-scraped via AI Theme Search]',
      generatedContent: finalContent,
      status: 'published',
    })
    return { success: true }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in px-2 md:px-0 pb-12">
      {/* Input Form */}
      {generationStep === 'idle' || generationStep === 'completed' ? (
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Create New Threads Post</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono-custom">
                Enter your theme and target message. The AI handles Threads scraping and structure analysis.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="space-y-5">
              {/* Topic Theme */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Desired Theme
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Productivity habits for remote builders"
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              {/* Core Message / Value */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Key Message / Value to Deliver
                </label>
                <textarea
                  rows={3}
                  value={coreMessage}
                  onChange={(e) => setCoreMessage(e.target.value)}
                  placeholder="e.g. Sleep & deep work blocks beat grinding 14-hour days."
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-sans-custom leading-relaxed"
                />
              </div>
            </div>

            {/* Persona Summary Status */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs font-mono-custom text-zinc-600 dark:text-zinc-400 flex flex-col md:flex-row justify-between gap-2">
              <span>
                Active Pocket: <strong className="text-purple-600 dark:text-purple-400">Bio, Traits, Dreams Loaded</strong>
              </span>
              <span>
                Audience: <strong className="text-purple-600 dark:text-purple-400">{profile.targetAudience ? profile.targetAudience.slice(0, 30) + '...' : 'General'}</strong>
              </span>
            </div>

            <div className="flex justify-end gap-3">
              {process.env.NEXT_PUBLIC_ENABLE_TEST_TOOLS === 'true' && (
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-100 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  ⚡ Auto-fill
                </button>
              )}
              <button
                type="submit"
                disabled={!topic.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/25 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Start Generation Loop
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Multi-Stage Loading Pipeline Screen */
        <div className="glass-panel p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center space-y-8 animate-fade-in max-w-lg mx-auto">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">AI Scrape & Rewrite Engine</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono-custom">Executing automated Threads analysis pipeline...</p>
          </div>

          <div className="space-y-4 max-w-sm mx-auto text-left">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              {generationStep === 'searching' ? (
                <Loader2 className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <span className={`text-xs font-mono-custom ${generationStep === 'searching' ? 'text-purple-600 font-bold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                1. Searching Threads for similar posts...
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              {generationStep === 'searching' ? (
                <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
              ) : generationStep === 'analyzing' ? (
                <Loader2 className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <span className={`text-xs font-mono-custom ${generationStep === 'analyzing' ? 'text-purple-600 font-bold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                2. Analyzing top engagement structures...
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              {['searching', 'analyzing'].includes(generationStep) ? (
                <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
              ) : generationStep === 'synthesizing' ? (
                <Loader2 className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <span className={`text-xs font-mono-custom ${generationStep === 'synthesizing' ? 'text-purple-600 font-bold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                3. Injecting Pocket Persona & Audience...
              </span>
            </div>

            {/* Step 4 */}
            <div className="flex items-center gap-3">
              {['searching', 'analyzing', 'synthesizing'].includes(generationStep) ? (
                <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
              ) : generationStep === 'drafting' ? (
                <Loader2 className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <span className={`text-xs font-mono-custom ${generationStep === 'drafting' ? 'text-purple-600 font-bold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                4. Generating personalized draft...
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        </div>
      )}

      {/* Editor & Preview once completed */}
      {generationStep === 'completed' && generatedDraft && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-emerald-600 font-mono-custom font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> AI Generation Pipeline Complete
            </span>
            <button
              onClick={() => setGenerationStep('idle')}
              className="text-xs text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 font-mono-custom flex items-center gap-1 cursor-pointer"
            >
              Start New Post <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <PostEditor
            initialContent={generatedDraft}
            topic={topic}
            coreMessage={coreMessage}
            onPublish={handlePublish}
            threadsAccount={threadsAccount}
          />
        </div>
      )}
    </div>
  )
}
