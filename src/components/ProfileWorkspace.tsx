'use client'

import React, { useState } from 'react'
import { User, Users, FileText, CheckCircle2, Sliders } from 'lucide-react'

export interface ProfileData {
  authorPersona: string
  targetAudience: string
  backgroundInfo: string
  preferredTone: string
  writingStyleRules: string
}

interface ProfileWorkspaceProps {
  profile: ProfileData
  onSave: (data: ProfileData) => void
}

export function ProfileWorkspace({ profile, onSave }: ProfileWorkspaceProps) {
  const [formData, setFormData] = useState<ProfileData>(profile)
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="glass-panel p-6 rounded-2xl border border-zinc-200 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Voice & Persona Guidelines</h2>
            <p className="text-xs text-zinc-500 font-mono-custom">
              Define the baseline framework used by the AI engine for every post.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Author Persona */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-700 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Who is the Author? (Persona)
              </label>
              <textarea
                rows={4}
                value={formData.authorPersona}
                onChange={(e) => setFormData({ ...formData, authorPersona: e.target.value })}
                placeholder="e.g. Senior Software Architect turned AI Solopreneur. Direct, insightful, and practical."
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-700 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Who is the Target Audience?
              </label>
              <textarea
                rows={4}
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g. Founders, indie hackers, and developers looking to scale their personal brand on Threads."
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferred Tone */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700">Preferred Tone</label>
              <input
                type="text"
                value={formData.preferredTone}
                onChange={(e) => setFormData({ ...formData, preferredTone: e.target.value })}
                placeholder="e.g. Conversational, punchy, authoritative, lighthearted"
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Background Info */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700">Background Context</label>
              <input
                type="text"
                value={formData.backgroundInfo}
                onChange={(e) => setFormData({ ...formData, backgroundInfo: e.target.value })}
                placeholder="e.g. Building SaaS products, sharing daily tech insights"
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          {/* Writing Style Rules */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-purple-700 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Writing Style & Formatting Rules
            </label>
            <textarea
              rows={4}
              value={formData.writingStyleRules}
              onChange={(e) => setFormData({ ...formData, writingStyleRules: e.target.value })}
              placeholder="e.g. Use line breaks between thoughts. Keep sentences under 15 words. Start with a bold hook. No hashtags."
              className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono-custom"
            />
          </div>

          <div className="flex justify-end items-center gap-4 pt-2">
            {saved && (
              <span className="text-xs text-emerald-600 flex items-center gap-1.5 animate-fade-in font-mono-custom font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Guidelines saved & applied!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/25 transition-all active:scale-95"
            >
              Save Voice Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
