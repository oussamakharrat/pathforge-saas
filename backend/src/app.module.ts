import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GoalsModule } from './goals/goals.module';
import { LearningPlansModule } from './learning-plans/learning-plans.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { JobsModule } from './jobs/jobs.module';
import { NegotiationsModule } from './negotiations/negotiations.module';
import { ResumesModule } from './resumes/resumes.module';
import { AiCoachModule } from './ai-coach/ai-coach.module';
import { CommunityModule } from './community/community.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ReferenceModule } from './reference/reference.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PlanGuard } from './auth/guards/plan.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    AuthModule,
    UsersModule,
    GoalsModule,
    LearningPlansModule,
    PortfolioModule,
    JobsModule,
    NegotiationsModule,
    ResumesModule,
    AiCoachModule,
    CommunityModule,
    NotificationsModule,
    SubscriptionsModule,
    ReferenceModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PlanGuard,
    },
  ],
})
export class AppModule {}
