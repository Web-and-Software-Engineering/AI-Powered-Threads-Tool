import { ProfileData } from '@/components/ProfileWorkspace'
import { PostItem } from '@/components/AnalyticsDashboard'

export const DEFAULT_PROFILE: ProfileData = {
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
}

export const DEFAULT_POSTS: PostItem[] = [
  {
    id: '1',
    topic: 'Why most AI tools fail to gain traction',
    coreMessage: 'Focus on solving a clear workflow bottleneck rather than shipping wrapper UI features.',
    generatedContent: `WHY MOST AI TOOLS FAIL TO GAIN TRACTION 💡\n\nIt's not the lack of features. It's the lack of workflow integration.\n\n1. High utility beats complex UI.\n2. Speed of execution wins users.\n3. Solve 1 painful problem completely.\n\nBuild for workflows, not for novelty.`,
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
    generatedContent: `THREADS VS X: WHERE SHOULD SOLOPRENEURS FOCUS? 🤔\n\nAfter 30 days of testing both platforms:\n\n- Threads: Higher reply-to-impression ratio. Community loves build-in-public stories.\n- X: Better for rapid tech news broadcasting.\n\nIf you want genuine conversations, double down on Threads.`,
    status: 'published',
    publishedAt: '2026-07-31',
    analyticsSynced: true,
    structureCloned: false,
    markedForRestart: true,
    metrics: { likes: 23, replies: 2, views: 310, reposts: 0 },
    aiInsight: 'Engagement below target baseline. Marked for structure restart (scraping fresh references next run).',
  },
]

export function loadProfile(): ProfileData {
  if (typeof window === 'undefined') return DEFAULT_PROFILE
  const saved = localStorage.getItem('threadcraft_profile')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // Ignore parse errors
    }
  }
  return DEFAULT_PROFILE
}

export function saveProfile(profile: ProfileData) {
  if (typeof window === 'undefined') return
  localStorage.setItem('threadcraft_profile', JSON.stringify(profile))
}

export function loadPosts(): PostItem[] {
  if (typeof window === 'undefined') return DEFAULT_POSTS
  const saved = localStorage.getItem('threadcraft_posts')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // Ignore parse errors
    }
  }
  return DEFAULT_POSTS
}

export function savePosts(posts: PostItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('threadcraft_posts', JSON.stringify(posts))
}
