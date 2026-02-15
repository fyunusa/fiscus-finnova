'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, Button, Alert } from '@/components/ui';

interface EmailAccount {
  email: string;
  registeredDate: string;
  accountType: 'Individual' | 'Corporate';
  lastLogin?: string;
}

/**
 * LOG_1_2: Email Found - Multiple Accounts
 * Purpose: Display multiple registered email addresses
 * Flow: Show list of found emails and allow user to select one
 */
export default function MultipleEmailsFoundPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // In real implementation, this would come from API response
  const [accounts] = useState<EmailAccount[]>([
    {
      email: 'user@example.com',
      registeredDate: '2024-01-15',
      accountType: 'Individual',
      lastLogin: '2024-02-10',
    },
    {
      email: 'user.business@company.com',
      registeredDate: '2023-11-20',
      accountType: 'Corporate',
      lastLogin: '2024-02-13',
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
      router.push(`/login?email=${encodeURIComponent(selectedEmail)}`);
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
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Multiple Accounts Found
              </h1>
              <p className="text-gray-600">
                We found {accounts.length} accounts registered with your information.
                Please select the account you want to access.
              </p>
            </div>

            {/* Notice */}
            <Alert variant="info" className="mb-6">
              <div className="text-sm">
                <p className="font-medium mb-1">Security Notice</p>
                <p className="text-gray-600">
                  Email addresses are partially masked for security. 
                  Full details have been sent to your registered phone number.
                </p>
              </div>
            </Alert>

            {/* Account Selection */}
            <div className="space-y-3 mb-6">
              {accounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedEmail(account.email)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
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
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>
                          Registered: {new Date(account.registeredDate).toLocaleDateString()}
                        </span>
                        {account.lastLogin && (
                          <span>
                            Last login: {new Date(account.lastLogin).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    <div className="ml-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
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

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                disabled={!selectedEmail}
                className="w-full"
                size="lg"
              >
                Continue to Login
              </Button>

              <Button
                onClick={() => router.push('/login/forgot-email')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Search Again
              </Button>
            </div>

            {/* Help */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Don&apos;t recognize these accounts?
              </p>
              <Link
                href="/support/inquiry"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Contact Support
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
