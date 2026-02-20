'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input, Alert } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotEmailPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  // Start countdown timer
  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSendVerification = async () => {
    setError('');
    
    if (!name || !phoneNumber) {
      setError('이름과 휴대폰 번호를 입력해주세요');
      return;
    }

    if (!/^\d{7,15}$/.test(phoneNumber)) {
      setError('올바른 휴대폰 번호를 입력해주세요 (숫자만, 7~15자리)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/forgot-email/send-code`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phoneNumber }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || '인증 코드 전송에 실패했습니다');
        setLoading(false);
        return;
      }

      setStep('verify');
      setTimer(600); // 10 minutes
    } catch (err) {
      setError('인증 코드 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    
    if (!verificationCode) {
      setError('인증 코드를 입력해주세요');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('인증 코드는 6자리입니다');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/forgot-email/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber, code: verificationCode }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || '인증 코드가 일치하지 않습니다. 다시 시도해주세요.');
        setLoading(false);
        return;
      }

      const email = result.data?.fullEmail || result.data?.email || '';
      router.push(`/login/forgot-email/result?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError('인증 코드가 일치하지 않습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">이메일 찾기</h1>
              <p className="text-gray-600">
                {step === 'phone'
                  ? '본인 인증을 통해 이메일 주소를 복구할 수 있습니다'
                  : '휴대폰으로 전송된 인증 코드를 입력하세요'}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                {error}
              </Alert>
            )}

            {/* Step 1: Phone Number */}
            {step === 'phone' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <Input
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    휴대폰 번호
                  </label>
                  <Input
                    type="tel"
                    placeholder="숫자만 입력하세요"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={15}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">하이픈 없이 입력해주세요</p>
                </div>

                <Button
                  onClick={handleSendVerification}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      전송 중...
                    </div>
                  ) : (
                    '인증 코드 전송'
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Verification Code */}
            {step === 'verify' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      인증 코드
                    </label>
                    {timer > 0 && (
                      <span className="text-sm text-blue-600 font-medium">
                        {formatTime(timer)}
                      </span>
                    )}
                  </div>
                  <Input
                    type="text"
                    placeholder="6자리 인증코드 입력"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {phoneNumber}으로 전송되었습니다
                  </p>
                </div>

                <Button
                  onClick={handleVerify}
                  disabled={loading || timer === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      인증 중...
                    </div>
                  ) : (
                    '인증하고 이메일 찾기'
                  )}
                </Button>

                <button
                  onClick={() => {
                    setStep('phone');
                    setVerificationCode('');
                    setTimer(0);
                    setError('');
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
                >
                  ← 휴대폰 번호 입력으로 돌아가기
                </button>

                {timer === 0 && (
                  <button
                    onClick={handleSendVerification}
                    disabled={loading}
                    className="w-full text-sm text-blue-600 hover:text-blue-700 py-2 font-medium"
                  >
                    인증 코드 재전송
                  </button>
                )}
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-2">
              <Link
                href="/login"
                className="block text-sm text-gray-600 hover:text-gray-800"
              >
                로그인으로 돌아가기
              </Link>
              <Link
                href="/signup"
                className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                계정이 없으신가요? 회원가입
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
