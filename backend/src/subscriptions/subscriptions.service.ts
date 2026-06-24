import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { assertFound } from '../common/assertions';
import { UpdateSubscriptionDto } from './dto/subscriptions.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  async update(userId: string, dto: UpdateSubscriptionDto) {
    const existing = assertFound(
      await this.prisma.subscription.findUnique({ where: { userId } }),
      'Subscription',
    );

    const nextPlan = dto.plan ?? existing.plan;

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: nextPlan,
        billingCycle: dto.billingCycle ?? existing.billingCycle,
        stripeCustomerId: dto.stripeCustomerId ?? existing.stripeCustomerId,
        status: 'active',
        ...(nextPlan === 'free' ? { currentPeriodEnd: null } : {}),
      },
    });
  }

  async cancel(userId: string) {
    assertFound(
      await this.prisma.subscription.findUnique({ where: { userId } }),
      'Subscription',
    );

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: 'free',
        status: 'active',
        currentPeriodEnd: null,
      },
    });
  }
}
