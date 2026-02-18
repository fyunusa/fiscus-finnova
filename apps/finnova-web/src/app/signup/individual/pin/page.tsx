'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert } from '@/components/ui';
import { SignupFlowRedirect } from '@/components/SignupFlowRedirect';

interface PINSetup {
  pin: string;
  confirmPin: string;
}

interface PINValidation {
  isValid: boolean;
  isSequential: boolean;
  isRepetitive: boolean;
  length: boolean;
}

export default function PINSetupPage() {
  const router = useRouter();
  const [pin, setPin] = useState<PINSetup>({
    pin: '',
    confirmPin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const validatePIN = (value: string): PINValidation => {
    const isSequential = /(?:0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)/.test(value);
    const isRepetitive = /^(\d)\1{3}$/.test(value);
    const length = value.length === 4;

    return {
      length,
      isSequential,
      isRepetitive,
      isValid: length && !isSequential && !isRepetitive,
    };
  };

  const pinValidation = validatePIN(pin.pin);

  const handlePinChange = (field: 'pin' | 'confirmPin', value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPin(prev => ({
      ...prev,
      [field]: digits,
    }));
    setError('');
  };

  const handleProceed = async () => {
    setError('');

    if (!pinValidation.isValid) {
      if (!pinValidation.length) {
        setError('PIN은 4자리 숫자여야 합니다');
      } else if (pinValidation.isSequential) {
        setError('연속된 숫자(예: 1234, 4321)는 사용할 수 없습니다');
      } else if (pinValidation.isRepetitive) {
        setError('같은 숫자 반복(예: 1111)은 사용할 수 없습니다');
      }
      return;
    }

    if (pin.pin !== pin.confirmPin) {
      setError('PIN이 일치하지 않습니다');
      return;
    }

    setLoading(true);

    try {
      // Save PIN (API integration)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark step 9 as completed in both localStorage and sessionStorage
      localStorage.setItem('signup_step_9_completed', 'true');
      sessionStorage.setItem('signup_step_9_completed', 'true');
      
      // Optionally store PIN metadata
      sessionStorage.setItem('pinSet', 'true');
      
      // Check if there's a complete page, otherwise go to dashboard
      router.push('/signup/individual/complete');
    } catch (err) {
      setError('PIN 설정 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupFlowRedirect currentStep={9}>
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <Card className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">9 / 10 단계</span>
              <span className="text-sm font-semibold text-blue-600">PIN 설정</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              거래용 PIN 설정
            </h1>
            <p className="text-gray-600 mt-2">
              투자 등 중요 거래 시 사용할 4자리 PIN을 설정합니다
            </p>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <div className="space-y-8 mb-8">
            {/* PIN Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                PIN 설정 (필수)
              </label>
              <p className="text-xs text-gray-600 mb-4">
                4자리 숫자를 입력하세요
              </p>

              <div className="relative mb-4">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin.pin}
                  onChange={(e) => handlePinChange('pin', e.target.value)}
                  disabled={loading}
                  maxLength={4}
                  placeholder="••••"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-center text-3xl tracking-widest font-semibold focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPin ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Validation Rules */}
              {pin.pin && (
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <div className={`flex items-center text-sm ${pinValidation.length ? 'text-green-600' : 'text-gray-600'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${pinValidation.length ? 'bg-green-100' : 'bg-gray-200'}`}>
                      {pinValidation.length ? '✓' : ''}
                    </span>
                    정확히 4자리 숫자
                  </div>
                  <div className={`flex items-center text-sm ${!pinValidation.isSequential ? 'text-green-600' : 'text-red-600'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${!pinValidation.isSequential ? 'bg-green-100' : 'bg-red-100'}`}>
                      {!pinValidation.isSequential ? '✓' : '✕'}
                    </span>
                    연속된 숫자 안됨 (예: 1234, 4321)
                  </div>
                  <div className={`flex items-center text-sm ${!pinValidation.isRepetitive ? 'text-green-600' : 'text-red-600'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${!pinValidation.isRepetitive ? 'bg-green-100' : 'bg-red-100'}`}>
                      {!pinValidation.isRepetitive ? '✓' : '✕'}
                    </span>
                    같은 숫자 반복 안됨 (예: 1111, 2222)
                  </div>
                </div>
              )}
            </div>

            {/* Confirm PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                PIN 확인 (필수)
              </label>
              <p className="text-xs text-gray-600 mb-4">
                PIN을 다시 입력해주세요
              </p>

              <div className="relative">
                <input
                  type={showConfirmPin ? 'text' : 'password'}
                  value={pin.confirmPin}
                  onChange={(e) => handlePinChange('confirmPin', e.target.value)}
                  disabled={loading || !pinValidation.isValid}
                  maxLength={4}
                  placeholder="••••"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-center text-3xl tracking-widest font-semibold focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  disabled={!pinValidation.isValid}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  {showConfirmPin ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {pin.confirmPin && pin.pin !== pin.confirmPin && (
                <p className="text-xs text-red-600 mt-2">PIN이 일치하지 않습니다</p>
              )}
              {pin.confirmPin && pin.pin === pin.confirmPin && (
                <p className="text-xs text-green-600 mt-2">✓ PIN이 일치합니다</p>
              )}
            </div>
          </div>

          <Alert type="info" className="mb-6 text-sm">
            <strong>안내:</strong> PIN은 본인만 알 수 있도록 안전하게 보관하세요. PIN 분실 시 계정 잠금 해제를 위해 본인인증이 필요합니다.
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
              disabled={!pinValidation.isValid || pin.pin !== pin.confirmPin || loading}
            >
              {loading ? '설정 중...' : '다음 단계로'}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
    </SignupFlowRedirect>
  );
}
