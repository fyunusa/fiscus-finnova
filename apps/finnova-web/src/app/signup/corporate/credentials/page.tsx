'use client';

import React, { useState } from 'react';
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
    if (!email.includes('@')) {
      setEmailAvailable(false);
      return;
    }

    setLoading(true);
    try {
      // 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 데모: 특정 이메일만 거부
      if (email === 'demo@example.com') {
        setEmailAvailable(false);
      } else {
        setEmailAvailable(true);
      }
      setEmailChecked(true);
    } catch (err) {
      setEmailAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!emailAvailable || !isPasswordValid || !isPasswordMatching) {
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/signup/corporate/bank');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = emailAvailable && isPasswordValid && isPasswordMatching;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              인증 정보 설정
            </h1>
            <p className="text-gray-600">
              5 / 11 단계
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
                    disabled={loading || emailAvailable === true}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCheckEmail}
                    variant="outline"
                    disabled={!email || loading || emailAvailable === true}
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
                이메일 중복확인, 비밀번호 설정을 완료해주세요.
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
          </Card>
        </div>
      </div>
    </Layout>
  );
}
