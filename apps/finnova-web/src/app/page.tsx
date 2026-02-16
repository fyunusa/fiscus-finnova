'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import Link from 'next/link';

export default function Home() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check auth state
  useEffect(() => {
    const authState = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(authState === 'true');
  }, []);

  const faqs = [
    {
      id: '1',
      question: '핀노바는 어떤 서비스인가요?',
      answer: '핀노바는 온라인 투자연계금융 서비스로, 개인 투자자들이 다양한 금융 상품에 투자하고 대출을 받을 수 있는 플랫폼입니다.'
    },
    {
      id: '2',
      question: '최소 투자 금액은 얼마인가요?',
      answer: '상품별로 다르지만, 최소 투자 금액은 1만원부터 시작됩니다. 자세한 사항은 각 상품 페이지에서 확인할 수 있습니다.'
    },
    {
      id: '3',
      question: '대출 신청 절차는 어떻게 되나요?',
      answer: '필요한 서류 준비 → 온라인 신청 → 감정 평가 → 계약 → 대출 실행의 순서로 진행됩니다. 전체 과정은 약 2-3주 소요됩니다.'
    },
    {
      id: '4',
      question: '수익은 어떻게 받나요?',
      answer: '투자 상품의 이자는 매월 정기적으로 입금되며, 원금은 상품 만기 시에 반환됩니다.'
    },
    {
      id: '5',
      question: '계정이 안전한가요?',
      answer: '예, 핀노바는 금융위원회 등록 회사이며, 최신 보안 기술을 사용하여 계정을 보호합니다.'
    },
  ];

  const announcements = [
    {
      id: '1',
      title: '2024년 2월 신규 상품 출시 안내',
      date: '2024.02.15',
      category: '공지사항',
      badge: 'new'
    },
    {
      id: '2',
      title: '겨울 시즌 특별 이벤트 진행',
      date: '2024.02.10',
      category: '이벤트',
      badge: 'event'
    },
    {
      id: '3',
      title: '시스템 점검 안내',
      date: '2024.02.05',
      category: '공지사항',
      badge: 'notice'
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4">
              FINNOVA
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              믿을 수 있는 투자, 온라인 투자 연계 금융<br/>
              당신의 재정적 목표를 달성하기 위해 함께합니다
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href={isLoggedIn ? "/dashboard/investments" : "/investment"}>
                <Button className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold text-lg">
                  {isLoggedIn ? "내 투자 보기" : "투자 상품 보기"}
                </Button>
              </Link>
              <Link href={isLoggedIn ? "/dashboard/loans/" : "/loan"}>
                <Button className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-lg border border-blue-300">
                  {isLoggedIn ? "내 대출 보기" : "대출 신청하기"}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: '누적 투자금', value: '500억원', icon: '💰' },
                { label: '활성 투자자', value: '15,000명', icon: '👥' },
                { label: '성공 건수', value: '2,500건', icon: '✅' },
                { label: '평균 수익율', value: '7.5%', icon: '📈' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {stat.value}
                  </div>
                  <p className="text-gray-600">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                핵심 서비스
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                FINNOVA에서 제공하는 다양한 금융 서비스를 경험해보세요
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: '다양한 투자 상품',
                  description: '부동산 담보대출부터 사업자금까지 다양한 투자 상품을 한 곳에서 만나보세요.',
                  icon: '📊',
                  href: '/investment',
                  features: ['실시간 상품 현황', '상세 정보 제공', '간편한 투자']
                },
                {
                  title: '안전한 대출 서비스',
                  description: '엄격한 심사 절차를 거쳐 안전한 대출 서비스를 제공합니다.',
                  icon: '🏦',
                  href: '/loan',
                  features: ['최적의 금리', '빠른 심사', '신속한 실행']
                },
                {
                  title: '투명한 정보 공개',
                  description: '금융위원회 규정에 따라 사업 정보를 투명하게 공개합니다.',
                  icon: '📋',
                  href: '/disclosure',
                  features: ['재무 정보', '실적 공시', '법적 준수']
                },
              ].map((feature) => (
                <Link key={feature.title} href={feature.href}>
                  <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer p-8 border border-gray-200">
                    <div className="text-5xl mb-6">{feature.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-blue-600">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Products Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  인기 투자 상품
                </h2>
                <p className="text-gray-600">
                  가장 많은 투자자들이 관심을 가진 상품들입니다
                </p>
              </div>
              <Link href="/investment?sort=popular">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
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
                  badge: '마감임박',
                  investors: 1200
                },
                {
                  id: 2,
                  title: '중소기업 매출채권 담보대출',
                  rate: '7.2%',
                  progress: 70,
                  badge: '진행중',
                  investors: 890
                },
                {
                  id: 3,
                  title: '소상공인 비즈니스론',
                  rate: '8.0%',
                  progress: 50,
                  badge: '신규',
                  investors: 450
                },
              ].map((product) => (
                <Link key={product.id} href={`/investment/apartment/${product.id}`}>
                  <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-gray-900 flex-1 text-lg leading-tight">
                        {product.title}
                      </h3>
                      <Badge className={`ml-2 whitespace-nowrap text-xs px-2 py-1 rounded ${
                        product.badge === '마감임박' ? 'bg-red-100 text-red-800' :
                        product.badge === '신규' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {product.badge}
                      </Badge>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">수익율</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {product.rate}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full"
                          style={{ width: `${product.progress}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        모집률 {product.progress}% · {product.investors.toLocaleString()}명 투자 중
                      </div>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                      투자하기
                    </Button>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Announcements Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  최신 소식
                </h2>
                <p className="text-gray-600">
                  FINNOVA의 최신 소식과 공지사항을 확인하세요
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/support/announcements">
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                    공지사항 →
                  </Button>
                </Link>
                <Link href="/support/notice">
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                    소식 →
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {announcements.map((item) => (
                <Link key={item.id} href={`/support/notice/${item.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`text-xs px-2 py-1 rounded ${
                        item.badge === 'new' ? 'bg-red-100 text-red-800' :
                        item.badge === 'event' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.category}
                      </Badge>
                      {item.badge === 'new' && <span className="text-red-600 font-bold text-sm">NEW</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.date}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                자주 묻는 질문
              </h2>
              <p className="text-gray-600 mb-4">
                FINNOVA 이용에 대해 자주 묻는 질문과 답변입니다
              </p>
              <Link href="/support">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                  더 많은 도움말 보기
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.id} className="border border-gray-200 p-6">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full text-left flex items-center justify-between hover:text-blue-600 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {faq.question}
                    </h3>
                    <svg
                      className={`w-6 h-6 transition-transform ${
                        expandedFAQ === faq.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                  {expandedFAQ === faq.id && (
                    <p className="mt-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Support & Community Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                더 알아보기
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                FINNOVA와 다양한 방식으로 소통하고 더 많은 정보를 얻으세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/support">
                <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer p-8 text-center border border-gray-200">
                  <div className="text-5xl mb-4">❓</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">도움말 센터</h3>
                  <p className="text-sm text-gray-600">자주 묻는 질문과 가이드를 확인하세요</p>
                </Card>
              </Link>
              <Link href="/support/community">
                <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer p-8 text-center border border-gray-200">
                  <div className="text-5xl mb-4">👥</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">커뮤니티</h3>
                  <p className="text-sm text-gray-600">다른 투자자들과 경험을 나누세요</p>
                </Card>
              </Link>
              <Link href="/support/chat">
                <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer p-8 text-center border border-gray-200">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">실시간 채팅</h3>
                  <p className="text-sm text-gray-600">고객 지원팀과 실시간으로 상담하세요</p>
                </Card>
              </Link>
              <Link href="/disclosure">
                <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer p-8 text-center border border-gray-200">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">사업공시</h3>
                  <p className="text-sm text-gray-600">재무정보와 사업 현황을 공개합니다</p>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-4">
              {isLoggedIn ? "대시보드로 이동" : "지금 시작하세요"}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {isLoggedIn 
                ? "당신의 투자 및 대출 현황을 한눈에 확인하세요"
                : "FINNOVA와 함께 스마트한 금융의 미래를 경험해보세요"}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold text-lg">
                      대시보드 보기
                    </Button>
                  </Link>
                  <Link href="/support/chat">
                    <Button className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-lg border border-blue-300">
                      고객 지원 문의
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold text-lg">
                      회원가입하기
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-lg border border-blue-300">
                      로그인하기
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}