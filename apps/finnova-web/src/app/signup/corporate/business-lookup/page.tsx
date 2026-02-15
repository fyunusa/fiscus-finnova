'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';
import { Search, Loader } from 'lucide-react';

interface BusinessInfo {
  businessNumber: string;
  companyName: string;
  representative: string;
  businessType: string;
  startDate: string;
  status: string;
}

export default function CorporateBusinessLookupPage() {
  const router = useRouter();
  const [businessNumber, setBusinessNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<BusinessInfo | null>(null);
  const [searched, setSearched] = useState(false);

  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
  };

  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBusinessNumber(e.target.value);
    setBusinessNumber(formatted);
  };

  const handleSearch = async () => {
    if (!businessNumber.trim() || !companyName.trim()) {
      setError('사업자등록번호와 회사명을 입력해주세요');
      return;
    }

    const cleanNumber = businessNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      setError('올바른 사업자등록번호를 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      // 실제로는 NTS API 호출
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 데모: 특정 번호만 성공
      if (cleanNumber === '1234567890') {
        setSearchResults({
          businessNumber: businessNumber,
          companyName: companyName,
          representative: '김철수',
          businessType: '금융·보험',
          startDate: '2020-01-15',
          status: '계속사업장',
        });
      } else {
        setError('등록되지 않은 사업자등록번호입니다. (데모: 123-45-67890)');
        setSearchResults(null);
      }
    } catch (err) {
      setError('조회에 실패했습니다. 다시 시도해주세요.');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!searchResults) return;

    setLoading(true);
    try {
      // 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push('/signup/corporate/info');
    } catch (err) {
      setError('처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              사업자 정보 조회
            </h1>
            <p className="text-gray-600">
              3 / 11 단계
            </p>
          </div>

          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                사업자등록정보를 확인해주세요
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                국세청 연동으로 사업자 정보를 확인합니다. (NTS API 연동)
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    사업자등록번호 (필수)
                  </label>
                  <Input
                    type="text"
                    placeholder="123-45-67890"
                    value={businessNumber}
                    onChange={handleBusinessNumberChange}
                    disabled={loading || !!searchResults}
                    maxLength={12}
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    데모용: <strong>123-45-67890</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    회사명 (필수)
                  </label>
                  <Input
                    type="text"
                    placeholder="회사 이름"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={loading || !!searchResults}
                  />
                </div>
              </div>
            </div>

            {error && <Alert type="error" className="mb-4">{error}</Alert>}

            {searchResults && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2 mb-4">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm font-semibold text-green-900">
                    조회 완료
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">사업자등록번호</p>
                      <p className="font-semibold text-gray-900">
                        {searchResults.businessNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">상태</p>
                      <p className="font-semibold text-green-600">
                        {searchResults.status}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">회사명</p>
                    <p className="font-semibold text-gray-900">
                      {searchResults.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">대표자</p>
                    <p className="font-semibold text-gray-900">
                      {searchResults.representative}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-gray-600">업종</p>
                      <p className="text-sm text-gray-900">
                        {searchResults.businessType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">개업일</p>
                      <p className="text-sm text-gray-900">
                        {searchResults.startDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                이전
              </Button>
              {!searchResults ? (
                <Button
                  onClick={handleSearch}
                  className="flex-1"
                  loading={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader size={16} className="animate-spin" />
                      조회 중...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search size={16} />
                      조회하기
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleConfirm}
                  className="flex-1"
                  loading={loading}
                >
                  확인했습니다
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
