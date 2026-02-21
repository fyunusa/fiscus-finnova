import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';

export interface PaymentResult {
  orderId: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  transactionId?: string;
  error?: string;
}

export interface VirtualAccount {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  expireDate: string;
  customerName?: string;
}

export interface VirtualAccountResponse {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  expireDate: string;
}

export interface VirtualAccountInitiation {
  paymentKey: string;
  orderId: string;
  checkoutUrl: string;
  amount: number;
  status: 'READY' | 'DONE';
  requiresUserAction: boolean; // true if user needs to complete checkout
}

export interface RepaymentConfirmationRequest {
  orderId: string;
  paymentKey: string;
  amount: number;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private readonly apiUrl = process.env.PAYGATE_API_URL || 'https://api.tosspayments.com';
  private readonly merchantId = process.env.PAYGATE_MERCHANT_ID || '';
  private readonly apiKey = process.env.PAYGATE_API_KEY || '';

  private getAuthHeader(): string {
    // Toss Payments uses: base64(SECRET_KEY:) - secret key + colon, no username
    const credentials = Buffer.from(`${this.apiKey}:`).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * Format date for Toss Payments API (YYYY-MM-DD format in local timezone)
   * Toss Payments expects dates in YYYY-MM-DD format, not ISO 8601
   */
  private formatDateForToss(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH',
    endpoint: string,
    data?: Record<string, unknown>,
    retries = 3,
  ): Promise<Record<string, unknown>> {
    try {
      this.logger.debug(`Making ${method} request to ${this.apiUrl}${endpoint}`);
      const response = await axios({
        method,
        url: `${this.apiUrl}${endpoint}`,
        data,
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
          'Idempotency-Key': `${Date.now()}-${Math.random()}`,
        },
        timeout: 30000, // 30 second timeout
      });
      this.logger.debug(`API response received:`, response.data);
      return response.data as Record<string, unknown>;
    } catch (error: unknown) {
      this.logger.error(`API request failed for ${method} ${endpoint}:`, error);
      const axiosError = error as { response?: { status?: number; data?: unknown }; message?: string; code?: string };
      
      if (axiosError.code === 'ECONNABORTED') {
        this.logger.error(`Request timeout to Toss Payments API`);
        throw new BadRequestException('Toss Payments API timeout - please try again');
      }
      
      if (axiosError.response?.status === 429 && retries > 0) {
        // Rate limiting - retry after delay
        this.logger.warn(`Rate limited, retrying... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.makeRequest(method, endpoint, data, retries - 1);
      }

      const errorMessage = typeof axiosError.response?.data === 'object'
        ? (axiosError.response?.data as Record<string, string>).message || 'Unknown error'
        : (axiosError.message || 'Unknown error');
      this.logger.error(`Toss Payments API error [${axiosError.response?.status}]: ${errorMessage}`, axiosError.response?.data);
      throw new BadRequestException(`Toss Payments API error: ${errorMessage}`);
    }
  }

  // ============ PAYMENT OPERATIONS ============

  async requestPayment(orderId: string, amount: number, email: string): Promise<Record<string, unknown>> {
    return this.makeRequest('POST', '/v1/payments', {
      orderId,
      amount,
      paymentKey: `payment_${orderId}`,
      orderName: `Fiscus Order ${orderId}`,
      customerEmail: email,
      method: 'CARD',
    });
  }

  async confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<PaymentResult> {
    try {
      const response = await this.makeRequest('POST', `/v1/payments/${paymentKey}`, {
        orderId,
        amount,
      }) as Record<string, string | number | undefined>;

      return {
        orderId,
        amount,
        status: response.status === 'DONE' ? 'success' : 'pending',
        transactionId: (response.transactionId || response.paymentKey) as string,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        orderId,
        amount,
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  async getPaymentStatus(orderId: string): Promise<PaymentResult> {
    try {
      const response = await this.makeRequest('GET', `/v1/payments/orders/${orderId}`) as Record<string, unknown>;

      return {
        orderId,
        amount: (response.totalAmount || 0) as number,
        status: response.status === 'DONE' ? 'success' : 'pending',
        transactionId: response.transactionId as string | undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Payment status lookup failed: ${errorMessage}`);
    }
  }

  /**
   * Get payment status by paymentKey
   * Used for polling payment completion after checkout
   */
  async getPaymentStatusByKey(paymentKey: string): Promise<{
    status: string;
    amount?: number;
    transactionId?: string;
  } | null> {
    try {
      const response = await this.makeRequest('GET', `/v1/payments/${paymentKey}`) as Record<string, unknown>;
      
      return {
        status: response.status as string,
        amount: (response.totalAmount || 0) as number,
        transactionId: response.transactionId as string | undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to get payment status for ${paymentKey}: ${errorMessage}`);
      return null;
    }
  }

  // ============ VIRTUAL ACCOUNT OPERATIONS (FOR LOAN DISBURSEMENT & REPAYMENT) ============

  /**
   * Initiate virtual account creation for loan disbursement
   * Generates a payment key and checkout URL for receiving loan funds
   * User must complete checkout before account is issued
   *
   * @param orderId - Unique order/loan ID
   * @param amount - Loan amount (disbursement amount)
   * @param accountName - Account holder name
   * @param expireDays - Days until account expires (default: 90 days for loans)
   * @returns Payment initiation details with checkout URL
   */
  async initiateVirtualAccountForDisbursement(
    orderId: string,
    amount: number,
    accountName: string,
    expireDays = 90,
    successUrl?: string,
    failUrl?: string,
  ): Promise<VirtualAccountInitiation> {
    try {
      const dueDate = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Default to bank accounts page for disbursement
      const defaultSuccessUrl = `${frontendUrl}/account/bank-accounts?payment=success`;
      const defaultFailUrl = `${frontendUrl}/account/bank-accounts?payment=failed`;
      
      const payload = {
        method: 'VIRTUAL_ACCOUNT',
        amount,
        orderId,
        orderName: 'Loan Disbursement',
        customerName: accountName,
        successUrl: successUrl || defaultSuccessUrl,
        failUrl: failUrl || defaultFailUrl,
        virtualAccount: {
          bank: '088', // Shinhan Bank
          dueDate: this.formatDateForToss(dueDate),
        },
      };
      
      this.logger.debug(`Initiating disbursement virtual account with payload:`, JSON.stringify(payload, null, 2));

      const response = await this.makeRequest('POST', '/v1/payments', payload) as Record<string, unknown>;
      const checkoutData = response.checkout as Record<string, string>;

      return {
        paymentKey: response.paymentKey as string,
        orderId: response.orderId as string,
        checkoutUrl: checkoutData.url,
        amount: response.totalAmount as number,
        status: (response.status as string) === 'DONE' ? 'DONE' : 'READY',
        requiresUserAction: (response.status as string) !== 'DONE',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Disbursement virtual account initiation error:`, error);
      throw new BadRequestException(`Virtual account initiation failed: ${errorMessage}`);
    }
  }

  /**
   * Initiate virtual account creation for loan repayment collection
   * Generates a payment key and checkout URL for receiving loan repayments
   * User must complete checkout before account is issued
   */
  async initiateVirtualAccountForRepayment(
    orderId: string,
    amount: number,
    accountName: string,
    expireDays = 365, // Repayment accounts valid for longer
    successUrl?: string,
    failUrl?: string,
    orderName?: string,
  ): Promise<VirtualAccountInitiation> {
    try {
      const dueDate = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Default to loan repayment page
      const defaultSuccessUrl = `${frontendUrl}/loan/my-loans?payment=success`;
      const defaultFailUrl = `${frontendUrl}/loan/my-loans?payment=failed`;
      
      const payload = {
        method: 'VIRTUAL_ACCOUNT',
        amount,
        orderId,
        orderName: orderName || 'Virtual Account Setup',
        customerName: accountName,
        successUrl: successUrl || defaultSuccessUrl,
        failUrl: failUrl || defaultFailUrl,
        virtualAccount: {
          bank: '088', // Shinhan Bank
          dueDate: this.formatDateForToss(dueDate),
        },
      };
      
      this.logger.debug(`Initiating virtual account with payload:`, JSON.stringify(payload, null, 2));

      const response = await this.makeRequest('POST', '/v1/payments', payload) as Record<string, unknown>;
      const checkoutData = response.checkout as Record<string, string>;

      return {
        paymentKey: response.paymentKey as string,
        orderId: response.orderId as string,
        checkoutUrl: checkoutData.url,
        amount: response.totalAmount as number,
        status: (response.status as string) === 'DONE' ? 'DONE' : 'READY',
        requiresUserAction: (response.status as string) !== 'DONE',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Virtual account initiation error:`, error);
      throw new BadRequestException(`Virtual account initiation failed: ${errorMessage}`);
    }
  }

  /**
   * Create virtual account for loan repayment collection
   * @deprecated Use initiateVirtualAccountForRepayment instead
   * This method is kept for temporary backward compatibility during migration
   */
  async createVirtualAccountForRepayment(
    orderId: string,
    amount: number,
    accountName: string,
    expireDays = 365,
  ): Promise<VirtualAccountResponse> {
    // For now, initiate the account and return a temporary response
    // In production, this would need to wait for webhook or poll
    const initiation = await this.initiateVirtualAccountForRepayment(
      orderId,
      amount,
      accountName,
      expireDays,
    );

    // Try to get the account if it was issued immediately (unlikely)
    const account = await this.getVirtualAccountFromPayment(initiation.paymentKey);
    if (account) {
      return account;
    }

    // If not issued, throw an error since the old code expects an actual account
    throw new BadRequestException(
      'Virtual account not issued immediately. User must complete checkout at: ' +
      initiation.checkoutUrl,
    );
  }

  /**
   * Create virtual account for loan disbursement
   * @deprecated Use initiateVirtualAccountForDisbursement instead
   * This method is kept for temporary backward compatibility during migration
   */
  async createVirtualAccountForDisbursement(
    orderId: string,
    amount: number,
    accountName: string,
    expireDays = 90,
  ): Promise<VirtualAccountResponse> {
    // For now, initiate the account and return a temporary response
    const initiation = await this.initiateVirtualAccountForDisbursement(
      orderId,
      amount,
      accountName,
      expireDays,
    );

    // Try to get the account if it was issued immediately (unlikely)
    const account = await this.getVirtualAccountFromPayment(initiation.paymentKey);
    if (account) {
      return account;
    }

    // If not issued, throw an error since the old code expects an actual account
    throw new BadRequestException(
      'Virtual account not issued immediately. Please use initiation flow instead.',
    );
  }

  /**
   * Check payment status and retrieve virtual account if completed
   * Called after user completes checkout to get account details
   *
   * @param paymentKey - Payment key from Toss
   * @returns Virtual account details if payment is complete, null if still pending
   */
  async getVirtualAccountFromPayment(paymentKey: string): Promise<VirtualAccountResponse | null> {
    try {
      const response = await this.makeRequest('GET', `/v1/payments/${paymentKey}`) as Record<string, unknown>;
      
      this.logger.debug(`Payment status check for ${paymentKey}:`, JSON.stringify(response, null, 2));

      // Check if virtual account has been issued
      const vaData = response.virtualAccount as Record<string, unknown> | null;
      if (!vaData) {
        this.logger.warn(`Virtual account not yet issued for payment ${paymentKey}. Status: ${response.status}`);
        return null;
      }

      return {
        accountNumber: vaData.accountNumber as string,
        bankCode: vaData.bankCode as string,
        bankName: (vaData.bankName || this.getBankNameFromCode(vaData.bankCode as string)) as string,
        accountName: (response.orderName || 'Virtual Account') as string,
        expireDate: (vaData.dueDate || new Date().toISOString()) as string,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get virtual account from payment ${paymentKey}:`, error);
      throw new BadRequestException(`Failed to retrieve virtual account: ${errorMessage}`);
    }
  }

  /**
   * Get virtual account details and current balance
   */
  async getVirtualAccountBalance(accountNumber: string): Promise<{
    accountNumber: string;
    bankCode: string;
    bankName: string;
    balance: number;
    totalDeposited: number;
    status: string;
  }> {
    try {
      const response = await this.makeRequest('GET', `/v1/virtual-accounts/${accountNumber}`) as Record<string, unknown>;

      return {
        accountNumber: response.accountNumber as string,
        bankCode: response.bankCode as string,
        bankName: (response.bankName || this.getBankNameFromCode(response.bankCode as string)) as string,
        balance: (response.balance || 0) as number,
        totalDeposited: (response.totalAmount || 0) as number,
        status: (response.status || 'ACTIVE') as string,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to get virtual account balance: ${errorMessage}`);
    }
  }

  /**
   * Confirm virtual account deposit and process as payment
   * Used when borrower deposits into virtual account
   */
  async confirmVirtualAccountDeposit(
    orderId: string,
    accountNumber: string,
    phoneNumber?: string,
  ): Promise<{
    success: boolean;
    orderId: string;
    accountNumber: string;
    confirmedAt: Date;
    transactionId?: string;
  }> {
    try {
      const response = await this.makeRequest('POST', `/v1/virtual-accounts/${accountNumber}`, {
        orderId,
        secretKey: this.apiKey,
        ...(phoneNumber && { phoneNumber }),
      }) as Record<string, unknown>;

      return {
        success: true,
        orderId,
        accountNumber,
        confirmedAt: new Date(),
        transactionId: response.transactionId as string | undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Virtual account confirmation failed: ${errorMessage}`);
    }
  }

  // ============ REPAYMENT OPERATIONS ============

  /**
   * Process loan repayment - confirm payment from Toss
   * For virtual accounts, payment is confirmed when deposit is received (status=DONE)
   * For cards, need to explicitly confirm the payment
   *
   * @param paymentKey - Payment key from Toss
   * @param orderId - Order/loan ID
   * @param amount - Repayment amount
   * @param knownPaymentStatus - Optional pre-fetched payment status to avoid redundant API call
   * @returns Confirmation details
   */
  async confirmRepaymentPayment(
    paymentKey: string,
    orderId: string,
    amount: number,
    knownPaymentStatus?: { status: string; amount?: number; transactionId?: string },
  ): Promise<{
    success: boolean;
    transactionId: string;
    amount: number;
    status: string;
    approvedAt?: Date;
  }> {
    try {
      // Use provided status if available, otherwise fetch it
      const paymentStatus = knownPaymentStatus || (await this.getPaymentStatusByKey(paymentKey));

      if (!paymentStatus) {
        throw new BadRequestException('Unable to retrieve payment status');
      }

      this.logger.debug(`Payment status check: ${paymentStatus.status}`, { paymentKey, status: paymentStatus.status });

      // For virtual accounts, if status is DONE, the payment is already confirmed
      // (deposit has been received). No need to call confirm endpoint.
      if (paymentStatus.status === 'DONE') {
        this.logger.debug(`Payment already DONE, skipping confirm endpoint for virtual account`);
        
        return {
          success: true,
          transactionId: paymentKey,
          amount: paymentStatus.amount || amount,
          status: 'DONE',
          approvedAt: new Date(),
        };
      }

      // For other statuses, attempt to confirm (for card payments, etc.)
      this.logger.debug(`Attempting to confirm payment with status: ${paymentStatus.status}`);
      
      const response = await this.makeRequest('POST', `/v1/payments/confirm`, {
        paymentKey,
        orderId,
        amount,
      }) as Record<string, unknown>;

      return {
        success: true,
        transactionId: (response.transactionId || response.paymentKey) as string,
        amount: (response.totalAmount || amount) as number,
        status: response.status as string,
        approvedAt: response.approvedAt ? new Date(response.approvedAt as string) : undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Repayment confirmation error: ${errorMessage}`);
      throw new BadRequestException(`Repayment confirmation failed: ${errorMessage}`);
    }
  }

  // ============ REFUND OPERATIONS ============

  /**
   * Process refund for loan (e.g., early repayment excess, overpayment)
   *
   * @param transactionId - Original transaction ID to refund
   * @param amount - Refund amount
   * @param reason - Reason for refund
   * @returns Refund confirmation
   */
  async processRefund(
    transactionId: string,
    amount: number,
    reason: string,
  ): Promise<{
    success: boolean;
    refundId: string;
    amount: number;
    status: string;
    createdAt: Date;
  }> {
    try {
      const response = await this.makeRequest('POST', `/v1/payments/${transactionId}/refunds`, {
        amount,
        reason,
      }) as Record<string, unknown>;

      return {
        success: true,
        refundId: (response.refundId || response.transactionId) as string,
        amount: (response.refundAmount || amount) as number,
        status: (response.status || 'PENDING') as string,
        createdAt: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Refund processing failed: ${errorMessage}`);
    }
  }

  // ============ CARD PAYMENT OPERATIONS (FOR DEPOSITS) ============

  /**
   * Initiate card payment for deposits
   * Generates payment key and checkout URL for user to pay via card/bank transfer
   *
   * @param orderId - Unique order ID
   * @param amount - Deposit amount in won
   * @param email - Customer email
   * @param description - Payment description
   * @returns Payment initiation details
   */
  async initiateCardPaymentForDeposit(
    orderId: string,
    amount: number,
    email: string,
    description: string,
  ): Promise<VirtualAccountInitiation> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Redirect URLs for deposit payment
      const successUrl = `${frontendUrl}/dashboard/deposits?payment=success&orderId=${orderId}`;
      const failUrl = `${frontendUrl}/dashboard/deposits?payment=failed&orderId=${orderId}`;

      const payload = {
        method: 'CARD',
        amount,
        orderId,
        orderName: description,
        customerEmail: email,
        successUrl,
        failUrl,
      };

      this.logger.debug(`Initiating card payment for deposit:`, JSON.stringify(payload, null, 2));

      const response = await this.makeRequest('POST', '/v1/payments', payload) as Record<string, unknown>;
      const checkoutData = response.checkout as Record<string, string>;

      return {
        paymentKey: response.paymentKey as string,
        orderId: response.orderId as string,
        checkoutUrl: checkoutData.url,
        amount: response.totalAmount as number,
        status: (response.status as string) === 'DONE' ? 'DONE' : 'READY',
        requiresUserAction: (response.status as string) !== 'DONE',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Card payment initiation error:`, error);
      throw new BadRequestException(`카드 결제 요청 실패: ${errorMessage}`);
    }
  }

  // ============ HELPER METHODS ============

  /**
   * Map bank codes to bank names (Toss uses Korean bank codes)
   */
  private getBankNameFromCode(bankCode: string): string {
    const bankMapping: Record<string, string> = {
      '020': 'KEB하나은행',
      '081': 'KEB하나은행',
      '088': '신한은행',
      '004': '국민은행',
      '003': '기업은행',
      '011': 'NH농협',
      '027': '수협',
      '047': '제주은행',
      '034': '광주은행',
      '039': '경남은행',
      '031': '대구은행',
      '032': '부산은행',
      '071': '우리은행',
      '021': 'SC제일은행',
      '023': '씨티은행',
      '050': '저축은행',
    };
    return bankMapping[bankCode] || bankCode;
  }
}
