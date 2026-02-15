'use client';

import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, Button } from '@/components/ui';
import Link from 'next/link';
import { ChevronDown, Download, FileText, Upload } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  description: string;
  category: 'required' | 'collateral' | 'additional';
  isRequired: boolean;
  fileType: string;
  notes: string[];
}

const documents: Document[] = [
  // 필수 서류 (Required)
  {
    id: '1',
    category: 'required',
    name: '신분증 사본',
    description: '유효한 신분증 (주민등록증, 운전면허증, 여권 등)',
    isRequired: true,
    fileType: 'PDF, JPG, PNG',
    notes: [
      '만료된 신분증은 인정되지 않습니다',
      '양면 모두 선명하게 제출하세요',
    ],
  },
  {
    id: '2',
    category: 'required',
    name: '주민등록등본',
    description: '최근 3개월 이내 발급한 주민등록등본',
    isRequired: true,
    fileType: 'PDF',
    notes: [
      '주소 변경 내역이 포함되어야 합니다',
      '인터넷 발급 본으로 가능합니다',
    ],
  },
  {
    id: '3',
    category: 'required',
    name: '통장 사본',
    description: '최근 3개월 통장 거래 내역',
    isRequired: true,
    fileType: 'PDF, JPG',
    notes: [
      '예금주명이 명확히 드러나야 합니다',
      '월별 거래 내역이 모두 포함되어야 합니다',
    ],
  },
  {
    id: '4',
    category: 'required',
    name: '소득 입증 서류',
    description: '급여명세서, 사업소득금액증명, 근로소득원천징수영수증 중 택1',
    isRequired: true,
    fileType: 'PDF',
    notes: [
      '최근 3개월 문서 중 최신순으로 제출하세요',
      '자영업자의 경우 사업자 등록증도 함께 제출하세요',
    ],
  },

  // 담보 관련 (Collateral)
  {
    id: '5',
    category: 'collateral',
    name: '은행 통장 확인서',
    description: '금융 자산 현황 확인',
    isRequired: false,
    fileType: 'PDF',
    notes: [
      '보유 자산 확인용',
      '최근 1개월 이내 발급 문서',
    ],
  },
  {
    id: '6',
    category: 'collateral',
    name: '신용점수 조회',
    description: '신용 조회 동의서',
    isRequired: false,
    fileType: 'PDF',
    notes: [
      '신용심사 참고용',
      '본인 동의하에 조회됩니다',
    ],
  },

  // 추가 서류 (Additional)
  {
    id: '7',
    category: 'additional',
    name: '사업자 등록증',
    description: '자영업자/사업가 대출 신청 시',
    isRequired: false,
    fileType: 'PDF',
    notes: [
      '유효한 사업자 등록증',
      '폐업하지 않은 상태여야 합니다',
    ],
  },
  {
    id: '8',
    category: 'additional',
    name: '재직증명서',
    description: '고용 관계 증명',
    isRequired: false,
    fileType: 'PDF',
    notes: [
      '회사 인장 날인 필수',
      '최근 1개월 이내 발급 문서',
    ],
  },
];

const categoryLabels = {
  required: { ko: '필수', color: 'text-red-600 bg-red-50' },
  collateral: { ko: '담보', color: 'text-blue-600 bg-blue-50' },
  additional: { ko: '추가', color: 'text-purple-600 bg-purple-50' },
};

export default function AccountDocumentsPage() {
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'required' | 'collateral' | 'additional'>('all');

  const filteredDocuments = useMemo(() => {
    if (selectedCategory === 'all') return documents;
    return documents.filter(doc => doc.category === selectedCategory);
  }, [selectedCategory]);

  const categoryStats = {
    required: documents.filter(d => d.category === 'required').length,
    collateral: documents.filter(d => d.category === 'collateral').length,
    additional: documents.filter(d => d.category === 'additional').length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">계정 서류</h1>
            <p className="text-blue-100 text-lg">
              계정 관리에 필요한 서류를 확인하고 준비하세요
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">서류 분류</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체 ({documents.length})
              </button>
              <button
                onClick={() => setSelectedCategory('required')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'required'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                필수 ({categoryStats.required})
              </button>
              <button
                onClick={() => setSelectedCategory('collateral')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'collateral'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                담보 ({categoryStats.collateral})
              </button>
              <button
                onClick={() => setSelectedCategory('additional')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'additional'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                추가 ({categoryStats.additional})
              </button>
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === doc.id ? null : doc.id)
                  }
                  className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-start gap-4">
                      <FileText className="text-blue-600 mt-1 flex-shrink-0" size={24} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              categoryLabels[doc.category as keyof typeof categoryLabels]
                                .color
                            }`}
                          >
                            {categoryLabels[doc.category as keyof typeof categoryLabels].ko}
                          </span>
                          {doc.isRequired && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                              필수
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {doc.name}
                        </h3>
                        <p className="text-gray-600 mt-1">{doc.description}</p>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    size={24}
                    className={`text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                      expandedId === doc.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Content */}
                {expandedId === doc.id && (
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          제출 요구사항
                        </h4>
                        <ul className="space-y-2">
                          {doc.notes.map((note, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <span className="text-blue-600 font-bold mt-0.5">•</span>
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          파일 정보
                        </h4>
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">지원 형식:</span> {doc.fileType}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">최대 크기:</span> 10MB
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2">
                            <Download size={16} />
                            예시 다운로드
                          </Button>
                          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2">
                            <Upload size={16} />
                            파일 업로드
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Tips Section */}
          <Card className="bg-blue-50 shadow-md p-8 mt-12 border-l-4 border-blue-600">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📋 서류 제출 팁</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">✓ 서류 준비 시</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• 모든 문서는 선명하게 스캔하세요</li>
                  <li>• 서명 또는 날인이 있는지 확인하세요</li>
                  <li>• 발급 유효기간을 꼭 확인하세요</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">✓ 서류 제출 시</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• PDF 형식으로 통일하여 제출하세요</li>
                  <li>• 파일명에 서류 종류를 명시하세요</li>
                  <li>• 한 번에 모든 서류를 제출하세요</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            <Link href="/account">
              <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold">
                계정으로
              </Button>
            </Link>
            <Link href="/account/profile">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                프로필 수정
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
