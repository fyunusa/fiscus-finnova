'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_KAKAO_CORPORATE_SIGNUP_REDIRECT_URI ||
  'http://localhost:3000/signup/corporate/kakao/callback';

export default function CorporateKakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('카카오 인증 중...');
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('카카오 인증이 취소되었습니다.');
      setTimeout(() => router.replace('/signup/corporate/verify'), 2000);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('인증 코드를 찾을 수 없습니다.');
      setTimeout(() => router.replace('/signup/corporate/verify'), 2000);
      return;
    }

    const exchangeAndStore = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/kakao/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirectUri: REDIRECT_URI }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error((errorData as any)?.message || '카카오 인증 실패');
        }

        const data = await response.json();
        const user = data?.data?.user;

        if (!user) {
          throw new Error('카카오 프로필 정보를 가져올 수 없습니다');
        }

        // Placeholder generators for fields Kakao test key doesn't return
        const randomPhone = () => {
          const mid = String(Math.floor(Math.random() * 9000) + 1000);
          const end = String(Math.floor(Math.random() * 9000) + 1000);
          return `010${mid}${end}`;
        };

        const kakaoName = user.firstName
          ? [user.firstName, user.lastName].filter(Boolean).join(' ')
          : null;
        const kakaoEmail =
          user.email?.includes('@kakao.fiscus.app') ? null : user.email ?? null;

        // Store verified representative info using the keys corporate flow already reads
        const representativeName = user.phone ?? kakaoName ?? '카카오사용자';
        const representativePhone = user.phone ?? randomPhone();

        sessionStorage.setItem('representativeName', representativeName);
        sessionStorage.setItem('representativePhone', representativePhone);
        sessionStorage.setItem('phoneVerified', 'true');
        sessionStorage.setItem('verificationMethod', 'kakao');
        if (kakaoEmail) sessionStorage.setItem('representativeEmail', kakaoEmail);

        setStatus('success');
        setMessage('인증 완료! 사업자 정보 입력으로 이동합니다...');
        setTimeout(() => router.replace('/signup/corporate/business-lookup'), 1200);
      } catch (err) {
        console.error('Corporate Kakao callback error:', err);
        setStatus('error');
        setMessage(
          err instanceof Error ? err.message : '카카오 인증 처리 중 오류가 발생했습니다',
        );
        setTimeout(() => router.replace('/signup/corporate/verify?error=kakao_failed'), 2500);
      }
    };

    exchangeAndStore();
  }, [searchParams, router]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #eff6ff, #ffffff)',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: status === 'error' ? '#fee2e2' : '#FEE500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          animation: status === 'loading' ? 'pulse 1.4s ease-in-out infinite' : 'none',
        }}
      >
        {status === 'loading' && (
          <svg width="32" height="30" viewBox="0 0 256 238" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M128 0C57.31 0 0 44.776 0 100.032c0 35.355 22.553 66.421 56.671 84.588L44.01 234.344a4 4 0 006.062 4.476l59.232-39.136C115.375 200.877 121.615 201 128 201c70.692 0 128-44.776 128-100.968C256 44.776 198.692 0 128 0z"
              fill="#191600"
            />
          </svg>
        )}
        {status === 'success' && <span style={{ fontSize: 32 }}>✓</span>}
        {status === 'error' && <span style={{ fontSize: 32, color: '#dc2626' }}>✕</span>}
      </div>

      <p
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: status === 'error' ? '#dc2626' : '#1f2937',
          marginBottom: 8,
        }}
      >
        {status === 'loading'
          ? '카카오 인증 처리 중'
          : status === 'success'
            ? '인증 완료'
            : '인증 실패'}
      </p>
      <p style={{ fontSize: 14, color: '#6b7280' }}>{message}</p>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.9); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}
