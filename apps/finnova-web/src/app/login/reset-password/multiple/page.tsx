'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, Button, Alert } from '@/components/ui';

interface AccountInfo {
  email: string;
  accountType: 'Individual' | 'Corporate';
  registeredDate: string;
}

/**
 * LOG_2_2: Multiple Accounts Password Reset
 * Purpose: Handle password reset when user has multiple accounts
 * Flow: Show list of accounts and allow user to select which password to reset
 */
export default function MultipleAccountsPasswordResetPage() {
  const router = useRouter();

  // In real implementation, this would come from previous verification step
  const [accounts] = useState<AccountInfo[]>([
    {
      email: 'user@example.com',
      accountType: 'Individual',
      registeredDate: '2024-01-15',
    },
    {
      email: 'user.business@company.com',
      accountType: 'Corporate',
      registeredDate: '2023-11-20',
    },
  ]);

  const [selectedEmail, setSelectedEmail] = useState<string>('');

  const maskEmail = (email: string): string => {
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;

    const visibleChars = Math.min(3, username.length);
    const masked = username.slice(0, visibleChars) + '***';
    return `${masked}@${domain}`;
  };

  const handleContinue = () => {
    if (selectedEmail) {
      router.push(
        `/login/reset-password/new?email=${encodeURIComponent(selectedEmail)}`
      );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-2xl w-full">
          <Card className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Select Account for Password Reset
              </h1>
              <p className="text-gray-600">
                Multiple accounts are registered with your information.
                Please select which account&apos;s password you want to reset.
              </p>
            </div>

            {/* Notice */}
            <Alert variant="warning" className="mb-6">
              <div className="text-sm">
                <p className="font-medium mb-1">Important</p>
                <p className="text-gray-700">
                  Each account has a separate password. Resetting the password for
                  one account will not affect the others.
                </p>
              </div>
            </Alert>

            {/* Account Selection */}
            <div className="space-y-3 mb-6">
              {accounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedEmail(account.email)}
                  className={`w-full text-left p-5 border-2 rounded-lg transition-all ${
                    selectedEmail === account.email
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Email */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {maskEmail(account.email)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            account.accountType === 'Individual'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {account.accountType}
                        </span>
                      </div>

                      {/* Account Info */}
                      <p className="text-sm text-gray-600">
                        Registered:{' '}
                        {new Date(account.registeredDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Selection Radio */}
                    <div className="ml-4 flex-shrink-0">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedEmail === account.email
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedEmail === account.email && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Security Tips
                  </h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Use a unique, strong password for each account</li>
                    <li>• Avoid reusing passwords across different accounts</li>
                    <li>
                      • Consider using a password manager to keep track of multiple
                      passwords
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                disabled={!selectedEmail}
                className="w-full"
                size="lg"
              >
                Continue to Password Reset
              </Button>

              <Button
                onClick={() => router.push('/login/reset-password')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Start Over
              </Button>
            </div>

            {/* Help Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Having trouble accessing your accounts?
                </p>
                <div className="flex justify-center gap-4">
                  <Link
                    href="/support/faq"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View FAQ
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href="/support/inquiry"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
