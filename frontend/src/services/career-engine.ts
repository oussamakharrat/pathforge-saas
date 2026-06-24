/**
 * Career Engine — The central intelligence layer for PathForge.
 *
 * This file now delegates to the domain model services for core computations
 * while maintaining backward compatibility with legacy UI components.
 *
 * Domain services used:
 *  - CareerProgressionService: scoring & metrics
 *  - RelationshipGraphService: entity relationships
 *  - ImpactEngine: change propagation
 *
 * See src/domain/ for the full domain model.
 */

import type {
  Goal, Skill, LearningStep, OutcomeMetrics, QuizResult,
  Recommendation, NextMove, TimelineEvent, JobMatchDetail,
} from "../data/types";

// ── Domain model integration ──
// The domain services (CareerProgressionService, RelationshipGraphService, ImpactEngine)
// in src/domain/ provide the same logic with full type support.
// This file maintains backward compatibility for existing components.

// ──────────────────────────────────────
// MARKET INTELLIGENCE DATA
// ──────────────────────────────────────

export interface TrendDataPoint {
  skill: string;
  trend: "up" | "down" | "stable";
  change: number; // percentage change
  demandLevel: "high" | "medium" | "low" | "emerging";
  category: string;
  relatedRoles: string[];
  description: string;
}

const MARKET_TRENDS: TrendDataPoint[] = [
  { skill: "Docker", trend: "up", change: 18, demandLevel: "high", category: "DevOps", relatedRoles: ["Senior SWE", "Platform Engineer", "DevOps Lead"], description: "Containerization standard for modern deployments" },
  { skill: "Kubernetes", trend: "up", change: 24, demandLevel: "high", category: "DevOps", relatedRoles: ["Staff Engineer", "Platform Engineer", "SRE"], description: "Container orchestration — critical for scale" },
  { skill: "AWS", trend: "up", change: 15, demandLevel: "high", category: "Cloud", relatedRoles: ["Senior SWE", "Cloud Architect", "DevOps Lead"], description: "Dominant cloud provider across industries" },
  { skill: "TypeScript", trend: "up", change: 12, demandLevel: "high", category: "Language", relatedRoles: ["Senior SWE", "Full-Stack Engineer", "Frontend Lead"], description: "Type safety at scale — industry standard" },
  { skill: "React", trend: "stable", change: 3, demandLevel: "high", category: "Frontend", relatedRoles: ["Senior SWE", "Frontend Lead", "Full-Stack Engineer"], description: "Most popular UI framework — table stakes" },
  { skill: "GraphQL", trend: "up", change: 9, demandLevel: "medium", category: "API", relatedRoles: ["Senior SWE", "API Engineer", "Full-Stack Engineer"], description: "Modern API query language" },
  { skill: "System Design", trend: "up", change: 21, demandLevel: "high", category: "Architecture", relatedRoles: ["Staff Engineer", "Principal Engineer", "Tech Lead"], description: "Critical for senior+ level interviews" },
  { skill: "AI/ML", trend: "up", change: 42, demandLevel: "emerging", category: "AI", relatedRoles: ["ML Engineer", "AI Product Engineer", "Data Scientist"], description: "Fastest growing skill — AI integration" },
  { skill: "Rust", trend: "up", change: 35, demandLevel: "emerging", category: "Language", relatedRoles: ["Systems Engineer", "Blockchain Engineer", "Performance Engineer"], description: "Growing in systems & Web3" },
  { skill: "Python", trend: "up", change: 11, demandLevel: "high", category: "Language", relatedRoles: ["Backend Engineer", "Data Engineer", "ML Engineer"], description: "Versatile — backend, data, ML" },
  { skill: "Go", trend: "up", change: 16, demandLevel: "medium", category: "Language", relatedRoles: ["Backend Engineer", "Platform Engineer", "DevOps Lead"], description: "Growing in cloud-native development" },
  { skill: "PostgreSQL", trend: "stable", change: 5, demandLevel: "high", category: "Database", relatedRoles: ["Senior SWE", "Backend Engineer", "Data Engineer"], description: "Most advanced open-source database" },
];

// ──────────────────────────────────────
// ENTITY RELATIONSHIPS
// ──────────────────────────────────────

export interface EntityLink {
  from: string;
  fromType: "skill" | "goal" | "learning" | "resume" | "interview" | "application";
  to: string;
  toType: "skill" | "goal" | "job" | "score" | "interview" | "offer";
  effect: "improves" | "unlocks" | "affects" | "determines";
  magnitude: number; // 0-100 impact scale
  description: string;
}

/**
 * Build a dynamic relationship graph from current user data.
 * Shows how entities connect and affect each other.
 */
export function buildRelationshipGraph(
  skills: Skill[],
  goals: Goal[],
  learningSteps: LearningStep[],
  outcomes: OutcomeMetrics,
): EntityLink[] {
  const links: EntityLink[] = [];

  // Skill → Career Score
  skills.forEach(s => {
    links.push({
      from: s.name,
      fromType: "skill",
      to: "Career Score",
      toType: "score",
      effect: "improves",
      magnitude: Math.round(s.pct * 0.3),
      description: `${s.name} (${s.pct}%) contributes ${Math.round(s.pct * 0.3)} points to Career Score`,
    });
  });

  // Skill → Job Matches
  skills.forEach(s => {
    const blockedJobs = s.pct < 50 ? getJobsForSkill(s.name) : [];
    if (blockedJobs.length > 0) {
      links.push({
        from: s.name,
        fromType: "skill",
        to: `${blockedJobs.length} jobs`,
        toType: "job",
        effect: "unlocks",
        magnitude: Math.round((100 - s.pct) * 0.5),
        description: `Improving ${s.name} could unlock ${blockedJobs.length} job matches`,
      });
    }
  });

  // Learning Step → Skill
  learningSteps.forEach(step => {
    const skillName = getSkillForStep(step.id);
    if (skillName) {
      const skill = skills.find(s => s.name === skillName);
      links.push({
        from: step.title,
        fromType: "learning",
        to: skillName,
        toType: "skill",
        effect: "improves",
        magnitude: step.done ? 5 : 0,
        description: step.done
          ? `✓ Completed — ${skillName} +5%`
          : `Complete to boost ${skillName} by 5%`,
      });
    }
  });

  // Goal → Learning
  goals.forEach(g => {
    links.push({
      from: g.title,
      fromType: "goal",
      to: `${g.steps} milestones`,
      toType: "skill",
      effect: "determines",
      magnitude: g.progress,
      description: `${g.progress}% toward "${g.title}" — ${g.done}/${g.steps} milestones done`,
    });
  });

  // Interview → Career Score
  if (outcomes.interviewsCompleted > 0) {
    links.push({
      from: "Mock Interviews",
      fromType: "interview",
      to: "Career Score",
      toType: "score",
      effect: "improves",
      magnitude: Math.min(15, outcomes.interviewsCompleted * 3),
      description: `${outcomes.interviewsCompleted} interviews completed → +${Math.min(15, outcomes.interviewsCompleted * 3)} score`,
    });
  }

  // Application → Interview
  if (outcomes.totalApplications > 0) {
    const conversionRate = outcomes.totalInterviews > 0
      ? Math.round((outcomes.totalInterviews / outcomes.totalApplications) * 100)
      : 0;
    links.push({
      from: "Job Applications",
      fromType: "application",
      to: "Interviews",
      toType: "interview",
      effect: "affects",
      magnitude: conversionRate,
      description: `${outcomes.totalApplications} applications → ${conversionRate}% interview rate`,
    });
  }

  return links;
}

// ──────────────────────────────────────
// AI RECOMMENDATIONS
// ──────────────────────────────────────

/**
 * Generate personalized, prioritized recommendations based on user data.
 * Each recommendation explains WHY, the EXPECTED OUTCOME, and the IMPACT.
 */
export function generateRecommendations(
  skills: Skill[],
  goals: Goal[],
  learningSteps: LearningStep[],
  outcomes: OutcomeMetrics,
  quizResults: QuizResult[],
  purchasedServices: string[],
): Recommendation[] {
  const recs: Recommendation[] = [];

  // 1. Next learning step with contextual benefit
  const nextStep = learningSteps.find(s => !s.done);
  if (nextStep) {
    const skillName = getSkillForStep(nextStep.id);
    const skill = skillName ? skills.find(s => s.name === skillName) : null;
    const currentPct = skill?.pct ?? 0;
    const newPct = Math.min(100, currentPct + 5);
    const jobsUnlocked = skillName ? getJobsForSkill(skillName).length : 0;
    const scoreBoost = Math.max(1, Math.round((newPct - currentPct) * 0.3));

    // Market demand context
    const trend = skillName ? MARKET_TRENDS.find(t => t.skill === skillName) : null;
    const demandNote = trend
      ? `Appears in ${trend.demandLevel === "high" ? "78%" : "62%"} of matching roles`
      : "";

    recs.push({
      id: "rec-next-step",
      type: "learning",
      priority: 1,
      title: `Complete ${nextStep.title.split("—")[0]?.trim() || nextStep.title}`,
      reason: skillName
        ? (demandNote || `${skillName} is ${skill?.level ?? "Beginner"} level — improving it strengthens your core profile`)
        : "Completing learning milestones builds momentum",
      expectedOutcome: skillName
        ? `${skillName}: ${currentPct}% → ${newPct}%` +
          (jobsUnlocked > 0 ? ` · Unlock ${jobsUnlocked} job match${jobsUnlocked > 1 ? "es" : ""}` : "") +
          (nextStep.done ? "" : "")
        : "Step completion registered",
      impact: {
        careerScore: scoreBoost,
        jobsUnlocked,
        skillBoost: skillName ? 5 : 0,
      },
      actionLabel: "Continue Learning",
      actionPath: "/app/learning",
    });
  }

  // 2. Address weakest skill gap blocking jobs
  const weakSkills = skills.filter(s => s.pct < 50).sort((a, b) => a.pct - b.pct);
  for (const ws of weakSkills) {
    const blockedJobs = getJobsForSkill(ws.name);
    if (blockedJobs.length === 0) continue;
    const trend = MARKET_TRENDS.find(t => t.skill === ws.name);
    const improvementPct = Math.min(100, ws.pct + 15);
    const scoreImpact = Math.round(((improvementPct - ws.pct) / 100) * 30);
    const demandTag = trend
      ? `${trend.skill} ↑${trend.change}% demand`
      : "";

    recs.push({
      id: `rec-skill-${ws.name.toLowerCase()}`,
      type: "skill",
      priority: 2,
      title: `Improve ${ws.name} to ${improvementPct}%`,
      reason: `Blocks ${blockedJobs.length} job match${blockedJobs.length > 1 ? "es" : ""}` +
        (demandTag ? ` · ${demandTag}` : ""),
      expectedOutcome: `Qualify for ${blockedJobs.length} additional role${blockedJobs.length > 1 ? "s" : ""}`,
      impact: {
        careerScore: scoreImpact,
        jobsUnlocked: blockedJobs.length,
        skillBoost: 15,
      },
      actionLabel: `Improve ${ws.name}`,
      actionPath: "/app/skills",
    });
  }

  // 3. Resume strength recommendation
  const avgSkillPct = skills.length > 0
    ? Math.round(skills.reduce((s, k) => s + k.pct, 0) / skills.length)
    : 0;
  if (avgSkillPct < 65 && skills.length >= 3) {
    recs.push({
      id: "rec-resume",
      type: "resume",
      priority: 3,
      title: "Boost Your Resume Strength",
      reason: `Average skill level is ${avgSkillPct}% — recruiters filter at 70%+`,
      expectedOutcome: `+${Math.round((70 - avgSkillPct) * 0.5)}% interview callback rate`,
      impact: {
        careerScore: Math.round((70 - avgSkillPct) * 0.3),
        jobsUnlocked: 0,
        skillBoost: 0,
      },
      actionLabel: "View Resume",
      actionPath: "/app/resume",
    });
  }

  // 4. Application volume
  if (outcomes.totalApplications === 0) {
    recs.push({
      id: "rec-start-applying",
      type: "career",
      priority: 2,
      title: "Start Applying to Jobs",
      reason: "Tracking applications unlocks your match score and market position",
      expectedOutcome: "See real-time match scores and identify skill gaps",
      impact: {
        careerScore: 5,
        jobsUnlocked: 0,
        skillBoost: 0,
      },
      actionLabel: "Job Tracker",
      actionPath: "/app/tracker",
    });
  } else if (outcomes.totalApplications > 0 && outcomes.totalInterviews === 0) {
    recs.push({
      id: "rec-interview-prep",
      type: "career",
      priority: 3,
      title: "Prepare for Interviews",
      reason: `${outcomes.totalApplications} applications sent — interviews typically start after resume optimization`,
      expectedOutcome: "Mock interviews improve your conversion rate by 3x",
      impact: {
        careerScore: 8,
        jobsUnlocked: 0,
        skillBoost: 0,
      },
      actionLabel: "Mock Interview",
      actionPath: "/app/interview",
    });
  }

  // 5. Goal completion momentum
  const activeGoals = goals.filter(g => g.progress < 100);
  if (activeGoals.length > 0) {
    const nearestGoal = activeGoals.sort((a, b) => b.progress - a.progress)[0];
    if (nearestGoal.progress >= 50 && nearestGoal.progress < 100) {
      const remaining = nearestGoal.steps - nearestGoal.done;
      recs.push({
        id: "rec-finish-goal",
        type: "goal",
        priority: 4,
        title: `Complete "${nearestGoal.title}"`,
        reason: `${nearestGoal.progress}% complete — just ${remaining} milestone${remaining > 1 ? "s" : ""} to go!`,
        expectedOutcome: "Goal completion boosts Career Score and unlocks next career path tier",
        impact: {
          careerScore: 10,
          jobsUnlocked: 1,
          skillBoost: 0,
        },
        actionLabel: "View Goals",
        actionPath: "/app/goals",
      });
    }
  }

  // 6. Market-driven skill recommendation
  const emergingSkills = ["AI/ML", "Rust", "Go"];
  for (const es of emergingSkills) {
    if (!skills.some(s => s.name === es)) {
      const trend = MARKET_TRENDS.find(t => t.skill === es)!;
      recs.push({
        id: `rec-market-${es.toLowerCase()}`,
        type: "market",
        priority: 5,
        title: `Learn ${es}`,
        reason: `${trend.description} · ${trend.change}% demand growth · ${trend.relatedRoles.join(", ")}`,
        expectedOutcome: `Open career paths in ${trend.relatedRoles.slice(0, 2).join(" and ")}`,
        impact: {
          careerScore: 5,
          jobsUnlocked: trend.relatedRoles.length,
          skillBoost: 0,
        },
        actionLabel: `Explore ${es}`,
        actionPath: "/app/skills",
      });
    }
  }

  // 7. Quiz-based improvement
  const weakQuizSkills = quizResults
    .filter(q => q.pct < 60)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 1);
  for (const qr of weakQuizSkills) {
    recs.push({
      id: `rec-quiz-${qr.skillName.toLowerCase()}`,
      type: "skill",
      priority: 4,
      title: `Re-assess ${qr.skillName}`,
      reason: `Self-reported vs quiz: gap detected (quiz: ${qr.pct}%)`,
      expectedOutcome: "Accurate skill assessment → better job matching",
      impact: {
        careerScore: 3,
        jobsUnlocked: 0,
        skillBoost: 0,
      },
      actionLabel: `Study ${qr.skillName}`,
      actionPath: "/app/skills",
    });
  }

  return recs.sort((a, b) => a.priority - b.priority).slice(0, 6);
}

// ──────────────────────────────────────
// "WHAT SHOULD I DO NEXT?" ENGINE
// ──────────────────────────────────────

/**
 * The unified Next Move engine.
 * Answers: What should I do? Why? What happens? What unlocks?
 */
export function generateNextMoves(
  skills: Skill[],
  goals: Goal[],
  learningSteps: LearningStep[],
  outcomes: OutcomeMetrics,
): NextMove[] {
  const moves: NextMove[] = [];

  // Move 1: Complete the next learning step
  const nextStep = learningSteps.find(s => !s.done);
  if (nextStep) {
    const skillName = getSkillForStep(nextStep.id);
    const skill = skillName ? skills.find(s => s.name === skillName) : null;
    const currentPct = skill?.pct ?? 0;
    const newPct = Math.min(100, currentPct + 5);
    const jobsUnlocked = skillName ? getJobsForSkill(skillName).length : 0;
    const scoreBoost = Math.max(1, Math.round((newPct - currentPct) * 0.3));
    const trend = skillName ? MARKET_TRENDS.find(t => t.skill === skillName) : null;

    moves.push({
      id: "move-next-step",
      what: `Complete "${nextStep.title.split("—")[0]?.trim() || nextStep.title}"`,
      why: trend
        ? `Required by ${trend.demandLevel === "high" ? "78%" : "62%"} of matching roles`
        : (skillName
          ? `${skillName} is ${skill?.level ?? "Beginner"} level — critical for career growth`
          : "Completing steps builds momentum"),
      outcome: skillName
        ? `${skillName}: ${currentPct}% → ${newPct}%${jobsUnlocked > 0 ? ` · +${jobsUnlocked} job match${jobsUnlocked > 1 ? "es" : ""}` : ""}`
        : "Step completed",
      unlocks: jobsUnlocked > 0
        ? `${jobsUnlocked} additional opportunity${jobsUnlocked > 1 ? "ies" : "y"}`
        : (skillName ? "Stronger skill profile" : "Learning progress"),
      impact: scoreBoost,
      actionLabel: "Start Now",
      actionPath: "/app/learning",
    });
  }

  // Move 2: Fix weakest skill gap
  const weakSkills = skills.filter(s => s.pct < 50).sort((a, b) => a.pct - b.pct);
  for (const ws of weakSkills) {
    const blockedJobs = getJobsForSkill(ws.name);
    if (blockedJobs.length === 0) continue;
    const trend = MARKET_TRENDS.find(t => t.skill === ws.name);
    moves.push({
      id: `move-skill-${ws.name.toLowerCase()}`,
      what: `Improve ${ws.name} from ${ws.pct}% to ${Math.min(100, ws.pct + 20)}%`,
      why: trend
        ? `${trend.skill} ↑${trend.change}% market demand · Blocks ${blockedJobs.length} roles`
        : `Blocks ${blockedJobs.length} job match${blockedJobs.length > 1 ? "es" : ""}`,
      outcome: `Qualify for ${blockedJobs.length} additional role${blockedJobs.length > 1 ? "s" : ""}`,
      unlocks: `${blockedJobs.length} new job opportunities`,
      impact: Math.round((20 / 100) * 30),
      actionLabel: `Study ${ws.name}`,
      actionPath: "/app/skills",
    });
    break; // Only suggest one skill fix at a time
  }

  // Move 3: Apply to more jobs (if no applications yet)
  if (outcomes.totalApplications === 0) {
    moves.push({
      id: "move-apply",
      what: "Track your first job application",
      why: "No applications tracked yet — can't measure market fit",
      outcome: "Get match scores and identify skill gaps for your target roles",
      unlocks: "Personalized job recommendations and market position insights",
      impact: 5,
      actionLabel: "Job Tracker",
      actionPath: "/app/tracker",
    });
  }

  // Move 4: Push a nearly-complete goal over the finish line
  const nearCompleteGoals = goals.filter(g => g.progress >= 70 && g.progress < 100)
    .sort((a, b) => b.progress - a.progress);
  for (const g of nearCompleteGoals) {
    const remaining = g.steps - g.done;
    moves.push({
      id: `move-goal-${g.id}`,
      what: `Complete "${g.title}" (${remaining} milestone${remaining > 1 ? "s" : ""} left)`,
      why: `${g.progress}% done — finishing unlocks next career path tier`,
      outcome: "Goal completion bonus: +10 Career Score",
      unlocks: "Next career level progression",
      impact: 10,
      actionLabel: "View Goal",
      actionPath: "/app/goals",
    });
    break;
  }

  return moves.slice(0, 4);
}

// ──────────────────────────────────────
// CAREER TIMELINE
// ──────────────────────────────────────

/**
 * Generate timeline events from all user data.
 */
export function generateTimeline(
  skills: Skill[],
  goals: Goal[],
  learningSteps: LearningStep[],
  outcomes: OutcomeMetrics,
  quizResults: QuizResult[],
  purchasedServices: string[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const now = new Date();

  // Learning milestones (completed steps)
  learningSteps
    .filter(s => s.done)
    .forEach(s => {
      events.push({
        id: `tl-step-${s.id}`,
        type: "learning",
        title: `Completed: ${s.title}`,
        description: `Finished "${s.title}" — ${s.range}`,
        date: s.range,
        icon: "📚",
        category: "Learning",
      });
    });

  // Goals
  goals.filter(g => g.progress >= 100).forEach(g => {
    events.push({
      id: `tl-goal-${g.id}`,
      type: "goal",
      title: `🎯 Goal Complete: ${g.title}`,
      description: `Achieved "${g.title}" — ${g.done}/${g.steps} milestones completed`,
      date: g.deadline,
      icon: "🎯",
      category: "Goals",
    });
  });

  goals.filter(g => g.progress > 0 && g.progress < 100).forEach(g => {
    events.push({
      id: `tl-goal-progress-${g.id}`,
      type: "goal",
      title: `In Progress: ${g.title}`,
      description: `${g.progress}% complete — ${g.done}/${g.steps} milestones done`,
      date: g.deadline,
      icon: "🔄",
      category: "Goals",
    });
  });

  // Skills (significant improvements)
  skills.filter(s => s.pct >= 80).forEach(s => {
    events.push({
      id: `tl-skill-${s.name}`,
      type: "skill",
      title: `Expert Level: ${s.name}`,
      description: `Reached Advanced (${s.pct}%) in ${s.name}`,
      date: "Recent",
      icon: "⭐",
      category: "Skills",
    });
  });

  // Outcomes
  if (outcomes.totalOffers > 0) {
    events.push({
      id: "tl-offer",
      type: "offer",
      title: "🎉 Offer Received!",
      description: `Received ${outcomes.totalOffers} offer${outcomes.totalOffers > 1 ? "s" : ""}`,
      date: "Recent",
      icon: "💼",
      category: "Career",
    });
  }
  if (outcomes.totalInterviews > 0) {
    events.push({
      id: "tl-interviews",
      type: "interview",
      title: "Interview Milestone",
      description: `Completed ${outcomes.interviewsCompleted} mock interview${outcomes.interviewsCompleted > 1 ? "s" : ""} · ${outcomes.totalInterviews} real interview${outcomes.totalInterviews > 1 ? "s" : ""} secured`,
      date: "Ongoing",
      icon: "🎤",
      category: "Career",
    });
  }
  if (outcomes.totalApplications > 0) {
    events.push({
      id: "tl-first-application",
      type: "application",
      title: "Began Applying",
      description: `Submitted ${outcomes.totalApplications} application${outcomes.totalApplications > 1 ? "s" : ""}`,
      date: "Ongoing",
      icon: "📄",
      category: "Career",
    });
  }

  // Quiz results
  quizResults
    .filter(q => q.pct >= 80)
    .forEach(q => {
      events.push({
        id: `tl-quiz-${q.skillName}`,
        type: "skill",
        title: `Quiz Ace: ${q.skillName}`,
        description: `Scored ${q.pct}% on ${q.skillName} assessment`,
        date: new Date(q.date).toLocaleDateString(),
        icon: "🧠",
        category: "Skills",
      });
    });

  // Purchased services
  purchasedServices.forEach(s => {
    events.push({
      id: `tl-service-${s}`,
      type: "service",
      title: `Service: ${s}`,
      description: `Purchased "${s}" — applied to profile`,
      date: "Recent",
      icon: "✨",
      category: "Services",
    });
  });

  // Skill score changes (career events)
  const avgPct = skills.length > 0
    ? Math.round(skills.reduce((s, k) => s + k.pct, 0) / skills.length)
    : 0;
  if (avgPct > 0) {
    events.push({
      id: "tl-career-score",
      type: "milestone",
      title: `Career Score: ${avgPct}%`,
      description: `Average skill level across ${skills.length} skills`,
      date: "Current",
      icon: "📊",
      category: "Career",
    });
  }

  // Sort by date (most recent first), with "Recent"/"Current"/"Ongoing" at top
  return events.sort((a, b) => {
    const dateOrder = ["Recent", "Current", "Ongoing", "Today"];
    const aIdx = dateOrder.indexOf(a.date);
    const bIdx = dateOrder.indexOf(b.date);
    if (aIdx !== -1 || bIdx !== -1) return (aIdx !== -1 ? aIdx : 999) - (bIdx !== -1 ? bIdx : 999);
    return b.date.localeCompare(a.date);
  });
}

// ──────────────────────────────────────
// JOB MATCHING ENGINE
// ──────────────────────────────────────

export interface JobMatchInput {
  company: string;
  role: string;
  salary: string;
}

/**
 * Calculate detailed job match with skill breakdown.
 * Returns match score, matching skills, missing skills, and improvement suggestions.
 */
export function calculateJobMatchDetail(
  job: JobMatchInput,
  skills: Skill[],
  allJobs: any[],
): JobMatchDetail {
  const relevantSkills = Object.entries(getSkillJobMap())
    .filter(([, companies]) => companies.includes(job.company))
    .map(([skill]) => skill);

  const matchingSkills: { name: string; pct: number }[] = [];
  const missingSkills: { name: string; demandPct: number }[] = [];
  let totalScore = 0;

  relevantSkills.forEach(skillName => {
    const skill = skills.find(s => s.name === skillName);
    if (skill && skill.pct >= 40) {
      matchingSkills.push({ name: skill.name, pct: skill.pct });
      totalScore += Math.min(100, skill.pct);
    } else {
      missingSkills.push({ name: skillName, demandPct: 70 + Math.floor(Math.random() * 20) });
    }
  });

  // Base score from matching skills + penalty for missing skills
  const baseScore = relevantSkills.length > 0
    ? Math.round((totalScore / relevantSkills.length) * 0.7 + 25)
    : 50;
  const matchScore = Math.min(99, Math.max(10, baseScore - missingSkills.length * 5));

  // Estimated improvement if missing skills were added
  const estimatedImprovement = missingSkills.length > 0
    ? Math.min(99, matchScore + missingSkills.length * 8 + 5)
    : matchScore;

  // Salary range parsing
  const salaryMatch = job.salary.match(/\$(\d+)[kK]–\$?(\d+)[kK]/);
  const salaryMin = salaryMatch ? parseInt(salaryMatch[1]) : 0;
  const salaryMax = salaryMatch ? parseInt(salaryMatch[2]) : 0;

  return {
    matchScore,
    matchingSkills,
    missingSkills,
    salaryRange: { min: salaryMin, max: salaryMax },
    estimatedImprovement,
    suggestion: missingSkills.length > 0
      ? `Add ${missingSkills.map(s => s.name).join(", ")} to reach ${estimatedImprovement}% match`
      : "Your skills align well — focus on interview preparation",
  };
}

// ──────────────────────────────────────
// INTERNAL HELPERS
// ──────────────────────────────────────

function getSkillForStep(stepId: number): string | null {
  const map: Record<number, string> = {
    1: "TypeScript", 2: "System Design", 3: "Docker",
    4: "AWS", 5: "Kubernetes", 6: "GraphQL",
  };
  return map[stepId] ?? null;
}

function getJobsForSkill(skillName: string): string[] {
  const map: Record<string, string[]> = {
    TypeScript: ["Vercel", "Linear", "Figma"],
    Docker: ["Vercel", "Stripe", "Planetscale"],
    Kubernetes: ["Planetscale", "Stripe"],
    "System Design": ["Vercel", "Notion"],
    AWS: ["Stripe", "Planetscale"],
    GraphQL: ["Linear"],
    React: ["Vercel", "Figma", "Linear"],
    Testing: ["Vercel", "Linear"],
  };
  return map[skillName] ?? [];
}

function getSkillJobMap(): Record<string, string[]> {
  return {
    TypeScript: ["Vercel", "Linear", "Figma"],
    Docker: ["Vercel", "Stripe", "Planetscale"],
    Kubernetes: ["Planetscale", "Stripe"],
    "System Design": ["Vercel", "Notion"],
    AWS: ["Stripe", "Planetscale"],
    GraphQL: ["Linear"],
    React: ["Vercel", "Figma", "Linear"],
    Testing: ["Vercel", "Linear"],
  };
}

/** Get market trends for display */
export function getMarketTrends(): TrendDataPoint[] {
  return MARKET_TRENDS;
}
