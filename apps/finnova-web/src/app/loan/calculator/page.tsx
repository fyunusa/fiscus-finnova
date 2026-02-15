'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button } from '@/components/ui';
import Link from 'next/link';
import { ArrowRight, DollarSign, Calendar, Percent } from 'lucide-react';

export default function LoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(50000000);
  const [rate, setRate] = useState(8.5);
  const [period, setPeriod] = useState(12);

  const monthlyPayment = (loanAmount * (rate / 100 / 12)) / (1 - Math.pow(1 + rate / 100 / 12, -period));
  const totalInterest = monthlyPayment * period - loanAmount;
  const totalRepayment = loanAmount + totalInterest;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <Link href="/loan" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowRight className="rotate-180" size={18} />
              <span className="ml-2">대출 메인으로 돌아가기</span>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">대출 계산기</h1>
            <p className="text-xl text-gray-600">원하는 금액과 기간에 따른 월별 상환금을 계산해보세요.</p>
          </div>

          {/* Main Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Input Section */}
            <Card className="bg-white shadow-lg rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">계산 기준 설정</h2>

              {/* Loan Amount */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={24} className="text-blue-600" />
                  <label className="text-lg font-semibold text-gray-900">대출 금액</label>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-3xl font-bold text-blue-600">{loanAmount.toLocaleString('ko-KR')}원</p>
                </div>
                <input
                  type="range"
                  min="10000000"
                  max="500000000"
                  step="10000000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>1,000만원</span>
                  <span>5억원</span>
                </div>
              </div>

              {/* Loan Period */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={24} className="text-green-600" />
                  <label className="text-lg font-semibold text-gray-900">대출 기간</label>
                </div>
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <p className="text-3xl font-bold text-green-600">{period}개월</p>
                </div>
                <input
                  type="range"
                  min="1"
                  max="36"
                  step="1"
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>1개월</span>
                  <span>36개월</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Percent size={24} className="text-purple-600" />
                  <label className="text-lg font-semibold text-gray-900">연이율</label>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <p className="text-3xl font-bold text-purple-600">{rate.toFixed(1)}%</p>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="0.5"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>3.0%</span>
                  <span>20.0%</span>
                </div>
              </div>
            </Card>

            {/* Results Section */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg rounded-xl p-8">
                <h3 className="text-lg font-semibold mb-6">월별 상환금</h3>
                <p className="text-5xl font-bold mb-2">{monthlyPayment.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원</p>
                <p className="text-blue-100 text-sm">매월 이 금액을 납부하게 됩니다</p>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg rounded-xl p-8">
                <h3 className="text-lg font-semibold mb-6">총 이자액</h3>
                <p className="text-5xl font-bold mb-2">{totalInterest.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원</p>
                <p className="text-green-100 text-sm">대출 기간 동안 납부할 총 이자</p>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg rounded-xl p-8">
                <h3 className="text-lg font-semibold mb-6">총 상환액</h3>
                <p className="text-5xl font-bold mb-2">{totalRepayment.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원</p>
                <p className="text-purple-100 text-sm">원금 + 이자 총합</p>
              </Card>

              {/* Calculation Summary */}
              <Card className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">계산 요약</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">대출 원금</span>
                    <span className="font-semibold text-gray-900">{loanAmount.toLocaleString('ko-KR')}원</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">월 상환금 × {period}개월</span>
                    <span className="font-semibold text-gray-900">{monthlyPayment.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원 × {period}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">총 상환액</span>
                    <span className="font-bold text-blue-600 text-lg">{totalRepayment.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원</span>
                  </div>
                </div>
              </Card>

              {/* CTA Button */}
              <Link href="/loan/application">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all">
                  지금 대출 신청하기
                </Button>
              </Link>
            </div>
          </div>

          {/* Tips Section */}
          <Card className="bg-blue-50 border-l-4 border-blue-600 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💡 대출 계산 팁</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>더 낮은 금리를 원한다면 신용등급 개선에 집중하세요.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>짧은 기간일수록 총 이자가 적어집니다.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>정해진 기간 내 상환하면 추가 이자가 발생하지 않습니다.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>조기 상환 시 이자 감면이 적용될 수 있습니다.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
