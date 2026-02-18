'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import { ChevronLeft, Heart, Share2, Briefcase, AlertCircle, Loader } from 'lucide-react';
import * as investmentsService from '@/services/investments.service';
import { Investment } from '@/services/investments.service';

export default function BusinessLoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'investor'>('info');
  const [product, setProduct] = useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="animate-spin text-amber-600 mx-auto mb-4" size={40} />
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
            <Button onClick={() => router.back()} className="bg-amber-600 text-white">
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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
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
                  <p className="text-sm text-gray-600 mb-1">연간 매출</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {product.annualRevenue ? `${Math.floor(product.annualRevenue / 100000000)}억` : '정보 없음'}
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
                    <p className="text-3xl font-bold text-amber-600">{fundingPercent}%</p>
                  </div>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all"
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
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  사업 정보
                </button>
                <button
                  onClick={() => setActiveTab('investor')}
                  className={`px-4 py-3 font-medium border-b-2 transition ${
                    activeTab === 'investor'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  투자자 공지
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase size={20} className="text-amber-600" />
                      사업 정보
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">상품명</p>
                          <p className="font-semibold text-gray-900">
                            {product.title || '정보 없음'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">투자 기간</p>
                          <p className="font-semibold text-gray-900">
                            {product.period || 0}개월
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-600">연 수익률</p>
                          <p className="font-semibold text-green-600">
                            {product.rate || 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">투자자 수</p>
                          <p className="font-semibold text-gray-900">
                            {product.investorCount || 0}명
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">재무 정보</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">연간 매출</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {product.annualRevenue ? `${Math.floor(product.annualRevenue / 100000000)}억 원` : '정보 없음'}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">목표 자금</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.floor(product.fundingGoal / 100000000)}억 원
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">펀딩 현황</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                              style={{ width: `${fundingPercent}%` }}
                            />
                          </div>
                          <p className="font-bold text-gray-900">{fundingPercent}%</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {product.description && (
                    <Card className="p-6">
                      <h3 className="font-bold text-gray-900 mb-4">상품 설명</h3>
                      <p className="text-gray-700 leading-relaxed">{product.description}</p>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'investor' && (
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">투자자 공지</h3>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="font-bold text-yellow-800">투자 위험 안내:</p>
                    <p className="text-yellow-800 text-sm">
                      이 상품은 기업 대출 상품으로, 기업의 경영 악화 시 손실이 발생할 수 있습니다.
                    </p>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      • 업종의 특성상 높은 성장성 및 수익성을 기대할 수 있으나, 동시에 높은 위험성도 존재합니다.
                    </p>
                    <p>
                      • 제공된 재무 정보는 공시 기준으로, 최신 재무 상황이 아닐 수 있습니다.
                    </p>
                    <p>
                      • 시장 변동성에 따라 사업 실적이 크게 변할 수 있으므로 투자 전 충분히 검토하시기 바랍니다.
                    </p>
                    <p>
                      • 투자 수익은 세금 공제 후 지급됩니다.
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar - Investment Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">최소 투자금</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor(product.minInvestment / 1000000)}만 원
                  </p>
                </div>

                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">예상 수익 (최소 투자 기준)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.floor((product.minInvestment * product.rate * product.period) / (100 * 12)) / 10000}만 원
                  </p>
                </div>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    수익은 소득세(15.4%)가 공제되고 지급됩니다.
                  </p>
                </div>

                <Button className="w-full mb-3" variant="primary">
                  투자하기
                </Button>

                <Button className="w-full" variant="secondary">
                  계산기 열기
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
