'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function getThreadsAuthUrl() {
  const appId = process.env.NEXT_PUBLIC_THREAD_APP_ID

  if (!appId) {
    return { error: 'NEXT_PUBLIC_THREAD_APP_ID is not configured in env' }
  }

  const redirectUri = encodeURIComponent(`${SITE_URL}/auth/threads/callback`)
  const url = `https://threads.net/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=threads_basic,threads_content_publish&response_type=code`

  return { url }
}

export async function checkThreadsConnection() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { connected: false }
  }

  const { data, error } = await supabase
    .from('social_accounts')
    .select('account_id, username, display_name, avatar_url, expires_at')
    .eq('user_id', user.id)
    .eq('platform', 'threads')
    .maybeSingle()

  if (error || !data) {
    return { connected: false }
  }

  return {
    connected: true,
    username: data.username || `User #${data.account_id}`,
    displayName: data.display_name || data.username || '',
    avatarUrl: data.avatar_url || '',
    expiresAt: data.expires_at ? new Date(data.expires_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : '',
  }
}

export async function publishToThreadsApi(content: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'User is not authenticated' }
  }

  const { data: account, error: accountError } = await supabase
    .from('social_accounts')
    .select('account_id, access_token')
    .eq('user_id', user.id)
    .eq('platform', 'threads')
    .maybeSingle()

  if (accountError || !account || !account.access_token) {
    return { error: 'Threads account is not linked. Please go to the Account tab to connect your account first.' }
  }

  const threadsUserId = account.account_id
  const accessToken = account.access_token

  try {
    // Step 1: Create media creation container
    const containerRes = await fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/media?media_type=TEXT&text=${encodeURIComponent(
        content
      )}&access_token=${accessToken}`,
      { method: 'POST' }
    )

    const containerData = await containerRes.json()

    if (containerData.error) {
      console.error('Threads Media Container Error:', containerData.error)
      return { error: containerData.error.message || 'Failed to create Threads container.' }
    }

    const creationId = containerData.id

    // Step 2: Publish the media container
    const publishRes = await fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`,
      { method: 'POST' }
    )

    const publishData = await publishRes.json()

    if (publishData.error) {
      console.error('Threads Publishing Error:', publishData.error)
      return { error: publishData.error.message || 'Failed to publish Threads post.' }
    }

    return { success: true, platformPostId: publishData.id }
  } catch (err: any) {
    console.error('Threads API Request Failure:', err)
    return { error: err.message || 'Network error occurred during publishing.' }
  }
}

export async function disconnectThreads() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  // Delete all generated posts for this user
  const { error: deletePostsError } = await supabase
    .from('posts')
    .delete()
    .eq('user_id', user.id)

  if (deletePostsError) {
    console.error('[Threads Disconnect] Failed to delete user posts:', deletePostsError)
  }

  // Reset the user profile persona details
  const { error: resetProfileError } = await supabase
    .from('user_profiles')
    .update({
      background_info: null,
      writing_style_rules: null,
      preferred_tone: null,
      author_persona: null,
      target_audience: null,
      personality_traits: null,
      likes_dislikes: null,
      values: null,
      lifestyle: null,
      dreams: null,
      outlook_on_life: null,
    })
    .eq('user_id', user.id)

  if (resetProfileError) {
    console.error('[Threads Disconnect] Failed to reset user profile:', resetProfileError)
  }

  // Delete the social account linking
  const { error } = await supabase
    .from('social_accounts')
    .delete()
    .eq('user_id', user.id)
    .eq('platform', 'threads')

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
