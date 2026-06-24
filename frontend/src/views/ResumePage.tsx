'use client';

import { useState } from "react";
import { useNavigate } from "@/lib/router";
import { toast } from "sonner";
import { FileText, Upload, TrendingUp, Sparkles, Brain, CheckCircle2, AlertCircle } from "lucide-react";
import { FLAME, CARBON, ALABASTER, DUST } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Bar } from "../components/Bar";
import { Chip } from "../components/Chip";
import { PageHeader } from "../components/PageHeader";
import { useCareerData } from "../contexts/CareerDataContext";
import { useResume } from "../contexts/ResumeContext";

export default function ResumePage() {
  const navigate = useNavigate();
  const { purchasedServices } = useCareerData();
  const { resumes, loading, createResume } = useResume();
  const hasResumeReview = purchasedServices.includes("Resume Review");
  const hasFullRewrite = purchasedServices.includes("CV Full Rewrite");
  const [drag, setDrag] = useState(false);
  const active = resumes[0];
  const [activeVersion, setActiveVersion] = useState(active?.title ?? "Resume");
  const versions = resumes.map((r) => ({
    v: r.title,
    id: r.id,
    date: r.updatedAt.split("T")[0],
    score: r.atsScore,
    delta: r.atsScore > 0 ? `+${Math.max(0, r.atsScore - 62)}` : "—",
  }));
  const activeVersionScore = versions.find((v) => v.v === activeVersion)?.score ?? 0;

  return (
    <div>
      <PageHeader
        title="Resume"
        subtitle="AI analysis and optimization."
        action={<Btn variant="outline" size="sm" onClick={() => { void createResume(`Resume v${resumes.length + 1}`); }}>{loading ? "Loading..." : <><Upload className="w-3.5 h-3.5" /> New Resume</>}</Btn>}
      />
      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5" hover={false}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}><FileText className="w-6 h-6 text-red-500" /></div>
              <div className="flex-1"><p className="text-[14px] font-black" style={{ color: CARBON }}>jordan_lee_resume_{activeVersion === "v3 (Current)" ? "v3" : activeVersion === "v2" ? "v2" : "v1"}.pdf</p><p className="text-[12px] text-muted-foreground">{activeVersion === "v3 (Current)" ? "Jun 12, 2025" : activeVersion === "v2" ? "Apr 3, 2025" : "Jan 18, 2025"} · 842 KB</p></div>
              <Chip variant="green">{activeVersion === "v3 (Current)" ? "Analyzed" : "Archived"}</Chip>
            </div>
          </Card>

          <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); toast.success("Resume uploaded! Running AI analysis..."); }}
            className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center text-center cursor-pointer transition-all"
            style={{ borderColor: drag ? FLAME : DUST, backgroundColor: drag ? "rgba(241,80,37,0.03)" : "transparent" }}>
            <div className="w-10 h-10 rounded-2xl mb-3 flex items-center justify-center" style={{ backgroundColor: ALABASTER }}><Upload className="w-5 h-5" style={{ color: FLAME }} /></div>
            <p className="text-[13px] font-black mb-1" style={{ color: CARBON }}>Drag & drop to replace</p>
            <p className="text-[12px] text-muted-foreground">PDF, DOC, DOCX · Max 10MB</p>
          </div>

          <div>
            <h2 className="text-[14px] font-black mb-3" style={{ color: CARBON }}>Version History</h2>
            {versions.map((r, i) => (
              <Card key={i} className="px-4 py-3 mb-2 flex items-center gap-4">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1"><p className="text-[13px] font-bold" style={{ color: CARBON }}>{r.v}</p><p className="text-[11px] text-muted-foreground">{r.date}, 2025</p></div>
                <div className="text-right"><p className="text-[14px] font-black" style={{ color: r.score >= 75 ? "#10B981" : FLAME }}>{r.score}/100</p><p className="text-[10px] text-muted-foreground">{r.delta} vs prev</p></div>
                <button onClick={() => { setActiveVersion(r.v); toast.success(`Restored ${r.v} as active`); }} disabled={activeVersion === r.v} className="text-[11px] font-bold hover:underline disabled:opacity-40 disabled:no-underline" style={{ color: FLAME }}>{activeVersion === r.v ? "Active" : "Restore"}</button>
              </Card>
            ))}
          </div>

          {/* Cross-module impact */}
          <Card className="p-4" hover={false} style={{ borderColor: "rgba(241,80,37,0.15)" }}>
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4" style={{ color: FLAME }} /><span className="text-[13px] font-black" style={{ color: CARBON }}>Resume Impact</span></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[{ label: "Career Score", value: `+${activeVersionScore - 62}pts`, sub: `From score 62 → ${activeVersionScore}` }, { label: "Job Match", value: "94%", sub: "Vercel match boosted" }, { label: "ATS Pass Rate", value: "68%", sub: "Needs DevOps keywords" }].map(m => (
                <div key={m.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: ALABASTER }}>
                  <p className="text-[13px] font-black" style={{ color: FLAME }}>{m.value}</p>
                  <p className="text-[11px] font-bold" style={{ color: CARBON }}>{m.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5" hover={false}>
            <div className="flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4" style={{ color: FLAME }} /><span className="text-[13px] font-black">AI Resume Score</span></div>
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96"><circle cx="48" cy="48" r="38" fill="none" strokeWidth="7" style={{ stroke: ALABASTER }} /><circle cx="48" cy="48" r="38" fill="none" strokeWidth="7" strokeLinecap="round" style={{ stroke: FLAME }} strokeDasharray={`${activeVersionScore * 2.39} 239`} /></svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-black" style={{ color: CARBON }}>{activeVersionScore}</span><span className="text-[10px] text-muted-foreground">/100</span></div>
              </div>
            </div>
            {[{ l: "Impact", v: 85 }, { l: "Clarity", v: 80 }, { l: "Keywords", v: 72 }, { l: "ATS", v: 68 }].map(m => (
              <div key={m.l} className="flex items-center gap-2 mb-2"><span className="text-[11px] text-muted-foreground w-14">{m.l}</span><Bar pct={m.v} h={4} className="flex-1" /><span className="text-[11px] font-black w-6 text-right" style={{ color: CARBON }}>{m.v}</span></div>
            ))}
          </Card>
          <Card className="p-5" hover={false}>
            <h3 className="text-[13px] font-black mb-3" style={{ color: CARBON }}>AI Feedback</h3>
            <p className="text-[11px] font-black text-emerald-600 mb-1.5 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Strengths</p>
            {["Quantified achievements", "Clear project descriptions", "Modern tech stack"].map(s => <p key={s} className="text-[12px] text-muted-foreground mb-1 ml-5">· {s}</p>)}
            <p className="text-[11px] font-black text-amber-600 mt-3 mb-1.5 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />To Improve</p>
            {["Add DevOps keywords", "Expand system design", "Link GitHub activity"].map(s => <p key={s} className="text-[12px] text-muted-foreground mb-1 ml-5">· {s}</p>)}
            <Btn size="sm" className="w-full mt-3" onClick={() => { navigate("/app/coach"); toast.info("Opening AI Coach with resume context..."); }}><Brain className="w-3.5 h-3.5" /> Get AI Rewrite</Btn>
          </Card>
          {/* ⭐ Service purchase impact */}
          {(hasResumeReview || hasFullRewrite) && (
            <Card className="p-5" hover={false} style={{ borderColor: "rgba(16,185,129,0.25)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: FLAME }} />
                <span className="text-[13px] font-black" style={{ color: CARBON }}>Premium Services Active</span>
              </div>
              {hasResumeReview && (
                <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: "rgba(16,185,129,0.06)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold" style={{ color: CARBON }}>📄 Resume Review</span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Applied</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">ATS optimization +3% skill boost across all skills</p>
                </div>
              )}
              {hasFullRewrite && (
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(16,185,129,0.06)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold" style={{ color: CARBON }}>✍️ CV Full Rewrite</span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Applied</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Professional rewrite +6% skill boost, career score improved</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
