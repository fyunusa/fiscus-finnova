#!/usr/bin/env node

/**
 * Comprehensive Page Generation Script
 * Auto-generates all remaining pages from design specifications
 */

const fs = require('fs');
const path = require('path');

// Helper function to create directories
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper to generate a basic page template
function generatePageTemplate(title, breadcrumbs = []) {
  return `'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Breadcrumb, Alert } from 'ui-components';

export default function ${title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-400px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          ${breadcrumbs.length > 0 ? `<Breadcrumb items={[
            { label: 'Home', href: '/' },
            ${breadcrumbs.map(b => `{ label: '${b}' }`).join(',\n            ')}
          ]} />` : ''}

          <h1 className="text-3xl font-bold text-gray-900 ${breadcrumbs.length > 0 ? 'mt-8' : 'mb-8'}">${title}</h1>

          <Card className="mt-8">
            <Alert type="info" className="mb-6">
              ${title}에 대한 정보가 여기에 표시됩니다.
            </Alert>

            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                이 페이지는 자동으로 생성되었습니다. 콘텐츠를 추가하려면 이 파일을 편집하세요.
              </p>

              <div className="flex gap-4">
                <Button variant="primary">확인</Button>
                <Button variant="secondary">취소</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
`;
}

// Generate admin page template
function generateAdminPageTemplate(title) {
  return `'use client';

import React from 'react';
import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, Button, Alert } from 'ui-components';

export default function Admin${title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">${title}</h1>
            <p className="text-gray-600 mt-2">${title}을(를) 관리하는 페이지입니다.</p>
          </div>

          <Card>
            <Alert type="info" className="mb-6">
              이 페이지는 자동으로 생성되었습니다. 콘텐츠를 추가하려면 이 파일을 편집하세요.
            </Alert>

            <div className="flex gap-4">
              <Button variant="primary">추가</Button>
              <Button variant="secondary">편집</Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
`;
}

// Define all remaining pages
const finnovaPages = [
  // Investment section
  { path: 'investment/popular', title: '인기 상품' },
  { path: 'investment/new', title: '신규 상품' },
  { path: 'investment/ending-soon', title: '마감 임박' },
  { path: 'investment/my-investments', title: '내 투자' },
  { path: 'investment/reviews', title: '사용자 평가' },
  
  // Loan section
  { path: 'loan/my-loans', title: '내 대출' },
  { path: 'loan/calculator', title: '대출 계산기' },
  { path: 'loan/documents', title: '필수 서류' },
  { path: 'loan/faq', title: 'FAQ' },
  
  // Account section  
  { path: 'account/documents', title: '서류 관리' },
  { path: 'account/bank-accounts', title: '계좌 관리' },
  { path: 'account/notifications', title: '알림 설정' },
  { path: 'account/withdrawal', title: '출금 관리' },
  { path: 'account/kyc-status', title: 'KYC 상태' },
  
  // Dashboard section
  { path: 'dashboard/reports', title: '상세 보고서' },
  { path: 'dashboard/performance', title: '수익률 분석' },
  { path: 'dashboard/alerts', title: '중요 알림' },
  
  // Support section
  { path: 'support/chat', title: '실시간 채팅' },
  { path: 'support/tickets', title: '티켓 관리' },
  { path: 'support/community', title: '커뮤니티' },
  { path: 'support/announcements', title: '공지사항' },
  
  // Additional pages
  { path: 'onboarding', title: '시작 가이드' },
  { path: 'help', title: '도움말' },
  { path: 'status', title: '서비스 상태' },
];

const adminPages = [
  // User management
  { path: 'admin/users', title: '사용자 관리' },
  { path: 'admin/user-profiles', title: '사용자 프로필' },
  { path: 'admin/user-verification', title: '사용자 인증' },
  
  // Analytics
  { path: 'admin/analytics', title: '분석 및 통계' },
  { path: 'admin/metrics', title: '주요 지표' },
  { path: 'admin/reports-export', title: '보고서 생성' },
  
  // System
  { path: 'admin/api-keys', title: 'API 키 관리' },
  { path: 'admin/integrations', title: '외부 연동' },
];

function generateAllPages() {
  console.log('🚀 Starting comprehensive page generation...\n');

  let successCount = 0;
  let errorCount = 0;

  // Generate Finnova pages
  console.log('📄 Generating Finnova pages...');
  for (const page of finnovaPages) {
    try {
      const fullPath = path.join(__dirname, '../apps/finnova-web/src/app', page.path);
      ensureDir(fullPath);
      
      const filePath = path.join(fullPath, 'page.tsx');
      const content = generatePageTemplate(page.title, [page.title]);
      fs.writeFileSync(filePath, content, 'utf8');
      
      console.log(`  ✓ ${page.path}`);
      successCount++;
    } catch (error) {
      console.error(`  ✗ ${page.path}: ${error.message}`);
      errorCount++;
    }
  }

  // Generate Admin pages
  console.log('\n📊 Generating Admin pages...');
  for (const page of adminPages) {
    try {
      const fullPath = path.join(__dirname, '../apps/fiscus-admin/src/app', page.path);
      ensureDir(fullPath);
      
      const filePath = path.join(fullPath, 'page.tsx');
      const content = generateAdminPageTemplate(page.title);
      fs.writeFileSync(filePath, content, 'utf8');
      
      console.log(`  ✓ ${page.path}`);
      successCount++;
    } catch (error) {
      console.error(`  ✗ ${page.path}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Generated ${successCount} pages successfully`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} pages failed to generate`);
  }
  console.log('='.repeat(50));
}

// Execute
if (require.main === module) {
  generateAllPages();
}

module.exports = { generatePageTemplate, generateAdminPageTemplate };
