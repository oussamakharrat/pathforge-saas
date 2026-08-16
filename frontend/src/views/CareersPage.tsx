'use client';

import { useNavigate } from "@/lib/router";
import { Briefcase, MapPin, Clock, ArrowRight, Sparkles, Users, Globe, Star } from "lucide-react";
import { FLAME, CARBON } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { BrandLogo } from "../components/BrandLogo";
import { PublicShell } from "@/components/PublicShell";

const OPENINGS = [
  { title: "Senior Frontend Engineer", dept: "Engineering", location: "Remote / San Francisco", type: "Full-time", salary: "$180k–$250k", applicants: "12 applied" },
  { title: "Full-Stack Engineer", dept: "Engineering", location: "Remote", type: "Full-time", salary: "$160k–$220k", applicants: "28 applied" },
  { title: "AI/ML Engineer", dept: "AI", location: "San Francisco, CA", type: "Full-time", salary: "$200k–$280k", applicants: "9 applied" },
  { title: "Product Designer", dept: "Design", location: "Remote", type: "Full-time", salary: "$140k–$190k", applicants: "35 applied" },
  { title: "Developer Relations Engineer", dept: "Marketing", location: "Remote", type: "Full-time", salary: "$150k–$210k", applicants: "18 applied" },
];

const VALUES = [
  { icon: Users, title: "Engineers First", desc: "We build for engineers because we are engineers. Every product decision starts with developer experience." },
  { icon: Sparkles, title: "AI-Native", desc: "AI isn't a feature — it's the foundation. Our coaching, scoring, and recommendations are all AI-driven." },
  { icon: Globe, title: "Remote-First", desc: "Spread across 12 countries. Async communication, quarterly offsites, and trust-based culture." },
  { icon: Star, title: "Radical Transparency", desc: "Open salaries, public roadmaps, and shared decision-making. Everyone sees the full picture." },
];

export default function CareersPage() {
  const navigate = useNavigate();

  return (
    <PublicShell className="bg-white">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/blog")} className="text-[12px] font-bold hover:underline hidden sm:inline" style={{ color: CARBON }}>Blog</button>
            <button onClick={() => navigate("/login")} className="text-[12px] font-bold hover:underline" style={{ color: CARBON }}>Sign in</button>
            <Btn size="sm" onClick={() => navigate("/register")}>Get Started</Btn>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(241,80,37,0.1)" }}>
            <Briefcase className="w-8 h-8" style={{ color: FLAME }} />
          </div>
          <h1 className="text-4xl font-black mb-2" style={{ color: CARBON }}>Join the team</h1>
          <p className="text-[15px] text-muted-foreground max-w-xl mx-auto">Help us build the future of career growth for engineers worldwide. Remote-first, AI-native, mission-driven.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Team Members", value: "42", icon: Users },
            { label: "Countries", value: "12", icon: Globe },
            { label: "Open Roles", value: `${OPENINGS.length}`, icon: Briefcase },
            { label: "Glassdoor Rating", value: "4.8", icon: Star },
          ].map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-4 text-center" hover={false}>
                <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: FLAME }} />
                <p className="text-xl font-black" style={{ color: CARBON }}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Values */}
        <h2 className="text-lg font-black mb-4" style={{ color: CARBON }}>Our Values</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {VALUES.map(v => {
            const Icon = v.icon;
            return (
              <Card key={v.title} className="p-5" hover={false}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(241,80,37,0.1)" }}>
                    <Icon className="w-5 h-5" style={{ color: FLAME }} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black mb-1" style={{ color: CARBON }}>{v.title}</h3>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Open positions */}
        <h2 className="text-lg font-black mb-4" style={{ color: CARBON }}>Open Positions</h2>
        <div className="space-y-3 mb-12">
          {OPENINGS.map((role, i) => (
            <Card key={i} className="p-5" hover onClick={() => { window.location.href = "mailto:careers@careergrowth.dev"; }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-[14px] font-black" style={{ color: CARBON }}>{role.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Briefcase className="w-3 h-3" /> {role.dept}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="w-3 h-3" /> {role.location}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="w-3 h-3" /> {role.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[13px] font-black" style={{ color: FLAME }}>{role.salary}</p>
                    <p className="text-[10px] text-muted-foreground">{role.applicants}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="p-6 text-center" hover={false} style={{ borderColor: "rgba(241,80,37,0.2)" }}>
          <h3 className="text-[16px] font-black mb-1" style={{ color: CARBON }}>Don&apos;t see the right fit?</h3>
          <p className="text-[13px] text-muted-foreground mb-4">We&apos;re always looking for great people. Send us your resume and we&apos;ll keep you in mind.</p>
          <Btn onClick={() => { window.location.href = "mailto:careers@careergrowth.dev"; }}><Sparkles className="w-4 h-4" /> careers@careergrowth.dev</Btn>
        </Card>
      </div>
    </PublicShell>
  );
}
