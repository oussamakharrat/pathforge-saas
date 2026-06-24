export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface SalaryRange {
  min: Money;
  max: Money;
}

export interface InterviewAnswer {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  order: number;
}

export const APPLICATION_PIPELINE: string[] = [
  'wishlist',
  'planned',
  'applied',
  'screening',
  'interview',
  'offer',
  'accepted',
  'rejected',
];

export const MAX_FEATURED_PROJECTS = 3;
