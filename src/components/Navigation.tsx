'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PenSquare, FolderHeart, BarChart3, Sparkles, LogOut, User, Sun, Moon } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { useTheme } from './ThemeContext'
import { useLanguage } from './LanguageContext'

export function Navigation() {
  const pathname = usePathname()
  
  const activeTab = 
    pathname === '/' ? 'workspace' :
    pathname.startsWith('/profile') ? 'profile' :
    pathname.startsWith('/analytics') ? 'analytics' :
    pathname.startsWith('/account') ? 'account' : 'workspace';

  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      {/* Desktop Navigation Bottom Bar (hidden on mobile) */}
      <header className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel border border-zinc-200/85 dark:border-zinc-800/85 px-6 py-2.5 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 max-w-max w-auto">
        <div className="flex items-center justify-between gap-8 md:gap-12">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 whitespace-nowrap">
                ThreadCraft <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold">Pocket</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <nav className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Link
                href="/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                <FolderHeart className="w-3.5 h-3.5" />
                {t('nav.profile')}
              </Link>

              <Link
                href="/"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === 'workspace'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                <PenSquare className="w-3.5 h-3.5" />
                {t('nav.generate')}
              </Link>

              <Link
                href="/analytics"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                {t('nav.analytics')}
              </Link>

              <Link
                href="/account"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === 'account'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                {t('nav.account')}
              </Link>
            </nav>

            <button
              onClick={() => setLanguage(language === 'en' ? 'jp' : 'en')}
              title={language === 'en' ? '日本語に切り替え' : 'Switch to English'}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-all font-mono-custom text-xs font-bold cursor-pointer shrink-0"
            >
              {language === 'en' ? 'JP' : 'EN'}
            </button>

            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? t('global.theme.light') : t('global.theme.dark')}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLogout}
              title={t('nav.signout')}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header (Top Title Only + Logout) */}
      <header className="block md:hidden glass-panel border-b border-zinc-200/80 dark:border-zinc-800/85 px-4 py-3 mb-6 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-zinc-900 dark:text-zinc-100">ThreadCraft Pocket</h1>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono-custom">Automated Search & Analysis Loop</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'jp' : 'en')}
              title={language === 'en' ? '日本語に切り替え' : 'Switch to English'}
              className="px-2 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-all font-mono-custom text-[10px] font-bold cursor-pointer"
            >
              {language === 'en' ? 'JP' : 'EN'}
            </button>

            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? t('global.theme.light') : t('global.theme.dark')}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (sticky bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-center py-2 px-4 shadow-lg shadow-black/5">
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-500 dark:text-zinc-450'
          }`}
        >
          <FolderHeart className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t('nav.profile')}</span>
        </Link>

        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'workspace' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-500 dark:text-zinc-450'
          }`}
        >
          <PenSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t('nav.generate')}</span>
        </Link>

        <Link
          href="/analytics"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'analytics' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-500 dark:text-zinc-450'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t('nav.analytics')}</span>
        </Link>

        <Link
          href="/account"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'account' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-500 dark:text-zinc-450'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t('nav.account')}</span>
        </Link>
      </nav>
    </>
  )
}
