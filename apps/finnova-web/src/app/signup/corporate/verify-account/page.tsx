'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';
import { CheckCircle } from 'lucide-react';

type VerifyStep = 'send' | 'confirm';

export default function CorporateVerifyAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState<VerifyStep>('send');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountLastDigits, setAccountLastDigits] = useState('');

  // 10분 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendMoney = async () => {
    setLoading(true);
    setError('');

    try {
      // 실제로는 Paygate API 호출
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 데모용 계좌 끝자리 설정
      setAccountLastDigits('****');
      setStep('confirm');
      setTimer(600); // 10분 = 600초
    } catch (err) {
      setError('1원 송금에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!code.trim()) {
      setError('인증 코드를 입력해주세요');
      return;
    }

    if (code !== '123') {
      setError('잘못된 인증 코드입니다. (데모: 123)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/signup/corporate/documents');
    } catch (err) {
      setError('인증에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setStep('send');
    setCode('');
    setTimer(0);
    setError('');
  };

  if (step === 'send') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                계좌 인증 (1원 송금)
              </h1>
              <p className="text-gray-600">
                7 / 11 단계
              </p>
            </div>

            <Card>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  1원 송금으로 계좌를 인증해주세요
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  등록된 계좌로 1원이 송금됩니다. 입금 영수증의 메모에 적힌 3자리 숫자가 인증 코드입니다.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <strong>Step 1:</strong> 아래 버튼을 클릭하면 등록된 계좌로 1원이 송금됩니다
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <strong>Step 2:</strong> 입금 알림 또는 은행 앱에서 송금 내역을 확인합니다
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <strong>Step 3:</strong> 입금 내역의 메모에 적힌 3자리 코드를 입력합니다
                    </div>
                  </div>
                </div>
              </div>

              {error && <Alert type="error" className="mb-4">{error}</Alert>}

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
                  onClick={handleSendMoney}
                  className="flex-1"
                  loading={loading}
                >
                  {loading ? '송금 중...' : '1원 송금하기'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              계좌 인증 (1원 송금)
            </h1>
            <p className="text-gray-600">
              7 / 11 단계
            </p>
          </div>

          <Card>
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="font-semibold text-gray-900">
                  1원 송금이 완료되었습니다
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <p className="text-sm text-gray-700">
                  <strong>수령 계좌:</strong> ****{accountLastDigits}
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                은행 앱 또는 문자로 받은 입금 내역을 확인하세요. 메모에 적힌 3자리 숫자가 인증 코드입니다.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  입금 메모의 3자리 코드 (필수)
                </label>
                <Input
                  type="text"
                  placeholder="000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  disabled={loading || timer === 0}
                  maxLength={3}
                  className="text-center text-3xl tracking-widest font-bold"
                />
                <p className={`text-sm mt-2 ${timer > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  시간 제한: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                </p>
              </div>

              {timer === 0 && (
                <Alert type="warning" className="mt-4">
                  인증 시간이 만료되었습니다. 1원을 다시 송금해주세요.
                </Alert>
              )}
            </div>

            {error && <Alert type="error" className="mb-4">{error}</Alert>}

            <div className="flex gap-4">
              <Button
                onClick={handleResend}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                다시 송금
              </Button>
              <Button
                onClick={handleConfirmCode}
                className="flex-1"
                loading={loading}
                disabled={!code || timer === 0}
              >
                인증 확인
              </Button>
            </div>

            <p className="text-xs text-gray-600 text-center mt-4">
              데모용 인증코드: <strong>123</strong>
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
