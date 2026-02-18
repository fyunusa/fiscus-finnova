'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert } from '@/components/ui';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CheckboxState {
  TAC_1: boolean;
  TAC_2: boolean;
  TAC_3: boolean;
  TAC_5: boolean;
  consent: boolean;
}

interface ExpandedState {
  [key: string]: boolean;
}

export default function CorporateTermsPage() {
  const router = useRouter();
  const [checkboxes, setCheckboxes] = useState<CheckboxState>({
    TAC_1: false,
    TAC_2: false,
    TAC_3: false,
    TAC_5: false,
    consent: false,
  });
  const [expanded, setExpanded] = useState<ExpandedState>({
    TAC_1: false,
    TAC_2: false,
    TAC_3: false,
    TAC_5: false,
  });

  const handleCheckboxChange = (key: keyof CheckboxState) => {
    setCheckboxes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCheckAll = () => {
    const allChecked = Object.values(checkboxes).every((v) => v);
    if (allChecked) {
      setCheckboxes({
        TAC_1: false,
        TAC_2: false,
        TAC_3: false,
        TAC_5: false,
        consent: false,
      });
    } else {
      setCheckboxes({
        TAC_1: true,
        TAC_2: true,
        TAC_3: true,
        TAC_5: true,
        consent: true,
      });
    }
  };

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allChecked = Object.values(checkboxes).every((v) => v);
  const mandatoryChecked = checkboxes.TAC_1 && checkboxes.TAC_2 && checkboxes.TAC_3 && checkboxes.consent;

  const handleNext = () => {
    if (!mandatoryChecked) return;
    
    // Store terms agreement in session for final submission
    sessionStorage.setItem('agreedToTerms', 'true');
    sessionStorage.setItem('agreedToPrivacy', checkboxes.TAC_2.toString());
    sessionStorage.setItem('agreedToMarketing', checkboxes.TAC_5.toString());
    
    router.push('/signup/corporate/verify');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              약관 및 동의
            </h1>
            <p className="text-gray-600">
              1 / 5 단계
            </p>
          </div>

          <Card className="mb-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                필수 약관에 동의해주세요
              </h2>
              <Button
                onClick={handleCheckAll}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {allChecked ? '전부 해제' : '전체 동의'}
              </Button>
            </div>

            <div className="space-y-3">
              {/* TAC_1: Service Terms */}
              <div className="border rounded-lg">
                <div className="p-4 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={checkboxes.TAC_1}
                    onChange={() => handleCheckboxChange('TAC_1')}
                    className="w-5 h-5 rounded"
                  />
                  <label className="flex-1 cursor-pointer font-semibold text-gray-900">
                    서비스 이용약관 (필수)
                  </label>
                  <button
                    onClick={() => toggleExpanded('TAC_1')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expanded.TAC_1 ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                  </button>
                </div>
                {expanded.TAC_1 && (
                  <div className="px-4 pb-4 bg-gray-50 text-sm text-gray-700 border-t max-h-48 overflow-y-auto">
                    <p className="mb-3">
                      [법인용] 핀노바 서비스 이용약관
                    </p>
                    <p className="mb-2">
                      본 약관은 핀노바 플랫폼에서 제공하는 P2P 투자 서비스 이용에 관한 법인 사용자의 권리와 의무를 규정합니다.
                    </p>
                    <p>
                      서비스 이용 중 발생하는 모든 거래는 관련 법규에 따라 진행되며, 사용자는 진정성 있는 정보 제공에 동의합니다.
                    </p>
                  </div>
                )}
              </div>

              {/* TAC_2: Privacy Policy */}
              <div className="border rounded-lg">
                <div className="p-4 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={checkboxes.TAC_2}
                    onChange={() => handleCheckboxChange('TAC_2')}
                    className="w-5 h-5 rounded"
                  />
                  <label className="flex-1 cursor-pointer font-semibold text-gray-900">
                    개인정보 수집 및 이용동의 (필수)
                  </label>
                  <button
                    onClick={() => toggleExpanded('TAC_2')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expanded.TAC_2 ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                  </button>
                </div>
                {expanded.TAC_2 && (
                  <div className="px-4 pb-4 bg-gray-50 text-sm text-gray-700 border-t max-h-48 overflow-y-auto">
                    <p className="mb-3">
                      개인정보 수집 및 이용 동의
                    </p>
                    <p className="mb-2">
                      회사는 서비스 제공을 위해 법인 정보, 대표자 정보, 사업자 등록 정보 등을 수집합니다.
                    </p>
                    <p>
                      모든 정보는 보안이 강화된 시스템에서 관리되며, 법령에서 요구하는 경우를 제외하고는 제3자에게 공개되지 않습니다.
                    </p>
                  </div>
                )}
              </div>

              {/* TAC_3: Financial Transaction */}
              <div className="border rounded-lg">
                <div className="p-4 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={checkboxes.TAC_3}
                    onChange={() => handleCheckboxChange('TAC_3')}
                    className="w-5 h-5 rounded"
                  />
                  <label className="flex-1 cursor-pointer font-semibold text-gray-900">
                    금융거래 약관 (필수)
                  </label>
                  <button
                    onClick={() => toggleExpanded('TAC_3')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expanded.TAC_3 ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                  </button>
                </div>
                {expanded.TAC_3 && (
                  <div className="px-4 pb-4 bg-gray-50 text-sm text-gray-700 border-t max-h-48 overflow-y-auto">
                    <p className="mb-3">
                      금융거래 약관
                    </p>
                    <p className="mb-2">
                      법인 투자자는 핀노바 플랫폼을 통해 P2P 금융거래에 참여할 수 있습니다.
                    </p>
                    <p>
                      모든 거래는 금융감독 규정을 준수하며 진행되며, 손실 발생 시 플랫폼은 책임지지 않습니다.
                    </p>
                  </div>
                )}
              </div>

              {/* TAC_5: Marketing */}
              <div className="border rounded-lg">
                <div className="p-4 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={checkboxes.TAC_5}
                    onChange={() => handleCheckboxChange('TAC_5')}
                    className="w-5 h-5 rounded"
                  />
                  <label className="flex-1 cursor-pointer text-gray-900">
                    마케팅 정보 수신 동의 (선택)
                  </label>
                  <button
                    onClick={() => toggleExpanded('TAC_5')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expanded.TAC_5 ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                  </button>
                </div>
                {expanded.TAC_5 && (
                  <div className="px-4 pb-4 bg-gray-50 text-sm text-gray-700 border-t max-h-48 overflow-y-auto">
                    <p className="mb-3">
                      마케팅 정보 수신 동의
                    </p>
                    <p>
                      선택 항목이므로 거부해도 서비스 이용에는 문제가 없습니다. 동의할 경우 최신 투자 상품과 이벤트 정보를 받을 수 있습니다.
                    </p>
                  </div>
                )}
              </div>

              {/* Consent Confirmation */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={checkboxes.consent}
                    onChange={() => handleCheckboxChange('consent')}
                    className="w-5 h-5 rounded mt-1"
                  />
                  <label className="flex-1 cursor-pointer text-sm text-gray-700">
                    <strong>본 약관을 모두 확인하였으며 동의합니다.</strong> 
                    위의 필수 약관에 모두 동의해야 회원가입을 진행할 수 있습니다.
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {!mandatoryChecked && (
            <Alert type="warning" className="mb-6">
              필수 약관에 모두 동의해주세요.
            </Alert>
          )}

          <div className="flex gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              이전
            </Button>
            <Button
              onClick={handleNext}
              disabled={!mandatoryChecked}
              className="flex-1"
            >
              다음
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
