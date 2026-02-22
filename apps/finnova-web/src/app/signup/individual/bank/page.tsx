'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';
import { SignupFlowRedirect } from '@/components/SignupFlowRedirect';

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

const BANKS = [
  { code: 'KB', name: 'KB국민은행' },
  { code: 'SHINHAN', name: '신한은행' },
  { code: 'HANA', name: '하나은행' },
  { code: 'WOORI', name: '우리은행' },
  { code: 'NH', name: '농협은행' },
  { code: 'IBK', name: '기업은행' },
  { code: 'SC', name: 'SC제일은행' },
  { code: 'CITIBANK', name: '씨티은행' },
  { code: 'KAKAO', name: '카카오뱅크' },
  { code: 'TOSS', name: '토스뱅크' },
];

export default function BankAccountPage() {
  const router = useRouter();
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });
  const [showBankModal, setShowBankModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBankSelect = (bankName: string) => {
    setBankInfo(prev => ({
      ...prev,
      bankName,
    }));
    setShowBankModal(false);
  };

  const handleChange = (field: keyof BankInfo, value: string) => {
    setBankInfo(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const formatAccountNumber = (value: string) => {
    // Remove non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Format based on bank
    if (bankInfo.bankName === 'KB국민은행' || bankInfo.bankName === '신한은행') {
      // 13-16 digits
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 13)}`;
    }
    return numbers;
  };

  const handleProceed = async () => {
    setError('');

    if (!bankInfo.bankName) {
      setError('은행을 선택해주세요');
      return;
    }

    if (!bankInfo.accountNumber.replace(/\D/g, '').trim()) {
      setError('계좌번호를 입력해주세요');
      return;
    }

    if (!bankInfo.accountHolder.trim()) {
      setError('예금주명을 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      // Validate account (API integration)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark step 6 as completed
      sessionStorage.setItem('signup_step_6_completed', 'true');
      
      // Optionally store bank info
      sessionStorage.setItem('bankInfo', JSON.stringify(bankInfo));
      
      router.push('/signup/individual/verify-account');
    } catch (err) {
      setError('계좌 검증 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupFlowRedirect currentStep={6}>
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <Card className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">6 / 10 단계</span>
              <span className="text-sm font-semibold text-blue-600">계좌 등록</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              계좌 등록
            </h1>
            <p className="text-gray-600 mt-2">
              입출금할 계좌를 등록해주세요
            </p>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <div className="space-y-6 mb-8">
            {/* Bank Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                은행 선택 (필수)
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowBankModal(!showBankModal)}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-400 disabled:opacity-50"
                >
                  <span className={bankInfo.bankName ? 'text-gray-900' : 'text-gray-500'}>
                    {bankInfo.bankName || '은행을 선택하세요'}
                  </span>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Bank Dropdown Modal */}
                {showBankModal && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {BANKS.map(bank => (
                      <button
                        key={bank.code}
                        onClick={() => handleBankSelect(bank.name)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-200 last:border-b-0 font-medium text-gray-900"
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                계좌번호 (필수)
              </label>
              <Input
                type="text"
                placeholder="계좌번호를 입력하세요"
                value={formatAccountNumber(bankInfo.accountNumber)}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                disabled={!bankInfo.bankName || loading}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {bankInfo.bankName || '은행을 먼저 선택해주세요'}
              </p>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                예금주명 (필수)
              </label>
              <Input
                type="text"
                placeholder="예금주 성명을 입력하세요"
                value={bankInfo.accountHolder}
                onChange={(e) => handleChange('accountHolder', e.target.value)}
                disabled={loading}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                본인인증 정보와 일치해야 합니다
              </p>
            </div>
          </div>

          <Alert type="warning" className="mb-6 text-sm">
            <strong>주의:</strong> 등록하신 계좌는 입금과 출금에 사용됩니다. 정확하게 입력해주세요.
          </Alert>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              이전
            </Button>
            <Button
              onClick={handleProceed}
              className="flex-1"
              variant="primary"
              disabled={!bankInfo.bankName || !bankInfo.accountNumber.replace(/\D/g, '') || !bankInfo.accountHolder.trim() || loading}
            >
              {loading ? '검증 중...' : '다음 단계로'}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
    </SignupFlowRedirect>
  );
}
