'use client'

import React, { useState } from 'react'
import { User, Key, AlertCircle, CheckCircle, Camera, Check, Eye, EyeOff, Sparkles, ExternalLink } from 'lucide-react'
import { updateAccountProfile, changeUserPassword } from '@/app/actions/profile'
import { getThreadsAuthUrl, disconnectThreads } from '@/app/actions/threads'

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
  isThreadsUser?: boolean
  threadsConnected?: boolean
  threadsUsername?: string
  threadsDisplayName?: string
  threadsAvatarUrl?: string
  threadsLoading?: boolean
  threadsExpiresAt?: string
}

export function AccountSettings({
  initialDisplayName = 'Content Creator',
  initialAvatarUrl = PRESET_AVATARS[0],
  initialEmail = 'creator@threadcraft.ai',
  isThreadsUser = false,
  threadsConnected = false,
  threadsUsername = '',
  threadsDisplayName = '',
  threadsAvatarUrl = '',
  threadsLoading = false,
  threadsExpiresAt = '',
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

  // Threads connection states
  const [threadsConnecting, setThreadsConnecting] = useState(false)
  const [threadsError, setThreadsError] = useState<string | null>(null)
  const [threadsSuccess, setThreadsSuccess] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(threadsConnected)
  const [connUsername, setConnUsername] = useState(threadsUsername)
  const [connDisplayName, setConnDisplayName] = useState(threadsDisplayName)
  const [connAvatarUrl, setConnAvatarUrl] = useState(threadsAvatarUrl)

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

  const handleConnectThreads = async () => {
    setThreadsError(null)
    setThreadsSuccess(null)
    setThreadsConnecting(true)

    if (isConnected) {
      // Disconnect
      try {
        const result = await disconnectThreads()
        if (result?.error) {
          setThreadsError(result.error)
        } else {
          setIsConnected(false)
          setConnUsername('')
          setConnDisplayName('')
          setConnAvatarUrl('')
          setThreadsSuccess('Threads account unlinked successfully!')
        }
      } catch (err: any) {
        setThreadsError(err.message || 'An error occurred during disconnect.')
      } finally {
        setThreadsConnecting(false)
      }
    } else {
      // Connect / Link — redirect to Threads OAuth
      try {
        const result = await getThreadsAuthUrl()
        if (result?.error) {
          setThreadsError(result.error)
          setThreadsConnecting(false)
        } else if (result?.url) {
          window.location.href = result.url
        }
      } catch (err: any) {
        setThreadsError(err.message || 'An error occurred triggering OAuth.')
        setThreadsConnecting(false)
      }
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

              {/* Read Only Email / Username */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 block">
                  {isThreadsUser ? 'Threads Account (Read Only)' : 'Registered Email (Read Only)'}
                </label>
                <input
                  type={isThreadsUser ? 'text' : 'email'}
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

      {/* Threads Connection Panel */}
      <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" /> Linked Threads Account
        </h3>

        {threadsError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-fade-in min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-mono-custom break-all flex-1">{threadsError}</span>
          </div>
        )}

        {threadsSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-fade-in min-w-0">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-mono-custom break-all flex-1">{threadsSuccess}</span>
          </div>
        )}
        
        {threadsLoading ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 animate-pulse">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-zinc-200 rounded w-1/4" />
                <div className="h-2 bg-zinc-200 rounded w-1/2" />
              </div>
            </div>
            <div className="h-8 bg-zinc-200 rounded-xl w-32 shrink-0 hidden md:block" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="flex items-center gap-3">
              {isConnected && connAvatarUrl ? (
                <img
                  src={connAvatarUrl}
                  alt={connDisplayName || connUsername}
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 shadow-sm shrink-0"
                />
              ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-zinc-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-zinc-500" />
                </div>
              )}
              <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-800 block">
                {isConnected ? (connDisplayName || `@${connUsername}`) : 'Threads Account'}
              </span>
              <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-500 font-mono-custom">
                <span>
                  {isConnected 
                    ? `@${connUsername} · Connected`
                    : 'Connect your Threads account to publish directly from the app.'}
                </span>
                {isConnected && (
                  <>
                    <span className="text-zinc-300 select-none">|</span>
                    <a
                      href={`https://threads.net/@${connUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 transition-colors inline-flex items-center gap-0.5 text-[10px] font-bold"
                      title="View profile on Threads"
                    >
                      <ExternalLink className="w-3 h-3" /> View Profile
                    </a>
                  </>
                )}
              </div>
              {isConnected && threadsExpiresAt && (
                <span className="text-[10px] text-zinc-400 font-mono-custom block mt-0.5">
                  Token active · Expires on {threadsExpiresAt}
                </span>
              )}
            </div>
            </div>
            
            <button
              type="button"
              onClick={handleConnectThreads}
              disabled={threadsConnecting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md whitespace-nowrap ${
                isConnected 
                  ? 'bg-zinc-200 hover:bg-rose-50 hover:text-rose-600 text-zinc-700' 
                  : 'bg-black hover:bg-zinc-800 text-white shadow-zinc-950/20'
              }`}
            >
              {threadsConnecting 
                ? 'Processing...' 
                : isConnected 
                  ? 'Disconnect Account' 
                  : 'Link Threads Account'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
