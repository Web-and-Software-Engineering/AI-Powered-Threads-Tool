import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorMsg = searchParams.get('error')

  if (errorMsg) {
    return NextResponse.redirect(`${origin}/?tab=account&error=threads_oauth_failed`)
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/?tab=account&error=threads_no_code`)
  }

  const appId = process.env.NEXT_PUBLIC_THREAD_APP_ID
  const appSecret = process.env.NEXT_PUBLIC_THREAD_APP_SECRET

  if (!appId || !appSecret) {
    return NextResponse.redirect(`${origin}/?tab=account&error=threads_env_missing`)
  }

  const redirectUri = `${origin}/auth/threads/callback`

  try {
    // Step 1: Short-lived token
    const tokenRes = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    })
    const tokenData = await tokenRes.json()
    if (tokenData.error || tokenData.error_message) {
      console.error('Short-lived token exchange error:', tokenData)
      return NextResponse.redirect(`${origin}/?tab=account&error=threads_token_exchange_failed`)
    }

    const shortLivedToken = tokenData.access_token
    const threadsUserId = String(tokenData.user_id)

    // Step 2: Long-lived token
    const longLivedRes = await fetch(
      `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`
    )
    const longLivedData = await longLivedRes.json()
    if (longLivedData.error) {
      return NextResponse.redirect(`${origin}/?tab=account&error=threads_long_token_failed`)
    }

    const longLivedToken = longLivedData.access_token
    const expiresInSeconds = longLivedData.expires_in || 5184000

    // Step 3: Fetch full Threads profile
    const meRes = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${longLivedToken}`
    )
    const meData = await meRes.json()
    const username = meData.username || ''
    const displayName = meData.name || meData.username || 'Threads User'
    const profilePictureUrl = meData.threads_profile_picture_url || ''

    // Step 4: Get authenticated Supabase user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(`${origin}/auth?error=threads_unauthenticated`)
    }

    // Step 5: Check if this Threads account is already linked to a DIFFERENT user
    const { data: existingMapping } = await supabase
      .from('social_accounts')
      .select('user_id')
      .eq('platform', 'threads')
      .eq('account_id', threadsUserId)
      .maybeSingle()

    if (existingMapping && existingMapping.user_id !== user.id) {
      return NextResponse.redirect(
        `${origin}/?tab=account&error=threads_already_linked_to_another_user`
      )
    }

    // Step 6: Upsert social_accounts
    const { error: upsertError } = await supabase
      .from('social_accounts')
      .upsert(
        {
          user_id: user.id,
          platform: 'threads',
          account_id: threadsUserId,
          access_token: longLivedToken,
          username,
          display_name: displayName,
          avatar_url: profilePictureUrl,
          expires_at: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
        },
        { onConflict: 'user_id,platform' }
      )

    if (upsertError) {
      console.error('Failed to upsert social account:', upsertError)
      return NextResponse.redirect(`${origin}/?tab=account&error=threads_db_save_failed`)
    }

    return NextResponse.redirect(`${origin}/?tab=account`)
  } catch (err: any) {
    console.error('Threads callback exception:', err)
    return NextResponse.redirect(`${origin}/?tab=account&error=threads_callback_exception`)
  }
}
