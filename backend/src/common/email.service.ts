import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailDeliveryResult {
  delivered: boolean;
  error?: string;
  provider?: 'smtp' | 'resend';
}

const RESEND_SANDBOX_FROM = 'PathForge <onboarding@resend.dev>';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly appUrl =
    process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  private smtpTransporter: Transporter | null | undefined;

  getAppUrl(): string {
    return this.appUrl.replace(/\/$/, '');
  }

  buildResetLink(token: string): string {
    return `${this.getAppUrl()}/login?reset=${token}`;
  }

  buildVerifyLink(token: string): string {
    return `${this.getAppUrl()}/auth/verify?token=${encodeURIComponent(token)}`;
  }

  formatFromAddress(): string {
    const rawFrom =
      process.env.EMAIL_FROM ||
      process.env.SMTP_USER ||
      'onboarding@resend.dev';
    return rawFrom.includes('<') ? rawFrom : `PathForge <${rawFrom}>`;
  }

  isSmtpConfigured(): boolean {
    return Boolean(
      process.env.SMTP_HOST?.trim() &&
        process.env.SMTP_USER?.trim() &&
        process.env.SMTP_PASS?.trim(),
    );
  }

  isResendConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY?.trim());
  }

  isDeliveryConfigured(): boolean {
    return this.isSmtpConfigured() || this.isResendConfigured();
  }

  private getSmtpTransporter(): Transporter | null {
    if (this.smtpTransporter !== undefined) {
      return this.smtpTransporter;
    }

    if (!this.isSmtpConfigured()) {
      this.smtpTransporter = null;
      return null;
    }

    this.smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!.trim(),
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER!.trim(),
        pass: process.env.SMTP_PASS!.trim(),
      },
    });

    return this.smtpTransporter;
  }

  private usesResendSandbox(from: string): boolean {
    return from.includes('@resend.dev');
  }

  private async sendViaSmtp(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<EmailDeliveryResult> {
    const transporter = this.getSmtpTransporter();
    if (!transporter) {
      return { delivered: false, error: 'SMTP is not configured', provider: 'smtp' };
    }

    try {
      await transporter.sendMail({
        from: this.formatFromAddress(),
        to,
        subject,
        text,
        html: html ?? text.replace(/\n/g, '<br/>'),
      });
      this.logger.log(`Email sent via SMTP to ${to}: ${subject}`);
      return { delivered: true, provider: 'smtp' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(`SMTP failed for ${to}: ${errorMessage}`);
      return { delivered: false, error: errorMessage, provider: 'smtp' };
    }
  }

  private async sendViaResend(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<EmailDeliveryResult> {
    const resendKey = process.env.RESEND_API_KEY!.trim();
    const primaryFrom = this.formatFromAddress();
    const senders = [primaryFrom];
    if (!this.usesResendSandbox(primaryFrom)) {
      senders.push(RESEND_SANDBOX_FROM);
    }

    let lastError: string | undefined;
    for (const from of senders) {
      const result = await this.tryResendSend(
        resendKey,
        from,
        to,
        subject,
        text,
        html,
      );
      if (result.delivered) {
        return { ...result, provider: 'resend' };
      }
      lastError = result.error;
    }

    return { delivered: false, error: lastError, provider: 'resend' };
  }

  private async tryResendSend(
    apiKey: string,
    from: string,
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<EmailDeliveryResult> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          text,
          html: html ?? text.replace(/\n/g, '<br/>'),
        }),
      });

      if (res.ok) {
        this.logger.log(`Email sent via Resend to ${to}: ${subject} (from: ${from})`);
        return { delivered: true };
      }

      const body = await res.text();
      let errorMessage = `HTTP ${res.status}`;
      try {
        const parsed = JSON.parse(body) as { message?: string; error?: string };
        errorMessage = parsed.message ?? parsed.error ?? errorMessage;
      } catch {
        if (body) errorMessage = body.slice(0, 300);
      }

      this.logger.warn(
        `Resend failed (${res.status}) from="${from}" to="${to}": ${errorMessage}`,
      );
      return { delivered: false, error: errorMessage };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Resend error for ${to}: ${errorMessage}`);
      return { delivered: false, error: errorMessage };
    }
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<EmailDeliveryResult> {
    if (!this.isDeliveryConfigured()) {
      return {
        delivered: false,
        error:
          'Email is not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS or RESEND_API_KEY.',
      };
    }

    if (this.isSmtpConfigured()) {
      const smtpResult = await this.sendViaSmtp(to, subject, text, html);
      if (smtpResult.delivered) {
        return smtpResult;
      }
      if (!this.isResendConfigured()) {
        return smtpResult;
      }
      this.logger.warn(`SMTP failed, trying Resend for ${to}`);
    }

    if (this.isResendConfigured()) {
      return this.sendViaResend(to, subject, text, html);
    }

    return { delivered: false, error: 'No email provider available' };
  }

  async sendPasswordResetEmail(
    to: string,
    token: string,
  ): Promise<EmailDeliveryResult> {
    const link = this.buildResetLink(token);
    const text = `Reset your PathForge password:\n\n${link}\n\nThis link expires in 1 hour.`;
    return this.sendMail(to, 'Reset your PathForge password', text);
  }

  async sendVerificationEmail(
    to: string,
    token: string,
  ): Promise<EmailDeliveryResult> {
    const link = this.buildVerifyLink(token);
    const text = `Verify your PathForge email:\n\n${link}\n\nThis link expires in 24 hours.`;
    return this.sendMail(to, 'Verify your PathForge email', text);
  }
}
