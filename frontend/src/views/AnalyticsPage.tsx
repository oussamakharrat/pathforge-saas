'use client';

import { useState, useMemo, useEffect } from "react";
import { TrendingUp, Target, Zap, BookOpen, Briefcase, Award, Download, Sparkles, Mic } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { FLAME, CARBON, ALABASTER, DUST } from "../lib/constants";
import { Card } from "../components/Card";
import { Bar } from "../components/Bar";
import { Chip } from "../components/Chip";
import { PageHeader } from "../components/PageHeader";
import { useCareerData } from "../contexts/CareerDataContext";

type Period = "7d" | "30d" | "90d" | "1y";

export default function AnalyticsPage() {
  const { skills, goals, learningSteps, outcomes, careerScore, quizResults, dashboardMetrics, scoreHistory } = useCareerData();
  const [period, setPeriod] = useState<Period>("30d");
  const [interviewReadiness, setInterviewReadiness] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    void api.getInterviewReadiness().then(setInterviewReadiness).catch(() => setInterviewReadiness([]));
  }, []);

  const periodMonths = period === "7d" ? 1 : period === "30d" ? 3 : period === "90d" ? 6 : 12;

  const avgSkill = useMemo(
    () => skills.length > 0
      ? Math.round(skills.reduce((s, k) => s + k.pct, 0) / skills.length)
      : 0,
    [skills],
  );
  const learningDone = learningSteps.filter(s => s.done).length;
  const goalAvgProgress = useMemo(() => Math.round(goals.reduce((s, g) => s + g.progress, 0) / (goals.length || 1)), [goals]);

  const historyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const baseScore = dashboardMetrics.careerScore || careerScore;

    if (scoreHistory.length >= 2) {
      const slice = scoreHistory.slice(-periodMonths);
      return slice.map((entry) => {
        const d = new Date(entry.date);
        return {
          month: months[d.getMonth()] ?? entry.date.slice(5, 7),
          score: entry.score,
          skills: entry.skills,
          applications: entry.applications,
        };
      });
    }

    const slice = months.slice(-periodMonths);
    return slice.map((m, i) => ({
      month: m,
      score: Math.min(98, Math.max(0, Math.round(baseScore * (0.7 + (i / Math.max(slice.length - 1, 1)) * 0.3)))),
      skills: avgSkill,
      applications: outcomes.totalApplications,
    }));
  }, [dashboardMetrics, careerScore, avgSkill, outcomes.totalApplications, periodMonths, scoreHistory]);

  const quizAvg = useMemo(() => {
    if (quizResults.length === 0) return 0;
    return Math.round(quizResults.reduce((s, q) => s + q.pct, 0) / quizResults.length);
  }, [quizResults]);

  const strongestCategory = useMemo(() => {
    const cats: Record<string, number[]> = {};
    skills.forEach(s => {
      if (!cats[s.cat]) cats[s.cat] = [];
      cats[s.cat].push(s.pct);
    });
    let best = { cat: "", avg: 0 };
    Object.entries(cats).forEach(([cat, pcts]) => {
      const a = Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
      if (a > best.avg) best = { cat, avg: a };
    });
    return best;
  }, [skills]);

  const weakestCategory = useMemo(() => {
    const cats: Record<string, number[]> = {};
    skills.forEach(s => {
      if (!cats[s.cat]) cats[s.cat] = [];
      cats[s.cat].push(s.pct);
    });
    let worst = { cat: "", avg: 100 };
    Object.entries(cats).forEach(([cat, pcts]) => {
      const a = Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
      if (a < worst.avg) worst = { cat, avg: a };
    });
    return worst;
  }, [skills]);

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Track your career growth over time. Scores, skills, and application metrics."
        action={
          <button onClick={async () => {
            try {
              const data = await api.exportUserData();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `pathforge-export-${new Date().toISOString().split("T")[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Data exported");
            } catch {
              toast.error("Export failed");
            }
          }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:bg-secondary" style={{ color: CARBON }}>
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        }
      />

      {/* Period selector */}
      <div className="flex gap-1.5 mb-5">
        {[{ id: "7d" as const, label: "7 Days" }, { id: "30d" as const, label: "30 Days" }, { id: "90d" as const, label: "90 Days" }, { id: "1y" as const, label: "Year" }].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} className="px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all"
            style={{ backgroundColor: period === p.id ? FLAME : ALABASTER, color: period === p.id ? "white" : CARBON }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Career Score", value: careerScore, icon: Award, color: FLAME, suffix: "/100", trend: "+8" },
          { label: "Avg Skill", value: avgSkill, icon: Zap, color: "#8B5CF6", suffix: "%", trend: "+5" },
          { label: "Goal Progress", value: goalAvgProgress, icon: Target, color: "#10B981", suffix: "%", trend: "+12" },
          { label: "Applications", value: outcomes.totalApplications, icon: Briefcase, color: "#3B82F6", suffix: "", trend: outcomes.totalApplications > 0 ? `+${outcomes.totalApplications}` : "0" },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4" hover={false}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-muted-foreground">{kpi.label}</span>
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black" style={{ color: CARBON }}>{kpi.value}{kpi.suffix}</span>
              <span className="text-[11px] font-bold text-emerald-500 mb-1 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {kpi.trend}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Score trend chart */}
      <Card className="p-5 mb-5" hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-black flex items-center gap-2" style={{ color: CARBON }}>
            <TrendingUp className="w-4 h-4" style={{ color: FLAME }} /> Score Trend
          </h2>
          <Chip variant="green">+{Math.round(historyData[historyData.length - 1].score - historyData[0].score)} pts</Chip>
        </div>
        <div className="flex items-end gap-2 h-32">
          {historyData.map((h, i) => {
            const maxScore = Math.max(...historyData.map(d => d.score));
            const heightPct = (h.score / maxScore) * 100;
            const isLatest = i === historyData.length - 1;
            return (
              <div key={h.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold" style={{ color: isLatest ? FLAME : DUST }}>{h.score}</span>
                <div className="w-full rounded-lg transition-all duration-300 relative group" style={{
                  height: `${Math.max(heightPct, 8)}%`,
                  backgroundColor: isLatest ? FLAME : DUST,
                  opacity: isLatest ? 1 : 0.5,
                }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.month}: {h.score}/100
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground">{h.month}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Skills by category */}
        <Card className="p-5" hover={false}>
          <h2 className="text-[14px] font-black mb-4 flex items-center gap-2" style={{ color: CARBON }}>
            <Zap className="w-4 h-4" style={{ color: FLAME }} /> Skills by Category
          </h2>
          {Object.entries(
            skills.reduce((acc, s) => {
              if (!acc[s.cat]) acc[s.cat] = [];
              acc[s.cat].push(s.pct);
              return acc;
            }, {} as Record<string, number[]>)
          ).map(([cat, pcts]) => {
            const avg = Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
            const count = pcts.length;
            return (
              <div key={cat} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold" style={{ color: CARBON }}>{cat}</span>
                  <span className="text-[11px] text-muted-foreground">{avg}% avg · {count} skill{count > 1 ? "s" : ""}</span>
                </div>
                <Bar pct={avg} h={5} color={avg >= 70 ? "#10B981" : avg >= 45 ? FLAME : "#EF4444"} />
              </div>
            );
          })}
          <div className="mt-4 pt-3 border-t border-border flex justify-between text-[11px]">
            <span className="text-emerald-600 font-semibold">▲ Strongest: {strongestCategory.cat} ({strongestCategory.avg}%)</span>
            <span className="text-red-500 font-semibold">▼ Weakest: {weakestCategory.cat} ({weakestCategory.avg}%)</span>
          </div>
        </Card>

        {/* Activity summary */}
        <Card className="p-5" hover={false}>
          <h2 className="text-[14px] font-black mb-4 flex items-center gap-2" style={{ color: CARBON }}>
            <Award className="w-4 h-4" style={{ color: FLAME }} /> Activity Summary
          </h2>
          <div className="space-y-4">
            {[
              { label: "Learning Steps", value: learningDone, total: learningSteps.length, icon: BookOpen, color: FLAME },
              { label: "Goals Progress", value: goalAvgProgress, total: 100, icon: Target, color: "#10B981", suffix: "%" },
              { label: "Job Applications", value: outcomes.totalApplications, total: Math.max(outcomes.totalApplications, 10), icon: Briefcase, color: "#3B82F6" },
              { label: "Mock Interviews", value: outcomes.interviewsCompleted, total: Math.max(outcomes.interviewsCompleted, 5), icon: Mic, color: "#8B5CF6" },
              { label: "Quiz Avg Score", value: quizAvg, total: 100, icon: Zap, color: "#F59E0B", suffix: "%" },
            ].map(item => {
              const pct = Math.min(100, (item.value / item.total) * 100);
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                      <span className="text-[12px] font-semibold" style={{ color: CARBON }}>{item.label}</span>
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: item.color }}>{item.value}{item.suffix || ""}</span>
                  </div>
                  <Bar pct={pct} h={4} color={item.color} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent quiz results */}
      {quizResults.length > 0 && (
        <Card className="p-5" hover={false}>
          <h2 className="text-[14px] font-black mb-3 flex items-center gap-2" style={{ color: CARBON }}>
            <Sparkles className="w-4 h-4" style={{ color: FLAME }} /> Recent Quiz Results
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="text-muted-foreground font-bold border-b border-border">
                  <th className="pb-2 pr-4">Skill</th>
                  <th className="pb-2 pr-4">Score</th>
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {quizResults.slice(-6).reverse().map((q, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 font-semibold" style={{ color: CARBON }}>{q.skillName}</td>
                    <td className="py-2.5 pr-4">
                      <span className="font-black" style={{ color: q.pct >= 70 ? "#10B981" : FLAME }}>{q.correct}/{q.total}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{q.date}</td>
                    <td className="py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${q.pct >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                        {q.pct >= 70 ? "Passed" : "Needs review"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
