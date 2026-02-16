import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const isLoggedIn = false; // Replace with actual auth state

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="font-bold text-gray-900">FINNOVA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/investment" className="text-gray-700 hover:text-blue-600 transition-colors">
              투자
            </Link>
            <Link href="/loan" className="text-gray-700 hover:text-blue-600 transition-colors">
              대출
            </Link>
            <Link href="/disclosure" className="text-gray-700 hover:text-blue-600 transition-colors">
              사업공시
            </Link>
            <Link href="/help" className="text-gray-700 hover:text-blue-600 transition-colors">
              이용안내
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>홍길동님</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <Link href="/account" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      마이페이지
                    </Link>
                    <Link href="/dashboard/investments" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      투자관리
                    </Link>
                    <Link href="/dashboard/loans" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      대출관리
                    </Link>
                    <hr className="my-2" />
                    <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                  로그인
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  회원가입
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            <Link href="/investment" className="text-gray-700 hover:text-blue-600">투자</Link>
            <Link href="/loan" className="text-gray-700 hover:text-blue-600">대출</Link>
            <Link href="/disclosure" className="text-gray-700 hover:text-blue-600">사업공시</Link>
            <Link href="/help" className="text-gray-700 hover:text-blue-600">이용안내</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
