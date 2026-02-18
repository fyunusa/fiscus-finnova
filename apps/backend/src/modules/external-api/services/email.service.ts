import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly isLocal: boolean;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.isLocal = process.env.APP_ENV === 'local';
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

    try {
      const fromEmail = process.env.AWS_SES_FROM_EMAIL || 'noreply@fiscus.com';

      // In production, integrate with AWS SES
      // For now, log the email details for local development
      this.logger.log(`Sending email to ${to} from ${fromEmail}: ${subject}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email:`, error);
      throw new BadRequestException(
        `Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
