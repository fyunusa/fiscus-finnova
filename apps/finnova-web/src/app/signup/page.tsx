'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Button, Alert } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'individual' | 'corporate' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    if (!selectedType) {
      return;
    }

    setLoading(true);
    try {
      if (selectedType === 'individual') {
        router.push('/signup/individual/terms');
      } else {
        router.push('/signup/corporate/terms');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
        <Card className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              핀노바 회원가입
            </h1>
            <p className="text-center text-gray-600">
              투자 유형을 선택해주세요
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div
              onClick={() => setSelectedType('individual')}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedType === 'individual'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                    selectedType === 'individual'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedType === 'individual' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    개인 투자자
                  </h3>
                  <p className="text-sm text-gray-600">
                    개인 명의로 투자 활동을 시작합니다
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setSelectedType('corporate')}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedType === 'corporate'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                    selectedType === 'corporate'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedType === 'corporate' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    법인 투자자
                  </h3>
                  <p className="text-sm text-gray-600">
                    법인 명의로 투자 활동을 시작합니다
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Alert type="info" className="mb-6 text-sm">
            <strong>안내:</strong> 선택한 유형에 따라 필요한 서류가 달라집니다.
          </Alert>

          <Button
            onClick={handleProceed}
            disabled={!selectedType || loading}
            className="w-full"
            variant="primary"
          >
            {loading ? '진행 중...' : '다음 단계로'}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              이미 계정이 있으신가요?
            </p>
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              로그인하기
            </a>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
