'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import { ChevronLeft, Heart, Share2, CreditCard, AlertCircle, Loader } from 'lucide-react';
import * as investmentsService from '@/services/investments.service';
import { Investment } from '@/services/investments.service';

export default function CreditCardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'investor'>('info');
  const [product, setProduct] = useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCalculator, setShowCalculator] = useState(false);

  // Fetch investment detail
  useEffect(() => {
    const fetchInvestment = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await investmentsService.getInvestmentDetail(productId);
        
        if (response.success && response.data) {
          setProduct(response.data);
          
          // Check if user has favorited this investment
          try {
            const favoriteCheck = await investmentsService.isFavorited(productId);
            setIsFavorite(favoriteCheck.data.isFavorited);
          } catch (err) {
            console.error('Error checking favorite status:', err);
            // Silently fail - default to not favorited
          }
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

  const handleInvest = () => {
    router.push(`/investment/${productId}/invest`);
  };

  const handleCalculator = () => {
    setShowCalculator(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
            <p className="text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
            <p className="text-red-600 text-lg mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
            <Button onClick={() => router.back()} className="bg-purple-600 text-white">
              돌아가기
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const fundingPercent = Math.round((product.fundingCurrent / product.fundingGoal) * 100);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={24} />
              돌아가기
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  try {
                    if (isFavorite) {
                      await investmentsService.removeFromFavorites(productId);
                    } else {
                      await investmentsService.addToFavorites(productId);
                    }
                    setIsFavorite(!isFavorite);
                  } catch (err: any) {
                    console.error('Error toggling favorite:', err);
                    alert(err.message || '즐겨찾기 변경에 실패했습니다.');
                  }
                }}
                className={`p-2 rounded-full transition ${
                  isFavorite
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <Card className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">연 수익률</p>
                  <p className="text-3xl font-bold text-green-600">{product.rate}%</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">투자 기간</p>
                  <p className="text-3xl font-bold text-gray-900">{product.period}개월</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">미결제금액</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {product.outstandingAmount ? `${Math.floor(product.outstandingAmount / 100000000)}억` : '정보 없음'}
                  </p>
                </Card>
              </div>

              {/* Funding Progress */}
              <Card className="p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">펀딩 진행 상황</h2>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {Math.floor(product.fundingCurrent / 100000000)}억 원
                    </p>
                    <p className="text-sm text-gray-600">
                      / {Math.floor(product.fundingGoal / 100000000)}억 원
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">{fundingPercent}%</p>
                  </div>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                    style={{ width: `${fundingPercent}%` }}
                  />
                </div>
              </Card>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-3 font-medium border-b-2 transition ${
                    activeTab === 'info'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  상품 정보
                </button>
                <button
                  onClick={() => setActiveTab('investor')}
                  className={`px-4 py-3 font-medium border-b-2 transition ${
                    activeTab === 'investor'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  투자자 공지
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'info' && (
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-purple-600" />
                    상품 정보
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">가맹점명</p>
                        <p className="font-semibold text-gray-900">
                          {product?.merchantName || '정보 없음'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">업종</p>
                        <p className="font-semibold text-gray-900">
                          {product?.merchantCategory || '정보 없음'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">미결제금액</p>
                        <p className="font-semibold text-gray-900">
                          {product?.outstandingAmount ? `${Math.floor(product.outstandingAmount / 100000000)}억 원` : '정보 없음'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">투자 수익률</p>
                        <p className="font-semibold text-purple-600">
                          {product.rate}%
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">투자 기간</p>
                        <p className="font-semibold text-gray-900">
                          {product.period}개월
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">투자자 수</p>
                        <p className="font-semibold text-gray-900">
                          {product.investorCount || 0}명
                        </p>
                      </div>
                    </div>
                    {product.description && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">상품 설명</p>
                        <p className="text-gray-700 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {activeTab === 'investor' && (
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">투자자 공지</h3>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="font-bold text-yellow-800">투자 위험 안내:</p>
                    <p className="text-yellow-800 text-sm">
                      이 상품은 신용카드 미결제금액 채권 상품으로, 발행사의 채무불이행 시 손실이 발생할 수 있습니다.
                    </p>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      • 신용카드 매출액과 미결제금액은 시장 상황에 따라 변동될 수 있습니다.
                    </p>
                    <p>
                      • 가맹점의 영업 악화 시 수익성이 감소할 수 있습니다.
                    </p>
                    <p>
                      • 채무불이행 시 회수에 시간이 소요될 수 있습니다.
                    </p>
                    <p>
                      • 본 투자상품은 펀드나 보험 상품이 아니며, 예금자보호 대상이 아닙니다.
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Min Investment Card */}
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200">
                  <p className="text-sm text-gray-600 mb-2">최소 투자금액</p>
                  <p className="text-3xl font-bold text-purple-600 mb-4">
                    {Math.floor(product.minInvestment / 1000000)}백만원
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    최소 금액 이상으로 투자 가능합니다
                  </p>
                </Card>

                {/* Status Badge */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={`${
                      product.status === 'recruiting' ? 'bg-purple-100 text-purple-700' :
                      product.status === 'funding' ? 'bg-blue-100 text-blue-700' :
                      product.status === 'ending-soon' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {product.status === 'recruiting' ? '모집 중' :
                       product.status === 'funding' ? '펀딩 중' :
                       product.status === 'ending-soon' ? '곧 종료' : '종료됨'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    투자자: <span className="font-bold text-gray-900">{product.investorCount || 0}명</span>
                  </p>
                </Card>

                {/* Action Buttons */}
                <Button 
                  className="w-full bg-purple-600 text-white hover:bg-purple-700 py-3 font-bold"
                  onClick={handleInvest}
                >
                  투자하기
                </Button>

                <Button 
                  className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 py-3 font-bold"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  {isFavorite ? '❤️ 찜 해제' : '🤍 찜하기'}
                </Button>

                {/* Additional Info */}
                <Card className="p-4 bg-blue-50">
                  <h4 className="font-bold text-gray-900 mb-3">이 상품의 특징</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>안정적인 수익률</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>투명한 정보 공개</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>쉬운 투자 절차</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">투자 수익 계산기</h2>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  투자 금액 (만원)
                </label>
                <input
                  type="number"
                  defaultValue={Math.floor(product!.minInvestment / 1000000)}
                  min={Math.floor(product!.minInvestment / 1000000)}
                  onChange={(e) => {
                    const investAmount = parseInt(e.target.value) * 1000000;
                    const expectedProfit = (investAmount * product!.rate * product!.period) / (100 * 12);
                    (document.getElementById('expectedProfit') as HTMLElement).textContent = 
                      `${Math.floor(expectedProfit / 10000)}만 원`;
                    (document.getElementById('expectedProfitAfterTax') as HTMLElement).textContent = 
                      `${Math.floor(expectedProfit * 0.846 / 10000)}만 원`;
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">투자 기간: {product?.period}개월</p>
                <p className="text-sm text-gray-600 mb-2">연 수익률: {product?.rate}%</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">예상 수익 (세전)</p>
                <p id="expectedProfit" className="text-2xl font-bold text-green-600 mb-3">
                  {Math.floor((Math.floor(product!.minInvestment / 1000000) * 1000000 * product!.rate * product!.period) / (100 * 12) / 10000)}만 원
                </p>
                
                <p className="text-sm text-gray-600 mb-1">예상 수익 (세후)</p>
                <p id="expectedProfitAfterTax" className="text-2xl font-bold text-green-600">
                  {Math.floor((Math.floor(product!.minInvestment / 1000000) * 1000000 * product!.rate * product!.period) / (100 * 12) * 0.846 / 10000)}만 원
                </p>
              </div>

              <p className="text-xs text-gray-500">
                ※ 세후 수익은 15.4% 소득세 공제 이후의 예상 금액입니다.
              </p>

              <Button
                className="w-full"
                variant="primary"
                onClick={() => {
                  setShowCalculator(false);
                  handleInvest();
                }}
              >
                투자하기
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
}
