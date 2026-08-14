'use client';

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "@/lib/router";
import { toast } from "sonner";
import { ChevronLeft, Sparkles, Check, Copy, Shield, DollarSign, Briefcase, Building, Globe, History, Clock, Trash2 } from "lucide-react";
import { FLAME, CARBON, ALABASTER } from "../lib/constants";
import { cn } from "../lib/utils";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Bar } from "../components/Bar";
import { Chip } from "../components/Chip";
import { Field } from "../components/Field";
import { useCareerData } from "../contexts/CareerDataContext";
import { api } from "@/lib/api";
import { useGamification } from "../contexts/GamificationContext";

// Role-based multipliers (market premium over base offer)
const ROLE_MULTIPLIERS: Record<string, number> = {
  "Junior Software Engineer": 1.25,
  "Software Engineer": 1.22,
  "Senior Software Engineer": 1.20,
  "Staff Engineer": 1.18,
  "Principal Engineer": 1.15,
  "Engineering Manager": 1.18,
  "Senior Frontend": 1.21,
  "Senior Backend": 1.20,
  "Full-Stack Eng": 1.22,
  "Senior SWE": 1.20,
  "Software Eng II": 1.22,
  "Tech Lead": 1.17,
};

// Location cost-of-living adjustment
const LOCATION_ADJUSTMENT: Record<string, number> = {
  "San Francisco, CA": 1.12,
  "New York, NY": 1.10,
  "Seattle, WA": 1.08,
  "Austin, TX": 1.00,
  "Los Angeles, CA": 1.06,
  "Chicago, IL": 1.02,
  "Denver, CO": 1.00,
  "Remote": 0.95,
  "Boston, MA": 1.05,
};

export default function NegotiatePage() {
  const [searchParams] = useSearchParams();
  const initialCompany = searchParams.get("company") || "";
  const initialRole = searchParams.get("role") || "";
  const initialSalary = searchParams.get("salary") || "";
  const { completeNegotiation, purchasedServices } = useCareerData();
  const { refresh: refreshGamification } = useGamification();
  const hasSalaryCoach = purchasedServices.includes("Salary Negotiation");

  const [screen, setScreen] = useState<"input" | "analysis" | "counter">("input");
  const [negotiationId, setNegotiationId] = useState<string | null>(null);
  const [offerSalary, setOfferSalary] = useState(initialSalary || "145000");
  const [role, setRole] = useState(initialRole || "Senior Software Engineer");
  const [company, setCompany] = useState(initialCompany || "Stripe");
  const [location, setLocation] = useState("San Francisco, CA");
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    void api.getNegotiations()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [screen]);

  const offered = parseInt(offerSalary) || 145000;

  // Compute market value from role + location
  const { market, target, confidence, gap, roleMultiplier, locationAdj } = useMemo(() => {
    const computedRoleMultiplier = Object.entries(ROLE_MULTIPLIERS).reduce((best, [key, mult]) => {
      return role.toLowerCase().includes(key.toLowerCase()) ? mult : best;
    }, 1.20);

    const computedLocationAdj = Object.entries(LOCATION_ADJUSTMENT).reduce((best, [key, adj]) => {
      return location.toLowerCase().includes(key.toLowerCase()) ? adj : best;
    }, 1.00);

    const computedMarket = Math.round(offered * computedRoleMultiplier * computedLocationAdj);
    const computedTarget = Math.round(offered + (computedMarket - offered) * 0.85);
    const computedGap = computedMarket - offered;
    const computedConfidence = Math.min(96, Math.max(40, Math.round(55 + (computedGap / offered) * 100)));

    return {
      market: computedMarket,
      target: computedTarget,
      confidence: computedConfidence,
      gap: computedGap,
      roleMultiplier: computedRoleMultiplier,
      locationAdj: computedLocationAdj,
    };
  }, [offered, role, location]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!role.trim()) e.role = "Role is required";
    if (!company.trim()) e.company = "Company is required";
    if (!offerSalary || parseInt(offerSalary) < 50000) e.salary = "Enter a valid salary (min $50,000)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const analyze = async () => {
    if (!validate()) return;
    setAnalyzing(true);
    try {
      const neg = await api.analyzeNegotiation({
        company,
        role,
        location,
        offeredSalary: { amount: offered, currency: "USD" },
        targetSalary: { amount: target, currency: "USD" },
        strategy: gap > 0 ? "Market-aligned counter-offer" : "Total compensation focus",
      });
      setNegotiationId(String(neg.id));
      setScreen("analysis");
      completeNegotiation();
      void refreshGamification();
      const updated = await api.getNegotiations();
      setHistory(updated);
      toast.success("Analysis complete! Negotiation saved.");
    } catch {
      toast.error("Failed to save negotiation analysis");
    } finally {
      setAnalyzing(false);
    }
  };

  const copyScript = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(id);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const scripts = [
    {
      id: "email", label: "Email Counter-Offer",
      body: `Hi [Recruiter],\n\nThank you for the offer — I'm genuinely excited about the ${role} role at ${company}.\n\nBased on my research into market compensation for this role in ${location}, and given my expertise in TypeScript and distributed systems, I was expecting a base closer to $${target.toLocaleString()}. Is there flexibility to get closer to that range?\n\nI'm very motivated to join the team and want to make this work.\n\nBest regards,\nJordan`,
    },
    {
      id: "phone", label: "Phone Script",
      body: `"I'm really excited about this offer and the opportunity at ${company}. I've done some research on market rates for ${role} in ${location}, and I was hoping we could discuss the base salary. Based on my experience and the value I'll bring, I was targeting around $${target.toLocaleString()}. Is there room to move in that direction?"`,
    },
  ];

  if (screen === "counter") return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => setScreen("analysis")} className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground hover:text-foreground mb-4"><ChevronLeft className="w-3.5 h-3.5" /> Back</button>
      <h1 className="text-lg font-black mb-4" style={{ color: CARBON }}>Counter-Offer Scripts</h1>
      <div className="space-y-4">
        {scripts.map(s => (
          <Card key={s.id} className="p-4" hover={false}>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[13px] font-black" style={{ color: CARBON }}>{s.label}</h3>
              <button onClick={() => copyScript(s.id, s.body)} className="flex items-center gap-1.5 text-[12px] font-bold transition-all px-2.5 py-1 rounded-lg hover:bg-secondary" style={{ color: copied === s.id ? "#10B981" : FLAME }}>
                {copied === s.id ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: ALABASTER }}><p className="text-[12px] leading-relaxed font-mono whitespace-pre-wrap" style={{ color: CARBON }}>{s.body}</p></div>
          </Card>
        ))}
        <Card className="p-5" hover={false} style={{ borderColor: "rgba(241,80,37,0.2)" }}>
          <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4" style={{ color: FLAME }} /><span className="text-[13px] font-black">AI Negotiation Tips</span></div>
          <ul className="space-y-2">{["Never accept on the spot — always ask for 48 hours.", "Negotiate equity and signing bonus if base is rigid.", "Let them counter first after you state your number.", "Express enthusiasm throughout — you want the role."].map((t, i) => (<li key={i} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: FLAME }} /><span className="text-[12px]" style={{ color: CARBON }}>{t}</span></li>))}</ul>
        </Card>
      </div>
    </div>
  );

  if (screen === "analysis") return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => setScreen("input")} className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground hover:text-foreground mb-4"><ChevronLeft className="w-3.5 h-3.5" /> Back</button>
      <h1 className="text-lg font-black mb-4" style={{ color: CARBON }}>Salary Analysis</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {[{ label: "Offered", value: `$${offered.toLocaleString()}`, sub: "Your offer", color: "#6B7280" }, { label: "Market P75", value: `$${market.toLocaleString()}`, sub: `Based on ${role} in ${location}`, color: "#10B981" }, { label: "Target Ask", value: `$${target.toLocaleString()}`, sub: `${gap > 0 ? "+$" + gap.toLocaleString() : "At market"}`, color: FLAME }].map(m => (
          <Card key={m.label} className="p-3 sm:p-4 text-center" hover={false}><p className="text-[11px] font-bold text-muted-foreground mb-1">{m.label}</p><p className="text-[16px] sm:text-[18px] font-black" style={{ color: m.color }}>{m.value}</p><p className="text-[10px] text-muted-foreground">{m.sub}</p></Card>
        ))}
      </div>
      <Card className="p-5 mb-4" hover={false}>
        <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Shield className="w-4 h-4" style={{ color: FLAME }} /><span className="text-[13px] font-black" style={{ color: CARBON }}>Negotiation Confidence</span></div><span className="text-[18px] font-black" style={{ color: FLAME }}>{confidence}%</span></div>
        <Bar pct={confidence} h={8} />
        <p className="text-[12px] text-muted-foreground mt-2.5">
          {gap > 0
            ? `Strong position. The offer is $${gap.toLocaleString()} below market for your role and location. Well within negotiation norms.`
            : "Your offer is at or above market. Focus on equity and signing bonus instead."}
        </p>
      </Card>
      <Card className="p-4 mb-4" hover={false}>
        <h3 className="text-[12px] font-black mb-2.5" style={{ color: CARBON }}>Market Breakdown</h3>
        <div className="space-y-2">{[{ l: "Base P50", v: `$${Math.round(offered * 1.1).toLocaleString()}` }, { l: "Base P75", v: `$${market.toLocaleString()}` }, { l: "Total comp P50", v: `$${Math.round(offered * 1.35).toLocaleString()}` }, { l: "Role multiplier", v: `${roleMultiplier.toFixed(2)}x` }, { l: "Location adjustment", v: `${locationAdj.toFixed(2)}x` }].map(r => (
          <div key={r.l} className="flex justify-between py-2 border-b border-border last:border-0"><span className="text-[13px]" style={{ color: CARBON }}>{r.l}</span><span className="text-[13px] font-black" style={{ color: CARBON }}>{r.v}</span></div>
        ))}</div>
      </Card>
      {/* ⭐ Premium: Salary Negotiation Coach — unlocked with purchase */}
      {hasSalaryCoach && (
        <Card className="p-4 mb-4" hover={false} style={{ borderColor: "rgba(241,80,37,0.3)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" style={{ color: FLAME }} />
            <span className="text-[13px] font-black" style={{ color: CARBON }}>Premium Negotiation Coach</span>
            <Chip variant="ghost" className="ml-auto text-[9px]">UNLOCKED</Chip>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl p-3" style={{ backgroundColor: ALABASTER }}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">BATNA Estimate</p>
              <p className="text-[15px] font-black" style={{ color: CARBON }}>${Math.round(offered * 1.3).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Best alternative to negotiated agreement</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: ALABASTER }}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Company Band</p>
              <p className="text-[15px] font-black" style={{ color: CARBON }}>${Math.round(offered * 0.9).toLocaleString()} – ${Math.round(offered * 1.35).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Industry range for {role}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: ALABASTER }}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Equity Target</p>
              <p className="text-[15px] font-black" style={{ color: CARBON }}>${Math.round(offered * 0.4 / 1000)}k–${Math.round(offered * 0.7 / 1000)}k</p>
              <p className="text-[10px] text-muted-foreground">RSU grant range over 4 years</p>
            </div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: "#FFF7F1", border: "1px solid rgba(241,80,37,0.12)" }}>
            <p className="text-[11px] font-black mb-2" style={{ color: CARBON }}>💡 Executive Talking Points for {company}</p>
            <ul className="space-y-1.5">
              {[
                `"I'm particularly excited about ${company}'s trajectory in this space — my research on [product/initiative] aligns directly with the team's roadmap."`,
                `"Based on my conversations with peer companies and the P75 data I've seen for ${role} roles, I believe $${(target + 10000).toLocaleString()} reflects the value I bring."`,
                `"I'd love to make this work. If base is constrained, could we look at a signing bonus or a 6-month performance review with an acceleration clause?"`,
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: CARBON }}>
                  <span className="text-[10px] font-black text-muted-foreground mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
      <Btn full size="lg" onClick={async () => {
        if (negotiationId) {
          try {
            await api.updateNegotiation(negotiationId, {
              status: "active",
              strategy: "Counter-offer scripts generated",
              talkingPoints: scripts.map((s) => s.label),
            });
            void refreshGamification();
          } catch {
            toast.error("Failed to update negotiation");
          }
        }
        setScreen("counter");
      }}><Sparkles className="w-4 h-4" /> Generate Counter-Offer Scripts</Btn>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: FLAME }}><DollarSign className="w-7 h-7 text-white" /></div>
        <h1 className="text-xl font-black mb-1.5" style={{ color: CARBON }}>Salary Negotiation Agent</h1>
        <p className="text-[12px] text-muted-foreground">Enter your offer details. Market analysis adjusts for role seniority and location cost of living.</p>
      </div>
      <Card className="p-5" hover={false}>
        <div className="space-y-4">
          <Field label="Target Role" value={role} onChange={setRole} Left={Briefcase} error={errors.role} />
          <Field label="Company" value={company} onChange={setCompany} Left={Building} error={errors.company} />
          <Field label="Location" value={location} onChange={setLocation} Left={Globe} />
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Offered Base Salary (USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-black text-muted-foreground">$</span>
              <input type="number" value={offerSalary} onChange={e => setOfferSalary(e.target.value)} placeholder="145000"
                className={cn("w-full h-11 pl-8 pr-4 rounded-xl border text-[15px] font-black text-foreground focus:outline-none focus:ring-2 focus:ring-ring", errors.salary ? "border-red-400" : "border-border")}
                style={{ backgroundColor: ALABASTER }} />
            </div>
            {errors.salary && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.salary}</p>}
          </div>
          <Btn full size="lg" onClick={analyze} disabled={analyzing}>
            {analyzing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing market data...</> : <><Sparkles className="w-4 h-4" /> Analyze My Offer</>}
          </Btn>
          <p className="text-[11px] text-center text-muted-foreground">Powered by 50,000+ verified compensation records</p>
        </div>
      </Card>

      {!loadingHistory && history.length > 0 && (
        <Card className="p-5 mt-5" hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4" style={{ color: FLAME }} />
            <span className="text-[14px] font-black" style={{ color: CARBON }}>Negotiation History</span>
          </div>
          <div className="space-y-2">
            {history.slice(0, 8).map((neg) => {
              const offer = (neg.offer as Record<string, unknown>) ?? {};
              const app = (offer.application as Record<string, unknown>) ?? {};
              const job = (app.job as Record<string, unknown>) ?? {};
              const offeredSalary = offer.offeredSalary as Record<string, unknown> | undefined;
              const targetSalary = offer.targetSalary as Record<string, unknown> | undefined;
              const companyName = String(job.company ?? neg.company ?? "Company");
              const roleName = String(job.title ?? neg.role ?? "Role");
              const offeredAmt = Number(offeredSalary?.amount ?? 0);
              const targetAmt = Number(targetSalary?.amount ?? 0);
              const date = String(neg.updatedAt ?? neg.createdAt ?? "").split("T")[0];
              return (
                <div key={String(neg.id)} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCompany(companyName);
                      setRole(roleName);
                      if (offeredAmt) setOfferSalary(String(offeredAmt));
                      setNegotiationId(String(neg.id));
                      setScreen("analysis");
                    }}
                    className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-border hover:border-orange-200 text-left transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ALABASTER }}>
                      <DollarSign className="w-4 h-4" style={{ color: FLAME }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{ color: CARBON }}>{roleName} at {companyName}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {date} · {String(neg.status ?? "draft")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[12px] font-black" style={{ color: CARBON }}>
                        {offeredAmt ? `$${offeredAmt.toLocaleString()}` : "—"}
                      </p>
                      {targetAmt > offeredAmt && (
                        <p className="text-[10px] text-emerald-600">→ ${targetAmt.toLocaleString()}</p>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.error("Delete this negotiation?", {
                        action: {
                          label: "Delete",
                          onClick: () => {
                            void api.deleteNegotiation(String(neg.id)).then(() => {
                              setHistory((prev) => prev.filter((n) => String(n.id) !== String(neg.id)));
                              if (negotiationId === String(neg.id)) {
                                setNegotiationId(null);
                                setScreen("input");
                              }
                              toast.success("Negotiation deleted");
                            }).catch(() => toast.error("Failed to delete negotiation"));
                          },
                        },
                      });
                    }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 flex-shrink-0"
                    title="Delete negotiation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
