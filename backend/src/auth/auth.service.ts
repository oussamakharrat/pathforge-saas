import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';
import { NotificationsHelper } from '../common/notifications.helper';
import { GamificationUnlockService } from '../common/gamification-unlock.service';
import { calculateStreak } from '../domain/user.logic';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly dashboard: DashboardProjector,
    private readonly notifications: NotificationsHelper,
    private readonly gamification: GamificationUnlockService,
  ) {}

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

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      message: 'Registration successful',
      user: { id: user.id, email: user.email, name: user.displayName },
      token,
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

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.displayName },
      token,
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
