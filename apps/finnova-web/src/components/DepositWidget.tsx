'use client';

import React, { useEffect, useState } from 'react';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';
import { Loader, AlertCircle } from 'lucide-react';
import * as vaService from '@/services/virtual-account.service';

interface DepositWidgetProps {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerName?: string;
  visible?: boolean;
  onPaymentStart?: () => void;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
}

export const DepositWidget: React.FC<DepositWidgetProps> = ({
  amount,
  orderId,
  customerEmail,
  customerName = 'Customer',
  visible = true,
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payment, setPayment] = useState<any>(null);
  const [ready, setReady] = useState(false);

  const merchantId = process.env.NEXT_PUBLIC_PAYGATE_MERCHANT_ID || 'test_ck_E92LAa5PVbLe5m5w0YEZ87YmpXyJ';
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

  // Initialize the Toss SDK with Hosted Payment Window
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        console.log('📦 Loading Toss Payments SDK (Hosted Payment Window)...');
        const tossPayments = await loadTossPayments(merchantId);

        // Use payment() instead of widgets() for hosted payment window
        const paymentInstance = tossPayments.payment({
          customerKey: ANONYMOUS,
        });

        console.log('✅ SDK loaded - Hosted Payment Window ready');
        setPayment(paymentInstance);
        setLoading(false);
        setReady(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load Toss SDK';
        console.error('SDK initialization error:', err);
        setError(errorMessage);
        onPaymentError?.(errorMessage);
        setLoading(false);
      }
    };

    initializeSDK();
  }, [merchantId, onPaymentError]);

  const handlePaymentRequest = async () => {
    console.log('🔍 Debug - handlePaymentRequest called:', {
      isProcessing,
      payment: !!payment,
      ready,
      amount,
      orderId,
    });

    if (isProcessing || !payment || !ready) {
      console.warn('⚠️ Payment request blocked:', {
        isProcessing,
        payment: !!payment,
        ready,
      });
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      onPaymentStart?.();

      if (!amount || amount <= 0) {
        throw new Error(`Invalid payment amount: ${amount}`);
      }

      const frontendBase = typeof window !== 'undefined' ? window.location.origin : frontendUrl;
      
      console.log('💳 Requesting hosted payment window from Toss...', {
        method: 'CARD',
        amount,
        orderId,
        successUrl: `${frontendBase}/dashboard/deposits`,
      });

      // Use hosted payment window (DEFAULT) - avoids iframe redirect issues
      await payment.requestPayment({
        method: 'CARD',  // Card and quick pay options
        amount: {
          currency: 'KRW',
          value: amount,
        },
        orderId,
        orderName: '가상계좌 입금',
        successUrl: `${frontendBase}/dashboard/deposits`,
        failUrl: `${frontendBase}/dashboard/deposits`,
        customerEmail,
        customerName,
      });

      // Note: requestPayment will redirect, so code below may not execute
      // The callback will be handled by the page component
      console.log('✅ Payment request sent to Toss (Hosted Window)');
    } catch (err: any) {
      const errorMessage = err?.message || 'Payment request failed';
      console.error('❌ Payment request error:', err);
      setError(errorMessage);
      onPaymentError?.(errorMessage);
      setIsProcessing(false);
    }
  };

  // Hosted payment window - no container divs needed
  return (
    <>
      {loading && visible && (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <Loader className="w-5 h-5 text-blue-600 animate-spin mr-3" />
          <span className="text-gray-600">결제 시스템 로딩 중...</span>
        </div>
      )}

      {visible && !loading && (
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">결제 오류</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Amount Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">결제 금액</span>
              <span className="text-2xl font-bold text-blue-600">
                {amount.toLocaleString('ko-KR')}원
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            결제하기 버튼을 클릭하면 토스 결제창이 열립니다.
          </p>

          {/* Payment Button */}
          <button
            onClick={handlePaymentRequest}
            disabled={isProcessing || !ready}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                결제 진행 중...
              </>
            ) : !ready ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                결제 준비 중...
              </>
            ) : (
              '결제하기'
            )}
          </button>
        </div>
      )}
    </>
  );
};
