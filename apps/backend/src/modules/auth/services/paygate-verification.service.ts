import { Injectable, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface Initiate1WonDto {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}

interface PaygateResponse {
  success: boolean;
  token?: string;
  verified?: boolean;
  message?: string;
  error?: string;
}

interface StoredTransferData {
  token: string;
  code: string;
  account: Initiate1WonDto;
  expiresAt: number;
}

@Injectable()
export class PaygateVerificationService {
  private readonly logger = new Logger(PaygateVerificationService.name);
  private readonly transferStore = new Map<string, StoredTransferData>();
  private readonly demoMode: boolean;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Check if demo mode based on env variables
    const merchantId = this.configService.get('PAYGATE_MERCHANT_ID', '');
    this.demoMode =
      !merchantId ||
      merchantId.includes('placeholder') ||
      merchantId.includes('generated');
  }

  /**
   * Initiate 1 won micro-deposit for account verification
   * Calls Paygate/Toss Payments API to transfer 1 won with verification code in memo
   */
  async initiate1WonTransfer(
    dto: Initiate1WonDto,
  ): Promise<PaygateResponse> {
    try {
      this.logger.log('📤 Initiating 1 won transfer');

      if (this.demoMode) {
        this.logger.warn('🔧 Paygate running in DEMO MODE');
        return this.handleDemo1WonTransfer(dto);
      }

      // Real Paygate API
      return await this.callPaygateApi('/transfer', dto);
    } catch (error) {
      this.logger.error('❌ 1 won transfer error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '1 won transfer failed',
      };
    }
  }

  /**
   * Verify the 3-digit code from 1 won transfer memo
   */
  async verify1WonCode(token: string, code: string): Promise<PaygateResponse> {
    try {
      this.logger.log('🔐 Verifying 1 won code');

      if (this.demoMode) {
        return this.handleDemo1WonVerification(token, code);
      }

      // Check if token exists in store
      const storedData = this.transferStore.get(token);
      if (!storedData) {
        throw new BadRequestException('Invalid or expired token');
      }

      // Check if code matches
      if (storedData.code !== code) {
        throw new BadRequestException('Code mismatch');
      }

      // Check if token has expired (10 minutes = 600000ms)
      if (Date.now() > storedData.expiresAt) {
        this.transferStore.delete(token);
        throw new BadRequestException('Verification code expired');
      }

      // Call real Paygate API to verify
      const result = await this.callPaygateApi('/verify', {
        token,
        code,
      });

      // Clean up after successful verification
      this.transferStore.delete(token);

      return {
        success: true,
        verified: true,
        message: result.message || 'Account verified',
      };
    } catch (error) {
      this.logger.error('❌ Code verification error:', error);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Code verification failed',
      };
    }
  }

  /**
   * Demo mode: Simulate 1 won transfer
   */
  private handleDemo1WonTransfer(dto: Initiate1WonDto): PaygateResponse {
    // Generate random 3-digit verification code
    const verificationCode = String(Math.floor(Math.random() * 900) + 100);

    // Generate token
    const token = `demo_paygate_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store transfer data for later verification
    this.transferStore.set(token, {
      token,
      code: verificationCode,
      account: dto,
      expiresAt: Date.now() + 600000, // 10 minutes
    });

    this.logger.debug(`Generated demo code: ${verificationCode}, token: ${token}`);

    return {
      success: true,
      token,
      message: `Demo: 1 won transferred to ${dto.accountNumber}. Look for code in memo: FINNOVA${verificationCode}`,
    };
  }

  /**
   * Demo mode: Verify 1 won code
   */
  private handleDemo1WonVerification(
    token: string,
    code: string,
  ): PaygateResponse {
    // In demo, accept any 3-digit code format
    if (!/^\d{3}$/.test(code)) {
      return {
        success: false,
        verified: false,
        error: 'Code must be 3 digits',
      };
    }

    // Try to delete stored data if available, otherwise ignore
    this.transferStore.delete(token);

    return {
      success: true,
      verified: true,
      message: 'Demo: Account verified successfully',
    };
  }

  /**
   * Call actual Paygate (Toss Payments) API
   * This will be implemented when real credentials are available
   */
  private async callPaygateApi(
    endpoint: string,
    payload: Initiate1WonDto | { token: string; code: string },
  ): Promise<PaygateResponse> {
    try {
      const apiUrl = this.configService.get('PAYGATE_API_URL');
      const merchantId = this.configService.get('PAYGATE_MERCHANT_ID');
      const apiKey = this.configService.get('PAYGATE_API_KEY');

      if (!apiUrl) {
        throw new BadRequestException('Paygate API URL not configured');
      }

      const response = await firstValueFrom(
        this.httpService.post(`${apiUrl}${endpoint}`, payload, {
          headers: {
            'Merchant-ID': merchantId,
            'API-Key': apiKey,
            'Content-Type': 'application/json',
          },
        }),
      );

      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      this.logger.error(`Paygate API error:`, error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Paygate API call failed',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
