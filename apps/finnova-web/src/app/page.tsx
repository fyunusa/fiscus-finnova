'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              FINNOVA
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              믿을 수 있는 투자, 온라인 투자 연계 금융
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/investment">
                <Button variant="ghost" size="lg">
                  투자하기
                </Button>
              </Link>
              <Link href="/loan">
                <Button variant="ghost" size="lg">
                  대출받기
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                주요 서비스
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: '투자',
                  description: '다양한 투자 상품에 쉽게 투자할 수 있습니다.',
                  icon: '📈',
                  href: '/investment'
                },
                {
                  title: '대출',
                  description: '간편하게 대출을 신청하고 관리할 수 있습니다.',
                  icon: '💰',
                  href: '/loan'
                },
                {
                  title: '지원',
                  description: '언제든지 고객 지원팀에 연락할 수 있습니다.',
                  icon: '💬',
                  href: '/support'
                },
              ].map((feature) => (
                <Link key={feature.title} href={feature.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer p-8">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-20 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: '누적 투자금', value: '500억원' },
                { label: '활성 투자자', value: '15,000명' },
                { label: '성공 건수', value: '2,500건' },
                { label: '평균 수익율', value: '7.5%' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stat.value}
                  </div>
                  <p className="mt-2 text-gray-600">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Products Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                인기 상품
              </h2>
              <Link href="/investment">
                <Button variant="ghost">
                  모두 보기 →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 1,
                  title: '서울시 강남구 아파트 담보대출',
                  rate: '6.5%',
                  progress: 85,
                  status: 'active'
                },
                {
                  id: 2,
                  title: '중소기업 매출채권 담보대출',
                  rate: '7.2%',
                  progress: 70,
                  status: 'active'
                },
                {
                  id: 3,
                  title: '소상공인 비즈니스론',
                  rate: '8.0%',
                  progress: 50,
                  status: 'pending'
                },
              ].map((product) => (
                <Link key={product.id} href={`/investment/${product.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 flex-1">
                        {product.title}
                      </h3>
                      <Badge variant={product.status === 'active' ? 'success' : 'warning'}>
                        {product.status === 'active' ? '진행중' : '대기중'}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">수익율</span>
                        <span className="text-lg font-bold text-blue-600">
                          {product.rate}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${product.progress}%` }}
                        />
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        모집률 {product.progress}%
                      </div>
                    </div>

                    <Button variant="primary" fullWidth size="sm">
                      자세히 보기
                    </Button>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              지금 시작하세요
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              FINNOVA와 함께 스마트한 투자를 시작하세요
            </p>
            <Link href="/signup">
              <Button variant="ghost" size="lg">
                회원가입하기
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}