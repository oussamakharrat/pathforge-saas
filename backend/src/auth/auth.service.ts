import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';
import { NotificationsHelper } from '../common/notifications.helper';
import { GamificationUnlockService } from '../common/gamification-unlock.service';
import { EmailService } from '../common/email.service';
import { calculateStreak } from '../domain/user.logic';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { OAuthProfile } from './interfaces/oauth-profile.interface';

const REFRESH_TOKEN_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly dashboard: DashboardProjector,
    private readonly notifications: NotificationsHelper,
    private readonly gamification: GamificationUnlockService,
    private readonly email: EmailService,
  ) {}

  private assertEmailDelivered(
    result: Awaited<ReturnType<EmailService['sendVerificationEmail']>>,
    purpose: string,
  ) {
    if (result.delivered) return;

    const resendOnlyHint =
      'Resend test mode only sends to your Resend signup email. ' +
      'Add SMTP settings (Gmail app password) in backend/.env, or verify a domain at resend.com/domains.';
    const smtpHint = 'Check SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env.';

    throw new ServiceUnavailableException(
      result.error ??
        `Could not send ${purpose}. ${this.email.isSmtpConfigured() ? smtpHint : resendOnlyHint}`,
    );
  }

  private async issueTokens(userId: string, email: string) {
    const token = this.jwtService.sign({ sub: userId, email });
    const refreshToken = randomBytes(48).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    });

    return { token, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const displayName = dto.name ?? dto.email.split('@')[0];

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        displayName,
        authProviderId: `local:${dto.email}`,
        careerProfile: { create: {} },
        subscription: {
          create: {
            plan: 'free',
            status: 'trialing',
          },
        },
        progressDashboard: { create: {} },
        careerMetrics: { create: {} },
      },
    });

    await this.notifications.create(
      user.id,
      'welcome',
      'Welcome to PathForge!',
      'Complete your profile to unlock personalized career insights.',
      user.id,
      'user',
      '/app/settings',
    );

    const verifyToken = randomBytes(32).toString('hex');
    const verifyExpires = new Date();
    verifyExpires.setHours(verifyExpires.getHours() + 24);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verifyToken,
        emailVerificationExpires: verifyExpires,
      },
    });
    const delivery = await this.email.sendVerificationEmail(user.email, verifyToken);
    this.assertEmailDelivered(delivery, 'verification email');

    const tokens = await this.issueTokens(user.id, user.email);

    return {
      message: 'Registration successful. Check your inbox to verify your email.',
      user: { id: user.id, email: user.email, name: user.displayName },
      emailVerified: false,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const streak = calculateStreak(
      user.lastLoginAt,
      user.streakDays,
      user.longestStreak,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        streakDays: streak.streakDays,
        longestStreak: streak.longestStreak,
        authProviderId: user.authProviderId ?? `local:${user.email}`,
      },
    });

    await this.gamification.onStreakUpdated(user.id, streak.streakDays);

    const tokens = await this.issueTokens(user.id, user.email);

    return {
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.displayName },
      ...tokens,
    };
  }

  async loginWithOAuth(profile: OAuthProfile) {
    const authProviderId = `${profile.provider}:${profile.providerId}`;
    let isNewUser = false;

    let user = await this.prisma.user.findUnique({
      where: { authProviderId },
    });

    if (!user) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (existingByEmail) {
        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            authProviderId,
            emailVerified: true,
            displayName: existingByEmail.displayName || profile.name,
          },
        });

        if (profile.avatarUrl) {
          await this.prisma.careerProfile.updateMany({
            where: { userId: user.id, avatarUrl: '' },
            data: { avatarUrl: profile.avatarUrl },
          });
        }
      } else {
        isNewUser = true;
        const hashedPassword = await bcrypt.hash(randomBytes(32).toString('hex'), 10);

        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            password: hashedPassword,
            displayName: profile.name,
            authProviderId,
            emailVerified: true,
            careerProfile: {
              create: {
                avatarUrl: profile.avatarUrl ?? '',
              },
            },
            subscription: {
              create: {
                plan: 'free',
                status: 'trialing',
              },
            },
            progressDashboard: { create: {} },
            careerMetrics: { create: {} },
          },
        });

        await this.notifications.create(
          user.id,
          'welcome',
          'Welcome to PathForge!',
          'Complete your profile to unlock personalized career insights.',
          user.id,
          'user',
          '/app/settings',
        );
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const streak = calculateStreak(
      user.lastLoginAt,
      user.streakDays,
      user.longestStreak,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        streakDays: streak.streakDays,
        longestStreak: streak.longestStreak,
      },
    });

    await this.gamification.onStreakUpdated(user.id, streak.streakDays);

    const tokens = await this.issueTokens(user.id, user.email);

    return {
      ...tokens,
      isNewUser,
      user: { id: user.id, email: user.email, name: user.displayName },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date() || !record.user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: record.id } });

    const tokens = await this.issueTokens(record.user.id, record.user.email);
    return {
      message: 'Token refreshed',
      user: {
        id: record.user.id,
        email: record.user.email,
        name: record.user.displayName,
      },
      ...tokens,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    });

    await this.email.sendPasswordResetEmail(user.email, token);

    return {
      message: 'If that email exists, a reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    return { message: 'Password updated successfully' };
  }

  async logout(userId: string, refreshToken?: string, allDevices = false) {
    if (allDevices) {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    } else if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken },
      });
    }
    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token: string) {
    const normalized = token.trim();
    if (!normalized) {
      throw new BadRequestException('Verification token is required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: normalized,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Invalid or expired verification token. Request a new link from Settings or use Resend email.',
      );
    }

    if (user.emailVerified) {
      return { message: 'Email is already verified', alreadyVerified: true };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.emailVerified) {
      return {
        message: 'Email is already verified',
        delivered: true,
        alreadyVerified: true,
      };
    }

    const now = new Date();
    let token = user.emailVerificationToken;
    let expires = user.emailVerificationExpires;

    if (!token || !expires || expires <= now) {
      token = randomBytes(32).toString('hex');
      expires = new Date();
      expires.setHours(expires.getHours() + 24);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: token,
          emailVerificationExpires: expires,
        },
      });
    }

    const delivery = await this.email.sendVerificationEmail(user.email, token);
    this.assertEmailDelivered(delivery, 'verification email');

    return {
      message: 'Verification email sent. Check your inbox.',
      delivered: true,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        streakDays: true,
        longestStreak: true,
        emailVerified: true,
        createdAt: true,
        careerProfile: true,
        subscription: { select: { plan: true, status: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.displayName,
      streakDays: user.streakDays,
      longestStreak: user.longestStreak,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      profile: user.careerProfile,
      plan: user.subscription?.plan ?? 'free',
    };
  }
}
