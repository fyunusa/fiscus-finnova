'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge, Alert, Input } from '@/components/ui';
import Link from 'next/link';
import { Eye, AlertCircle, TrendingUp } from 'lucide-react';
import { getUserInvestments, UserInvestment, UserInvestmentsResponse } from '@/services/investments.service';

export default function MyInvestmentsPage() {
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchUserInvestments();
  }, []);

  const fetchUserInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: UserInvestmentsResponse = await getUserInvestments();
      
      if (response.success && response.data) {
        setInvestments(response.data);
      } else {
        setError(response.message || '투자 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '투자 정보를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('Error fetching investments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestments = investments.filter(inv => {
    const investmentTitle = inv.investment?.title || '';
    const matchesSearch = investmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '투자', href: '/investment' },
    { label: '나의 투자', href: '#' },
  ];

  /** 
   * Format status badge with proper styling and korean text
   */
  const getStatusBadge = (status: UserInvestment['status']) => {
    const statusConfig = {
      pending: { label: '대기중', bg: 'bg-yellow-100', text: 'text-yellow-800' },
      confirmed: { label: '확정', bg: 'bg-blue-100', text: 'text-blue-800' },
      completed: { label: '완료', bg: 'bg-green-100', text: 'text-green-800' },
      failed: { label: '실패', bg: 'bg-red-100', text: 'text-red-800' },
      cancelled: { label: '취소', bg: 'bg-gray-100', text: 'text-gray-800' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </Badge>
    );
  };

  /**
   * Format amount as million won (백만원)
   */
  const formatAmount = (amount: number): string => {
    return `₩${(amount / 1000000).toFixed(2)}M`;
  };

  /**
   * Format date as YYYY-MM-DD
   */
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

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
                <h1 className="text-3xl font-bold text-gray-900">나의 투자</h1>
                <p className="mt-2 text-gray-600">
                  나의 투자 관련 정보를 관리하고 확인할 수 있습니다.
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
          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">오류 발생</h3>
                <p className="text-red-800 text-sm mt-1">{error}</p>
                <button
                  onClick={fetchUserInvestments}
                  className="mt-2 text-red-700 hover:text-red-900 font-medium text-sm underline"
                >
                  다시 시도
                </button>
              </div>
            </Alert>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검색
                </label>
                <Input
                  type="text"
                  placeholder="투자 상품명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">전체</option>
                  <option value="pending">대기중</option>
                  <option value="confirmed">확정</option>
                  <option value="completed">완료</option>
                  <option value="failed">실패</option>
                  <option value="cancelled">취소</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
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
                  나의 투자 목록
                </h2>
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  총 {filteredInvestments.length}개
                </Badge>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 mt-4">투자 정보를 불러오는 중...</span>
                </div>
              ) : filteredInvestments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          투자상품명
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          투자금액
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          예상수익률
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          투자일자
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInvestments.map((investment) => (
                        <tr key={investment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-start gap-2">
                              <TrendingUp className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {investment.investment?.title || '상품명 없음'}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  ID: {investment.investmentId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-gray-900">
                              {formatAmount(investment.investmentAmount)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {investment.investmentCount}개
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {getStatusBadge(investment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-semibold text-green-600">
                              {investment.expectedRate.toFixed(2)}%
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {investment.investmentPeriodMonths}개월
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {formatDate(investment.createdAt)}
                            </div>
                            {investment.confirmedAt && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                확정: {formatDate(investment.confirmedAt)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Link href={`/investment/${investment.investmentId}`}>
                              <Button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-medium transition-colors">
                                <Eye size={14} />
                                상세보기
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-300 text-5xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm || selectedStatus !== 'all' ? '조건에 맞는 투자가 없습니다' : '아직 투자한 상품이 없습니다'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || selectedStatus !== 'all' 
                      ? '다른 검색 조건을 시도해보세요.'
                      : '투자 상품을 둘러보고 나의 첫 투자를 시작해보세요.'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/investment">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                        투자상품 보기
                      </Button>
                    </Link>
                    {(searchTerm || selectedStatus !== 'all') && (
                      <Button 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedStatus('all');
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded-lg font-medium"
                      >
                        필터 초기화
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
