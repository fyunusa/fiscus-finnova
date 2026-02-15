'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';

export default function CorporateInfoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '(주)핀테크솔루션',
    representative: '김철수',
    businessNumber: '123-45-67890',
    businessType: '금융·보험',
    address: '',
    detailAddress: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = async () => {
    if (!formData.address.trim() || !formData.phone.trim() || !formData.email.trim()) {
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/signup/corporate/credentials');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const allFilled = formData.address.trim() && formData.phone.trim() && formData.email.trim();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              기업 정보 입력
            </h1>
            <p className="text-gray-600">
              4 / 11 단계
            </p>
          </div>

          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                기업 정보를 확인해주세요
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                국세청 조회 데이터입니다. 변경이 필요하면 알려주세요.
              </p>

              <div className="space-y-4">
                {/* 자동 입력 필드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    회사명
                  </label>
                  <Input
                    type="text"
                    value={formData.companyName}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-600 mt-1">자동 입력됨 (수정 불가)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    대표자명
                  </label>
                  <Input
                    type="text"
                    value={formData.representative}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-600 mt-1">자동 입력됨 (수정 불가)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      사업자등록번호
                    </label>
                    <Input
                      type="text"
                      value={formData.businessNumber}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      업종
                    </label>
                    <Input
                      type="text"
                      value={formData.businessType}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="text-sm font-semibold text-gray-900 mb-4">
                    추가 정보
                  </p>

                  {/* 수정 가능 필드 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        주소 (필수)
                      </label>
                      <Input
                        type="text"
                        name="address"
                        placeholder="기업 주소"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        상세주소 (선택)
                      </label>
                      <Input
                        type="text"
                        name="detailAddress"
                        placeholder="예: 5층 501호"
                        value={formData.detailAddress}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        대표번호 (필수)
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="02-0000-0000"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        이메일 (필수)
                      </label>
                      <Input
                        type="email"
                        name="email"
                        placeholder="corporate@company.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Alert type="info" className="mb-6">
              기업 정보는 나중에 관리자 페이지에서 변경할 수 있습니다.
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
