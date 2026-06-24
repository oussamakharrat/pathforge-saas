'use client';

import { useState } from "react";
import { Check, TrendingUp, Layers, FileText, Edit3, Map, DollarSign, Mic } from "lucide-react";
import { FLAME, ALABASTER, CARBON } from "../lib/constants";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { PageHeader } from "../components/PageHeader";
import { SERVICES_LIST } from "../data/initial-data";
import { useCareerData } from "../contexts/CareerDataContext";

const SERVICE_ICONS: Record<string, React.ElementType> = {
  "Resume Review": FileText,
  "CV Full Rewrite": Edit3,
  "LinkedIn Optimization": Layers,
  "Career Roadmap": Map,
  "Salary Negotiation": DollarSign,
  "Interview Coaching": Mic,
};

const SERVICE_IMPACTS: Record<string, string> = {
  "Resume Review": "Boosts all skills +3%, improves ATS score",
  "CV Full Rewrite": "Boosts all skills +6%, professional transformation",
  "LinkedIn Optimization": "Unlocks LinkedIn section in Settings with keyword data",
  "Career Roadmap": "Adds 4 quarterly roadmap steps to your Learning Plan",
  "Salary Negotiation": "Unlocks premium market data in Negotiate page",
  "Interview Coaching": "Unlocks premium questions in Mock Interview page",
};

export default function ServicesPage() {
  const { purchasedServices, purchaseService } = useCareerData();
  const [loading, setLoading] = useState<string | null>(null);

  const handleBuy = (name: string) => {
    setLoading(name);
    setTimeout(() => {
      setLoading(null);
      purchaseService(name);
    }, 1500);
  };

  return (
    <div>
      <PageHeader
        title="Expert career services"
        subtitle="AI-powered, expert-reviewed services. Personalized to your profile."
        action={<span className="text-[12px] font-black uppercase tracking-widest" style={{ color: FLAME }}>Premium Services</span>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES_LIST.map((svc, i) => {
          const Icon = SERVICE_ICONS[svc.name] || svc.icon;
          const bought = purchasedServices.includes(svc.name);
          const isLoading = loading === svc.name;
          const impact = SERVICE_IMPACTS[svc.name];
          return (
            <Card key={i} className="p-6 flex flex-col relative overflow-hidden" hover={false}>
              {/* Purchased ribbon */}
              {bought && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-sm">
                    <Check className="w-3 h-3" /> Active
                  </span>
                </div>
              )}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: ALABASTER }}>
                <Icon className="w-5 h-5" style={{ color: FLAME }} />
              </div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-[15px] font-black" style={{ color: CARBON }}>{svc.name}</h3>
                <span className="text-[16px] font-black ml-2" style={{ color: bought ? "#10B981" : FLAME }}>{bought ? "Owned" : svc.price}</span>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 flex-1">{svc.desc}</p>
              {/* Impact preview */}
              {impact && !bought && (
                <div className="flex items-start gap-1.5 mb-3 px-3 py-2 rounded-xl bg-primary/[0.04] border border-primary/10">
                  <TrendingUp className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: FLAME }} />
                  <span className="text-[10px] leading-snug text-muted-foreground">{impact}</span>
                </div>
              )}
              {/* Active impact badge */}
              {bought && impact && (
                <div className="flex items-start gap-1.5 mb-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" />
                  <span className="text-[10px] leading-snug text-emerald-700 font-medium">{impact} ✅</span>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 mb-4">{svc.tags.map(tag => <Chip key={tag} variant="ghost">{tag}</Chip>)}</div>
              <button onClick={() => !bought && handleBuy(svc.name)} disabled={bought || isLoading}
                className="w-full py-2.5 rounded-xl text-[13px] font-black transition-all text-white disabled:opacity-70"
                style={{ backgroundColor: bought ? "#10B981" : FLAME }}>
                {isLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span> :
                  bought ? <span className="flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> Active — Impact Applied</span> : `Get for ${svc.price}`}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
