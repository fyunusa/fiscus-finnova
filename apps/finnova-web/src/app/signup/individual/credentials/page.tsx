'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert, Input } from '@/components/ui';
import { SignupFlowRedirect } from '@/components/SignupFlowRedirect';
import { createAccountFromSignup } from '@/services/account.service';
import { useSignupFlow } from '@/hooks/useSignupFlow';

interface Credentials {
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordStrength {
  minLength: boolean;
  hasLetters: boolean;
  hasNumbers: boolean;
  hasSpecial: boolean;
}

export default function CredentialsSetupPage() {
  const router = useRouter();
  const { updateData, completeStep, getAllData, markAccountCreated } = useSignupFlow();
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [emailPrefilled, setEmailPrefilled] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength>({
    minLength: false,
    hasLetters: false,
    hasNumbers: false,
    hasSpecial: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  // Prefill email from Kakao verification if available
  useEffect(() => {
    const allData = getAllData();
    if (allData.verifiedEmail && !credentials.email) {
      setCredentials(prev => ({ ...prev, email: allData.verifiedEmail! }));
      setEmailPrefilled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (credentials.password) {
      const passwordRegex = {
        minLength: /.{8,}/,
        hasLetters: /[a-zA-Z]/,
        hasNumbers: /[0-9]/,
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
      };

      setStrength({
        minLength: passwordRegex.minLength.test(credentials.password),
        hasLetters: passwordRegex.hasLetters.test(credentials.password),
        hasNumbers: passwordRegex.hasNumbers.test(credentials.password),
        hasSpecial: passwordRegex.hasSpecial.test(credentials.password),
      });
    }
  }, [credentials.password]);

  const passwordRegex = {
    minLength: /.{8,}/,
    hasLetters: /[a-zA-Z]/,
    hasNumbers: /[0-9]/,
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
  };

  const strengthScore = Object.values(strength).filter(Boolean).length;
  const passwordValid = Object.values(strength).every(Boolean);

  const handleChange = (field: keyof Credentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
    setEmailExists(false);
  };

  const handleProceed = async () => {
    setError('');

    if (!credentials.email.trim()) {
      setError('이메일을 입력해주세요');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('올바른 이메일 형식을 입력해주세요');
      return;
    }

    if (!passwordValid) {
      setError('비밀번호가 모든 조건을 만족해야 합니다');
      return;
    }

    if (credentials.password !== credentials.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    setLoading(true);
    try {
      // Gather all collected data from signup flow
      const allData = getAllData();

      // Create account with all signup data
      const result = await createAccountFromSignup({
        username: credentials.email.split('@')[0], // Use email prefix as username
        email: credentials.email,
        password: credentials.password,
        name: allData.verifiedName || '',
        birthDate: allData.verifiedBirthDate || '',
        gender: (allData.verifiedGender === 'F' ? 'F' : 'M') as 'M' | 'F',
        phone: allData.verifiedPhone || '',
        address: allData.address || '',
        buildingName: allData.buildingName || '',
        postcode: allData.postcode || '',
        agreedToTerms: allData.agreedToTerms || false,
        agreedToPrivacy: allData.agreedToPrivacy || false,
        agreedToMarketing: allData.agreedToMarketing || false,
        niceCI: allData.niceCI || '',
        niceDI: allData.niceDI || '',
      });

      if (!result.success) {
        setError(result.error || '계정 생성에 실패했습니다');
        return;
      }

      // Mark account as created in signup flow
      completeStep(5);
      markAccountCreated();

      // Store authentication tokens and user info
      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
      }
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
      if (result.userId) {
        localStorage.setItem('userId', result.userId);
      }
      // Store username for display in header
      const displayName = allData.verifiedName || credentials.email.split('@')[0];
      localStorage.setItem('username', displayName);

      console.log('✅ Account created successfully:', result.userId);

      // Redirect to success/complete page
      router.push('/signup/individual/complete');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '계정 생성 중 오류가 발생했습니다';
      setError(errorMsg);
      console.error('Account creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupFlowRedirect currentStep={5}>
      <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <Card className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">5 / 10 단계</span>
              <span className="text-sm font-semibold text-blue-600">계정 설정</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              로그인 계정 설정
            </h1>
            <p className="text-gray-600 mt-2">
              이메일과 비밀번호를 설정하세요
            </p>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <div className="space-y-6 mb-8">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 (필수)
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={credentials.email}
                onChange={(e) => handleChange('email', e.target.value)}
                  disabled={loading || emailPrefilled}
                  className={`w-full ${emailExists ? 'border-red-500' : ''} ${emailPrefilled ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                  {emailPrefilled
                    ? '카카오 계정 이메일에서 자동 입력됨'
                    : '로그인 ID로 사용됩니다'}
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 (필수)
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                  value={credentials.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '숨김' : '표시'}
                </button>
              </div>

              {/* Strength Meter */}
              <div className="mt-3">
                <div className="flex gap-1 mb-2">
                  <div className={`flex-1 h-2 rounded-full transition-colors ${strengthScore === 0 ? 'bg-gray-300' : strengthScore === 1 ? 'bg-red-500' : strengthScore === 2 ? 'bg-yellow-500' : strengthScore === 3 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div className={`flex-1 h-2 rounded-full transition-colors ${strengthScore <= 1 ? 'bg-gray-300' : strengthScore === 2 ? 'bg-yellow-500' : strengthScore === 3 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div className={`flex-1 h-2 rounded-full transition-colors ${strengthScore <= 2 ? 'bg-gray-300' : strengthScore === 3 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                </div>
                <p className={`text-xs font-semibold ${strengthScore === 0 ? 'text-gray-600' : strengthScore <= 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {strengthScore === 0 ? '강도: 약함' : strengthScore <= 2 ? '강도: 중간' : '강도: 강함'}
                </p>
              </div>

              {/* Validation Rules */}
              <div className="space-y-2 mt-4 p-4 bg-gray-50 rounded-lg">
                <div className={`flex items-center text-sm ${strength.minLength ? 'text-green-600' : 'text-gray-600'}`}>
                  <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${strength.minLength ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {strength.minLength ? '✓' : ''}
                  </span>
                  최소 8자 이상
                </div>
                <div className={`flex items-center text-sm ${strength.hasLetters ? 'text-green-600' : 'text-gray-600'}`}>
                  <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${strength.hasLetters ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {strength.hasLetters ? '✓' : ''}
                  </span>
                  영문 포함 (a-zA-Z)
                </div>
                <div className={`flex items-center text-sm ${strength.hasNumbers ? 'text-green-600' : 'text-gray-600'}`}>
                  <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${strength.hasNumbers ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {strength.hasNumbers ? '✓' : ''}
                  </span>
                  숫자 포함 (0-9)
                </div>
                <div className={`flex items-center text-sm ${strength.hasSpecial ? 'text-green-600' : 'text-gray-600'}`}>
                  <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${strength.hasSpecial ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {strength.hasSpecial ? '✓' : ''}
                  </span>
                  특수문자 (!@#$%^&* 등)
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인 (필수)
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={credentials.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? '숨김' : '표시'}
                </button>
              </div>
              {credentials.confirmPassword && credentials.password !== credentials.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">비밀번호가 일치하지 않습니다</p>
              )}
            </div>
          </div>

          <Alert type="info" className="mb-6 text-sm">
            <strong>안내:</strong> 비밀번호는 안전하게 보관하고 타인과 공유하지 마세요
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
              disabled={!credentials.email.trim() || !passwordValid || credentials.password !== credentials.confirmPassword || loading}
            >
              {loading ? '확인 중...' : '다음 단계로'}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
    </SignupFlowRedirect>
  );
}
