'use client'

import React, { useState, useEffect } from 'react'
import { ProfileWorkspace, ProfileData } from '@/components/ProfileWorkspace'
import { loadProfile, saveProfile } from '@/lib/state'

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)

  // Load profile on client mount to prevent server hydration mismatches
  useEffect(() => {
    setProfile(loadProfile())
  }, [])

  const handleSaveProfile = (newProfile: ProfileData) => {
    saveProfile(newProfile)
    setProfile(newProfile)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return <ProfileWorkspace profile={profile} onSave={handleSaveProfile} />
}
