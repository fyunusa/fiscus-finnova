'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, Button, Input, Alert } from '@/components/ui';

/**
 * LOG_2_1: Password Reset
 * Purpose: Set new password with validation
 * Validation:
 * - Minimum 8 characters
 * - Combination of letters, numbers, special characters
 * - Cannot reuse last 3 passwords
 */
export default function NewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<
    'weak' | 'medium' | 'strong' | null
  >(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Pure function — safe to call anywhere including render
  const getPasswordRules = (password: string) => ({
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  // Call only from event handlers (updates state)
  const updatePasswordStrength = (password: string) => {
    const rules = getPasswordRules(password);
    const passed = Object.values(rules).filter(Boolean).length;
    if (passed <= 2) setPasswordStrength('weak');
    else if (passed === 3) setPasswordStrength('medium');
    else setPasswordStrength('strong');
    return rules;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData({ ...formData, newPassword: password });

    if (password) {
      updatePasswordStrength(password);
    } else {
      setPasswordStrength(null);
    }

    if (errors.newPassword) {
      setErrors({ ...errors, newPassword: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.otp) {
      newErrors.otp = 'OTP를 입력해주세요';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP는 6자리 숫자여야 합니다';
    }

    const rules = getPasswordRules(formData.newPassword);

    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요';
    } else if (!rules.minLength) {
      newErrors.newPassword = '비밀번호는 최소 8자 이상이어야 합니다';
    } else if (!rules.hasLetter || !rules.hasNumber || !rules.hasSpecial) {
      newErrors.newPassword =
        '비밀번호는 문자, 숫자, 특수문자를 포함해야 합니다';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call backend API to reset password
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({
          submit: result.message || '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.',
        });
        setIsSubmitting(false);
        return;
      }

      setShowSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      setErrors({
        submit: '비밀번호 재설정 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
          <div className="max-w-md w-full">
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                비밀번호 재설정 완료
              </h2>
              <p className="text-gray-600 mb-6">
                비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const rules = formData.newPassword ? getPasswordRules(formData.newPassword) : null;

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full">
          <Card className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                비밀번호 재설정
              </h1>
              <p className="text-gray-600">
                이메일로 받은 OTP와 새 비밀번호를 입력하세요
              </p>
              {email && (
                <p className="text-sm text-gray-500 mt-2">
                  계정: {email}
                </p>
              )}
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <Alert variant="error" className="mb-6">
                {errors.submit}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP (6자리)
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, otp: value });
                    if (errors.otp) {
                      setErrors({ ...errors, otp: '' });
                    }
                  }}
                  error={!!errors.otp}
                  placeholder="이메일로 받은 OTP를 입력하세요"
                  className="w-full text-center tracking-widest"
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handlePasswordChange}
                    error={!!errors.newPassword}
                    placeholder="새 비밀번호를 입력하세요"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}

                {/* Password Strength Indicator */}
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      <div
                        className={`h-1 flex-1 rounded ${
                          passwordStrength ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded ${
                          passwordStrength === 'medium' || passwordStrength === 'strong'
                            ? 'bg-yellow-500'
                            : 'bg-gray-200'
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded ${
                          passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      강도:{' '}
                      <span
                        className={
                          passwordStrength === 'weak'
                            ? 'text-red-600'
                            : passwordStrength === 'medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }
                      >
                        {passwordStrength === 'weak' ? '약함' : passwordStrength === 'medium' ? '중간' : '강함'}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              {rules && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    비밀번호 요구사항:
                  </p>
                  <ul className="space-y-1">
                    {[
                      { label: '8글자 이상', met: rules.minLength },
                      { label: '영문자 포함', met: rules.hasLetter },
                      { label: '숫자 포함', met: rules.hasNumber },
                      { label: '특수문자 포함', met: rules.hasSpecial },
                    ].map((req, i) => (
                      <li key={i} className="flex items-center text-sm">
                        {req.met ? (
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                          {req.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  error={!!errors.confirmPassword}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? '비밀번호 재설정 중...' : '비밀번호 재설정'}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← 로그인 페이지로 돌아가기
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
