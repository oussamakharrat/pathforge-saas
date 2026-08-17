import { SetMetadata } from '@nestjs/common';
import { PlanTier } from '../../common/plan.constants';

export const REQUIRE_PLAN_KEY = 'requirePlan';

export const RequirePlan = (plan: PlanTier) =>
  SetMetadata(REQUIRE_PLAN_KEY, plan);
