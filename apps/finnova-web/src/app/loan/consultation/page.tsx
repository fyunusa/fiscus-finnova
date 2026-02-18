'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input, Alert } from '@/components/ui';
import Link from 'next/link';
import { CheckCircle, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { loanService } from '@/services/loanService';

interface ConsultationFormData {
  step: number;
  name: string;
  phone: string;
  email: string;
  loanType: string;
  loanAmount: string;
  propertyType: string;
  purpose: string;
  message: string;
  isSubmitted: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export default function ConsultationPage() {
  const [formData, setFormData] = useState<ConsultationFormData>({
    step: 1,
    name: '',
    phone: '',
    email: '',
    loanType: '',
    loanAmount: '',
    propertyType: '',
    purpose: '',
    message: '',
    isSubmitted: false,
    isSubmitting: false,
    error: null,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      error: null, // Clear error when user starts typing
    }));
  };

  const handleNextStep = () => {
    if (formData.step === 1) {
      if (formData.name && formData.phone && formData.email && formData.loanType) {
        setFormData(prev => ({
          ...prev,
          step: 2,
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (formData.loanAmount && formData.propertyType && formData.purpose) {
      try {
        setFormData(prev => ({
          ...prev,
          isSubmitting: true,
          error: null,
        }));

        await loanService.createConsultation({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          loanType: formData.loanType,
          requestedAmount: parseInt(formData.loanAmount),
          propertyType: formData.propertyType,
          purpose: formData.purpose,
          message: formData.message,
        });

        setFormData(prev => ({
          ...prev,
          isSubmitted: true,
          isSubmitting: false,
        }));
      } catch (error) {
        console.error('Failed to submit consultation:', error);
        setFormData(prev => ({
          ...prev,
          isSubmitting: false,
          error: '상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.',
        }));
      }
    }
  };

  const handleReset = () => {
    setFormData({
      step: 1,
      name: '',
      phone: '',
      email: '',
      loanType: '',
      loanAmount: '',
      propertyType: '',
      purpose: '',
      message: '',
      isSubmitted: false,
      isSubmitting: false,
      error: null,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">대출 상담 신청</h1>
            <p className="text-blue-100 text-lg">
              맞춤형 대출 상담을 신청하세요
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Contact Info */}
            <div className="lg:col-span-1">
              <Card className="bg-white shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">상담 연락처</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center text-blue-600 mb-2">
                      <Phone size={20} className="mr-2" />
                      <p className="font-semibold">전화</p>
                    </div>
                    <p className="text-gray-700 ml-7">1577-XXXX</p>
                    <p className="text-gray-500 text-sm ml-7">평일 9AM-6PM</p>
                  </div>

                  <div>
                    <div className="flex items-center text-blue-600 mb-2">
                      <Mail size={20} className="mr-2" />
                      <p className="font-semibold">이메일</p>
                    </div>
                    <p className="text-gray-700 ml-7">support@finnova.co.kr</p>
                  </div>

                  <div>
                    <div className="flex items-center text-blue-600 mb-2">
                      <Clock size={20} className="mr-2" />
                      <p className="font-semibold">운영시간</p>
                    </div>
                    <p className="text-gray-700 ml-7">평일 9:00-18:00</p>
                    <p className="text-gray-500 text-sm ml-7">토/일 휴무</p>
                  </div>
                </div>

                <Button className="w-full mt-8 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium">
                  전화 상담 예약
                </Button>
              </Card>
            </div>

            {/* Main Form Area */}
            <div className="lg:col-span-3">
              {!formData.isSubmitted ? (
                <Card className="bg-white shadow-md p-8">
                  {/* Progress Steps */}
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-2">
                      {[1, 2].map((step) => (
                        <React.Fragment key={step}>
                          <div className="flex items-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                                step <= formData.step
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {step}
                            </div>
                            <p className={`ml-3 font-semibold ${
                              step <= formData.step ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                              {step === 1 ? '기본정보' : '상담내용'}
                            </p>
                          </div>
                          {step < 2 && (
                            <div className={`flex-1 h-1 mx-4 ${
                              formData.step > step ? 'bg-blue-600' : 'bg-gray-300'
                            }`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Error Alert */}
                  {formData.error && (
                    <Alert className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                      {formData.error}
                    </Alert>
                  )}

                  {/* Form Content */}
                  {formData.step === 1 ? (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h3>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          이름 *
                        </label>
                        <Input
                          type="text"
                          placeholder="성명을 입력하세요"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            휴대폰 *
                          </label>
                          <Input
                            type="tel"
                            placeholder="010-0000-0000"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            이메일 *
                          </label>
                          <Input
                            type="email"
                            placeholder="example@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          대출 유형 *
                        </label>
                        <select
                          value={formData.loanType}
                          onChange={(e) => handleInputChange('loanType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">선택하세요</option>
                          <option value="부동산담보">부동산담보대출</option>
                          <option value="신용">신용대출</option>
                          <option value="사업자">사업자대출</option>
                          <option value="기타">기타</option>
                        </select>
                      </div>

                      <Button
                        onClick={handleNextStep}
                        disabled={!formData.name || !formData.phone || !formData.email || !formData.loanType}
                        className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center"
                      >
                        다음 단계 <ArrowRight size={20} className="ml-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">상담 내용</h3>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          희망 대출액 *
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="1,000"
                            value={formData.loanAmount}
                            onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="absolute right-4 top-3 text-gray-600">만원</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          담보 유형 *
                        </label>
                        <select
                          value={formData.propertyType}
                          onChange={(e) => handleInputChange('propertyType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">선택하세요</option>
                          <option value="아파트">아파트</option>
                          <option value="주택">주택</option>
                          <option value="오피스텔">오피스텔</option>
                          <option value="상가">상가</option>
                          <option value="토지">토지</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          대출 목적 *
                        </label>
                        <textarea
                          placeholder="대출 목적을 입력하세요"
                          value={formData.purpose}
                          onChange={(e) => handleInputChange('purpose', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          추가 메시지 (선택사항)
                        </label>
                        <textarea
                          placeholder="추가로 전달하고 싶은 내용을 입력하세요"
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24 resize-none"
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={() => setFormData(prev => ({ ...prev, step: 1 }))}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
                          disabled={formData.isSubmitting}
                        >
                          이전 단계
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={!formData.loanAmount || !formData.propertyType || !formData.purpose || formData.isSubmitting}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold"
                        >
                          {formData.isSubmitting ? '신청 중...' : '상담 신청'}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="bg-white shadow-md p-12 text-center">
                  <CheckCircle size={64} className="mx-auto text-green-600 mb-6" />
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    상담 신청 완료
                  </h3>
                  <p className="text-gray-600 text-lg mb-2">
                    상담 신청이 완료되었습니다.
                  </p>
                  <p className="text-gray-600 text-lg mb-8">
                    곧 담당자가 연락드리겠습니다.
                  </p>

                  <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
                    <p className="text-sm text-gray-700 mb-3">
                      <span className="font-semibold">신청자:</span> {formData.name}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                      <span className="font-semibold">연락처:</span> {formData.phone}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">신청 대출액:</span> {formData.loanAmount}만원
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Link href="/loan" className="flex-1">
                      <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold">
                        대출 정보로
                      </Button>
                    </Link>
                    <Button
                      onClick={handleReset}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                    >
                      새 상담 신청
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

