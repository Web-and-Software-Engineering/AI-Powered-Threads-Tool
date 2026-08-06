'use client'

import React, { useState } from 'react'
import { FolderHeart, Sparkles, User, Heart, Compass, ShieldAlert, CheckCircle2 } from 'lucide-react'

export interface ProfileData {
  authorPersona: string
  personalityTraits: string
  likesDislikes: string
  values: string
  lifestyle: string
  dreams: string
  outlookOnLife: string
  targetAudience: string
  preferredTone: string
  writingStyleRules: string
}

interface ProfileWorkspaceProps {
  profile: ProfileData
  onSave: (data: ProfileData) => void
}

export function ProfileWorkspace({ profile, onSave }: ProfileWorkspaceProps) {
  const [formData, setFormData] = useState<ProfileData>(profile)
  const [activeSubTab, setActiveSubTab] = useState<'pocket' | 'audience'>('pocket')
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in px-2 md:px-0">
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-805">
            <FolderHeart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">Pocket & Audience Hub</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono-custom">
              Store your personal persona details ("Pocket") and target avatars.
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-850 pb-3 mb-6">
          <button
            onClick={() => setActiveSubTab('pocket')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'pocket'
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            ① The "Pocket" (My Persona)
          </button>
          <button
            onClick={() => setActiveSubTab('audience')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'audience'
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            ② "To Whom" (Target Audience)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeSubTab === 'pocket' ? (
            <div className="space-y-5">
              {/* Pocket Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Self Introduction */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    Self-Introduction / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={formData.authorPersona}
                    onChange={(e) => setFormData({ ...formData, authorPersona: e.target.value })}
                    placeholder="Briefly introduce yourself (expertise, status, etc.)"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all leading-relaxed"
                  />
                </div>

                {/* Personality Traits */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-purple-600" />
                    Personality Traits
                  </label>
                  <textarea
                    rows={3}
                    value={formData.personalityTraits}
                    onChange={(e) => setFormData({ ...formData, personalityTraits: e.target.value })}
                    placeholder="e.g. Enthusiastic, meticulous, slightly contrarian, direct yet warm"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all leading-relaxed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Likes & Dislikes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Likes & Dislikes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.likesDislikes}
                    onChange={(e) => setFormData({ ...formData, likesDislikes: e.target.value })}
                    placeholder="Likes: Clean code, deep coffee, indie hacks. Dislikes: Hype tech, endless meetings."
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all leading-relaxed"
                  />
                </div>

                {/* Dreams & Goals */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-600" />
                    Dreams & Long-term Goals
                  </label>
                  <textarea
                    rows={3}
                    value={formData.dreams}
                    onChange={(e) => setFormData({ ...formData, dreams: e.target.value })}
                    placeholder="e.g. Scaling my SaaS to $10k MRR and working 100% remote while traveling."
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all leading-relaxed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Values & Lifestyle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Values & Lifestyle</label>
                  <input
                    type="text"
                    value={formData.lifestyle}
                    onChange={(e) => setFormData({ ...formData, lifestyle: e.target.value })}
                    placeholder="e.g. Asynchronous work, early mornings, active developer lifestyle"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                  />
                </div>

                {/* Outlook on Life */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Outlook on Life</label>
                  <input
                    type="text"
                    value={formData.outlookOnLife}
                    onChange={(e) => setFormData({ ...formData, outlookOnLife: e.target.value })}
                    placeholder="e.g. Leverage automation to gain freedom; value creation over consumption"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Target Audience Profile */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  Target Customer / Reader Profile
                </label>
                <textarea
                  rows={3}
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="Describe your target audience (e.g. Housewives in their 30s, busy business owners in their 50s looking for AI integrations)"
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Tone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Preferred Tone</label>
                  <input
                    type="text"
                    value={formData.preferredTone}
                    onChange={(e) => setFormData({ ...formData, preferredTone: e.target.value })}
                    placeholder="e.g. Friendly, professional, humorous, empathetic"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                  />
                </div>

                {/* Writing Rules */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Formatting Constraints</label>
                  <input
                    type="text"
                    value={formData.writingStyleRules}
                    onChange={(e) => setFormData({ ...formData, writingStyleRules: e.target.value })}
                    placeholder="e.g. Keep sentences under 12 words, no hashtags, end with a poll question"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex justify-end items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-850">
            {saved && (
              <span className="text-xs text-emerald-600 flex items-center gap-1.5 animate-fade-in font-mono-custom font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Guidelines saved & applied!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
