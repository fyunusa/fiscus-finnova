'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { kakaoAuthService } from '@/services/kakaoAuth.service';

export const dynamic = 'force-dynamic';

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle Kakao-side errors (e.g., user cancelled login)
    if (error) {
      console.error('❌ Kakao login error:', error, errorDescription);
      setErrorMessage(errorDescription || '카카오 로그인이 취소되었습니다.');
      setStatus('error');

      setTimeout(() => {
        router.replace('/login?error=kakao_cancelled');
      }, 2000);
      return;
    }

    if (!code) {
      setErrorMessage('인증 코드를 찾을 수 없습니다.');
      setStatus('error');
      setTimeout(() => {
        router.replace('/login?error=no_code');
      }, 2000);
      return;
    }

    // Exchange code for tokens
    kakaoAuthService
      .handleCallback(code)
      .then((result) => {
        kakaoAuthService.storeTokens(result);
        setStatus('success');

        console.log('✅ Kakao login complete. New user:', result.user.isNewUser);

        // Redirect new users to onboarding, existing users to dashboard
        const destination = result.user.isNewUser ? '/onboarding' : '/dashboard';
        router.replace(destination);
      })
      .catch((err: Error) => {
        console.error('❌ Kakao callback failed:', err);
        setErrorMessage(err.message || '카카오 로그인에 실패했습니다.');
        setStatus('error');

        setTimeout(() => {
          router.replace('/login?error=kakao_failed');
        }, 2500);
      });
  }, [searchParams, router]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f9f9f9',
        fontFamily: 'sans-serif',
      }}
    >
      {status === 'loading' && (
        <>
          {/* Kakao yellow spinner */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#FEE500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              animation: 'pulse 1.4s ease-in-out infinite',
            }}
          >
            <svg width="28" height="26" viewBox="0 0 256 238" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M128 0C57.31 0 0 44.776 0 100.032c0 35.355 22.553 66.421 56.671 84.588L44.01 234.344a4 4 0 006.062 4.476l59.232-39.136C115.375 200.877 121.615 201 128 201c70.692 0 128-44.776 128-100.968C256 44.776 198.692 0 128 0z"
                fill="#000"
              />
            </svg>
          </div>
          <p style={{ color: '#666', fontSize: 16 }}>카카오 계정으로 로그인 중...</p>
          <p style={{ color: '#aaa', fontSize: 14, marginTop: 8 }}>잠시만 기다려 주세요.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#FEE500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 28 }}>✓</span>
          </div>
          <p style={{ color: '#333', fontSize: 16 }}>로그인 성공! 이동 중...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#fee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 28 }}>✕</span>
          </div>
          <p style={{ color: '#e33', fontSize: 16 }}>로그인 실패</p>
          <p style={{ color: '#999', fontSize: 14, marginTop: 8 }}>{errorMessage}</p>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.92); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}
