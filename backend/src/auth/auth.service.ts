import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';
import { NotificationsHelper } from '../common/notifications.helper';
import { GamificationUnlockService } from '../common/gamification-unlock.service';
import { calculateStreak } from '../domain/user.logic';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

const REFRESH_TOKEN_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly dashboard: DashboardProjector,
    private readonly notifications: NotificationsHelper,
    private readonly gamification: GamificationUnlockService,
  ) {}

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

    const tokens = await this.issueTokens(user.id, user.email);

    return {
      message: 'Registration successful',
      user: { id: user.id, email: user.email, name: user.displayName },
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

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      message: 'If that email exists, a reset link has been sent.',
      ...(isDev ? { resetToken: token } : {}),
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

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        streakDays: true,
        longestStreak: true,
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
      createdAt: user.createdAt,
      profile: user.careerProfile,
      plan: user.subscription?.plan ?? 'free',
    };
  }
}
