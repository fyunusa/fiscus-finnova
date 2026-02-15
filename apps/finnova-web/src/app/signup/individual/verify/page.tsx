'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';

interface VerificationStep {
  step: 1 | 2;
}

export default function IdentityVerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState<VerificationStep['step']>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [codeVerified, setCodeVerified] = useState(false);

  // Timer for code verification
  React.useEffect(() => {
    if (step === 2 && timeLeft > 0 && !codeVerified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step, codeVerified]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestVerification = async () => {
    setError('');

    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }

    if (phone.replace(/\D/g, '').length !== 10) {
      setError('올바른 전화번호를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      // Simulate NICE/KCB API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, accept any phone number
      setStep(2);
      setTimeLeft(180);
    } catch (err) {
      setError('인증 요청 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');

    if (verificationCode.length !== 6) {
      setError('6자리 인증코드를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      // Simulate NICE/KCB API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo, accept code "123456"
      if (verificationCode === '123456') {
        setCodeVerified(true);
        // In real scenario, store CI/DI values and auto-fill name/birth/gender
        setTimeout(() => {
          router.push('/signup/individual/info');
        }, 1500);
      } else {
        setError('인증코드가 일치하지 않습니다. 다시 확인해주세요');
      }
    } catch (err) {
      setError('인증 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTimeLeft(180);
      setVerificationCode('');
      setError('');
    } finally {
      setLoading(false);
    }
  };

  if (codeVerified) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
          <Card className="w-full max-w-md text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">인증 완료</h2>
              <p className="text-gray-600 text-sm mt-2">본인인증이 완료되었습니다</p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <Card className="w-full max-w-md">
          {/* Progress Indicator */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">2 / 10 단계</span>
              <span className="text-sm font-semibold text-blue-600">본인인증</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              본인인증
            </h1>
            <p className="text-gray-600 mt-2">
              NICE/KCB를 통해 본인인증을 진행합니다
            </p>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          {step === 1 ? (
            // Step 1: Phone Verification Request
            <>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 (필수)
                  </label>
                  <Input
                    type="text"
                    placeholder="성명을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    휴대폰 번호 (필수)
                  </label>
                  <Input
                    type="tel"
                    placeholder="010-1234-5678"
                    value={formatPhone(phone)}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    인증 코드가 전송됩니다
                  </p>
                </div>
              </div>

              <Alert type="info" className="mb-6 text-sm">
                <strong>안내:</strong> NICE/KCB의 안전한 인증 절차를 통해 본인 확인이 진행됩니다
              </Alert>

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
                  onClick={handleRequestVerification}
                  className="flex-1"
                  variant="primary"
                  disabled={loading || !name.trim() || phone.replace(/\D/g, '').length !== 10}
                >
                  {loading ? '요청 중...' : '인증요청'}
                </Button>
              </div>
            </>
          ) : (
            // Step 2: Code Verification
            <>
              <div className="space-y-4 mb-8">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      인증 코드 (필수)
                    </label>
                    <span className={`text-sm font-semibold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-600'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <Input
                    type="text"
                    placeholder="6자리 코드를 입력하세요"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading || timeLeft === 0}
                    maxLength={6}
                    className="w-full text-center text-2xl tracking-widest"
                  />
                </div>
              </div>

              <Alert type="info" className="mb-4 text-sm">
                <strong>안내:</strong> 문자로 받은 6자리 코드를 입력해주세요
              </Alert>

              {timeLeft === 0 && (
                <Alert type="error" className="mb-4 text-sm">
                  인증 시간이 만료되었습니다. 다시 시작해주세요
                </Alert>
              )}

              <div className="flex gap-2 mb-4">
                <Button
                  onClick={handleVerifyCode}
                  className="flex-1"
                  variant="primary"
                  disabled={loading || verificationCode.length !== 6 || timeLeft === 0}
                >
                  {loading ? '인증 중...' : '인증완료'}
                </Button>
                <Button
                  onClick={handleResendCode}
                  variant="outline"
                  disabled={loading}
                  className="px-4"
                >
                  재전송
                </Button>
              </div>

              <Button
                onClick={() => setStep(1)}
                variant="ghost"
                className="w-full"
                disabled={loading}
              >
                이전 단계로
              </Button>
            </>
          )}
        </Card>

        {/* Demo Info */}
        <div className="mt-8 text-center text-xs text-gray-500 max-w-md">
          <p>데모: 인증요청 후 인증코드 <span className="font-mono bg-gray-100 px-2 py-1 rounded">123456</span>을 입력해주세요</p>
        </div>
      </div>
    </Layout>
  );
}
