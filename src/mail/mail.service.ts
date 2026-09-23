import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface SendMailOptions {
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: SendMailAttachment[];
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new InternalServerErrorException(
        'SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS environment variables.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const transporter = this.getTransporter();
    const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

    try {
      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to send email: ${(error as Error).message}`);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
