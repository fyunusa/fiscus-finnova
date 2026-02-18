'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';
import { SignupFlowRedirect } from '@/components/SignupFlowRedirect';
import { requestNiceVerification, verifyNiceCode, getNiceStatus } from '@/services/nice.service';
import { useSignupFlow } from '@/hooks/useSignupFlow';

interface VerificationStep {
  step: 1 | 2;
}

export default function IdentityVerificationPage() {
  const router = useRouter();
  const { updateData, completeStep, getStepData } = useSignupFlow();
  const [step, setStep] = useState<VerificationStep['step']>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [codeVerified, setCodeVerified] = useState(false);
  const [niceToken, setNiceToken] = useState<string | null>(null);

  // Load stored data from previous session on mount
  React.useEffect(() => {
    const stepData = getStepData(2);
    if (stepData.verifiedName) {
      setName(stepData.verifiedName);
    }
    if (stepData.verifiedPhone) {
      setPhone(stepData.verifiedPhone);
    }
  }, [getStepData]);

  // Test log - verify component is rendering
  React.useEffect(() => {
    console.log('🎯 IdentityVerificationPage component mounted!');
  }, []);

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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ handleRequestVerification called!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    setError('');

    if (!name.trim()) {
      console.log('❌ Name is empty');
      setError('이름을 입력해주세요');
      return;
    }
    console.log('✓ Name valid:', name);

    const phoneDigits = phone.replace(/\D/g, '');
    console.log('✓ Phone digits:', phoneDigits, 'Length:', phoneDigits.length);
    
    if (phoneDigits.length !== 11) {
      console.log('❌ Phone number invalid (not 11 digits)');
      setError('올바른 전화번호를 입력해주세요');
      return;
    }
    console.log('✓ Phone valid');
    setLoading(true);
    try {
      console.log('📞 Calling NICE API with:', { name: name.trim(), phone: phoneDigits });
      
      // Call NICE API (or demo mode)
      const result = await requestNiceVerification({
        name: name.trim(),
        phone: phoneDigits,
      });
      if (!result.success) {
        console.log('❌ API returned error:', result.error);
        setError(result.error || '인증 요청 중 오류가 발생했습니다');
        return;
      }

      console.log('✓ API successful');
      
      // Store the token from NICE for code verification
      if (result.token) {
        setNiceToken(result.token);
      }

      console.log('Moving to step 2...');
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

    if (!niceToken) {
      setError('인증 토큰이 없습니다. 처음부터 다시 시작해주세요.');
      return;
    }

    setLoading(true);
    try {
      // Call real NICE API to verify code
      const result = await verifyNiceCode({
        token: niceToken,
        code: verificationCode,
      });

      console.log('Verify code result:', result);

      if (!result.success) {
        setError(result.error || '인증 중 오류가 발생했습니다');
        return;
      }

      // Store CI/DI values and user data for next step
      if (result.ci) {
        // Save all NICE verification data to signup flow
        updateData({
          niceToken: niceToken,
          niceCI: result.ci,
          niceDI: result.di || '',
          verifiedName: result.name || name,
          verifiedBirthDate: result.birthDate || '',
          verifiedGender: result.gender || '',
          verifiedPhone: phone.replace(/\D/g, ''),
        });
        completeStep(2);
        
        sessionStorage.setItem('niceCI', result.ci);
        if (result.di) sessionStorage.setItem('niceDI', result.di);
        if (result.name) sessionStorage.setItem('verifiedName', result.name);
        if (result.birthDate) sessionStorage.setItem('verifiedBirthDate', result.birthDate);
        if (result.gender) sessionStorage.setItem('verifiedGender', result.gender);
      }

      // Also store the user-entered data from this step
      sessionStorage.setItem('verifiedPhone', phone.replace(/\D/g, ''));
      sessionStorage.setItem('userEnteredName', name);

      setCodeVerified(true);
      // Redirect to next step (Step 4: Personal Info)
      setTimeout(() => {
        router.push('/signup/individual/info');
      }, 1500);
    } catch (err) {
      setError('인증 중 오류가 발생했습니다');
      console.error('NICE code verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      // Resend code through NICE API (or demo mode)
      const result = await requestNiceVerification({
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
      });

      if (!result.success) {
        setError(result.error || '코드 재전송 중 오류가 발생했습니다');
        return;
      }

      if (result.token) {
        setNiceToken(result.token);
      }

      setTimeLeft(180);
      setVerificationCode('');
      setError('');
    } catch (err) {
      setError('코드 재전송 중 오류가 발생했습니다');
      console.error('Resend code error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (codeVerified) {
    return (
      <SignupFlowRedirect currentStep={2}>
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
    </SignupFlowRedirect>
    );
  }

  return (
    <SignupFlowRedirect currentStep={2}>
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
                <strong>안내:</strong> {(() => {
                  const status = getNiceStatus();
                  if (status.demoMode) {
                    return 'Demo Mode: 데이터를 입력하고 진행해주세요. 실제 SMS는 발송되지 않습니다.';
                  } else {
                    return 'NICE/KCB의 안전한 인증 절차를 통해 본인 확인이 진행됩니다';
                  }
                })()}
              </Alert>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log('BACK BUTTON NATIVE CLICK');
                    router.back();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  이전
                </button>
                <button
                  onClick={() => {
                    console.log('REQUEST VERIFICATION BUTTON CLICKED');
                    handleRequestVerification();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={loading || !name.trim() || phone.replace(/\D/g, '').length !== 11}
                >
                  {loading ? '요청 중...' : '인증요청'}
                </button>
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
                <strong>안내:</strong> {(() => {
                  const status = getNiceStatus();
                  if (status.demoMode) {
                    return 'Demo Mode: 아무 6자리 숫자를 입력하세요';
                  } else {
                    return '문자로 받은 6자리 코드를 입력해주세요';
                  }
                })()}
              </Alert>

              {timeLeft === 0 && (
                <Alert type="error" className="mb-4 text-sm">
                  인증 시간이 만료되었습니다. 다시 시작해주세요
                </Alert>
              )}

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    console.log('VERIFY CODE BUTTON CLICKED');
                    handleVerifyCode();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={loading || verificationCode.length !== 6 || timeLeft === 0}
                >
                  {loading ? '인증 중...' : '인증완료'}
                </button>
                <button
                  onClick={() => {
                    console.log('RESEND CODE BUTTON CLICKED');
                    handleResendCode();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
                  disabled={loading}
                >
                  재전송
                </button>
              </div>

              <button
                onClick={() => {
                  console.log('BACK TO STEP 1 CLICKED');
                  setStep(1);
                }}
                className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                disabled={loading}
              >
                이전 단계로
              </button>
            </>
          )}
        </Card>

        {/* Demo Info */}
        {/* <div className="mt-8 text-center text-xs text-gray-500 max-w-md">
          {(() => {
            const status = getNiceStatus();
            if (status.demoMode) {
              return (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-blue-700 font-semibold mb-1">🔧 Demo Mode Active</p>
                  <p className="text-blue-600 text-xs">
                    Using demo verification. Enter any name and phone number.
                    <br/>
                    Use any 6-digit code to proceed.
                  </p>
                </div>
              );
            } else {
              return (
                <p>NICE/KCB API를 통한 실제 본인인증이 진행됩니다</p>
              );
            }
          })()}
        </div> */}
      </div>
    </Layout>
    </SignupFlowRedirect>
  );
}
