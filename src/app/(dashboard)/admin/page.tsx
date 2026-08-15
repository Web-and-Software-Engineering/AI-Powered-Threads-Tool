'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Users, Search, ShieldAlert, UserX, UserCheck, Shield, RefreshCw, CheckCircle2, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react'
import { getUsersList, updateUserStatus, deleteUser, resetUserPassword } from '@/app/actions/admin'
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
  approved_until?: string | null
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

  // State for Approval Modal
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [modalProfileId, setModalProfileId] = useState<string | null>(null)
  const [modalRole, setModalRole] = useState<string>('user')
  const [durationOption, setDurationOption] = useState<'permanent' | '1day' | '7days' | '30days' | '1year' | 'custom'>('permanent')
  const [customDate, setCustomDate] = useState('')
  const [mounted, setMounted] = useState(false)

  // State for Password Reset Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordModalUserId, setPasswordModalUserId] = useState<string | null>(null)
  const [passwordModalEmail, setPasswordModalEmail] = useState<string>('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordResetting, setPasswordResetting] = useState(false)

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
    setMounted(true)
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
    if (currentApproved) {
      // Suspend user directly (no modal needed)
      setActioningId(profileId)
      try {
        const res = await updateUserStatus(profileId, false, role, null)
        if (res.error) {
          showToast(res.error, 'error')
        } else {
          setUsers(prev =>
            prev.map(u =>
              u.profile_id === profileId 
                ? { ...u, is_approved: false, approved_until: null } 
                : u
            )
          )
          showToast(
            language === 'jp'
              ? 'ユーザーの承認を解除しました'
              : 'User approval removed successfully!'
          )
        }
      } catch (err) {
        console.error(err)
        showToast(language === 'jp' ? 'エラーが発生しました' : 'An error occurred', 'error')
      } finally {
        setActioningId(null)
      }
    } else {
      // Approving user: show duration selection modal
      setModalProfileId(profileId)
      setModalRole(role)
      setDurationOption('permanent')
      setCustomDate('')
      setShowApprovalModal(true)
    }
  }

  const handleConfirmApproval = async () => {
    if (!modalProfileId) return

    let approvedUntil: string | null = null

    if (durationOption === '1day') {
      approvedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    } else if (durationOption === '7days') {
      approvedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    } else if (durationOption === '30days') {
      approvedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    } else if (durationOption === '1year') {
      approvedUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    } else if (durationOption === 'custom') {
      if (!customDate) {
        showToast(
          language === 'jp' ? '日付を選択してください' : 'Please select a custom date',
          'error'
        )
        return
      }
      approvedUntil = new Date(customDate).toISOString()
    }

    setActioningId(modalProfileId)
    setShowApprovalModal(false)

    try {
      const res = await updateUserStatus(modalProfileId, true, modalRole, approvedUntil)
      if (res.error) {
        showToast(res.error, 'error')
      } else {
        setUsers(prev =>
          prev.map(u =>
            u.profile_id === modalProfileId 
              ? { ...u, is_approved: true, approved_until: approvedUntil } 
              : u
          )
        )
        showToast(
          language === 'jp'
            ? 'ユーザーを承認しました'
            : 'User approved successfully!'
        )
      }
    } catch (err) {
      console.error(err)
      showToast(language === 'jp' ? 'エラーが発生しました' : 'An error occurred', 'error')
    } finally {
      setActioningId(null)
      setModalProfileId(null)
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

  const handleDeleteUser = async (userId: string, email: string) => {
    const confirmText = language === 'jp' 
      ? `本当にこのユーザー (${email}) を完全に削除しますか？この操作は取り消せません。`
      : `Are you sure you want to permanently delete user (${email})? This action cannot be undone.`
    
    if (!window.confirm(confirmText)) return

    setActioningId(userId)
    try {
      const res = await deleteUser(userId)
      if (res.error) {
        showToast(res.error, 'error')
      } else {
        setUsers(prev => prev.filter(u => u.user_id !== userId))
        showToast(
          language === 'jp'
            ? 'ユーザーを完全に削除しました。'
            : 'User permanently deleted successfully.'
        )
      }
    } catch (err) {
      console.error(err)
      showToast(language === 'jp' ? 'エラーが発生しました' : 'An error occurred', 'error')
    } finally {
      setActioningId(null)
    }
  }

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*'
    let pwd = ''
    for (let i = 0; i < 16; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(pwd)
    setShowPassword(true)
  }

  const handleOpenPasswordReset = (userId: string, email: string) => {
    setPasswordModalUserId(userId)
    setPasswordModalEmail(email)
    setNewPassword('')
    setShowPassword(false)
    setShowPasswordModal(true)
  }

  const handleConfirmPasswordReset = async () => {
    if (!passwordModalUserId || !newPassword) return
    setPasswordResetting(true)
    try {
      const res = await resetUserPassword(passwordModalUserId, newPassword)
      if (res.error) {
        showToast(res.error, 'error')
      } else {
        showToast(
          language === 'jp'
            ? 'パスワードをリセットしました'
            : 'Password reset successfully!'
        )
        setShowPasswordModal(false)
        setPasswordModalUserId(null)
      }
    } catch (err) {
      console.error(err)
      showToast(language === 'jp' ? 'エラーが発生しました' : 'An error occurred', 'error')
    } finally {
      setPasswordResetting(false)
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
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
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
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-orange-500 transition-all font-mono-custom"
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
                      ? 'bg-orange-600 text-white shadow-md'
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
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-orange-600" />
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
                              <div className="w-8.5 h-8.5 rounded-full bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40 flex items-center justify-center font-bold">
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
                              ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-350 border border-orange-200 dark:border-orange-900'
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
                          {(() => {
                            const isExpired = user.is_approved && user.approved_until && new Date(user.approved_until) < new Date()
                            return (
                              <div className="flex flex-col gap-1.5 animate-fade-in">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono-custom font-semibold w-fit border ${
                                  isExpired
                                    ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-250 dark:border-rose-900/50'
                                    : user.is_approved
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/50'
                                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 border border-amber-250 dark:border-amber-900/50'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-rose-500' : user.is_approved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                  {isExpired 
                                    ? (language === 'jp' ? '期限切れ' : 'Expired')
                                    : user.is_approved 
                                    ? (language === 'jp' ? '承認済み' : 'Approved') 
                                    : (language === 'jp' ? '承認待ち' : 'Pending')}
                                </span>

                                {user.is_approved && !isExpired && user.approved_until && (
                                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono-custom pl-1">
                                    {language === 'jp' ? '期限: ' : 'Expires: '}
                                    {new Date(user.approved_until).toLocaleDateString(language === 'jp' ? 'ja-JP' : 'en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}

                                {user.is_approved && !user.approved_until && (
                                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono-custom pl-1 animate-fade-in">
                                    {language === 'jp' ? '無期限' : 'Permanent'}
                                  </span>
                                )}
                              </div>
                            )
                          })()}
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

                            {/* Reset Password Button */}
                            <button
                              onClick={() => handleOpenPasswordReset(user.user_id, user.email)}
                              disabled={actioningId === user.profile_id}
                              className="p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                              title={language === 'jp' ? 'パスワードリセット' : 'Reset Password'}
                            >
                              <KeyRound className="w-4 h-4" />
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

                            {/* Delete User Button */}
                            <button
                              onClick={() => handleDeleteUser(user.user_id, user.email)}
                              disabled={actioningId === user.profile_id}
                              className="p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-455 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
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
        <div className="fixed top-6 right-6 md:top-8 md:right-8 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200 shadow-2xl shadow-black/40 animate-fade-in leading-relaxed min-w-[300px] max-w-sm">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span className="text-xs font-bold font-sans-custom">{toast.message}</span>
        </div>
      )}

      {/* Approval Duration Selection Modal */}
      {showApprovalModal && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {language === 'jp' ? 'ユーザー承認期間の選択' : 'Select Approval Duration'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
              {language === 'jp'
                ? 'このユーザーの有効期限を選択してください。期限が切れると自動的にアクセスが制限されます。'
                : 'Select how long this user should remain approved. Once expired, access is revoked automatically.'}
            </p>

            <div className="space-y-3 mb-6">
              {[
                { value: 'permanent', label: language === 'jp' ? '無期限 (永久承認)' : 'Indefinite / Permanent' },
                { value: '1day', label: language === 'jp' ? '24時間 (1日間)' : '24 Hours (1 Day)' },
                { value: '7days', label: language === 'jp' ? '7日間 (1週間)' : '7 Days (1 Week)' },
                { value: '30days', label: language === 'jp' ? '30日間 (1ヶ月間)' : '30 Days (1 Month)' },
                { value: '1year', label: language === 'jp' ? '1年間 (365日間)' : '1 Year (365 Days)' },
                { value: 'custom', label: language === 'jp' ? 'カスタム期限指定' : 'Custom Expiry Date' }
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-xs font-semibold ${
                    durationOption === opt.value
                      ? 'bg-orange-50/50 dark:bg-orange-950/10 border-orange-500/50 text-orange-700 dark:text-orange-300'
                      : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-850/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="duration"
                    value={opt.value}
                    checked={durationOption === opt.value}
                    onChange={() => setDurationOption(opt.value as any)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      durationOption === opt.value
                        ? 'border-orange-500'
                        : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {durationOption === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <span>{opt.label}</span>
                </label>
              ))}

              {/* Custom Date Input Field */}
              {durationOption === 'custom' && (
                <div className="pt-2 animate-fade-in">
                  <input
                    type="datetime-local"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-orange-500 transition-all font-mono-custom"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false)
                  setModalProfileId(null)
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                {language === 'jp' ? 'キャンセル' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmApproval}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-orange-500/10 cursor-pointer"
              >
                {language === 'jp' ? '承認を適用' : 'Approve User'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {language === 'jp' ? 'パスワードリセット' : 'Reset Password'}
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono-custom truncate max-w-[200px]">
                  {passwordModalEmail}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 mt-3">
              {language === 'jp'
                ? '新しいパスワードを設定します。SUPABASE_SECRET_KEY が必要です。'
                : 'Set a new password for this user. Requires SUPABASE_SECRET_KEY to be configured.'}
            </p>

            <div className="space-y-3 mb-5">
              {/* Password input */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={language === 'jp' ? '新しいパスワード (6文字以上)' : 'New password (min 6 characters)'}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pr-10 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 transition-all font-mono-custom"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Generate password */}
              <button
                type="button"
                onClick={generateStrongPassword}
                className="w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold transition-all cursor-pointer"
              >
                ✦ {language === 'jp' ? 'ランダムな強力なパスワードを生成' : 'Generate strong random password'}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordModalUserId(null)
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                {language === 'jp' ? 'キャンセル' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmPasswordReset}
                disabled={passwordResetting || newPassword.length < 6}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                {passwordResetting
                  ? (language === 'jp' ? 'リセット中...' : 'Resetting...')
                  : (language === 'jp' ? 'パスワードを更新' : 'Update Password')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
