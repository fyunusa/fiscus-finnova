'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge, Alert, Table, Input, Select } from '@/components/ui';
import Link from 'next/link';

interface DataItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

export default function DisclosurePage() {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      setData([
        {
          id: '1',
          title: '샘플 항목 1',
          description: '금융상품공시 관련 샘플 데이터입니다.',
          status: 'active',
          createdAt: '2024-02-14',
        },
        {
          id: '2',
          title: '샘플 항목 2',
          description: '추가 샘플 데이터입니다.',
          status: 'pending',
          createdAt: '2024-02-13',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredData = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const breadcrumbItems = [
      { label: '홈', href: '/' },
      { label: '사업공시', href: '#' },
    ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="text-5xl mb-4">📋</div>
              <h1 className="text-4xl font-bold mb-4">사업공시</h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                금융위원회 규정에 따라 P2P 금융업자가 공시해야 하는 사업 정보를 투명하게 제공합니다
              </p>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">재무정보</h3>
              <p className="text-gray-600 text-sm">
                회사의 재무제표, 자본금, 영업실적 등 재무 관련 정보를 확인할 수 있습니다.
              </p>
            </Card>
            <Card className="bg-white p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">투자상품 현황</h3>
              <p className="text-gray-600 text-sm">
                현재 모집 중인 투자 상품과 운용 현황, 연체율 등의 정보를 제공합니다.
              </p>
            </Card>
            <Card className="bg-white p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">⚖️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">법률 및 규제</h3>
              <p className="text-gray-600 text-sm">
                금융위원회 등록 정보, 관련 법규 준수 내역 및 인허가 정보를 확인하세요.
              </p>
            </Card>
          </div>

          {/* What is Business Disclosure */}
          <Card className="bg-blue-50 border border-blue-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>ℹ️</span>
              사업공시란?
            </h2>
            <div className="text-gray-700 space-y-2 text-sm">
              <p>
                <strong>사업공시</strong>는 온라인 투자연계금융업법(P2P법) 제13조에 따라 P2P 금융회사가 
                의무적으로 공개해야 하는 사업 정보입니다.
              </p>
              <p>
                투자자 보호를 위해 회사의 재무 건전성, 투자상품 운용 현황, 연체율, 부실채권 비율 등을 
                투명하게 공개하여 투자자가 합리적인 의사결정을 할 수 있도록 돕습니다.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>분기별 재무제표 및 감사보고서</li>
                <li>투자상품별 연체율 및 부실채권 현황</li>
                <li>대출자 신용등급 분포</li>
                <li>이해관계자 거래 내역</li>
                <li>금융위원회 등록 및 인허가 정보</li>
              </ul>
            </div>
          </Card>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검색
                </label>
                <Input
                  type="text"
                  placeholder="제목으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태
                </label>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체</option>
                  <option value="active">활성</option>
                  <option value="pending">대기</option>
                  <option value="completed">완료</option>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium">
                  필터 적용
                </Button>
              </div>
            </div>
          </div>

          {/* Data Display */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  공시 문서 목록
                </h2>
                <Badge className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  총 {filteredData.length}개
                </Badge>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">로딩 중...</span>
                </div>
              ) : filteredData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          제목
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          설명
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          생성일
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.title}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {item.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : item.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.status === 'active' ? '활성' : 
                               item.status === 'pending' ? '대기' : '기타'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.createdAt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-xs">
                              상세
                            </Button>
                            <Button className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1 rounded text-xs">
                              수정
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    공시 문서가 준비 중입니다
                  </h3>
                  <p className="text-gray-600 mb-4">
                    곧 최신 사업공시 문서가 업데이트될 예정입니다.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
