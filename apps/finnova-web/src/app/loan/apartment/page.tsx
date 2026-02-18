'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import Link from 'next/link';
import { Home, DollarSign, TrendingUp, MapPin, Zap } from 'lucide-react';

interface ApartmentProperty {
  id: string;
  name: string;
  address: string;
  price: number;
  maxLoanAmount: number;
  ltv: number;
  rate: number;
}

export default function ApartmentPage() {
  const [properties, setProperties] = useState<ApartmentProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setProperties([
        {
          id: '1',
          name: '강남구 한남동 빌라',
          address: '서울시 강남구 한남동',
          price: 1200000000,
          maxLoanAmount: 840000000,
          ltv: 70,
          rate: 7.5,
        },
        {
          id: '2',
          name: '서초구 반포주공아파트',
          address: '서울시 서초구 반포',
          price: 950000000,
          maxLoanAmount: 665000000,
          ltv: 70,
          rate: 8.0,
        },
        {
          id: '3',
          name: '마포구 합정동 투룸',
          address: '서울시 마포구 합정',
          price: 580000000,
          maxLoanAmount: 406000000,
          ltv: 70,
          rate: 8.5,
        },
        {
          id: '4',
          name: '용산구 이태원 오피스텔',
          address: '서울시 용산구 이태원',
          price: 750000000,
          maxLoanAmount: 525000000,
          ltv: 70,
          rate: 8.2,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-400 bg-opacity-20 p-3 rounded-lg">
                <Home size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold">아파트 담보 대출</h1>
                <p className="text-blue-200 mt-2">보유하신 아파트를 담보로 합리적인 금리로 대출받으세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between mb-4">
                <Home className="text-blue-600" size={24} />
                <Badge className="bg-blue-100 text-blue-800">최고</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-2">최대 LTV</p>
              <p className="text-3xl font-bold text-gray-900">70%</p>
              <p className="text-gray-500 text-xs mt-2">부동산 평가가액 기준</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="text-green-600" size={24} />
                <Badge className="bg-green-100 text-green-800">경쟁력</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-2">금리 범위</p>
              <p className="text-3xl font-bold text-gray-900">7-10%</p>
              <p className="text-gray-500 text-xs mt-2">신용도에 따라 차등 적용</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="text-purple-600" size={24} />
                <Badge className="bg-purple-100 text-purple-800">유연</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-2">대출 기간</p>
              <p className="text-3xl font-bold text-gray-900">12-30개월</p>
              <p className="text-gray-500 text-xs mt-2">상환 계획 맞춤 설정</p>
            </div>
          </div>

          {/* Featured Properties */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">추천 담보 물건</h2>
                <p className="text-gray-600 mt-1">최근 등록된 담보대출 가능 물건들입니다</p>
              </div>
              <Link href="/loan/apartment?filter=all">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  전체 보기
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
                  >
                    {/* Property Image Placeholder */}
                    <div className="bg-gradient-to-br from-slate-200 via-blue-100 to-slate-200 h-48 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Home className="text-slate-400 opacity-20" size={64} />
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-orange-500 text-white font-bold">
                          LTV {property.ltv}%
                        </Badge>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                        {property.name}
                      </h3>
                      
                      <div className="flex items-center text-gray-600 text-sm mb-4">
                        <MapPin size={16} className="mr-2" />
                        {property.address}
                      </div>

                      {/* Price Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-600 text-xs font-medium mb-1">부동산 가격</p>
                            <p className="text-lg font-bold text-gray-900">
                              ₩{(property.price / 100000000).toFixed(1)}억
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs font-medium mb-1">최대 대출액</p>
                            <p className="text-lg font-bold text-blue-600">
                              ₩{(property.maxLoanAmount / 100000000).toFixed(1)}억
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Rate Info */}
                      <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                        <div className="flex items-center">
                          <Zap size={16} className="text-yellow-500 mr-2" />
                          <span className="text-gray-600 text-sm">금리</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {property.rate}%
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link href={`/loan/application?property=${property.id}`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all">
                          이 물건으로 대출 신청
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Process */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">대출 진행 프로세스</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { num: '1', title: '물건 선택', desc: '담보로 제공할 아파트 선택' },
                { num: '2', title: '평가 신청', desc: '부동산 감정 평가 신청' },
                { num: '3', title: '심사', desc: '신용도 및 담보 심사' },
                { num: '4', title: '대출 실행', desc: '계약 체결 및 자금 이체' },
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                      {step.num}
                    </div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{step.title}</p>
                    <p className="text-xs text-gray-600">{step.desc}</p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-7 left-[60%] w-[40%] h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">아파트 담보대출 지금 신청하세요</h2>
            <p className="text-blue-100 mb-8 text-lg">빠른 심사, 합리적인 금리로 필요한 자금을 조달하세요</p>
            <Link href="/loan/application">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 rounded-lg">
                지금 신청하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
