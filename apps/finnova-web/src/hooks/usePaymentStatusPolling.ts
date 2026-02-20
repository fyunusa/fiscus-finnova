'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentService } from '@/services/paymentService';

interface PendingPayment {
  loanAccountId: string;
  paymentKey: string;
  orderId: string;
  amount: number;
  initiatedAt: string;
}

interface PollingState {
  isPolling: boolean;
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

const MAX_POLL_ATTEMPTS = 60; // 60 attempts = 3 minutes with 3-second intervals
const POLL_INTERVAL_MS = 3000; // 3 seconds

export function usePaymentStatusPolling() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pollingState, setPollingState] = useState<PollingState>({
    isPolling: false,
    status: 'idle',
    message: '',
  });

  const startPolling = useCallback(async (payment: PendingPayment) => {
    setPollingState({
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
            setPollingState({
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

            // Clear sessionStorage
            sessionStorage.removeItem('pendingPayment');

            // Clean up URL after 3 seconds
            setTimeout(() => {
              router.push('/loan/my-loans');
            }, 3000);

            return;
          }

          // Payment not yet processed, continue polling
          if (attempts < MAX_POLL_ATTEMPTS) {
            setPollingState({
              isPolling: true,
              status: 'checking',
              message: `결제를 처리 중입니다... (${data.status})`,
            });

            setTimeout(poll, POLL_INTERVAL_MS);
          } else {
            // Max attempts reached
            setPollingState({
              isPolling: false,
              status: 'error',
              message: '결제 처리 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
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
          setPollingState({
            isPolling: true,
            status: 'checking',
            message: `결제를 처리 중입니다... (재시도 ${attempts})`,
          });

          setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          // Max retries exceeded
          setPollingState({
            isPolling: false,
            status: 'error',
            message: `결제 확인 중 오류가 발생했습니다: ${errorMessage}`,
            error: errorMessage,
          });
        }
      }
    };

    // Start the polling
    poll();
  }, [router]);

  useEffect(() => {
    const paymentSuccess = searchParams.get('payment') === 'success';
    const paymentFailed = searchParams.get('payment') === 'failed';

    if (!paymentSuccess && !paymentFailed) {
      return;
    }

    // Handle payment failed
    if (paymentFailed) {
      setPollingState({
        isPolling: false,
        status: 'error',
        message: '결제가 실패하였습니다. 다시 시도해주세요.',
        error: 'Payment failed',
      });
      return;
    }

    // Handle payment success - retrieve payment details from sessionStorage
    const pendingPaymentJson = sessionStorage.getItem('pendingPayment');
    if (!pendingPaymentJson) {
      setPollingState({
        isPolling: false,
        status: 'error',
        message: '결제 정보를 찾을 수 없습니다.',
        error: 'No pending payment found',
      });
      return;
    }

    const pendingPayment: PendingPayment = JSON.parse(pendingPaymentJson);

    // Start polling
    startPolling(pendingPayment);
  }, [searchParams, startPolling]);

  return pollingState;
}
