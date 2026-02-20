import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly isLocal: boolean;
  private readonly logger = new Logger(SmsService.name);
  private snsClient: SNSClient | null = null;
  private twilioClient: twilio.Twilio | null = null;
  private usingSNS: boolean = false;
  private usingTwilio: boolean = false;

  constructor() {
    this.isLocal = process.env.APP_ENV === 'local';
    this.initializeSmsService();
  }

  private initializeSmsService(): void {
    // Initialize AWS SNS if credentials are available
    if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        this.snsClient = new SNSClient({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
        this.usingSNS = true;
        this.logger.log('✓ AWS SNS initialized for SMS');
      } catch (error) {
        this.logger.warn('Failed to initialize AWS SNS, will use Twilio fallback:', error);
        this.initializeTwilio();
      }
    } else {
      this.logger.log('AWS credentials not configured, initializing Twilio fallback');
      this.initializeTwilio();
    }
  }

  private initializeTwilio(): void {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN,
        );
        this.usingTwilio = true;
        this.logger.log('✓ Twilio initialized for SMS fallback');
      } else {
        this.logger.warn('Twilio credentials not configured - SMS will be logged only');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Twilio:', error);
    }
  }

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    // If local environment, just log and return true without sending
    if (this.isLocal) {
      this.logger.log(`[LOCAL] SMS would be sent to ${phoneNumber}: ${message}`);
      return true;
    }

    // Try SNS first
    if (this.usingSNS && this.snsClient) {
      try {
        const command = new PublishCommand({
          Message: message,
          PhoneNumber: this.normalizePhoneNumber(phoneNumber),
        });

        await this.snsClient.send(command);
        this.logger.log(`✓ SMS sent via SNS to ${phoneNumber}`);
        return true;
      } catch (error) {
        this.logger.error(`SNS send failed, attempting Twilio fallback:`, error);
        // Fall through to Twilio
      }
    }

    // Fall back to Twilio
    if (this.usingTwilio && this.twilioClient) {
      try {
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
        if (!twilioPhoneNumber) {
          throw new BadRequestException('TWILIO_PHONE_NUMBER environment variable not set');
        }

        await this.twilioClient.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: this.normalizePhoneNumber(phoneNumber),
        });

        this.logger.log(`✓ SMS sent via Twilio to ${phoneNumber}`);
        return true;
      } catch (error) {
        this.logger.error(`Twilio send failed:`, error);
        throw new BadRequestException(
          `SMS sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // No SMS service available
    this.logger.warn(`No SMS service available (SNS or Twilio). SMS to ${phoneNumber} not sent.`);
    throw new BadRequestException(
      'SMS service is not configured. Please configure AWS SNS or Twilio settings.',
    );
  }

  /**
   * Normalize phone number to E.164 format for SMS providers
   * Examples: +82-10-1234-5678 -> +821012345678
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except leading +
    let normalized = phoneNumber.replace(/[^\d+]/g, '');

    // If doesn't start with +, assume it's a local number and prepend country code
    if (!normalized.startsWith('+')) {
      // Remove leading 0 if present (common for local formats)
      if (normalized.startsWith('0')) {
        normalized = normalized.substring(1);
      }
      // Assume Korea (+82) by default, can be customized via env var
      const countryCode = process.env.SMS_COUNTRY_CODE || '82';
      normalized = `+${countryCode}${normalized}`;
    }

    return normalized;
  }

  async sendVerificationSms(phoneNumber: string, code: string): Promise<boolean> {
    const message = `[Fiscus] 인증 코드: ${code} (10분 유효)`;
    return this.sendSms(phoneNumber, message);
  }

  async sendPasswordResetSms(phoneNumber: string, code: string): Promise<boolean> {
    const message = `[Fiscus] 비밀번호 초기화 코드: ${code} (15분 유효)`;
    return this.sendSms(phoneNumber, message);
  }
}
