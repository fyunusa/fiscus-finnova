'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input } from '@/components/ui';
import Link from 'next/link';
import { Search, ChevronRight, MessageCircle } from 'lucide-react';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  faqCount: number;
}

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const categories: Category[] = [
    { id: 'getting-started', name: '시작하기', icon: '🚀', faqCount: 8 },
    { id: 'investments', name: '투자', icon: '💰', faqCount: 12 },
    { id: 'loans', name: '대출', icon: '🏦', faqCount: 10 },
    { id: 'account', name: '계정 관리', icon: '👤', faqCount: 9 },
    { id: 'payments', name: '결제 및 출금', icon: '💳', faqCount: 11 },
    { id: 'technical', name: '기술 문제', icon: '🔧', faqCount: 7 },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      category: 'getting-started',
      question: '핀노바는 어떤 서비스인가요?',
      answer: '핀노바는 온라인 투자 플랫폼으로, 개인 투자자들이 다양한 금융 상품에 투자할 수 있는 서비스를 제공합니다.',
    },
    {
      id: '2',
      category: 'getting-started',
      question: '가입 절차는 어떻게 되나요?',
      answer: '휴대폰 인증 → 약관 동의 → 신원 확인 → 계좌 등록 → 본인 인증의 과정을 거치게 됩니다.',
    },
    {
      id: '3',
      category: 'investments',
      question: '최소 투자 금액은 얼마인가요?',
      answer: '상품별로 다르지만, 최소 투자 금액은 1만원부터 시작됩니다.',
    },
    {
      id: '4',
      category: 'investments',
      question: '수익은 어떻게 받나요?',
      answer: '투자 상품의 이자는 매월 정기적으로 입금되며, 원금은 상품 만기 시에 반환됩니다.',
    },
    {
      id: '5',
      category: 'loans',
      question: '대출 신청 절차는 어떻게 되나요?',
      answer: '필요한 서류 준비 → 온라인 신청 → 감정 평가 → 계약 → 대출 실행의 순서로 진행됩니다.',
    },
    {
      id: '6',
      category: 'account',
      question: '비밀번호를 잊어버렸어요. 어떻게 하나요?',
      answer: '로그인 페이지의 "비밀번호 찾기" 버튼을 클릭하여 본인 인증 후 새로운 비밀번호를 설정하실 수 있습니다.',
    },
    {
      id: '7',
      category: 'payments',
      question: '출금 수수료가 있나요?',
      answer: '현재 출금 수수료는 없습니다. 단, 은행별 송금 수수료는 발생할 수 있습니다.',
    },
    {
      id: '8',
      category: 'technical',
      question: '앱이 자주 튕겨요. 어떻게 해야 하나요?',
      answer: '앱을 완전히 삭제한 후 재설치해 보세요. 문제가 계속되면 고객 지원팀에 연락주세요.',
    },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">도움말 센터</h1>
          <p className="text-xl text-gray-600 mb-8">자주 묻는 질문 및 지원</p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="질문 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">카테고리 선택</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-2">{category.faqCount}개 질문</p>
              </button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory ? '선택된 카테고리' : '모든 질문'} ({filteredFAQs.length})
          </h2>

          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <Card
                  key={faq.id}
                  className="p-4 cursor-pointer transition-all hover:shadow-md"
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 flex-1">{faq.question}</h3>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${
                        expandedFAQ === faq.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {expandedFAQ === faq.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="bg-blue-50 border-2 border-blue-200 p-8 text-center">
          <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">더 이상 도움이 되지 않나요?</h3>
          <p className="text-gray-600 mb-6">고객 지원 팀에 문의하세요</p>
          <Link href="/support/tickets/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
              문의 등록하기
            </Button>
          </Link>
        </Card>
      </div>
    </Layout>
  );
}
