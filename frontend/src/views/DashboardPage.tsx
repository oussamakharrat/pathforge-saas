'use client';

import { useMemo } from "react";
import { useNavigate } from "@/lib/router";
import {
  Flame, Briefcase, Zap, BookOpen, Sparkles, TrendingUp,
  Send, ArrowRight, Award,
} from "lucide-react";
import { FLAME, CARBON } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { useCareerData } from "../contexts/CareerDataContext";
import { useJobs } from "../contexts/JobsContext";
import { useAuth } from "../contexts/AuthContext";
import { useUpgrade } from "../contexts/UpgradeContext";
import AIRecommendation from "../components/AIRecommendation";
import NextMoveEngine from "../components/NextMoveEngine";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { canAccess, user, profile } = useAuth();
  const { requestUpgrade } = useUpgrade();
  const { skills, goals, learningSteps, careerScore, outcomes, recalculateJobMatch, avgGoalProgress, avgSkillPct } = useCareerData();
  const { kanban } = useJobs();

  const displayName = useMemo(() => {
    const name = user?.name || profile?.name;
    if (name?.trim()) return name.trim().split(/\s+/)[0];
    if (user?.email) return user.email.split('@')[0];
    return 'there';
  }, [user, profile]);

  const streakDays = user?.streakDays ?? 0;

  const safeNavigate = (path: string, pageId: string, label: string) => {
    if (!canAccess(pageId)) {
      requestUpgrade(pageId, label);
    } else {
      navigate(path);
    }
  };

  const avgSkill = skills.length > 0
    ? Math.round(skills.reduce((s, k) => s + k.pct, 0) / skills.length)
    : 0;
  const learningDone = learningSteps.filter(s => s.done).length;
  const learningTotal = learningSteps.length;
  const nextStep = learningSteps.find(s => !s.done);
  const weakSkills = skills.filter(s => s.pct < 50).sort((a, b) => a.pct - b.pct);

  // ── Insight 1: Best job match ──
  const bestMatch = useMemo(() => {
    const allJobs = Object.values(kanban).flat();
    if (!allJobs.length) return null;
    const scored = allJobs.map(j => ({
      ...j,
      computedMatch: j.match || recalculateJobMatch(j.company, skills.map(s => ({ name: s.name, pct: s.pct }))),
    }));
    scored.sort((a, b) => b.computedMatch - a.computedMatch);
    return scored[0] || null;
  }, [kanban, skills, recalculateJobMatch]);

  // ── Insight 2: Skills blocking jobs ──
  const skillJobInsight = useMemo(() => {
    const bestSkill = weakSkills[0]?.name ?? null;
    const trackedCompanies = new Set(Object.values(kanban).flat().map((j) => j.company));
    return {
      skillToFix: bestSkill,
      blockedCount: trackedCompanies.size,
      jobsFromBestSkill: trackedCompanies.size,
    };
  }, [weakSkills, kanban]);

  const nextStepImpact = useMemo(() => {
    if (!nextStep) return null;
    const skill = skills.find((s) => nextStep.tag && s.name.toLowerCase().includes(nextStep.tag.toLowerCase()))
      ?? skills[0];
    if (!skill) return null;
    const currentPct = skill.pct;
    const newPct = Math.min(100, currentPct + 5);
    const levelUp = newPct >= 80 && skill.level !== "Advanced";
    return {
      stepTitle: nextStep.title,
      skillName: skill.name,
      currentPct,
      newPct,
      jobsUnlocked: Object.values(kanban).flat().length,
      levelUp,
      scoreBoost: Math.max(1, Math.round((newPct - currentPct) * 0.3)),
    };
  }, [nextStep, skills, kanban]);

  // ── Insight 4: Career progression path from goals ──
  const careerPath = useMemo(() => {
    return goals.slice(0, 3).map(g => ({
      title: g.title,
      progress: g.progress,
      steps: g.steps,
      done: g.done,
    }));
  }, [goals]);

  // ── Insight 5: Score components ──
  const scoreComponents = useMemo(() => {
    const goalComponent = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
    const skillComponent = avgSkill;
    const appScore = Math.min(100, outcomes.totalApplications * 8);
    const intScore = Math.min(100, outcomes.totalInterviews * 12);
    const offerScore = Math.min(100, outcomes.totalOffers * 20);
    return [
      { label: "Skills", value: skillComponent, max: 100, color: "#8B5CF6" },
      { label: "Goals", value: goalComponent, max: 100, color: FLAME },
      { label: "Applications", value: appScore, max: 100, color: "#3B82F6" },
      { label: "Interviews", value: intScore + offerScore, max: 100, color: "#10B981" },
    ];
  }, [avgSkill, goals, outcomes]);

  // ── Insight 6: Resume score (derived from skills) ──

  // ── Personalized insight sentence ──
  const personalizedInsight = useMemo(() => {
    if (nextStepImpact) {
      const jobsText = nextStepImpact.jobsUnlocked > 0
        ? ` unlock ${nextStepImpact.jobsUnlocked} new positions.`
        : ` boost your ${nextStepImpact.skillName} skill.`;
      return `Completing "${nextStepImpact.stepTitle}" will${jobsText}`;
    }
    if (weakSkills.length > 0 && skillJobInsight.skillToFix) {
      return `Improving ${skillJobInsight.skillToFix} could qualify you for ${skillJobInsight.jobsFromBestSkill} more roles.`;
    }
    if (careerPath.length > 0) {
      return `You're ${careerPath[0].progress}% toward "${careerPath[0].title}". Keep going!`;
    }
    if (profile?.targetRole) {
      const progress = goals.length > 0 ? avgGoalProgress : avgSkillPct;
      return `You're ${progress}% toward "${profile.targetRole}". Keep going!`;
    }
    return "Set your first goal to get personalized insights.";
  }, [nextStepImpact, weakSkills, skillJobInsight, careerPath, profile?.targetRole, goals.length, avgGoalProgress, avgSkillPct]);

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════
          SNAPSHOT STATS — Key metrics at a glance
          ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Avg Skill", value: `${avgSkill}%`, sub: `${weakSkills.length} gap${weakSkills.length !== 1 ? "s" : ""}`, icon: Zap, accent: "#8B5CF6", page: "/app/skills", id: "skills" },
          { label: "Learning", value: `${learningDone}/${learningTotal}`, sub: `${learningTotal - learningDone} remaining`, icon: BookOpen, accent: "#3B82F6", page: "/app/learning", id: "learning" },
          { label: "Applications", value: `${outcomes.totalApplications}`, sub: `${outcomes.totalInterviews} interviews`, icon: Send, accent: "#10B981", page: "/app/tracker", id: "tracker" },
          { label: "Offers", value: `${outcomes.totalOffers}`, sub: `${outcomes.negotiationsCompleted} negotiated`, icon: Award, accent: "#F59E0B", page: "/app/negotiate", id: "negotiate" },
        ].map(m => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="p-4 relative overflow-hidden text-center sm:text-left" onClick={() => safeNavigate(m.page, m.id, m.label)}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-[0.07] pointer-events-none" style={{ backgroundColor: m.accent }} />
              <div className="flex items-center gap-2 sm:gap-1.5 mb-1.5 justify-center sm:justify-start">
                <Icon className="w-4 h-4" style={{ color: m.accent }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</span>
              </div>
              <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                <span className="text-2xl font-black" style={{ color: CARBON }}>{m.value}</span>
                <span className="text-[11px] text-muted-foreground">{m.sub}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          WELCOME + PRIMARY INSIGHT
          A warm, spacious greeting with your key
          summary metric and a guided call to action.
          ══════════════════════════════════════════ */}
      <section className="rounded-xl border border-border p-6 bg-gradient-to-br from-[#FFF7F1] via-white to-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-[0.05] pointer-events-none" style={{ backgroundColor: FLAME }} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: CARBON }}>
              Good to see you, {displayName} ✦
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              {personalizedInsight}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {streakDays > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-white/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
                <Flame className="w-4 h-4" style={{ color: FLAME }} />
                <span className="text-xs font-semibold" style={{ color: CARBON }}>
                  {streakDays}-day streak
                </span>
              </div>
            )}
            <Btn size="sm" onClick={() => safeNavigate("/app/coach", "coach", "AI Coach")}>
              <Sparkles className="w-3.5 h-3.5" /> Ask AI
            </Btn>
          </div>
        </div>

        {/* Contextual chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {nextStep && (
            <button onClick={() => safeNavigate("/app/learning", "learning", "Learning")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-border text-xs font-semibold hover:border-orange-200 hover:bg-orange-50/50 transition-all shadow-sm">
              <BookOpen className="w-3.5 h-3.5" style={{ color: FLAME }} />
              Continue: {nextStep.title.split("—")[0]?.trim() || nextStep.title}
            </button>
          )}
          {skillJobInsight.skillToFix && (
            <button onClick={() => safeNavigate("/app/skills", "skills", "Skills")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-border text-xs font-semibold hover:border-purple-200 hover:bg-purple-50/50 transition-all shadow-sm">
              <Zap className="w-3.5 h-3.5" style={{ color: "#8B5CF6" }} />
              Improve {skillJobInsight.skillToFix}
            </button>
          )}
          {bestMatch ? (
            <button onClick={() => safeNavigate("/app/tracker", "tracker", "Jobs")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-border text-xs font-semibold hover:border-emerald-200 hover:bg-emerald-50/50 transition-all shadow-sm">
              <Briefcase className="w-3.5 h-3.5" style={{ color: "#10B981" }} />
              Best match: {bestMatch.role}
            </button>
          ) : profile?.targetRole ? (
            <button onClick={() => safeNavigate("/app/goals", "goals", "Goals")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-border text-xs font-semibold hover:border-emerald-200 hover:bg-emerald-50/50 transition-all shadow-sm">
              <Briefcase className="w-3.5 h-3.5" style={{ color: "#10B981" }} />
              Target role: {profile.targetRole}
            </button>
          ) : null}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CAREER SCORE — Your North Star Metric
          A single, bold, focused metric card.
          ══════════════════════════════════════════ */}
      <Card className="p-6 relative overflow-hidden" hover={false}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-[0.06] pointer-events-none" style={{ backgroundColor: FLAME }} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: FLAME }}>
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold" style={{ color: CARBON }}>Career Score</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black tracking-tight" style={{ color: CARBON }}>{careerScore}</span>
              <span className="text-base text-muted-foreground font-medium">/100</span>
              {nextStepImpact && (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" /> +{nextStepImpact.scoreBoost} pending
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {scoreComponents.map(c => (
              <div key={c.label} className="text-center">
                <div className="text-lg font-black" style={{ color: c.color }}>{c.value}%</div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight callout */}
        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: "rgba(241,80,37,0.04)", border: "1px solid rgba(241,80,37,0.1)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: FLAME }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: CARBON }}>AI Assessment</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {weakSkills.length > 0 ? (
                <>You&apos;re <strong className="text-foreground">{weakSkills.length} skill{weakSkills.length > 1 ? "s" : ""}</strong> away from qualifying for <strong className="text-foreground">{skillJobInsight.blockedCount}+ additional jobs</strong>. Focus on <button onClick={() => safeNavigate("/app/skills", "skills", "Skills")} className="font-bold underline decoration-dotted underline-offset-2 hover:no-underline" style={{ color: FLAME }}>{weakSkills[0].name}</button> to unlock the most opportunities.</>
              ) : (
                <>Your skills are competitive. Start applying to see how you match against real roles.</>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════
          TODAY'S AI RECOMMENDATION
          The single best thing you can do right now.
          ══════════════════════════════════════════ */}
      <AIRecommendation />

      {/* ══════════════════════════════════════════
          YOUR NEXT MOVES
          Prioritized actions to keep you moving
          toward your career goals.
          ══════════════════════════════════════════ */}
      <NextMoveEngine />

      {/* ══════════════════════════════════════════
          UPGRADE BANNER (compact)
          Only shows on free plan — subtle CTA.
          ══════════════════════════════════════════ */}
      <Card className="p-4 relative overflow-hidden" hover={false} style={{ borderColor: "rgba(241,80,37,0.15)", background: "linear-gradient(135deg, rgba(241,80,37,0.03) 0%, white 100%)" }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: FLAME }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: CARBON }}>Unlock Premium Features</p>
              <p className="text-xs text-muted-foreground">Mock interviews, salary negotiation, and AI coaching — all in one place.</p>
            </div>
          </div>
          <Btn size="sm" onClick={() => navigate("/app/pricing")}>
            Upgrade <ArrowRight className="w-3.5 h-3.5" />
          </Btn>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center py-3">
        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3" style={{ color: FLAME }} />
          Your personal AI career strategist — actively guiding you toward your next milestone.
        </p>
      </div>
    </div>
  );
}
