'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert } from '@/components/ui';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function CorporateCompletePage() {
  const router = useRouter();

  const nextSteps = [
    {
      step: 1,
      title: '계정 활성화 대기',
      description: '제출하신 서류가 검토될 때까지 기다려주세요 (1-2영업일)',
    },
    {
      step: 2,
      title: '계정 활성화 완료',
      description: '이메일로 활성화 알림을 받으면 모든 기능을 사용할 수 있습니다',
    },
    {
      step: 3,
      title: '투자 프로젝트 검색',
      description: '다양한 투자 기회를 찾아보고 투자에 참여하세요',
    },
    {
      step: 4,
      title: '수익 확인 및 출금',
      description: '투자 수익을 확인하고 등록된 계좌로 출금하세요',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
                <CheckCircle className="w-20 h-20 text-green-600 relative" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              가입이 완료되었습니다!
            </h1>
            <p className="text-gray-600 mb-2">
              11 / 11 단계
            </p>
            <p className="text-lg text-green-700 font-semibold">
              핀노바 법인 투자자 회원가입을 축하합니다
            </p>
          </div>

          {/* Virtual Account Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <h2 className="font-semibold text-gray-900">
                  가상계좌가 발급되었습니다
                </h2>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>가상계좌번호</strong>
                </p>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  123-456-789012
                </p>
                <p className="text-sm text-gray-600">
                  은행: 국민은행 | 예금주: (주)핀테크솔루션
                </p>
                <Alert type="info" className="mt-4">
                  <strong>안내:</strong> 이 계좌로 투자금을 입금하세요. 입금 후 자동으로 귀사의 핀노바 계정에 반영됩니다.
                </Alert>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                다음 단계
              </h2>

              <div className="space-y-4">
                {nextSteps.map((item, index) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    {index < nextSteps.length - 1 && (
                      <div className="flex-shrink-0">
                        <ArrowRight className="w-5 h-5 text-gray-400 mt-1" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Important Notices */}
          <div className="space-y-4 mb-8">
            <Alert type="warning">
              <strong>중요:</strong> 계정 활성화는 1-2영업일이 소요됩니다. 이 기간 동안 제출하신 서류를 검토합니다.
            </Alert>
            <Alert type="info">
              <strong>확인 메일:</strong> 등록하신 이메일(corporate@company.com)로 활성화 알림을 받으실 수 있습니다.
            </Alert>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
              variant="primary"
            >
              대시보드로 이동
            </Button>
            <Button
              onClick={() => router.push('/projects')}
              className="w-full"
              variant="outline"
            >
              투자 프로젝트 보기
            </Button>
          </div>

          {/* Contact Support */}
          <Card className="bg-gray-50 border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-3">
                <strong>문제가 발생했나요?</strong>
              </p>
              <p className="text-sm text-gray-600 mb-3">
                고객지원팀이 언제든 도와드릴 준비가 되어있습니다
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="mailto:support@finnova.kr"
                  className="flex-1 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-semibold border border-blue-300 rounded hover:bg-blue-50 transition text-center"
                >
                  이메일: support@finnova.kr
                </a>
                <a
                  href="tel:+82-1644-0000"
                  className="flex-1 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-semibold border border-blue-300 rounded hover:bg-blue-50 transition text-center"
                >
                  전화: 1644-0000
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
