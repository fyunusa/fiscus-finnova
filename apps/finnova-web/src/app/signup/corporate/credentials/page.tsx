'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';
import { Eye, EyeOff, Check, X } from 'lucide-react';

export default function CorporateCredentialsPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRules = {
    minLength: password.length >= 8,
    hasLetters: /[a-zA-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passwordStrength =
    Object.values(passwordRules).filter(Boolean).length === 0
      ? 'weak'
      : Object.values(passwordRules).filter(Boolean).length <= 2
        ? 'medium'
        : 'strong';

  const isPasswordMatching = password && passwordConfirm && password === passwordConfirm;
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const handleCheckEmail = async () => {
    if (!email.trim()) {
      setError('이메일을 입력해주세요');
      return;
    }

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요');
      setEmailAvailable(false);
      setEmailChecked(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Call backend email duplicate check API
      const response = await fetch('http://localhost:4000/api/v1/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError('이메일 확인 중 오류가 발생했습니다');
        setEmailAvailable(false);
        setEmailChecked(true);
        return;
      }

      setEmailAvailable(result.data.available);
      setEmailChecked(true);
      if (!result.data.available) {
        setError('');
      }
    } catch (err) {
      setError('이메일 확인 중 오류가 발생했습니다');
      setEmailAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!emailAvailable || !isPasswordValid || !isPasswordMatching) {
      if (!emailAvailable) {
        setError('이메일 중복확인을 먼저 해주세요');
      }
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Re-validate email before proceeding (in case user modified it)
      const emailValidationResponse = await fetch('http://localhost:4000/api/v1/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const emailValidationResult = await emailValidationResponse.json();

      if (!emailValidationResponse.ok || !emailValidationResult.data.available) {
        setError('이메일이 이미 등록되었거나 유효하지 않습니다. 다시 확인해주세요.');
        setEmailAvailable(false);
        setLoading(false);
        return;
      }

      // Aggregate all data from previous steps (stored in sessionStorage)
      const payloadData = {
        // Step 1: Terms (assuming these are stored)
        agreedToTerms: sessionStorage.getItem('agreedToTerms') === 'true' || true,
        agreedToPrivacy: sessionStorage.getItem('agreedToPrivacy') === 'true' || true,
        agreedToMarketing: sessionStorage.getItem('agreedToMarketing') === 'true' || false,
        
        // Step 2: Representative info
        representativePhone: sessionStorage.getItem('representativePhone') || '',
        
        // Step 3: Business info
        businessName: sessionStorage.getItem('businessName') || '',
        businessRegistrationNumber: sessionStorage.getItem('businessRegistrationNumber') || '',
        
        // Step 4: Corporate info
        address: sessionStorage.getItem('corporateAddress') || '',
        postcode: sessionStorage.getItem('corporatePostcode') || '',
        buildingName: sessionStorage.getItem('corporateBuildingName') || '',
        corporatePhone: sessionStorage.getItem('corporatePhone') || '',
        
        // Step 5: Credentials
        email,
        password,
      };

      // Call backend signup API
      const response = await fetch('http://localhost:4000/api/v1/auth/corporate/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
        setLoading(false);
        return;
      }

      // Save tokens to localStorage
      if (result.data?.accessToken) {
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken || '');
      }

      // Clear session storage
      sessionStorage.clear();

      // Redirect to success/complete page
      router.push('/signup/corporate/complete');
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = emailAvailable && isPasswordValid && isPasswordMatching;

  // Debug: Log current state
  useEffect(() => {
    console.log('Step 5 State:', {
      emailAvailable,
      emailChecked,
      isPasswordValid,
      isPasswordMatching,
      canProceed,
      password: password ? '***' : '',
      passwordConfirm: passwordConfirm ? '***' : '',
    });
  }, [emailAvailable, emailChecked, isPasswordValid, isPasswordMatching, canProceed, password, passwordConfirm]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              인증 정보 설정
            </h1>
            <p className="text-gray-600">
              5 / 5 단계
            </p>
          </div>

          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                로그인 계정을 설정해주세요
              </h2>

              {/* Email */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  이메일 (필수)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="email"
                    placeholder="corporate@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailChecked(false);
                      setEmailAvailable(null);
                    }}
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCheckEmail}
                    variant="outline"
                    disabled={!email || loading}
                  >
                    {loading ? '확인 중...' : '중복확인'}
                  </Button>
                </div>

                {emailChecked && emailAvailable === true && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Check size={16} />
                    사용 가능한 이메일입니다
                  </div>
                )}
                {emailChecked && emailAvailable === false && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <X size={16} />
                    {email === 'demo@example.com'
                      ? '이미 등록된 이메일입니다'
                      : '올바른 이메일을 입력해주세요'}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  비밀번호 (필수)
                </label>
                <div className="relative mb-3">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8자 이상, 영문/숫자/특수문자 포함"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mb-3">
                    <div className="flex gap-2 mb-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full transition-colors ${
                            i < (passwordStrength === 'weak' ? 1 : passwordStrength === 'medium' ? 2 : 3)
                              ? passwordStrength === 'strong'
                                ? 'bg-green-500'
                                : 'bg-orange-500'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${
                      passwordStrength === 'strong'
                        ? 'text-green-600'
                        : passwordStrength === 'medium'
                          ? 'text-orange-600'
                          : 'text-red-600'
                    }`}>
                      {passwordStrength === 'strong' ? '강함' : passwordStrength === 'medium' ? '보통' : '약함'}
                    </p>
                  </div>
                )}

                {/* Validation Rules */}
                <div className="space-y-2 mb-4">
                  {Object.entries(passwordRules).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      {value ? (
                        <Check size={16} className="text-green-600 flex-shrink-0" />
                      ) : (
                        <X size={16} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className={value ? 'text-gray-900' : 'text-gray-600'}>
                        {key === 'minLength' && '8자 이상'}
                        {key === 'hasLetters' && '영문 포함'}
                        {key === 'hasNumbers' && '숫자 포함'}
                        {key === 'hasSpecial' && '특수문자 포함 (!@#$%^&* 등)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Password Confirm */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  비밀번호 확인 (필수)
                </label>
                <div className="relative">
                  <Input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    placeholder="비밀번호를 다시 입력해주세요"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                  >
                    {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordConfirm && (
                  <div className={`flex items-center gap-2 text-sm mt-2 ${
                    isPasswordMatching ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPasswordMatching ? (
                      <Check size={16} />
                    ) : (
                      <X size={16} />
                    )}
                    {isPasswordMatching ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
                  </div>
                )}
              </div>
            </div>

            {!canProceed && (
              <Alert type="warning" className="mb-6">
                <div className="space-y-1">
                  {!emailAvailable && (
                    <p>✗ 이메일 중복확인을 완료해주세요. (중복확인 버튼 클릭 후 &quot;사용 가능한 이메일입니다&quot; 확인)</p>
                  )}
                  {!isPasswordValid && (
                    <p>✗ 비밀번호가 모든 조건을 만족해야 합니다. (8자 이상, 영문/숫자/특수문자 포함)</p>
                  )}
                  {!isPasswordMatching && (
                    <p>✗ 비밀번호 확인이 일치하지 않습니다.</p>
                  )}
                </div>
              </Alert>
            )}

            {error && (
              <Alert type="error" className="mb-6">
                {error}
              </Alert>
            )}

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
                onClick={handleNext}
                className="flex-1"
                loading={loading}
                disabled={!canProceed}
              >
                다음
              </Button>
            </div>

            {/* Debug Panel - Development Only */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs font-mono">
                <div className="font-bold mb-2 text-gray-700">Debug Info:</div>
                <div className="space-y-1 text-gray-600">
                  <div>emailChecked: {emailChecked ? '✓' : '✗'}</div>
                  <div>emailAvailable: {emailAvailable === null ? 'null' : emailAvailable ? '✓' : '✗'}</div>
                  <div>isPasswordValid: {isPasswordValid ? '✓' : '✗'}</div>
                  <div>isPasswordMatching: {isPasswordMatching ? '✓' : '✗'}</div>
                  <div>canProceed: {canProceed ? '✓ YES' : '✗ NO'}</div>
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    Password Rules:
                    <div>- 8+ chars: {passwordRules.minLength ? '✓' : '✗'}</div>
                    <div>- Letters: {passwordRules.hasLetters ? '✓' : '✗'}</div>
                    <div>- Numbers: {passwordRules.hasNumbers ? '✓' : '✗'}</div>
                    <div>- Special: {passwordRules.hasSpecial ? '✓' : '✗'}</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
