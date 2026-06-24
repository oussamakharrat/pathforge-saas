'use client';

import { useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "@/lib/router";
import { X, Sparkles, CheckCircle2, ArrowRight, Lock } from "lucide-react";
import { FLAME, CARBON } from "../lib/constants";
import { Card } from "./Card";
import { Btn } from "./Btn";
import { PLAN_META, type Plan } from "../data/types";
import { UpgradeContext } from "../contexts/UpgradeContext";

/**
 * Describes the features per locked page — used to show what the user would unlock.
 */
const PAGE_UPGRADE_FEATURES: Record<string, { plan: Plan; features: string[]; pitch: string }> = {
  resume: {
    plan: "pro",
    pitch: "Get AI-powered resume scoring and ATS optimization.",
    features: ["AI resume scoring & rewriting", "ATS keyword optimization", "Unlimited resume versions", "Download as PDF"],
  },
  learning: {
    plan: "pro",
    pitch: "Unlock personalized AI-generated learning roadmaps.",
    features: ["AI-generated learning plans", "Step-by-step skill roadmaps", "Progress tracking per goal", "Regenerate anytime"],
  },
  tracker: {
    plan: "pro",
    pitch: "Track jobs, manage applications, and get match insights.",
    features: ["Drag-and-drop Kanban board", "Skill-to-job match scoring", "Application outcome tracking", "AI interview & offer prompts"],
  },
  coach: {
    plan: "pro",
    pitch: "Chat with an AI coach that knows your profile and goals.",
    features: ["Unlimited AI coaching sessions", "Personalized career advice", "Profile-aware responses", "Conversation history"],
  },
  interview: {
    plan: "premium",
    pitch: "Practice realistic mock interviews with AI feedback.",
    features: ["Unlimited mock interviews", "Behavioral, technical & system design", "AI scoring & feedback", "Real-time timing & pacing"],
  },
  negotiate: {
    plan: "premium",
    pitch: "Get AI-powered salary negotiation scripts and strategies.",
    features: ["AI salary negotiation agent", "Counter-offer script generation", "Market data comparisons", "Email drafting & timing"],
  },
  services: {
    plan: "pro",
    pitch: "Access professional career services on demand.",
    features: ["Resume review by experts", "CV rewrite service", "LinkedIn optimization", "Salary coaching sessions"],
  },
};

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [upgradePage, setUpgradePage] = useState<{ id: string; label: string } | null>(null);

  const requestUpgrade = useCallback((pageId: string, pageLabel: string) => {
    setUpgradePage({ id: pageId, label: pageLabel });
  }, []);

  const dismissUpgrade = useCallback(() => {
    setUpgradePage(null);
  }, []);

  return (
    <UpgradeContext.Provider value={{ requestUpgrade, dismissUpgrade }}>
      {children}
      <UpgradePromptModal
        page={upgradePage}
        onClose={dismissUpgrade}
      />
    </UpgradeContext.Provider>
  );
}

function UpgradePromptModal({ page, onClose }: { page: { id: string; label: string } | null; onClose: () => void }) {
  const navigate = useNavigate();
  if (!page) return null;

  const meta = PAGE_UPGRADE_FEATURES[page.id];
  if (!meta) return null;

  const planMeta = PLAN_META[meta.plan];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-lg p-0 shadow-2xl z-10 overflow-hidden" hover={false}>
        {/* Accent header */}
        <div className="px-6 pt-6 pb-4" style={{ backgroundColor: "rgba(241,80,37,0.04)" }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: FLAME }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-black" style={{ color: CARBON }}>
                  Unlock {page.label}
                </h2>
                <p className="text-[13px] text-muted-foreground">{meta.pitch}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-white/60">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-3.5 h-3.5" style={{ color: planMeta.color }} />
            <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: planMeta.color }}>
              Requires {planMeta.label} Plan
            </span>
          </div>
          <ul className="space-y-2.5">
            {meta.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: FLAME }} />
                <span className="text-[13px]" style={{ color: CARBON }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          <Btn variant="outline" full onClick={onClose}>
            Maybe Later
          </Btn>
          <Btn full onClick={() => { navigate("/pricing"); onClose(); }}>
            See Plans <ArrowRight className="w-4 h-4" />
          </Btn>
        </div>
      </Card>
    </div>
  );
}
