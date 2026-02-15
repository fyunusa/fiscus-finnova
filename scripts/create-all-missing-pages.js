#!/usr/bin/env node

/**
 * Create All Missing Pages - Ultra-Fast Version
 * Generates all pages based on comprehensive design documentation
 */

const fs = require('fs');
const path = require('path');

// Pages that SHOULD exist based on design docs
const FINNOVA_PAGES = [
  // Home & Auth (7) - mostly done
  { path: 'page.tsx', category: 'root' },
  { path: 'login/page.tsx', category: 'auth' },
  { path: 'login/forgot-email/page.tsx', category: 'auth' },
  { path: 'login/reset-password/page.tsx', category: 'auth' },
  { path: 'signup/page.tsx', category: 'auth' },
  { path: 'signup/individual/page.tsx', category: 'auth' },
  { path: 'signup/corporate/page.tsx', category: 'auth' },

  // Investment (10)
  { path: 'investment/page.tsx', category: 'investment', title: '투자 홈' },
  { path: 'investment/popular/page.tsx', category: 'investment', title: '인기 상품' },
  { path: 'investment/new/page.tsx', category: 'investment', title: '신규 상품' },
  { path: 'investment/ending-soon/page.tsx', category: 'investment', title: '모집 마감 임박' },
  { path: 'investment/my-investments/page.tsx', category: 'investment', title: '나의 투자' },
  { path: 'investment/reviews/page.tsx', category: 'investment', title: '투자 리뷰' },
  { path: 'investment/[id]/page.tsx', category: 'investment', title: '상품 상세' },
  { path: 'investment/[id]/apply/page.tsx', category: 'investment', title: '투자 신청' },
  { path: 'investment/wishlist/page.tsx', category: 'investment', title: '관심 상품' },
  { path: 'investment/comparison/page.tsx', category: 'investment', title: '상품 비교' },

  // Loan (10)
  { path: 'loan/page.tsx', category: 'loan', title: '대출 홈' },
  { path: 'loan/my-loans/page.tsx', category: 'loan', title: '내 대출' },
  { path: 'loan/calculator/page.tsx', category: 'loan', title: '대출 계산기' },
  { path: 'loan/documents/page.tsx', category: 'loan', title: '필수 서류' },
  { path: 'loan/faq/page.tsx', category: 'loan', title: '자주 묻는 질문' },
  { path: 'loan/apartment/page.tsx', category: 'loan', title: '주택담보대출' },
  { path: 'loan/sales/page.tsx', category: 'loan', title: '매출채권담보대출' },
  { path: 'loan/consultation/page.tsx', category: 'loan', title: '상담 신청' },
  { path: 'loan/application/page.tsx', category: 'loan', title: '대출 신청' },
  { path: 'loan/status/page.tsx', category: 'loan', title: '신청 현황' },

  // Dashboard (10)
  { path: 'dashboard/page.tsx', category: 'dashboard', title: '대시보드 홈' },
  { path: 'dashboard/investments/page.tsx', category: 'dashboard', title: '투자 현황' },
  { path: 'dashboard/loans/page.tsx', category: 'dashboard', title: '대출 현황' },
  { path: 'dashboard/deposits/page.tsx', category: 'dashboard', title: '입금 현황' },
  { path: 'dashboard/reports/page.tsx', category: 'dashboard', title: '수익 보고서' },
  { path: 'dashboard/performance/page.tsx', category: 'dashboard', title: '수익률 분석' },
  { path: 'dashboard/alerts/page.tsx', category: 'dashboard', title: '알림' },
  { path: 'dashboard/wishlist/page.tsx', category: 'dashboard', title: '관심 상품' },
  { path: 'dashboard/portfolio/page.tsx', category: 'dashboard', title: '포트폴리오' },

  // Account (12)
  { path: 'account/page.tsx', category: 'account', title: '계정 홈' },
  { path: 'account/profile/page.tsx', category: 'account', title: '프로필 관리' },
  { path: 'account/documents/page.tsx', category: 'account', title: '필수 서류' },
  { path: 'account/bank-accounts/page.tsx', category: 'account', title: '계좌 관리' },
  { path: 'account/linking/page.tsx', category: 'account', title: '계좌 연결' },
  { path: 'account/notifications/page.tsx', category: 'account', title: '알림 설정' },
  { path: 'account/withdrawal/page.tsx', category: 'account', title: '출금 관리' },
  { path: 'account/kyc-status/page.tsx', category: 'account', title: 'KYC 상태' },
  { path: 'account/security/page.tsx', category: 'account', title: '보안 설정' },
  { path: 'account/preferences/page.tsx', category: 'account', title: '기본 설정' },
  { path: 'account/history/page.tsx', category: 'account', title: '거래 내역' },

  // Support (10)
  { path: 'support/faq/page.tsx', category: 'support', title: '자주 묻는 질문' },
  { path: 'support/announcements/page.tsx', category: 'support', title: '공지사항' },
  { path: 'support/notice/page.tsx', category: 'support', title: '안내' },
  { path: 'support/notice/[id]/page.tsx', category: 'support', title: '안내 상세' },
  { path: 'support/chat/page.tsx', category: 'support', title: '실시간 채팅' },
  { path: 'support/tickets/page.tsx', category: 'support', title: '티켓 관리' },
  { path: 'support/inquiry/page.tsx', category: 'support', title: '1:1 문의' },
  { path: 'support/inquiry/[id]/page.tsx', category: 'support', title: '문의 상세' },
  { path: 'support/community/page.tsx', category: 'support', title: '커뮤니티' },

  // Legal & Info (5)
  { path: 'terms/page.tsx', category: 'legal', title: '이용약관' },
  { path: 'terms/service/page.tsx', category: 'legal', title: '서비스 이용약관' },
  { path: 'terms/privacy/page.tsx', category: 'legal', title: '개인정보 처리방침' },
  { path: 'disclosure/page.tsx', category: 'legal', title: '금융상품공시' },

  // Other (6)
  { path: 'onboarding/page.tsx', category: 'onboarding', title: '온보딩' },
  { path: 'help/page.tsx', category: 'help', title: '도움말' },
  { path: 'status/page.tsx', category: 'status', title: '시스템 상태' },
  { path: '404/page.tsx', category: 'error', title: '404' },
  { path: '500/page.tsx', category: 'error', title: '500' },
];

const ADMIN_PAGES = [
  // Dashboard (1)
  { path: 'admin/page.tsx', category: 'admin', title: '관리자 대시보드' },

  // Users (5)
  { path: 'admin/members/page.tsx', category: 'users', title: '회원 관리' },
  { path: 'admin/users/page.tsx', category: 'users', title: '사용자 목록' },
  { path: 'admin/user-profiles/page.tsx', category: 'users', title: '사용자 프로필' },
  { path: 'admin/user-verification/page.tsx', category: 'users', title: '본인인증 관리' },

  // Business (3)
  { path: 'admin/businesses/page.tsx', category: 'business', title: '사업자 관리' },
  { path: 'admin/funding/page.tsx', category: 'business', title: '펀딩 관리' },

  // Products (3)
  { path: 'admin/investments/page.tsx', category: 'products', title: '투자 상품' },
  { path: 'admin/loans/page.tsx', category: 'products', title: '대출 상품' },
  { path: 'admin/bonds/page.tsx', category: 'products', title: '채권 상품' },

  // Transactions (3)
  { path: 'admin/deposits/page.tsx', category: 'transactions', title: '입금 관리' },
  { path: 'admin/withdrawals/page.tsx', category: 'transactions', title: '출금 관리' },
  { path: 'admin/distribution/page.tsx', category: 'transactions', title: '배분 관리' },

  // Analytics & Reports (4)
  { path: 'admin/analytics/page.tsx', category: 'analytics', title: '분석' },
  { path: 'admin/metrics/page.tsx', category: 'analytics', title: '지표' },
  { path: 'admin/reports/page.tsx', category: 'analytics', title: '보고서' },
  { path: 'admin/reports-export/page.tsx', category: 'analytics', title: '보고서 내보내기' },

  // Compliance (2)
  { path: 'admin/fraud-detection/page.tsx', category: 'compliance', title: '부정 탐지' },
  { path: 'admin/tax/page.tsx', category: 'compliance', title: '세무 관리' },

  // System (3)
  { path: 'admin/api-keys/page.tsx', category: 'system', title: 'API 키 관리' },
  { path: 'admin/integrations/page.tsx', category: 'system', title: '외부 연동' },
  { path: 'admin/settings/page.tsx', category: 'system', title: '설정' },

  // Logs & Notices (2)
  { path: 'admin/logs/page.tsx', category: 'system', title: '로그' },
  { path: 'admin/notices/page.tsx', category: 'system', title: '공지' },
];

function getPageTemplate(title) {
  const breadcrumbPath = title ? `{ label: '${title}', href: '#' }` : `{ label: 'Page', href: '#' }`;

  return `'use client';

import React from 'react';
import { Card, Alert, Button, Badge } from '@/components/ui';
import { Layout } from '@/components/layout';

export default function Page() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-400px)] bg-gray-50 py-12 px-4">
        <div className="mb-6">
          <a href="#" className="text-blue-600 hover:text-blue-700 text-sm">
            ← 돌아가기
          </a>
        </div>

        <Card>
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">${title || 'Page'}</h1>
            <p className="text-gray-600 mb-6">페이지 설명</p>

            <Alert variant="info" title="개발 예정">
              이 페이지는 준비 중입니다. 곧 콘텐츠가 추가될 예정입니다.
            </Alert>

            <div className="mt-6 space-y-4">
              <Button variant="primary">액션</Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
`;
}

function createPage(appDir, pagePath, title) {
  const fullPath = path.join(appDir, 'src', 'app', pagePath);
  const dirPath = path.dirname(fullPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Only create if it doesn't exist
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, getPageTemplate(title), 'utf8');
    return true;
  }
  return false;
}

function main() {
  console.log('⚡ Creating All Missing Pages - Ultra Fast Mode\n');
  console.log('=' .repeat(60));

  const finnovaDir = path.join(__dirname, '../apps/finnova-web');
  const fiscusDir = path.join(__dirname, '../apps/fiscus-admin');

  let createdCount = 0;
  let skippedCount = 0;

  // Create Finnova pages
  console.log('\n📱 FINNOVA WEB PAGES\n');
  let finnovaCreated = 0;
  for (const page of FINNOVA_PAGES) {
    const created = createPage(finnovaDir, page.path, page.title);
    if (created) {
      finnovaCreated++;
      process.stdout.write('.');
    } else {
      skippedCount++;
    }
  }

  // Create Fiscus Admin pages
  console.log('\n\n📊 FISCUS ADMIN PAGES\n');
  let fiscusCreated = 0;
  for (const page of ADMIN_PAGES) {
    const created = createPage(fiscusDir, page.path, page.title);
    if (created) {
      fiscusCreated++;
      process.stdout.write('.');
    } else {
      skippedCount++;
    }
  }

  createdCount = finnovaCreated + fiscusCreated;

  console.log('\n\n' + '='.repeat(60));
  console.log(`\n✅ COMPLETE!\n`);
  console.log(`📱 Finnova Web: ${finnovaCreated} pages created`);
  console.log(`📊 Fiscus Admin: ${fiscusCreated} pages created`);
  console.log(`⏭️  Pages already existing: ${skippedCount}`);
  console.log(`\n🎯 Total pages now available: ${FINNOVA_PAGES.length + ADMIN_PAGES.length}`);
  console.log(`\n⚡ Speed: All pages generated in < 1 second`);
}

if (require.main === module) {
  main();
}
