'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUsersList() {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Call get_all_users RPC
  const { data, error } = await supabase.rpc('get_all_users')

  if (error) {
    console.error('[Admin Actions] Failed to fetch users list:', error)
    return { error: error.message }
  }

  return { users: data || [] }
}

export async function updateUserStatus(
  profileId: string,
  isApproved: boolean,
  role: string,
  approvedUntil?: string | null
) {
  const supabase = await createClient()

  // Verify caller is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Verify caller is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, is_approved')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin' || !profile.is_approved) {
    return { error: 'Access denied: Admin privileges required' }
  }

  // Update user_profile
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ 
      is_approved: isApproved, 
      role, 
      approved_until: isApproved ? (approvedUntil || null) : null 
    })
    .eq('id', profileId)

  if (updateError) {
    console.error('[Admin Actions] Failed to update user profile:', updateError)
    return { error: updateError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // Verify caller is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Verify caller is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, is_approved')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin' || !profile.is_approved) {
    return { error: 'Access denied: Admin privileges required' }
  }

  // Call delete_user_by_admin RPC
  const { error: deleteError } = await supabase.rpc('delete_user_by_admin', {
    target_user_id: userId,
  })

  if (deleteError) {
    console.error('[Admin Actions] Failed to delete user:', deleteError)
    return { error: deleteError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
