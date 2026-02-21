export interface InitiateDepositPaymentResponse {
  success: boolean;
  requestId: string; // Deposit request ID (maps to orderId)
  paymentKey?: string;
  orderId?: string;
  checkoutUrl?: string;
  amount: number;
  status: 'READY' | 'DONE';
  requiresUserAction: boolean; // true if user needs to complete checkout
  message?: string;
  error?: string;
}

export interface ConfirmDepositPaymentResponse {
  success: boolean;
  depositId?: string;
  amount?: number;
  status?: string; // 'COMPLETED' | 'FAILED' | 'PENDING'
  balanceAfter?: number;
  message?: string;
  error?: string;
}
