'use client';

/**
 * P3: Entity Relationship Chain
 * Visualizes how entities connect — course → skill → score → jobs.
 * Makes the "cause & effect" tangible for users.
 */

import { useMemo } from "react";
import { useNavigate } from "@/lib/router";
import { ArrowDown, Link as LinkIcon, Zap, TrendingUp, Briefcase, Target, BookOpen, Mic } from "lucide-react";
import { FLAME, CARBON } from "../lib/constants";
import { Card } from "./Card";
import { useCareerData } from "../contexts/CareerDataContext";
import { buildRelationshipGraph } from "../services/career-engine";

const TYPE_ICONS: Record<string, any> = {
  skill: Zap,
  goal: Target,
  learning: BookOpen,
  job: Briefcase,
  score: TrendingUp,
  interview: Mic,
};

export default function RelationshipChain() {
  const { skills, goals, learningSteps, outcomes } = useCareerData();

  const links = useMemo(
    () => buildRelationshipGraph(skills, goals, learningSteps, outcomes),
    [skills, goals, learningSteps, outcomes],
  );

  // Take the most impactful chain: learning → skill → score → jobs
  const topChain = useMemo(() => {
    // Find a learning→skill or skill→jobs link to start the chain
    const learningLinks = links.filter(l => l.fromType === "learning" && l.effect === "improves" && !l.from.startsWith("✓"));
    const skillToJobs = links.filter(l => l.toType === "job" && l.effect === "unlocks");
    const skillToScore = links.filter(l => l.toType === "score");

    // Build a chain of 3-4 links
    const chain: typeof links = [];

    // Start with an incomplete learning step if available
    if (learningLinks.length > 0) {
      chain.push(learningLinks[0]);
      // Find the skill it improves
      const skillName = learningLinks[0].to;
      const scoreLink = skillToScore.find(l => l.from === skillName);
      if (scoreLink) chain.push(scoreLink);
      const jobsLink = skillToJobs.find(l => l.from === skillName);
      if (jobsLink) chain.push(jobsLink);
    } else if (skillToJobs.length > 0) {
      chain.push(skillToJobs[0]);
      const scoreLink = skillToScore.find(l => l.from === skillToJobs[0].from);
      if (scoreLink) chain.push(scoreLink);
    } else if (skillToScore.length > 0) {
      chain.push(skillToScore[0]);
    }

    return chain;
  }, [links]);

  if (topChain.length === 0) return null;

  const effectColor = (effect: string) => {
    switch (effect) {
      case "improves": return "#10B981";
      case "unlocks": return "#8B5CF6";
      case "affects": return "#3B82F6";
      case "determines": return FLAME;
      default: return "#6B7280";
    }
  };

  return (
    <Card className="p-3 relative overflow-hidden" hover={false}>
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-[0.04] pointer-events-none" style={{ backgroundColor: "#10B981" }} />

      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
          <LinkIcon className="w-3 h-3" style={{ color: "#10B981" }} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: CARBON }}>Cause & Effect</span>
      </div>

      <div className="space-y-1.5">
        {topChain.map((link, i) => {
          const FromIcon = TYPE_ICONS[link.fromType] || LinkIcon;
          const ToIcon = TYPE_ICONS[link.toType] || LinkIcon;
          const color = effectColor(link.effect);

          return (
            <div key={i}>
              {/* From → To */}
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-white border border-border">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}10` }}>
                    <FromIcon className="w-3 h-3" style={{ color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold truncate" style={{ color: CARBON }}>
                      {link.from.length > 25 ? link.from.slice(0, 25) + "…" : link.from}
                    </p>
                    <p className="text-[7px] font-medium uppercase tracking-wider text-muted-foreground">{link.fromType}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-0 flex-shrink-0 px-0.5">
                  <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color }}>{link.effect}</span>
                  <ArrowDown className="w-3 h-3" style={{ color }} />
                </div>

                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}10` }}>
                    <ToIcon className="w-3 h-3" style={{ color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold truncate" style={{ color: CARBON }}>
                      {link.to.length > 20 ? link.to.slice(0, 20) + "…" : link.to}
                    </p>
                    <p className="text-[7px] font-medium uppercase tracking-wider text-muted-foreground">{link.toType}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-[8px] text-muted-foreground mt-0.5 px-0.5">{link.description}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
