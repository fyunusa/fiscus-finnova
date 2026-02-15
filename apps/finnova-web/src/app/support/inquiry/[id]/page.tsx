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

export default function SupportInquiryDetailPage() {
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
          description: '[id] 관련 샘플 데이터입니다.',
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
      { label: '지원', href: '/support' },
      { label: '[id]', href: '#' },
    ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={item.href}>
                  {index > 0 && <span className="text-gray-300">/</span>}
                  <Link
                    href={item.href}
                    className={index === breadcrumbItems.length - 1 
                      ? "text-blue-600 font-medium" 
                      : "hover:text-gray-700"
                    }
                  >
                    {item.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">[id]</h1>
                <p className="mt-2 text-gray-600">
                  [id] 관련 정보를 관리하고 확인할 수 있습니다.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                새로 만들기
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  [id] 목록
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
                  <div className="text-gray-400 text-lg mb-2">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    데이터가 없습니다
                  </h3>
                  <p className="text-gray-600 mb-4">
                    조건에 맞는 [id] 항목을 찾을 수 없습니다.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                    새로 만들기
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
