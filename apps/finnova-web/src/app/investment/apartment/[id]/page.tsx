'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import { ChevronLeft, Heart, Share2, BarChart3 } from 'lucide-react';

export default function ApartmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'investor'>('info');

  // Mock data
  const product = {
    id: productId,
    title: '강남구 아파트 담보 대출',
    rate: 8.5,
    period: 12,
    fundingGoal: 100000000,
    fundingCurrent: 75000000,
    minInvestment: 1000000,
    ltv: 65,
    borrowerType: '개인',
    status: 'funding',
    property: {
      address: '서울시 강남구 테헤란로 123',
      size: '84㎡ (전용면적)',
      buildYear: 2015,
      kbValuation: 650000000,
      currentLien: 300000000,
    },
  };

  const fundingPercent = Math.round((product.fundingCurrent / product.fundingGoal) * 100);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
                  <p className="text-sm text-gray-600 mb-1">LTV</p>
                  <p className="text-3xl font-bold text-blue-600">{product.ltv}%</p>
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
                    <p className="text-3xl font-bold text-blue-600">{fundingPercent}%</p>
                  </div>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
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
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  담보 정보
                </button>
                <button
                  onClick={() => setActiveTab('investor')}
                  className={`px-4 py-3 font-medium border-b-2 transition ${
                    activeTab === 'investor'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  투자자 공지
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'info' && (
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">담보 정보</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">주소</p>
                        <p className="font-semibold text-gray-900">
                          {product.property.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">건축연도</p>
                        <p className="font-semibold text-gray-900">
                          {product.property.buildYear}년
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">면적</p>
                        <p className="font-semibold text-gray-900">
                          {product.property.size}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">KB 감정가</p>
                        <p className="font-semibold text-gray-900">
                          {Math.floor(product.property.kbValuation / 100000000)}억 원
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">기존 저당</p>
                        <p className="font-semibold text-gray-900">
                          {Math.floor(product.property.currentLien / 100000000)}억 원
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">대출금액</p>
                        <p className="font-semibold text-gray-900">
                          {Math.floor(product.fundingGoal / 100000000)}억 원
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'investor' && (
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">투자자 공지</h3>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="font-bold text-yellow-800">투자 위험 안내:</p>
                    <p className="text-yellow-800 text-sm">
                      이 상품은 부동산 담보 대출 상품으로, 차주의 채무불이행 시 손실이 발생할 수 있습니다.
                    </p>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      • 선순위 저당권이 있을 수 있으며, 이 경우 회수 순위가 낮아질 수 있습니다.
                    </p>
                    <p>
                      • 부동산 가격 변동에 따라 담보 가치가 변할 수 있습니다.
                    </p>
                    <p>
                      • 채무불이행 시 경매 절차를 거쳐 회수하게 되며, 시간이 소요될 수 있습니다.
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
