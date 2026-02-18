import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

export interface SmsOptions {
  to: string | string[];
  message: string;
  from?: string;
}

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class SmsService {
  private readonly apiUrl = process.env.SMS_API_URL || 'https://apis.aligo.in';
  private readonly apiKey = process.env.SMS_API_KEY || '';
  private readonly from = process.env.SMS_SENDER_NUMBER || '02-1234-5678';

  async send(options: SmsOptions): Promise<SmsResponse> {
    if (!this.apiKey) {
      throw new BadRequestException('SMS service not configured');
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to.join(',') : options.to;

      const response = await axios.post(`${this.apiUrl}/send/`, {
        key: this.apiKey,
        user_id: 'fiscus_user',
        sender: options.from || this.from,
        receiver: recipients,
        msg: options.message,
        testmode_yn: process.env.NODE_ENV === 'production' ? 'N' : 'Y',
      });

      if (response.data.result_code === 1) {
        return {
          success: true,
          messageId: response.data.msg_id,
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'SMS send failed',
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`SMS service error: ${errorMessage}`);
    }
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<SmsResponse> {
    const message = `[Fiscus] 인증 코드: ${code}. 이 코드는 10분 동안 유효합니다.`;
    return this.send({
      to: phoneNumber,
      message,
    });
  }

  async sendTransactionNotification(
    phoneNumber: string,
    amount: number,
    type: 'deposit' | 'withdrawal' | 'transfer',
  ): Promise<SmsResponse> {
    const typeText = {
      deposit: '입금',
      withdrawal: '출금',
      transfer: '송금',
    };

    const message = `[Fiscus] ${typeText[type]} 완료. 금액: ₩${amount.toLocaleString('ko-KR')}`;
    return this.send({
      to: phoneNumber,
      message,
    });
  }

  async sendLoginAlert(phoneNumber: string, device: string): Promise<SmsResponse> {
    const message = `[Fiscus] 새로운 기기에서 로그인되었습니다. (${device}) 본인 확인: fiscus.app`;
    return this.send({
      to: phoneNumber,
      message,
    });
  }

  async sendPasswordResetCode(phoneNumber: string, code: string): Promise<SmsResponse> {
    const message = `[Fiscus] 비밀번호 재설정 인증 코드: ${code}. 이 코드는 10분 동안 유효합니다.`;
    return this.send({
      to: phoneNumber,
      message,
    });
  }
}
