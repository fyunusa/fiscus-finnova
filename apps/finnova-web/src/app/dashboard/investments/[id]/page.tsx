'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input } from '@/components/ui';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  FileText,
  DollarSign,
  Calendar,
  Percent,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface RepaymentSchedule {
  date: string;
  principal: number;
  interest: number;
  total: number;
  status: 'pending' | 'completed' | 'overdue';
}

interface PaymentHistory {
  date: string;
  principal: number;
  interest: number;
  taxWithheld: number;
  netAmount: number;
}

export default function InvestmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Investment data (normally from API)
  const investment = {
    id: params.id,
    productName: '강남역 아파트 담보대출',
    investmentDate: '2024-01-15',
    amount: 5000000,
    interestRate: 8.5,
    period: 12,
    status: 'active',
    returnsToDate: 125000,
    borrowerInfo: {
      loanType: '아파트 담보대출',
      loanAmount: 500000000,
      ltv: 65,
      collateral: '서울시 강남구 강남역 인근 아파트',
      collateralValue: 770000000,
    },
  };

  const repaymentSchedule: RepaymentSchedule[] = [
    {
      date: '2024-02-15',
      principal: 416667,
      interest: 35625,
      total: 452292,
      status: 'completed',
    },
    {
      date: '2024-03-15',
      principal: 416667,
      interest: 35625,
      total: 452292,
      status: 'completed',
    },
    {
      date: '2024-04-15',
      principal: 416667,
      interest: 35625,
      total: 452292,
      status: 'pending',
    },
    {
      date: '2024-05-15',
      principal: 416667,
      interest: 35625,
      total: 452292,
      status: 'pending',
    },
    {
      date: '2024-06-15',
      principal: 416667,
      interest: 35625,
      total: 452292,
      status: 'pending',
    },
    {
      date: '2024-07-15',
      principal: 416667,
      interest: 35625,
      total: 452292,
      status: 'pending',
    },
    {
      date: '2024-08-15',
      principal: 416667,
      interest: 35625,
      total: 452292,
      status: 'pending',
    },
    {
      date: '2024-09-15',
      principal: 416667,
      interest: 35625,
      total: 452292,
      status: 'pending',
    },
    {
      date: '2024-10-15',
      principal: 416667,
      interest: 35625,
      total: 452292,
      status: 'pending',
    },
    {
      date: '2024-11-15',
      principal: 416667,
      interest: 35625,
      total: 452292,
      status: 'pending',
    },
    {
      date: '2024-12-15',
      principal: 416667,
      interest: 35625,
      total: 452292,
      status: 'pending',
    },
    {
      date: '2025-01-15',
      principal: 416668,
      interest: 35625,
      total: 452293,
      status: 'pending',
    },
  ];

  const paymentHistory: PaymentHistory[] = [
    {
      date: '2024-02-14',
      principal: 416667,
      interest: 35625,
      taxWithheld: 5478,
      netAmount: 446814,
    },
    {
      date: '2024-03-14',
      principal: 416667,
      interest: 35625,
      taxWithheld: 5478,
      netAmount: 446814,
    },
  ];

  const statusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      active: { color: 'bg-blue-100 text-blue-800', label: '진행중', icon: <CheckCircle size={18} /> },
      pending: { color: 'bg-gray-100 text-gray-800', label: '예정', icon: <Calendar size={18} /> },
      completed: { color: 'bg-green-100 text-green-800', label: '완료', icon: <CheckCircle size={18} /> },
      overdue: { color: 'bg-red-100 text-red-800', label: '연체', icon: <AlertCircle size={18} /> },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard/investments">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{investment.productName}</h1>
            <p className="text-gray-600">투자 상세 정보</p>
          </div>
        </div>

        {/* Investment Summary */}
        <Card className="p-8 mb-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-2">투자액</p>
              <p className="text-2xl font-bold text-blue-600">₩{(investment.amount / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-2">연 이율</p>
              <p className="text-2xl font-bold text-blue-600">{investment.interestRate}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-2">투자 기간</p>
              <p className="text-2xl font-bold text-blue-600">{investment.period}개월</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-2">누적 수익</p>
              <p className="text-2xl font-bold text-green-600">₩{(investment.returnsToDate / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </Card>

        {/* Investment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              투자 정보
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">투자 일자</span>
                <span className="font-medium text-gray-900">{investment.investmentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상태</span>
                {statusBadge(investment.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">예상 종료일</span>
                <span className="font-medium text-gray-900">2025-01-15</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-green-600" />
              수익 정보
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">예상 이자</span>
                <span className="font-medium text-gray-900">₩{((investment.amount * investment.interestRate * investment.period) / 100 / 12 / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">세금</span>
                <span className="font-medium text-red-600">-₩{((investment.amount * investment.interestRate * investment.period) / 100 / 12 * 0.154 / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="font-semibold text-gray-900">실수령액</span>
                <span className="font-bold text-green-600">₩{((investment.amount * investment.interestRate * investment.period) / 100 / 12 * 0.846 / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Percent size={20} className="text-orange-600" />
              담보 정보
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">LTV</span>
                <p className="font-semibold text-gray-900">{investment.borrowerInfo.ltv}%</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">담보 가치</span>
                <p className="font-semibold text-gray-900">₩{(investment.borrowerInfo.collateralValue / 1000000).toFixed(0)}M</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-xs text-gray-600">위험도</span>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded ${i < 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Repayment Schedule */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={24} className="text-blue-600" />
            상환 일정
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">상환 예정일</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">원금</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">이자</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">합계</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">상태</th>
                </tr>
              </thead>
              <tbody>
                {repaymentSchedule.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 ${item.status === 'completed' ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{item.date}</td>
                    <td className="px-4 py-3 text-right text-gray-900">₩{(item.principal / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-right text-gray-900">₩{(item.interest / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">₩{(item.total / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payment History */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle size={24} className="text-green-600" />
            상환 내역
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">상환 일자</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">원금</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">이자</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">세금</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">실수령액</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.date}</td>
                    <td className="px-4 py-3 text-right text-gray-900">₩{(item.principal / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-right text-gray-900">₩{(item.interest / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-right text-red-600">-₩{(item.taxWithheld / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      ₩{(item.netAmount / 1000).toFixed(0)}K
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Tax Withholding Summary */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">세금 공제 요약</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">총 예정 이자</p>
              <p className="text-2xl font-bold text-gray-900">₩{((investment.amount * investment.interestRate * investment.period) / 100 / 12 / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">예상 세금</p>
              <p className="text-2xl font-bold text-red-600">₩{((investment.amount * investment.interestRate * investment.period) / 100 / 12 * 0.154 / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">실수령 예정액</p>
              <p className="text-2xl font-bold text-green-600">₩{((investment.amount * investment.interestRate * investment.period) / 100 / 12 * 0.846 / 1000).toFixed(0)}K</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 italic">* 세금은 15.4% (소득세 15% + 지방세 0.4%)로 계산됩니다.</p>
        </Card>

        {/* Documents */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            투자 증서 및 서류
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">투자 증서</p>
                  <p className="text-sm text-gray-600">PDF 형식</p>
                </div>
              </div>
              <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
                <Download size={18} />
                다운로드
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">상품 설명서</p>
                  <p className="text-sm text-gray-600">PDF 형식</p>
                </div>
              </div>
              <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
                <Download size={18} />
                다운로드
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">거래명세서</p>
                  <p className="text-sm text-gray-600">PDF 형식</p>
                </div>
              </div>
              <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
                <Download size={18} />
                다운로드
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
