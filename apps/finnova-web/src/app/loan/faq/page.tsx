'use client';

import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge, Input } from '@/components/ui';
import Link from 'next/link';
import { ChevronDown, Phone, Mail, MessageSquare, Search } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    category: '대출 기본',
    question: '대출 한도는 어떻게 결정되나요?',
    answer: '대출 한도는 담보 자산 평가, 신용등급, 소득 수준 등 여러 요인을 종합적으로 고려하여 결정됩니다. 일반적으로 담보 인정 가액의 70%까지 대출이 가능합니다.',
  },
  {
    id: '2',
    category: '대출 기본',
    question: '최대 몇 개월까지 대출이 가능한가요?',
    answer: '현재 최대 36개월(3년)까지 대출이 가능합니다. 신청자의 상황에 따라 유연한 기간 설정이 가능하며, 상담을 통해 최적의 기간을 결정할 수 있습니다.',
  },
  {
    id: '3',
    category: '대출 기본',
    question: '금리는 어떻게 결정되나요?',
    answer: '금리는 신용등급, 대출 기간, 담보 유형, 시장 금리 등을 고려하여 결정됩니다. 평균 8-12% 범위에서 책정되며, 개별 상담을 통해 정확한 금리를 안내받을 수 있습니다.',
  },
  {
    id: '4',
    category: '신청 및 심사',
    question: '대출 신청 시 필요한 서류는 무엇인가요?',
    answer: '주민등록등본, 신분증, 최근 3개월 통장 사본, 소득 입증 서류(급여명세서, 사업소득)가 필요합니다. 담보 자산이 있는 경우 등기부등본도 준비해주세요.',
  },
  {
    id: '5',
    category: '신청 및 심사',
    question: '대출 심사는 얼마나 걸리나요?',
    answer: '일반적으로 심사는 3-5일 소요됩니다. 필요한 서류가 모두 준비되고 신용 문제가 없다면 더 빠르게 진행될 수 있습니다.',
  },
  {
    id: '6',
    category: '신청 및 심사',
    question: '신용등급이 낮아도 대출이 가능한가요?',
    answer: '신용등급이 낮아도 담보 자산이 충분하고 상환 능력이 입증된다면 대출이 가능합니다. 개별 상담을 통해 최적의 방안을 제시해드립니다.',
  },
  {
    id: '7',
    category: '상환',
    question: '원리금 균등 상환과 원금 균등 상환의 차이가 뭔가요?',
    answer: '원리금 균등 상환은 매월 같은 금액을 납부하는 방식(일반적), 원금 균등 상환은 매월 같은 원금을 납부하되 이자는 감소하는 방식입니다.',
  },
  {
    id: '8',
    category: '상환',
    question: '조기 상환 시 수수료가 발생하나요?',
    answer: '조기 상환 시 별도의 수수료는 발생하지 않습니다. 남은 기간의 이자만 계산되어 반영되므로 언제든지 상환할 수 있습니다.',
  },
  {
    id: '9',
    category: '상환',
    question: '상환일을 변경할 수 있나요?',
    answer: '월 1회 상환일 변경이 가능합니다. 고객센터에 연락하여 변경 신청을 하면 다음 상환일부터 적용됩니다.',
  },
  {
    id: '10',
    category: '기타',
    question: '대출 중도 상환 시 페널티가 있나요?',
    answer: '대출 중도 상환 시 페널티는 없습니다. 자유롭게 상환하실 수 있으며, 남은 기간의 이자만 조정됩니다.',
  },
];

const categories = ['전체', '대출 기본', '신청 및 심사', '상환', '기타'];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const filteredFAQs = useMemo(() => {
    return faqItems.filter(item => {
      const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">자주 묻는 질문</h1>
            <p className="text-blue-100 text-lg">
              대출 관련 질문과 답변을 찾아보세요
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="질문을 검색하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <p className="text-sm font-medium text-gray-700 mb-4">카테고리</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                  {cat !== '전체' && (
                    <span className="ml-2 text-xs">
                      ({faqItems.filter(item => item.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items - Accordion */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">{item.category}</p>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Q. {item.question}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      size={24}
                      className={`text-blue-600 transition-transform flex-shrink-0 ml-4 ${
                        expandedId === item.id ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Expanded Content */}
                  {expandedId === item.id && (
                    <div className="border-t border-gray-200 bg-blue-50 px-6 py-4">
                      <p className="text-gray-700 leading-relaxed">
                        <span className="font-semibold text-blue-600">A. </span>
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  다른 검색어나 카테고리를 시도해보세요
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('전체');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  초기화
                </Button>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">추가 문의</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <Phone className="text-blue-600 mt-1 mr-4 flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-gray-900">전화</p>
                  <p className="text-gray-600">1577-XXXX (평일 9AM-6PM)</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="text-blue-600 mt-1 mr-4 flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-gray-900">이메일</p>
                  <p className="text-gray-600">support@finnova.co.kr</p>
                </div>
              </div>
              <div className="flex items-start">
                <MessageSquare className="text-blue-600 mt-1 mr-4 flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-gray-900">상담신청</p>
                  <Link href="/loan/consultation">
                    <Button className="text-blue-600 hover:text-blue-700 bg-transparent hover:bg-blue-50 px-0 py-1 font-medium text-sm">
                      상담 신청하기 →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Total Count */}
          <div className="mt-8 text-center text-gray-600">
            <p>총 {filteredFAQs.length}개의 질문이 있습니다</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
