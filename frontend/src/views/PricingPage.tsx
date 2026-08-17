'use client';

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "@/lib/router";
import { toast } from "sonner";
import {
  CheckCircle2, Sparkles, ArrowLeft, ArrowRight, ChevronDown, ShieldCheck, CreditCard, Clock, Menu, X
} from "lucide-react";
import { cn } from "../lib/utils";
import { FLAME, CARBON, ALABASTER, DUST } from "../lib/constants";
import { Btn } from "../components/Btn";
import { BrandLogo } from "../components/BrandLogo";
import { UserAvatar } from "../components/UserAvatar";
import { useAuth } from "../contexts/AuthContext";
import { FAQS } from "../data/initial-data";
import type { Plan } from "../data/types";
import { PublicShell } from "@/components/PublicShell";

/* ─── Nav ─────────────────────────────────────── */
function PricingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { authed, planLabel, plan, user, profile } = useAuth();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className={cn("fixed top-0 inset-x-0 z-50 transition-all duration-300", scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent")}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-black/5"
            style={{ color: CARBON }}
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5" style={{ backgroundColor: DUST }} />
          <BrandLogo compact />
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Services", "Blog"].map(item => (
            <button key={item} onClick={() => { if (item === "Blog") window.open("https://blog.pathforge.dev", "_blank"); else { navigate("/" + (item === "Features" ? "#features" : "#services")); } }} className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors">{item}</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {authed ? (
            <button onClick={() => navigate("/app/dashboard")} className="flex items-center gap-2.5 group">
              <div className="hidden md:block text-right">
                <p className="text-[12px] font-bold leading-tight" style={{ color: CARBON }}>{user?.name || user?.email?.split('@')[0]}</p>
                <p className="text-[10px] font-medium text-muted-foreground leading-tight">{planLabel} Plan</p>
              </div>
              <UserAvatar src={profile?.avatarUrl} name={user?.name || user?.email} size="sm" />
            </button>
          ) : (
            <>
              <Btn variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden md:flex">Sign In</Btn>
              <Btn size="sm" onClick={() => navigate("/register")}>Get Started Free <ArrowRight className="w-3.5 h-3.5" /></Btn>
            </>
          )}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: CARBON }}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-5 py-4 space-y-3">
          {["Features", "Pricing", "Services"].map(item => (
            <button key={item} onClick={() => { navigate(item === "Features" ? "/#features" : item === "Services" ? "/#services" : "/pricing"); setMobileOpen(false); }} className="block w-full text-left text-[14px] font-semibold py-2" style={{ color: CARBON }}>{item}</button>
          ))}
          {authed ? (
            <button onClick={() => navigate("/app/dashboard")} className="flex items-center gap-3 w-full py-2">
              <UserAvatar src={profile?.avatarUrl} name={user?.name || user?.email} size="sm" />
              <div className="text-left">
                <p className="text-[13px] font-bold" style={{ color: CARBON }}>{user?.name || user?.email?.split('@')[0]}</p>
                <p className="text-[11px] text-muted-foreground">{planLabel} Plan</p>
              </div>
            </button>
          ) : (
            <Btn size="sm" full onClick={() => navigate("/register")}>Get Started Free</Btn>
          )}
        </div>
      )}
    </nav>
  );
}

/* ─── Plan card ────────────────────────────────── */
const PLANS: { id: Plan; name: string; price: string; desc: string; features: string[]; cta: string; highlight: boolean }[] = [
  { id: "free", name: "Free", price: "$0", desc: "Get started with the basics.", features: ["Basic career profile", "5 AI messages/mo", "1 resume review/mo", "10 job applications tracking"], cta: "Get Started", highlight: false },
  { id: "pro", name: "Pro", price: "$29", desc: "For serious job seekers.", features: ["Unlimited AI coaching", "Advanced career insights", "Full roadmap generation", "Resume optimization", "Interview preparation", "Priority support"], cta: "Upgrade to Pro", highlight: true },
  { id: "premium", name: "Premium", price: "$79", desc: "The full accelerator.", features: ["Everything in Pro", "AI Salary Negotiation Agent", "AI Mock Interviews (unlimited)", "Advanced analytics", "Expert sessions"], cta: "Go Premium", highlight: false },
] as const;

/* ─── Main page ────────────────────────────────── */
export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { plan: currentPlan, setPlan, cancelPlan, authed } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const isUpgradePrompt = searchParams.get("upgrade") === "true";

  const handlePlanAction = (plan: Plan) => {
    if (!authed) {
      navigate("/login");
      return;
    }
    if (plan === currentPlan) return;

    if (plan === "free" && currentPlan !== "free") {
      toast(`Downgrade to Free?`, {
        description: 'You will lose access to premium features immediately.',
        action: {
          label: 'Confirm downgrade',
          onClick: () => {
            setLoading(plan);
            void cancelPlan()
              .then(() => navigate("/app/settings"))
              .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to cancel plan'))
              .finally(() => setLoading(null));
          },
        },
      });
      return;
    }

    setLoading(plan);
    void setPlan(plan)
      .then(() => {
        toast.success(`Upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan! Welcome to the next level. 🚀`);
        navigate("/app/dashboard");
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to update plan'))
      .finally(() => setLoading(null));
  };

  return (
    <PublicShell className="bg-white">
      <PricingNav />

      {/* ── Upgrade banner ── */}
      {isUpgradePrompt && (
        <div className="pt-24 px-6 md:px-8 max-w-6xl mx-auto">
          <div className="p-4 rounded-2xl border-2 flex items-center gap-3" style={{ borderColor: FLAME, backgroundColor: "rgba(241,80,37,0.05)" }}>
            <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: FLAME }} />
            <p className="text-[13px] font-bold" style={{ color: CARBON }}>
              This feature requires a higher plan. Choose an upgrade below to unlock it.
            </p>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 px-6 md:px-8 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `linear-gradient(${CARBON} 1px, transparent 1px), linear-gradient(90deg, ${CARBON} 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[130px] opacity-10 pointer-events-none" style={{ backgroundColor: FLAME }} />
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: FLAME }} />
            <span className="text-[12px] font-semibold" style={{ color: CARBON }}>Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-[1.08] tracking-[-0.03em]" style={{ color: CARBON }}>
            Invest in your<br /><span style={{ color: FLAME }}>career growth</span>
          </h1>
          <p className="text-[16px] md:text-lg text-muted-foreground mb-0 max-w-xl mx-auto leading-relaxed">
            Engineers on our platform earn an average of <strong style={{ color: CARBON }}>$28k more</strong>. Start free, upgrade when you need more.
          </p>
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <section className="px-6 md:px-8 pb-16 -mt-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map(plan => {
              const isCurrent = currentPlan === plan.id;
              const isLoading = loading === plan.id;
              const isDowngrade = plan.id === "free" && currentPlan !== "free";
              const ctaLabel = isCurrent
                ? "Current Plan"
                : isDowngrade
                  ? "Downgrade to Free"
                  : plan.cta;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl border-2 p-6 flex flex-col transition-all duration-300",
                    plan.highlight
                      ? "scale-[1.02] md:scale-105 z-10 shadow-xl"
                      : "shadow-sm hover:shadow-md",
                  )}
                  style={{
                    borderColor: plan.highlight ? FLAME : DUST,
                    backgroundColor: plan.highlight ? FLAME : "white",
                    transform: plan.highlight ? undefined : undefined,
                  }}
                >
                  {/* Most Popular badge */}
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                      <span className="text-[11px] font-black px-3.5 py-1 rounded-full text-white shadow-md" style={{ backgroundColor: CARBON }}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Active badge */}
                  {isCurrent && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-white/90 px-2 py-0.5 rounded-full border border-emerald-300 shadow-sm">
                        Active
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-5">
                    <p className="text-[12px] font-black uppercase tracking-[0.15em] mb-1.5"
                      style={{ color: plan.highlight ? "rgba(255,255,255,0.75)" : "#6B6F6B" }}>
                      {plan.name}
                    </p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-black" style={{ color: plan.highlight ? "white" : CARBON }}>{plan.price}</span>
                      <span className="text-[13px]" style={{ color: plan.highlight ? "rgba(255,255,255,0.6)" : "#6B6F6B" }}>/mo</span>
                    </div>
                    <p className="text-[13px]" style={{ color: plan.highlight ? "rgba(255,255,255,0.7)" : "#6B6F6B" }}>{plan.desc}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : FLAME }} />
                        <span className="text-[13px] leading-snug"
                          style={{ color: plan.highlight ? "rgba(255,255,255,0.92)" : CARBON }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handlePlanAction(plan.id)}
                    disabled={isCurrent || isLoading}
                    className="w-full py-2.5 rounded-xl text-[13px] font-black transition-all inline-flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: plan.highlight ? "white" : FLAME,
                      color: plan.highlight ? FLAME : "white",
                      opacity: isCurrent ? 0.6 : 1,
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : (
                      <span className="flex items-center gap-1.5">
                        {ctaLabel}
                        {!isDowngrade && <ArrowRight className="w-3.5 h-3.5" />}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Trust strip */}
          <div className="mt-6 p-5 rounded-2xl text-center border-2 border-dashed" style={{ borderColor: DUST, backgroundColor: ALABASTER }}>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                { icon: Clock, label: "14-day free trial" },
                { icon: CreditCard, label: "No credit card required" },
                { icon: ShieldCheck, label: "Cancel anytime" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "#6B6F6B" }}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>
            <p className="text-[11px] mt-3" style={{ color: "#9CA3AF" }}>
              GDPR compliant · SOC 2 certified · Trusted by engineers everywhere
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 md:px-8" style={{ backgroundColor: ALABASTER }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[12px] font-black uppercase tracking-widest" style={{ color: FLAME }}>FAQ</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3" style={{ color: CARBON }}>Common questions</h2>
            <p className="text-[14px] text-muted-foreground">Everything you need to know about our plans.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  <span className="text-[14px] font-bold pr-4" style={{ color: CARBON }}>{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 flex-shrink-0 transition-transform", faqOpen === i && "rotate-180")} style={{ color: "#6B6F6B" }} />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-4 text-[13px] leading-relaxed border-t border-border pt-3 text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 md:px-8 text-center" style={{ backgroundColor: FLAME }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Ready to accelerate?</h2>
          <p className="text-[15px] text-white/80 mb-8 leading-relaxed">
            Join thousands of engineers growing faster, landing better roles, and earning more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="bg-white px-8 py-3.5 rounded-xl text-[14px] font-black hover:opacity-90 transition-all inline-flex items-center gap-2"
              style={{ color: FLAME }}
            >
              Start Free Today <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="border-2 border-white/40 text-white px-8 py-3.5 rounded-xl text-[14px] font-bold hover:bg-white/10 transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-16 px-6 md:px-8" style={{ backgroundColor: CARBON }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="mb-4"><BrandLogo light /></div>
              <p className="text-[12px] leading-relaxed" style={{ color: DUST }}>The AI career platform for ambitious engineers.</p>
            </div>
            {[
              { title: "Product", links: [{ name: "Dashboard", to: "/app/dashboard" }, { name: "AI Coach", to: "/app/coach" }, { name: "Mock Interviews", to: "/app/interview" }, { name: "Job Tracker", to: "/app/tracker" }] },
              { title: "Services", links: [{ name: "Resume Review", to: "/app/services" }, { name: "CV Rewrite", to: "/app/services" }, { name: "LinkedIn Opt.", to: "/app/services" }, { name: "Salary Coach", to: "/app/negotiate" }] },
              { title: "Company", links: [{ name: "About", to: "/" }, { name: "Blog", to: "/blog" }, { name: "Careers", to: "/careers" }, { name: "Help", to: "/help" }] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-[12px] font-black uppercase tracking-widest mb-4 text-white/50">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link.name}>
                      <button onClick={() => { if (link.to.startsWith("http")) window.open(link.to, "_blank"); else navigate(link.to); }} className="text-[13px] hover:text-white transition-colors text-left" style={{ color: DUST }}>{link.name}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(230,232,230,0.08)" }}>
            <p className="text-[12px]" style={{ color: DUST }}>© 2025 PathForge. All rights reserved.</p>
            <div className="flex gap-5">
              {[
                { label: "Privacy", to: "/privacy" },
                { label: "Terms", to: "/terms" },
                { label: "Cookies", to: "/privacy" },
              ].map(({ label, to }) => (
                <button key={label} onClick={() => navigate(to)} className="text-[12px] hover:text-white transition-colors" style={{ color: DUST }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </PublicShell>
  );
}
