import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly isLocal: boolean;
  private readonly logger = new Logger(SmsService.name);

  constructor() {
    this.isLocal = process.env.APP_ENV === 'local';
  }

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    // If local environment, just log and return true without sending
    if (this.isLocal) {
      this.logger.log(`[LOCAL] SMS would be sent to ${phoneNumber}: ${message}`);
      return true;
    }

    try {
      const provider = process.env.SMS_PROVIDER || 'twilio';
      this.logger.log(
        `Sending SMS to ${phoneNumber} via ${provider}`,
      );

      // In production, integrate with SMS provider (Twilio, AWS SNS, etc.)
      // For now, just log
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS:`, error);
      throw error;
    }
  }

  async sendVerificationSms(phoneNumber: string, code: string): Promise<boolean> {
    // If local environment, just log and return true without sending
    if (this.isLocal) {
      this.logger.log(
        `[LOCAL] Verification SMS would be sent to ${phoneNumber}: ${code}`,
      );
      return true;
    }

    try {
      const message = `[Fiscus] 인증 코드: ${code} (10분 유효)`;
      return this.sendSms(phoneNumber, message);
    } catch (error) {
      this.logger.error(`Failed to send verification SMS:`, error);
      throw error;
    }
  }

  async sendPasswordResetSms(phoneNumber: string, code: string): Promise<boolean> {
    // If local environment, just log and return true without sending
    if (this.isLocal) {
      this.logger.log(
        `[LOCAL] Password reset SMS would be sent to ${phoneNumber}: ${code}`,
      );
      return true;
    }

    try {
      const message = `[Fiscus] 비밀번호 초기화 코드: ${code} (15분 유효)`;
      return this.sendSms(phoneNumber, message);
    } catch (error) {
      this.logger.error(`Failed to send password reset SMS:`, error);
      throw error;
    }
  }
}
