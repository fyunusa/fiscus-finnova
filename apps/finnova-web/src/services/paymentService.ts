import { apiClient } from '@/lib/api-client';

export interface LoanAccount {
  id: string;
  principalBalance: number;
  totalPaid: number;
  totalInterestAccrued: number;
  nextPaymentAmount: number;
  nextPaymentDate: string;
  monthlyPaymentAmount: number;
  totalMonths: number;
  currentMonth: number;
  annualInterestRate: number;
  repaymentMethod: 'equal-principal-interest' | 'equal-principal' | 'bullet';
}

export interface RepaymentSchedule {
  id: string;
  month: number;
  scheduledPaymentDate: string;
  principalPayment: number;
  interestPayment: number;
  totalPaymentAmount: number;
  status: 'UNPAID' | 'PAID' | 'OVERDUE';
  actualPaymentDate?: string;
  actualPaymentAmount?: number;
}

export interface RepaymentTransaction {
  id: string;
  transactionNo: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  principalApplied: number;
  interestApplied: number;
  bankReferences?: string;
}

export interface PaymentResponse {
  success: boolean;
  data: {
    transactionId: string;
    newBalance: number;
    nextPaymentAmount: number;
    loanStatus: string;
    message: string;
  };
}

export interface InitiatePaymentResponse {
  success: boolean;
  data: {
    paymentKey: string;
    orderId: string;
    checkoutUrl: string;
    amount: number;
  };
}

class PaymentService {
  /**
   * Get loan account details
   */
  async getLoanAccount(loanAccountId: string): Promise<LoanAccount> {
    const response = await apiClient.get(`/loans/accounts/${loanAccountId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch loan account');
    }
    return response.data;
  }

  /**
   * Get repayment schedule for a loan
   */
  async getRepaymentSchedule(loanAccountId: string): Promise<RepaymentSchedule[]> {
    const response = await apiClient.get(`/loans/accounts/${loanAccountId}/schedule`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch repayment schedule');
    }
    return response.data;
  }

  /**
   * Get repayment transaction history
   */
  async getRepaymentHistory(loanAccountId: string): Promise<RepaymentTransaction[]> {
    const response = await apiClient.get(`/loans/accounts/${loanAccountId}/transactions`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch transaction history');
    }
    return response.data;
  }

  /**
   * Initiate repayment payment with Toss Payments
   * Returns paymentKey and checkout URL
   */
  async initiateRepayment(
    loanAccountId: string,
    amount: number
  ): Promise<InitiatePaymentResponse> {
    const response = await apiClient.post(`/loans/accounts/${loanAccountId}/repay/initiate`, {
      amount,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to initiate payment');
    }

    return response;
  }

  /**
   * Process repayment payment
   */
  async processRepayment(
    loanAccountId: string,
    amount: number,
    paymentKey: string,
    orderId: string,
    paymentMethod: string = 'virtual_account'
  ): Promise<PaymentResponse> {
    const response = await apiClient.post(`/loans/accounts/${loanAccountId}/repay`, {
      amount,
      paymentKey,
      orderId,
      paymentMethod,
    });

    if (!response.success) {
      throw new Error(response.error || 'Payment processing failed');
    }

    return response;
  }

  /**
   * Get virtual account for deposits
   */
  async getVirtualAccount(loanAccountId: string) {
    const response = await apiClient.get(`/loans/accounts/${loanAccountId}/virtual-account`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch virtual account');
    }
    return response.data;
  }

  /**
   * Check repayment payment status and auto-process if complete
   * Called after redirect from Toss checkout
   */
  async checkRepaymentStatus(
    loanAccountId: string,
    paymentKey: string,
    orderId: string,
    amount: number
  ): Promise<{
    success: boolean;
    data: {
      status: string;
      isProcessed: boolean;
      transactionId: string;
      newBalance: number;
      nextPaymentAmount: number;
      loanStatus: string;
      message: string;
    };
    message?: string;
  }> {
    const queryParams = new URLSearchParams({
      paymentKey,
      orderId,
      amount: amount.toString(),
    });

    const response = await apiClient.get(
      `/loans/accounts/${loanAccountId}/repay/status?${queryParams.toString()}`
    );

    if (!response.success) {
      return {
        success: false,
        data: {} as any,
        message: response.error || 'Failed to check payment status',
      };
    }

    return {
      success: true,
      data: response.data,
    };
  }

  /**
   * Request virtual account statement
   */
  async getVirtualAccountStatement(loanAccountId: string) {
    const response = await apiClient.get(
      `/loans/accounts/${loanAccountId}/virtual-account/statement`
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch account statement');
    }
    return response.data;
  }
}

export const paymentService = new PaymentService();
