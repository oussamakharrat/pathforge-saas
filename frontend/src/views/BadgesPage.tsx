'use client';

import { useState, useMemo } from "react";
import { Trophy, Target, BookOpen, Zap, Briefcase, Flame, Users, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import { FLAME, CARBON } from "../lib/constants";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { useGamification } from "../contexts/GamificationContext";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  learning: BookOpen,
  skills: Zap,
  jobs: Briefcase,
  streak: Flame,
  social: Users,
  growth: Target,
};

const RARITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  bronze: { color: "#CD7F32", bg: "rgba(205,127,50,0.1)", label: "Bronze" },
  silver: { color: "#94A3B8", bg: "rgba(148,163,184,0.1)", label: "Silver" },
  gold: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "Gold" },
  platinum: { color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", label: "Platinum" },
};

export default function BadgesPage() {
  const { badges, loading, streakDays } = useGamification();
  const [filter, setFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(badges.map(b => b.category));
    return ["all", ...Array.from(cats)];
  }, [badges]);

  const filtered = filter === "all" ? badges : badges.filter(b => b.category === filter);
  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div>
      <PageHeader
        title="Badges"
        subtitle={loading ? "Loading..." : `${earnedCount} of ${badges.length} earned · ${streakDays}-day streak`}
        action={
          <div className="flex gap-1.5 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className="px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all"
                style={{ backgroundColor: filter === cat ? FLAME : "rgba(0,0,0,0.04)", color: filter === cat ? "white" : "#6B6F6B" }}>{cat}</button>
            ))}
          </div>
        }
      />

      {loading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading badges...</Card>
      ) : badges.length === 0 ? (
        <EmptyState icon={<Trophy className="w-12 h-12" style={{ color: FLAME }} />} title="No badges yet" description="Badge definitions will appear from the reference catalog." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => {
            const CatIcon = CATEGORY_ICONS[b.category] ?? Target;
            const rarity = RARITY_CONFIG[b.rarity] ?? RARITY_CONFIG.bronze;
            return (
              <Card key={b.id} className={cn("p-4 transition-all", !b.earned && "opacity-60")} hover={false}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: b.earned ? rarity.bg : "rgba(0,0,0,0.04)" }}>
                    {b.earned ? b.icon : "🔒"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[13px] font-black truncate" style={{ color: CARBON }}>{b.title}</h3>
                      {b.earned && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{b.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: rarity.bg, color: rarity.color }}>{rarity.label}</span>
                      <CatIcon className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">{b.requirements}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
