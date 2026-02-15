'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';
import { ChevronDown } from 'lucide-react';

const KOREAN_BANKS = [
  { code: '004', name: '국민은행' },
  { code: '002', name: '중앙은행' },
  { code: '003', name: '기업은행' },
  { code: '005', name: '외환은행' },
  { code: '020', name: '우리은행' },
  { code: '081', name: 'KEB하나은행' },
  { code: '088', name: '신한은행' },
  { code: '011', name: 'NH농협은행' },
  { code: '023', name: 'SC제일은행' },
  { code: '050', name: '저축은행' },
];

export default function CorporateBankPage() {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const bankName = KOREAN_BANKS.find((b) => b.code === selectedBank)?.name || '';

  const formatAccountNumber = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const handleNext = async () => {
    if (!selectedBank || !accountNumber || !accountHolder) {
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/signup/corporate/verify-account');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const allFilled = selectedBank && accountNumber && accountHolder;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              사업계좌 등록
            </h1>
            <p className="text-gray-600">
              6 / 11 단계
            </p>
          </div>

          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                입금받을 계좌를 등록해주세요
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                투자금 배분과 수익금 지급이 이 계좌로 진행됩니다.
              </p>

              <div className="space-y-4">
                {/* Bank Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    은행 선택 (필수)
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowBankDropdown(!showBankDropdown)}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between bg-white hover:border-gray-400 disabled:bg-gray-100"
                    >
                      <span className={selectedBank ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                        {bankName || '은행을 선택해주세요'}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-gray-600 transition-transform ${
                          showBankDropdown ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showBankDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 mt-1 max-h-64 overflow-y-auto">
                        {KOREAN_BANKS.map((bank) => (
                          <button
                            key={bank.code}
                            onClick={() => {
                              setSelectedBank(bank.code);
                              setShowBankDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0 flex items-center justify-between"
                          >
                            <span className="text-gray-900">{bank.name}</span>
                            {selectedBank === bank.code && (
                              <span className="text-blue-600 font-semibold">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    계좌번호 (필수)
                  </label>
                  <Input
                    type="text"
                    placeholder="계좌번호 (숫자만 입력)"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(formatAccountNumber(e.target.value))}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    하이픈(-) 없이 숫자만 입력해주세요
                  </p>
                </div>

                {/* Account Holder */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    예금주명 (필수)
                  </label>
                  <Input
                    type="text"
                    placeholder="예금주 이름"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    계좌에 등록된 예금주명과 정확히 일치해야 합니다
                  </p>
                </div>
              </div>
            </div>

            <Alert type="info" className="mb-6">
              <strong>안내:</strong> 계좌 인증 후 1원이 입금되며, 입금 영수증에 표기된 코드로 계좌를 확인합니다.
            </Alert>

            <div className="flex gap-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                이전
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
                loading={loading}
                disabled={!allFilled}
              >
                다음
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
