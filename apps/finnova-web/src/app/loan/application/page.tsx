'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Button, Badge } from '@/components/ui';
import Link from 'next/link';
import { ChevronRight, CheckCircle, DollarSign, FileText, User, ArrowRight, MapPin } from 'lucide-react';
import { loanService } from '@/services/loanService';
import AddressSearch from '@/components/AddressSearch';
import MapDisplay from '@/components/MapDisplay';
import PropertyValuation from '@/components/PropertyValuation';
import * as userService from '@/services/user.service';
import * as virtualAccountService from '@/services/virtual-account.service';

interface FormData {
  loanProductId: string;
  requestedLoanAmount: number;
  loanPeriod: number;
  collateralType: string;
  collateralValue: number;
  collateralAddress: string;
  collateralDetails: string;
  applicantNotes: string;
  fundingAccountId: string;
  collateralLat?: number;
  collateralLng?: number;
}

interface LoanProductDisplay {
  id: string;
  name: string;
  ltv: number;
  rate: string;
  minAmount: number;
  maxAmount: number;
}

// Mapping collateral type display names to backend enum values
const collateralTypeMap: { [key: string]: string } = {
  '아파트': 'apartment',
  '단독주택': 'apartment',
  '다세대/빌라': 'building',
  '상가': 'building',
  '건물': 'building',
  '토지': 'land',
  '기타': 'other',
};

// Reverse mapping: enum value to display name
const reverseCollateralTypeMap: { [key: string]: string } = {
  'apartment': '아파트',
  'building': '건물',
  'land': '토지',
  'vehicle': '자동차',
  'other': '기타',
};

// Bank code to name mapping
const BANK_CODE_MAP: { [key: string]: string } = {
  'bk_111': '국민은행',
  'bk_004': '우리은행',
  'bk_020': '신한은행',
  'bk_081': '하나은행',
  'bk_088': '신협',
  'bk_003': '기업은행',
};

// Helper function to get bank name from code
const getBankName = (bankCode: string): string => {
  return BANK_CODE_MAP[bankCode] || bankCode;
};

// Helper function to get display name from enum value
const getCollateralTypeDisplayName = (enumValue: string | null | undefined): string => {
  if (!enumValue) return '선택안됨';
  return reverseCollateralTypeMap[enumValue] || enumValue;
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

export default function ApplicationPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicationPageContent />
    </Suspense>
  );
}

function ApplicationPageContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [applicationNo, setApplicationNo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loanProducts, setLoanProducts] = useState<LoanProductDisplay[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    loanProductId: '',
    requestedLoanAmount: 0,
    loanPeriod: 12,
    collateralType: '',
    collateralValue: 0,
    collateralAddress: '',
    collateralDetails: '',
    applicantNotes: '',
    fundingAccountId: '',
    collateralLat: undefined,
    collateralLng: undefined,
  });

  // Load loan products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const products = await loanService.getProducts(true);
        
        // Transform API response to display format
        const displayProducts = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          ltv: product.maxLTV,
          rate: `${product.minInterestRate}-${product.maxInterestRate}%`,
          minAmount: product.minLoanAmount,
          maxAmount: product.maxLoanAmount,
        }));
        
        setLoanProducts(displayProducts);
        console.log('✅ Loan products loaded:', displayProducts);
      } catch (err) {
        console.error('Failed to load loan products:', err);
        setError('대출 상품을 불러올 수 없습니다.');
      } finally {
        setProductsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Load user's bank and virtual accounts on mount
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        // Fetch actual bank accounts from API
        const bankResponse = await userService.getBankAccounts();
        const bankAccounts = bankResponse.data?.map((account: any) => ({
          id: account.id,
          name: `${getBankName(account.bankCode)} - ${account.accountNumber}`,
          type: 'bank',
          balance: account.balance || 0,
        })) || [];

        // Fetch virtual account info from API
        const virtualResponse = await virtualAccountService.getVirtualAccountInfo();
        const virtualAccounts = virtualResponse.data
          ? [
              {
                id: virtualResponse.data.accountNumber,
                name: `가상계좌 - ${virtualResponse.data.accountNumber}`,
                type: 'virtual',
                balance: virtualResponse.data.availableBalance || 0,
              },
            ]
          : [];

        // Combine both account types
        setAccounts([...bankAccounts, ...virtualAccounts]);
        console.log('✅ Accounts loaded:', { bankAccounts, virtualAccounts });
      } catch (err) {
        console.error('Failed to load accounts:', err);
        // Still allow user to proceed, they'll see an empty account list
        setAccounts([]);
      }
    };
    loadAccounts();
  }, []);

  // Handle property query parameter from apartment page
  useEffect(() => {
    if (!searchParams) return;
    
    const propertyId = searchParams.get('property');
    if (propertyId && loanProducts.length > 0) {
      console.log('🏠 Auto-populating from property ID:', propertyId);
      
      // Find the apartment loan product (assuming first product)
      const apartmentProduct = loanProducts.find(p => p.name.toLowerCase().includes('아파트')) || loanProducts[0];
      
      if (apartmentProduct) {
        // Update form with apartment product
        setFormData(prev => ({
          ...prev,
          loanProductId: apartmentProduct.id,
          requestedLoanAmount: apartmentProduct.maxAmount * 0.8, // Suggest 80% of max
          loanPeriod: 24, // Default to 24 months
        }));
        
        // Schedule progression to step 2 after 1 second
        const timer = setTimeout(() => {
          console.log('📍 Auto-advancing to step 2 with pre-filled data');
          setCurrentStep(2);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, loanProducts]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    console.log(`🔄 handleInputChange: ${field} = ${value}`);
    setFormData({ ...formData, [field]: value });
  };

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    console.log('📍 Address select callback received:', { address, lat, lng });
    // Update all three fields at once to avoid state update race conditions
    setFormData(prev => ({
      ...prev,
      collateralAddress: address,
      collateralLat: lat,
      collateralLng: lng,
    }));
    console.log('✅ Address selected and form updating:', { address, lat, lng });
  };

  const handleCollateralValidation = (validation: any) => {
    console.log('Collateral validation:', validation);
    // You can store validation results if needed
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await loanService.createApplication({
        loanProductId: formData.loanProductId,
        requestedLoanAmount: formData.requestedLoanAmount,
        requestedLoanPeriod: formData.loanPeriod,
        collateralType: formData.collateralType,
        collateralValue: formData.collateralValue,
        collateralAddress: formData.collateralAddress,
        collateralDetails: formData.collateralDetails || undefined,
        applicantNotes: formData.applicantNotes || undefined,
      });
      
      setApplicationNo(response.applicationNo || '');
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to create application:', err);
      setError(err instanceof Error ? err.message : '신청 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = loanProducts.find(p => p.id === formData.loanProductId);
  const isLoanAmountValid = selectedProduct && formData.requestedLoanAmount >= selectedProduct.minAmount && formData.requestedLoanAmount <= selectedProduct.maxAmount;
  const currentLTV = formData.collateralValue ? (formData.requestedLoanAmount / formData.collateralValue) * 100 : 0;
  const maxLTVExceeded = currentLTV > 70 && currentLTV > 0;
  const maxLoanByLTV = formData.collateralValue ? Math.floor(formData.collateralValue * 0.7) : 0;
  
  // Memoize validation checks to prevent unnecessary re-renders
  const step2Validations = useMemo(() => ({
    hasLoanAmount: !!formData.requestedLoanAmount,
    hasCollateralValue: !!formData.collateralValue,
    hasCollateralType: !!formData.collateralType,
    hasCollateralAddress: !!formData.collateralAddress,
    hasFundingAccount: !!formData.fundingAccountId,
    isLoanAmountValid: isLoanAmountValid,
    ltv_under_70: !maxLTVExceeded,
  }), [formData, isLoanAmountValid, maxLTVExceeded]);
  
  React.useEffect(() => {
    if (currentStep === 2) {
      console.log('🔍 Step 2 Validation Status:', step2Validations);
      console.log('📊 Form Data:', {
        requestedLoanAmount: formData.requestedLoanAmount,
        collateralValue: formData.collateralValue,
        collateralType: formData.collateralType,
        collateralAddress: formData.collateralAddress,
        fundingAccountId: formData.fundingAccountId,
        currentLTV: currentLTV.toFixed(1) + '%',
      });
    }
  }, [currentStep, formData, step2Validations, currentLTV]);
  
  const canProceed =
    currentStep === 1 ? formData.loanProductId :
    currentStep === 2 ? formData.requestedLoanAmount && formData.collateralValue && formData.collateralType && formData.collateralAddress && formData.fundingAccountId && isLoanAmountValid && !maxLTVExceeded :
    true;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">대출 신청하기</h1>
            <p className="text-blue-200">정보를 입력하여 대출을 신청하세요</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              {[
                { step: 1, title: '상품 선택', icon: DollarSign },
                { step: 2, title: '대출 정보', icon: FileText },
                { step: 3, title: '신청 완료', icon: CheckCircle },
              ].map((item, index) => (
                <div key={item.step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                      currentStep >= item.step 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > item.step ? <CheckCircle size={24} /> : item.step}
                    </div>
                    <p className={`text-sm font-medium text-center ${
                      currentStep >= item.step ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {item.title}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className={`h-1 flex-1 mx-2 mb-6 ${
                      currentStep > item.step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!submitted ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Step 1: Product Selection */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">어떤 대출을 원하세요?</h2>
                  <p className="text-gray-600 mb-6">다양한 대출 상품 중 원하는 상품을 선택해주세요</p>
                  
                  {productsLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-gray-600 mt-4">대출 상품을 불러오는 중...</p>
                    </div>
                  ) : loanProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {loanProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleInputChange('loanProductId', product.id)}
                          className={`p-6 rounded-lg border-2 transition-all text-left ${
                            formData.loanProductId === product.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <h3 className="text-lg font-bold text-gray-900 mb-3">{product.name}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">금리</span>
                              <span className="font-semibold text-gray-900">{product.rate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">최대 LTV</span>
                              <span className="font-semibold text-gray-900">{product.ltv}%</span>
                            </div>
                          </div>
                          {formData.loanProductId === product.id && (
                            <div className="mt-4 flex items-center text-blue-600">
                              <CheckCircle size={20} className="mr-2" />
                              <span className="font-semibold">선택됨</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">사용 가능한 대출 상품이 없습니다.</p>
                      <p className="text-sm text-gray-500 mt-2">나중에 다시 시도해주세요.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Loan Details */}
              {currentStep === 2 && selectedProduct && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name} 정보 입력</h2>
                  <p className="text-gray-600 mb-6">대출 금액, 담보, 이메일을 입력해주세요</p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900 font-semibold mb-2">💡 LTV (Loan-to-Value) 요구사항</p>
                    <p className="text-sm text-blue-800">대출금 / 담보가치 × 100이 최대 70%를 초과할 수 없습니다.</p>
                    <p className="text-sm text-blue-800">예) 담보가 1,000만원이면 최대 700만원까지 대출 가능합니다.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        담보 유형 *
                      </label>
                      <select
                        value={formData.collateralType}
                        onChange={(e) => {
                          const displayName = e.target.value;
                          const enumValue = collateralTypeMap[displayName] || displayName;
                          handleInputChange('collateralType', enumValue);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">담보 유형 선택</option>
                        {collateralTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

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
                      <p className="text-xs text-gray-500 mt-1">최대 대출 가능액: ₩{((formData.collateralValue || 0) * selectedProduct.ltv / 100).toLocaleString('ko-KR')} 원</p>
                    </div>

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
                        <p className="text-xs text-green-600 mt-1">
                          ✓ 주소: {formData.collateralAddress}
                        </p>
                      )}
                    </div>

                    {/* Map Display - Show selected property location */}
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

                    {/* Property Valuation - Show market data and collateral validation */}
                    {formData.collateralAddress && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          💎 시세 정보 및 담보 검증
                        </label>
                        <PropertyValuation
                          address={formData.collateralAddress}
                          claimedValue={formData.collateralValue}
                          onValidation={handleCollateralValidation}
                          readOnly={false}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        대출 신청 금액 (원) *
                      </label>
                      <input
                        type="number"
                        value={formData.requestedLoanAmount || ''}
                        onChange={(e) => handleInputChange('requestedLoanAmount', parseInt(e.target.value) || 0)}
                        placeholder={`예: ${(selectedProduct?.minAmount || 0).toLocaleString('ko-KR')}`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        예상 한도: ₩{(selectedProduct ? Math.min(selectedProduct.maxAmount, (formData.collateralValue || 0) * selectedProduct.ltv / 100) : 0).toLocaleString('ko-KR')} 원
                      </p>
                      <p className="text-xs text-gray-500">
                        최소 금액: ₩{(selectedProduct?.minAmount || 0).toLocaleString('ko-KR')} | 최대 금액: ₩{(selectedProduct?.maxAmount || 0).toLocaleString('ko-KR')}
                      </p>
                      {formData.collateralValue > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          LTV 최대 한도 (70%): ₩{maxLoanByLTV.toLocaleString('ko-KR')} 원
                        </p>
                      )}
                      {formData.requestedLoanAmount > 0 && selectedProduct && (
                        formData.requestedLoanAmount < selectedProduct.minAmount ? (
                          <p className="text-xs text-red-600 mt-1">⚠️ 최소 금액보다 적습니다</p>
                        ) : formData.requestedLoanAmount > selectedProduct.maxAmount ? (
                          <p className="text-xs text-red-600 mt-1">⚠️ 최대 금액을 초과합니다</p>
                        ) : maxLTVExceeded ? (
                          <p className="text-xs text-red-600 mt-1">⚠️ LTV가 70%를 초과합니다. 담보 가치를 올리거나 신청액을 낮춰주세요</p>
                        ) : (
                          <p className="text-xs text-green-600 mt-1">✓ 신청 가능한 금액입니다</p>
                        )
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        LTV: {formData.collateralValue ? currentLTV.toFixed(1) : 0}% {currentLTV > 70 && currentLTV > 0 && <span className="text-red-600 font-semibold">(초과)</span>}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        대출 기간 (개월)
                      </label>
                      <select
                        value={formData.loanPeriod}
                        onChange={(e) => handleInputChange('loanPeriod', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={12}>12개월 (1년)</option>
                        <option value={24}>24개월 (2년)</option>
                        <option value={36}>36개월 (3년)</option>
                        <option value={48}>48개월 (4년)</option>
                        <option value={60}>60개월 (5년)</option>
                      </select>
                    </div>

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

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        신청 메모 (선택사항)
                      </label>
                      <textarea
                        value={formData.applicantNotes}
                        onChange={(e) => handleInputChange('applicantNotes', e.target.value)}
                        placeholder="특별히 전달할 내용이 있으면 입력해주세요"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Account Selection Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">💳 대출금 수령 계좌 선택</h3>
                      <div className="space-y-3">
                        {accounts.length > 0 ? (
                          <div className="space-y-2">
                            {accounts.map((account) => (
                              <label key={account.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">
                                <input
                                  type="radio"
                                  name="account"
                                  value={account.id}
                                  checked={formData.fundingAccountId === account.id}
                                  onChange={(e) => handleInputChange('fundingAccountId', e.target.value)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <div className="ml-3 flex-1">
                                  <p className="font-semibold text-gray-900">{account.name}</p>
                                  <p className="text-sm text-gray-600">
                                    잔액: ₩{(account.balance).toLocaleString('ko-KR')}
                                    {account.type === 'bank' && ' (은행계좌)'}
                                    {account.type === 'virtual' && ' (가상계좌)'}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-600">등록된 계좌가 없습니다.</p>
                            <p className="text-sm text-gray-500 mt-1">계좌를 등록한 후 대출을 신청해주세요.</p>
                          </div>
                        )}
                      </div>
                      {formData.fundingAccountId && (
                        <div className="mt-3 flex items-center text-green-600 text-sm">
                          <CheckCircle size={16} className="mr-2" />
                          <span>계좌가 선택되었습니다</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Personal Info */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">신청 내용 검토</h2>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">대출 상품</h3>
                      <p className="text-gray-700">{selectedProduct?.name}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">대출 신청액</h3>
                        <p className="text-lg font-bold text-blue-600">₩{(formData.requestedLoanAmount || 0).toLocaleString('ko-KR')}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">대출 기간</h3>
                        <p className="text-lg font-bold text-gray-900">{formData.loanPeriod}개월</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">담보 정보</h3>
                      <p className="text-gray-700">{getCollateralTypeDisplayName(formData.collateralType)} - {formData.collateralAddress}</p>
                      <p className="text-gray-600 text-sm">평가액: ₩{(formData.collateralValue || 0).toLocaleString('ko-KR')}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">대출금 수령 계좌</h3>
                      <p className="text-gray-700">{accounts.find(a => a.id === formData.fundingAccountId)?.name || '선택되지 않음'}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900">
                      ✓ 정보가 정확한지 확인 후 신청해주세요. 신청 후 담당자가 24시간 이내에 연락드립니다.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2 Validation Messages */}
              {currentStep === 2 && !canProceed && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ 다음 필드를 완성해주세요:</p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {!step2Validations.hasLoanAmount && <li>• 대출 신청 금액을 입력해주세요</li>}
                    {!step2Validations.hasCollateralValue && <li>• 담보 평가액을 입력해주세요</li>}
                    {!step2Validations.hasCollateralType && <li>• 담보 유형을 선택해주세요</li>}
                    {!step2Validations.hasCollateralAddress && <li>• 담보 주소를 검색해서 선택해주세요</li>}
                    {!step2Validations.hasFundingAccount && <li>• 대출금 수령 계좌를 선택해주세요</li>}
                    {!step2Validations.isLoanAmountValid && <li>• 대출 금액이 상품의 최소/최대 한도를 벗어났습니다</li>}
                    {!step2Validations.ltv_under_70 && <li>• LTV가 70%를 초과합니다 (담보 가치를 올리거나 신청액을 낮춰주세요)</li>}
                  </ul>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <Button
                    onClick={handlePrevious}
                    className="flex-1 bg-gray-200 text-gray-900 hover:bg-gray-300 py-3 rounded-lg font-semibold"
                  >
                    이전
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                      canProceed
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    다음 <ArrowRight size={20} />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`flex-1 py-3 rounded-lg font-semibold ${
                      loading ? 'bg-gray-300' : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {loading ? '신청 중...' : '신청하기'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={40} className="text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">신청이 완료되었습니다!</h2>
              <p className="text-gray-600 mb-4">신청번호: <span className="font-bold">{applicationNo}</span></p>
              <p className="text-gray-600 mb-8">담당자가 24시간 이내에 연락드리겠습니다.</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">다음 진행 단계:</h3>
                <ul className="space-y-1 text-sm text-blue-900">
                  <li>✓ 담당자 전화 상담 (1-2일)</li>
                  <li>✓ 서류 제출 요청</li>
                  <li>✓ 신용/담보 심사 (3-5일)</li>
                  <li>✓ 계약 체결 및 자금 이체</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Link href="/loan/my-loans" className="flex-1">
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-lg font-semibold">
                    내 대출 보기
                  </Button>
                </Link>
                <Link href="/loan" className="flex-1">
                  <Button className="w-full bg-gray-200 text-gray-900 hover:bg-gray-300 py-3 rounded-lg font-semibold">
                    메인으로
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
