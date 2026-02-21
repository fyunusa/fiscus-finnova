'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import { ChevronLeft, AlertCircle, Loader, Wallet } from 'lucide-react';
import * as investmentsService from '@/services/investments.service';
import { Investment } from '@/services/investments.service';
import { getVirtualAccountInfo, VirtualAccountInfo } from '@/services/virtual-account.service';

export default function InvestmentCheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Investment | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountInfo, setAccountInfo] = useState<VirtualAccountInfo | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Fetch investment detail
  useEffect(() => {
    const fetchInvestment = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await investmentsService.getInvestmentDetail(productId);
        
        if (response.success && response.data) {
          setProduct(response.data);
          setInvestmentAmount(Math.floor(response.data.minInvestment / 1000000).toString());
        } else {
          setError('투자 상품을 불러올 수 없습니다.');
        }
      } catch (err: any) {
        console.error('Error fetching investment:', err);
        setError(err.message || '투자 상품을 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchInvestment();
    }
  }, [productId]);

  // Fetch virtual account balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setBalanceLoading(true);
        const res = await getVirtualAccountInfo();
        if (res.success && res.data) {
          setAccountInfo(res.data);
        }
      } catch (err) {
        console.error('Error fetching balance:', err);
      } finally {
        setBalanceLoading(false);
      }
    };
    fetchBalance();
  }, []);

  const handleInvest = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      const amount = parseInt(investmentAmount) * 10000;
      
      if (!amount || amount < product!.minInvestment) {
        setError(`최소 투자 금액은 ${Math.floor(product!.minInvestment / 10000)}만 원입니다.`);
        return;
      }

      // Call the investment API
      const response = await investmentsService.createUserInvestment(productId, amount);

      if (response.success) {
        alert('투자가 성공적으로 완료되었습니다!');
        router.push('/investment/my-investments');
      } else {
        setError(response.message || '투자 신청에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Error investing:', err);
      setError(err.message || '투자 신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
            <p className="text-red-600 text-lg mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
            <Button onClick={() => router.back()} className="bg-blue-600 text-white">
              돌아가기
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const amountInWon = parseInt(investmentAmount || '0') * 10000;
  const expectedProfit = (amountInWon * product.rate * product.period) / (100 * 12);
  const expectedProfitAfterTax = expectedProfit * 0.846;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-900">투자하기</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-6">
            {/* Product Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{product.title}</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">연 수익률</p>
                  <p className="text-2xl font-bold text-green-600">{product.rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">투자 기간</p>
                  <p className="text-2xl font-bold text-gray-900">{product.period}개월</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">최소 투자</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.floor(product.minInvestment / 10000)}만원
                  </p>
                </div>
              </div>
            </Card>

            {/* Investment Form */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">투자 금액 입력</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  투자 금액 (만원)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    min={Math.floor(product.minInvestment / 10000)}
                    step="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="투자 금액을 입력하세요"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">만원</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  최소 투자 금액: {Math.floor(product.minInvestment / 10000)}만 원
                </p>
              </div>

              {/* Virtual Account Balance */}
              <div className="mb-6">
                {balanceLoading ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg animate-pulse">
                    <p className="text-sm text-blue-400">잔액 확인 중...</p>
                  </div>
                ) : accountInfo ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">투자 가능 잔액</span>
                      </div>
                      <span className="text-lg font-bold text-blue-900">
                        {Number(accountInfo.availableBalance).toLocaleString()}원
                      </span>
                    </div>
                    {amountInWon > Number(accountInfo.availableBalance) && amountInWon > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-red-600 mb-2">
                          ⚠️ 잔액이 부족합니다. 투자 전 가상계좌에 입금해주세요.
                        </p>
                        <Button
                          onClick={() => router.push('/dashboard/deposits')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg"
                        >
                          💰 가상계좌에 입금하기
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">
                      ⚠️ 가상계좌가 없습니다. 투자하려면 먼저 가상계좌를 개설하고 입금해주세요.
                    </p>
                    <Button
                      onClick={() => router.push('/dashboard/deposits')}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2 rounded-lg"
                    >
                      🏦 가상계좌 개설 및 입금하기
                    </Button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Expected Returns */}
              <div className="space-y-4 mb-6 p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">예상 수익 (세전)</p>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.floor(expectedProfit / 10000)}만 원
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">기간 내</p>
                    <p className="text-xl font-bold text-gray-900">{product.period}개월</p>
                  </div>
                </div>

                <div className="border-t border-green-200 pt-4">
                  <p className="text-sm text-gray-600 mb-1">예상 수익 (세후 15.4% 공제)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.floor(expectedProfitAfterTax / 10000)}만 원
                  </p>
                </div>

                <div className="border-t border-green-200 pt-4">
                  <p className="text-sm text-gray-600">총 수취 예상액</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor((amountInWon + expectedProfitAfterTax) / 10000)}만 원
                  </p>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ 본 투자는 부동산 담보 대출 상품으로, 차주의 채무불이행 시 손실이 발생할 수 있습니다. 
                  투자 전 상세한 투자 설명서를 읽고 리스크를 충분히 이해한 후 투자 결정을 내려주시기 바랍니다.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  variant="primary"
                  onClick={handleInvest}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '처리 중...' : '투자 신청'}
                </Button>
              </div>
            </Card>

            {/* Investment Info */}
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">투자 진행 절차</h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-fit">1단계</span>
                  <span>투자 신청 및 자금 입금</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-fit">2단계</span>
                  <span>투자 확정 및 계약 체결</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-fit">3단계</span>
                  <span>월 수익금 입금</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-fit">4단계</span>
                  <span>투자 기간 종료 후 원금 상환</span>
                </li>
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
