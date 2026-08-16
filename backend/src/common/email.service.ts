import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailDeliveryResult {
  delivered: boolean;
  error?: string;
  provider?: 'smtp' | 'resend';
  messageId?: string;
}

const RESEND_SANDBOX_FROM = 'PathForge <onboarding@resend.dev>';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly appUrl =
    process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  private smtpTransporter: Transporter | null | undefined;

  onModuleInit() {
    if (this.getAppUrl().includes('localhost')) {
      this.logger.warn(
        'Email: FRONTEND_URL uses localhost — links in emails often land in spam. Use a public URL in production.',
      );
    }
    if (this.isSmtpConfigured()) {
      void this.verifySmtpConnection();
      return;
    }
    if (this.isResendConfigured()) {
      this.logger.log('Email: Resend API configured (SMTP not set)');
      return;
    }
    this.logger.warn('Email: no SMTP or Resend configured — emails will fail');
  }

  private async verifySmtpConnection() {
    const transporter = this.getSmtpTransporter();
    if (!transporter) return;
    try {
      await transporter.verify();
      this.logger.log(
        `Email: SMTP ready (${process.env.SMTP_HOST}, user: ${process.env.SMTP_USER})`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Email: SMTP connection failed — ${msg}`);
    }
  }

  getAppUrl(): string {
    return this.appUrl.replace(/\/$/, '');
  }

  buildResetLink(token: string): string {
    return `${this.getAppUrl()}/login?reset=${token}`;
  }

  buildVerifyLink(token: string): string {
    return `${this.getAppUrl()}/auth/verify?token=${encodeURIComponent(token)}`;
  }

  private replyToAddress(): string | undefined {
    const replyTo = process.env.EMAIL_REPLY_TO?.trim() || process.env.SMTP_USER?.trim();
    return replyTo || undefined;
  }

  formatFromAddress(): string {
    const rawFrom =
      process.env.EMAIL_FROM ||
      process.env.SMTP_USER ||
      'onboarding@resend.dev';
    return rawFrom.includes('<') ? rawFrom : `PathForge <${rawFrom}>`;
  }

  /** Gmail app passwords are 16 chars; strip spaces if pasted with separators. */
  private normalizeSmtpPass(value: string | undefined): string {
    return (value ?? '').trim().replace(/\s+/g, '');
  }

  isSmtpConfigured(): boolean {
    return Boolean(
      process.env.SMTP_HOST?.trim() &&
        process.env.SMTP_USER?.trim() &&
        this.normalizeSmtpPass(process.env.SMTP_PASS),
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

    const port = Number(process.env.SMTP_PORT ?? 587);
    this.smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!.trim(),
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      requireTLS: port === 587,
      auth: {
        user: process.env.SMTP_USER!.trim(),
        pass: this.normalizeSmtpPass(process.env.SMTP_PASS),
      },
    });

    return this.smtpTransporter;
  }

  private usesResendSandbox(from: string): boolean {
    return from.includes('@resend.dev');
  }

  private buildHtmlEmail(title: string, body: string, actionUrl: string, actionLabel: string): string {
    return `<!DOCTYPE html>
<html>
<body style="font-family:Inter,Arial,sans-serif;background:#f6f6f6;padding:24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
    <tr><td>
      <h1 style="color:#111;font-size:20px;margin:0 0 12px;">${title}</h1>
      <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">${body}</p>
      <a href="${actionUrl}" style="display:inline-block;background:#F15025;color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;font-size:14px;">${actionLabel}</a>
      <p style="color:#888;font-size:12px;margin:24px 0 0;word-break:break-all;">Or copy this link:<br><a href="${actionUrl}">${actionUrl}</a></p>
    </td></tr>
  </table>
</body>
</html>`;
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
      const info = await transporter.sendMail({
        from: this.formatFromAddress(),
        to,
        replyTo: this.replyToAddress(),
        subject,
        text,
        html: html ?? text.replace(/\n/g, '<br/>'),
        headers: {
          'X-Entity-Ref-ID': `pathforge-${Date.now()}`,
        },
      });
      this.logger.log(
        `Email sent via SMTP to ${to}: ${subject} (id: ${info.messageId ?? 'n/a'})`,
      );
      return { delivered: true, provider: 'smtp', messageId: info.messageId };
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
        const data = (await res.json()) as { id?: string };
        this.logger.log(
          `Email sent via Resend to ${to}: ${subject} (from: ${from}, id: ${data.id ?? 'n/a'})`,
        );
        return { delivered: true, messageId: data.id };
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
      this.logger.warn(`SMTP failed, trying Resend for ${to}: ${smtpResult.error}`);
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
    const html = this.buildHtmlEmail(
      'Reset your password',
      'Click the button below to choose a new password. This link expires in 1 hour.',
      link,
      'Reset password',
    );
    return this.sendMail(to, 'Reset your PathForge password', text, html);
  }

  async sendVerificationEmail(
    to: string,
    token: string,
  ): Promise<EmailDeliveryResult> {
    const link = this.buildVerifyLink(token);
    const text = `Verify your PathForge email:\n\n${link}\n\nThis link expires in 24 hours.`;
    const html = this.buildHtmlEmail(
      'Verify your email',
      'Thanks for joining PathForge. Confirm your email address to secure your account.',
      link,
      'Verify email',
    );
    return this.sendMail(to, 'Verify your PathForge email', text, html);
  }
}
