'use client';

import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router";
import {
  ArrowRight, PlayCircle, LayoutDashboard, Target, Zap, BookOpen, MessageSquare,
  Brain, Map, BarChart2, FileText, Mic, DollarSign, Sparkles,
  ChevronDown, Menu, X, Quote
} from "lucide-react";
import { cn } from "../lib/utils";
import { AnimatedView } from '@/components/AnimatedView';
import { FLAME, CARBON, ALABASTER, DUST } from "../lib/constants";
import { Btn } from "../components/Btn";
import { Card } from "../components/Card";
import { SectionTitle } from "../components/SectionTitle";
import { PricingCards } from "../components/PricingCards";
import { BrandLogo } from "../components/BrandLogo";
import { TESTIMONIALS, FAQS } from "../data/initial-data";
import { useAuth } from "../contexts/AuthContext";
import { UserAvatar } from "../components/UserAvatar";

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function LandingNav({ onGetStarted }: { onGetStarted: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { authed, isLoading, user, profile } = useAuth();

  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "User";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleNavClick = (item: string) => {
    if (item === "Blog") {
      window.open("https://blog.pathforge.dev", "_blank");
    } else {
      scrollToSection(item.toLowerCase());
    }
  };

  return (
    <nav className={cn("fixed top-0 inset-x-0 z-50 transition-all duration-300", scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent")}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5"><BrandLogo compact /></div>
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "Services", "Blog"].map(item => (
            <button key={item} onClick={() => handleNavClick(item)} className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors">{item}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {!isLoading && authed ? (
            <button
              type="button"
              onClick={() => navigate("/app/dashboard")}
              className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-white/80 px-3 py-1.5 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50/50"
            >
              <UserAvatar src={profile?.avatarUrl} name={displayName} size="sm" />
              <span className="text-[13px] font-semibold max-w-[140px] truncate" style={{ color: CARBON }}>
                {displayName}
              </span>
            </button>
          ) : !isLoading ? (
            <Btn variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden md:flex">
              Sign In
            </Btn>
          ) : null}
          <Btn size="sm" onClick={onGetStarted}>
            {authed ? "Go to App" : "Get Started Free"} <ArrowRight className="w-3.5 h-3.5" />
          </Btn>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: CARBON }}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-5 py-4 space-y-3">
          {["Features", "Pricing", "Services"].map(item => (
            <button key={item} onClick={() => { handleNavClick(item); setMobileOpen(false); }} className="block w-full text-left text-[14px] font-semibold py-2" style={{ color: CARBON }}>{item}</button>
          ))}
          {!isLoading && authed ? (
            <button
              type="button"
              onClick={() => { navigate("/app/dashboard"); setMobileOpen(false); }}
              className="flex w-full items-center gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <UserAvatar src={profile?.avatarUrl} name={displayName} size="sm" />
              <span className="text-[14px] font-semibold truncate" style={{ color: CARBON }}>{displayName}</span>
            </button>
          ) : !isLoading ? (
            <Btn variant="ghost" size="sm" full onClick={() => { navigate("/login"); setMobileOpen(false); }}>
              Sign In
            </Btn>
          ) : null}
          <Btn size="sm" full onClick={() => { onGetStarted(); setMobileOpen(false); }}>
            {authed ? "Go to App" : "Get Started Free"}
          </Btn>
        </div>
      )}
    </nav>
  );
}

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const navigate = useNavigate();
  const { authed, isLoading } = useAuth();

  const handleGetStarted = () => {
    if (isLoading) return;
    navigate(authed ? "/app/dashboard" : "/login");
  };

  return (
    <AnimatedView className="bg-white">
      <LandingNav onGetStarted={handleGetStarted} />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center pt-24 pb-20 px-6 md:px-8 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `linear-gradient(${CARBON} 1px, transparent 1px), linear-gradient(90deg, ${CARBON} 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[130px] opacity-10 pointer-events-none" style={{ backgroundColor: FLAME }} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" style={{ color: FLAME }} />
            <span className="text-[12px] font-semibold" style={{ color: CARBON }}>Your AI-powered Career Operating System</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-[-0.03em]" style={{ color: CARBON }}>
            From Skill Gaps<br /><span style={{ color: FLAME }}>to Job Offers.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered career intelligence, personalized roadmaps, skill gap analysis, interview prep, and salary negotiation — built for ambitious engineers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Btn size="lg" onClick={handleGetStarted} className="shadow-xl" style={{ boxShadow: "0 8px 32px rgba(241,80,37,0.35)" }}>
              Start Free <ArrowRight className="w-4 h-4" />
            </Btn>
            <Btn variant="outline" size="lg" onClick={() => navigate("/login")}><PlayCircle className="w-4 h-4" /> Explore App</Btn>
          </div>

          {/* Product mockup */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-border mx-auto" style={{ backgroundColor: ALABASTER }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-white">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
              <div className="flex-1 h-5 rounded-md mx-4" style={{ backgroundColor: ALABASTER }} />
            </div>
            <div className="flex" style={{ minHeight: 300 }}>
              <div className="w-12 border-r border-border flex flex-col items-center gap-3 py-4" style={{ backgroundColor: CARBON }}>
                {[LayoutDashboard, Target, Zap, BookOpen, MessageSquare].map((Icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: i === 0 ? FLAME : "transparent" }}>
                    <Icon className="w-4 h-4" style={{ color: i === 0 ? "white" : "rgba(255,255,255,0.25)" }} />
                  </div>
                ))}
              </div>
              <div className="flex-1 p-5 grid grid-cols-3 gap-3">
                <div className="col-span-1 bg-white rounded-xl border border-border p-4 flex flex-col items-center">
                  <p className="text-[11px] text-muted-foreground mb-2 font-bold">Career Score</p>
                  <div className="relative w-16 h-16 mb-2">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" style={{ stroke: ALABASTER }} />
                      <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" strokeLinecap="round" style={{ stroke: FLAME }} strokeDasharray={`${62 * 1.63} 163`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center"><span className="text-[13px] font-black" style={{ color: FLAME }}>62</span></div>
                  </div>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  {[{ l: "Job Match", v: "94%", c: "#10B981" }, { l: "Streak", v: "7d 🔥", c: FLAME }, { l: "Skills", v: "10", c: CARBON }, { l: "Applications", v: "8", c: CARBON }].map(m => (
                    <div key={m.l} className="bg-white rounded-xl border border-border p-3"><p className="text-[10px] text-muted-foreground">{m.l}</p><p className="text-base font-black" style={{ color: m.c }}>{m.v}</p></div>
                  ))}
                </div>
                <div className="col-span-3 bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2"><div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: FLAME }}><Sparkles className="w-2.5 h-2.5 text-white" /></div><span className="text-[11px] font-bold" style={{ color: CARBON }}>AI Career Coach</span><span className="ml-auto text-[10px] text-emerald-500 font-bold">● Online</span></div>
                  <p className="text-[11px] text-muted-foreground">Docker & Kubernetes are blocking 3 of your top matches. A 2-week sprint unlocks Senior roles at Vercel and Linear...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-14 border-y border-border" style={{ backgroundColor: ALABASTER }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
          <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground mb-8">Engineers from these companies landed their next role with us</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {["Vercel", "Stripe", "Linear", "Notion", "Figma", "Ramp", "Loom", "Planetscale"].map(c => (
              <span key={c} className="text-[15px] font-black tracking-tight opacity-30 hover:opacity-60 transition-opacity cursor-default" style={{ color: CARBON }}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionTitle label="What's inside" title="Everything you need to grow" subtitle="A clear workflow for planning, applying, and improving your career." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Brain, title: "AI Career Coach", desc: "24/7 personalized coaching that knows your goals, skills, and gaps — not generic advice." },
              { icon: Map, title: "Smart Roadmaps", desc: "Step-by-step learning plans tailored to your exact target role and timeline." },
              { icon: BarChart2, title: "Skill Gap Analysis", desc: "Compare your skills against thousands of job descriptions to know exactly what to build." },
              { icon: FileText, title: "Resume Intelligence", desc: "AI-powered resume scoring, rewriting, and ATS optimization that gets you past filters." },
              { icon: Mic, title: "Mock Interviews", desc: "Realistic AI interviewers for behavioral, technical, and system design rounds." },
              { icon: DollarSign, title: "Salary Negotiation", desc: "AI agent trained on 50k+ offers to help you earn what you're worth." },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <Card key={i} className="p-6" hover={false}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: ALABASTER }}><Icon className="w-5 h-5" style={{ color: FLAME }} /></div>
                  <h3 className="text-[15px] font-black mb-2" style={{ color: CARBON }}>{f.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 md:px-8" style={{ backgroundColor: ALABASTER }}>
        <div className="max-w-7xl mx-auto">
          <SectionTitle label="Pricing" title="Simple, transparent pricing" subtitle="Choose the plan that matches your current stage." />
          <PricingCards onSelect={handleGetStarted} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionTitle label="Real Results" title="Stories from our community" />
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="p-6" hover={false}>
                <Quote className="w-8 h-8 mb-4 opacity-15" style={{ color: FLAME }} />
                <p className="text-[14px] leading-relaxed mb-6 font-semibold" style={{ color: CARBON }}>&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0" style={{ backgroundColor: t.comp }}>{t.avatar}</div>
                  <div><p className="text-[13px] font-black" style={{ color: CARBON }}>{t.name}</p><p className="text-[12px] font-bold" style={{ color: FLAME }}>{t.role}</p></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="services" className="py-24 px-6 md:px-8" style={{ backgroundColor: ALABASTER }}>
        <div className="max-w-5xl mx-auto">
          <SectionTitle label="FAQ" title="Common questions" />
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Card key={i} className="overflow-hidden" hover={false}>
                <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  <span className="text-[14px] font-bold pr-4" style={{ color: CARBON }}>{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform", faqOpen === i && "rotate-180")} />
                </button>
                {faqOpen === i && <div className="px-5 pb-4 text-[13px] text-muted-foreground leading-relaxed border-t border-border pt-3">{faq.a}</div>}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-8 text-center" style={{ backgroundColor: FLAME }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">Ready to accelerate?</h2>
          <p className="text-[16px] text-white/80 mb-10 leading-relaxed">Join thousands of engineers growing faster, landing better roles, and earning more.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleGetStarted} className="bg-white px-8 py-3.5 rounded-xl text-[14px] font-black hover:opacity-90 transition-all inline-flex items-center gap-2" style={{ color: FLAME }}>
              Start Free Today <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/pricing")} className="border-2 border-white/40 text-white px-8 py-3.5 rounded-xl text-[14px] font-bold hover:bg-white/10 transition-all">See All Plans</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-8" style={{ backgroundColor: CARBON }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="mb-4"><BrandLogo light /></div>
              <p className="text-[12px] leading-relaxed" style={{ color: DUST }}>The AI career platform for ambitious engineers.</p>
            </div>
            {[{ title: "Product", links: [{ name: "Dashboard", to: "/app/dashboard" }, { name: "AI Coach", to: "/app/coach" }, { name: "Mock Interviews", to: "/app/interview" }, { name: "Job Tracker", to: "/app/tracker" }] }, { title: "Services", links: [{ name: "Resume Review", to: "/app/services" }, { name: "CV Rewrite", to: "/app/services" }, { name: "LinkedIn Opt.", to: "/app/services" }, { name: "Salary Coach", to: "/app/negotiate" }] }, { title: "Company", links: [{ name: "About", to: "/" }, { name: "Blog", to: "/blog" }, { name: "Careers", to: "/careers" }, { name: "Help", to: "/help" }] }].map(col => (
              <div key={col.title}>
                <p className="text-[12px] font-black uppercase tracking-widest mb-4 text-white/50">{col.title}</p>
                <ul className="space-y-2">{col.links.map(link => <li key={link.name}><button onClick={() => { if (link.to.startsWith("http")) window.open(link.to, "_blank"); else navigate(link.to); }} className="text-[13px] hover:text-white transition-colors text-left" style={{ color: DUST }}>{link.name}</button></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(230,232,230,0.08)" }}>
            <p className="text-[12px]" style={{ color: DUST }}>© 2025 PathForge. All rights reserved.</p>
<div className="flex gap-5">{["Privacy", "Terms"].map(l => { const path = l === "Privacy" ? "/privacy" : "/terms"; return <button key={l} onClick={() => navigate(path)} className="text-[12px] hover:text-white transition-colors" style={{ color: DUST }}>{l}</button>; })}<button onClick={() => navigate("/blog")} className="text-[12px] hover:text-white transition-colors" style={{ color: DUST }}>Blog</button></div>
          </div>
        </div>
      </footer>
    </AnimatedView>
  );
}
