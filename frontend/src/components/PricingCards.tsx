import { CheckCircle2 } from "lucide-react";
import { FLAME, CARBON, DUST } from "../lib/constants";
import type { Plan } from "../data/types";

export function PricingCards({ onSelect, currentPlan }: { onSelect?: (p: Plan) => void; currentPlan?: Plan }) {
  const plans = [
    { id: "free" as Plan, name: "Free", price: "$0", desc: "Get started.", features: ["Basic career profile", "5 AI messages/mo", "1 resume review/mo", "10 job applications tracking"], cta: "Get Started", highlight: false },
    { id: "pro" as Plan, name: "Pro", price: "$29", desc: "For serious job seekers.", features: ["Unlimited AI coaching", "Advanced career insights", "Full roadmap generation", "Resume optimization", "Interview preparation", "Priority support"], cta: "Start Pro", highlight: true },
    { id: "premium" as Plan, name: "Premium", price: "$79", desc: "The full accelerator.", features: ["Everything in Pro", "AI Salary Negotiation Agent", "AI Mock Interviews (unlimited)", "Advanced analytics", "Personalized growth reports", "Expert sessions"], cta: "Go Premium", highlight: false },
  ];
  return (
    <div className="grid sm:grid-cols-3 gap-5">
      {plans.map(plan => (
        <div key={plan.id} className="relative rounded-2xl border-2 p-6 flex flex-col transition-all"
          style={{ borderColor: plan.highlight ? FLAME : DUST, backgroundColor: plan.highlight ? FLAME : "white" }}>
          {plan.highlight && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2"><span className="text-[11px] font-black px-3 py-1 rounded-full text-white" style={{ backgroundColor: CARBON }}>Most Popular</span></div>}
          <div className="mb-5">
            <p className="text-[12px] font-black uppercase tracking-widest mb-1" style={{ color: plan.highlight ? "rgba(255,255,255,0.7)" : "#6B6F6B" }}>{plan.name}</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black" style={{ color: plan.highlight ? "white" : CARBON }}>{plan.price}</span>
              <span className="text-[13px]" style={{ color: plan.highlight ? "rgba(255,255,255,0.6)" : "#6B6F6B" }}>/mo</span>
            </div>
          </div>
          <ul className="space-y-2.5 mb-6 flex-1">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : FLAME }} />
                <span className="text-[13px]" style={{ color: plan.highlight ? "rgba(255,255,255,0.9)" : CARBON }}>{f}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => onSelect?.(plan.id)}
            className="w-full py-2.5 rounded-xl text-[13px] font-black transition-all"
            style={{ backgroundColor: plan.highlight ? "white" : FLAME, color: plan.highlight ? FLAME : "white", opacity: currentPlan === plan.id ? 0.6 : 1 }}>
            {currentPlan === plan.id ? "Current Plan" : plan.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
