'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, LogOut, Settings } from 'lucide-react';

/**
 * Admin Layout with Sidebar Navigation
 * Provides authenticated admin interface with session management
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [sessionWarning, setSessionWarning] = useState(false);

  const menuItems = [
    { label: '대시보드', href: '/admin', icon: '📊' },
    { label: '회원 관리', href: '/admin/members', icon: '👥' },
    { label: '블랙리스트', href: '/admin/blacklist', icon: '🚫' },
    { label: '탈퇴 회원', href: '/admin/withdrawn', icon: '🚶' },
    { label: '사업자 관리', href: '/admin/businesses', icon: '🏢' },
    { label: '대출 관리', href: '/admin/loans', icon: '🏦' },
    { label: '펀딩 상품', href: '/admin/funding', icon: '💰' },
    { label: '투자 내역', href: '/admin/investments', icon: '📈' },
    { label: '채권 관리', href: '/admin/bonds', icon: '📋' },
    { label: '배분 관리', href: '/admin/distribution', icon: '🔀' },
    { label: '입금 관리', href: '/admin/deposits', icon: '⬇️' },
    { label: '출금 관리', href: '/admin/withdrawals', icon: '⬆️' },
    { label: '세무 관리', href: '/admin/tax', icon: '📄' },
    { label: '보고서', href: '/admin/reports', icon: '📊' },
    { label: '공지사항', href: '/admin/notices', icon: '📢' },
    { label: '사기 탐지', href: '/admin/fraud-detection', icon: '🚨' },
    { label: '로그', href: '/admin/logs', icon: '📝' },
    { label: '설정', href: '/admin/settings', icon: '⚙️' },
  ];

  // Check session expiry on mount and set up interval
  useEffect(() => {
    const checkSession = () => {
      const expiry = localStorage.getItem('adminSessionExpiry');
      if (!expiry) {
        router.push('/admin/login');
        return;
      }

      const expiryTime = parseInt(expiry);
      const now = Date.now();
      const timeRemaining = expiryTime - now;

      setSessionExpiry(expiryTime);

      // Show warning if less than 5 minutes remaining
      if (timeRemaining < 5 * 60 * 1000 && timeRemaining > 0) {
        setSessionWarning(true);
      } else if (timeRemaining <= 0) {
        localStorage.removeItem('adminSessionExpiry');
        router.push('/admin/login');
      } else {
        setSessionWarning(false);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminSessionExpiry');
    localStorage.removeItem('adminLoginAttempts');
    localStorage.removeItem('adminLoginLockoutTime');
    router.push('/admin/login');
  };

  // Check if current page is the login page
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 w-64 h-screen bg-gray-900 text-white overflow-y-auto transition-transform z-40 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-blue-400">FISCUS</h1>
          <p className="text-gray-400 text-sm">관리자 시스템</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h2 className="text-xl font-semibold text-gray-900 hidden sm:block">
                관리자 대시보드
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Session Warning */}
              {sessionWarning && (
                <div className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                  세션이 5분 내에 종료됩니다
                </div>
              )}

              {/* Admin Profile */}
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  관
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">관리자</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>

              {/* Settings Button */}
              <Link
                href="/admin/settings"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings size={20} />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
