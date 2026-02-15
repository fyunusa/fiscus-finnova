'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input } from '@/components/ui';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  ChevronRight,
  X,
  Filter,
  Clock,
  CheckCircle,
  Heart,
} from 'lucide-react';

interface Investment {
  id: string;
  productName: string;
  investmentDate: string;
  amount: number;
  interestRate: number;
  period: number;
  status: 'active' | 'repaying' | 'completed' | 'overdue';
  returnsToDate: number;
}

interface Payment {
  id: string;
  paymentDate: string;
  productName: string;
  principal: number;
  interest: number;
  taxWithheld: number;
  netAmount: number;
  status: 'pending' | 'completed' | 'failed';
}

interface DepositHistory {
  id: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  status: 'completed' | 'pending';
}

interface FavoriteProduct {
  id: string;
  name: string;
  rate: number;
  period: number;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number;
  fundingProgress: number;
}

export default function InvestmentDashboardPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'payments' | 'deposits' | 'favorites'>('history');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showQuickInvestModal, setShowQuickInvestModal] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteProduct | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [pin, setPin] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Summary Cards Data
  const totalInvested = 15250000;
  const activeInvestmentsCount = 8;
  const totalReturns = 487500;
  const expectedMonthlyReturns = 42500;
  const availableBalance = 2345678;

  // Investment History
  const investments: Investment[] = [
    {
      id: '1',
      productName: '강남역 아파트 담보대출',
      investmentDate: '2024-01-15',
      amount: 5000000,
      interestRate: 8.5,
      period: 12,
      status: 'active',
      returnsToDate: 125000,
    },
    {
      id: '2',
      productName: '신용카드 수취권 유동화',
      investmentDate: '2024-02-01',
      amount: 3000000,
      interestRate: 9.2,
      period: 6,
      status: 'active',
      returnsToDate: 87500,
    },
    {
      id: '3',
      productName: '중소기업 운영자금 대출',
      investmentDate: '2024-02-10',
      amount: 2500000,
      interestRate: 10.5,
      period: 12,
      status: 'active',
      returnsToDate: 45000,
    },
    {
      id: '4',
      productName: '서울 오피스텔 담보대출',
      investmentDate: '2023-12-20',
      amount: 4750000,
      interestRate: 8.2,
      period: 12,
      status: 'repaying',
      returnsToDate: 230000,
    },
  ];

  // Payment Status
  const upcomingPayments: Payment[] = [
    {
      id: '1',
      paymentDate: '2024-03-15',
      productName: '강남역 아파트 담보대출',
      principal: 416667,
      interest: 35625,
      taxWithheld: 5478,
      netAmount: 446814,
      status: 'pending',
    },
    {
      id: '2',
      paymentDate: '2024-03-20',
      productName: '신용카드 수취권 유동화',
      principal: 500000,
      interest: 23000,
      taxWithheld: 3542,
      netAmount: 519458,
      status: 'pending',
    },
  ];

  const paymentHistory: Payment[] = [
    {
      id: '1',
      paymentDate: '2024-02-14',
      productName: '서울 오피스텔 담보대출',
      principal: 395833,
      interest: 32500,
      taxWithheld: 5005,
      netAmount: 423328,
      status: 'completed',
    },
    {
      id: '2',
      paymentDate: '2024-02-01',
      productName: '강남역 아파트 담보대출',
      principal: 416667,
      interest: 35625,
      taxWithheld: 5478,
      netAmount: 446814,
      status: 'completed',
    },
  ];

  // Deposit History
  const depositHistory: DepositHistory[] = [
    {
      id: '1',
      date: '2024-02-10',
      amount: 1000000,
      type: 'deposit',
      status: 'completed',
    },
    {
      id: '2',
      date: '2024-02-05',
      amount: 500000,
      type: 'withdrawal',
      status: 'completed',
    },
    {
      id: '3',
      date: '2024-01-28',
      amount: 2000000,
      type: 'deposit',
      status: 'completed',
    },
  ];

  // Favorite Products
  const favoriteProducts: FavoriteProduct[] = [
    {
      id: '1',
      name: '판교 오피스 담보대출',
      rate: 8.7,
      period: 12,
      riskLevel: 'low',
      expectedReturn: 870000,
      fundingProgress: 78,
    },
    {
      id: '2',
      name: '이커머스 매출채권 유동화',
      rate: 9.5,
      period: 6,
      riskLevel: 'medium',
      expectedReturn: 475000,
      fundingProgress: 92,
    },
    {
      id: '3',
      name: '카페 프랜차이즈 운영자금',
      rate: 11.2,
      period: 12,
      riskLevel: 'high',
      expectedReturn: 1120000,
      fundingProgress: 45,
    },
  ];

  const statusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      active: { color: 'bg-blue-100 text-blue-800', label: '진행중' },
      repaying: { color: 'bg-amber-100 text-amber-800', label: '상환중' },
      completed: { color: 'bg-green-100 text-green-800', label: '완료' },
      overdue: { color: 'bg-red-100 text-red-800', label: '연체' },
      pending: { color: 'bg-gray-100 text-gray-800', label: '예정' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const riskBadge = (level: string) => {
    const riskConfig: Record<string, { color: string; label: string }> = {
      low: { color: 'bg-green-100 text-green-800', label: '저위험' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: '중위험' },
      high: { color: 'bg-red-100 text-red-800', label: '고위험' },
    };
    const config = riskConfig[level] || riskConfig.medium;
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleQuickInvest = (product: FavoriteProduct) => {
    setSelectedFavorite(product);
    setShowQuickInvestModal(true);
  };

  const handleWithdrawal = () => {
    if (withdrawalAmount && pin.length === 4) {
      setSuccessMessage('출금 요청이 완료되었습니다. 1-2 영업일 내 처리됩니다.');
      setTimeout(() => {
        setShowWithdrawalModal(false);
        setWithdrawalAmount('');
        setPin('');
        setShowPinVerification(false);
        setSuccessMessage('');
      }, 2000);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')}>
              <X size={20} />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">투자 대시보드</h1>
          <p className="text-gray-600">당신의 포트폴리오와 투자 현황을 한눈에 확인하세요</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">총 투자액</span>
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">₩{(totalInvested / 1000000).toFixed(1)}M</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">진행 중 투자</span>
              <Target className="text-purple-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeInvestmentsCount}개</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">누적 수익</span>
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">₩{(totalReturns / 1000).toFixed(0)}K</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">예상 월수익</span>
              <Calendar className="text-orange-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">₩{(expectedMonthlyReturns / 1000).toFixed(1)}K</p>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 font-medium ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              투자 내역
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-4 font-medium ${
                activeTab === 'payments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              상환 현황
            </button>
            <button
              onClick={() => setActiveTab('deposits')}
              className={`pb-4 font-medium ${
                activeTab === 'deposits'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              잔액 관리
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`pb-4 font-medium ${
                activeTab === 'favorites'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              관심상품
            </button>
          </div>
        </div>

        {/* Tab Content */}

        {/* Investment History Tab (VDS_1T) */}
        {activeTab === 'history' && (
          <div>
            <div className="mb-6 flex gap-4">
              <Button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
              >
                <Filter size={18} />
                필터
              </Button>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">상품명</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">투자 일자</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900">투자액</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900">이율</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900">기간</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">상태</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900">수익</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900">상세</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv) => (
                      <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900 font-medium">{inv.productName}</td>
                        <td className="px-6 py-4 text-gray-600">{inv.investmentDate}</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                          ₩{(inv.amount / 1000000).toFixed(1)}M
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900">{inv.interestRate.toFixed(1)}%</td>
                        <td className="px-6 py-4 text-right text-gray-900">{inv.period}개월</td>
                        <td className="px-6 py-4">{statusBadge(inv.status)}</td>
                        <td className="px-6 py-4 text-right text-green-600 font-medium">
                          ₩{(inv.returnsToDate / 1000).toFixed(0)}K
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/dashboard/investments/${inv.id}`}>
                            <ChevronRight size={18} className="text-blue-600" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Payment Status Tab (VDS_2T) */}
        {activeTab === 'payments' && (
          <div className="space-y-8">
            {/* Upcoming Payments */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-orange-600" />
                예정된 상환
              </h3>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상환 예정일</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상품명</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">원금</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">이자</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">세금</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">실수령액</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingPayments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-900 font-medium">{payment.paymentDate}</td>
                          <td className="px-6 py-4 text-gray-600">{payment.productName}</td>
                          <td className="px-6 py-4 text-right text-gray-900">
                            ₩{(payment.principal / 1000).toFixed(0)}K
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900">
                            ₩{(payment.interest / 1000).toFixed(0)}K
                          </td>
                          <td className="px-6 py-4 text-right text-red-600">
                            -₩{(payment.taxWithheld / 1000).toFixed(0)}K
                          </td>
                          <td className="px-6 py-4 text-right text-green-600 font-medium">
                            ₩{(payment.netAmount / 1000).toFixed(0)}K
                          </td>
                          <td className="px-6 py-4">{statusBadge(payment.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Payment History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                상환 내역
              </h3>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상환 일자</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상품명</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">원금</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">이자</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">세금</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">실수령액</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-900 font-medium">{payment.paymentDate}</td>
                          <td className="px-6 py-4 text-gray-600">{payment.productName}</td>
                          <td className="px-6 py-4 text-right text-gray-900">
                            ₩{(payment.principal / 1000).toFixed(0)}K
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900">
                            ₩{(payment.interest / 1000).toFixed(0)}K
                          </td>
                          <td className="px-6 py-4 text-right text-red-600">
                            -₩{(payment.taxWithheld / 1000).toFixed(0)}K
                          </td>
                          <td className="px-6 py-4 text-right text-green-600 font-medium">
                            ₩{(payment.netAmount / 1000).toFixed(0)}K
                          </td>
                          <td className="px-6 py-4">{statusBadge(payment.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Deposit Management Tab (VDS_3T) */}
        {activeTab === 'deposits' && (
          <div className="space-y-6">
            {/* Balance Display */}
            <Card className="p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <p className="text-blue-100 mb-2">가용 잔액</p>
              <h2 className="text-4xl font-bold mb-8">₩{(availableBalance / 1000000).toFixed(2)}M</h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-blue-100 text-sm mb-2">입금 계좌</p>
                  <p className="font-mono text-lg">1002-123-456789</p>
                  <p className="text-blue-100 text-sm mt-2">신한은행</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-2">예금주</p>
                  <p className="font-semibold text-lg">김철수</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText('1002-123-456789');
                    setSuccessMessage('계좌 번호가 복사되었습니다.');
                    setTimeout(() => setSuccessMessage(''), 2000);
                  }}
                  className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                >
                  계좌 복사
                </Button>
                <Button
                  onClick={() => setShowWithdrawalModal(true)}
                  className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                >
                  출금
                </Button>
              </div>
            </Card>

            {/* Deposit History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">입출금 내역</h3>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">일자</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">유형</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">금액</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depositHistory.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-900 font-medium">{item.date}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                item.type === 'deposit'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.type === 'deposit' ? '입금' : '출금'}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-semibold ${
                              item.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {item.type === 'deposit' ? '+' : '-'}₩{(item.amount / 1000000).toFixed(1)}M
                          </td>
                          <td className="px-6 py-4">{statusBadge(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Favorites Tab (VDS_4T) */}
        {activeTab === 'favorites' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.map((product) => (
                <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex-1">{product.name}</h3>
                    <Heart size={20} className="text-red-500 fill-red-500" />
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">연 이율</span>
                      <span className="font-semibold text-blue-600">{product.rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">투자 기간</span>
                      <span className="font-semibold text-gray-900">{product.period}개월</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">위험도</span>
                      {riskBadge(product.riskLevel)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">예상 수익</span>
                      <span className="font-semibold text-green-600">
                        ₩{(product.expectedReturn / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                      <span>펀딩 진행률</span>
                      <span>{product.fundingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${product.fundingProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleQuickInvest(product)}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                  >
                    빠른 투자
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal (VDS_1T_2P) */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">투자 내역 필터</h2>
              <button onClick={() => setShowFilterModal(false)}>
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">기간</label>
                <div className="flex gap-2">
                  <Input type="date" placeholder="시작일" className="flex-1" />
                  <Input type="date" placeholder="종료일" className="flex-1" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">상태</label>
                <div className="space-y-2">
                  {['진행중', '상환중', '완료', '연체'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input type="checkbox" className="rounded mr-2" />
                      <span className="text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">상품 유형</label>
                <div className="space-y-2">
                  {['아파트', '신용카드', '중소기업'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input type="checkbox" className="rounded mr-2" />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">금액 범위</label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="최소" className="flex-1" />
                  <Input type="number" placeholder="최대" className="flex-1" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setShowFilterModal(false)} className="flex-1 bg-gray-100 text-gray-900">
                  닫기
                </Button>
                <Button
                  onClick={() => {
                    setSuccessMessage('필터가 적용되었습니다.');
                    setShowFilterModal(false);
                    setTimeout(() => setSuccessMessage(''), 2000);
                  }}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  필터 적용
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Withdrawal Modal (VDS_3T_1P) */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">출금 신청</h2>
              <button onClick={() => setShowWithdrawalModal(false)}>
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">가용 잔액</p>
                <p className="text-2xl font-bold text-blue-600">₩{(availableBalance / 1000000).toFixed(2)}M</p>
              </div>

              {!showPinVerification ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">출금액</label>
                    <Input
                      type="number"
                      placeholder="금액 입력"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={() => setWithdrawalAmount(availableBalance.toString())}
                    className="w-full bg-gray-100 text-gray-900 mb-2"
                  >
                    전액
                  </Button>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">출금 계좌</p>
                    <p className="font-mono text-gray-900">국민은행 123-456-789012</p>
                    <p className="text-sm text-gray-600 mt-2">예금주: 김철수</p>
                  </div>

                  <p className="text-xs text-gray-500 italic">처리 기간: 1-2 영업일</p>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => setShowWithdrawalModal(false)} className="flex-1 bg-gray-100 text-gray-900">
                      취소
                    </Button>
                    <Button
                      onClick={() => setShowPinVerification(true)}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                      disabled={!withdrawalAmount}
                    >
                      계속
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">출금액</p>
                    <p className="text-2xl font-bold text-gray-900">₩{(parseFloat(withdrawalAmount) / 1000000).toFixed(2)}M</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">PIN 번호</label>
                    <Input
                      type="password"
                      placeholder="4자리 PIN 입력"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.slice(0, 4))}
                      className="w-full text-center text-2xl tracking-widest"
                    />
                  </div>

                  <p className="text-xs text-gray-500">안전한 거래를 위해 PIN 번호가 필요합니다.</p>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setShowPinVerification(false)}
                      className="flex-1 bg-gray-100 text-gray-900"
                    >
                      뒤로
                    </Button>
                    <Button
                      onClick={handleWithdrawal}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                      disabled={pin.length !== 4}
                    >
                      확인
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Quick Invest Modal (VDS_4T_1P) */}
      {showQuickInvestModal && selectedFavorite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">빠른 투자</h2>
              <button onClick={() => setShowQuickInvestModal(false)}>
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">상품명</p>
                <p className="font-semibold text-gray-900">{selectedFavorite.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">연 이율</p>
                  <p className="font-bold text-lg text-blue-600">{selectedFavorite.rate.toFixed(1)}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">투자 기간</p>
                  <p className="font-bold text-lg text-gray-900">{selectedFavorite.period}개월</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">투자액</label>
                <Input type="number" placeholder="금액 입력" className="w-full" />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700">
                  ⚠️ 이 투자상품은 손실 위험이 있습니다. 투자 전 충분히 검토하세요.
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded mr-2" />
                  <span className="text-sm text-gray-700">위험 공시에 동의합니다</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowQuickInvestModal(false)}
                  className="flex-1 bg-gray-100 text-gray-900"
                >
                  취소
                </Button>
                <Button
                  onClick={() => {
                    setSuccessMessage('투자가 완료되었습니다.');
                    setShowQuickInvestModal(false);
                    setSelectedFavorite(null);
                    setTimeout(() => setSuccessMessage(''), 2000);
                  }}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  투자
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
}
