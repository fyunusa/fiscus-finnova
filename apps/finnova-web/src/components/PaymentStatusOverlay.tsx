'use client';

import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentStatusOverlayProps {
  status: 'idle' | 'checking' | 'processing' | 'success' | 'error';
  message: string;
  error?: string;
  result?: {
    transactionId: string;
    newBalance: number;
    nextPaymentAmount: number;
    loanStatus: string;
  };
}

export function PaymentStatusOverlay({
  status,
  message,
  error,
  result,
}: PaymentStatusOverlayProps) {
  // Don't show overlay for idle status
  if (status === 'idle') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
        {status === 'checking' || status === 'processing' ? (
          <>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{message}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {status === 'checking'
                    ? '결제 상태를 확인하는 중입니다'
                    : '결제를 처리하는 중입니다'}
                </p>
              </div>
            </div>
          </>
        ) : status === 'success' ? (
          <>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">결제 완료!</p>
                <p className="text-sm text-gray-600 mt-1">{message}</p>
              </div>
            </div>

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">거래 번호</span>
                  <span className="text-sm font-mono text-gray-900">
                    {result.transactionId}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">남은 원금</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₩{result.newBalance.toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">다음 납부액</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₩{result.nextPaymentAmount.toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">대출 상태</span>
                  <span className="text-sm font-semibold text-green-600">
                    {result.loanStatus}
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              곧 목록 페이지로 이동합니다. 잠시만 기다려주세요.
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">결제 처리 실패</p>
                <p className="text-sm text-red-600 mt-1">{message}</p>
                {error && (
                  <p className="text-xs text-gray-500 mt-2">{error}</p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                다시 시도하거나 고객 지원팀에 연락해주세요.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
