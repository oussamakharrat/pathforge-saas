import 'dotenv/config';
import { createPrismaClient } from './create-client';

const prisma = createPrismaClient();

const SKILLS = [
  { name: 'JavaScript', category: 'Language', marketDemand: 'high' as const },
  { name: 'TypeScript', category: 'Language', marketDemand: 'high' as const },
  { name: 'Python', category: 'Language', marketDemand: 'high' as const },
  { name: 'Java', category: 'Language', marketDemand: 'high' as const },
  { name: 'Go', category: 'Language', marketDemand: 'medium' as const },
  { name: 'Rust', category: 'Language', marketDemand: 'emerging' as const },
  { name: 'React', category: 'Frontend', marketDemand: 'high' as const },
  { name: 'Next.js', category: 'Frontend', marketDemand: 'high' as const },
  { name: 'Vue.js', category: 'Frontend', marketDemand: 'medium' as const },
  { name: 'Node.js', category: 'Backend', marketDemand: 'high' as const },
  { name: 'NestJS', category: 'Backend', marketDemand: 'medium' as const },
  { name: 'PostgreSQL', category: 'Database', marketDemand: 'high' as const },
  { name: 'MongoDB', category: 'Database', marketDemand: 'medium' as const },
  { name: 'Redis', category: 'Database', marketDemand: 'medium' as const },
  { name: 'Docker', category: 'DevOps', marketDemand: 'high' as const },
  { name: 'Kubernetes', category: 'DevOps', marketDemand: 'high' as const },
  { name: 'AWS', category: 'Cloud', marketDemand: 'high' as const },
  {
    name: 'System Design',
    category: 'Architecture',
    marketDemand: 'high' as const,
  },
  { name: 'CI/CD', category: 'DevOps', marketDemand: 'medium' as const },
  { name: 'GraphQL', category: 'API', marketDemand: 'medium' as const },
  {
    name: 'Communication',
    category: 'Soft Skill',
    marketDemand: 'high' as const,
  },
  { name: 'Leadership', category: 'Soft Skill', marketDemand: 'high' as const },
];

const ACHIEVEMENTS = [
  {
    name: 'First Goal',
    icon: '🎯',
    description: 'Create your first career goal',
    category: 'growth',
    criteria: 'Create 1 goal',
  },
  {
    name: 'Goal Crusher',
    icon: '🏆',
    description: 'Complete your first goal',
    category: 'growth',
    criteria: 'Complete 1 goal',
  },
  {
    name: 'Skill Builder',
    icon: '📈',
    description: 'Add 5 skills to your profile',
    category: 'skills',
    criteria: 'Track 5 skills',
  },
  {
    name: 'Interview Ready',
    icon: '🎤',
    description: 'Complete a mock interview',
    category: 'jobs',
    criteria: 'Complete 1 mock interview',
  },
  {
    name: 'Offer Received',
    icon: '💼',
    description: 'Track your first job offer',
    category: 'jobs',
    criteria: 'Receive 1 offer',
  },
  {
    name: 'Week Streak',
    icon: '🔥',
    description: 'Maintain a 7-day login streak',
    category: 'streak',
    criteria: '7-day streak',
  },
];

const BADGES = [
  {
    name: 'Starter',
    icon: '🌱',
    description: 'Complete onboarding',
    rarity: 'bronze' as const,
    category: 'growth',
    requirements: 'Complete profile onboarding',
  },
  {
    name: 'Learner',
    icon: '📚',
    description: 'Complete a learning plan',
    rarity: 'silver' as const,
    category: 'learning',
    requirements: 'Complete 1 learning plan',
  },
  {
    name: 'Networker',
    icon: '🤝',
    description: 'Engage with the community',
    rarity: 'bronze' as const,
    category: 'social',
    requirements: 'Post or comment in community',
  },
  {
    name: 'Negotiator',
    icon: '💰',
    description: 'Complete a salary negotiation',
    rarity: 'gold' as const,
    category: 'jobs',
    requirements: 'Accept a negotiation',
  },
  {
    name: 'Portfolio Pro',
    icon: '🚀',
    description: 'Publish 3 portfolio projects',
    rarity: 'platinum' as const,
    category: 'growth',
    requirements: '3 completed projects',
  },
];

async function main() {
  console.log('Seeding reference data...');

  for (const skill of SKILLS) {
    await prisma.skillCatalog.upsert({
      where: { name: skill.name },
      create: skill,
      update: { category: skill.category, marketDemand: skill.marketDemand },
    });
  }

  for (const ach of ACHIEVEMENTS) {
    await prisma.achievementDefinition.upsert({
      where: { name: ach.name },
      create: ach,
      update: ach,
    });
  }

  for (const badge of BADGES) {
    await prisma.badgeDefinition.upsert({
      where: { name: badge.name },
      create: badge,
      update: badge,
    });
  }

  console.log(
    `Seeded ${SKILLS.length} skills, ${ACHIEVEMENTS.length} achievements, ${BADGES.length} badges`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
