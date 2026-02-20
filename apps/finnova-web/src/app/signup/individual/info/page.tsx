'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';
import { SignupFlowRedirect } from '@/components/SignupFlowRedirect';
import { openAddressSearch, loadDaumPostcodeScript } from '@/services/daum.service';
import { useSignupFlow } from '@/hooks/useSignupFlow';

interface MemberInfo {
  name: string;
  birthDate: string;
  gender: 'M' | 'F' | '';
  phone: string;
  address: string;
  postcode: string;
  buildingName: string;
}

export default function MemberInfoPage() {
  const router = useRouter();
  const { updateData, completeStep, getStepData } = useSignupFlow();
  const [info, setInfo] = useState<MemberInfo>({
    name: '',
    birthDate: '',
    gender: '',
    phone: '',
    address: '',
    postcode: '',
    buildingName: '',
  });
  const [loading, setLoading] = useState(false);

  // Load stored data on mount
  useEffect(() => {
    const step2Data = getStepData(2) as {
      verifiedName?: string;
      verifiedPhone?: string;
      verifiedBirthDate?: string;
      verifiedGender?: string;
      verificationMethod?: string;
    };
    const stepData = getStepData(4);

    setInfo(prev => ({
      ...prev,
      // Prefill from verification (NICE or Kakao)
      name: step2Data.verifiedName || prev.name,
      phone: step2Data.verifiedPhone || prev.phone,
      birthDate: step2Data.verifiedBirthDate || prev.birthDate,
      gender: (step2Data.verifiedGender as 'M' | 'F' | '') || prev.gender,
      // Prefill address if previously saved
      address: stepData.address || prev.address,
      postcode: stepData.postcode || prev.postcode,
      buildingName: stepData.buildingName || prev.buildingName,
    }));
  }, [getStepData]);

  // Load Daum Postcode script on component mount
  useEffect(() => {
    loadDaumPostcodeScript().catch((error) => {
      console.error('Failed to load Daum Postcode:', error);
    });
  }, []);

  const handleAddressSearch = async () => {
    try {
      const result = await openAddressSearch();
      handleChange('address', result.address);
      handleChange('postcode', result.postcode || '');
      handleChange('buildingName', result.buildingName || result.detailAddress || '');
      console.log('✅ Address selected:', result);
    } catch (error) {
      console.error('🚫 Address search failed:', error);
      alert('주소 검색 기능을 로드할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleChange = (field: keyof MemberInfo, value: string) => {
    setInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProceed = async () => {
    if (!info.name.trim()) {
      alert('이름을 입력해주세요');
      return;
    }
    if (!info.address.trim() || !info.postcode.trim() || !info.buildingName.trim()) {
      alert('주소를 모두 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      // Save address data to signup flow
      updateData({
        address: info.address,
        postcode: info.postcode,
        buildingName: info.buildingName,
        // Also save any manually edited identity fields for Kakao users
        verifiedName: info.name,
        verifiedBirthDate: info.birthDate,
        verifiedGender: info.gender,
        verifiedPhone: info.phone.replace(/\D/g, ''),
      });
      completeStep(4);
      
      console.log('✅ Address information saved');
      router.push('/signup/individual/credentials');
    } catch (error) {
      console.error('Error:', error);
      alert('오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupFlowRedirect currentStep={4}>
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
          <Card className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">4 / 10 단계</span>
              <span className="text-sm font-semibold text-blue-600">개인정보입력</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              개인정보 입력
            </h1>
            <p className="text-gray-600 mt-2">
              본인인증 정보와 주소를 입력해주세요
            </p>
          </div>

          <div className="space-y-6 mb-8">
              {/* Auto-filled Fields — editable if empty (e.g. Kakao users don't get DOB/gender/phone) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 {!info.name && <span className="text-red-500">*</span>}
                </label>
                <Input
                  type="text"
                  value={info.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={!!info.name}
                    placeholder="이름을 입력하세요"
                    className={`w-full ${info.name ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {info.name ? '본인인증 정보에서 자동 입력됨' : '이름을 직접 입력해주세요'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생년월일
                </label>
                <Input
                  type="text"
                  value={info.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    disabled={!!info.birthDate}
                    placeholder="예: 1990-01-15"
                    className={`w-full ${info.birthDate ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {info.birthDate ? '본인인증 정보에서 자동 입력됨' : '카카오 인증은 생년월일을 제공하지 않습니다'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성별
                </label>
                <select
                  value={info.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    disabled={!!info.gender}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 ${info.gender ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                      }`}
                >
                    <option value="">선택하세요</option>
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    {info.gender ? '본인인증 정보에서 자동 입력됨' : '성별을 선택해주세요'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  휴대폰
                </label>
                <Input
                  type="tel"
                  value={info.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={!!info.phone}
                    placeholder="010-1234-5678"
                    className={`w-full ${info.phone ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {info.phone ? '본인인증 정보에서 자동 입력됨' : '휴대폰 번호를 입력해주세요'}
                </p>
              </div>
            </div>

            {/* Manual Input Fields */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                주소 정보 (필수)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주소 (필수)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="주소를 검색하세요"
                      value={info.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddressSearch}
                      variant="outline"
                      disabled={loading}
                    >
                      검색
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    카카오 주소 API를 통해 정확한 주소를 검색합니다
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    우편번호 (필수)
                  </label>
                  <Input
                    type="text"
                    placeholder="우편번호"
                    value={info.postcode}
                    onChange={(e) => handleChange('postcode', e.target.value)}
                    disabled={loading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    건물명 (필수)
                  </label>
                  <Input
                    type="text"
                    placeholder="건물명 또는 구분 정보"
                    value={info.buildingName}
                    onChange={(e) => handleChange('buildingName', e.target.value)}
                    disabled={loading}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <Alert type="info" className="mb-6 text-sm">
            <strong>안내:</strong> 본인인증 정보는 변경할 수 없습니다. 주소는 정확하게 입력해주세요.
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
              disabled={!info.address.trim() || !info.postcode.trim() || !info.buildingName.trim() || loading}
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
