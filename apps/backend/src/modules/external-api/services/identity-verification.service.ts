import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

export interface IdentityVerificationResult {
  name: string;
  residentNumber: string;
  verified: boolean;
  timestamp: Date;
}

@Injectable()
export class IdentityVerificationService {
  private readonly niceApiUrl = process.env.NICE_API_URL || 'https://nice.checkplus.co.kr';
  private readonly niceClientId = process.env.NICE_CLIENT_ID || '';
  private readonly niceClientSecret = process.env.NICE_CLIENT_SECRET || '';

  async initiateVerification(): Promise<any> {
    try {
      // NICE API 초기화 요청
      const response = await axios.post(
        `${this.niceApiUrl}/api/v1/common/crypto/rsa/publickey`,
        {
          client_id: this.niceClientId,
        },
      );

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Verification initiation failed: ${errorMessage}`);
    }
  }

  async verifyIdentity(encryptedData: string): Promise<IdentityVerificationResult> {
    try {
      const response = await axios.post(
        `${this.niceApiUrl}/api/v1/common/crypto/validate`,
        {
          client_id: this.niceClientId,
          encrypted_data: encryptedData,
          integrity_value: this.generateIntegrity(encryptedData),
        },
      );

      if (response.data.result_code === '0000') {
        return {
          name: response.data.name,
          residentNumber: response.data.resident_number,
          verified: true,
          timestamp: new Date(),
        };
      } else {
        throw new BadRequestException('Verification failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Identity verification failed: ${errorMessage}`);
    }
  }

  async verifyDuplicateAccount(residentNumber: string): Promise<boolean> {
    try {
      // 중복계좌 확인 로직
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Duplicate account check failed: ${errorMessage}`);
    }
  }

  private generateIntegrity(data: string): string {
    // HMAC-SHA256 생성
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.niceClientSecret)
      .update(data)
      .digest('base64');
  }
}
