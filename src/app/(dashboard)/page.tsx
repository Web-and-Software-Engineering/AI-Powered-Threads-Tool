'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GenerationWorkspace } from '@/components/GenerationWorkspace'
import { ProfileData } from '@/components/ProfileWorkspace'
import { getPersonaProfile } from '@/app/actions/profile'
import { recordPublishedPost } from '@/app/actions/posts'

export default function Home() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)

  // Load profile on client mount to prevent server hydration mismatches
  useEffect(() => {
    getPersonaProfile().then(setProfile)
  }, [])

  const handlePostCreated = async (newPostData: {
    topic: string
    topicTag?: string
    coreMessage: string
    referencePosts: string
    generatedContent: string
    status: string
    platformPostId?: string
    platformPostUrl?: string
  }) => {
    await recordPublishedPost({
      topic: newPostData.topic,
      topicTag: newPostData.topicTag,
      coreMessage: newPostData.coreMessage,
      referencePosts: newPostData.referencePosts,
      generatedContent: newPostData.generatedContent,
      platformPostId: newPostData.platformPostId,
      platformPostUrl: newPostData.platformPostUrl,
    })

    // Route page to analytics
    router.push('/analytics')
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <GenerationWorkspace profile={profile} onPostCreated={handlePostCreated} />
  )
}
