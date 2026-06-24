'use client';

/**
 * P6: Career Timeline
 * Shows completed learning, certifications, resume improvements,
 * applications, interviews, milestones, and career score changes.
 */

import { useMemo, useState } from "react";
import { Clock, BookOpen, Target, Zap, Briefcase, Mic, Sparkles, Award, TrendingUp, FileText, Filter } from "lucide-react";
import { FLAME, CARBON } from "../lib/constants";
import { Card } from "./Card";
import { useCareerData } from "../contexts/CareerDataContext";
import { generateTimeline } from "../services/career-engine";

const CATEGORY_COLORS: Record<string, string> = {
  Learning: "#3B82F6",
  Goals: FLAME,
  Skills: "#8B5CF6",
  Career: "#10B981",
  Services: "#F59E0B",
};

const CATEGORY_ICONS: Record<string, any> = {
  Learning: BookOpen,
  Goals: Target,
  Skills: Zap,
  Career: Briefcase,
  Services: Sparkles,
};

export default function CareerTimeline() {
  const { skills, goals, learningSteps, outcomes, quizResults, purchasedServices } = useCareerData();
  const [filter, setFilter] = useState<string>("all");

  const events = useMemo(
    () => generateTimeline(skills, goals, learningSteps, outcomes, quizResults, purchasedServices),
    [skills, goals, learningSteps, outcomes, quizResults, purchasedServices],
  );

  const categories = useMemo(() => {
    const cats = new Set(events.map(e => e.category));
    return ["all", ...Array.from(cats)];
  }, [events]);

  const filtered = filter === "all"
    ? events
    : events.filter(e => e.category === filter);

  const totalCount = events.length;

  return (
    <Card className="p-3 relative overflow-hidden" hover={false}>
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-[0.04] pointer-events-none" style={{ backgroundColor: "#8B5CF6" }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(139,92,246,0.1)" }}>
            <Clock className="w-3.5 h-3.5" style={{ color: "#8B5CF6" }} />
          </div>
          <div>
            <span className="text-[11px] font-black" style={{ color: CARBON }}>Career Timeline</span>
            <p className="text-[8px] text-muted-foreground">{totalCount} event{totalCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {categories.slice(0, 4).map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`text-[8px] font-bold px-1.5 py-0.5 rounded-lg transition-all ${
                filter === cat ? "text-white" : "text-muted-foreground bg-gray-100"
              }`}
              style={{ backgroundColor: filter === cat ? CATEGORY_COLORS[cat] || "#6B7280" : undefined }}>
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {filtered.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-[12px] font-bold" style={{ color: CARBON }}>No events yet</p>
            <p className="text-[11px] text-muted-foreground">Complete actions to see your career timeline.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {filtered.map((event, i) => {
              const color = CATEGORY_COLORS[event.category] || "#6B7280";
              const Icon = CATEGORY_ICONS[event.category] || Award;

              return (
                <div key={event.id} className="flex gap-2.5 pb-2 last:pb-0 relative">
                  {/* Timeline line */}
                  {i < filtered.length - 1 && (
                    <div className="absolute left-[13px] top-7 bottom-0 w-px" style={{ backgroundColor: "rgba(0,0,0,0.08)" }} />
                  )}

                  {/* Icon */}
                  <div className="relative z-10">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}12` }}>
                      {event.icon ? (
                        <span className="text-[11px]">{event.icon}</span>
                      ) : (
                        <Icon className="w-3 h-3" style={{ color }} />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <p className="text-[11px] font-bold" style={{ color: CARBON }}>{event.title}</p>
                      <span className="text-[8px] text-muted-foreground whitespace-nowrap flex-shrink-0">{event.date}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{event.description}</p>
                    <span className="inline-block mt-0.5 text-[7px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
                      style={{ backgroundColor: `${color}10`, color }}>
                      {event.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
