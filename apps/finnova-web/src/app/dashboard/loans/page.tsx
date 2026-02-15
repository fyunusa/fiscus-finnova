'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge, Alert, Table, Input, Select } from '@/components/ui';
import Link from 'next/link';
import {
  TrendingDown,
  DollarSign,
  Calendar,
  AlertCircle,
  Filter,
  ChevronRight,
  X,
} from 'lucide-react';

interface Loan {
  id: string;
  propertyAddress: string;
  loanAmount: number;
  interestRate: number;
  loanPeriod: number;
  disbursedDate: string;
  nextPaymentDate: string | null;
  nextPaymentAmount: number;
  status: 'application_submitted' | 'under_review' | 'inspection_scheduled' | 'inspection_completed' | 'contract_pending' | 'approved' | 'disbursed' | 'repaying' | 'completed';
  outstandingBalance: number;
  totalRepaid: number;
}

export default function LoanDashboardPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterAmountRange, setFilterAmountRange] = useState('all');

  // Summary Cards Data
  const activeLoanCount = 2;
  const totalBorrowedAmount = 350000000;
  const nextPaymentDate = '2026-02-28';
  const nextPaymentAmount = 4800000;
  const outstandingBalance = 287500000;

  // Loan Data
  const loans: Loan[] = [
    {
      id: '1',
      propertyAddress: '서울시 강남구 강남역 아파트 201호',
      loanAmount: 200000000,
      interestRate: 7.5,
      loanPeriod: 36,
      disbursedDate: '2024-03-15',
      nextPaymentDate: '2026-02-28',
      nextPaymentAmount: 2850000,
      status: 'repaying',
      outstandingBalance: 180000000,
      totalRepaid: 20000000,
    },
    {
      id: '2',
      propertyAddress: '인천시 송도 오피스텔 1205호',
      loanAmount: 150000000,
      interestRate: 8.0,
      loanPeriod: 24,
      disbursedDate: '2024-06-20',
      nextPaymentDate: '2026-02-28',
      nextPaymentAmount: 1950000,
      status: 'repaying',
      outstandingBalance: 107500000,
      totalRepaid: 12500000,
    },
    {
      id: '3',
      propertyAddress: '부산시 해운대 아파트 305호',
      loanAmount: 100000000,
      interestRate: 7.2,
      loanPeriod: 12,
      disbursedDate: '2023-12-10',
      nextPaymentDate: null,
      nextPaymentAmount: 0,
      status: 'completed',
      outstandingBalance: 0,
      totalRepaid: 100000000,
    },
  ];

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      application_submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-blue-100 text-blue-800',
      inspection_scheduled: 'bg-purple-100 text-purple-800',
      inspection_completed: 'bg-purple-100 text-purple-800',
      contract_pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800',
      disbursed: 'bg-green-100 text-green-800',
      repaying: 'bg-amber-100 text-amber-800',
      completed: 'bg-green-100 text-green-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      application_submitted: '신청 접수',
      under_review: '검토 중',
      inspection_scheduled: '감정 예정',
      inspection_completed: '감정 완료',
      contract_pending: '계약 대기',
      approved: '승인',
      disbursed: '대출 실행',
      repaying: '상환 중',
      completed: '완료',
    };
    return labelMap[status] || status;
  };

  const activeLoansList = loans.filter(l => l.status === 'repaying' || l.status === 'approved');
  const allLoansList = loans;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleFilter = (loan: Loan) => {
    if (filterStatus !== 'all' && loan.status !== filterStatus) return false;
    return true;
  };

  const filteredLoans = (activeTab === 'active' ? activeLoansList : allLoansList).filter(handleFilter);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">대출 대시보드</h1>
          <p className="text-gray-600">귀사의 대출 현황을 관리하고 추적하세요</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">활성 대출</p>
                <p className="text-2xl font-bold text-gray-900">{activeLoanCount}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">총 차입액</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBorrowedAmount)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">다음 상환일</p>
                <p className="text-lg font-bold text-gray-900">{nextPaymentDate}</p>
              </div>
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">남은 잔액</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(outstandingBalance)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              활성 대출 ({activeLoansList.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              전체 대출 ({allLoansList.length})
            </button>
          </div>
        </div>

        {/* Filter and Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowFilterModal(!showFilterModal)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>필터</span>
          </button>
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <Card className="p-6 mb-6 bg-gray-50 border-2 border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">대출 필터</h3>
              <button onClick={() => setShowFilterModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full"
                >
                  <option value="all">전체</option>
                  <option value="application_submitted">신청 접수</option>
                  <option value="under_review">검토 중</option>
                  <option value="repaying">상환 중</option>
                  <option value="completed">완료</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
                <Select value={filterDateRange} onChange={(e) => setFilterDateRange(e.target.value)} className="w-full">
                  <option value="all">전체</option>
                  <option value="3months">3개월</option>
                  <option value="6months">6개월</option>
                  <option value="1year">1년</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">금액 범위</label>
                <Select
                  value={filterAmountRange}
                  onChange={(e) => setFilterAmountRange(e.target.value)}
                  className="w-full"
                >
                  <option value="all">전체</option>
                  <option value="0-50">~5천만</option>
                  <option value="50-100">5천만~1억</option>
                  <option value="100-200">1억~2억</option>
                  <option value="200">2억 이상</option>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowFilterModal(false)}>
                닫기
              </Button>
              <Button>필터 적용</Button>
            </div>
          </Card>
        )}

        {/* Loans Table */}
        <Card className="overflow-hidden">
          <Table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">담보 자산</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">대출액</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">금리</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">기간</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">상태</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">다음 상환</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{loan.propertyAddress}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(loan.loanAmount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{loan.interestRate}%</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{loan.loanPeriod}개월</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge className={getStatusColor(loan.status)}>{getStatusLabel(loan.status)}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {loan.status === 'repaying' ? (
                      <div>
                        <div className="font-medium">{loan.nextPaymentDate}</div>
                        <div className="text-gray-500 text-xs">{formatCurrency(loan.nextPaymentAmount)}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/loans/${loan.id}`}>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <span>상세보기</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {filteredLoans.length === 0 && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <div>
              <p className="font-medium">대출 정보 없음</p>
              <p className="text-sm text-gray-600 mt-1">조건에 맞는 대출이 없습니다.</p>
            </div>
          </Alert>
        )}
      </div>
    </Layout>
  );
}
