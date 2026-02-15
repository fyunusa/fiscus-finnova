'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function CorporateSignupRedirectPage() {
  const router = useRouter();

  React.useEffect(() => {
    // 자동으로 약관 페이지로 리다이렉트
    router.push('/signup/corporate/terms');
  }, [router]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
        <div className="text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    </Layout>
  );
}
