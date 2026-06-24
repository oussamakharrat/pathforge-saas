'use client';

/**
 * P1: Today's AI Recommendation Widget
 * Generates personalized, context-aware recommendations with WHY, WHAT, IMPACT explanation.
 * This is the primary AI-first experience on the dashboard.
 */

import { useMemo } from "react";
import { useNavigate } from "@/lib/router";
import { Sparkles, Brain, Target, TrendingUp, ArrowRight, Lightbulb, ChevronRight, type LucideIcon } from "lucide-react";
import { FLAME, CARBON } from "../lib/constants";
import { Btn } from "./Btn";
import { useCareerData } from "../contexts/CareerDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useUpgrade } from "../contexts/UpgradeContext";
import { generateRecommendations } from "../services/career-engine";

export default function AIRecommendation() {
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const { requestUpgrade } = useUpgrade();
  const { skills, goals, learningSteps, outcomes, quizResults } = useCareerData();

  const safeNavigate = (path: string, pageId: string, label: string) => {
    if (!canAccess(pageId)) {
      requestUpgrade(pageId, label);
    } else {
      navigate(path);
    }
  };

  const recommendations = useMemo(
    () => generateRecommendations(skills, goals, learningSteps, outcomes, quizResults),
    [skills, goals, learningSteps, outcomes, quizResults],
  );

  const topRec = recommendations[0];
  if (!topRec) return null;

  const typeConfig: Record<string, { label: string; icon: LucideIcon; color: string; bg: string }> = {
    learning: { label: "Learning", icon: Brain, color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
    skill: { label: "Skill Gap", icon: Target, color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
    resume: { label: "Resume", icon: Sparkles, color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
    career: { label: "Career", icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
    goal: { label: "Goal", icon: Target, color: FLAME, bg: "rgba(241,80,37,0.1)" },
    market: { label: "Market Trend", icon: Lightbulb, color: "#EC4899", bg: "rgba(236,72,153,0.1)" },
  };

  const cfg = typeConfig[topRec.type] || typeConfig.learning;

  return (
    <section className="rounded-2xl border border-border overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, rgba(241,80,37,0.04), rgba(255,255,255,1))" }}>
      {/* Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-[0.06] pointer-events-none" style={{ backgroundColor: FLAME }} />

      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(241,80,37,0.1)" }}>
              <Sparkles className="w-3 h-3" style={{ color: FLAME }} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: CARBON }}>
              Today&apos;s AI Recommendation
            </span>
          </div>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        {/* Main recommendation */}
        <div className="space-y-2">
          {/* Title */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
              <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-black tracking-tight" style={{ color: CARBON }}>{topRec.title}</p>
            </div>
          </div>

          {/* Reason */}
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: "rgba(241,80,37,0.04)" }}>
            <div className="flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: FLAME }} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Why</p>
                <p className="text-[13px] font-medium" style={{ color: CARBON }}>{topRec.reason}</p>
              </div>
            </div>
          </div>

          {/* Expected outcome + Impact */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="p-2.5 rounded-xl bg-white border border-border">
              <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Expected Outcome</p>
              <p className="text-[11px] font-semibold" style={{ color: CARBON }}>{topRec.expectedOutcome}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-border">
              <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Impact</p>
              <div className="space-y-0.5">
                {topRec.impact.careerScore > 0 && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Career Score</span>
                    <span className="font-black" style={{ color: "#10B981" }}>+{topRec.impact.careerScore}</span>
                  </div>
                )}
                {topRec.impact.jobsUnlocked > 0 && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Jobs Unlocked</span>
                    <span className="font-black" style={{ color: FLAME }}>+{topRec.impact.jobsUnlocked}</span>
                  </div>
                )}
                {topRec.impact.skillBoost > 0 && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Skill Boost</span>
                    <span className="font-black" style={{ color: "#8B5CF6" }}>+{topRec.impact.skillBoost}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5">
            <Btn size="sm" onClick={() => safeNavigate(topRec.actionPath, topRec.actionPath.split("/").pop() ?? "", topRec.actionLabel)}>
              <Target className="w-3.5 h-3.5" /> {topRec.actionLabel}
            </Btn>
            <Btn size="sm" variant="outline" onClick={() => safeNavigate("/app/coach", "coach", "AI Coach")}>
              <Brain className="w-3.5 h-3.5" /> Ask Coach
            </Btn>
          </div>
        </div>
      </div>

      {/* More recommendations accordion */}
      {recommendations.length > 1 && (
        <details className="border-t border-border group">
          <summary className="flex items-center justify-between px-3 py-1.5 cursor-pointer text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">
            <span>{recommendations.length - 1} more recommendation{recommendations.length - 1 > 1 ? "s" : ""}</span>
            <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
          </summary>
          <div className="px-3 pb-2 space-y-1">
            {recommendations.slice(1).map(rec => {
              const c = typeConfig[rec.type] || typeConfig.learning;
              const Icon = c.icon;
              return (
                <div key={rec.id}
                  onClick={() => safeNavigate(rec.actionPath, rec.actionPath.split("/").pop() ?? "", rec.actionLabel)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-border hover:shadow-sm transition-all cursor-pointer">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.bg }}>
                    <Icon className="w-3 h-3" style={{ color: c.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate" style={{ color: CARBON }}>{rec.title}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{rec.reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold" style={{ color: "#10B981" }}>+{rec.impact.careerScore}</p>
                    <p className="text-[7px] text-muted-foreground">score</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </details>
      )}
    </section>
  );
}
