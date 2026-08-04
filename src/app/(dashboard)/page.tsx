'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GenerationWorkspace } from '@/components/GenerationWorkspace'
import { SetupModal } from '@/components/SetupModal'
import { ProfileData } from '@/components/ProfileWorkspace'
import { PostItem } from '@/components/AnalyticsDashboard'
import { loadProfile, saveProfile, loadPosts, savePosts } from '@/lib/state'

export default function Home() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [showSetupModal, setShowSetupModal] = useState(false)

  // Load profile on client mount to prevent server hydration mismatches
  useEffect(() => {
    setProfile(loadProfile())
    const isSetupComplete = localStorage.getItem('threadcraft_setup_complete')
    if (!isSetupComplete) {
      setShowSetupModal(true)
    }
  }, [])

  const handleOnboardingSave = (newProfile: ProfileData) => {
    saveProfile(newProfile)
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

    const currentPosts = loadPosts()
    savePosts([newPostItem, ...currentPosts])
    
    // Route page to analytics
    router.push('/analytics')
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <>
      <GenerationWorkspace profile={profile} onPostCreated={handlePostCreated} />

      <SetupModal
        isOpen={showSetupModal}
        onSave={handleOnboardingSave}
      />
    </>
  )
}
