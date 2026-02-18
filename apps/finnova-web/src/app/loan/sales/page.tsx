'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Button, Badge } from '@/components/ui';
import Link from 'next/link';
import { Zap, TrendingUp, Lock, Clock, DollarSign, CheckCircle, Star } from 'lucide-react';

export default function SalesPage() {
  const features = [
    {
      icon: Zap,
      title: '빠른 심사',
      description: '24시간 이내 신청 결과 통보',
      color: 'text-yellow-500'
    },
    {
      icon: DollarSign,
      title: '합리적 금리',
      description: '시중 최저 수준의 금리 제공',
      color: 'text-green-500'
    },
    {
      icon: Lock,
      title: '안전한 거래',
      description: '암호화된 보안 기술 적용',
      color: 'text-blue-500'
    },
    {
      icon: Clock,
      title: '유연한 상환',
      description: '상황에 맞는 상환 계획',
      color: 'text-purple-500'
    },
    {
      icon: TrendingUp,
      title: '최대 한도',
      description: '최대 5억원까지 대출 가능',
      color: 'text-indigo-500'
    },
    {
      icon: CheckCircle,
      title: '간편한 신청',
      description: '온라인으로 언제든 신청',
      color: 'text-pink-500'
    },
  ];

  const promotions = [
    {
      title: 'CMS 이용료 면제',
      description: '첫 3개월 이용료 전액 면제',
      benefit: '최대 150,000원 절감',
      badge: '신규고객'
    },
    {
      title: '금리 우대',
      description: '기존 고객 추가 우대 금리',
      benefit: '최대 -1% 우대',
      badge: '기존고객'
    },
    {
      title: '한도 확대',
      description: '신청 금액 원하는 대로',
      benefit: '최대 5억원',
      badge: 'VIP'
    },
  ];

  const testimonials = [
    {
      name: '김철수',
      role: '사업가',
      text: '신청부터 실행까지 정말 빠르고 간단했어요. 추천합니다!',
      rating: 5
    },
    {
      name: '이영미',
      role: '회사원',
      text: '금리도 좋고 담당자분이 정말 친절하셨습니다.',
      rating: 5
    },
    {
      name: '박민준',
      role: '자영업자',
      text: '복잡한 서류 없이 간단하게 진행됐어요!',
      rating: 5
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="bg-blue-400 bg-opacity-20 text-blue-200 mb-4 px-3 py-1">
                🎉 지금이 기회입니다!
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                빠신 시간에는 분명한 답변을 얻으세요
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                대출이 필요하신가요? 우리는 24시간 이내에 답변하고, 시중 최저 수준의 금리를 제공합니다.
                지금 신청하시고 특별한 혜택을 받으세요!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/loan/application">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-lg text-lg">
                    지금 신청하기
                  </Button>
                </Link>
                <Link href="/loan/consultation">
                  <Button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold px-8 py-4 rounded-lg text-lg border border-white">
                    상담 받기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Promotions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">이달의 특별 혜택</h2>
            <p className="text-gray-600 text-lg">새로운 고객과 기존 고객 모두를 위한 특별한 프로모션</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {promotions.map((promo, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-200 hover:shadow-lg transition-all">
                <Badge className="bg-blue-600 text-white mb-4 px-3 py-1">
                  {promo.badge}
                </Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{promo.title}</h3>
                <p className="text-gray-700 mb-4">{promo.description}</p>
                <div className="bg-white rounded-lg p-3 mb-4">
                  <p className="text-blue-600 font-bold text-lg">{promo.benefit}</p>
                </div>
                <Link href="/loan/application">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">
                    이 상품으로 신청
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">왜 우리를 선택할까요?</h2>
              <p className="text-gray-600 text-lg">고객 만족을 위한 우리의 6가지 약속</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all text-center">
                    <div className={`w-16 h-16 ${feature.color} mx-auto mb-4 flex items-center justify-center`}>
                      <Icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Lineup */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">다양한 대출 상품</h2>
            <p className="text-gray-600 text-lg">상황에 맞는 최적의 대출 상품을 선택하세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: '아파트 담보 대출', rate: '7-10%', ltv: '70%', appeal: '저금리' },
              { name: '건물 담보 대출', rate: '6.5-9.5%', ltv: '65%', appeal: '최고 LTV' },
              { name: '신용대출', rate: '8-15%', ltv: '100%', appeal: '담보 불필요' },
              { name: '사업자 대출', rate: '5.5-8.5%', ltv: '80%', appeal: '사업자 전문' },
            ].map((product, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-t-4 border-blue-600">
                <Badge className="bg-blue-100 text-blue-800 mb-3">{product.appeal}</Badge>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{product.name}</h3>
                <div className="space-y-2 text-sm mb-6 bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">금리</span>
                    <span className="font-bold">{product.rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">최대 LTV</span>
                    <span className="font-bold">{product.ltv}</span>
                  </div>
                </div>
                <Link href="/loan/application">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">
                    자세히 보기
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">고객 후기</h2>
              <p className="text-gray-600 text-lg">실제 고객들의 만족도를 확인해보세요</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">&quot;{testimonial.text}&quot;</p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white text-center">
            <h2 className="text-4xl font-bold mb-4">지금 바로 시작하세요</h2>
            <p className="text-blue-100 text-lg mb-8">
              복잡한 절차는 이제 그만! 온라인 신청만으로 대출받으세요
            </p>
            <Link href="/loan/application">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-3 rounded-lg text-lg">
                간단히 신청하기
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
            </div>

            <div className="space-y-4">
              {[
                { q: '신청부터 실행까지 얼마나 걸리나요?', a: '일반적으로 3-5일 소요되며, 긴급한 경우 24시간 상담이 가능합니다.' },
                { q: '필요한 서류가 뭔가요?', a: '신분증, 재직증명서(또는 사업자등록증), 소득증명서가 필수입니다.' },
                { q: '한도는 얼마까지 가능한가요?', a: '상품과 신용도에 따라 다르지만, 최대 5억원까지 대출이 가능합니다.' },
                { q: '추가 수수료가 있나요?', a: '대출 금리에만 포함되며, 별도의 수수료는 없습니다.' },
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Q. {faq.q}</h3>
                  <p className="text-gray-700">A. {faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
