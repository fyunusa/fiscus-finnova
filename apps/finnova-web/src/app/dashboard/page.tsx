'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { getInvestmentSummary, getRepaymentStatus } from '@/services/dashboard.service';
import type { InvestmentSummary, RepaymentStatus } from '@/services/dashboard.service';

export default function DashboardPage() {
  const [userName] = useState('홍길동');
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [repaymentStatus, setRepaymentStatus] = useState<RepaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const summaryResponse = await getInvestmentSummary();
        const repaymentResponse = await getRepaymentStatus();
        setSummary(summaryResponse.data);
        setRepaymentStatus(repaymentResponse.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const quickAccessItems = [
    {
      title: '나의 투자',
      description: '현재 보유 중인 투자 상품 현황',
      icon: '📊',
      href: '/dashboard/investments',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: '투자하기',
      description: '새로운 투자 상품 둘러보기',
      icon: '💼',
      href: '/investment',
      color: 'from-green-500 to-green-600'
    },
    {
      title: '계정 관리',
      description: '개인정보 및 보안 설정',
      icon: '👤',
      href: '/account',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: '고객 지원',
      description: '채팅으로 실시간 상담',
      icon: '💬',
      href: '/support/chat',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: '아파트 담보 대출',
      description: '낮은 금리로 대출받기',
      icon: '🏠',
      href: '/loan/apartment',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: '대출 신청하기',
      description: '간편한 온라인 대출 신청',
      icon: '📝',
      href: '/loan/application',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: '내 대출',
      description: '신청하신 대출 현황 관리',
      icon: '💳',
      href: '/loan/my-loans',
      color: 'from-rose-500 to-rose-600'
    },
    {
      title: '입출금 관리',
      description: '가상계좌 입출금 및 잔액 관리',
      icon: '💳',
      href: '/dashboard/deposits',
      color: 'from-emerald-500 to-emerald-600'
    },
  ];

  const summaryCards = [
    {
      label: '총 투자액',
      value: summary ? `₩${(summary.totalInvestments * 10000).toLocaleString()}` : '—',
      change: `${summary?.numberOfInvestments || 0}개 투자`,
      trend: 'up',
      icon: '📈',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600'
    },
    {
      label: '예상 월수익',
      value: summary ? `₩${(summary.estimatedMonthlyProfit * 10000).toLocaleString()}` : '—',
      change: '평균 월간 수익',
      trend: 'stable',
      icon: '💰',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600'
    },
    {
      label: '활성 투자',
      value: `${summary?.investmentsInProgress || 0}건`,
      change: '진행 중인 투자',
      trend: 'stable',
      icon: '🎯',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600'
    },
    {
      label: '누적 수익',
      value: summary ? `₩${(summary.totalEarnings * 10000).toLocaleString()}` : '—',
      change: '완료된 투자 수익',
      trend: 'up',
      icon: '✨',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600'
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {userName}님, 환영합니다! 👋
                </h1>
                <p className="text-blue-100">
                  지금 FINNOVA에서 당신의 재무 현황을 한눈에 확인하세요
                </p>
              </div>
              <div className="hidden md:flex gap-3">
                <Button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Bell size={18} />
                  알림
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryCards.map((card, idx) => (
              <Card key={idx} className={`${card.bgColor} border ${card.borderColor} hover:shadow-lg transition-shadow`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                      <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                    </div>
                    <span className="text-3xl">{card.icon}</span>
                  </div>
                  <div className={`text-xs font-medium ${card.trend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
                    {card.change}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Access Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">빠른 접근</h2>
                <p className="text-gray-600 text-sm mt-1">자주 사용하는 페이지에 빠르게 접근하세요</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickAccessItems.map((item, idx) => (
                <Link key={idx} href={item.href}>
                  <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer bg-white">
                    <div className={`bg-gradient-to-r ${item.color} h-2`} />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-4xl">{item.icon}</span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">예정된 납입금</h2>
                <p className="text-gray-600 text-sm mt-1">다가오는 투자 상환 일정</p>
              </div>
              <Link href="/dashboard/investments">
                <Button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  전체 보기 →
                </Button>
              </Link>
            </div>

            <Card className="bg-white">
              <div className="p-6">
                {repaymentStatus?.scheduledPayments && repaymentStatus.scheduledPayments.length > 0 ? (
                  <div className="space-y-4">
                    {repaymentStatus.scheduledPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-gray-900 text-sm">{payment.investmentTitle}</p>
                          <Badge className={`text-xs px-2 py-1 rounded ${
                            payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {payment.status === 'overdue' ? '연체' : payment.status === 'completed' ? '완료' : '예정'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{new Date(payment.dueDate).toLocaleDateString('ko-KR')}</span>
                          <span className="font-semibold text-blue-600">₩{(payment.expectedAmount * 10000).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">예정된 납입금이 없습니다</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Activity - Completed */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">최근 활동</h2>
                <p className="text-gray-600 text-sm mt-1">최근 투자 및 상환 활동 내역</p>
              </div>
            </div>

            <Card className="bg-white">
              <div className="p-6">
                {repaymentStatus?.repaymentHistory && repaymentStatus.repaymentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {repaymentStatus.repaymentHistory.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-gray-900 text-sm">{activity.investmentTitle}</p>
                          <Badge className={`text-xs px-2 py-1 rounded ${
                            activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {activity.status === 'completed' ? '완료' : '진행'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{new Date(activity.repaymentDate).toLocaleDateString('ko-KR')}</span>
                          <span className="font-semibold text-green-600">₩{(activity.amount * 10000).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">최근 활동이 없습니다</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
