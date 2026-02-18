import { Injectable, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface NiceVerificationRequest {
  name: string;
  phone: string;
  birthDate?: string;
  gender?: 'M' | 'F';
}

interface NiceVerificationResponse {
  success: boolean;
  token?: string;
  ci?: string;
  di?: string;
  name?: string;
  birthDate?: string;
  gender?: string;
  verified?: boolean;
  message?: string;
  error?: string;
}

interface StoredVerificationData {
  token: string;
  code: string;
  data: NiceVerificationRequest;
  expiresAt: number;
}

@Injectable()
export class NiceVerificationService {
  private readonly logger = new Logger(NiceVerificationService.name);
  private readonly verificationStore = new Map<string, StoredVerificationData>();
  private readonly demoMode: boolean;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Check if demo mode based on env variables
    const clientId = this.configService.get('NICE_CLIENT_ID', '');
    this.demoMode =
      !clientId ||
      clientId.includes('placeholder') ||
      clientId.includes('generated');
  }

  /**
   * Request identity verification from NICE API
   * Generates a verification token and sends verification code
   */
  async requestVerification(
    data: NiceVerificationRequest,
  ): Promise<NiceVerificationResponse> {
    try {
      this.logger.log('📋 Processing NICE verification request');

      if (this.demoMode) {
        this.logger.warn('🔧 NICE running in DEMO MODE');
        return this.handleDemoVerificationRequest(data);
      }

      // Real NICE API
      return await this.callNiceApi('/request', data);
    } catch (error) {
      this.logger.error('❌ NICE verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'NICE verification failed',
      };
    }
  }

  /**
   * Verify the code user entered against stored verification data
   */
  async verifyCode(token: string, code: string): Promise<NiceVerificationResponse> {
    try {
      this.logger.log('🔐 Verifying NICE code');

      if (this.demoMode) {
        return this.handleDemoCodeVerification(token, code);
      }

      // Check if token exists in store
      const storedData = this.verificationStore.get(token);
      if (!storedData) {
        throw new BadRequestException('Invalid or expired token');
      }

      // Check if code matches
      if (storedData.code !== code) {
        throw new BadRequestException('Code mismatch');
      }

      // Check if token has expired (10 minutes = 600000ms)
      if (Date.now() > storedData.expiresAt) {
        this.verificationStore.delete(token);
        throw new BadRequestException('Verification code expired');
      }

      // Call real NICE API to verify
      const result = await this.callNiceApi('/verify', {
        token,
        code,
      });

      // Clean up after successful verification
      this.verificationStore.delete(token);

      return result;
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
   * Demo mode: Generate mock verification
   */
  private handleDemoVerificationRequest(
    data: NiceVerificationRequest,
  ): NiceVerificationResponse {
    // Generate random verification code (6 digits)
    const verificationCode = String(Math.floor(Math.random() * 900000) + 100000);

    // Generate token
    const token = `demo_nice_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store verification data for later verification
    this.verificationStore.set(token, {
      token,
      code: verificationCode,
      data,
      expiresAt: Date.now() + 600000, // 10 minutes
    });

    this.logger.debug(`Generated demo code: ${verificationCode}, token: ${token}`);

    return {
      success: true,
      token,
      message: `Demo: Verification code ${verificationCode} sent to ${data.phone}`,
    };
  }

  /**
   * Demo mode: Verify code
   */
  private handleDemoCodeVerification(
    token: string,
    code: string,
  ): NiceVerificationResponse {
    // In demo mode, accept any 6-digit code format
    if (!/^\d{6}$/.test(code)) {
      return {
        success: false,
        verified: false,
        error: 'Code must be 6 digits',
      };
    }

    // Generate fake CI/DI for demo
    const ci = `DEMO_CI_${Date.now()}`;
    const di = `DEMO_DI_${Math.random().toString(36).substring(7)}`;

    // Try to get stored data if available, otherwise use defaults
    const storedData = this.verificationStore.get(token);
    this.verificationStore.delete(token);

    return {
      success: true,
      verified: true,
      ci,
      di,
      name: storedData?.data.name || 'Demo User',
      birthDate: storedData?.data.birthDate || '1990-01-15',
      gender: storedData?.data.gender || 'M',
      message: 'Demo: Code verified successfully',
    };
  }

  /**
   * Call actual NICE API
   * This will be implemented when real credentials are available
   */
  private async callNiceApi(
    endpoint: string,
    payload: NiceVerificationRequest | { token: string; code: string },
  ): Promise<NiceVerificationResponse> {
    try {
      const apiUrl = this.configService.get('NICE_API_URL');
      const clientId = this.configService.get('NICE_CLIENT_ID');
      const clientSecret = this.configService.get('NICE_CLIENT_SECRET');

      if (!apiUrl) {
        throw new BadRequestException('NICE API URL not configured');
      }

      const response = await firstValueFrom(
        this.httpService.post(`${apiUrl}${endpoint}`, payload, {
          headers: {
            'Client-ID': clientId,
            'Client-Secret': clientSecret,
            'Content-Type': 'application/json',
          },
        }),
      );

      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      this.logger.error(`NICE API error:`, error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'NICE API call failed',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
