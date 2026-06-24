'use client';

/**
 * P5: "What Should I Do Next?" Engine
 * Every dashboard load answers: What? Why? Outcome? Unlocks?
 * Dynamic prioritized recommendations.
 */

import { useMemo } from "react";
import { useNavigate } from "@/lib/router";
import { Compass, ArrowRight, Target, Sparkles } from "lucide-react";
import { FLAME, CARBON } from "../lib/constants";
import { Card } from "./Card";
import { useCareerData } from "../contexts/CareerDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useUpgrade } from "../contexts/UpgradeContext";
import { generateNextMoves } from "../services/career-engine";

export default function NextMoveEngine() {
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const { requestUpgrade } = useUpgrade();
  const { skills, goals, learningSteps, outcomes } = useCareerData();

  const safeNavigate = (path: string, pageId: string, label: string) => {
    if (!canAccess(pageId)) {
      requestUpgrade(pageId, label);
    } else {
      navigate(path);
    }
  };

  const moves = useMemo(
    () => generateNextMoves(skills, goals, learningSteps, outcomes),
    [skills, goals, learningSteps, outcomes],
  );

  if (moves.length === 0) return null;

  const impactColors = (impact: number) => {
    if (impact >= 8) return { text: "#10B981", bg: "rgba(16,185,129,0.1)" };
    if (impact >= 5) return { text: "#F59E0B", bg: "rgba(245,158,11,0.1)" };
    return { text: "#6B7280", bg: "rgba(107,114,128,0.1)" };
  };

  return (
    <Card className="p-3 relative overflow-hidden" hover={false}>
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-[0.05] pointer-events-none" style={{ backgroundColor: FLAME }} />

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(241,80,37,0.1)" }}>
          <Compass className="w-3.5 h-3.5" style={{ color: FLAME }} />
        </div>
        <div>
          <span className="text-[11px] font-black" style={{ color: CARBON }}>What Should I Do Next?</span>
          <p className="text-[8px] text-muted-foreground">Prioritized by career impact</p>
        </div>
      </div>

      {/* Moves */}
      <div className="space-y-1.5">
        {moves.map((move, idx) => (
          <div key={move.id}
            className="group relative p-2.5 rounded-xl bg-white border border-border hover:shadow-md transition-all cursor-pointer"
            onClick={() => safeNavigate(move.actionPath, move.actionPath.split("/").pop() ?? "", move.actionLabel)}>

            {/* Priority number */}
            <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
              style={{ backgroundColor: idx === 0 ? FLAME : "#6B7280" }}>
              {idx + 1}
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {/* What */}
                <p className="text-[13px] font-bold pr-2" style={{ color: CARBON }}>{move.what}</p>

                {/* Why */}
                <div className="flex items-start gap-1.5 mt-1.5">
                  <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: FLAME }} />
                  <p className="text-[10px] text-muted-foreground">{move.why}</p>
                </div>

                {/* Outcome + Unlocks */}
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(16,185,129,0.05)" }}>
                    <p className="text-[7px] font-bold uppercase tracking-wider text-emerald-600 mb-0.5">Outcome</p>
                    <p className="text-[9px] font-medium" style={{ color: CARBON }}>{move.outcome}</p>
                  </div>
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(139,92,246,0.05)" }}>
                    <p className="text-[7px] font-bold uppercase tracking-wider text-purple-600 mb-0.5">Unlocks</p>
                    <p className="text-[9px] font-medium" style={{ color: CARBON }}>{move.unlocks}</p>
                  </div>
                </div>
              </div>

              {/* Impact score */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center" style={{ backgroundColor: impactColors(move.impact).bg }}>
                  <span className="text-[16px] font-black" style={{ color: impactColors(move.impact).text }}>+{move.impact}</span>
                </div>
                <span className="text-[7px] font-bold uppercase tracking-wider text-muted-foreground">Score</span>
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-1 mt-1.5 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: FLAME }}>
              <Target className="w-3 h-3" /> {move.actionLabel} <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
