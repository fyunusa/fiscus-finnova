'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input, Alert } from '@/components/ui';
import { Filter, X, DollarSign, Target, TrendingUp, Calendar, Clock, CheckCircle, Heart } from 'lucide-react';
import {
  getInvestmentSummary,
  getRepaymentStatus,
  getInvestmentHistory,
  getFavoriteInvestments,
  type InvestmentSummary,
  type RepaymentStatus,
  type InvestmentHistory,
  type FavoriteInvestment,
} from '@/services/dashboard.service';
import {
  getVirtualAccountInfo,
  getTransactionHistory,
  recordWithdrawal,
  type VirtualAccountInfo,
  type DepositHistory,
} from '@/services/virtual-account.service';

export default function InvestmentDashboardPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'payments' | 'deposits' | 'favorites'>('history');
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [repaymentStatus, setRepaymentStatus] = useState<RepaymentStatus | null>(null);
  const [investmentHistory, setInvestmentHistory] = useState<InvestmentHistory | null>(null);
  const [virtualAccountInfo, setVirtualAccountInfo] = useState<VirtualAccountInfo | null>(null);
  const [depositHistory, setDepositHistory] = useState<DepositHistory | null>(null);
  const [favoriteInvestments, setFavoriteInvestments] = useState<FavoriteInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [pin, setPin] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryResponse, repaymentResponse, historyResponse, accountResponse, transactionResponse, favoritesResponse] = await Promise.all([
        getInvestmentSummary(),
        getRepaymentStatus(),
        getInvestmentHistory({
          page: 1,
          limit: 10,
          ...filters,
        }),
        getVirtualAccountInfo(),
        getTransactionHistory(),
        getFavoriteInvestments(),
      ]);

      console.log('Summary:', summaryResponse);
      console.log('Repayment:', repaymentResponse);
      console.log('History:', historyResponse);
      console.log('Account:', accountResponse);
      console.log('Transactions:', transactionResponse);
      console.log('Favorites:', favoritesResponse);

      setSummary(summaryResponse.data);
      setRepaymentStatus(repaymentResponse.data);
      setInvestmentHistory(historyResponse.data);
      setVirtualAccountInfo(accountResponse.data || null);
      setDepositHistory(transactionResponse.data);
      setFavoriteInvestments(favoritesResponse.data || []);
      
      console.log('State set successfully');
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = async () => {
    await fetchData();
    setShowFilterModal(false);
  };

  const statusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: '예정' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: '진행중' },
      completed: { color: 'bg-green-100 text-green-800', label: '완료' },
      overdue: { color: 'bg-red-100 text-red-800', label: '연체' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
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
            <p className="text-2xl font-bold text-gray-900">₩{summary ? (summary.totalInvestments * 10000).toLocaleString() : '—'}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">진행 중 투자</span>
              <Target className="text-purple-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary?.investmentsInProgress || 0}개</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">누적 수익</span>
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">₩{summary ? (summary.totalEarnings * 10000).toLocaleString() : '—'}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">예상 월수익</span>
              <Calendar className="text-orange-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">₩{summary ? (summary.estimatedMonthlyProfit * 10000).toLocaleString() : '—'}</p>
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

        {/* Investment History Tab */}
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
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">유형</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900">투자액</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900">이율</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">상태</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900">수익</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">로드 중...</td>
                      </tr>
                    ) : investmentHistory?.items && investmentHistory.items.length > 0 ? (
                      investmentHistory.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.investmentTitle}</td>
                          <td className="px-6 py-4 text-gray-600 text-xs uppercase">{item.type}</td>
                          <td className="px-6 py-4 text-right text-gray-900">
                            ₩{Number(item.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900">
                            {Number(item.rate ?? item.expectedRate ?? 0).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4">{statusBadge(item.status)}</td>
                          <td className="px-6 py-4 text-right font-semibold text-green-600">
                            ₩{Number(item.actualEarnings ? item.actualEarnings : item.expectedEarnings).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          투자 내역이 없습니다
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Payment Status Tab */}
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
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상환일</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상품명</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">투자액</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">예정 상환액</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">이율</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repaymentStatus?.scheduledPayments && repaymentStatus.scheduledPayments.length > 0 ? (
                        repaymentStatus.scheduledPayments.map((payment) => (
                          <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {new Date(payment.dueDate).toLocaleDateString('ko-KR')}
                            </td>
                            <td className="px-6 py-4 text-gray-600">{payment.investmentTitle}</td>
                            <td className="px-6 py-4 text-right text-gray-900">
                              ₩{Number(payment.investmentAmount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-900 font-semibold">
                              ₩{Number(payment.expectedAmount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-900">
                              {Number(payment.rate ?? 0).toFixed(1)}%
                            </td>
                            <td className="px-6 py-4">{statusBadge(payment.status)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            예정된 상환이 없습니다
                          </td>
                        </tr>
                      )}
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
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상환일</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상품명</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">투자액</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">상환액</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">이율</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repaymentStatus?.repaymentHistory && repaymentStatus.repaymentHistory.length > 0 ? (
                        repaymentStatus.repaymentHistory.map((history) => (
                          <tr key={history.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {new Date(history.repaymentDate).toLocaleDateString('ko-KR')}
                            </td>
                            <td className="px-6 py-4 text-gray-600">{history.investmentTitle}</td>
                            <td className="px-6 py-4 text-right text-gray-900">
                              ₩{Number(history.investmentAmount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right text-green-600 font-semibold">
                              ₩{Number(history.amount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-900">
                              {Number(history.rate ?? 0).toFixed(1)}%
                            </td>
                            <td className="px-6 py-4">{statusBadge(history.status)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            상환 내역이 없습니다
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Deposit Management Tab */}
        {activeTab === 'deposits' && (
        <div className="space-y-6">
          {/* Balance Display */}
          {virtualAccountInfo && (
          <Card className="p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-blue-100 mb-2">가용 잔액</p>
            <h2 className="text-4xl font-bold mb-8">₩{(virtualAccountInfo.availableBalance / 1000000).toFixed(2)}M</h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p className="text-blue-100 text-sm mb-2">입금 계좌</p>
                <p className="font-mono text-lg">{virtualAccountInfo.accountNumber}</p>
                <p className="text-blue-100 text-sm mt-2">{virtualAccountInfo.bankName || '가상계좌'}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-2">계좌명</p>
                <p className="font-semibold text-lg">{virtualAccountInfo.accountName}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(virtualAccountInfo.accountNumber);
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
          )}

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
                    {depositHistory && depositHistory.items.map((item) => (
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
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'completed' ? 'bg-green-100 text-green-800' :
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status === 'completed' ? '완료' : item.status === 'pending' ? '진행중' : '실패'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div>
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-gray-600">로드 중...</p>
            </Card>
          ) : favoriteInvestments && favoriteInvestments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteInvestments.map((product) => (
                <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex-1">{product.title}</h3>
                  <Heart size={20} className="text-red-500 fill-red-500" />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">연 이율</span>
                    <span className="font-semibold text-blue-600">{Number(product.rate).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">투자 기간</span>
                    <span className="font-semibold text-gray-900">{product.period}개월</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">위험도</span>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        product.riskLevel === 'low'
                          ? 'bg-green-100 text-green-800'
                          : product.riskLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.riskLevel === 'low' ? '저위험' : product.riskLevel === 'medium' ? '중위험' : '고위험'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">모금액</span>
                    <span className="font-semibold text-green-600">
                      ₩{Number(product.fundingCurrent).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                    <span>펀딩 진행률</span>
                    <span>{Math.min(Number(product.fundingPercent), 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(Math.max(0, Number(product.fundingPercent)), 100)}%` }}
                    ></div>
                  </div>
                </div>

                <Button
                  onClick={() => setSuccessMessage('투자 페이지로 이동합니다.')}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                >
                  투자하기
                </Button>
              </Card>
            ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-gray-500 text-lg">관심상품이 없습니다</p>
              <p className="text-gray-400 text-sm mt-2">다양한 투자 상품을 보며 관심상품으로 등록해보세요</p>
            </Card>
          )}
        </div>
      )}

        {/* Withdrawal Modal */}
        {showWithdrawalModal && virtualAccountInfo && (
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
                <p className="text-2xl font-bold text-blue-600">₩{(virtualAccountInfo.availableBalance / 1000000).toFixed(2)}M</p>
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
                    onClick={() => setWithdrawalAmount(virtualAccountInfo.availableBalance.toString())}
                    className="w-full bg-gray-100 text-gray-900 mb-2"
                  >
                    전액
                  </Button>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">가상 계좌</p>
                    <p className="font-mono text-gray-900">{virtualAccountInfo.accountNumber}</p>
                    <p className="text-sm text-gray-600 mt-2">{virtualAccountInfo.accountName}</p>
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
                      onClick={async () => {
                        if (pin.length === 4) {
                          try {
                            const result = await recordWithdrawal(
                              parseFloat(withdrawalAmount),
                              pin,
                              '출금'
                            );
                            if (result.success) {
                              setSuccessMessage('출금 요청이 완료되었습니다. 1-2 영업일 내 처리됩니다.');
                              setTimeout(() => {
                                setShowWithdrawalModal(false);
                                setWithdrawalAmount('');
                                setPin('');
                                setShowPinVerification(false);
                                setSuccessMessage('');
                                fetchData();
                              }, 2000);
                            }
                          } catch (error) {
                            console.error('출금 요청 실패:', error);
                            setError('출금 요청 중 오류가 발생했습니다.');
                          }
                        }
                      }}
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
                <label className="block text-sm font-medium text-gray-900 mb-2">상태</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                >
                  <option value="">모든 상태</option>
                  <option value="pending">예정</option>
                  <option value="confirmed">진행중</option>
                  <option value="completed">완료</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">유형</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                >
                  <option value="">모든 유형</option>
                  <option value="APARTMENT">아파트</option>
                  <option value="CREDIT_CARD">신용카드</option>
                  <option value="BUSINESS_LOAN">사업자금</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">시작일</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">종료일</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setShowFilterModal(false)} className="flex-1 bg-gray-100 text-gray-900">
                  닫기
                </Button>
                <Button
                  onClick={applyFilters}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  필터 적용
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      </div>
    </Layout>
  );
}
