'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Navigation } from '@/components/Navigation'
import { ProfileWorkspace, ProfileData } from '@/components/ProfileWorkspace'
import { GenerationWorkspace } from '@/components/GenerationWorkspace'
import { AnalyticsDashboard, PostItem } from '@/components/AnalyticsDashboard'
import { SetupModal } from '@/components/SetupModal'
import { AccountSettings } from '@/components/AccountSettings'
import { getAccountDetails } from '@/app/actions/profile'
import { checkThreadsConnection } from '@/app/actions/threads'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'profile' | 'analytics' | 'account'>('workspace')
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [accountDetails, setAccountDetails] = useState<{
    email: string
    displayName: string
    avatarUrl: string
    isThreadsUser?: boolean
  } | null>(null)
  
  const [threadsConnected, setThreadsConnected] = useState(false)
  const [threadsUsername, setThreadsUsername] = useState('')
  const [threadsDisplayName, setThreadsDisplayName] = useState('')
  const [threadsAvatarUrl, setThreadsAvatarUrl] = useState('')

  // Baseline User Profile Framework with Pocket Attributes
  const [profile, setProfile] = useState<ProfileData>({
    authorPersona: 'AI Architect & Tech Solopreneur sharing actionable insights on software and automation.',
    personalityTraits: 'Meticulous, pragmatic, contrarian, direct but conversational.',
    likesDislikes: 'Likes: Clean code, deep coffee, async workflows. Dislikes: Long meetings, hype cycles.',
    values: 'Value creation over consumption, building in public, automation leverage.',
    lifestyle: 'Early morning coffee shop workspace, async daily schedule.',
    dreams: 'Scale software products to $10k MRR and travel fully remote.',
    outlookOnLife: 'Time is the ultimate leverage; build systems to buy back freedom.',
    targetAudience: 'Developers, indie hackers, and SaaS founders building on Threads.',
    preferredTone: 'Authoritative, concise, insightful, punchy',
    writingStyleRules: 'Use clear numbered lists. Keep hooks under 10 words. Separate key insights with line breaks.',
  })

  // Check if first-time setup is complete
  useEffect(() => {
    const isSetupComplete = localStorage.getItem('threadcraft_setup_complete')
    if (!isSetupComplete) {
      setProfile({
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
      setShowSetupModal(true)
    }
  }, [])

  // Load account details on mount and tab switch
  useEffect(() => {
    async function loadAccount() {
      const details = await getAccountDetails()
      if (details) {
        setAccountDetails(details)
      }
      const conn = await checkThreadsConnection()
      setThreadsConnected(conn.connected)
      setThreadsUsername(conn.username || '')
      setThreadsDisplayName(conn.displayName || '')
      setThreadsAvatarUrl(conn.avatarUrl || '')
    }
    loadAccount()
  }, [activeTab])

  // Synchronize activeTab with URL search parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    const error = params.get('error')
    const details = params.get('details')
    
    if (error) {
      console.error('[Threads Callback Error] type:', error, 'details:', details)
      alert(`Threads Connection Failed: ${error}${details ? ` (${details})` : ''}`)
      params.delete('error')
      params.delete('details')
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
    }
    
    if (tab && ['workspace', 'profile', 'analytics', 'account'].includes(tab)) {
      setActiveTab(tab as any)
    }
  }, [])

  // Sync activeTab state changes back to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const currentTab = params.get('tab')
    
    if (currentTab !== activeTab) {
      params.set('tab', activeTab)
      window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)
    }
  }, [activeTab])

  // Initial Posts state (mocked with initial data demonstrating loop status states)
  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: '1',
      topic: 'Why most AI tools fail to gain traction',
      coreMessage: 'Focus on solving a clear workflow bottleneck rather than shipping wrapper UI features.',
      generatedContent: `WHY MOST AI TOOLS FAIL TO GAIN TRACTION 💡

It's not the lack of features. It's the lack of workflow integration.

1. High utility beats complex UI.
2. Speed of execution wins users.
3. Solve 1 painful problem completely.

Build for workflows, not for novelty.`,
      status: 'published',
      publishedAt: '2026-07-30',
      analyticsSynced: true,
      structureCloned: true,
      markedForRestart: false,
      metrics: { likes: 342, replies: 48, views: 5210, reposts: 19 },
      aiInsight: 'Excellent engagement metrics. Structure cloned into your writing guidelines.',
    },
    {
      id: '2',
      topic: 'Threads vs X for Solopreneurs',
      coreMessage: 'Threads favors conversational engagement over pure broadcast announcements.',
      generatedContent: `THREADS VS X: WHERE SHOULD SOLOPRENEURS FOCUS? 🤔

After 30 days of testing both platforms:

- Threads: Higher reply-to-impression ratio. Community loves build-in-public stories.
- X: Better for rapid tech news broadcasting.

If you want genuine conversations, double down on Threads.`,
      status: 'published',
      publishedAt: '2026-07-31',
      analyticsSynced: true,
      structureCloned: false,
      markedForRestart: true,
      metrics: { likes: 23, replies: 2, views: 310, reposts: 0 },
      aiInsight: 'Engagement below target baseline. Marked for structure restart (scraping fresh references next run).',
    },
  ])

  const handleSaveProfile = (newProfile: ProfileData) => {
    setProfile(newProfile)
  }

  const handleOnboardingSave = (newProfile: ProfileData) => {
    setProfile(newProfile)
    localStorage.setItem('threadcraft_setup_complete', 'true')
    setShowSetupModal(false)
  }

  const handlePostCreated = (newPostData: {
    topic: string
    coreMessage: string
    referencePosts: string
    generatedContent: string
    status: string
  }) => {
    const newPostItem: PostItem = {
      id: Date.now().toString(),
      topic: newPostData.topic,
      coreMessage: newPostData.coreMessage,
      generatedContent: newPostData.generatedContent,
      status: 'published',
      publishedAt: new Date().toISOString().split('T')[0],
      analyticsSynced: false,
      structureCloned: false,
      markedForRestart: false,
      metrics: { likes: 0, replies: 0, views: 0, reposts: 0 },
    }

    setPosts([newPostItem, ...posts])
    setActiveTab('analytics')
  }

  const handleSyncAnalytics = () => {
    setPosts(
      posts.map((post, index) => {
        if (!post.analyticsSynced || post.metrics?.likes === 0) {
          const isHighEngagement = index % 2 === 0
          return {
            ...post,
            analyticsSynced: true,
            structureCloned: isHighEngagement,
            markedForRestart: !isHighEngagement,
            metrics: {
              likes: isHighEngagement ? Math.floor(Math.random() * 200) + 150 : Math.floor(Math.random() * 20) + 2,
              replies: isHighEngagement ? Math.floor(Math.random() * 40) + 20 : Math.floor(Math.random() * 4) + 0,
              views: isHighEngagement ? Math.floor(Math.random() * 5000) + 3000 : Math.floor(Math.random() * 400) + 50,
              reposts: isHighEngagement ? Math.floor(Math.random() * 15) + 8 : 0,
            },
            aiInsight: isHighEngagement
              ? 'Excellent engagement metrics. Structure cloned into your writing guidelines.'
              : 'Engagement below target baseline. Marked for structure restart (scraping fresh references next run).',
          }
        }
        return post
      })
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans-custom pb-16 md:pb-0">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 px-4 md:px-6 pb-16 md:pb-8">
        {activeTab === 'workspace' && (
          <GenerationWorkspace profile={profile} onPostCreated={handlePostCreated} />
        )}

        {activeTab === 'profile' && (
          <ProfileWorkspace profile={profile} onSave={handleSaveProfile} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard posts={posts} onSyncAnalytics={handleSyncAnalytics} />
        )}

        {activeTab === 'account' && (
          <AccountSettings
            key={`${accountDetails?.email || 'account'}-${threadsConnected}`}
            initialDisplayName={accountDetails?.displayName}
            initialAvatarUrl={accountDetails?.avatarUrl}
            initialEmail={accountDetails?.email}
            isThreadsUser={accountDetails?.isThreadsUser}
            threadsConnected={threadsConnected}
            threadsUsername={threadsUsername}
            threadsDisplayName={threadsDisplayName}
            threadsAvatarUrl={threadsAvatarUrl}
          />
        )}
      </main>

      <footer className="hidden md:block border-t border-zinc-200 py-6 px-6 text-center text-xs text-zinc-500 font-mono-custom">
        ThreadCraft AI Engine • Optimized for Threads API Integration & Voice Analytics
      </footer>

      {/* Forced onboarding setup modal */}
      <SetupModal isOpen={showSetupModal} onSave={handleOnboardingSave} />
    </div>
  )
}
