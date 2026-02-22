'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is logged in by looking for accessToken
    const accessToken = localStorage.getItem('accessToken');
    const storedUsername = localStorage.getItem('username');
    
    if (accessToken) {
      setIsLoggedIn(true);
      setUsername(storedUsername || 'User');
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    // Clear all localStorage auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('rememberedEmail');
    
    // Clear all sessionStorage signup flow data
    sessionStorage.clear();
    
    setIsLoggedIn(false);
    setUsername('');
    setIsUserMenuOpen(false);
    
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">FINNOVA</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-8">
              <Link href="/investment" className="text-gray-700 hover:text-blue-600 font-medium">
                투자
              </Link>
              <Link href="/loan" className="text-gray-700 hover:text-blue-600 font-medium">
                대출
              </Link>
              <Link href="/disclosure" className="text-gray-700 hover:text-blue-600 font-medium">
                사업공시
              </Link>
              <Link href="/support" className="text-gray-700 hover:text-blue-600 font-medium">
                이용안내
              </Link>
            </nav>

            {/* Desktop Auth Buttons or Profile */}
            <div className="hidden md:flex gap-3 items-center">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-700">{username}</span>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>

                  {/* User Menu Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 border-b border-gray-200 font-medium"
                      >
                        대시보드
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 border-b border-gray-200 font-medium"
                      >
                        계정 설정
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 font-medium"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium border border-gray-300 rounded-lg"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200">
              <Link href="/investment" className="block py-2 text-gray-700 hover:text-blue-600">
                투자
              </Link>
              <Link href="/loan" className="block py-2 text-gray-700 hover:text-blue-600">
                대출
              </Link>
              <Link href="/disclosure" className="block py-2 text-gray-700 hover:text-blue-600">
                사업공시
              </Link>
              <Link href="/support" className="block py-2 text-gray-700 hover:text-blue-600">
                이용안내
              </Link>
              <div className="flex gap-2 mt-4">
                {isLoggedIn ? (
                  <>
                    <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{username}</span>
                      </div>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 px-3 py-2 text-center bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium"
                    >
                      계정
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex-1 px-3 py-2 text-center bg-red-50 border border-red-200 rounded-lg text-sm font-medium"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex-1 px-3 py-2 text-center border border-gray-300 rounded-lg">
                      로그인
                    </Link>
                    <Link href="/signup" className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg">
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">FINNOVA</h3>
              <p className="text-sm">믿을 수 있는 투자, 온라인 투자 연계 금융업</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/investment" className="hover:text-white">투자</Link></li>
                <li><Link href="/loan" className="hover:text-white">대출</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">정보</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white">이용약관</Link></li>
                <li><Link href="/terms" className="hover:text-white">개인정보처리방침</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="hover:text-white">자주 묻는 질문</Link></li>
                <li><Link href="/support/tickets" className="hover:text-white">1:1 문의</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2026 FINNOVA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
