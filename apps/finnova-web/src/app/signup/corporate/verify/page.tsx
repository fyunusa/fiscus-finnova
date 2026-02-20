'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, Alert } from '@/components/ui';

const KAKAO_JS_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JS_KEY ||
  process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ||
  '';
const KAKAO_REDIRECT_URI =
  process.env.NEXT_PUBLIC_KAKAO_CORPORATE_SIGNUP_REDIRECT_URI ||
  'http://localhost:3000/signup/corporate/kakao/callback';

export default function CorporateVerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleKakaoVerify = () => {
    if (!KAKAO_JS_KEY) {
      setError('카카오 설정이 올바르지 않습니다. 관리자에게 문의하세요.');
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      client_id: KAKAO_JS_KEY,
      redirect_uri: KAKAO_REDIRECT_URI,
      response_type: 'code',
      scope: 'profile_nickname,profile_image',
      state: 'corporate_signup',
    });
    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500 mb-1">2 / 5 단계</p>
            <h1 className="text-2xl font-bold text-gray-900">대표자 본인인증</h1>
            <p className="text-gray-600 mt-2">카카오 계정으로 대표자 본인인증을 진행합니다</p>
          </div>

          <Card>
            {error && <Alert type="error" className="mb-6">{error}</Alert>}

            <div className="space-y-4">
              <button
                onClick={handleKakaoVerify}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: '#FEE500', color: '#191600' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black/80 rounded-full animate-spin" />
                ) : (
                  <svg width="22" height="21" viewBox="0 0 256 238" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M128 0C57.31 0 0 44.776 0 100.032c0 35.355 22.553 66.421 56.671 84.588L44.01 234.344a4 4 0 006.062 4.476l59.232-39.136C115.375 200.877 121.615 201 128 201c70.692 0 128-44.776 128-100.968C256 44.776 198.692 0 128 0z"
                      fill="#191600"
                    />
                  </svg>
                )}
                {loading ? '카카오로 이동 중...' : '카카오로 대표자 인증'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                카카오 계정의 프로필 정보로 대표자 본인인증을 진행합니다
              </p>
            </div>

            <button
              onClick={() => router.back()}
              className="mt-8 w-full px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg text-sm transition-colors"
              disabled={loading}
            >
              이전 단계로
            </button>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
