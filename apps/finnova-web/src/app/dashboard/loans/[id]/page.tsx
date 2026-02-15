'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge, Table } from '@/components/ui';
import Link from 'next/link';
import { ArrowLeft, Download, Calculator, AlertCircle } from 'lucide-react';

interface RepaymentSchedule {
  installmentNo: number;
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
}

interface PaymentHistory {
  date: string;
  principal: number;
  interest: number;
  total: number;
  status: 'completed' | 'failed';
}

export default function LoanDetailPage({ params }: { params: { id: string } }) {
  const loanId = params.id;
  const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'details'>('schedule');
  const [earlyRepaymentAmount, setEarlyRepaymentAmount] = useState('');

  // Mock loan data
  const loan = {
    id: loanId,
    propertyAddress: '서울시 강남구 강남역 아파트 201호',
    loanAmount: 200000000,
    interestRate: 7.5,
    loanPeriod: 36,
    disbursedDate: '2024-03-15',
    nextPaymentDate: '2026-02-28',
    nextPaymentAmount: 2850000,
    status: 'repaying' as const,
    outstandingBalance: 180000000,
    totalRepaid: 20000000,
    propertyValue: 300000000,
    ltv: 66.67,
    collateralInfo: {
      type: '아파트',
      size: 84,
      address: '서울시 강남구 강남역',
      valuation: 300000000,
    },
  };

  const repaymentSchedule: RepaymentSchedule[] = Array.from({ length: 36 }, (_, i) => ({
    installmentNo: i + 1,
    dueDate: new Date(2024, 2 + i, 15).toISOString().split('T')[0],
    principal: 5555556,
    interest: 1250000,
    total: 6805556,
    status: i < 11 ? 'paid' : i === 11 ? 'pending' : 'pending',
  }));

  const paymentHistory: PaymentHistory[] = [
    {
      date: '2025-12-15',
      principal: 5555556,
      interest: 1250000,
      total: 6805556,
      status: 'completed',
    },
    {
      date: '2025-11-15',
      principal: 5555556,
      interest: 1250000,
      total: 6805556,
      status: 'completed',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-amber-100 text-amber-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/loans">
            <Button variant="ghost" className="mb-4 flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>돌아가기</span>
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{loan.propertyAddress}</h1>
          <div className="flex items-center space-x-4">
            <Badge className="bg-amber-100 text-amber-800">상환 중</Badge>
            <span className="text-gray-600">실행일: {loan.disbursedDate}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">대출금액</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.loanAmount)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">금리</p>
            <p className="text-2xl font-bold text-gray-900">{loan.interestRate}%</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">기간</p>
            <p className="text-2xl font-bold text-gray-900">{loan.loanPeriod}개월</p>
          </Card>
        </div>

        {/* Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">담보 정보</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">유형</span>
                <span className="font-medium text-gray-900">{loan.collateralInfo.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">면적</span>
                <span className="font-medium text-gray-900">{loan.collateralInfo.size}㎡</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">감정가</span>
                <span className="font-medium text-gray-900">{formatCurrency(loan.collateralInfo.valuation)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">LTV</span>
                <span className="font-medium text-gray-900">{loan.ltv.toFixed(2)}%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">상환 현황</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">상환액</span>
                <span className="font-medium text-gray-900">{formatCurrency(loan.totalRepaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">남은 잔액</span>
                <span className="font-medium text-gray-900">{formatCurrency(loan.outstandingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상환율</span>
                <span className="font-medium text-gray-900">{((loan.totalRepaid / loan.loanAmount) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(loan.totalRepaid / loan.loanAmount) * 100}%` }}
                ></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              상환 계획표
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              상환 이력
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              상세정보
            </button>
          </div>
        </div>

        {/* Repayment Schedule Tab */}
        {activeTab === 'schedule' && (
          <Card className="overflow-hidden">
            <Table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">회차</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">상환일</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">원금</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">이자</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">합계</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {repaymentSchedule.map((item) => (
                  <tr key={item.installmentNo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.installmentNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.dueDate}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(item.principal)}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(item.interest)}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === 'paid' ? '완료' : item.status === 'pending' ? '예정' : '연체'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <Card className="overflow-hidden">
            <Table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">상환일</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">원금</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">이자</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">합계</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.date}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(item.principal)}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(item.interest)}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge className="bg-green-100 text-green-800">
                        {item.status === 'completed' ? '완료' : '실패'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>조기상환 계산기</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상환 예정액</label>
                  <input
                    type="number"
                    value={earlyRepaymentAmount}
                    onChange={(e) => setEarlyRepaymentAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="상환 금액 입력"
                  />
                </div>
                {earlyRepaymentAmount && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">이자 절감액</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(parseInt(earlyRepaymentAmount) * 0.05)}
                    </p>
                  </div>
                )}
                <Button className="w-full">조기상환 신청</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">문서 다운로드</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">대출 계약서</span>
                  </div>
                  <span className="text-gray-400">PDF</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">담보 관련 서류</span>
                  </div>
                  <span className="text-gray-400">ZIP</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">거래 명세서</span>
                  </div>
                  <span className="text-gray-400">PDF</span>
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
