import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { SES } from 'aws-sdk';

@Injectable()
export class EmailService {
  private readonly isLocal: boolean;
  private readonly logger = new Logger(EmailService.name);
  private sesClient: SES | null = null;
  private nodemailerTransport: nodemailer.Transporter | null = null;
  private usingSES: boolean = false;

  constructor() {
    this.isLocal = process.env.APP_ENV === 'local';
    this.initializeEmailService();
  }

  private initializeEmailService(): void {
    // Initialize SES if AWS credentials are available
    if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        this.sesClient = new SES({
          region: process.env.AWS_REGION,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
        this.usingSES = true;
        this.logger.log('✓ AWS SES initialized');
      } catch (error) {
        this.logger.warn('Failed to initialize AWS SES, will use nodemailer fallback:', error);
        this.initializeNodemailer();
      }
    } else {
      this.logger.log('AWS credentials not configured, initializing nodemailer fallback');
      this.initializeNodemailer();
    }
  }

  private initializeNodemailer(): void {
    try {
      // Check if Gmail credentials are provided
      if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
        // Use Gmail with App Password or regular credentials
        this.nodemailerTransport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
          },
        });
        this.logger.log('✓ Nodemailer initialized with Gmail credentials');
        return;
      }

      // Fallback to SMTP configuration if provided
      const smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      };

      if (smtpConfig.auth.user && smtpConfig.auth.pass) {
        this.nodemailerTransport = nodemailer.createTransport(smtpConfig);
        this.logger.log('✓ Nodemailer initialized with SMTP');
      } else {
        this.logger.warn('Gmail or SMTP credentials not configured - emails will be logged only');
      }
    } catch (error) {
      this.logger.error('Failed to initialize nodemailer:', error);
    }
  }

  private async renderTemplate(
    templateName: string,
    variables: Record<string, any>,
  ): Promise<string> {
    try {
      const templatePath = path.join(
        process.cwd(),
        'src/modules/external-api/templates',
        `${templateName}.hbs`,
      );

      if (!fs.existsSync(templatePath)) {
        this.logger.warn(`Template not found: ${templatePath}`);
        return '';
      }

      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const compiled = handlebars.compile(templateSource);
      return compiled(variables);
    } catch (err) {
      this.logger.error(`Failed to render template ${templateName}:`, err);
      throw err;
    }
  }

  async sendTemplatedEmail(
    to: string,
    subject: string,
    templateName: string,
    variables: Record<string, any>,
  ): Promise<boolean> {
    // If local environment, just log and return true without sending
    if (this.isLocal) {
      this.logger.log(
        `[LOCAL] Email would be sent to ${to}: ${subject}`,
      );
      return true;
    }

    try {
      const htmlBody = await this.renderTemplate(templateName, variables);
      return this.sendEmail(to, subject, htmlBody);
    } catch (error) {
      this.logger.error(`Failed to send templated email:`, error);
      throw error;
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlBody: string,
  ): Promise<boolean> {
    // If local environment, just log and return true without sending
    if (this.isLocal) {
      this.logger.log(
        `[LOCAL] Email would be sent to ${to}: ${subject}`,
      );
      return true;
    }

    const fromEmail = process.env.AWS_SES_FROM_EMAIL || 'noreply@fiscus.com';

    // Try SES first
    if (this.usingSES && this.sesClient) {
      try {
        const params = {
          Source: fromEmail,
          Destination: {
            ToAddresses: [to],
          },
          Message: {
            Subject: {
              Data: subject,
            },
            Body: {
              Html: {
                Data: htmlBody,
              },
            },
          },
        };

        await this.sesClient.sendEmail(params).promise();
        this.logger.log(`✓ Email sent via SES to ${to}: ${subject}`);
        return true;
      } catch (error) {
        this.logger.error(`SES send failed, attempting nodemailer fallback:`, error);
        // Fall through to nodemailer
      }
    }

    // Fall back to nodemailer
    if (this.nodemailerTransport) {
      try {
        await this.nodemailerTransport.sendMail({
          from: fromEmail,
          to,
          subject,
          html: htmlBody,
        });
        this.logger.log(`✓ Email sent via Nodemailer to ${to}: ${subject}`);
        return true;
      } catch (error) {
        this.logger.error(`Nodemailer send failed:`, error);
        throw new BadRequestException(
          `Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // No email service available
    this.logger.warn(`No email service available (SES or Nodemailer). Email to ${to} not sent.`);
    throw new BadRequestException(
      'Email service is not configured. Please configure AWS SES or SMTP settings.',
    );
  }
}
