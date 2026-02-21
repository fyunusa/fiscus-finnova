'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button } from '@/components/ui';

export default function SignupCompletePage() {
  const router = useRouter();

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
        <Card className="w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              회원가입 완료!
            </h1>
            <p className="text-gray-600">
              핀노바 가입을 축하합니다
            </p>
          </div>

          {/* Account Created Confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-8 text-left">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h2 className="text-sm font-semibold text-green-900">
                계정이 성공적으로 생성되었습니다
              </h2>
            </div>
            <p className="text-sm text-green-800">
              이제 로그인하여 서비스를 이용할 수 있습니다.
            </p>
          </div>

          {/* Optional Next Steps */}
          <div className="bg-gray-50 rounded-lg p-5 mb-8 text-left">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              추가 설정 (선택사항)
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              아래 설정은 나중에 마이페이지에서도 할 수 있습니다.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span><strong>KYC 인증</strong> — 신분증 업로드로 본인인증 강화</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span><strong>거래 PIN</strong> — 투자 및 출금 시 사용할 PIN 설정</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="primary"
              className="w-full"
            >
              대시보드로 이동
            </Button>

            <Button
              onClick={() => router.push('/signup/individual/kyc')}
              variant="outline"
              className="w-full"
            >
              KYC & PIN 설정하기
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              KYC 및 PIN 설정은 언제든지 [마이페이지]에서 할 수 있습니다
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
