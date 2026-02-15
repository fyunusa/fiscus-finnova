import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">핀노바</h3>
            <p className="text-sm text-gray-600">
              믿을 수 있는 투자, 온라인 투자 연계 금융업의 시작 핀노바입니다.
            </p>
          </div>

          {/* Investment */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">투자</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/investment" className="text-gray-600 hover:text-blue-600">투자 상품</Link></li>
              <li><Link href="/investment/calculator" className="text-gray-600 hover:text-blue-600">투자 계산기</Link></li>
              <li><Link href="/investment/corporate" className="text-gray-600 hover:text-blue-600">법인 투자</Link></li>
            </ul>
          </div>

          {/* Loan */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">대출</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/loan/apartment" className="text-gray-600 hover:text-blue-600">아파트 담보대출</Link></li>
              <li><Link href="/loan/sales" className="text-gray-600 hover:text-blue-600">카드매출 선정산</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">고객지원</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/support/faq" className="text-gray-600 hover:text-blue-600">자주 묻는 질문</Link></li>
              <li><Link href="/support/notice" className="text-gray-600 hover:text-blue-600">공지사항</Link></li>
              <li><Link href="/support/inquiry" className="text-gray-600 hover:text-blue-600">1:1 문의</Link></li>
            </ul>
          </div>
        </div>

        {/* Links */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap gap-4 text-sm mb-6">
            <Link href="/terms" className="text-gray-600 hover:text-blue-600">서비스 이용약관</Link>
            <span className="text-gray-300">|</span>
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600">개인정보 처리방침</Link>
            <span className="text-gray-300">|</span>
            <Link href="/investment-terms" className="text-gray-600 hover:text-blue-600">온라인연계투자약관</Link>
            <span className="text-gray-300">|</span>
            <Link href="/loan-terms" className="text-gray-600 hover:text-blue-600">온라인연계대출약관</Link>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">핀노바(주) | 대표이사: 홍길동 | 사업자등록번호: 123-45-67890</p>
            <p className="mb-2">서울시 강남구 테헤란로 123 | 전화: 1234-5678</p>
            <p>© 2026 Finnova. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
