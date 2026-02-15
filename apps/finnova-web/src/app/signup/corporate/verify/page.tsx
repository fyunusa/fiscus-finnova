'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';
import { CheckCircle } from 'lucide-react';

type VerificationStep = 'request' | 'confirm';

export default function CorporateVerifyPage() {
  const router = useRouter();
  const [step, setStep] = useState<VerificationStep>('request');
  const [representative, setRepresentative] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [smsId, setSmsId] = useState('');

  // 3분 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleRequestCode = async () => {
    if (!representative.trim() || !phone.trim()) {
      setError('대표자명과 휴대폰 번호를 입력해주세요');
      return;
    }

    if (phone.replace(/\D/g, '').length !== 10) {
      setError('올바른 휴대폰 번호를 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 실제로는 NICE/KCB API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 데모용 ID 생성
      const id = `sms_${Date.now()}`;
      setSmsId(id);
      
      setStep('confirm');
      setTimer(180); // 3분 = 180초
    } catch (err) {
      setError('코드 요청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!code.trim()) {
      setError('인증 코드를 입력해주세요');
      return;
    }

    if (code !== '123456') {
      setError('잘못된 인증 코드입니다. (데모: 123456)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 실제로는 API 호출 후 확인
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 중복 가입 체크 (데모: 010-1234-5678로 가입된 계정 있다고 가정)
      if (phone === '010-1234-5678') {
        router.push('/signup/corporate/verify/exists');
        return;
      }

      router.push('/signup/corporate/business-lookup');
    } catch (err) {
      setError('인증에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setStep('request');
    setCode('');
    setTimer(0);
  };

  if (step === 'request') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                대표자 본인인증
              </h1>
              <p className="text-gray-600">
                2 / 11 단계
              </p>
            </div>

            <Card>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  대표자 정보로 인증해주세요
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  대표자의 휴대폰 번호로 인증코드가 전송됩니다.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      대표자명 (필수)
                    </label>
                    <Input
                      type="text"
                      placeholder="이름 입력"
                      value={representative}
                      onChange={(e) => setRepresentative(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      휴대폰 번호 (필수)
                    </label>
                    <Input
                      type="tel"
                      placeholder="010-0000-0000"
                      value={phone}
                      onChange={handlePhoneChange}
                      disabled={loading}
                      maxLength={13}
                    />
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
                  onClick={handleRequestCode}
                  className="flex-1"
                  loading={loading}
                >
                  인증코드 요청
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
              대표자 본인인증
            </h1>
            <p className="text-gray-600">
              2 / 11 단계
            </p>
          </div>

          <Card>
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="font-semibold text-gray-900">
                  인증 요청이 완료되었습니다
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <p className="text-sm text-gray-700 mb-1">
                  <strong>대표자명:</strong> {representative}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>휴대폰:</strong> {phone}
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                위 번호로 전송된 6자리 인증코드를 입력해주세요.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  인증코드 (필수)
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading || timer === 0}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-bold"
                />
                <p className={`text-sm mt-2 ${timer > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  시간 제한: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                </p>
              </div>

              {timer === 0 && (
                <Alert type="warning" className="mt-4">
                  인증 시간이 만료되었습니다. 코드를 다시 요청해주세요.
                </Alert>
              )}
            </div>

            {error && <Alert type="error" className="mb-4">{error}</Alert>}

            <div className="flex gap-4">
              <Button
                onClick={handleResendCode}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                코드 다시 요청
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
              데모용 인증코드: <strong>123456</strong>
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
