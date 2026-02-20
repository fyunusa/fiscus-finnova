'use client';

import React, { Suspense } from 'react';
import { PaymentStatusOverlay } from '@/components/PaymentStatusOverlay';
import { usePaymentStatusPolling } from '@/hooks/usePaymentStatusPolling';

function PaymentStatusContent() {
  const paymentStatusPolling = usePaymentStatusPolling();

  return (
    <PaymentStatusOverlay
      status={paymentStatusPolling.status}
      message={paymentStatusPolling.message}
      error={paymentStatusPolling.error}
      result={paymentStatusPolling.result}
    />
  );
}

export function PaymentStatusHandler() {
  return (
    <Suspense fallback={null}>
      <PaymentStatusContent />
    </Suspense>
  );
}
