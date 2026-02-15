#!/usr/bin/env node

/**
 * Automated Page Generation Script
 * Generates all remaining pages and populates them with content from design documentation
 */

const fs = require('fs');
const path = require('path');

// Page templates with content
const pageTemplates = {
  // FINNOVA ADDITIONAL PAGES
  'investment-detail': {
    path: 'apps/finnova-web/src/app/investment/[id]/detail',
    content: `'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge, Breadcrumb } from 'ui-components';

export default function InvestmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-400px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Investment', href: '/investment' },
            { label: 'Product Detail' }
          ]} />

          <Card className="mt-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">강남구 아파트 담보대출</h1>
                <p className="text-gray-600 mt-2">담보가치 충분하고 신용도 우수한 차용인의 안정적 대출</p>
              </div>
              <Badge variant="success">모집중</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pt-6 border-t">
              <div>
                <p className="text-sm text-gray-600">모집액</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₩100,000,000</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">수익률</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">6.5%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">운용기간</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">24개월</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4">상품설명</h3>
              <p className="text-gray-700 leading-relaxed">
                서울시 강남구 소재의 신축 아파트를 담보로 하는 담보대출 상품입니다. 차용인의 우수한 신용도와 충분한 담보가치로 안정적인 원리금 상환이 기대됩니다.
              </p>
            </div>

            <Button variant="primary" className="w-full">투자하기</Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
`
  },
  
  'investment-comparison': {
    path: 'apps/finnova-web/src/app/investment/comparison',
    content: `'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Table } from 'ui-components';

export default function InvestmentComparisonPage() {
  const products = [
    { name: '강남 아파트', rate: '6.5%', period: '24개월', amount: '₩100M', risk: '낮음' },
    { name: '소상공인 선정산', rate: '7.2%', period: '12개월', amount: '₩50M', risk: '중간' },
    { name: '중소기업 담보', rate: '8.0%', period: '18개월', amount: '₩30M', risk: '중간' },
  ];

  return (
    <Layout>
      <div className="min-h-[calc(100vh-400px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">상품 비교</h1>
          
          <Card>
            <Table
              columns={[
                { key: 'name', header: '상품명' },
                { key: 'rate', header: '수익률' },
                { key: 'period', header: '운용기간' },
                { key: 'amount', header: '모집액' },
                { key: 'risk', header: '위험도' },
              ]}
              data={products}
              striped
            />
          </Card>
        </div>
      </div>
    </Layout>
  );
}
`
  },

  'loan-detail': {
    path: 'apps/finnova-web/src/app/loan/[id]',
    content: `'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge, Alert } from 'ui-components';

export default function LoanDetailPage({ params }: { params: { id: string } }) {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-400px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-6">
            ← 돌아가기
          </Button>

          <Card>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">대출 상세 정보</h1>
                <p className="text-gray-600 mt-2">차용인: 홍길동</p>
              </div>
              <Badge variant="info">진행중</Badge>
            </div>

            <Alert type="info" className="mb-6">
              대출 상세 정보 및 약관을 확인하고 대출을 신청할 수 있습니다.
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-6 border-t">
              <div>
                <p className="text-sm text-gray-600">대출액</p>
                <p className="text-xl font-bold text-gray-900">₩100,000,000</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">금리</p>
                <p className="text-xl font-bold text-blue-600">연 6.5%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">기간</p>
                <p className="text-xl font-bold text-gray-900">24개월</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">담보</p>
                <p className="text-xl font-bold text-gray-900">서울시 강남구 아파트</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="primary">대출 신청</Button>
              <Button variant="secondary">상세 약관</Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
`
  },

  'dashboard-transaction': {
    path: 'apps/finnova-web/src/app/dashboard/transactions',
    content: `'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Table, Pagination } from 'ui-components';

export default function TransactionHistoryPage() {
  const [currentPage, setCurrentPage] = React.useState(1);

  const transactions = [
    { id: 1, type: '투자', amount: '+₩1,000,000', date: '2025-01-15', status: '완료' },
    { id: 2, type: '배당금', amount: '+₩50,000', date: '2025-01-10', status: '완료' },
    { id: 3, type: '출금', amount: '-₩500,000', date: '2025-01-08', status: '완료' },
  ];

  return (
    <Layout>
      <div className="min-h-[calc(100vh-400px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">거래 내역</h1>
          
          <Card>
            <Table
              columns={[
                { key: 'type', header: '거래유형' },
                { key: 'amount', header: '금액' },
                { key: 'date', header: '거래일' },
                { key: 'status', header: '상태' },
              ]}
              data={transactions}
              striped
            />
            
            <div className="mt-6 pt-6 border-t">
              <Pagination current={currentPage} total={5} onPageChange={setCurrentPage} />
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
`
  },

  // ADMIN ADDITIONAL PAGES
  'admin-reports-detail': {
    path: 'apps/fiscus-admin/src/app/admin/reports/[id]',
    content: `'use client';

import React from 'react';
import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, Button, Alert } from 'ui-components';

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
              ← 돌아가기
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">월간 운영 현황 보고서</h1>
            <p className="text-gray-600 mt-2">2025년 1월</p>
          </div>

          <Card>
            <Alert type="info" className="mb-6">
              이 보고서는 2025년 1월의 전체 운영 현황을 요약한 것입니다.
            </Alert>

            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">주요 지표</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">총 회원수</p>
                    <p className="text-2xl font-bold text-gray-900">1,234명</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">총 투자액</p>
                    <p className="text-2xl font-bold text-gray-900">₩5,432,100,000</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">내용</h2>
                <p className="text-gray-700 leading-relaxed">
                  지난달 운영 결과 신규 회원 가입 123명, 총 투자액 12억원 기록했습니다.
                </p>
              </section>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t">
              <Button variant="primary">PDF 다운로드</Button>
              <Button variant="secondary">수정</Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
`
  },

  'admin-compliance': {
    path: 'apps/fiscus-admin/src/app/admin/compliance',
    content: `'use client';

import React from 'react';
import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, Button, Table, Alert, Badge } from 'ui-components';

export default function ComplianceAdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const items = [
    { id: 1, requirement: '고객확인제도(KYC)', status: '준수', date: '2025-01-15' },
    { id: 2, requirement: '거래량 모니터링', status: '준수', date: '2025-01-14' },
    { id: 3, requirement: '자금세탁방지(AML)', status: '준수', date: '2025-01-13' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">규제 준수</h1>
            <p className="text-gray-600 mt-2">법적 규제 요구사항 준수 현황</p>
          </div>

          <Alert type="success" className="mb-6">
            모든 규제 요구사항을 준수하고 있습니다.
          </Alert>

          <Card>
            <Table
              columns={[
                { key: 'requirement', header: '규제 요구사항' },
                { key: 'status', header: '준수 상태' },
                { key: 'date', header: '최종 검토일' },
              ]}
              data={items}
              striped
            />
          </Card>
        </main>
      </div>
    </div>
  );
}
`
  },
};

function createDirectory(dir) {
  const parts = dir.split('/');
  let current = '';
  for (const part of parts) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) {
      fs.mkdirSync(current, { recursive: true });
    }
  }
}

function generatePage(key, template) {
  const fullPath = path.join(__dirname, template.path, 'page.tsx');
  const dir = path.dirname(fullPath);
  
  // Create directory if it doesn't exist
  createDirectory(dir);
  
  // Write page file
  fs.writeFileSync(fullPath, template.content, 'utf8');
  console.log(`✓ Created: ${template.path}/page.tsx`);
}

// Main execution
console.log('🚀 Starting automated page generation...\n');

let count = 0;
for (const [key, template] of Object.entries(pageTemplates)) {
  try {
    generatePage(key, template);
    count++;
  } catch (error) {
    console.error(`✗ Failed to create ${key}:`, error.message);
  }
}

console.log(`\n✅ Generated ${count} pages successfully!`);
console.log(`📁 Check your app directories for new pages.`);
