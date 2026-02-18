import { Injectable, BadRequestException } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{ filename: string; content: Buffer; type: string }>;
}

@Injectable()
export class EmailService {
  private readonly from: string;

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    this.from = process.env.EMAIL_FROM || 'noreply@finnova.com';
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      const msg = {
        to: options.to,
        from: options.from || this.from,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      await sgMail.send(msg as any);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to send email: ${errorMessage}`);
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `${process.env.FINNOVA_URL}/verify-email?token=${token}`;
    const html = `
      <h1>이메일 인증</h1>
      <p>다음 링크를 클릭하여 이메일을 인증해주세요:</p>
      <a href="${verificationLink}">이메일 인증하기</a>
      <p>이 링크는 24시간 동안 유효합니다.</p>
    `;

    await this.send({
      to: email,
      subject: 'Fiscus 이메일 인증',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `${process.env.FINNOVA_URL}/reset-password?token=${token}`;
    const html = `
      <h1>비밀번호 재설정</h1>
      <p>다음 링크를 클릭하여 비밀번호를 재설정해주세요:</p>
      <a href="${resetLink}">비밀번호 재설정하기</a>
      <p>이 링크는 1시간 동안 유효합니다.</p>
      <p>본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
    `;

    await this.send({
      to: email,
      subject: 'Fiscus 비밀번호 재설정',
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <h1>Fiscus에 오신 것을 환영합니다!</h1>
      <p>안녕하세요, ${name}님!</p>
      <p>회원가입이 완료되었습니다.</p>
      <p>이제 Fiscus 서비스를 이용할 수 있습니다.</p>
      <a href="${process.env.FINNOVA_URL}">Fiscus 바로가기</a>
    `;

    await this.send({
      to: email,
      subject: 'Fiscus 회원가입 완료',
      html,
    });
  }

  async sendTransactionNotification(
    email: string,
    amount: number,
    type: 'deposit' | 'withdrawal' | 'transfer',
  ): Promise<void> {
    const typeText = {
      deposit: '입금',
      withdrawal: '출금',
      transfer: '송금',
    };

    const html = `
      <h1>거래 알림</h1>
      <p>${typeText[type]} 거래가 완료되었습니다.</p>
      <p>금액: ₩${amount.toLocaleString('ko-KR')}</p>
      <p>자세한 내용은 앱에서 확인하세요.</p>
    `;

    await this.send({
      to: email,
      subject: `Fiscus - ${typeText[type]} 알림`,
      html,
    });
  }
}
