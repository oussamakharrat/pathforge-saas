/**
 * Relationship Graph Service
 *
 * Builds a dynamic graph of how entities connect and affect each other.
 * This is the "cause & effect" visualization layer.
 *
 * Every link in the graph answers:
 *  - What entity connects to what?
 *  - What is the effect?
 *  - How strong is the connection?
 *  - What is the human-readable description?
 */

import type { Skill } from "../entities/skill";
import type { Goal } from "../entities/goal";
import type { LearningPlan } from "../entities/learning-plan";
import type { JobApplication } from "../entities/job-application";
import type { Interview } from "../entities/interview";
import type { Portfolio } from "../entities/portfolio";
import type { ServicePurchase } from "../entities/service-purchase";
import { SKILL_JOB_MAP, SKILL_GOAL_MAP } from "../entities/skill";
import type { RelationshipEffect } from "../value-objects";

// ── Relationship Link ──

export interface RelationshipLink {
  id: string;
  fromType: "skill" | "goal" | "learning" | "resume" | "interview" | "application" | "portfolio" | "service" | "achievement";
  fromLabel: string;
  fromId: string;
  toType: "skill" | "goal" | "job" | "score" | "interview" | "offer" | "resume" | "portfolio" | "achievement" | "badge";
  toLabel: string;
  toId: string;
  effect: RelationshipEffect;
  magnitude: number; // 0–100
  description: string;
}

// ── Standard Chains ──

export interface ImpactChain {
  title: string;
  links: RelationshipLink[];
  totalImpact: number;
}

// ── Build Full Graph ──

export function buildRelationshipGraph(input: {
  skills: Skill[];
  goals: Goal[];
  learningPlans: LearningPlan[];
  applications: JobApplication[];
  interviews: Interview[];
  portfolio: Portfolio[];
  services: ServicePurchase[];
}): RelationshipLink[] {
  const links: RelationshipLink[] = [];
  let idCounter = 0;

  const link = (l: Omit<RelationshipLink, "id">) => {
    links.push({ ...l, id: `rel-${idCounter++}` });
  };

  // ── Skill → Career Score ──
  input.skills.forEach((s) => {
    link({
      fromType: "skill",
      fromLabel: s.name,
      fromId: s.id,
      toType: "score",
      toLabel: "Career Score",
      toId: "career-score",
      effect: "improves",
      magnitude: Math.round(s.currentLevel * 0.3),
      description: `${s.name} (${s.currentLevel}%) contributes ${Math.round(s.currentLevel * 0.3)} points to Career Score`,
    });
  });

  // ── Skill → Jobs ──
  input.skills.forEach((s) => {
    const roles = SKILL_JOB_MAP[s.name];
    if (roles && s.currentLevel < 50) {
      link({
        fromType: "skill",
        fromLabel: s.name,
        fromId: s.id,
        toType: "job",
        toLabel: `${roles.length} roles`,
        toId: "jobs",
        effect: "unlocks",
        magnitude: Math.round((100 - s.currentLevel) * 0.5),
        description: `Improving ${s.name} could unlock ${roles.length} additional roles`,
      });
    }
  });

  // ── Skill → Goals ──
  input.skills.forEach((s) => {
    const goalTitles = SKILL_GOAL_MAP[s.name];
    if (goalTitles) {
      const matchedGoals = input.goals.filter((g) => goalTitles.includes(g.title));
      matchedGoals.forEach((g) => {
        link({
          fromType: "skill",
          fromLabel: s.name,
          fromId: s.id,
          toType: "goal",
          toLabel: g.title,
          toId: g.id,
          effect: "improves",
          magnitude: Math.round(s.currentLevel * 0.4),
          description: `${s.name} (${s.currentLevel}%) drives "${g.title}" progress`,
        });
      });
    }
  });

  // ── Learning Plan → Skill ──
  input.learningPlans.forEach((lp) => {
    lp.items.forEach((item) => {
      item.improvedSkillIds.forEach((skillId) => {
        const skill = input.skills.find((s) => s.id === skillId);
        if (skill) {
          link({
            fromType: "learning",
            fromLabel: item.title,
            fromId: item.id,
            toType: "skill",
            toLabel: skill.name,
            toId: skill.id,
            effect: "improves",
            magnitude: item.completed ? 5 : 0,
            description: item.completed
              ? `✓ "${item.title}" completed → ${skill.name} +${item.skillBoostAmount}%`
              : `Complete "${item.title}" to boost ${skill.name} by ${item.skillBoostAmount}%`,
          });
        }
      });
    });
  });

  // ── Goal → Learning Plans ──
  input.goals.forEach((g) => {
    const plans = input.learningPlans.filter((lp) => lp.goalId === g.id);
    if (plans.length > 0) {
      plans.forEach((lp) => {
        link({
          fromType: "goal",
          fromLabel: g.title,
          fromId: g.id,
          toType: "skill",
          toLabel: lp.title,
          toId: lp.id,
          effect: "generates",
          magnitude: g.progress,
          description: `Goal "${g.title}" (${g.progress}%) generates learning plan: ${lp.title}`,
        });
      });
    }
  });

  // ── Application → Interview ──
  input.applications.forEach((app) => {
    if (app.interviewIds.length > 0) {
      const interviews = input.interviews.filter((i) => app.interviewIds.includes(i.id));
      interviews.forEach((iv) => {
        link({
          fromType: "application",
          fromLabel: `${app.company} — ${app.role}`,
          fromId: app.id,
          toType: "interview",
          toLabel: `Interview at ${app.company}`,
          toId: iv.id,
          effect: "generates",
          magnitude: iv.score || 50,
          description: `Application at ${app.company} (${app.status}) → ${iv.type} interview`,
        });
      });
    }
  });

  // ── Interview → Career Score ──
  const completedInterviews = input.interviews.filter((i) => i.status === "completed");
  if (completedInterviews.length > 0) {
    const avgScore = completedInterviews.reduce((s, i) => s + i.score, 0) / completedInterviews.length;
    link({
      fromType: "interview",
      fromLabel: `${completedInterviews.length} completed interview(s)`,
      fromId: "interviews-total",
      toType: "score",
      toLabel: "Career Score",
      toId: "career-score",
      effect: "improves",
      magnitude: Math.min(15, completedInterviews.length * 3),
      description: `${completedInterviews.length} interview(s) completed → Interview Readiness +${Math.round(avgScore)}%`,
    });
  }

  // ── Portfolio → Skill ──
  input.portfolio.forEach((p) => {
    p.validatedSkillIds.forEach((skillId) => {
      const skill = input.skills.find((s) => s.id === skillId);
      if (skill) {
        link({
          fromType: "portfolio",
          fromLabel: p.title,
          fromId: p.id,
          toType: "skill",
          toLabel: skill.name,
          toId: skill.id,
          effect: "validates",
          magnitude: 15,
          description: `Portfolio project "${p.title}" validates ${skill.name}`,
        });
      }
    });
  });

  // ── Service → Resume Score ──
  input.services.forEach((svc) => {
    if (svc.impact.resumeScoreBoost > 0) {
      link({
        fromType: "service",
        fromLabel: svc.displayName,
        fromId: svc.id,
        toType: "resume",
        toLabel: "Resume Score",
        toId: "resume-score",
        effect: "improves",
        magnitude: svc.impact.resumeScoreBoost,
        description: `${svc.displayName} → Resume Score +${svc.impact.resumeScoreBoost}`,
      });
    }
  });

  // ── Application → Offer ──
  input.applications.forEach((app) => {
    if (app.status === "offer" || app.status === "accepted") {
      link({
        fromType: "application",
        fromLabel: `${app.company} — ${app.role}`,
        fromId: app.id,
        toType: "offer",
        toLabel: "Offer Received",
        toId: `offer-${app.id}`,
        effect: "determines",
        magnitude: 90,
        description: `Application at ${app.company} resulted in an offer!`,
      });
    }
  });

  return links;
}

// ── Build Impact Chain ──

export function buildImpactChains(links: RelationshipLink[]): ImpactChain[] {
  // Group related links into meaningful chains
  const chains: ImpactChain[] = [];

  // Chain 1: Learning → Skill → Score → Jobs
  const learningLinks = links.filter((l) => l.fromType === "learning" && l.effect === "improves" && l.magnitude > 0);
  if (learningLinks.length > 0) {
    const chain: RelationshipLink[] = [];

    // Take the first incomplete learning link
    const primary = learningLinks[0];
    chain.push(primary);

    // Find the skill → score link
    const scoreLink = links.find((l) => l.fromLabel === primary.toLabel && l.toType === "score");
    if (scoreLink) chain.push(scoreLink);

    // Find the skill → jobs link
    const jobsLink = links.find((l) => l.fromLabel === primary.toLabel && l.toType === "job");
    if (jobsLink) chain.push(jobsLink);

    const totalImpact = chain.reduce((sum, l) => sum + l.magnitude, 0);
    chains.push({ title: "Learning → Career Impact", links: chain, totalImpact });
  }

  // Chain 2: Skill → Goal → Career Score
  const skillGoalLinks = links.filter((l) => l.fromType === "skill" && l.toType === "goal");
  if (skillGoalLinks.length > 0) {
    const chain = [skillGoalLinks[0]];
    const scoreLink = links.find(
      (l) => l.fromLabel === skillGoalLinks[0].toLabel && l.toType === "score",
    );
    if (scoreLink) chain.push(scoreLink);
    chains.push({
      title: "Skills → Goal Progress",
      links: chain,
      totalImpact: chain.reduce((s, l) => s + l.magnitude, 0),
    });
  }

  // Chain 3: Application → Interview → Offer
  const appInterviewLinks = links.filter((l) => l.fromType === "application" && l.toType === "interview");
  if (appInterviewLinks.length > 0) {
    const chain = [...appInterviewLinks];
    const offerLink = links.find(
      (l) => l.fromLabel === appInterviewLinks[0].fromLabel && l.toType === "offer",
    );
    if (offerLink) chain.push(offerLink);
    chains.push({
      title: "Application Pipeline",
      links: chain,
      totalImpact: chain.reduce((s, l) => s + l.magnitude, 0),
    });
  }

  return chains;
}
