import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
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
  const threadsUserId = String(meData.id)

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
  const { searchParams } = new URL(request.url)
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const origin = `${protocol}://${host}`
  const code = searchParams.get('code')
  const errorMsg = searchParams.get('error')

  if (searchParams.get('debug') === '1') {
    return NextResponse.json({
      origin,
      host,
      protocol,
      allHeaders: Object.fromEntries(headersList.entries()),
      appIdPresent: Boolean(process.env.NEXT_PUBLIC_THREAD_APP_ID),
      appSecretPresent: Boolean(process.env.THREAD_APP_SECRET),
    })
  }

  if (errorMsg) {
    return NextResponse.redirect(`${origin}/auth?error=threads_oauth_failed&details=${encodeURIComponent(errorMsg)}`)
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=threads_no_code`)
  }

  const appId = process.env.NEXT_PUBLIC_THREAD_APP_ID
  const appSecret = process.env.THREAD_APP_SECRET

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

    // If there is an existing mapping, verify that it matches our synthetic user credentials.
    // If sign-in failed or the ID does not match, it means this Threads account is linked to a different (email) account.
    if (existingMapping) {
      if (authError || (authData?.user && authData.user.id !== existingMapping.user_id)) {
        if (!authError) {
          await supabase.auth.signOut()
        }
        return NextResponse.redirect(
          `${origin}/auth?error=threads_already_linked&details=${encodeURIComponent(
            'This Threads account is already connected to another email account. Please log in with that email account.'
          )}`
        )
      }
    }

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

    // Use a fresh Supabase client instance to ensure the authorization headers carry the active session cookie
    const dbClient = await createClient()

    // Upsert social_accounts record (enforced unique by user_id+platform constraint)
    const { error: upsertError } = await dbClient
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
