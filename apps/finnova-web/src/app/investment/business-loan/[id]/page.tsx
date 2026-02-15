'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import { ChevronLeft, Heart, Share2, Building2 } from 'lucide-react';

export default function BusinessLoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'investor'>('info');

  // Mock data
  const product = {
    id: productId,
    title: 'IT 스타트업 운영자금 대출',
    rate: 10.5,
    period: 24,
    fundingGoal: 150000000,
    fundingCurrent: 105000000,
    minInvestment: 2000000,
    status: 'funding',
    business: {
      businessName: '테크플러스 솔루션',
      businessRegistration: '234-56-78901',
      industryCode: '62.01',
      industry: '정보통신 소프트웨어 개발 및 공급',
      establishedYear: 2018,
    },
    financials: {
      lastYearRevenue: 2500000000,
      lastYearProfit: 450000000,
      currentAssets: 1200000000,
      totalDebt: 800000000,
    },
    loanPurpose: '신규 제품 개발 및 마케팅 비용',
  };

  const fundingPercent = Math.round((product.fundingCurrent / product.fundingGoal) * 100);
  const roi = (product.financials.lastYearProfit / product.financials.lastYearRevenue * 100).toFixed(1);
  const debtRatio = (product.financials.totalDebt / product.financials.currentAssets * 100).toFixed(1);

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
                onClick={() => setIsFavorite(!isFavorite)}
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
                  <p className="text-sm text-gray-600 mb-1">당기순이익률</p>
                  <p className="text-2xl font-bold text-amber-600">{roi}%</p>
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
                  사업자 정보
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
                      <Building2 size={20} className="text-amber-600" />
                      사업자 정보
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">상호명</p>
                          <p className="font-semibold text-gray-900">
                            {product.business.businessName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">사업자번호</p>
                          <p className="font-semibold text-gray-900 font-mono">
                            {product.business.businessRegistration}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-600">업태</p>
                          <p className="font-semibold text-gray-900">
                            {product.business.industry}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">설립연도</p>
                          <p className="font-semibold text-gray-900">
                            {product.business.establishedYear}년
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
                          <p className="text-sm text-gray-600 mb-1">전년도 매출</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {Math.floor(product.financials.lastYearRevenue / 100000000)}억 원
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">전년도 순이익</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.floor(product.financials.lastYearProfit / 100000000)}억 원
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">유동자산</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {Math.floor(product.financials.currentAssets / 100000000)}억 원
                          </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">총부채</p>
                          <p className="text-2xl font-bold text-red-600">
                            {Math.floor(product.financials.totalDebt / 100000000)}억 원
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">부채비율</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${Number(debtRatio) > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: Math.min(Number(debtRatio), 100) + '%' }}
                            />
                          </div>
                          <p className="font-bold text-gray-900">{debtRatio}%</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2">대출 목적</h3>
                    <p className="text-gray-700">{product.loanPurpose}</p>
                  </Card>
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
                      • IT 스타트업 업종의 특성상 높은 성장성 및 수익성을 기대할 수 있으나, 동시에 높은 위험성도 존재합니다.
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
