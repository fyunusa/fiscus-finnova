'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';

export default function OneWonVerificationPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [verificationSent, setVerificationSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  const handleSendVerification = async () => {
    setError('');
    setLoading(true);

    try {
      // Simulate Paygate API call to send 1 KRW
      await new Promise(resolve => setTimeout(resolve, 1500));
      setVerificationSent(true);
      setStep(2);
      setTimeLeft(600); // 10 minutes
    } catch (err) {
      setError('인증 요청 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');

    if (code.length !== 3) {
      setError('3자리 코드를 입력해주세요');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo: accept code "123"
      if (code === '123') {
        // Success - redirect to KYC
        router.push('/signup/individual/kyc');
      } else {
        setError('코드가 일치하지 않습니다. 다시 확인해주세요');
      }
    } catch (err) {
      setError('인증 중 오류가 발생했습니다');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <Card className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">7 / 10 단계</span>
              <span className="text-sm font-semibold text-blue-600">1원 인증</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              계좌 소유권 확인
            </h1>
            <p className="text-gray-600 mt-2">
              등록하신 계좌로 1원을 송금합니다
            </p>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          {step === 1 ? (
            // Step 1: Send 1 Won
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">
                  📝 인증 방법
                </h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex">
                    <span className="font-semibold mr-3">1)</span>
                    <span>계좌로 1원이 송금됩니다</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-3">2)</span>
                    <span>입금 내용에 표시된 3자리 코드를 확인합니다</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-3">3)</span>
                    <span>예: &quot;FINNOVA123&quot; → 코드는 &quot;123&quot;</span>
                  </li>
                </ol>
              </div>

              <Alert type="info" className="mb-8 text-sm">
                <strong>주의:</strong> 실제로 1원이 송금되며, 잠시 후 자동으로 환불됩니다.
              </Alert>

              <div className="flex gap-3 mb-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  이전
                </Button>
                <Button
                  onClick={handleSendVerification}
                  className="flex-1"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? '요청 중...' : '1원 송금 요청'}
                </Button>
              </div>
            </>
          ) : (
            // Step 2: Enter Code
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-900">
                  <strong>✓ 1원이 송금되었습니다</strong><br/>
                  계좌에서 입금 내용을 확인하고 3자리 코드를 입력해주세요
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      인증 코드 (필수)
                    </label>
                    <span className={`text-sm font-semibold ${timeLeft < 120 ? 'text-red-600' : 'text-gray-600'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="예: 123"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      disabled={loading || timeLeft === 0}
                      maxLength={3}
                      className="flex-1 text-center text-2xl tracking-widest"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    입금 내용에서 숫자 3개를 입력해주세요
                  </p>
                </div>
              </div>

              {timeLeft === 0 && (
                <Alert type="error" className="mb-4 text-sm">
                  인증 시간이 만료되었습니다. 처음부터 다시 시작해주세요
                </Alert>
              )}

              <div className="flex gap-3 mb-4">
                <Button
                  onClick={() => {
                    setStep(1);
                    setVerificationSent(false);
                    setCode('');
                    setTimeLeft(0);
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  다시 시작
                </Button>
                <Button
                  onClick={handleVerifyCode}
                  className="flex-1"
                  variant="primary"
                  disabled={code.length !== 3 || loading || timeLeft === 0}
                >
                  {loading ? '인증 중...' : '코드 확인'}
                </Button>
              </div>
            </>
          )}

          {/* Demo Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              데모: <span className="font-mono bg-gray-100 px-2 py-1 rounded">123</span>을 입력해주세요
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
