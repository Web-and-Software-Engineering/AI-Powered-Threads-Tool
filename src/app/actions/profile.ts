'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAccountDetails() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return {
    email: user.email || '',
    displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Content Creator',
    avatarUrl: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  }
}

export async function updateAccountProfile(formData: FormData) {
  const displayName = formData.get('displayName') as string
  const avatarUrl = formData.get('avatarUrl') as string

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: displayName,
      avatar_url: avatarUrl,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: 'Profile updated successfully!' }
}

export async function changeUserPassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'All password fields are required' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long' }
  }

  const supabase = await createClient()

  // Verify session is active and valid before updating password
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated or session expired' }
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password changed successfully!' }
}
