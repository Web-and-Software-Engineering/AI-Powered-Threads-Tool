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

export const DEFAULT_POSTS: PostItem[] = []

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
