'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Download,
} from 'lucide-react';

/**
 * BMAI_2: Insights Dashboard
 * Real-time platform monitoring and KPIs with 6 widgets
 */
export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(false);

  // Mock KPI data - replace with real API calls
  const kpiData = {
    memberStats: {
      totalUsers: 45230,
      newSignups: { today: 12, week: 89, month: 342 },
      activeUsers: 12450,
      changePercent: 8.5,
    },
    loanPipeline: {
      applications: 234,
      underReview: 89,
      approved: 45,
      pendingFunding: 23,
    },
    fundingStatus: {
      activeProducts: 42,
      fundingGoal: 250000000000,
      fundedAmount: 187500000000,
      completionRate: 75,
    },
    investmentActivity: {
      investmentsToday: 156,
      topProducts: [
        { name: '강남아파트담보대출', amount: 4500000000, rate: 6.5 },
        { name: '신용카드매출채권', amount: 2300000000, rate: 7.2 },
        { name: '소상공인비즈니스론', amount: 1800000000, rate: 8.0 },
      ],
      avgInvestmentAmount: 28500000,
    },
    financialOverview: {
      totalDeposits: 450000000000,
      totalWithdrawals: 120000000000,
      platformBalance: 330000000000,
      monthlyChange: 5.2,
    },
    overdueLoans: {
      count: 12,
      totalAmount: 3240000000,
      buckets: {
        '30-60days': 5,
        '60-90days': 4,
        '90+days': 3,
      },
    },
  };

  const handleExportExcel = () => {
    alert('엑셀 다운로드 기능은 개발 중입니다.');
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `₩${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `₩${(value / 1000000).toFixed(1)}M`;
    }
    return `₩${value.toLocaleString()}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">인사이트 대시보드</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            {['today', 'week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {range === 'today' && '오늘'}
                {range === 'week' && '주'}
                {range === 'month' && '월'}
                {range === 'quarter' && '분기'}
                {range === 'year' && '연'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download size={18} />
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* 1. Member Stats Widget */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">회원 통계</h3>
            <Users className="text-blue-600" size={24} />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">총 회원수</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData.memberStats.totalUsers.toLocaleString()}명
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-600">금일 신규</p>
                <p className="font-semibold">{kpiData.memberStats.newSignups.today}</p>
              </div>
              <div>
                <p className="text-gray-600">주 신규</p>
                <p className="font-semibold">{kpiData.memberStats.newSignups.week}</p>
              </div>
              <div>
                <p className="text-gray-600">월 신규</p>
                <p className="font-semibold">{kpiData.memberStats.newSignups.month}</p>
              </div>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600">활성 사용자</p>
              <p className="text-lg font-semibold text-blue-600">
                {kpiData.memberStats.activeUsers.toLocaleString()}명 (
                {kpiData.memberStats.changePercent}% ↑)
              </p>
            </div>
            <Link
              href="/admin/members"
              className="text-blue-600 text-sm hover:underline"
            >
              상세보기 →
            </Link>
          </div>
        </div>

        {/* 2. Loan Pipeline Widget */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">대출 파이프라인</h3>
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-gray-600">접수</p>
                <p className="text-xl font-bold">{kpiData.loanPipeline.applications}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-xs text-gray-600">검토중</p>
                <p className="text-xl font-bold">{kpiData.loanPipeline.underReview}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-xs text-gray-600">승인</p>
                <p className="text-xl font-bold">{kpiData.loanPipeline.approved}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-xs text-gray-600">펀딩대기</p>
                <p className="text-xl font-bold">{kpiData.loanPipeline.pendingFunding}</p>
              </div>
            </div>
            <Link
              href="/admin/loans"
              className="text-blue-600 text-sm hover:underline"
            >
              상세보기 →
            </Link>
          </div>
        </div>

        {/* 3. Funding Status Widget */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">펀딩 현황</h3>
            <DollarSign className="text-purple-600" size={24} />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                활성 상품: {kpiData.fundingStatus.activeProducts}건
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full"
                  style={{ width: `${kpiData.fundingStatus.completionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>{formatCurrency(kpiData.fundingStatus.fundedAmount)}</span>
                <span>{kpiData.fundingStatus.completionRate}%</span>
              </div>
            </div>
            <div className="text-sm">
              <p className="text-gray-600">목표금액</p>
              <p className="font-semibold text-lg">
                {formatCurrency(kpiData.fundingStatus.fundingGoal)}
              </p>
            </div>
            <Link
              href="/admin/funding"
              className="text-blue-600 text-sm hover:underline"
            >
              상세보기 →
            </Link>
          </div>
        </div>

        {/* 4. Investment Activity Widget */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">투자 활동</h3>
            <TrendingUp className="text-yellow-600" size={24} />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">금일 투자수</p>
              <p className="text-2xl font-bold text-yellow-600">
                {kpiData.investmentActivity.investmentsToday}건
              </p>
            </div>
            <div className="text-xs space-y-2">
              <p className="font-semibold text-gray-700">상품별 투자</p>
              {kpiData.investmentActivity.topProducts.map((product, idx) => (
                <div key={idx} className="flex justify-between bg-gray-50 p-2 rounded">
                  <span className="truncate">{product.name}</span>
                  <span className="font-semibold text-yellow-600">
                    {formatCurrency(product.amount)}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/admin/investments"
              className="text-blue-600 text-sm hover:underline"
            >
              상세보기 →
            </Link>
          </div>
        </div>

        {/* 5. Financial Overview Widget */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">재무 현황</h3>
            <DollarSign className="text-indigo-600" size={24} />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600">입금액</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(kpiData.financialOverview.totalDeposits)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">출금액</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(kpiData.financialOverview.totalWithdrawals)}
              </p>
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-600">플랫폼 잔액</p>
              <p className="text-xl font-bold text-indigo-600">
                {formatCurrency(kpiData.financialOverview.platformBalance)}
              </p>
              <p className="text-xs text-gray-500">
                월간 {kpiData.financialOverview.monthlyChange}% 증가
              </p>
            </div>
          </div>
        </div>

        {/* 6. Overdue Loans Widget */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">연체 대출</h3>
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">연체 건수</p>
              <p className="text-2xl font-bold text-red-600">
                {kpiData.overdueLoans.count}건
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(kpiData.overdueLoans.totalAmount)}
              </p>
            </div>
            <div className="text-xs space-y-1 bg-red-50 p-3 rounded">
              <p className="font-semibold text-gray-700">구간별 분석</p>
              <div className="flex justify-between">
                <span>30-60일:</span>
                <span className="font-semibold">{kpiData.overdueLoans.buckets['30-60days']}건</span>
              </div>
              <div className="flex justify-between">
                <span>60-90일:</span>
                <span className="font-semibold">{kpiData.overdueLoans.buckets['60-90days']}건</span>
              </div>
              <div className="flex justify-between">
                <span>90일+:</span>
                <span className="font-semibold text-red-600">
                  {kpiData.overdueLoans.buckets['90+days']}건
                </span>
              </div>
            </div>
            <Link
              href="/admin/bonds"
              className="text-blue-600 text-sm hover:underline"
            >
              상세보기 →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">새로운 투자 신청</p>
                <p className="text-xs text-gray-500">2024-02-15 14:30</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-green-600">₩5,000만</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">회원 가입 완료</p>
                <p className="text-xs text-gray-500">2024-02-15 13:45</p>
              </div>
            </div>
            <span className="text-sm font-medium">12명</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">대출 신청</p>
                <p className="text-xs text-gray-500">2024-02-15 12:15</p>
              </div>
            </div>
            <span className="text-sm font-medium">8건</span>
          </div>
        </div>
      </div>
    </div>
  );
}
