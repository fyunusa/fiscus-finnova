'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import Link from 'next/link';
import { TrendingUp, Wallet, Home, MessageCircle, Settings, Download, Bell, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const [userName] = useState('홍길동');

  const quickAccessItems = [
    {
      title: '나의 투자',
      description: '현재 보유 중인 투자 상품 현황',
      icon: '📊',
      href: '/dashboard/investments',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: '나의 대출',
      description: '대출 현황 및 상환 계획',
      icon: '🏦',
      href: '/dashboard/loans',
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
      title: '문의 내역',
      description: '고객 문의 및 응답 내역',
      icon: '💬',
      href: '/support/inquiry',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: '계좌 관리',
      description: '등록된 은행 계좌 관리',
      icon: '💳',
      href: '/account/bank-accounts',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: '문서 관리',
      description: '투자 및 대출 관련 문서',
      icon: '📄',
      href: '/account/documents',
      color: 'from-cyan-500 to-cyan-600'
    },
  ];

  const summaryCards = [
    {
      label: '총 투자액',
      value: '₩15,250,000',
      change: '+₩500,000',
      trend: 'up',
      icon: '📈',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600'
    },
    {
      label: '활성 투자',
      value: '8개',
      change: '예상 월수익 ₩42,500',
      trend: 'stable',
      icon: '💰',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600'
    },
    {
      label: '활성 대출',
      value: '1건',
      change: '상환금 ₩850,000',
      trend: 'stable',
      icon: '🏠',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600'
    },
    {
      label: '누적 수익',
      value: '₩487,500',
      change: '+₩25,000',
      trend: 'up',
      icon: '🎯',
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
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium">
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <h2 className="text-2xl font-bold text-gray-900">최근 활동</h2>
                <p className="text-gray-600 text-sm mt-1">최근 투자 및 대출 활동 내역</p>
              </div>
              <Link href="/dashboard/reports">
                <Button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  전체 보기 →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Investments */}
              <Card className="bg-white">
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">최근 투자 활동</h3>
                  <div className="space-y-4">
                    {[
                      { date: '2024.02.15', product: '서울 강남구 아파트 담보대출', amount: '₩5,000,000', status: '진행중' },
                      { date: '2024.02.10', product: '중소기업 매출채권', amount: '₩3,000,000', status: '상환중' },
                      { date: '2024.02.05', product: '소상공인 비즈니스론', amount: '₩2,000,000', status: '완료' },
                    ].map((activity, idx) => (
                      <div key={idx} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-gray-900 text-sm">{activity.product}</p>
                          <Badge className={`text-xs px-2 py-1 rounded ${
                            activity.status === '진행중' ? 'bg-blue-100 text-blue-800' :
                            activity.status === '상환중' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {activity.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{activity.date}</span>
                          <span className="font-semibold text-blue-600">{activity.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Upcoming Payments */}
              <Card className="bg-white">
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">예정된 납입금</h3>
                  <div className="space-y-4">
                    {[
                      { date: '2024.02.20', product: '강남구 아파트 담보대출', amount: '₩425,000', daysLeft: 5 },
                      { date: '2024.02.28', product: '매출채권 담보대출', amount: '₩285,000', daysLeft: 13 },
                      { date: '2024.03.10', product: '비즈니스론', amount: '₩180,000', daysLeft: 24 },
                    ].map((payment, idx) => (
                      <div key={idx} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-gray-900 text-sm">{payment.product}</p>
                          <Badge className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                            {payment.daysLeft}일 후
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{payment.date}</span>
                          <span className="font-semibold text-orange-600">{payment.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">추가 자료</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/help">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-4">
                    <div className="text-2xl mb-2">❓</div>
                    <h4 className="font-medium text-gray-900 mb-1">도움말</h4>
                    <p className="text-xs text-gray-600">자주 묻는 질문 및 가이드</p>
                  </div>
                </Card>
              </Link>
              <Link href="/disclosure">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-4">
                    <div className="text-2xl mb-2">📋</div>
                    <h4 className="font-medium text-gray-900 mb-1">사업공시</h4>
                    <p className="text-xs text-gray-600">재무정보 및 사업 현황</p>
                  </div>
                </Card>
              </Link>
              <Link href="/support/chat">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-4">
                    <div className="text-2xl mb-2">💬</div>
                    <h4 className="font-medium text-gray-900 mb-1">고객 지원</h4>
                    <p className="text-xs text-gray-600">채팅으로 실시간 상담</p>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
