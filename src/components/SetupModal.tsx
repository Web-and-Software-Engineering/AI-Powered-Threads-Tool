'use client'

import React, { useState } from 'react'
import { Sparkles, User, Heart, Compass, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { ProfileData } from './ProfileWorkspace'

interface SetupModalProps {
  isOpen: boolean
  onSave: (data: ProfileData) => void
}

export function SetupModal({ isOpen, onSave }: SetupModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState<ProfileData>({
    authorPersona: '',
    personalityTraits: '',
    likesDislikes: '',
    values: '',
    lifestyle: '',
    dreams: '',
    outlookOnLife: '',
    targetAudience: '',
    preferredTone: '',
    writingStyleRules: '',
  })

  if (!isOpen) return null

  const handleInputChange = (key: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // Verification if all required fields are filled out for Step 1
  const isStep1Valid =
    formData.authorPersona.trim() !== '' &&
    formData.personalityTraits.trim() !== '' &&
    formData.likesDislikes.trim() !== '' &&
    formData.values.trim() !== '' &&
    formData.lifestyle.trim() !== '' &&
    formData.dreams.trim() !== '' &&
    formData.outlookOnLife.trim() !== ''

  // Verification if all required fields are filled out for Step 2
  const isStep2Valid =
    formData.targetAudience.trim() !== '' &&
    formData.preferredTone.trim() !== '' &&
    formData.writingStyleRules.trim() !== ''

  const handleNext = () => {
    if (isStep1Valid) setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSave = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    if (isStep1Valid && isStep2Valid) {
      onSave(formData)
    }
  }

  const handleAutoFill = () => {
    setFormData({
      authorPersona: 'AI Tech Solopreneur & Software Architect building automation workflows.',
      personalityTraits: 'Conversational, practical, analytical, warm',
      likesDislikes: 'Likes: Async focus blocks. Dislikes: Unnecessary alignment meetings.',
      values: 'Utility, transparency, building in public, scaling software leverage',
      lifestyle: 'Digital nomad developer coding asynchronously from cafes.',
      dreams: 'Scale content intelligence tooling to $10,000 monthly recurring revenue.',
      outlookOnLife: 'Optimize daily workflows to maximize personal freedom.',
      targetAudience: 'Software builders, developers, and creators scaling text content.',
      preferredTone: 'Authoritative, accessible, educational, insightful',
      writingStyleRules: 'Keep lists to 3 items max. Sentence limit under 15 words. Avoid hype hashtags.',
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-6 overflow-y-auto">
      <div className="bg-white border border-zinc-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col my-auto max-h-[90vh]">
        {/* Progress Header */}
        <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-base font-bold text-zinc-900">Setup your Voice Profile</h2>
              <p className="text-[11px] text-zinc-500 font-mono-custom">Onboarding Wizard (Step {step} of 2)</p>
            </div>
          </div>
          {/* Progress Indicators */}
          <div className="flex items-center gap-3">
            {process.env.NEXT_PUBLIC_ENABLE_TEST_TOOLS === 'true' && (
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-[10px] px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-mono-custom font-semibold transition-all cursor-pointer"
              >
                ⚡ Auto-fill
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-1.5 rounded-full ${step === 1 ? 'bg-purple-600' : 'bg-purple-200'}`} />
              <div className={`w-6 h-1.5 rounded-full ${step === 2 ? 'bg-purple-600' : 'bg-purple-200'}`} />
            </div>
          </div>
        </div>

        {/* Setup Notice */}
        <div className="px-6 py-3.5 bg-purple-50/60 border-b border-purple-100 text-[11px] text-purple-800 leading-relaxed font-mono-custom break-words">
          💡 <strong>Setup Required:</strong> We need to establish your baseline writing voice. You can always modify or refine these details at any time in the <strong>Pocket & Audience</strong> tab later.
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {step === 1 ? (
            /* Step 1: The Pocket (Who) */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider font-mono-custom">
                <User className="w-4 h-4" />
                1. Persona Profile (Your "Pocket")
              </div>

              {/* Author Persona */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Self-Introduction & Biography</label>
                <textarea
                  required
                  rows={2}
                  value={formData.authorPersona}
                  onChange={(e) => handleInputChange('authorPersona', e.target.value)}
                  placeholder="e.g. AI systems builder & content engineer sharing tips on automation and scaling software."
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-sans-custom leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personality Traits */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">Personality Traits</label>
                  <input
                    type="text"
                    required
                    value={formData.personalityTraits}
                    onChange={(e) => handleInputChange('personalityTraits', e.target.value)}
                    placeholder="e.g. Direct, practical, contrarian"
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Likes/Dislikes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">Likes & Dislikes</label>
                  <input
                    type="text"
                    required
                    value={formData.likesDislikes}
                    onChange={(e) => handleInputChange('likesDislikes', e.target.value)}
                    placeholder="e.g. Likes: deep focus blocks. Dislikes: meetings."
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Core Values */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Core Values</label>
                <input
                  type="text"
                  required
                  value={formData.values}
                  onChange={(e) => handleInputChange('values', e.target.value)}
                  placeholder="e.g. Value creation, building in public, scaling workflows"
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lifestyle */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">Lifestyle</label>
                  <input
                    type="text"
                    required
                    value={formData.lifestyle}
                    onChange={(e) => handleInputChange('lifestyle', e.target.value)}
                    placeholder="e.g. Asynchronous solo builder, remote developer"
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Goals/Dreams */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">Goals & Dreams</label>
                  <input
                    type="text"
                    required
                    value={formData.dreams}
                    onChange={(e) => handleInputChange('dreams', e.target.value)}
                    placeholder="e.g. Scale micro-SaaS products to $10k MRR"
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Outlook on Life */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Outlook on Life</label>
                <input
                  type="text"
                  required
                  value={formData.outlookOnLife}
                  onChange={(e) => handleInputChange('outlookOnLife', e.target.value)}
                  placeholder="e.g. Build tools that give people back their time."
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>
          ) : (
            /* Step 2: Target Audience (To Whom) */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider font-mono-custom">
                <Compass className="w-4 h-4" />
                2. Audience & Styling Configuration
              </div>

              {/* Target Audience Profile */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Target Audience Profile</label>
                <textarea
                  required
                  rows={3}
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  placeholder="e.g. Freelancers, solo software builders, and indie hackers looking to automate workflows."
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-sans-custom leading-relaxed"
                />
              </div>

              {/* Preferred Tone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Preferred Tone</label>
                <input
                  type="text"
                  required
                  value={formData.preferredTone}
                  onChange={(e) => handleInputChange('preferredTone', e.target.value)}
                  placeholder="e.g. Conversational, punchy, authoritative, educational"
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              {/* Writing Style Rules */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Writing Style Rules</label>
                <textarea
                  required
                  rows={3}
                  value={formData.writingStyleRules}
                  onChange={(e) => handleInputChange('writingStyleRules', e.target.value)}
                  placeholder="e.g. Keep sentences under 15 words. Use numbered lists. Always end with a clear takeaway. No emoji spam."
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-sans-custom leading-relaxed"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-4 flex items-center justify-between">
          <div>
            {step === 2 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Pocket
              </button>
            )}
          </div>

          <div>
            {step === 1 ? (
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/25 transition-all active:scale-95 cursor-pointer"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSave}
                disabled={!isStep1Valid || !isStep2Valid}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/25 transition-all active:scale-95 cursor-pointer"
              >
                Complete Setup <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
