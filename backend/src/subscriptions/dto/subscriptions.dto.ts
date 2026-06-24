import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Plan, BillingCycle } from '@prisma/client';

export class UpdateSubscriptionDto {
  @IsOptional() @IsEnum(Plan) plan?: Plan;
  @IsOptional() @IsEnum(BillingCycle) billingCycle?: BillingCycle;
  @IsOptional() @IsString() stripeCustomerId?: string;
}
