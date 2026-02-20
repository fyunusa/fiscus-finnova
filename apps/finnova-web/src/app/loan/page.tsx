'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Card, Button } from '@/components/ui';
import Link from 'next/link';
import { Home, Calculator, FileText, Phone, ClipboardList } from 'lucide-react';

export default function LoanPage() {
  const [loanAmount, setLoanAmount] = React.useState(50000000);
  const [rate] = React.useState(8.5);
  const [period, setPeriod] = React.useState(12);

  const monthlyPayment = (loanAmount * (rate / 100 / 12)) / (1 - Math.pow(1 + rate / 100 / 12, -period));
  const totalInterest = monthlyPayment * period - loanAmount;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <Home size={32} />
              <h1 className="text-4xl font-bold">부동산 담보 대출</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl">
              보유하신 아파트를 담보로 최대 70% LTV까지 합리적인 금리로 대출을 받을 수 있습니다.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="p-6 border-b-4 border-blue-500">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  최대 70%
                </div>
                <p className="text-gray-700 font-semibold">LTV (담보인정가율)</p>
              </div>
              <div className="p-4 text-sm text-gray-600">
                부동산 평가가액의 최대 70%까지 대출이 가능합니다.
              </div>
            </Card>

            <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="p-6 border-b-4 border-green-500">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {rate.toFixed(1)}%
                </div>
                <p className="text-gray-700 font-semibold">연이율</p>
              </div>
              <div className="p-4 text-sm text-gray-600">
                경쟁력 있는 금리로 합리적인 차입 비용을 제공합니다.
              </div>
            </Card>

            <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="p-6 border-b-4 border-purple-500">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  최대 36
                </div>
                <p className="text-gray-700 font-semibold">개월 (대출 기간)</p>
              </div>
              <div className="p-4 text-sm text-gray-600">
                최대 3년의 유연한 상환 기간을 제공합니다.
              </div>
            </Card>
          </div>

          {/* Loan Calculator */}
          <Card className="bg-white shadow-lg rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">대출 계산기</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    대출 금액: {loanAmount.toLocaleString()}원
                  </label>
                  <input
                    type="range"
                    min="10000000"
                    max="500000000"
                    step="10000000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1,000만원</span>
                    <span>5억원</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    대출 기간: {period}개월
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="36"
                    step="1"
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1개월</span>
                    <span>36개월</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    연이율
                  </label>
                  <div className="text-2xl font-bold text-blue-600">{rate.toFixed(1)}%</div>
                </div>
              </div>

              {/* Results Section */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">대출 상환 예상액</h3>
                
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-1">월별 상환금</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {monthlyPayment.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-1">총 이자액</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalInterest.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-1">총 상환액</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(loanAmount + totalInterest).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Process Steps */}
          <Card className="bg-white shadow-lg rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">대출 진행 프로세스</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { num: '1', title: '신청', desc: '기본 정보 입력' },
                { num: '2', title: '심사', desc: '서류 검토 및 심사' },
                { num: '3', title: '현장실사', desc: '담당자 방문 평가' },
                { num: '4', title: '대출실행', desc: '계약 및 자금 지급' },
              ].map((step) => (
                <div key={step.num} className="relative">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-2">
                      {step.num}
                    </div>
                    <p className="font-semibold text-gray-900 text-center">{step.title}</p>
                    <p className="text-sm text-gray-600 text-center mt-1">{step.desc}</p>
                  </div>
                  {parseInt(step.num) < 4 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[40%] h-1 bg-blue-300"></div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Link href="/loan/apartment">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all">
                <Calculator className="inline mr-2" size={20} />
                한도 조회
              </Button>
            </Link>

            <Link href="/loan/my-loans">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all">
                <ClipboardList className="inline mr-2" size={20} />
                내 대출
              </Button>
            </Link>

            <Link href="/loan/application">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all">
                <FileText className="inline mr-2" size={20} />
                신청하기
              </Button>
            </Link>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-blue-600">ℹ️</span> 필수 서류
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✓ 주민등록등본 또는 건축물 등기부등본</li>
                <li>✓ 신분증</li>
                <li>✓ 최근 3개월 통장 사본</li>
                <li>✓ 소득 입증 서류 (급여명세서, 사업소득)</li>
              </ul>
            </Card>

            <Card className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Phone size={20} className="text-orange-600" />
                고객 지원
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                궁금하신 사항은 아래 연락처로 문의해주세요.
              </p>
              <p className="text-lg font-bold text-gray-900">1588-XXXX</p>
              <p className="text-sm text-gray-600 mt-2">평일 09:00 ~ 18:00</p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}