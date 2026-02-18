'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Checkbox } from '@/components/ui';
import { SignupFlowRedirect } from '@/components/SignupFlowRedirect';
import { useSignupFlow } from '@/hooks/useSignupFlow';

interface TermsCheckboxes {
  tac1: boolean;
  tac2: boolean;
  tac3: boolean;
  tac5: boolean;
  consent: boolean;
}

export default function IndividualTermsPage() {
  const router = useRouter();
  const { updateData, completeStep, getStepData } = useSignupFlow();
  const [terms, setTerms] = useState<TermsCheckboxes>({
    tac1: false,
    tac2: false,
    tac3: false,
    tac5: false,
    consent: false,
  });
  const [loading, setLoading] = useState(false);

  // Load stored agreements on mount
  useEffect(() => {
    const stepData = getStepData(1);
    if (stepData.agreedToTerms !== undefined) {
      setTerms({
        tac1: stepData.agreedToTerms || false,
        tac2: stepData.agreedToPrivacy || false,
        tac3: stepData.agreedToMarketing || false,
        tac5: false,
        consent: (stepData.agreedToTerms && stepData.agreedToPrivacy) || false,
      });
    }
  }, [getStepData]);

  const allAgreed = Object.values(terms).every(value => value === true);

  const handleCheckboxChange = (key: keyof TermsCheckboxes) => {
    setTerms(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAgreeAll = () => {
    const allChecked = Object.values(terms).every(v => v === true);
    const newState = !allChecked;
    setTerms({
      tac1: newState,
      tac2: newState,
      tac3: newState,
      tac5: newState,
      consent: newState,
    });
  };

  const handleProceed = async () => {
    if (!allAgreed) {
      return;
    }

    setLoading(true);
    try {
      // Save agreements to signup flow
      updateData({
        agreedToTerms: terms.tac1,
        agreedToPrivacy: terms.tac2,
        agreedToMarketing: terms.tac3,
      });

      // Mark step 1 as completed
      completeStep(1);

      // Navigate to step 2 (NICE verification)
      router.push('/signup/individual/verify');
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupFlowRedirect currentStep={1}>
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <Card className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">1 / 10 단계</span>
              <span className="text-sm font-semibold text-blue-600">약관동의</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              약관 및 동의사항
            </h1>
            <p className="text-gray-600 mt-2">
              핀노바 서비스를 이용하기 위해 다음 약관에 동의해주세요
            </p>
          </div>

          {/* Terms Checkboxes */}
          <div className="space-y-4 mb-8">
            {/* All Agree */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allAgreed}
                  onChange={handleAgreeAll}
                  className="w-5 h-5 rounded border-2 border-blue-500 accent-blue-600"
                />
                <span className="ml-3 font-semibold text-gray-900">
                  모든 약관에 동의합니다
                </span>
              </label>
            </div>

            {/* Individual Terms */}
            <div className="space-y-3">
              <label className="flex items-start cursor-pointer hover:bg-gray-50 p-3 rounded">
                <input
                  type="checkbox"
                  checked={terms.tac1}
                  onChange={() => handleCheckboxChange('tac1')}
                  className="w-5 h-5 rounded border-2 border-gray-300 accent-blue-600 mt-1 flex-shrink-0"
                />
                <div className="ml-3 flex-1">
                  <span className="block text-gray-900 font-medium">
                    서비스 이용약관 동의 (필수)
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    핀노바 서비스의 이용 조건 및 규정에 동의합니다
                  </p>
                </div>
              </label>

              <label className="flex items-start cursor-pointer hover:bg-gray-50 p-3 rounded">
                <input
                  type="checkbox"
                  checked={terms.tac2}
                  onChange={() => handleCheckboxChange('tac2')}
                  className="w-5 h-5 rounded border-2 border-gray-300 accent-blue-600 mt-1 flex-shrink-0"
                />
                <div className="ml-3 flex-1">
                  <span className="block text-gray-900 font-medium">
                    개인정보 처리방침 동의 (필수)
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    개인정보 수집 및 처리 방식에 동의합니다
                  </p>
                </div>
              </label>

              <label className="flex items-start cursor-pointer hover:bg-gray-50 p-3 rounded">
                <input
                  type="checkbox"
                  checked={terms.tac3}
                  onChange={() => handleCheckboxChange('tac3')}
                  className="w-5 h-5 rounded border-2 border-gray-300 accent-blue-600 mt-1 flex-shrink-0"
                />
                <div className="ml-3 flex-1">
                  <span className="block text-gray-900 font-medium">
                    온라인투자연계금융 이용약관 동의 (필수)
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    온투법 준수 및 투자 운영 규칙에 동의합니다
                  </p>
                </div>
              </label>

              <label className="flex items-start cursor-pointer hover:bg-gray-50 p-3 rounded">
                <input
                  type="checkbox"
                  checked={terms.tac5}
                  onChange={() => handleCheckboxChange('tac5')}
                  className="w-5 h-5 rounded border-2 border-gray-300 accent-blue-600 mt-1 flex-shrink-0"
                />
                <div className="ml-3 flex-1">
                  <span className="block text-gray-900 font-medium">
                    전자금융거래 이용약관 동의 (필수)
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    송금, 결제 등 전자금융 거래에 동의합니다
                  </p>
                </div>
              </label>

              <label className="flex items-start cursor-pointer hover:bg-gray-50 p-3 rounded">
                <input
                  type="checkbox"
                  checked={terms.consent}
                  onChange={() => handleCheckboxChange('consent')}
                  className="w-5 h-5 rounded border-2 border-gray-300 accent-blue-600 mt-1 flex-shrink-0"
                />
                <div className="ml-3 flex-1">
                  <span className="block text-gray-900 font-medium">
                    개인정보 이용 동의 (필수)
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    회원가입 및 서비스 운영을 위한 정보 이용에 동의합니다
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Info Alert */}
          <Alert type="info" className="mb-6">
            <strong>안내:</strong> 모든 약관에 동의해야 회원가입을 진행할 수 있습니다. 상세 내용은 각 약관을 참고하세요.
          </Alert>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              이전
            </Button>
            <Button
              onClick={handleProceed}
              disabled={!allAgreed || loading}
              className="flex-1"
              variant="primary"
            >
              {loading ? '진행 중...' : '다음 단계로'}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
    </SignupFlowRedirect>
  );
}
