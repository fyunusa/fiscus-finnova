'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input } from '@/components/ui';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  TrendingUp,
  Lock,
  X,
} from 'lucide-react';

type InvestorType = 'income-qualified' | 'experienced';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export default function InvestorUpgradePage() {
  const [selectedType, setSelectedType] = useState<InvestorType | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [applicationRef, setApplicationRef] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const upgradeOptions = [
    {
      id: 'income-qualified',
      title: '소득 적격 투자자',
      current: '일반 투자자',
      investmentLimit: 'A0M / 연',
      requirements: [
        '연 소득 5,000만원 이상 증명',
        '최근 1년 납세 증명서 또는 급여 통장',
      ],
      documents: ['tax-return', 'salary-slip'],
      benefits: [
        '투자 한도 상향 (연 1,000만원)',
        '우수 상품 우선 배치',
        '높은 수익률 상품 접근 가능',
      ],
      color: 'from-blue-500 to-blue-600',
      icon: '📈',
    },
    {
      id: 'experienced',
      title: '경험 많은 투자자',
      current: '일반 투자자',
      investmentLimit: '20M / 연',
      requirements: [
        '12개월 이상의 투자 이력 필요',
        '투자 경험 및 거래 내역 제출',
      ],
      documents: ['trading-history'],
      benefits: [
        '투자 한도 상향 (연 2,000만원)',
        '프리미엄 상품 접근 가능',
        '전용 투자 컨설팅 제공',
      ],
      color: 'from-purple-500 to-purple-600',
      icon: '⭐',
    },
  ];

  const selected = upgradeOptions.find((opt) => opt.id === selectedType);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedType && uploadedFiles.length > 0 && agreedToTerms) {
      const ref = `APP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      setApplicationRef(ref);
      setShowSuccessModal(true);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/account">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">투자자 등급 상향</h1>
            <p className="text-gray-600">투자 한도를 높이고 더 많은 상품에 투자하세요</p>
          </div>
        </div>

        {/* Current Status */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">현재 등급</p>
              <h2 className="text-2xl font-bold text-gray-900">일반 투자자</h2>
              <p className="text-gray-600 text-sm mt-1">연 투자 한도: 500만원</p>
            </div>
            <div className="text-5xl">👤</div>
          </div>
        </Card>

        {/* Upgrade Options Selection */}
        {!selectedType ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">상향 등급 선택</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {upgradeOptions.map((option) => (
                <Card
                  key={option.id}
                  onClick={() => setSelectedType(option.id as InvestorType)}
                  className="p-6 hover:shadow-lg cursor-pointer transition-all border-2 border-transparent hover:border-blue-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{option.icon} {option.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">현재: {option.current}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r p-4 rounded-lg text-white mb-4">
                    <p className="text-sm opacity-90">새로운 투자 한도</p>
                    <p className="text-3xl font-bold">{option.investmentLimit}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle size={18} className="text-blue-600" />
                      주요 혜택
                    </h4>
                    <ul className="space-y-1">
                      {option.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold">
                    선택
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Step Indicator */}
            <div className="mb-8 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <span className="text-gray-700 font-medium">등급 선택</span>
              </div>
              <div className="flex-1 h-1 bg-blue-600 mx-2"></div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="text-gray-700 font-medium">서류 제출</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-gray-600 font-medium">완료</span>
              </div>
            </div>

            {/* Selected Upgrade Details */}
            <Card className={`p-6 mb-8 bg-gradient-to-r ${selected?.color} text-white`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selected?.icon} {selected?.title}</h2>
                  <p className="opacity-90 text-sm mt-1">상향 신청: {selected?.current} → {selected?.title}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setUploadedFiles([]);
                    setAgreedToTerms(false);
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">필수 요구사항</h3>
                <ul className="space-y-1 text-sm">
                  {selected?.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="opacity-70">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Document Upload */}
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                서류 업로드
              </h3>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fileInput"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-semibold text-gray-900 mb-1">파일을 여기에 끌어놓거나 클릭하여 선택</p>
                  <p className="text-sm text-gray-600">PDF, JPG, PNG (최대 10MB)</p>
                </label>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">업로드된 파일 ({uploadedFiles.length})</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                            <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(0)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <X size={18} className="text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadedFiles.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm">필수 서류를 업로드해주세요</p>
                </div>
              )}
            </Card>

            {/* Terms Agreement */}
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">약관 동의</h3>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">중요한 안내</p>
                    <p className="text-sm text-gray-700 mt-1">
                      등급 상향 신청 후 1-3 영업일 내 심사 결과를 통보하게 됩니다. 제출된 서류가 부실하거나 요구사항을 충족하지 않을 경우 승인이 거절될 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">등급 상향 신청 약관에 동의합니다</p>
                  <p className="text-sm text-gray-600">
                    투자자 등급 상향에 따른 투자 한도 변경, 상품 접근권 확대 및 관련 약관 변경에 동의합니다
                  </p>
                </div>
              </label>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setSelectedType(null);
                  setUploadedFiles([]);
                  setAgreedToTerms(false);
                }}
                className="flex-1 bg-gray-100 text-gray-900 hover:bg-gray-200 font-semibold"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={uploadedFiles.length === 0 || !agreedToTerms}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                신청
              </Button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <div className="p-8 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">신청이 완료되었습니다</h2>
                <p className="text-gray-600 mb-6">
                  투자자 등급 상향 신청이 접수되었습니다. 1-3 영업일 내에 결과를 통보하겠습니다.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600">신청 번호</p>
                  <p className="font-mono text-lg font-bold text-blue-600 break-all">{applicationRef}</p>
                </div>

                <div className="space-y-3 text-sm text-left mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">예상 심사 기간: 1-3 영업일</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">이메일 및 SMS로 결과 통보</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{selected?.title} 즉시 활성화</span>
                  </div>
                </div>

                <Link href="/account">
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold">
                    확인
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
