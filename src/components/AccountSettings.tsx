'use client'

import React, { useState } from 'react'
import { User, Shield, Key, AlertCircle, CheckCircle, Camera, Check, Eye, EyeOff } from 'lucide-react'
import { updateAccountProfile, changeUserPassword } from '@/app/actions/profile'

// Pre-selected high-quality testing avatars
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
]

interface AccountSettingsProps {
  initialDisplayName?: string
  initialAvatarUrl?: string
  initialEmail?: string
}

export function AccountSettings({
  initialDisplayName = 'Content Creator',
  initialAvatarUrl = PRESET_AVATARS[0],
  initialEmail = 'creator@threadcraft.ai',
}: AccountSettingsProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null)
  const [pwdSaving, setPwdSaving] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)
    setProfileSaving(true)

    const formData = new FormData()
    formData.append('displayName', displayName)
    formData.append('avatarUrl', avatarUrl)

    try {
      const result = await updateAccountProfile(formData)
      if (result?.error) {
        setProfileError(result.error)
      } else {
        setProfileSuccess('Profile updated successfully!')
      }
    } catch (err: any) {
      setProfileError(err.message || 'An unexpected error occurred.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPwdError(null)
    setPwdSuccess(null)
    setPwdSaving(true)

    const formData = new FormData()
    formData.append('password', password)
    formData.append('confirmPassword', confirmPassword)

    try {
      const result = await changeUserPassword(formData)
      if (result?.error) {
        setPwdError(result.error)
      } else {
        setPwdSuccess('Password changed successfully!')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      setPwdError(err.message || 'An unexpected error occurred.')
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in px-2 md:px-0">
      {/* Tab Header Banner */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-200">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Account Credentials</h2>
            <p className="text-xs text-zinc-500 font-mono-custom">
              Manage your personal display name, profile avatar, and secure password updates.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-600" /> Public Details
            </h3>

            {profileError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-fade-in min-w-0">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-mono-custom break-all flex-1">{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-fade-in min-w-0">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-mono-custom break-all flex-1">{profileSuccess}</span>
              </div>
            )}

            {/* Avatar picker */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-700 block">Profile Photo Selection</label>
              <div className="flex items-center gap-4">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-600 shadow-md shrink-0"
                />
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        avatarUrl === url ? 'border-purple-600' : 'border-zinc-200'
                      }`}
                    >
                      <img src={url} alt="preset avatar" className="w-full h-full object-cover" />
                      {avatarUrl === url && (
                        <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
              {/* Display Name Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700 block">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono-custom"
                />
              </div>

              {/* Read Only Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 block">Registered Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={initialEmail}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-400 font-mono-custom select-none cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving || !displayName.trim()}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/25 transition-all active:scale-95 cursor-pointer"
                >
                  {profileSaving ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Password Card */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-600" /> Password settings
            </h3>

            {pwdError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-fade-in min-w-0">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-mono-custom break-all flex-1">{pwdError}</span>
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-fade-in min-w-0">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-mono-custom break-all flex-1">{pwdSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700 block">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 pr-10 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono-custom"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700 block">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 pr-10 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono-custom"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={pwdSaving || password.length < 6 || password !== confirmPassword}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/25 transition-all active:scale-95 cursor-pointer"
                >
                  {pwdSaving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
