'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Badge } from '@/components/ui';
import { Building2, PhoneCall, MessageSquare, Mail } from 'lucide-react';

export default function CorporateConsultationPage() {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    businessRegistration: '',
    contactPerson: '',
    phone: '',
    email: '',
    message: '',
  });

  const investmentTypes = [
    { id: 'apartment', label: '부동산 담보 대출' },
    { id: 'credit-card', label: '신용카드 외상채권' },
    { id: 'business-loan', label: '기업대출' },
    { id: 'other', label: '기타' },
  ];

  const investmentAmounts = [
    { id: 'small', label: '1억 이상 3억 미만' },
    { id: 'medium', label: '3억 이상 10억 미만' },
    { id: 'large', label: '10억 이상 50억 미만' },
    { id: 'xlarge', label: '50억 이상' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('컨설팅 신청:', {
      ...formData,
      investmentType: selectedType,
      investmentAmount: selectedAmount,
    });
    // Reset form
    setFormData({
      companyName: '',
      businessRegistration: '',
      contactPerson: '',
      phone: '',
      email: '',
      message: '',
    });
    setSelectedType('');
    setSelectedAmount('');
    setShowForm(false);
    alert('컨설팅 신청이 완료되었습니다. 빠르게 연락드리겠습니다.');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <Building2 size={32} />
              <h1 className="text-4xl font-bold">기업 투자 컨설팅</h1>
            </div>
            <p className="text-xl text-slate-200">
              대규모 투자 또는 맞춤형 상품이 필요하신 기업을 위한 전문 컨설팅 서비스입니다.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <PhoneCall size={24} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">1:1 전담 컨설턴트</h3>
              <p className="text-sm text-gray-600">
                투자 목표와 상황에 맞춘 전문가 컨설팅을 제공합니다.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 size={24} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">맞춤형 솔루션</h3>
              <p className="text-sm text-gray-600">
                기업의 규모와 투자 규모에 맞춘 상품 포트폴리오를 구성합니다.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">빠른 응답</h3>
              <p className="text-sm text-gray-600">
                영업시간 내 24시간 이내 담당자가 연락드립니다.
              </p>
            </Card>
          </div>

          {/* Main Form Section */}
          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">컨설팅 신청</h2>

            {!showForm ? (
              <div className="space-y-8">
                {/* Investment Type Selection */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">관심 투자 상품을 선택해주세요</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {investmentTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 text-left rounded-lg border-2 transition ${
                          selectedType === type.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-gray-900">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Investment Amount Selection */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">희망 투자 규모를 선택해주세요</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {investmentAmounts.map((amount) => (
                      <button
                        key={amount.id}
                        onClick={() => setSelectedAmount(amount.id)}
                        className={`p-4 text-left rounded-lg border-2 transition ${
                          selectedAmount === amount.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-gray-900">{amount.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1"
                    variant="primary"
                    disabled={!selectedType || !selectedAmount}
                    onClick={() => setShowForm(true)}
                  >
                    다음 단계로 진행
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Back Button */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    ← 선택으로 돌아가기
                  </button>
                </div>

                {/* Selection Summary */}
                <Card className="p-4 bg-slate-50">
                  <p className="text-sm text-gray-600">
                    <strong>선택 상품:</strong> {investmentTypes.find((t) => t.id === selectedType)?.label} |{' '}
                    <strong>투자 규모:</strong> {investmentAmounts.find((a) => a.id === selectedAmount)?.label}
                  </p>
                </Card>

                {/* Company Info */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    회사명 *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="회사명을 입력해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Business Registration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    사업자등록번호 *
                  </label>
                  <input
                    type="text"
                    name="businessRegistration"
                    value={formData.businessRegistration}
                    onChange={handleInputChange}
                    placeholder="XXX-XX-XXXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    담당자명 *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="담당자명을 입력해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    연락처 *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@company.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    추가 문의사항 (선택)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="투자 관련 특별한 요청사항이 있다면 입력해주세요"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Notice */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    개인정보는 컨설팅 서비스 제공 목적으로만 사용되며, 별도 동의 없이 제3자에게 제공되지 않습니다.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    className="flex-1"
                    variant="secondary"
                    onClick={() => setShowForm(false)}
                  >
                    취소
                  </Button>
                  <Button type="submit" className="flex-1" variant="primary">
                    컨설팅 신청
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Contact Options */}
          <div className="bg-slate-100 rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">다른 방법으로 문의하기</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <PhoneCall size={32} className="text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">전화</p>
                <p className="font-bold text-gray-900">1577-0000</p>
              </div>
              <div className="text-center">
                <Mail size={32} className="text-green-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">이메일</p>
                <p className="font-bold text-gray-900">biz@fiscus.com</p>
              </div>
              <div className="text-center">
                <MessageSquare size={32} className="text-purple-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">카톡 플러스친구</p>
                <p className="font-bold text-gray-900">@피스커스</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
