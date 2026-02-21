'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import Link from 'next/link';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Copy,
  Loader,
  RefreshCw,
  ChevronRight,
  CreditCard,
  Shield,
  Snowflake,
} from 'lucide-react';
import * as vaService from '@/services/virtual-account.service';
import type { VirtualAccountInfo, DepositHistoryItem } from '@/services/virtual-account.service';

type DepositTab = 'overview' | 'deposit' | 'history';

export default function DepositsPage() {
  const [activeTab, setActiveTab] = useState<DepositTab>('overview');
  const [accountInfo, setAccountInfo] = useState<VirtualAccountInfo | null>(null);
  const [transactions, setTransactions] = useState<DepositHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDescription, setDepositDescription] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Quick amount buttons
  const quickAmounts = [10, 50, 100, 500, 1000];

  const fetchAccountInfo = async () => {
    try {
      setLoading(true);
      const res = await vaService.getVirtualAccountInfo();
      if (res.success && res.data) {
        setAccountInfo(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch account info:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTxLoading(true);
      const res = await vaService.getTransactionHistory();
      if (res.success && res.data) {
        setTransactions(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
    fetchTransactions();
  }, []);

  // Handle payment callback (success/failed)
  useEffect(() => {
    const handlePaymentCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const paymentStatus = searchParams.get('payment');
      const orderId = searchParams.get('orderId');

      if (!paymentStatus || !orderId) return;

      try {
        if (paymentStatus === 'success') {
          // Extract paymentKey from URL hash or sessionStorage
          const paymentKey = sessionStorage.getItem(`payment_key_${orderId}`);
          const amountStr = sessionStorage.getItem(`deposit_amount_${orderId}`);
          const amount = amountStr ? parseInt(amountStr) : 0;

          if (paymentKey && amount > 0) {
            console.log('✅ Confirming payment:', { orderId, paymentKey, amount });
            
            const confirmResult = await vaService.confirmDepositPayment({
              paymentKey,
              orderId,
              amount,
            });

            if (confirmResult.success) {
              setDepositSuccess(true);
              setDepositAmount('');
              setDepositDescription('');
              setError('');

              // Clear stored data
              sessionStorage.removeItem(`payment_key_${orderId}`);
              sessionStorage.removeItem(`deposit_amount_${orderId}`);

              // Refresh data
              await fetchAccountInfo();
              await fetchTransactions();

              // Clean URL
              window.history.replaceState({}, '', '/dashboard/deposits');

              setTimeout(() => setDepositSuccess(false), 4000);
            } else {
              throw new Error(confirmResult.error || '결제 확인 실패');
            }
          }
        } else if (paymentStatus === 'failed') {
          setError('결제가 실패했습니다. 다시 시도해주세요.');
          window.history.replaceState({}, '', '/dashboard/deposits');
        }
      } catch (err: any) {
        console.error('❌ Payment callback error:', err);
        setError(err.message || '결제 처리 중 오류가 발생했습니다.');
        window.history.replaceState({}, '', '/dashboard/deposits');
      }
    };

    handlePaymentCallback();
  }, []);

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount) * 10000;
    if (!amount || amount <= 0) {
      setError('입금할 금액을 입력해주세요.');
      return;
    }
    if (amount < 10000) {
      setError('최소 입금 금액은 1만 원입니다.');
      return;
    }

    try {
      setIsDepositing(true);
      setError('');
      
      // Step 1: Initiate payment with Toss
      console.log('💳 Initiating Toss payment for deposit:', { amount });
      
      const paymentInitiation = await vaService.initiateDepositPayment({
        amount,
        description: depositDescription || '가상계좌 입금',
      });

      if (!paymentInitiation.success) {
        throw new Error(paymentInitiation.error || 'Failed to initiate payment');
      }

      if (!paymentInitiation.checkoutUrl) {
        throw new Error('No checkout URL received from payment service');
      }

      if (!paymentInitiation.paymentKey || !paymentInitiation.orderId) {
        throw new Error('Payment key or order ID not received');
      }

      // Step 2: Store payment details in sessionStorage for callback handling
      sessionStorage.setItem(`payment_key_${paymentInitiation.orderId}`, paymentInitiation.paymentKey);
      sessionStorage.setItem(`deposit_amount_${paymentInitiation.orderId}`, amount.toString());
      
      // Step 3: Redirect to Toss checkout
      console.log('✅ Payment initiated, redirecting to Toss checkout:', paymentInitiation.checkoutUrl);
      window.location.href = paymentInitiation.checkoutUrl;
    } catch (err: any) {
      setError(err.message || '입금 처리 중 오류가 발생했습니다.');
      setIsDepositing(false);
    }
  };

  const handleCopyAccount = () => {
    if (accountInfo?.accountNumber) {
      navigator.clipboard.writeText(accountInfo.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '대시보드', href: '/dashboard' },
    { label: '입출금 관리', href: '#' },
  ];

  const tabs: { id: DepositTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '계좌 현황', icon: <Wallet className="w-4 h-4" /> },
    { id: 'deposit', label: '입금하기', icon: <Plus className="w-4 h-4" /> },
    { id: 'history', label: '거래 내역', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-white/60 mb-6">
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={item.href}>
                  {index > 0 && <span className="text-white/30">/</span>}
                  <Link
                    href={item.href}
                    className={index === breadcrumbItems.length - 1
                      ? "text-white font-medium"
                      : "hover:text-white/80"
                    }
                  >
                    {item.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">가상계좌 관리</h1>
                <p className="text-white/70 mt-1">투자 자금을 관리하고 입출금 내역을 확인하세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content — overlaps the hero */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
          {/* Balance Card */}
          {loading ? (
            <Card className="p-8 mb-8 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <Loader className="w-6 h-6 text-blue-600 animate-spin mr-3" />
              <span className="text-gray-500">계좌 정보 불러오는 중...</span>
            </Card>
          ) : accountInfo ? (
            <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
              <div className="p-6 sm:p-8">
                {/* Account number row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <CreditCard className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-mono text-slate-700">{accountInfo.accountNumber}</span>
                    </div>
                    <button
                      onClick={handleCopyAccount}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      title="계좌번호 복사"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                    {copied && <span className="text-xs text-green-600 font-medium animate-pulse">복사됨!</span>}
                  </div>
                  <button
                    onClick={() => { fetchAccountInfo(); fetchTransactions(); }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="새로고침"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Balance + Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Main balance */}
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-500 mb-1">투자 가능 잔액</p>
                    <p className="text-4xl font-bold text-slate-900 tracking-tight">
                      {Number(accountInfo.availableBalance).toLocaleString()}
                      <span className="text-lg font-normal text-slate-500 ml-1">원</span>
                    </p>
                  </div>

                    {/* Frozen */}
                    <div className="bg-indigo-50/80 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Snowflake className="w-3.5 h-3.5 text-indigo-500" />
                        <p className="text-xs font-medium text-indigo-600">투자 중 동결</p>
                      </div>
                      <p className="text-xl font-bold text-indigo-900">
                        {Number(accountInfo.frozenBalance).toLocaleString()}
                        <span className="text-xs font-normal text-indigo-500 ml-0.5">원</span>
                      </p>
                    </div>

                    {/* Total deposited */}
                    <div className="bg-green-50/80 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                        <p className="text-xs font-medium text-green-600">총 입금액</p>
                      </div>
                    <p className="text-xl font-bold text-green-900">
                      {Number(accountInfo.totalDeposited).toLocaleString()}
                      <span className="text-xs font-normal text-green-500 ml-0.5">원</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">가상계좌가 없습니다</h3>
                <p className="text-slate-500 mb-6">투자를 시작하려면 먼저 가상계좌를 개설해주세요.</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-sm">
                  🏦 가상계좌 개설하기
                </Button>
              </div>
            </Card>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm mb-6 border border-white/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className="group bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-white/50 hover:shadow-lg hover:border-blue-200 transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
                      <ArrowDownCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">입금하기</p>
                      <p className="text-sm text-slate-500">가상계좌에 자금 충전</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>

                <Link href="/investment" className="group bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-white/50 hover:shadow-lg hover:border-green-200 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">투자하기</p>
                      <p className="text-sm text-slate-500">투자 상품 둘러보기</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-green-500 transition-colors" />
                  </div>
                </Link>

                <button
                  onClick={() => setActiveTab('history')}
                  className="group bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-white/50 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl flex items-center justify-center transition-colors">
                      <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">거래 내역</p>
                      <p className="text-sm text-slate-500">입출금 내역 확인</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-indigo-500 transition-colors" />
                  </div>
                </button>
              </div>

              {/* Recent Transactions */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-sm border-0 rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">최근 거래 내역</h3>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      전체 보기 →
                    </button>
                  </div>

                  {txLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                      <span className="text-slate-500 text-sm">거래 내역 불러오는 중...</span>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-1">
                      {transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                              {tx.type === 'deposit' ? (
                                <ArrowDownCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <ArrowUpCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {tx.type === 'deposit' ? '입금' : '출금'}
                              </p>
                              <p className="text-xs text-slate-400">{formatDate(tx.date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {tx.type === 'deposit' ? '+' : '-'}{Number(tx.amount).toLocaleString()}원
                            </p>
                            <div className="flex items-center gap-1 justify-end">
                              {tx.status === 'completed' ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : tx.status === 'failed' ? (
                                <XCircle className="w-3 h-3 text-red-500" />
                              ) : (
                                <Clock className="w-3 h-3 text-yellow-500" />
                              )}
                              <span className={`text-xs ${tx.status === 'completed' ? 'text-green-600' :
                                  tx.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                {tx.status === 'completed' ? '완료' : tx.status === 'failed' ? '실패' : '대기'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-500 text-sm">아직 거래 내역이 없습니다</p>
                      <button
                        onClick={() => setActiveTab('deposit')}
                        className="text-blue-600 font-medium text-sm mt-2 hover:text-blue-700"
                      >
                        첫 입금하기 →
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Info cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">안전한 자금 관리</h4>
                  </div>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    가상계좌의 자금은 P2P 투자자 예치금 관리 규정에 따라 안전하게 분리 보관됩니다.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">투자 수익금 자동 입금</h4>
                  </div>
                  <p className="text-sm text-green-700 leading-relaxed">
                    투자 수익금과 원금 상환 시 가상계좌로 자동 입금됩니다. 언제든 출금이 가능합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deposit' && (
            <Card className="bg-white/90 backdrop-blur-sm shadow-sm border-0 rounded-xl overflow-hidden">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-1">가상계좌 입금</h3>
                <p className="text-sm text-slate-500 mb-8">투자를 위한 자금을 가상계좌에 충전하세요</p>

                {/* Success Message */}
                {depositSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800">입금이 완료되었습니다!</p>
                      <p className="text-sm text-green-600">잔액이 업데이트 되었습니다.</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    입금 금액
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => { setDepositAmount(e.target.value); setError(''); }}
                      placeholder="0"
                      className="w-full px-4 py-4 text-2xl font-bold text-slate-900 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-slate-400">만원</span>
                  </div>
                  {depositAmount && (
                    <p className="text-sm text-slate-500 mt-2 ml-1">
                      = {(parseInt(depositAmount) * 10000).toLocaleString()}원
                    </p>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div className="mb-6">
                  <label className="block text-xs font-medium text-slate-500 mb-2">빠른 금액 선택</label>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => { setDepositAmount(amount.toString()); setError(''); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${depositAmount === amount.toString()
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                      >
                        {amount >= 100 ? `${amount / 100}억` : `${amount}만`}원
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    메모 <span className="text-slate-400 font-normal">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={depositDescription}
                    onChange={(e) => setDepositDescription(e.target.value)}
                    placeholder="예: 3월 투자 자금"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm transition-all"
                  />
                </div>

                {/* Summary */}
                {depositAmount && parseInt(depositAmount) > 0 && (
                  <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">입금 요약</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">입금 금액</span>
                        <span className="font-bold text-slate-900">{(parseInt(depositAmount) * 10000).toLocaleString()}원</span>
                      </div>
                      {accountInfo && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">현재 잔액</span>
                            <span className="text-slate-700">{Number(accountInfo.availableBalance).toLocaleString()}원</span>
                          </div>
                          <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                            <span className="text-slate-500">입금 후 잔액</span>
                            <span className="font-bold text-blue-600">
                              {(Number(accountInfo.availableBalance) + parseInt(depositAmount) * 10000).toLocaleString()}원
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleDeposit}
                  disabled={isDepositing || !depositAmount || parseInt(depositAmount) <= 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white py-4 rounded-xl font-semibold text-base shadow-lg shadow-blue-200 disabled:shadow-none transition-all duration-200"
                >
                  {isDepositing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      입금 처리 중...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ArrowDownCircle className="w-5 h-5" />
                      입금하기
                    </span>
                  )}
                </Button>

                <p className="text-xs text-slate-400 text-center mt-4">
                  입금은 즉시 처리되며 가상계좌 잔액에 반영됩니다.
                </p>
              </div>
            </Card>
          )}

          {activeTab === 'history' && (
            <Card className="bg-white/90 backdrop-blur-sm shadow-sm border-0 rounded-xl overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">거래 내역</h3>
                    <p className="text-sm text-slate-500 mt-1">모든 입출금 내역을 확인하세요</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    총 {transactions.length}건
                  </Badge>
                </div>

                {txLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                    <span className="text-slate-500">거래 내역 불러오는 중...</span>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-1">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'deposit'
                              ? 'bg-gradient-to-br from-green-100 to-emerald-100'
                              : 'bg-gradient-to-br from-red-100 to-orange-100'
                            }`}>
                            {tx.type === 'deposit' ? (
                              <ArrowDownCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowUpCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {tx.type === 'deposit' ? '입금' : '출금'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDate(tx.date)} {formatTime(tx.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {tx.type === 'deposit' ? '+' : '-'}{Number(tx.amount).toLocaleString()}원
                          </p>
                          <Badge className={`text-[10px] px-2 py-0.5 font-medium rounded-full ${tx.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : tx.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {tx.status === 'completed' ? '✓ 완료' : tx.status === 'failed' ? '✗ 실패' : '⏳ 대기'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    </div>
                  ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">거래 내역이 없습니다</h4>
                    <p className="text-slate-500 text-sm mb-6">첫 입금을 하시면 이곳에 내역이 표시됩니다.</p>
                    <button
                      onClick={() => setActiveTab('deposit')}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      첫 입금하기
                    </button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
