'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';
import { openAddressSearch, loadDaumPostcodeScript } from '@/services/daum.service';
import { MapPin } from 'lucide-react';

export default function CorporateInfoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '(주)핀테크솔루션',
    representative: '김철수',
    businessNumber: '123-45-67890',
    businessType: '금융·보험',
    address: '',
    postcode: '',
    detailAddress: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  // Load Daum Postcode script on component mount
  useEffect(() => {
    loadDaumPostcodeScript().catch((error) => {
      console.error('Failed to load Daum Postcode:', error);
    });

    // Prefill representative phone from previous step (Step 2 verification)
    const representativePhone = sessionStorage.getItem('representativePhone');
    if (representativePhone) {
      // Format phone number for display
      const formatted = representativePhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
      setFormData((prev) => ({
        ...prev,
        phone: formatted,
      }));
    }

    // Prefill business name and registration number from Step 3
    const businessName = sessionStorage.getItem('businessName');
    const businessNumber = sessionStorage.getItem('businessRegistrationNumber');
    const businessAddress = sessionStorage.getItem('businessAddress');
    
    if (businessName || businessNumber || businessAddress) {
      setFormData((prev) => ({
        ...prev,
        companyName: businessName || prev.companyName,
        businessNumber: businessNumber ? `${businessNumber.slice(0, 3)}-${businessNumber.slice(3, 5)}-${businessNumber.slice(5)}` : prev.businessNumber,
        address: businessAddress || prev.address,
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressSearch = async () => {
    try {
      const result = await openAddressSearch();
      handleChange('address', result.address);
      handleChange('postcode', result.postcode);
      handleChange('detailAddress', result.buildingName || result.detailAddress || '');
      console.log('✅ Address selected:', result);
    } catch (error) {
      console.error('🚫 Address search failed:', error);
    }
  };

  const handleNext = async () => {
    if (!formData.address.trim() || !formData.postcode.trim() || !formData.phone.trim()) {
      return;
    }

    setLoading(true);
    try {
      // Store corporate info in session for final submission
      sessionStorage.setItem('corporateAddress', formData.address);
      sessionStorage.setItem('corporatePostcode', formData.postcode);
      sessionStorage.setItem('corporateBuildingName', formData.detailAddress);
      sessionStorage.setItem('corporatePhone', formData.phone);
      
      router.push('/signup/corporate/credentials');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const allFilled = formData.address.trim() && formData.postcode.trim() && formData.phone.trim();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              기업 정보 입력
            </h1>
            <p className="text-gray-600">
              4 / 5 단계
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
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          name="address"
                          placeholder="주소 검색을 클릭해주세요"
                          value={formData.address}
                          disabled
                          className="flex-1 bg-gray-100"
                        />
                        <Button
                          onClick={handleAddressSearch}
                          variant="outline"
                          disabled={loading}
                          className="flex-shrink-0"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          검색
                        </Button>
                      </div>
                      {formData.postcode && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ 우편번호: {formData.postcode}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        건물명 (선택)
                      </label>
                      <Input
                        type="text"
                        name="detailAddress"
                        placeholder="예: 핀테크빌딩"
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
                        className={formData.phone ? 'bg-blue-50' : ''}
                      />
                      {formData.phone && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Step 2에서 확인된 번호입니다
                        </p>
                      )}
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
                variant="primary"
                disabled={!allFilled || loading}
              >
                {loading ? '진행 중...' : '다음'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
