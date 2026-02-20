'use client';

import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface InlinePaymentStatusProps {
  status: 'idle' | 'checking' | 'success' | 'error';
  message: string;
  error?: string;
  result?: {
    transactionId: string;
    newBalance: number;
    nextPaymentAmount: number;
    loanStatus: string;
  };
}

export function InlinePaymentStatus({
  status,
  message,
  error,
  result,
}: InlinePaymentStatusProps) {
  // Don't show anything if idle
  if (status === 'idle') {
    return null;
  }

  return (
    <div className="mt-4 p-4 rounded-lg border-2">
      {status === 'checking' ? (
        <div className="flex items-start gap-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{message}</p>
            <p className="text-xs text-gray-600 mt-1">어디든 이동하셔도 괜찮습니다</p>
          </div>
        </div>
      ) : status === 'success' ? (
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900">{message}</p>
            {result && (
              <div className="mt-3 space-y-2 bg-white/50 rounded p-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">거래 번호:</span>
                  <span className="font-mono text-gray-900">
                    {result.transactionId.slice(0, 16)}...
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">남은 원금:</span>
                  <span className="font-semibold text-gray-900">
                    ₩{result.newBalance.toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">{message}</p>
            {error && (
              <p className="text-xs text-red-700 mt-1">{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
