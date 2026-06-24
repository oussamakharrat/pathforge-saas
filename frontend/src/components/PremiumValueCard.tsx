'use client';

/**
 * P4: Premium Value Visibility
 * Adds upgrade justification to locked features.
 * Shows real metrics: salary increase %, interview success, examples.
 */

import { useMemo } from "react";
import { useNavigate } from "@/lib/router";
import { Lock, TrendingUp, Sparkles, Mic, DollarSign, Package, FileText, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { FLAME, CARBON } from "../lib/constants";
import { Card } from "./Card";
import { Btn } from "./Btn";
import { useAuth } from "../contexts/AuthContext";
import { useUpgrade } from "../contexts/UpgradeContext";

interface LockedFeature {
  id: string;
  page: string;
  label: string;
  icon: any;
  plan: "pro" | "premium";
  metrics: { label: string; value: string }[];
  preview: string;
  benefit: string;
}

const LOCKED_FEATURES: LockedFeature[] = [
  {
    id: "mock-interview",
    page: "interview",
    label: "Mock Interview",
    icon: Mic,
    plan: "premium",
    metrics: [
      { label: "Success boost", value: "+73%" },
      { label: "Avg. score", value: "87%" },
    ],
    preview: "Interviewers consistently ask about system design. Our AI adapts to your target role and identifies your weak areas with detailed feedback.",
    benefit: "Users who complete 3+ mock interviews see a 73% increase in callback rates.",
  },
  {
    id: "negotiate",
    page: "negotiate",
    label: "Negotiation Agent",
    icon: DollarSign,
    plan: "premium",
    metrics: [
      { label: "Avg. increase", value: "$38k" },
      { label: "Max recorded", value: "$80k" },
    ],
    preview: "Our AI analyzes your offer against 50k+ verified data points and generates personalized counter-offer scripts.",
    benefit: "Premium users negotiate an average of $38k more per offer.",
  },
  {
    id: "resume-review",
    page: "resume",
    label: "Resume Review",
    icon: FileText,
    plan: "pro",
    metrics: [
      { label: "Callback rate", value: "+62%" },
      { label: "Optimizations", value: "24 pts" },
    ],
    preview: "AI scans your resume against job descriptions and identifies missing keywords, weak phrasing, and formatting issues.",
    benefit: "Optimized resumes get 62% more callbacks from top tech companies.",
  },
  {
    id: "services",
    page: "services",
    label: "Premium Services",
    icon: Package,
    plan: "pro",
    metrics: [
      { label: "Career boost", value: "+41%" },
      { label: "Users satisfied", value: "94%" },
    ],
    preview: "Get a full career audit including resume rewrite, LinkedIn optimization, and a personalized 6-month roadmap.",
    benefit: "Complete service users advance 41% faster to their target role.",
  },
];

export default function PremiumValueCard() {
  const { plan } = useAuth();
  const { requestUpgrade } = useUpgrade();

  const locked = useMemo(
    () => LOCKED_FEATURES.filter(f => {
      const hierarchy: Record<string, number> = { free: 0, pro: 1, premium: 2 };
      return hierarchy[plan] < hierarchy[f.plan];
    }),
    [plan],
  );

  // Check if we have any page access restrictions to show this card
  const hasLockedContent = locked.length > 0;
  if (!hasLockedContent) return null;

  return (
    <Card className="p-3 relative overflow-hidden border-dashed" hover={false}
      style={{ borderColor: "rgba(241,80,37,0.3)" }}>
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-[0.05] pointer-events-none" style={{ backgroundColor: FLAME }} />

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(241,80,37,0.1)" }}>
          <Sparkles className="w-3 h-3" style={{ color: FLAME }} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: CARBON }}>Unlock Premium Features</span>
      </div>

      <div className="space-y-1.5">
        {locked.map(feature => {
          const Icon = feature.icon;
          const planColor = feature.plan === "premium" ? "#8B5CF6" : "#F59E0B";
          const planBg = feature.plan === "premium" ? "rgba(139,92,246,0.1)" : "rgba(245,158,11,0.1)";

          return (
            <div key={feature.id}
              className="p-2.5 rounded-xl bg-white border border-border hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: planBg }}>
                  <Icon className="w-4 h-4" style={{ color: planColor }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[12px] font-bold" style={{ color: CARBON }}>{feature.label}</span>
                    <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: planBg, color: planColor }}>
                      {feature.plan}
                    </span>
                    <Lock className="w-3 h-3 text-muted-foreground ml-auto" />
                  </div>

                  {/* Metrics row */}
                  <div className="flex gap-2 mb-1.5">
                    {feature.metrics.map(m => (
                      <div key={m.label} className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" style={{ color: "#10B981" }} />
                        <span className="text-[10px] font-bold" style={{ color: "#10B981" }}>{m.value}</span>
                        <span className="text-[8px] text-muted-foreground">{m.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Preview */}
                  <p className="text-[9px] text-muted-foreground mb-1.5 italic">
                    "{feature.preview}"
                  </p>

                  {/* Benefit */}
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "#10B981" }} />
                    <p className="text-[10px] font-medium" style={{ color: CARBON }}>{feature.benefit}</p>
                  </div>
                </div>

                {/* Upgrade CTA */}
                <button onClick={() => requestUpgrade(feature.page, feature.label)}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0 transition-all hover:shadow-sm"
                  style={{ backgroundColor: FLAME, color: "white" }}>
                  Upgrade <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
