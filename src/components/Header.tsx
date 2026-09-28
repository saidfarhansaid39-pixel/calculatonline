'use client';

import { Link, usePathname, useRouter } from '@/lib/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, Moon, Sun, ChevronDown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { PopularSearches } from '@/components/search/PopularSearches'
import { useAuth } from '@/components/auth/useAuth'

export function Header() {
  const t = useTranslations('nav')
  const tc = useTranslations('chrome')
  const pathname = usePathname()
  const locale = useLocale()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (!stored && prefersDark);
    setDark(isDark);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      setSearchOpen(false);
      setMoreOpen(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
    // `locale` included: a pure language switch can keep the same stripped
    // pathname (e.g. "/" -> "/fr"), and menus must still close.
  }, [pathname, locale]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setMoreOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const menu = mobileMenuRef.current;
    if (!menu) return;
    const focusable = menu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();
    const handleTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    menu.addEventListener('keydown', handleTrap);
    return () => menu.removeEventListener('keydown', handleTrap);
  }, [menuOpen]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const primaryLinks = [
    { label: t('finance'), href: '/financial-calculators' },
    { label: t('health'), href: '/health-calculators' },
    { label: t('math'), href: '/math-calculators' },
    { label: t('convert'), href: '/conversion-calculators' },
    { label: t('tools'), href: '/construction-calculators' },
    { label: t('date'), href: '/date-time-calculators' },
  ];

  const moreLinks = [
    { label: t('stats'), href: '/statistics-calculators' },
    { label: t('education'), href: '/education-calculators' },
    { label: t('physics'), href: '/physics-calculators' },
    { label: t('chemistry'), href: '/chemistry-calculators' },
    { label: t('engineering'), href: '/engineering-calculators' },
    { label: t('everyday'), href: '/everyday-calculators' },
    { label: t('food'), href: '/food-calculators' },
    { label: t('biology'), href: '/biology-calculators' },
    { label: t('ecology'), href: '/ecology-calculators' },
    { label: t('sports'), href: '/sports-calculators' },
  ];

  const allLinks = [...primaryLinks, ...moreLinks];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="animate-fade-in-down">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a3a8a] to-[#06b6d4] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white">
                  <rect x="4" y="14" width="4" height="7" rx="1" fill="currentColor" opacity="0.6"/>
                  <rect x="10" y="9" width="4" height="12" rx="1" fill="currentColor"/>
                  <rect x="16" y="4" width="4" height="17" rx="1" fill="currentColor" opacity="0.8"/>
                  <rect x="4" y="4" width="16" height="2" rx="1" fill="currentColor" opacity="0.3"/>
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-[#1a3a8a] dark:text-[#3d61b0]">Calcu</span><span className="text-[#06b6d4]">lat</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 animate-fade-in">
            {primaryLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                aria-expanded={moreOpen}
                aria-haspopup="true"
                aria-label={t('moreAria')}
              >
                {t('more')}
                <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-2 animate-fade-in-down">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => { setMoreOpen(false); setMenuOpen(false); }}
                      className="block px-4 py-2 min-h-[44px] text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 animate-fade-in">
            <LocaleSwitcher variant="minimal" />

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label={t('searchIconAria')}
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label={t('darkMode')}
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/my-calculations"
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {tc('myCalculations')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {tc('logout')}
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {tc('login')}
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 text-sm font-semibold text-white bg-gradient-to-br from-[#1a3a8a] to-[#06b6d4] rounded-lg hover:opacity-90 transition-all duration-200"
                >
                  {tc('register')}
                </Link>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 touch-target"
              aria-label={t('menu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 animate-fade-in-down">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search')}
                aria-label={t('searchAria')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all text-sm"
                autoFocus
              />
            </div>
            <div className="mt-3">
              <PopularSearches />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div id="mobile-menu" ref={mobileMenuRef} className="md:hidden overflow-hidden animate-fade-in-down overscroll-contain">
            <div className="pb-4 border-t border-gray-200 dark:border-gray-800 pt-4">
              <nav aria-label={tc('mobileNav')} className="flex flex-col gap-1">
                {allLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 min-h-[44px] text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-1">
                  {user ? (
                    <>
                      <Link
                        href="/my-calculations"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2.5 min-h-[44px] text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        {tc('myCalculations')}
                      </Link>
                      <button
                        onClick={() => { setMenuOpen(false); handleLogout() }}
                        className="px-3 py-2.5 min-h-[44px] text-left text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        {tc('logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2.5 min-h-[44px] text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        {tc('login')}
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2.5 min-h-[44px] text-sm font-medium text-white bg-gradient-to-br from-[#1a3a8a] to-[#06b6d4] rounded-lg hover:opacity-90 transition-all"
                      >
                        {tc('register')}
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
