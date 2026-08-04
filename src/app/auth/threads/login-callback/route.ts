import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function exchangeCodeForTokens(code: string, redirectUri: string, appId: string, appSecret: string) {
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
    throw new Error(tokenData.error_message || tokenData.error || 'Short-lived token exchange failed')
  }

  const shortLivedToken = tokenData.access_token
  const threadsUserId = String(tokenData.user_id)

  // Step 2: Long-lived token
  const longLivedRes = await fetch(
    `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`
  )
  const longLivedData = await longLivedRes.json()
  if (longLivedData.error) {
    throw new Error(longLivedData.error.message || 'Long-lived token exchange failed')
  }

  const longLivedToken = longLivedData.access_token
  const expiresInSeconds = longLivedData.expires_in || 5184000

  // Step 3: Fetch full Threads profile
  const meRes = await fetch(
    `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${longLivedToken}`
  )
  const meData = await meRes.json()

  return {
    threadsUserId,
    longLivedToken,
    expiresInSeconds,
    username: meData.username || '',
    displayName: meData.name || meData.username || 'Threads User',
    profilePictureUrl: meData.threads_profile_picture_url || '',
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorMsg = searchParams.get('error')

  if (errorMsg) {
    return NextResponse.redirect(`${origin}/auth?error=threads_oauth_failed&details=${encodeURIComponent(errorMsg)}`)
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=threads_no_code`)
  }

  const appId = process.env.NEXT_PUBLIC_THREAD_APP_ID
  const appSecret = process.env.NEXT_PUBLIC_THREAD_APP_SECRET

  if (!appId || !appSecret) {
    return NextResponse.redirect(`${origin}/auth?error=threads_env_missing`)
  }

  const redirectUri = `${origin}/auth/threads/login-callback`

  try {
    const { threadsUserId, longLivedToken, expiresInSeconds, username, displayName, profilePictureUrl } =
      await exchangeCodeForTokens(code, redirectUri, appId, appSecret)

    const syntheticEmail = `threads_${threadsUserId}@threads-auth.internal`
    const syntheticPassword = `${threadsUserId}_${appSecret}`
    const supabase = await createClient()

    // Check if this Threads account is already linked to a DIFFERENT Supabase user
    const { data: existingMapping } = await supabase
      .from('social_accounts')
      .select('user_id')
      .eq('platform', 'threads')
      .eq('account_id', threadsUserId)
      .maybeSingle()

    // Try to sign in with existing deterministic credentials
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: syntheticPassword,
    })

    if (authError) {
      // New user — sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: syntheticPassword,
        options: {
          data: {
            display_name: displayName,
            avatar_url: profilePictureUrl,
          },
        },
      })

      if (signUpError) {
        console.error('Threads signup failed:', signUpError)
        return NextResponse.redirect(
          `${origin}/auth?error=threads_signup_failed&details=${encodeURIComponent(signUpError.message)}`
        )
      }

      // Re-sign in to get a proper session cookie
      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password: syntheticPassword,
      })

      if (retryError) {
        return NextResponse.redirect(`${origin}/auth?error=threads_login_retry_failed`)
      }
      authData = retryData
    } else {
      // Returning user — refresh their display name and avatar from Threads
      await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          avatar_url: profilePictureUrl,
        },
      })
    }

    const authenticatedUser = authData.user
    if (!authenticatedUser) {
      return NextResponse.redirect(`${origin}/auth?error=threads_unauthenticated`)
    }

    // Upsert social_accounts record (enforced unique by user_id+platform constraint)
    const { error: upsertError } = await supabase
      .from('social_accounts')
      .upsert(
        {
          user_id: authenticatedUser.id,
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
      return NextResponse.redirect(`${origin}/auth?error=threads_db_save_failed`)
    }

    return NextResponse.redirect(`${origin}/`)
  } catch (err: any) {
    console.error('Threads login callback exception:', err)
    return NextResponse.redirect(
      `${origin}/auth?error=threads_login_callback_exception&details=${encodeURIComponent(err.message)}`
    )
  }
}
