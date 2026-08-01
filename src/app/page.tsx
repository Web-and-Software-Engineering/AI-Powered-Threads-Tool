'use client'

import React, { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { ProfileWorkspace, ProfileData } from '@/components/ProfileWorkspace'
import { GenerationWorkspace } from '@/components/GenerationWorkspace'
import { AnalyticsDashboard, PostItem } from '@/components/AnalyticsDashboard'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'profile' | 'analytics'>('workspace')

  // Baseline User Profile Framework
  const [profile, setProfile] = useState<ProfileData>({
    authorPersona: 'AI Architect & Tech Solopreneur sharing actionable insights on software and automation.',
    targetAudience: 'Developers, indie hackers, and SaaS founders building in public on Threads.',
    backgroundInfo: 'Building AI tools, scaling web applications, and analyzing creator content.',
    preferredTone: 'Authoritative, concise, insightful, punchy',
    writingStyleRules: 'Use clear numbered lists. Keep hooks under 10 words. Separate key insights with line breaks.',
  })

  // Initial Posts state
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
      metrics: { likes: 342, replies: 48, views: 5210, reposts: 19 },
      aiInsight: 'Top performer: Short numbered list format resulted in +85% more reposts.',
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
      metrics: { likes: 189, replies: 64, views: 3100, reposts: 12 },
      aiInsight: 'High conversational yield: Reply count outperformed baseline by 40%.',
    },
  ])

  const handleSaveProfile = (newProfile: ProfileData) => {
    setProfile(newProfile)
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
      metrics: { likes: 0, replies: 0, views: 0, reposts: 0 },
    }

    setPosts([newPostItem, ...posts])
    setActiveTab('analytics')
  }

  const handleSyncAnalytics = () => {
    setPosts(
      posts.map((post) => {
        if (!post.analyticsSynced || post.metrics?.likes === 0) {
          return {
            ...post,
            analyticsSynced: true,
            metrics: {
              likes: Math.floor(Math.random() * 200) + 50,
              replies: Math.floor(Math.random() * 40) + 10,
              views: Math.floor(Math.random() * 3000) + 1000,
              reposts: Math.floor(Math.random() * 15) + 3,
            },
            aiInsight: 'Analyzed: Post structure saved into AI profile rules for future generations.',
          }
        }
        return post
      })
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans-custom">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 px-6 pb-16">
        {activeTab === 'workspace' && (
          <GenerationWorkspace profile={profile} onPostCreated={handlePostCreated} />
        )}

        {activeTab === 'profile' && (
          <ProfileWorkspace profile={profile} onSave={handleSaveProfile} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard posts={posts} onSyncAnalytics={handleSyncAnalytics} />
        )}
      </main>

      <footer className="border-t border-zinc-200 py-6 px-6 text-center text-xs text-zinc-500 font-mono-custom">
        ThreadCraft AI Engine • Optimized for Threads API Integration & Voice Analytics
      </footer>
    </div>
  )
}
