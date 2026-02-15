'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert } from '@/components/ui';

export default function AccountExistsWarningPage() {
  const router = useRouter();

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
        <Card className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-6a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              이미 가입된 계정입니다
            </h1>
          </div>

          <Alert type="error" className="mb-6">
            <strong>알림:</strong> 입력하신 정보로 이미 가입된 계정이 있습니다.
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <p className="text-sm text-gray-700 mb-3">
              <strong>현재 상태:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 이미 가입된 계정이 있는 경우 중복 가입이 불가능합니다</li>
              <li>• 하나의 본인인증 정보로는 하나의 계정만 생성 가능합니다</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/login')}
              variant="primary"
              className="w-full"
            >
              로그인하기
            </Button>

            <Button
              onClick={() => router.push('/login/forgot-email')}
              variant="outline"
              className="w-full"
            >
              이메일 찾기
            </Button>

            <Button
              onClick={() => router.push('/login/reset-password')}
              variant="outline"
              className="w-full"
            >
              비밀번호 찾기
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center mb-3">
              계정에 문제가 있으신가요?
            </p>
            <Button
              onClick={() => window.location.href = '/support'}
              variant="ghost"
              className="w-full text-blue-600 hover:text-blue-700"
            >
              고객지원 문의하기
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
