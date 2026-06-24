'use client';

/**
 * P2: Job Market Intelligence
 * Shows trending skills, demand levels, and industry insights.
 * Helps users prioritize learning based on actual market demand.
 */

import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Minus, BarChart3, Search, ArrowUp } from "lucide-react";
import { CARBON } from "../lib/constants";
import { Card } from "./Card";
import { getMarketTrends } from "../services/career-engine";

const CATEGORIES = ["All", "DevOps", "Cloud", "Language", "Frontend", "API", "Architecture", "AI", "Database"];

export default function MarketIntelligence() {
  const [filterCat, setFilterCat] = useState("All");
  const [sortBy, setSortBy] = useState<"change" | "demand">("change");

  const trends = useMemo(() => {
    let data = getMarketTrends();
    if (filterCat !== "All") {
      data = data.filter(t => t.category === filterCat);
    }
    return [...data].sort((a, b) =>
      sortBy === "change" ? b.change - a.change : b.demandLevel.localeCompare(a.demandLevel)
    );
  }, [filterCat, sortBy]);

  const highestDemand = useMemo(() => {
    return [...trends].sort((a, b) => b.change - a.change).slice(0, 3);
  }, [trends]);

  const demandColors: Record<string, string> = {
    high: "#10B981",
    medium: "#F59E0B",
    low: "#6B7280",
    emerging: "#8B5CF6",
  };

  return (
    <Card className="p-3 relative overflow-hidden" hover={false}>
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-[0.04] pointer-events-none" style={{ backgroundColor: "#3B82F6" }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(59,130,246,0.1)" }}>
            <BarChart3 className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} />
          </div>
          <div>
            <span className="text-[11px] font-black" style={{ color: CARBON }}>Market Intelligence</span>
            <p className="text-[8px] text-muted-foreground">Real-time skill demand</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          <button onClick={() => setSortBy("change")}
            className={`text-[8px] font-bold px-1.5 py-0.5 rounded-lg transition-all ${sortBy === "change" ? "bg-foreground text-white" : "bg-gray-100 text-muted-foreground"}`}>
            Trending
          </button>
          <button onClick={() => setSortBy("demand")}
            className={`text-[8px] font-bold px-1.5 py-0.5 rounded-lg transition-all ${sortBy === "demand" ? "bg-foreground text-white" : "bg-gray-100 text-muted-foreground"}`}>
            Demand
          </button>
        </div>
      </div>

      {/* Top 3 trending banner */}
      <div className="flex gap-1.5 mb-2.5 overflow-x-auto pb-0.5">
        {highestDemand.map(t => (
          <div key={t.skill} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap"
            style={{ backgroundColor: `${demandColors[t.demandLevel]}10` }}>
            <ArrowUp className="w-3 h-3" style={{ color: demandColors[t.demandLevel] }} />
            <span className="text-[11px] font-bold" style={{ color: CARBON }}>{t.skill}</span>
            <span className="text-[10px] font-black" style={{ color: demandColors[t.demandLevel] }}>↑{t.change}%</span>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 mb-2 overflow-x-auto pb-0.5">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`text-[9px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
              filterCat === cat ? "text-white" : "text-muted-foreground bg-gray-100 hover:bg-gray-200"
            }`}
            style={{ backgroundColor: filterCat === cat ? "#3B82F6" : undefined }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Skill rows */}
      <div className="space-y-0.5">
        {trends.map(t => (
          <div key={t.skill} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold truncate" style={{ color: CARBON }}>{t.skill}</span>
                <span className="text-[7px] font-medium px-1 py-0.5 rounded-full whitespace-nowrap"
                  style={{ backgroundColor: `${demandColors[t.demandLevel]}15`, color: demandColors[t.demandLevel] }}>
                  {t.demandLevel}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{t.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 justify-end">
                {t.trend === "up" ? (
                  <TrendingUp className="w-3 h-3" style={{ color: "#10B981" }} />
                ) : t.trend === "down" ? (
                  <TrendingDown className="w-3 h-3" style={{ color: "#EF4444" }} />
                ) : (
                  <Minus className="w-3 h-3" style={{ color: "#6B7280" }} />
                )}
                <span className={`text-[12px] font-black ${
                  t.trend === "up" ? "text-emerald-600" : t.trend === "down" ? "text-red-600" : "text-gray-500"
                }`}>
                  {t.trend === "up" ? "+" : ""}{t.change}%
                </span>
              </div>
              <p className="text-[8px] text-muted-foreground">{t.category}</p>
            </div>
          </div>
        ))}
      </div>

      {trends.length === 0 && (
        <div className="py-8 text-center">
          <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-[12px] font-bold" style={{ color: CARBON }}>No trends for this category</p>
          <p className="text-[11px] text-muted-foreground">Try selecting a different filter.</p>
        </div>
      )}

      <div className="mt-1.5 pt-1.5 border-t border-border">
        <p className="text-[9px] text-muted-foreground text-center">
          Data aggregated from job postings, industry reports, and market analysis.
        </p>
      </div>
    </Card>
  );
}
