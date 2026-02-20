'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { paymentService } from '@/services/paymentService';

interface PendingPayment {
  loanAccountId: string;
  paymentKey: string;
  orderId: string;
  amount: number;
  initiatedAt: string;
}

interface PollingStatus {
  isPolling: boolean;
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

const MAX_POLL_ATTEMPTS = 24; // 24 attempts = 12 minutes with 30-second intervals
const POLL_INTERVAL_MS = 30000; // 30 seconds

export function usePaymentPolling(loanAccountId: string) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PollingStatus>({
    isPolling: false,
    status: 'idle',
    message: '',
  });

  const startPolling = useCallback(async (payment: PendingPayment) => {
    setStatus({
      isPolling: true,
      status: 'checking',
      message: '결제 상태를 확인하는 중입니다...',
    });

    let attempts = 0;

    const poll = async () => {
      attempts++;

      try {
        const response = await paymentService.checkRepaymentStatus(
          payment.loanAccountId,
          payment.paymentKey,
          payment.orderId,
          payment.amount
        );

        if (response.success) {
          const data = response.data;

          // Payment is complete, show success
          if (data.isProcessed) {
            setStatus({
              isPolling: false,
              status: 'success',
              message: '결제가 완료되었습니다!',
              result: {
                transactionId: data.transactionId,
                newBalance: data.newBalance,
                nextPaymentAmount: data.nextPaymentAmount,
                loanStatus: data.loanStatus,
              },
            });

            // Clear sessionStorage after 5 seconds
            setTimeout(() => {
              sessionStorage.removeItem('pendingPayment');
              setStatus({
                isPolling: false,
                status: 'idle',
                message: '',
              });
            }, 5000);

            return;
          }

          // Payment not yet processed, continue polling
          if (attempts < MAX_POLL_ATTEMPTS) {
            setStatus({
              isPolling: true,
              status: 'checking',
              message: `결제를 처리 중입니다... (${data.status})`,
            });

            setTimeout(poll, POLL_INTERVAL_MS);
          } else {
            // Max attempts reached
            setStatus({
              isPolling: false,
              status: 'error',
              message: '결제 처리 시간이 초과되었습니다.',
              error: 'Polling timeout',
            });
          }
        } else {
          throw new Error(response.message || 'Failed to check payment status');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (attempts < MAX_POLL_ATTEMPTS) {
          // Retry on error
          console.warn(`Poll attempt ${attempts} failed, retrying...`, error);
          setStatus({
            isPolling: true,
            status: 'checking',
            message: `결제를 처리 중입니다... (재시도 ${attempts})`,
          });

          setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          // Max retries exceeded
          setStatus({
            isPolling: false,
            status: 'error',
            message: `결제 확인 중 오류가 발생했습니다`,
            error: errorMessage,
          });
        }
      }
    };

    // Start the polling
    poll();
  }, []);

  useEffect(() => {
    const paymentSuccess = searchParams.get('payment') === 'success';

    if (!paymentSuccess) {
      return;
    }

    // Retrieve payment details from sessionStorage
    const pendingPaymentJson = sessionStorage.getItem('pendingPayment');
    if (!pendingPaymentJson) {
      return;
    }

    const pendingPayment: PendingPayment = JSON.parse(pendingPaymentJson);

    // Only start polling if this is the account that was being paid
    if (pendingPayment.loanAccountId === loanAccountId) {
      startPolling(pendingPayment);
    }
  }, [searchParams, loanAccountId, startPolling]);

  return status;
}
