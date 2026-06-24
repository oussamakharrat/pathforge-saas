'use client';

import { useState, useMemo } from "react";
import { Trophy, Target, Zap, BookOpen, Award, Flame, CheckCircle2, Lock } from "lucide-react";
import { FLAME, CARBON, ALABASTER } from "../lib/constants";
import { Card } from "../components/Card";
import { Bar } from "../components/Bar";
import { PageHeader } from "../components/PageHeader";
import { useGamification } from "../contexts/GamificationContext";
import { useCareerData } from "../contexts/CareerDataContext";

const ICON_MAP: Record<string, typeof Trophy> = {
  growth: Target,
  skills: Zap,
  jobs: Award,
  streak: Flame,
  learning: BookOpen,
  milestone: Trophy,
};

export default function AchievementsPage() {
  const { achievements, streakDays, loading } = useGamification();
  const { goals, skills, outcomes } = useCareerData();
  const [filter, setFilter] = useState<string>("all");

  const enriched = useMemo(() => {
    return achievements.map((a) => {
      const Icon = ICON_MAP[a.category] ?? Trophy;
      let progress: { current: number; target: number } | undefined;
      if (a.criteria.includes("goal")) progress = { current: Math.min(goals.length, 1), target: 1 };
      else if (a.criteria.includes("skill")) progress = { current: Math.min(skills.length, 5), target: 5 };
      else if (a.criteria.includes("streak")) progress = { current: streakDays, target: 7 };
      else if (a.criteria.includes("interview")) progress = { current: outcomes.interviewsCompleted, target: 1 };
      return {
        id: a.id,
        title: a.title,
        desc: a.desc,
        icon: Icon,
        unlocked: a.unlocked,
        unlockedDate: a.unlockedDate,
        category: a.category as "milestone" | "skill" | "social" | "streak",
        rarity: "common" as const,
        progress,
      };
    });
  }, [achievements, goals.length, skills.length, streakDays, outcomes.interviewsCompleted]);

  const filtered = filter === "all" ? enriched : enriched.filter(a => a.category === filter);
  const unlockedCount = enriched.filter(a => a.unlocked).length;

  return (
    <div>
      <PageHeader
        title="Achievements"
        subtitle={loading ? "Loading..." : `${unlockedCount} of ${enriched.length} unlocked`}
        action={
          <div className="flex gap-1.5">
            {["all", "milestone", "skill", "streak"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all"
                style={{ backgroundColor: filter === f ? FLAME : ALABASTER, color: filter === f ? "white" : "#6B6F6B" }}>{f}</button>
            ))}
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(a => (
          <Card key={a.id} className="p-4" hover={false} style={{ opacity: a.unlocked ? 1 : 0.65 }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: a.unlocked ? "rgba(241,80,37,0.1)" : ALABASTER }}>
                {a.unlocked ? <a.icon className="w-5 h-5" style={{ color: FLAME }} /> : <Lock className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div>
                <h3 className="text-[13px] font-black" style={{ color: CARBON }}>{a.title}</h3>
                <p className="text-[11px] text-muted-foreground">{a.desc}</p>
              </div>
            </div>
            {a.progress && !a.unlocked && (
              <div>
                <div className="flex justify-between text-[10px] mb-1"><span className="text-muted-foreground">Progress</span><span className="font-bold" style={{ color: FLAME }}>{a.progress.current}/{a.progress.target}</span></div>
                <Bar pct={(a.progress.current / a.progress.target) * 100} />
              </div>
            )}
            {a.unlocked && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Unlocked{a.unlockedDate ? ` · ${a.unlockedDate}` : ""}</div>
            )}
          </Card>
        ))}
      </div>

      {!loading && enriched.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">Complete goals and skills to earn achievements.</Card>
      )}
    </div>
  );
}
