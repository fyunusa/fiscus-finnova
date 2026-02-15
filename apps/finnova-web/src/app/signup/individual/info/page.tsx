'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';

interface MemberInfo {
  name: string;
  birthDate: string;
  gender: 'M' | 'F' | '';
  phone: string;
  address: string;
  detailAddress: string;
}

export default function MemberInfoPage() {
  const router = useRouter();
  const [info, setInfo] = useState<MemberInfo>({
    name: '김철수', // Auto-filled from verification
    birthDate: '1990-01-15', // Auto-filled from verification
    gender: 'M', // Auto-filled from verification
    phone: '010-1234-5678', // Auto-filled from verification
    address: '',
    detailAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const handleChange = (field: keyof MemberInfo, value: string) => {
    setInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProceed = async () => {
    if (!info.address.trim() || !info.detailAddress.trim()) {
      alert('주소를 모두 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      // Save member info (API integration)
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/signup/individual/credentials');
    } catch (error) {
      console.error('Error:', error);
      alert('오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
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
            {/* Auto-filled Fields (Disabled) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <Input
                  type="text"
                  value={info.name}
                  disabled
                  className="w-full bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  본인인증 정보에서 자동 입력됨
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생년월일
                </label>
                <Input
                  type="text"
                  value={info.birthDate}
                  disabled
                  className="w-full bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  본인인증 정보에서 자동 입력됨
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
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  본인인증 정보에서 자동 입력됨
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  휴대폰
                </label>
                <Input
                  type="tel"
                  value={info.phone}
                  disabled
                  className="w-full bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  본인인증 정보에서 자동 입력됨
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
                      onClick={() => setShowAddressModal(true)}
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
                    상세주소 (필수)
                  </label>
                  <Input
                    type="text"
                    placeholder="아파트 동, 호수 등을 입력하세요"
                    value={info.detailAddress}
                    onChange={(e) => handleChange('detailAddress', e.target.value)}
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
              disabled={!info.address.trim() || !info.detailAddress.trim() || loading}
            >
              {loading ? '진행 중...' : '다음 단계로'}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
