'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, ShieldAlert, UserX, UserCheck, Shield, RefreshCw, CheckCircle2 } from 'lucide-react'
import { getUsersList, updateUserStatus } from '@/app/actions/admin'
import { getAccountDetails } from '@/app/actions/profile'
import { useLanguage } from '@/components/LanguageContext'

interface UserProfile {
  profile_id: string
  user_id: string
  email: string
  display_name: string
  avatar_url: string
  role: string
  is_approved: boolean
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'admin'>('all')
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getUsersList()
      if (res.error) {
        setError(res.error)
      } else if (res.users) {
        setUsers(res.users)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to fetch user list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function verifyAdmin() {
      const details = await getAccountDetails()
      if (!details || details.role !== 'admin') {
        router.push('/')
      } else {
        fetchUsers()
      }
    }
    verifyAdmin()
  }, [router])

  const handleToggleApproval = async (profileId: string, currentApproved: boolean, role: string) => {
    setActioningId(profileId)
    try {
      const res = await updateUserStatus(profileId, !currentApproved, role)
      if (res.error) {
        showToast(res.error, 'error')
      } else {
        setUsers(prev =>
          prev.map(u =>
            u.profile_id === profileId ? { ...u, is_approved: !currentApproved } : u
          )
        )
        showToast(
          language === 'jp'
            ? (currentApproved ? 'ユーザーの承認を解除しました' : 'ユーザーを承認しました')
            : (currentApproved ? 'User approval removed successfully!' : 'User approved successfully!')
        )
      }
    } catch (err) {
      console.error(err)
      showToast(language === 'jp' ? 'エラーが発生しました' : 'An error occurred', 'error')
    } finally {
      setActioningId(null)
    }
  }

  const handleToggleRole = async (profileId: string, approved: boolean, currentRole: string) => {
    setActioningId(profileId)
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      const res = await updateUserStatus(profileId, approved, newRole)
      if (res.error) {
        showToast(res.error, 'error')
      } else {
        setUsers(prev =>
          prev.map(u =>
            u.profile_id === profileId ? { ...u, role: newRole } : u
          )
        )
        showToast(
          language === 'jp'
            ? `役割を${newRole === 'admin' ? '管理者' : '一般ユーザー'}に変更しました`
            : `Role updated to ${newRole} successfully!`
        )
      }
    } catch (err) {
      console.error(err)
      showToast(language === 'jp' ? 'エラーが発生しました' : 'An error occurred', 'error')
    } finally {
      setActioningId(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === 'pending') return !user.is_approved
    if (statusFilter === 'approved') return user.is_approved
    if (statusFilter === 'admin') return user.role === 'admin'
    return true
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in px-2 md:px-0">
      {/* Header Banner */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {language === 'jp' ? 'ユーザー管理 & 承認ハブ' : 'User Control & Approvals'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono-custom">
              {language === 'jp' ? '登録ユーザーの審査・承認、管理権限の割り当てを行います。' : 'Review user registrations, toggle approval status, and manage platform roles.'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shrink-0"
          title="Refresh table"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="glass-panel p-6 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/5 text-rose-800 dark:text-rose-400 text-center font-mono-custom text-xs">
          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={language === 'jp' ? 'メールまたは名前で検索...' : 'Search by email or name...'}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 transition-all font-mono-custom"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-zinc-150/40 dark:bg-zinc-900/60 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 gap-1 self-stretch md:self-auto overflow-x-auto select-none">
              {(['all', 'pending', 'approved', 'admin'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer font-sans-custom ${
                    statusFilter === tab
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab === 'all' && (language === 'jp' ? 'すべて' : 'All Users')}
                  {tab === 'pending' && (language === 'jp' ? '承認待ち' : 'Pending')}
                  {tab === 'approved' && (language === 'jp' ? '承認済み' : 'Approved')}
                  {tab === 'admin' && (language === 'jp' ? '管理者' : 'Admins')}
                </button>
              ))}
            </div>
          </div>

          {/* User Table Grid */}
          <div className="glass-panel rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono-custom select-none">
                    <th className="py-4 px-6">{language === 'jp' ? 'ユーザー' : 'User'}</th>
                    <th className="py-4 px-6">{language === 'jp' ? '登録日' : 'Registered At'}</th>
                    <th className="py-4 px-6">{language === 'jp' ? '役割' : 'Role'}</th>
                    <th className="py-4 px-6">{language === 'jp' ? 'ステータス' : 'Status'}</th>
                    <th className="py-4 px-6 text-right">{language === 'jp' ? 'アクション' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs leading-normal">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400 dark:text-zinc-500 font-mono-custom">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-600" />
                        {language === 'jp' ? 'ユーザー読み込み中...' : 'Loading users list...'}
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400 dark:text-zinc-500 font-mono-custom">
                        {language === 'jp' ? '該当するユーザーが見つかりません。' : 'No matching users found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.profile_id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                        {/* Profile Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.display_name}
                                className="w-8.5 h-8.5 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 bg-zinc-100"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-8.5 h-8.5 rounded-full bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center font-bold">
                                {user.display_name?.slice(0, 2).toUpperCase() || 'US'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate leading-none mb-1">
                                {user.display_name}
                              </span>
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-mono-custom truncate block">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Registered date */}
                        <td className="py-4 px-6 text-zinc-500 dark:text-zinc-450 font-mono-custom">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString(language === 'jp' ? 'ja-JP' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '-'}
                        </td>

                        {/* Role */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono-custom text-[10px] font-bold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-350 border border-purple-200 dark:border-purple-900'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                          }`}>
                            {user.role === 'admin' ? (
                              <>
                                <Shield className="w-3 h-3" /> Admin
                              </>
                            ) : 'User'}
                          </span>
                        </td>

                        {/* Approval status */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono-custom font-semibold ${
                            user.is_approved
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/50'
                              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 border border-amber-250 dark:border-amber-900/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.is_approved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {user.is_approved 
                              ? (language === 'jp' ? '承認済み' : 'Approved') 
                              : (language === 'jp' ? '承認待ち' : 'Pending')}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle Approval Button */}
                            <button
                              onClick={() => handleToggleApproval(user.profile_id, user.is_approved, user.role)}
                              disabled={actioningId === user.profile_id}
                              className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                                user.is_approved
                                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-250 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                                  : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                              }`}
                              title={user.is_approved ? 'Suspend User' : 'Approve User'}
                            >
                              {user.is_approved ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>

                            {/* Toggle Role Button */}
                            <button
                              onClick={() => handleToggleRole(user.profile_id, user.is_approved, user.role)}
                              disabled={actioningId === user.profile_id}
                              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                              title="Toggle Role"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl animate-fade-in leading-relaxed min-w-[280px] max-w-sm ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-800 dark:text-emerald-450'
            : 'bg-rose-500/10 border-rose-500/35 text-rose-800 dark:text-rose-450'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span className="text-xs font-semibold font-sans-custom">{toast.message}</span>
        </div>
      )}
    </div>
  )
}
