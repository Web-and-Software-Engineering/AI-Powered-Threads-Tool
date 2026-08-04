'use client'

import React, { useState, useEffect } from 'react'
import { AccountSettings } from '@/components/AccountSettings'
import { getAccountDetails } from '@/app/actions/profile'
import { checkThreadsConnection } from '@/app/actions/threads'

export default function AccountPage() {
  const [accountDetails, setAccountDetails] = useState<{
    email: string
    displayName: string
    avatarUrl: string
    isThreadsUser?: boolean
  } | null>(null)
  
  const [threadsConnected, setThreadsConnected] = useState(false)
  const [threadsUsername, setThreadsUsername] = useState('')
  const [threadsDisplayName, setThreadsDisplayName] = useState('')
  const [threadsAvatarUrl, setThreadsAvatarUrl] = useState('')

  // Load account details on client mount
  useEffect(() => {
    async function loadAccount() {
      const details = await getAccountDetails()
      if (details) {
        setAccountDetails(details)
      }
      const conn = await checkThreadsConnection()
      setThreadsConnected(conn.connected)
      setThreadsUsername(conn.username || '')
      setThreadsDisplayName(conn.displayName || '')
      setThreadsAvatarUrl(conn.avatarUrl || '')
    }
    loadAccount()
  }, [])

  // Handle URL errors on redirect back (e.g. from Threads)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const details = params.get('details')
    
    if (error) {
      console.error('[Threads Callback Error] type:', error, 'details:', details)
      alert(`Threads Connection Failed: ${error}${details ? ` (${details})` : ''}`)
      params.delete('error')
      params.delete('details')
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
    }
  }, [])

  if (!accountDetails) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <AccountSettings
      key={`${accountDetails.email}-${threadsConnected}`}
      initialDisplayName={accountDetails.displayName}
      initialAvatarUrl={accountDetails.avatarUrl}
      initialEmail={accountDetails.email}
      isThreadsUser={accountDetails.isThreadsUser}
      threadsConnected={threadsConnected}
      threadsUsername={threadsUsername}
      threadsDisplayName={threadsDisplayName}
      threadsAvatarUrl={threadsAvatarUrl}
    />
  )
}
