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
  const [phoneChecked, setPhoneChecked] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);

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
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`; // Allow all digits after position 7
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setPhoneChecked(false);
    setPhoneAvailable(null);
  };

  const handleCheckPhone = async () => {
    if (!phone.trim()) {
      setError('휴대폰 번호를 입력해주세요');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setError('올바른 휴대폰 번호를 입력해주세요 (10-11자리)');
      setPhoneAvailable(false);
      setPhoneChecked(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Call backend phone duplicate check API
      const response = await fetch('http://localhost:4000/api/v1/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError('휴대폰 번호 확인 중 오류가 발생했습니다');
        setPhoneAvailable(false);
        setPhoneChecked(true);
        return;
      }

      setPhoneAvailable(result.data.available);
      setPhoneChecked(true);
      if (!result.data.available) {
        setError('');
      }
    } catch (err) {
      setError('휴대폰 번호 확인 중 오류가 발생했습니다');
      setPhoneAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async () => {
    if (!representative.trim() || !phone.trim()) {
      setError('대표자명과 휴대폰 번호를 입력해주세요');
      return;
    }

    if (!phoneChecked || !phoneAvailable) {
      setError('먼저 휴대폰 번호 중복확인을 해주세요');
      return;
    }

    if (phone.replace(/\D/g, '').length !== 11) {
      setError('올바른 휴대폰 번호를 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Re-validate phone before requesting SMS (in case user modified it)
      const phoneValidationResponse = await fetch('http://localhost:4000/api/v1/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone.replace(/\D/g, '') }),
      });

      const phoneValidationResult = await phoneValidationResponse.json();

      if (!phoneValidationResponse.ok || !phoneValidationResult.data.available) {
        setError('이 휴대폰 번호는 이미 등록되었습니다. 다른 번호를 사용해주세요.');
        setPhoneAvailable(false);
        setLoading(false);
        return;
      }

      // Call backend SMS API
      const response = await fetch('http://localhost:4000/api/v1/auth/corporate/send-sms-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone.replace(/\D/g, '') }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || 'SMS 전송에 실패했습니다. 다시 시도해주세요.');
        setLoading(false);
        return;
      }

      // Store representative info in session for next steps
      sessionStorage.setItem('representativeName', representative);
      sessionStorage.setItem('representativePhone', phone.replace(/\D/g, ''));
      
      const id = `sms_${Date.now()}`;
      setSmsId(id);
      
      setStep('confirm');
      setTimer(180); // 3분 = 180초
    } catch (err) {
      setError('SMS 코드 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!code.trim()) {
      setError('인증 코드를 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get phone number from sessionStorage (stored in handleRequestCode)
      const phoneNumber = sessionStorage.getItem('representativePhone');
      
      if (!phoneNumber) {
        setError('휴대폰 번호 정보가 없습니다. 처음부터 다시 진행해주세요.');
        setLoading(false);
        return;
      }

      // Call backend to verify SMS code
      const response = await fetch('http://localhost:4000/api/v1/auth/corporate/verify-sms-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber,
          code: code.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || '인증 코드 검증에 실패했습니다');
        setLoading(false);
        return;
      }

      // Code verified successfully
      sessionStorage.setItem('phoneVerified', 'true');
      sessionStorage.setItem('verificationCode', code);

      router.push('/signup/corporate/business-lookup');
    } catch (err) {
      console.error('Verification error:', err);
      setError('인증 중 오류가 발생했습니다. 다시 시도해주세요.');
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
                2 / 5 단계
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
                    <div className="flex gap-2 mb-2">
                      <Input
                        type="tel"
                        placeholder="010-0000-0000"
                        value={phone}
                        onChange={handlePhoneChange}
                        disabled={loading}
                        maxLength={13}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleCheckPhone}
                        variant="outline"
                        disabled={!phone || loading}
                      >
                        {loading ? '확인 중...' : '중복확인'}
                      </Button>
                    </div>
                    {phoneChecked && phoneAvailable === true && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        사용 가능한 휴대폰 번호입니다
                      </div>
                    )}
                    {phoneChecked && phoneAvailable === false && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        이미 등록된 휴대폰 번호입니다
                      </div>
                    )}
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
              2 / 5 단계
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
          </Card>
        </div>
      </div>
    </Layout>
  );
}
