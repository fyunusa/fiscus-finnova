'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, Button, Alert } from '@/components/ui';

/**
 * LOG_1_1: Email Found - Single Account
 * Purpose: Display recovered email address
 * Flow: Show found email and provide link to login
 */
export default function EmailFoundResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const maskedEmail = email ? maskEmail(email) : '';

  function maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    
    const visibleChars = Math.min(3, username.length);
    const masked = username.slice(0, visibleChars) + '***';
    return `${masked}@${domain}`;
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full">
          <Card className="p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Email Found
            </h1>
            <p className="text-center text-gray-600 mb-8">
              We found your registered email address
            </p>

            {/* Email Display */}
            <Alert variant="info" className="mb-6">
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">Your Email (ID)</p>
                <p className="text-lg font-semibold text-blue-600">{maskedEmail}</p>
              </div>
            </Alert>

            {/* Security Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Security Notice
              </h3>
              <p className="text-xs text-gray-600">
                For your security, we have masked part of your email address. 
                The full email has been sent to your registered phone number.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
                size="lg"
              >
                Go to Login
              </Button>
              
              <Button
                onClick={() => router.push('/login/reset-password')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Reset Password
              </Button>
            </div>

            {/* Help Link */}
            <div className="mt-6 text-center">
              <Link
                href="/support/faq"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Need more help? Visit FAQ
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
