'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex gap-3">
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
                <Link href="/login" className="flex-1 px-3 py-2 text-center border border-gray-300 rounded-lg">
                  로그인
                </Link>
                <Link href="/signup" className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg">
                  회원가입
                </Link>
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
                <li><Link href="/privacy" className="hover:text-white">개인정보처리방침</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="hover:text-white">자주 묻는 질문</Link></li>
                <li><Link href="/contact" className="hover:text-white">1:1 문의</Link></li>
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
