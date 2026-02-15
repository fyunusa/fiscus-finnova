'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button } from '@/components/ui';

export default function SignupCompletePage() {
  const router = useRouter();

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
        <Card className="w-full max-w-md text-center">
          {/* Success Icon Animation */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
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

          {/* Virtual Account Info */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              📌 발급된 가상계좌
            </h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">은행</p>
                <p className="text-sm font-mono font-semibold text-gray-900 bg-white p-2 rounded border border-gray-200">
                  국민은행
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">계좌번호</p>
                <p className="text-sm font-mono font-semibold text-gray-900 bg-white p-2 rounded border border-gray-200">
                  123-456-789012
                </p>
                <button className="text-xs text-blue-600 hover:text-blue-700 mt-1 font-semibold">
                  복사
                </button>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">예금주</p>
                <p className="text-sm font-semibold text-gray-900 bg-white p-2 rounded border border-gray-200">
                  핀노바투자
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-4 p-3 bg-white rounded border border-gray-200">
              이 계좌로 입금하시면 투자 지갑에 자동으로 입금됩니다
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              ✅ 다음 단계
            </h2>
            
            <ol className="space-y-3 text-sm">
              <li className="flex">
                <span className="font-semibold text-blue-600 mr-3">1.</span>
                <span className="text-gray-700">가상계좌로 투자금을 입금합니다</span>
              </li>
              <li className="flex">
                <span className="font-semibold text-blue-600 mr-3">2.</span>
                <span className="text-gray-700">투자 상품을 선택하고 투자합니다</span>
              </li>
              <li className="flex">
                <span className="font-semibold text-blue-600 mr-3">3.</span>
                <span className="text-gray-700">월별 이자를 받습니다</span>
              </li>
              <li className="flex">
                <span className="font-semibold text-blue-600 mr-3">4.</span>
                <span className="text-gray-700">만기 시 원금과 이자를 회수합니다</span>
              </li>
            </ol>
          </div>

          {/* Info Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-xs text-yellow-900">
              <strong>📢 주의:</strong> 가상계좌는 본인 계좌에서만 입금 가능합니다. 타인 계좌에서 입금 시 환불 처리됩니다.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/signup/individual/complete')}
              variant="primary"
              className="w-full"
            >
              대시보드로 이동
            </Button>

            <Button
              onClick={() => router.push('/investment')}
              variant="outline"
              className="w-full"
            >
              투자 상품 보기
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              계정 정보는 언제든지 [마이페이지]에서 확인할 수 있습니다
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
