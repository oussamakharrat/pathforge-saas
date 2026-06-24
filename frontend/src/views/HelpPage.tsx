'use client';

import { useState } from "react";
import { useNavigate } from "@/lib/router";
import { HelpCircle, Search, ChevronDown, BookOpen, MessageSquare, FileText, LifeBuoy, ExternalLink, ArrowRight, Sparkles, Users, Award, Mail } from "lucide-react";
import { FLAME, CARBON, ALABASTER, DUST } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { BrandLogo } from "../components/BrandLogo";

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  popular: boolean;
}

const ARTICLES: HelpArticle[] = [
  { id: "getting-started", title: "Getting Started with CareerGrowth", category: "Basics", excerpt: "Create your account, set your first goal, and explore the dashboard.", popular: true },
  { id: "goals", title: "Setting & Managing Career Goals", category: "Goals", excerpt: "How to create meaningful goals, track progress, and adjust deadlines.", popular: true },
  { id: "skills", title: "Skill Assessment & Tracking", category: "Skills", excerpt: "Add skills, take quizzes, and watch your proficiency grow.", popular: false },
  { id: "resume", title: "Resume Analysis & Optimization", category: "Resume", excerpt: "Upload your resume, get AI feedback, and improve your ATS score.", popular: true },
  { id: "learning", title: "Your Personalized Learning Plan", category: "Learning", excerpt: "How the AI generates your roadmap and how to complete steps.", popular: false },
  { id: "coach", title: "AI Coach: Tips & Best Practices", category: "Coach", excerpt: "Get the most out of your AI career coach with great prompts.", popular: true },
  { id: "interview", title: "Mock Interview Guide", category: "Interview", excerpt: "Types of interviews, scoring rubric, and how to prepare.", popular: false },
  { id: "negotiation", title: "Salary Negotiation Playbook", category: "Negotiation", excerpt: "How to use the negotiation agent and interpret market data.", popular: false },
  { id: "tracker", title: "Job Application Tracker", category: "Tracker", excerpt: "Track applications, manage Kanban boards, and follow up.", popular: false },
  { id: "plans", title: "Plans, Billing & Upgrades", category: "Account", excerpt: "Compare Free vs Pro vs Premium. Manage your subscription.", popular: true },
  { id: "privacy", title: "Data Privacy & Security", category: "Account", excerpt: "How we protect your data. Export and delete options.", popular: false },
  { id: "community", title: "Community & Forum Guidelines", category: "Community", excerpt: "Rules for engaging with other engineers in the community.", popular: false },
];

const CATEGORIES = ["All", "Basics", "Goals", "Skills", "Resume", "Learning", "Coach", "Interview", "Negotiation", "Tracker", "Account", "Community"];

export default function HelpPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [faqOpen, setFaqOpen] = useState<string | null>(null);

  const filtered = ARTICLES.filter(a => {
    const catMatch = category === "All" || a.category === category;
    const searchMatch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const popular = ARTICLES.filter(a => a.popular);

  const faqs = [
    { q: "Is my data secure?", a: "Yes. All data is encrypted at rest and in transit. You own your data and can export or delete it anytime from Settings." },
    { q: "Can I change my plan later?", a: "Absolutely. You can upgrade or downgrade anytime from Settings → Billing. Changes apply immediately." },
    { q: "How does the AI Coach work?", a: "The coach analyzes your goals, skills, and activity to give personalized advice. Ask career questions, get roadmap suggestions, or practice interview answers." },
    { q: "What if I need help with something specific?", a: "Email us at hello@careergrowth.dev or use the chat bubble in the bottom-right corner. We typically respond within 4 hours." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="text-[12px] font-bold hover:underline" style={{ color: CARBON }}>Sign in</button>
            <Btn size="sm" onClick={() => navigate("/register")}>Get Started</Btn>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(241,80,37,0.1)" }}>
            <LifeBuoy className="w-7 h-7" style={{ color: FLAME }} />
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color: CARBON }}>Help Center</h1>
          <p className="text-[14px] text-muted-foreground mb-6">Search our guides, FAQs, and documentation.</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search help articles..." autoFocus
              className="w-full h-12 pl-11 pr-4 rounded-2xl border border-border text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
              style={{ backgroundColor: ALABASTER }} />
          </div>
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          {[
            { icon: BookOpen, label: "Getting Started", desc: "New here? Start here.", color: FLAME },
            { icon: MessageSquare, label: "AI Coach Guide", desc: "Master the coach.", color: "#8B5CF6" },
            { icon: Award, label: "Pro Features", desc: "Unlock everything.", color: "#F59E0B" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="p-4 flex items-center gap-3" hover onClick={() => navigate("/register")}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: CARBON }}>{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all"
              style={{ backgroundColor: category === cat ? FLAME : ALABASTER, color: category === cat ? "white" : CARBON }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {filtered.length === 0 ? (
            <div className="sm:col-span-2 text-center py-10">
              <p className="text-[14px] text-muted-foreground">No articles found. Try a different search.</p>
            </div>
          ) : filtered.map(article => (
            <Card key={article.id} className="p-4" hover onClick={() => navigate("/register")}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ALABASTER }}>
                  <FileText className="w-4 h-4" style={{ color: FLAME }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground">{article.category}</span>
                    {article.popular && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700">Popular</span>}
                  </div>
                  <p className="text-[13px] font-bold" style={{ color: CARBON }}>{article.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{article.excerpt}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <h2 className="text-[18px] font-black mb-4" style={{ color: CARBON }}>Frequently Asked Questions</h2>
        <div className="space-y-2 mb-10">
          {faqs.map(faq => (
            <Card key={faq.q} className="p-0 overflow-hidden" hover={false}>
              <button onClick={() => setFaqOpen(faqOpen === faq.q ? null : faq.q)} className="w-full flex items-center justify-between p-4 text-left">
                <span className="text-[13px] font-bold pr-4" style={{ color: CARBON }}>{faq.q}</span>
                <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform" style={{ transform: faqOpen === faq.q ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
              {faqOpen === faq.q && (
                <div className="px-4 pb-4">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Contact */}
        <Card className="p-6 text-center" hover={false} style={{ borderColor: "rgba(241,80,37,0.2)" }}>
          <Mail className="w-6 h-6 mx-auto mb-3" style={{ color: FLAME }} />
          <h3 className="text-[15px] font-black mb-1" style={{ color: CARBON }}>Still need help?</h3>
          <p className="text-[13px] text-muted-foreground mb-4">Our team typically responds within 4 hours.</p>
          <Btn onClick={() => { window.location.href = "mailto:hello@careergrowth.dev"; }}><MessageSquare className="w-4 h-4" /> Contact Support</Btn>
        </Card>
      </div>
    </div>
  );
}
