import { Injectable, BadRequestException } from '@nestjs/common';
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
  expireDate: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly apiUrl = process.env.PAYGATE_API_URL || 'https://api.tosspayments.com';
  private readonly merchantId = process.env.PAYGATE_MERCHANT_ID || '';
  private readonly apiKey = process.env.PAYGATE_API_KEY || '';

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.merchantId}:${this.apiKey}`).toString('base64');
    return `Basic ${credentials}`;
  }

  async requestPayment(orderId: string, amount: number, email: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/payments`,
        {
          orderId,
          amount,
          paymentKey: `payment_${orderId}`,
          orderName: `Fiscus Order ${orderId}`,
          customerEmail: email,
          method: 'CARD',
        },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Payment request failed: ${errorMessage}`);
    }
  }

  async confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<PaymentResult> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/payments/${paymentKey}`,
        { orderId, amount },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        orderId,
        amount,
        status: response.data.status === 'DONE' ? 'success' : 'pending',
        transactionId: response.data.transactionId,
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

  async createVirtualAccount(
    orderId: string,
    amount: number,
    expireDays = 7,
  ): Promise<VirtualAccount> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/virtual-accounts`,
        {
          orderId,
          amount,
          accountType: 'NORMAL',
          customerEmail: 'support@fiscus.com',
          expireDate: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        accountNumber: response.data.accountNumber,
        bankCode: response.data.bankCode,
        expireDate: response.data.expireDate,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Virtual account creation failed: ${errorMessage}`);
    }
  }

  async getPaymentStatus(orderId: string): Promise<PaymentResult> {
    try {
      const response = await axios.get(`${this.apiUrl}/v1/payments/orders/${orderId}`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      return {
        orderId,
        amount: response.data.totalAmount,
        status: response.data.status === 'DONE' ? 'success' : 'pending',
        transactionId: response.data.transactionId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Payment status lookup failed: ${errorMessage}`);
    }
  }
}
