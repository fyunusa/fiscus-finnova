'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import { ChevronLeft, Heart, Share2, TrendingUp } from 'lucide-react';

export default function CreditCardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'investor'>('info');

  // Mock data
  const product = {
    id: productId,
    title: '골프용품 쇼핑몰 신용카드 외상채권',
    rate: 9.5,
    period: 6,
    fundingGoal: 50000000,
    fundingCurrent: 42000000,
    minInvestment: 1000000,
    status: 'funding',
    merchant: {
      businessName: '골프마트 온라인',
      businessRegistration: '123-45-67890',
      industryCode: '47.11',
      industry: '일반 종합 소매업',
      establishedYear: 2015,
    },
    cardSales: [
      { month: '8월', amount: 8500000 },
      { month: '9월', amount: 9200000 },
      { month: '10월', amount: 8800000 },
      { month: '11월', amount: 9500000 },
      { month: '12월', amount: 10200000 },
      { month: '1월', amount: 9800000 },
    ],
  };

  const fundingPercent = Math.round((product.fundingCurrent / product.fundingGoal) * 100);
  const avgMonthlySales = Math.floor(
    product.cardSales.reduce((a, b) => a + b.amount, 0) / product.cardSales.length
  );
  const estimatedDailySales = Math.floor(avgMonthlySales / 30);

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
                  <p className="text-sm text-gray-600 mb-1">월평균 매출</p>
                  <p className="text-xl font-bold text-purple-600">
                    {Math.floor(avgMonthlySales / 1000000)}억
                  </p>
                </Card>
              </div>

              {/* Funding Progress */}
              <Card className="p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">펀딩 진행 상황</h2>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {Math.floor(product.fundingCurrent / 10000000)}.
                      {String(Math.floor((product.fundingCurrent % 10000000) / 1000000)).padStart(
                        1,
                        '0'
                      )}
                      억 원
                    </p>
                    <p className="text-sm text-gray-600">
                      / {Math.floor(product.fundingGoal / 10000000)}억 원
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
                  사업자 정보
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
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">사업자 정보</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">상호명</p>
                          <p className="font-semibold text-gray-900">
                            {product.merchant.businessName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">사업자번호</p>
                          <p className="font-semibold text-gray-900 font-mono">
                            {product.merchant.businessRegistration}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-600">업태</p>
                          <p className="font-semibold text-gray-900">
                            {product.merchant.industry}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">설립연도</p>
                          <p className="font-semibold text-gray-900">
                            {product.merchant.establishedYear}년
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp size={20} className="text-purple-600" />
                      신용카드 매출 현황 (6개월)
                    </h3>
                    <div className="space-y-3">
                      {product.cardSales.map((sale) => (
                        <div key={sale.month} className="flex items-center gap-4">
                          <p className="w-12 text-sm font-semibold text-gray-600">
                            {sale.month}
                          </p>
                          <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-end pr-3"
                              style={{
                                width: `${(sale.amount / Math.max(...product.cardSales.map((s) => s.amount))) * 100}%`,
                              }}
                            >
                              <span className="text-white text-xs font-bold">
                                {Math.floor(sale.amount / 1000000)}억
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">일평균 신용카드 매출</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.floor(estimatedDailySales / 1000000)}백만 원
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'investor' && (
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">투자자 공지</h3>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="font-bold text-yellow-800">투자 위험 안내:</p>
                    <p className="text-yellow-800 text-sm">
                      이 상품은 외상채권 상품으로, 사업자의 경영 악화 시 손실이 발생할 수 있습니다.
                    </p>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      • 신용카드 외상채권 회수율은 사업자의 신용 상태에 따라 변할 수 있습니다.
                    </p>
                    <p>
                      • 제공된 매출 정보는 신용카드사 데이터 기준으로, 실제 매출과 차이가 있을 수 있습니다.
                    </p>
                    <p>
                      • 계절성이나 특수 상황에 따라 매출이 급감할 수 있으므로 투자 전 충분히 검토하시기 바랍니다.
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
