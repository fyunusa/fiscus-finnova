'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button, Badge } from '@/components/ui';
import Link from 'next/link';
import { loanService, LoanApplication } from '@/services/loanService';
import { LayoutGrid, List, DollarSign, Calendar, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

export default function MyLoansPage() {
  const [data, setData] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await loanService.getApplications(
          selectedStatus === 'all' ? undefined : selectedStatus
        );
        setData(result.data);
      } catch (err) {
        console.error('Failed to fetch loan applications:', err);
        setError('대출 신청 목록을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [selectedStatus]);

  const filteredData = data.filter(item => {
    const matchesSearch = item.applicationNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800', icon: CheckCircle, label: '활성' };
      case 'approved': return { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: '승인' };
      case 'pending': return { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: '대기중' };
      case 'submitted': return { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: '제출됨' };
      case 'rejected': return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', icon: AlertCircle, label: '거절' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: status };
    }
  };

  const breadcrumbItems = [
      { label: '홈', href: '/' },
      { label: '대출', href: '/loan' },
      { label: '내 대출', href: '#' },
    ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">내 대출</h1>
            <p className="text-blue-200">신청하신 모든 대출을 한곳에서 관리하세요</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/loan/apartment">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer">
                <h3 className="font-bold text-gray-900 mb-2">🏠 아파트 담보 대출</h3>
                <p className="text-sm text-gray-600">낮은 금리로 대출받기</p>
              </div>
            </Link>
            <Link href="/loan/application">
              <div className="bg-gradient-to-br from-slate-50 to-green-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg hover:border-green-400 transition-all cursor-pointer">
                <h3 className="font-bold text-gray-900 mb-2">📝 새 대출 신청</h3>
                <p className="text-sm text-gray-600">간편한 온라인 신청</p>
              </div>
            </Link>
            <Link href="/loan/sales">
              <div className="bg-gradient-to-br from-slate-50 to-orange-50 border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg hover:border-orange-400 transition-all cursor-pointer">
                <h3 className="font-bold text-gray-900 mb-2">🎉 특별 혜택</h3>
                <p className="text-sm text-gray-600">이달의 프로모션 확인</p>
              </div>
            </Link>
          </div>

          {/* Filters & Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  검색 (신청번호)
                </label>
                <input
                  type="text"
                  placeholder="신청번호로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  상태 필터
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">전체</option>
                  <option value="active">활성</option>
                  <option value="approved">승인</option>
                  <option value="pending">대기중</option>
                  <option value="submitted">제출됨</option>
                  <option value="rejected">거절</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <LayoutGrid size={20} />
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <List size={20} />
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Data Display */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">로딩 중...</span>
            </div>
          ) : filteredData.length > 0 ? (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredData.map((item) => {
                    const statusInfo = getStatusColor(item.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div
                        key={item.id}
                        className={`${statusInfo.bg} border-2 ${statusInfo.border} rounded-xl p-6 hover:shadow-lg transition-all`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 font-semibold mb-1">신청번호</p>
                            <p className="text-lg font-bold text-gray-900">{item.applicationNo}</p>
                          </div>
                          <Badge className={`${statusInfo.badge} px-3 py-1 text-xs font-semibold`}>
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 border-opacity-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <DollarSign size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">신청금액</p>
                              <p className="font-bold text-gray-900">
                                ₩{(item.requestedLoanAmount / 100000000).toFixed(1)}억
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <TrendingUp size={20} className="text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">신청일</p>
                              <p className="font-bold text-gray-900">
                                {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/loan/application/${item.id}`} className="flex-1">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">
                              상세보기
                            </Button>
                          </Link>
                          {item.status === 'pending' && (
                            <Link href={`/loan/application/${item.id}/edit`} className="flex-1">
                              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">
                                수정
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">신청번호</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">신청금액</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">상태</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">신청일</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">작업</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredData.map((item) => {
                          const statusInfo = getStatusColor(item.status);
                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                {item.applicationNo}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                ₩{(item.requestedLoanAmount / 100000000).toFixed(1)}억
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={statusInfo.badge}>
                                  {statusInfo.label}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                                {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Link href={`/loan/application/${item.id}`}>
                                  <Button className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-xs">
                                    상세
                                  </Button>
                                </Link>
                                {item.status === 'pending' && (
                                  <Link href={`/loan/application/${item.id}/edit`}>
                                    <Button className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1 rounded text-xs">
                                      수정
                                    </Button>
                                  </Link>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={32} className="text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                대출 신청이 없습니다
              </h3>
              <p className="text-gray-600 mb-8">
                아직 신청하신 대출이 없습니다. 지금 대출을 신청하고 간편하게 관리하세요.
              </p>
              <Link href="/loan/application">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg">
                  지금 대출 신청하기
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
