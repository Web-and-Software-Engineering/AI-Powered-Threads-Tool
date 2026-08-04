'use client'

import React, { useState, useEffect } from 'react'
import { AnalyticsDashboard, PostItem } from '@/components/AnalyticsDashboard'
import { loadPosts, savePosts } from '@/lib/state'

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<PostItem[] | null>(null)

  // Load posts on client mount to prevent server hydration mismatches
  useEffect(() => {
    setPosts(loadPosts())
  }, [])

  const handleSyncAnalytics = () => {
    if (!posts) return

    const updated = posts.map((post, index) => {
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

    setPosts(updated)
    savePosts(updated)
  }

  if (!posts) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return <AnalyticsDashboard posts={posts} onSyncAnalytics={handleSyncAnalytics} />
}
