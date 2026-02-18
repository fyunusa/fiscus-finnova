'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input, Alert } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (!email) {
      setError('이메일 주소를 입력해주세요');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 주소를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      // Call backend API to send OTP to email
      const response = await fetch('http://localhost:4000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        setError(result.message || '이메일을 찾을 수 없습니다. 다시 확인해주세요.');
        setLoading(false);
        return;
      }

      // Redirect to OTP verification page with email as query param
      router.push(`/login/reset-password/new?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error('Failed to request password reset:', err);
      setError('요청 중 오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 재설정</h1>
              <p className="text-gray-600">
                이메일 주소를 입력하여 비밀번호를 재설정할 수 있습니다
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                {error}
              </Alert>
            )}

            {/* Email Input Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소
                </label>
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit();
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  비밀번호 재설정 전에 본인 확인을 진행합니다
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    확인 중...
                  </div>
                ) : (
                  '계속하기'
                )}
              </Button>
            </div>

            {/* Additional Options */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="text-gray-600">이메일을 모르시나요?</span>
                <Link
                  href="/login/forgot-email"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  여기서 찾기
                </Link>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-2">
              <Link
                href="/login"
                className="block text-sm text-gray-600 hover:text-gray-800"
              >
                로그인으로 돌아가기
              </Link>
              <Link
                href="/signup"
                className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                계정이 없으신가요? 회원가입
              </Link>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <span className="font-medium">보안 안내:</span> 고객님의 안전을 위해 
                비밀번호 재설정 전에 이메일로 인증 링크를 발송해드립니다.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
