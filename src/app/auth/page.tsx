'use client'

import React, { useState } from 'react'
import { login, signup, loginWithThreads } from '@/app/actions/auth'
import { Sparkles, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '@/components/LanguageContext'

export default function AuthPage() {
  const { t, language } = useLanguage()
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const translateErrorMessage = (msg: string) => {
    if (language !== 'jp') return msg

    const lower = msg.toLowerCase()
    if (lower.includes('invalid login credentials')) {
      return 'メールアドレスまたはパスワードが正しくありません。'
    }
    if (lower.includes('user already registered')) {
      return 'このメールアドレスは既に登録されています。'
    }
    if (lower.includes('password should be at least 6 characters') || lower.includes('must be at least 6 characters')) {
      return 'パスワードは6文字以上で入力してください。'
    }
    if (lower.includes('email and password are required')) {
      return 'メールアドレスとパスワードは必須です。'
    }
    if (lower.includes('all fields are required')) {
      return 'すべてのフィールドを入力してください。'
    }
    if (lower.includes('passwords do not match')) {
      return 'パスワードが一致しません。'
    }
    if (lower.includes('email not confirmed') || lower.includes('confirm your email')) {
      return 'メールアドレスの確認が完了していません。受信トレイを確認してください。'
    }
    if (lower.includes('rate limit')) {
      return 'リクエストの制限回数を超えました。しばらく時間をおいて再試行してください。'
    }
    return msg
  }

  const translateSuccessMessage = (msg: string) => {
    if (language !== 'jp') return msg
    const lower = msg.toLowerCase()
    if (lower.includes('check your email')) {
      return '確認メールを送信しました。メールボックスを確認してください。'
    }
    return msg
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      if (isRegister) {
        const result = await signup(formData)
        if (result?.error) {
          setError(translateErrorMessage(result.error))
        } else if (result?.redirect) {
          window.location.href = result.redirect
        } else if (result?.success) {
          setSuccess(translateSuccessMessage(result.success))
        }
      } else {
        const result = await login(formData)
        if (result?.error) {
          setError(translateErrorMessage(result.error))
        } else if (result?.redirect) {
          window.location.href = result.redirect
        }
      }
    } catch (err: any) {
      setError(translateErrorMessage(err.message || (language === 'jp' ? '予期しないエラーが発生しました。' : 'An unexpected error occurred.')))
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthClick = async () => {
    setError(null)
    try {
      const result = await loginWithThreads()
      if (result?.error) {
        setError(translateErrorMessage(result.error))
      } else if (result?.redirect) {
        window.location.href = result.redirect
      }
    } catch (err: any) {
      setError(translateErrorMessage(err.message || (language === 'jp' ? 'OAuthの初期化に失敗しました。' : 'OAuth initialization failed.')))
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex items-center justify-center p-4 md:p-8 font-sans-custom transition-colors duration-200">
      <div className="w-full max-w-md glass-panel p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-wide text-zinc-900 dark:text-zinc-100">ThreadCraft Pocket</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono-custom">{language === 'jp' ? '参考投稿の自動取得・リライトループ' : 'Automated Reference & Rewrite Loop'}</p>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 mb-5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-350 flex items-start gap-2.5 animate-fade-in min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-mono-custom break-all whitespace-pre-wrap flex-1">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-350 flex items-start gap-2.5 animate-fade-in min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-mono-custom break-all whitespace-pre-wrap flex-1">{success}</span>
          </div>
        )}

        {/* Main Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              {language === 'jp' ? 'メールアドレス' : 'Email Address'}
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@domain.com"
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono-custom"
            />
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              {language === 'jp' ? 'パスワード' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 pr-10 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono-custom"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-650 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password field (Register only) */}
          {isRegister && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-600" />
                {language === 'jp' ? 'パスワード（確認）' : 'Confirm Password'}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 pr-10 text-xs text-zinc-800 dark:text-zinc-205 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono-custom"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-650 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading 
              ? (language === 'jp' ? '認証中...' : 'Authenticating...') 
              : isRegister 
                ? (language === 'jp' ? 'アカウント作成' : 'Create Account') 
                : (language === 'jp' ? 'ログイン' : 'Sign In')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-zinc-400 dark:text-zinc-550 text-[10px] font-mono-custom uppercase tracking-wider">{language === 'jp' ? 'または' : 'or'}</span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>

        {/* OAuth Button */}
        <button
          onClick={handleOAuthClick}
          className="w-full py-3.5 bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-100 text-white dark:text-black rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
          {language === 'jp' ? 'Threadsでサインイン' : 'Continue with Threads'}
        </button>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister)
              setError(null)
              setSuccess(null)
            }}
            className="text-xs text-purple-600 hover:text-purple-700 font-semibold transition-colors cursor-pointer"
          >
            {isRegister 
              ? (language === 'jp' ? 'すでにアカウントをお持ちですか？ログイン' : 'Already have an account? Sign In') 
              : (language === 'jp' ? 'アカウントをお持ちでないですか？新規登録' : "Don't have an account? Sign Up")}
          </button>
        </div>
      </div>
    </div>
  )
}
