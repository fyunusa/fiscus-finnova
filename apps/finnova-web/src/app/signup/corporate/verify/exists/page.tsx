'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

export default function CorporateVerifyExistsPage() {
  const router = useRouter();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              가입 불가
            </h1>
            <p className="text-gray-600">
              2 / 11 단계
            </p>
          </div>

          <Card className="border-red-200 bg-red-50">
            <div className="flex items-start space-x-4 mb-6">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-red-900 mb-2">
                  이미 등록된 계정입니다
                </h2>
                <p className="text-sm text-red-800 mb-4">
                  입력하신 휴대폰 번호로 이미 핀노바 계정이 등록되어 있습니다.
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg mb-6 border border-red-200">
              <p className="text-sm text-gray-700 mb-3">
                <strong>문제 해결 방법:</strong>
              </p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>
                  ✓ 기존 계정으로 로그인하려면 <strong>로그인</strong>을 진행해주세요
                </li>
                <li>
                  ✓ 비밀번호를 잊어버렸다면 <strong>비밀번호 재설정</strong>을 해주세요
                </li>
                <li>
                  ✓ 다른 휴대폰 번호로 가입하려면 <strong>이전</strong>을 눌러 다시 진행해주세요
                </li>
              </ul>
            </div>

            <Alert type="info" className="mb-6">
              계정 관련 문의는 고객지원팀(support@finnova.kr)으로 연락주세요.
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
                variant="primary"
              >
                로그인하기
              </Button>
              <Button
                onClick={() => router.push('/forgot-password')}
                className="w-full"
                variant="outline"
              >
                비밀번호 재설정
              </Button>
              <Button
                onClick={() => router.back()}
                className="w-full"
                variant="outline"
              >
                이전 단계로
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
