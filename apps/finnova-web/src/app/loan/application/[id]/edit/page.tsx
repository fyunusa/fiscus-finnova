'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { loanService, LoanApplication } from '@/services/loanService';
import AddressSearch from '@/components/AddressSearch';
import MapDisplay from '@/components/MapDisplay';
import PropertyValuation from '@/components/PropertyValuation';

const collateralTypeMap: { [key: string]: string } = {
  '아파트': 'apartment',
  '단독주택': 'apartment',
  '다세대/빌라': 'building',
  '상가': 'building',
  '건물': 'building',
  '토지': 'land',
  '기타': 'other',
};

const reverseCollateralTypeMap: { [key: string]: string } = {
  'apartment': '아파트',
  'building': '건물',
  'land': '토지',
  'vehicle': '자동차',
  'other': '기타',
};

const collateralTypes = [
  '아파트',
  '단독주택',
  '다세대/빌라',
  '상가',
  '건물',
  '토지',
  '기타',
];

interface FormData {
  requestedLoanAmount: number;
  collateralValue: number;
  collateralAddress: string;
  collateralDetails: string;
  collateralLat?: number;
  collateralLng?: number;
}

export default function EditApplicationPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<FormData>({
    requestedLoanAmount: 0,
    collateralValue: 0,
    collateralAddress: '',
    collateralDetails: '',
    collateralLat: undefined,
    collateralLng: undefined,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loanService.getApplication(params.id);
        
        setFormData({
          requestedLoanAmount: data.requestedLoanAmount,
          collateralValue: data.collateralValue,
          collateralAddress: data.collateralAddress,
          collateralDetails: data.collateralDetails || '',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '신청 정보를 불러올 수 없습니다.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [params.id]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      collateralAddress: address,
      collateralLat: lat,
      collateralLng: lng,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await loanService.updateApplication(params.id, {
        requestedLoanAmount: formData.requestedLoanAmount,
        collateralValue: formData.collateralValue,
        collateralAddress: formData.collateralAddress,
        collateralDetails: formData.collateralDetails || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = `/loan/application/${params.id}`;
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">신청 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && loading === false) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href={`/loan/application/${params.id}`}>
              <Button className="mb-6 flex items-center gap-2 bg-gray-200 text-gray-900 hover:bg-gray-300">
                <ArrowLeft size={20} />
                돌아가기
              </Button>
            </Link>

            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">오류</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href={`/loan/application/${params.id}`} className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-4">
              <ArrowLeft size={20} />
              <span>돌아가기</span>
            </Link>
            <h1 className="text-4xl font-bold mb-2">신청 정보 수정</h1>
            <p className="text-blue-200">대출 신청 정보를 수정할 수 있습니다</p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">저장되었습니다</p>
                  <p className="text-sm text-green-800">잠시 후 상세 페이지로 이동합니다...</p>
                </div>
              </div>
            )}

            {error && !success && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  대출 신청 금액 (원) *
                </label>
                <input
                  type="number"
                  value={formData.requestedLoanAmount || ''}
                  onChange={(e) => handleInputChange('requestedLoanAmount', parseInt(e.target.value) || 0)}
                  placeholder="예: 500000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Collateral Value */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  담보 평가액 (원) *
                </label>
                <input
                  type="number"
                  value={formData.collateralValue || ''}
                  onChange={(e) => handleInputChange('collateralValue', parseInt(e.target.value) || 0)}
                  placeholder="예: 500000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Collateral Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  담보 주소 *
                </label>
                <AddressSearch
                  onSelectAddress={handleAddressSelect}
                  placeholder="주소를 검색하세요"
                  defaultValue={formData.collateralAddress}
                />
                {formData.collateralAddress && (
                  <p className="text-xs text-green-600 mt-1">✓ 주소: {formData.collateralAddress}</p>
                )}
              </div>

              {/* Map Display */}
              {formData.collateralAddress && formData.collateralLat && formData.collateralLng && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    📍 담보 위치 지도
                  </label>
                  <MapDisplay
                    markers={[{
                      lat: formData.collateralLat,
                      lng: formData.collateralLng,
                      title: formData.collateralAddress,
                    }]}
                    center={{ lat: formData.collateralLat, lng: formData.collateralLng }}
                    zoom={15}
                    height="300px"
                  />
                </div>
              )}

              {/* Property Valuation */}
              {formData.collateralAddress && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    💎 시세 정보 및 담보 검증
                  </label>
                  <PropertyValuation
                    address={formData.collateralAddress}
                    claimedValue={formData.collateralValue}
                    readOnly={false}
                  />
                </div>
              )}

              {/* Collateral Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  추가 정보 (선택사항)
                </label>
                <textarea
                  value={formData.collateralDetails}
                  onChange={(e) => handleInputChange('collateralDetails', e.target.value)}
                  placeholder="담보 상세 정보를 입력해주세요"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <Link href={`/loan/application/${params.id}`} className="flex-1">
                  <Button className="w-full bg-gray-200 text-gray-900 hover:bg-gray-300 py-3 rounded-lg font-semibold">
                    취소
                  </Button>
                </Link>
                <Button
                  onClick={handleSave}
                  disabled={saving || success}
                  className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                    saving || success ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      저장하기 <ArrowRight size={20} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
